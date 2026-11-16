import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from .pressure_engine import pressure_engine
from ..data_processing.loader import data_loader

class BowlingAnalytics:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BowlingAnalytics, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if self.initialized:
            return
        self.df_bowling: Optional[pd.DataFrame] = None
        self.calculate_metrics()
        self.initialized = True

    def calculate_metrics(self, competition: Optional[str] = None, season: Optional[str] = None) -> pd.DataFrame:
        df = pressure_engine.df_reconstructed
        if df is None:
            df = pressure_engine.reconstruct_and_classify()
            
        if competition and competition != "All":
            df = df[df['comp_name'] == competition]
        if season and season != "All":
            df = df[df['season'].astype(str) == str(season)]
            
        df = df.copy()
        
        is_pressure = df['pressure_tier'] == 'High'
        
        # 1. Total Bowling
        bowl_total = df.groupby(['bowler_id', 'bowler_name']).agg(
            total_legal_balls=('is_legal', 'sum'),
            total_runs_conceded=('bowler_runs_conceded', 'sum'),
            total_bowler_wkts=('is_bowler_wicket', 'sum'),
            total_matches=('match_id', 'nunique'),
            total_dot_balls=('bowler_runs_conceded', lambda s: (s == 0).sum()),
            total_boundaries_conceded=('runs', lambda s: (s >= 4).sum())
        ).reset_index()
        
        # 2. Pressure Bowling
        bowl_press = df[is_pressure].groupby(['bowler_id', 'bowler_name']).agg(
            press_legal_balls=('is_legal', 'sum'),
            press_runs_conceded=('bowler_runs_conceded', 'sum'),
            press_bowler_wkts=('is_bowler_wicket', 'sum'),
            press_matches=('match_id', 'nunique'),
            press_dot_balls=('bowler_runs_conceded', lambda s: (s == 0).sum()),
            press_boundaries_conceded=('runs', lambda s: (s >= 4).sum())
        ).reset_index()
        
        bowl = bowl_total.merge(bowl_press, on=['bowler_id', 'bowler_name'], how='left').fillna(0)
        
        # 3. Normal Baseline (Total minus Pressure)
        bowl['norm_legal_balls'] = bowl['total_legal_balls'] - bowl['press_legal_balls']
        bowl['norm_runs_conceded'] = bowl['total_runs_conceded'] - bowl['press_runs_conceded']
        bowl['norm_bowler_wkts'] = bowl['total_bowler_wkts'] - bowl['press_bowler_wkts']
        bowl['norm_dot_balls'] = bowl['total_dot_balls'] - bowl['press_dot_balls']
        bowl['norm_boundaries_conceded'] = bowl['total_boundaries_conceded'] - bowl['press_boundaries_conceded']
        
        # Derived Metrics
        # Overs
        bowl['press_overs'] = (bowl['press_legal_balls'] // 6) + (bowl['press_legal_balls'] % 6) / 6.0
        bowl['press_overs_display'] = bowl['press_legal_balls'].apply(lambda b: f"{int(b // 6)}.{int(b % 6)}")
        
        # Economy rates
        bowl['econ_total'] = np.where(bowl['total_legal_balls'] > 0, bowl['total_runs_conceded'] / (bowl['total_legal_balls'] / 6.0), 0.0).round(2)
        bowl['econ_press'] = np.where(bowl['press_legal_balls'] > 0, bowl['press_runs_conceded'] / (bowl['press_legal_balls'] / 6.0), 0.0).round(2)
        bowl['econ_norm'] = np.where(bowl['norm_legal_balls'] > 0, bowl['norm_runs_conceded'] / (bowl['norm_legal_balls'] / 6.0), 0.0).round(2)
        
        # Economy differential: positive indicates lower (better) economy under pressure
        bowl['econ_diff'] = (bowl['econ_norm'] - bowl['econ_press']).round(2)
        
        # Strike Rate (balls per wicket)
        bowl['sr_total'] = np.where(bowl['total_bowler_wkts'] > 0, bowl['total_legal_balls'] / bowl['total_bowler_wkts'], 0.0).round(2)
        bowl['sr_press'] = np.where(bowl['press_bowler_wkts'] > 0, bowl['press_legal_balls'] / bowl['press_bowler_wkts'], 0.0).round(2)
        bowl['sr_norm'] = np.where(bowl['norm_bowler_wkts'] > 0, bowl['norm_legal_balls'] / bowl['norm_bowler_wkts'], 0.0).round(2)
        
        # Average (runs per wicket)
        bowl['avg_total'] = np.where(bowl['total_bowler_wkts'] > 0, bowl['total_runs_conceded'] / bowl['total_bowler_wkts'], 0.0).round(2)
        bowl['avg_press'] = np.where(bowl['press_bowler_wkts'] > 0, bowl['press_runs_conceded'] / bowl['press_bowler_wkts'], 0.0).round(2)
        bowl['avg_norm'] = np.where(bowl['norm_bowler_wkts'] > 0, bowl['norm_runs_conceded'] / bowl['norm_bowler_wkts'], 0.0).round(2)
        
        # Percentages
        bowl['dot_pct_press'] = np.where(bowl['press_legal_balls'] > 0, (bowl['press_dot_balls'] / bowl['press_legal_balls']) * 100.0, 0.0).round(2)
        bowl['boundary_pct_press'] = np.where(bowl['press_legal_balls'] > 0, (bowl['press_boundaries_conceded'] / bowl['press_legal_balls']) * 100.0, 0.0).round(2)
        
        # Wicket rate per over under pressure
        bowl['wkt_rate_press'] = np.where(bowl['press_overs'] > 0, bowl['press_bowler_wkts'] / bowl['press_overs'], 0.0).round(2)
        
        # Map primary team name
        team_map = data_loader.competition_team_player_mapping.groupby('player_id')['team_name'].last().to_dict()
        bowl['team_name'] = bowl['bowler_id'].map(team_map).fillna('Independent')
        
        # Consistency score
        match_wkts = df[is_pressure].groupby(['bowler_id', 'match_id'])['is_bowler_wicket'].sum().reset_index()
        consistency = match_wkts.groupby('bowler_id')['is_bowler_wicket'].agg(['std', 'mean']).reset_index()
        consistency['cv'] = np.where(consistency['mean'] > 0, (consistency['std'] / consistency['mean']), 1.0)
        consistency['consistency_score'] = np.clip(100.0 - (consistency['cv'] * 35.0), 25.0, 95.0).round(2)
        
        bowl = bowl.merge(consistency[['bowler_id', 'consistency_score']], on='bowler_id', how='left')
        bowl['consistency_score'] = bowl['consistency_score'].fillna(50.0)

        self.df_bowling = bowl
        return bowl

    def get_bowling_summary(self, min_balls: int = 60) -> Dict[str, Any]:
        df = self.df_bowling
        if df is None:
            df = self.calculate_metrics()
            
        eligible = df[df['press_legal_balls'] >= min_balls].copy()
        
        # Top wicket takers under pressure
        top_wkts = eligible.sort_values(by='press_bowler_wkts', ascending=False)[['bowler_name', 'press_bowler_wkts', 'press_legal_balls', 'econ_press', 'sr_press']].head(10).to_dict(orient='records')
        
        # Top economy under pressure
        top_econ = eligible.sort_values(by='econ_press', ascending=True)[['bowler_name', 'econ_press', 'econ_norm', 'econ_diff', 'press_legal_balls', 'press_bowler_wkts']].head(10).to_dict(orient='records')
        
        # Top dot ball bowlers
        top_dots = eligible.sort_values(by='dot_pct_press', ascending=False)[['bowler_name', 'dot_pct_press', 'press_legal_balls', 'econ_press']].head(10).to_dict(orient='records')
        
        # Scatter data: Economy vs Wickets
        scatter = eligible[['bowler_id', 'bowler_name', 'econ_press', 'press_bowler_wkts', 'press_legal_balls', 'econ_diff']].head(60).to_dict(orient='records')
        
        return {
            'eligible_bowlers_count': len(eligible),
            'top_wicket_takers': top_wkts,
            'top_economy_bowlers': top_econ,
            'top_dot_bowlers': top_dots,
            'scatter_data': scatter
        }

    def get_bowler_profile(self, player_id: int) -> Optional[Dict[str, Any]]:
        df = self.df_bowling
        if df is None:
            df = self.calculate_metrics()
            
        row = df[df['bowler_id'] == player_id]
        if len(row) == 0:
            return None
            
        p = row.iloc[0].to_dict()
        
        # Match-wise progression
        df_raw = pressure_engine.df_reconstructed
        m_prog = df_raw[df_raw['bowler_id'] == player_id].groupby('match_id').agg(
            legal_balls=('is_legal', 'sum'),
            runs_conceded=('bowler_runs_conceded', 'sum'),
            wkts=('is_bowler_wicket', 'sum'),
            press_balls=('pressure_tier', lambda s: (s == 'High').sum())
        ).reset_index().tail(15).to_dict(orient='records')
        
        p['match_history'] = m_prog
        return p

bowling_analytics = BowlingAnalytics()

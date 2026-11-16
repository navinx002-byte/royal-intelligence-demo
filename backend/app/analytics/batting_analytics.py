import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from .pressure_engine import pressure_engine
from ..data_processing.loader import data_loader

class BattingAnalytics:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BattingAnalytics, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if self.initialized:
            return
        self.df_batting: Optional[pd.DataFrame] = None
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
        
        # Valid batter ball faced (not a wide)
        df['batter_ball_faced'] = df['extras_type'] != 'wide'
        df['batter_is_dismissed'] = df['is_wicket'] & (df['dismissed_player_id'] == df['striker_id'])
        
        is_pressure = df['pressure_tier'] == 'High'
        
        # 1. Total Career in dataset
        bat_total = df[df['batter_ball_faced']].groupby(['striker_id', 'striker_name']).agg(
            total_runs=('runs', 'sum'),
            total_balls=('runs', 'count'),
            total_fours=('is_four', 'sum'),
            total_sixes=('is_six', 'sum'),
            total_dismissals=('batter_is_dismissed', 'sum'),
            total_matches=('match_id', 'nunique'),
            total_dot_balls=('runs', lambda s: (s == 0).sum())
        ).reset_index()
        
        # 2. Pressure Performance
        bat_press = df[df['batter_ball_faced'] & is_pressure].groupby(['striker_id', 'striker_name']).agg(
            press_runs=('runs', 'sum'),
            press_balls=('runs', 'count'),
            press_fours=('is_four', 'sum'),
            press_sixes=('is_six', 'sum'),
            press_dismissals=('batter_is_dismissed', 'sum'),
            press_matches=('match_id', 'nunique'),
            press_dot_balls=('runs', lambda s: (s == 0).sum())
        ).reset_index()
        
        bat = bat_total.merge(bat_press, on=['striker_id', 'striker_name'], how='left').fillna(0)
        
        # 3. Normal Baseline (Total minus Pressure)
        bat['norm_runs'] = bat['total_runs'] - bat['press_runs']
        bat['norm_balls'] = bat['total_balls'] - bat['press_balls']
        bat['norm_fours'] = bat['total_fours'] - bat['press_fours']
        bat['norm_sixes'] = bat['total_sixes'] - bat['press_sixes']
        bat['norm_dismissals'] = bat['total_dismissals'] - bat['press_dismissals']
        bat['norm_dot_balls'] = bat['total_dot_balls'] - bat['press_dot_balls']
        
        # Derived ratios
        bat['sr_total'] = np.where(bat['total_balls'] > 0, (bat['total_runs'] / bat['total_balls']) * 100.0, 0.0).round(2)
        bat['sr_press'] = np.where(bat['press_balls'] > 0, (bat['press_runs'] / bat['press_balls']) * 100.0, 0.0).round(2)
        bat['sr_norm'] = np.where(bat['norm_balls'] > 0, (bat['norm_runs'] / bat['norm_balls']) * 100.0, 0.0).round(2)
        bat['sr_diff'] = (bat['sr_press'] - bat['sr_norm']).round(2)
        
        bat['avg_total'] = np.where(bat['total_dismissals'] > 0, (bat['total_runs'] / bat['total_dismissals']), bat['total_runs']).round(2)
        bat['avg_press'] = np.where(bat['press_dismissals'] > 0, (bat['press_runs'] / bat['press_dismissals']), bat['press_runs']).round(2)
        bat['avg_norm'] = np.where(bat['norm_dismissals'] > 0, (bat['norm_runs'] / bat['norm_dismissals']), bat['norm_runs']).round(2)
        bat['avg_diff'] = (bat['avg_press'] - bat['avg_norm']).round(2)
        
        bat['boundary_pct_press'] = np.where(
            bat['press_balls'] > 0,
            ((bat['press_fours'] * 4 + bat['press_sixes'] * 6) / bat['press_runs'].clip(lower=1)) * 100.0,
            0.0
        ).round(2)
        
        bat['dot_pct_press'] = np.where(
            bat['press_balls'] > 0,
            (bat['press_dot_balls'] / bat['press_balls']) * 100.0,
            0.0
        ).round(2)

        # Map primary team name from mapping
        team_map = data_loader.competition_team_player_mapping.groupby('player_id')['team_name'].last().to_dict()
        bat['team_name'] = bat['striker_id'].map(team_map).fillna('Independent')
        
        # Match-wise consistency calculation for batters with >= 3 pressure matches
        match_scores = df[df['batter_ball_faced'] & is_pressure].groupby(['striker_id', 'match_id'])['runs'].sum().reset_index()
        consistency = match_scores.groupby('striker_id')['runs'].agg(['std', 'mean']).reset_index()
        consistency['cv'] = np.where(consistency['mean'] > 0, (consistency['std'] / consistency['mean']), 1.0)
        consistency['consistency_score'] = np.clip(100.0 - (consistency['cv'] * 40.0), 20.0, 95.0).round(2)
        
        bat = bat.merge(consistency[['striker_id', 'consistency_score']], on='striker_id', how='left')
        bat['consistency_score'] = bat['consistency_score'].fillna(50.0)

        self.df_batting = bat
        return bat

    def get_batting_summary(self, min_balls: int = 50) -> Dict[str, Any]:
        df = self.df_batting
        if df is None:
            df = self.calculate_metrics()
            
        eligible = df[df['press_balls'] >= min_balls].copy()
        
        # Top boundary hitters
        top_boundary = eligible.sort_values(by='boundary_pct_press', ascending=False)[['striker_name', 'boundary_pct_press', 'press_runs', 'press_fours', 'press_sixes']].head(10).to_dict(orient='records')
        
        # Top SR improvement
        top_sr_diff = eligible.sort_values(by='sr_diff', ascending=False)[['striker_name', 'sr_diff', 'sr_press', 'sr_norm', 'press_balls']].head(10).to_dict(orient='records')
        
        # Top pressure run scorers
        top_runs = eligible.sort_values(by='press_runs', ascending=False)[['striker_name', 'press_runs', 'press_balls', 'sr_press', 'avg_press', 'total_matches']].head(10).to_dict(orient='records')
        
        # Strike rate vs Average scatter data
        scatter = eligible[['striker_id', 'striker_name', 'sr_press', 'avg_press', 'press_runs', 'press_balls', 'sr_diff']].head(60).to_dict(orient='records')
        
        return {
            'eligible_batters_count': len(eligible),
            'top_boundary_hitters': top_boundary,
            'top_sr_improvements': top_sr_diff,
            'top_run_scorers': top_runs,
            'scatter_data': scatter
        }

    def get_batter_profile(self, player_id: int) -> Optional[Dict[str, Any]]:
        df = self.df_batting
        if df is None:
            df = self.calculate_metrics()
            
        row = df[df['striker_id'] == player_id]
        if len(row) == 0:
            return None
            
        p = row.iloc[0].to_dict()
        
        # Match-wise progression for this batter
        df_raw = pressure_engine.df_reconstructed
        m_prog = df_raw[(df_raw['striker_id'] == player_id) & (df_raw['extras_type'] != 'wide')].groupby('match_id').agg(
            runs=('runs', 'sum'),
            balls=('runs', 'count'),
            fours=('is_four', 'sum'),
            sixes=('is_six', 'sum'),
            press_balls=('pressure_tier', lambda s: (s == 'High').sum())
        ).reset_index().tail(15).to_dict(orient='records')
        
        p['match_history'] = m_prog
        return p

batting_analytics = BattingAnalytics()

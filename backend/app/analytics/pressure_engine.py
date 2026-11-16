import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from ..data_processing.loader import data_loader
from ..schemas.models import PressureThresholdConfig

class PressureEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PressureEngine, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if self.initialized:
            return
            
        self.config = PressureThresholdConfig()
        self.df_reconstructed: Optional[pd.DataFrame] = None
        self.reconstruct_and_classify()
        self.initialized = True

    def reconstruct_and_classify(self, custom_config: Optional[PressureThresholdConfig] = None):
        if custom_config:
            self.config = custom_config
            
        bbb = data_loader.ball_by_ball.copy()
        matches = data_loader.matches.copy()
        
        # Chronological sort
        bbb = bbb.sort_values(by=['match_id', 'innings', 'overid', 'over_ball_num']).reset_index(drop=True)
        
        # Delivery rules
        bbb['is_legal'] = ~bbb['extras_type'].isin(['wide', 'Overstep'])
        bbb['extra_run_penalty'] = bbb['extras_type'].apply(lambda x: 1 if x in ['wide', 'Overstep', 'byes', 'legbyes'] else 0)
        bbb['total_ball_runs'] = bbb['runs'] + bbb['extra_run_penalty'] + bbb['extras_2_runs']
        
        # Bowler runs conceded (excluding legbyes and byes)
        bbb['bowler_runs_conceded'] = np.where(
            bbb['extras_type'].isin(['byes', 'legbyes']),
            0,
            bbb['runs'] + np.where(bbb['extras_type'].isin(['wide', 'Overstep']), 1 + bbb['extras_2_runs'], 0)
        )
        # Bowler wicket (excluding RunOut, Retire Out, Obstructing)
        bbb['is_bowler_wicket'] = bbb['is_wicket'] & bbb['dismissal_type'].isin(['Bowled', 'Caught', 'LBW', 'Stump', 'Hit Wicket'])
        
        # 1st Innings total and targets
        inn1_totals = bbb[bbb['innings'] == 1].groupby('match_id')['total_ball_runs'].sum().reset_index()
        inn1_totals.columns = ['match_id', 'inn1_total']
        
        matches = matches.merge(inn1_totals, on='match_id', how='left')
        matches['target'] = np.where(matches['revised_target'].notna(), matches['revised_target'], matches['inn1_total'] + 1)
        
        # Merge targets and match metadata
        meta_cols = ['match_id', 'target', 'knock_out', 'match_format', 'season', 'comp_name', 'first_inn_revised_overs', 'second_inn_revised_overs']
        bbb = bbb.merge(matches[meta_cols], on='match_id', how='left')
        
        # Previous ball shifts for match state before each delivery
        bbb['prev_ball_runs'] = bbb.groupby(['match_id', 'innings'])['total_ball_runs'].shift(1).fillna(0)
        bbb['prev_ball_wkts'] = bbb.groupby(['match_id', 'innings'])['is_wicket'].shift(1).fillna(False).astype(int)
        bbb['prev_legal_ball'] = bbb.groupby(['match_id', 'innings'])['is_legal'].shift(1).fillna(False).astype(int)
        
        bbb['cum_runs_before'] = bbb.groupby(['match_id', 'innings'])['prev_ball_runs'].cumsum()
        bbb['cum_wkts_before'] = bbb.groupby(['match_id', 'innings'])['prev_ball_wkts'].cumsum()
        bbb['legal_balls_before'] = bbb.groupby(['match_id', 'innings'])['prev_legal_ball'].cumsum()
        
        # Scheduled overs per innings
        bbb['scheduled_overs'] = np.where(
            bbb['innings'] == 1,
            bbb['first_inn_revised_overs'].fillna(20.0),
            bbb['second_inn_revised_overs'].fillna(20.0)
        )
        bbb['total_scheduled_balls'] = bbb['scheduled_overs'] * 6
        bbb['balls_remaining'] = np.maximum(0, bbb['total_scheduled_balls'] - bbb['legal_balls_before'])
        bbb['overs_remaining'] = bbb['balls_remaining'] / 6.0
        bbb['wickets_in_hand'] = np.maximum(0, 10 - bbb['cum_wkts_before'])
        
        # Innings 2 chase variables
        bbb['runs_required'] = np.where(bbb['innings'] == 2, np.maximum(0, bbb['target'] - bbb['cum_runs_before']), np.nan)
        bbb['rrr'] = np.where(
            (bbb['innings'] == 2) & (bbb['overs_remaining'] > 0),
            bbb['runs_required'] / bbb['overs_remaining'],
            np.where(bbb['innings'] == 2, 36.0, np.nan)
        )
        
        # Calculate Pressure Index using config
        rrr_factor = self.config.chase_rrr_weight
        wkt_factor = self.config.wkt_stress_multiplier
        death_start = self.config.death_overs_start
        crisis_over = self.config.crisis_over_limit
        
        # Chase pressure
        rrr_pts = np.clip((bbb['rrr'] - 5.0) * rrr_factor, 0, 45)
        wkt_pts_chase = (10 - bbb['wickets_in_hand']) * wkt_factor
        death_pts_chase = np.where(bbb['overid'] >= death_start, (bbb['overid'] - (death_start - 1)) * 4.0, 0.0)
        close_pts_chase = np.where((bbb['overid'] >= 18) & (bbb['runs_required'] <= 24) & (bbb['runs_required'] > 0), 10.0, 0.0)
        chase_pressure = np.clip(rrr_pts + wkt_pts_chase + death_pts_chase + close_pts_chase + (bbb['knock_out'] * 5), 0, 100)
        
        # 1st Innings pressure
        crisis_pts_inn1 = np.where(
            (bbb['overid'] <= crisis_over) & (bbb['cum_wkts_before'] >= 2),
            20.0 + bbb['cum_wkts_before'] * 15.0,
            np.where(
                (bbb['overid'] <= 12) & (bbb['cum_wkts_before'] >= 4),
                15.0 + bbb['cum_wkts_before'] * 10.0,
                0.0
            )
        )
        death_pts_inn1 = np.where(bbb['overid'] >= death_start, 50.0 + (bbb['overid'] - (death_start - 1)) * 8.0, 15.0)
        wkt_stress_death1 = np.where((bbb['overid'] >= death_start) & (bbb['wickets_in_hand'] <= 5), 15.0, 0.0)
        inn1_pressure = np.clip(np.maximum(crisis_pts_inn1, death_pts_inn1) + wkt_stress_death1 + (bbb['knock_out'] * 5), 10, 100)
        
        bbb['pressure_index'] = np.where(bbb['innings'] == 2, chase_pressure, inn1_pressure)
        
        # Categorize
        med_cutoff = self.config.medium_pressure_cutoff
        high_cutoff = self.config.high_pressure_cutoff
        
        bbb['pressure_tier'] = pd.cut(
            bbb['pressure_index'],
            bins=[-1, med_cutoff, high_cutoff, 101],
            labels=['Low', 'Medium', 'High']
        )
        
        self.df_reconstructed = bbb
        return bbb

    def get_pressure_analytics(self, competition: Optional[str] = None, season: Optional[str] = None) -> Dict[str, Any]:
        df = self.df_reconstructed
        if df is None:
            df = self.reconstruct_and_classify()
            
        if competition and competition != "All":
            df = df[df['comp_name'] == competition]
        if season and season != "All":
            df = df[df['season'].astype(str) == str(season)]
            
        total_balls = len(df)
        tier_counts = df['pressure_tier'].value_counts().to_dict()
        tier_pcts = {k: round((v / total_balls) * 100, 2) for k, v in tier_counts.items()}
        
        # Innings breakdown
        inn_breakdown = []
        for inn in [1, 2]:
            sub = df[df['innings'] == inn]
            c = sub['pressure_tier'].value_counts().to_dict()
            inn_breakdown.append({
                'innings': f"Innings {inn} ({'Setting' if inn == 1 else 'Chasing'})",
                'low': int(c.get('Low', 0)),
                'medium': int(c.get('Medium', 0)),
                'high': int(c.get('High', 0)),
                'total': int(len(sub))
            })
            
        # Over phase distribution (Powerplay: 1-6, Middle: 7-15, Death: 16-20)
        df['phase'] = pd.cut(df['overid'], bins=[0, 6, 15, 21], labels=['Powerplay (1-6)', 'Middle (7-15)', 'Death (16-20)'])
        phase_counts = pd.crosstab(df['phase'], df['pressure_tier']).to_dict(orient='index')
        phase_list = [{'phase': k, 'Low': int(v.get('Low', 0)), 'Medium': int(v.get('Medium', 0)), 'High': int(v.get('High', 0))} for k, v in phase_counts.items()]
        
        # Sample high-pressure chase situations for scatter plot (sample 500 rows for fast response)
        chase_sample = df[(df['innings'] == 2) & (df['rrr'].notna()) & (df['rrr'] < 30)].sample(min(500, len(df)), random_state=42)
        scatter_data = chase_sample[['rrr', 'wickets_in_hand', 'pressure_index', 'pressure_tier', 'overid']].to_dict(orient='records')
        
        return {
            'total_deliveries': total_balls,
            'tier_counts': tier_counts,
            'tier_percentages': tier_pcts,
            'innings_breakdown': inn_breakdown,
            'phase_distribution': phase_list,
            'scatter_sample': scatter_data,
            'config': self.config.model_dump()
        }

pressure_engine = PressureEngine()

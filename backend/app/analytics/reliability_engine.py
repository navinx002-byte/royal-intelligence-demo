import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from .batting_analytics import batting_analytics
from .bowling_analytics import bowling_analytics
from ..schemas.models import WeightConfig, BatterRankingItem, BowlerRankingItem

class ReliabilityEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ReliabilityEngine, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if self.initialized:
            return
        self.config = WeightConfig()
        self.ranked_batters: List[Dict[str, Any]] = []
        self.ranked_bowlers: List[Dict[str, Any]] = []
        self.calculate_all_rankings()
        self.initialized = True

    def _min_max_scale(self, series: pd.Series) -> pd.Series:
        s_min, s_max = series.min(), series.max()
        if s_max == s_min:
            return series * 0
        return (series - s_min) / (s_max - s_min)

    def calculate_all_rankings(self, custom_weights: Optional[WeightConfig] = None):
        if custom_weights:
            self.config = custom_weights
            
        self.calculate_batting_rankings()
        self.calculate_bowling_rankings()

    def calculate_batting_rankings(self) -> List[Dict[str, Any]]:
        df = batting_analytics.df_batting
        if df is None:
            df = batting_analytics.calculate_metrics()
            
        min_balls = self.config.min_bat_pressure_balls
        eligible = df[df['press_balls'] >= min_balls].copy()
        
        if len(eligible) == 0:
            self.ranked_batters = []
            return []
            
        # Bayesian shrinkage factor (halves weight if pressure balls faced is only 50)
        eligible['shrinkage'] = eligible['press_balls'] / (eligible['press_balls'] + 50.0)
        
        # Component scaling
        eligible['comp_sr_diff'] = self._min_max_scale(eligible['sr_diff'].clip(-30, 60)) * 100.0
        eligible['comp_sr_press'] = self._min_max_scale(eligible['sr_press'].clip(100, 220)) * 100.0
        eligible['comp_avg_press'] = self._min_max_scale(eligible['avg_press'].clip(10, 60)) * 100.0
        eligible['comp_volume'] = self._min_max_scale(eligible['press_runs']) * 100.0
        eligible['comp_boundary'] = self._min_max_scale(eligible['boundary_pct_press']) * 100.0
        
        # Weighted raw score
        w = self.config
        eligible['raw_score'] = (
            w.bat_sr_diff * eligible['comp_sr_diff'] +
            w.bat_sr_press * eligible['comp_sr_press'] +
            w.bat_avg_press * eligible['comp_avg_press'] +
            w.bat_volume * eligible['comp_volume'] +
            w.bat_boundary * eligible['comp_boundary']
        )
        
        # Final reliability score with shrinkage
        eligible['reliability_score'] = (eligible['raw_score'] * eligible['shrinkage']).round(2)
        eligible = eligible.sort_values(by='reliability_score', ascending=False).reset_index(drop=True)
        
        results = []
        for rank, (_, row) in enumerate(eligible.iterrows(), 1):
            balls = int(row['press_balls'])
            if balls >= 300:
                conf = "High Confidence"
            elif balls >= 180:
                conf = "Medium Confidence"
            else:
                conf = "Developing Evidence"
                
            sr_diff_str = f"+{row['sr_diff']}" if row['sr_diff'] >= 0 else f"{row['sr_diff']}"
            reason = (
                f"Elevates strike rate to {row['sr_press']} under intense pressure ({sr_diff_str} vs normal baseline) "
                f"with {int(row['press_runs'])} runs across {int(row['press_matches'])} pressure matches."
            )
            
            results.append({
                'rank': rank,
                'player_id': int(row['striker_id']),
                'player_name': str(row['striker_name']),
                'team_name': str(row.get('team_name', 'Independent')),
                'reliability_score': float(row['reliability_score']),
                'pressure_strike_rate': float(row['sr_press']),
                'normal_strike_rate': float(row['sr_norm']),
                'strike_rate_improvement': float(row['sr_diff']),
                'pressure_average': float(row['avg_press']),
                'pressure_runs': int(row['press_runs']),
                'pressure_balls': balls,
                'pressure_innings': int(row['press_matches']),
                'matches_analysed': int(row['total_matches']),
                'boundary_pct_press': float(row['boundary_pct_press']),
                'dot_pct_press': float(row['dot_pct_press']),
                'confidence_level': conf,
                'reason': reason
            })
            
        self.ranked_batters = results
        return results

    def calculate_bowling_rankings(self) -> List[Dict[str, Any]]:
        df = bowling_analytics.df_bowling
        if df is None:
            df = bowling_analytics.calculate_metrics()
            
        min_balls = self.config.min_bowl_pressure_balls
        eligible = df[df['press_legal_balls'] >= min_balls].copy()
        
        if len(eligible) == 0:
            self.ranked_bowlers = []
            return []
            
        eligible['shrinkage'] = eligible['press_legal_balls'] / (eligible['press_legal_balls'] + 60.0)
        
        eligible['comp_econ_diff'] = self._min_max_scale(eligible['econ_diff'].clip(-3.0, 3.0)) * 100.0
        eligible['comp_econ_press'] = self._min_max_scale((-eligible['econ_press']).clip(-14.0, -6.0)) * 100.0
        eligible['comp_wkts'] = self._min_max_scale(eligible['press_bowler_wkts']) * 100.0
        eligible['comp_wkt_rate'] = self._min_max_scale(eligible['wkt_rate_press']) * 100.0
        eligible['comp_dot'] = self._min_max_scale(eligible['dot_pct_press']) * 100.0
        
        w = self.config
        eligible['raw_score'] = (
            w.bowl_econ_diff * eligible['comp_econ_diff'] +
            w.bowl_econ_press * eligible['comp_econ_press'] +
            w.bowl_wkts * eligible['comp_wkts'] +
            w.bowl_dot * eligible['comp_dot'] +
            w.bowl_wkt_rate * eligible['comp_wkt_rate']
        )
        
        eligible['reliability_score'] = (eligible['raw_score'] * eligible['shrinkage']).round(2)
        eligible = eligible.sort_values(by='reliability_score', ascending=False).reset_index(drop=True)
        
        results = []
        for rank, (_, row) in enumerate(eligible.iterrows(), 1):
            balls = int(row['press_legal_balls'])
            if balls >= 300:
                conf = "High Confidence"
            elif balls >= 180:
                conf = "Medium Confidence"
            else:
                conf = "Developing Evidence"
                
            econ_diff_str = f"-{abs(row['econ_diff'])} rpo" if row['econ_diff'] >= 0 else f"+{abs(row['econ_diff'])} rpo"
            reason = (
                f"Delivers exceptional economy of {row['econ_press']} in high-stress phases ({econ_diff_str} better control), "
                f"capturing {int(row['press_bowler_wkts'])} critical wickets with {row['dot_pct_press']}% dot deliveries."
            )
            
            results.append({
                'rank': rank,
                'player_id': int(row['bowler_id']),
                'player_name': str(row['bowler_name']),
                'team_name': str(row.get('team_name', 'Independent')),
                'reliability_score': float(row['reliability_score']),
                'pressure_economy': float(row['econ_press']),
                'normal_economy': float(row['econ_norm']),
                'economy_improvement': float(row['econ_diff']),
                'pressure_wickets': int(row['press_bowler_wkts']),
                'pressure_overs': float(row['press_overs']),
                'pressure_overs_display': str(row['press_overs_display']),
                'pressure_dot_pct': float(row['dot_pct_press']),
                'matches_analysed': int(row['total_matches']),
                'confidence_level': conf,
                'reason': reason
            })
            
        self.ranked_bowlers = results
        return results

    def get_top_batters(self, limit: int = 10) -> List[Dict[str, Any]]:
        if not self.ranked_batters:
            self.calculate_batting_rankings()
        return self.ranked_batters[:limit]

    def get_top_bowlers(self, limit: int = 10) -> List[Dict[str, Any]]:
        if not self.ranked_bowlers:
            self.calculate_bowling_rankings()
        return self.ranked_bowlers[:limit]

reliability_engine = ReliabilityEngine()

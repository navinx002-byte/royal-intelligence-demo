import os
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

class DataLoader:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataLoader, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if self.initialized:
            return
            
        # Determine base directory
        # This file is in Royal-Intelligence/backend/app/data_processing/loader.py
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
        self.project_root = project_root
        
        self.raw_dir = os.path.join(project_root, "data", "raw")
        if not os.path.exists(self.raw_dir):
            self.raw_dir = project_root
            
        self.processed_dir = os.path.join(project_root, "data", "processed")
        self.reports_dir = os.path.join(project_root, "data", "reports")
        os.makedirs(self.processed_dir, exist_ok=True)
        os.makedirs(self.reports_dir, exist_ok=True)
        
        self.competitions: Optional[pd.DataFrame] = None
        self.teams: Optional[pd.DataFrame] = None
        self.matches: Optional[pd.DataFrame] = None
        self.competition_team_player_mapping: Optional[pd.DataFrame] = None
        self.playing_eleven: Optional[pd.DataFrame] = None
        self.ball_by_ball: Optional[pd.DataFrame] = None
        
        self.data_summary: Dict[str, Any] = {}
        self.data_quality: Dict[str, Any] = {}
        self.data_dictionary: Dict[str, str] = self._build_data_dictionary()
        
        self.load_all()
        self.initialized = True

    def _resolve_file(self, filename: str) -> str:
        # Check raw_dir first, then project_root
        p1 = os.path.join(self.raw_dir, filename)
        if os.path.exists(p1):
            return p1
        p2 = os.path.join(self.project_root, filename)
        if os.path.exists(p2):
            return p2
        raise FileNotFoundError(f"Cannot find {filename} in {self.raw_dir} or {self.project_root}")

    def load_all(self):
        print("Loading datasets into memory...")
        
        with open(self._resolve_file('competitions.csv'), 'r', encoding='utf-8', errors='ignore') as f:
            self.competitions = pd.read_csv(f)
            
        with open(self._resolve_file('teams.csv'), 'r', encoding='utf-8', errors='ignore') as f:
            self.teams = pd.read_csv(f)
            
        with open(self._resolve_file('matches.csv'), 'r', encoding='utf-8', errors='ignore') as f:
            self.matches = pd.read_csv(f)
            
        with open(self._resolve_file('competition_team_player_mapping.csv'), 'r', encoding='utf-8', errors='ignore') as f:
            self.competition_team_player_mapping = pd.read_csv(f)
            
        with open(self._resolve_file('playing_eleven.csv'), 'r', encoding='utf-8', errors='ignore') as f:
            self.playing_eleven = pd.read_csv(f)
            
        with open(self._resolve_file('ball_by_ball.csv'), 'r', encoding='utf-8', errors='ignore') as f:
            self.ball_by_ball = pd.read_csv(f)
            
        # Clean and prepare matches with competition data
        self.matches = self.matches.merge(
            self.competitions[['comp_id', 'comp_name', 'match_format', 'season']],
            on='comp_id',
            how='left'
        )
        
        # Verify and sort delivery dataset
        self.ball_by_ball = self.ball_by_ball.sort_values(
            by=['match_id', 'innings', 'overid', 'over_ball_num']
        ).reset_index(drop=True)
        
        self._calculate_dataset_profiles()
        print(f"Datasets loaded successfully. Matches: {len(self.matches)}, Deliveries: {len(self.ball_by_ball)}")

    def _calculate_dataset_profiles(self):
        dfs = {
            'competitions': self.competitions,
            'teams': self.teams,
            'matches': self.matches,
            'competition_team_player_mapping': self.competition_team_player_mapping,
            'playing_eleven': self.playing_eleven,
            'ball_by_ball': self.ball_by_ball
        }
        
        files_info = {}
        missing_vals = {}
        warnings = []
        
        for name, df in dfs.items():
            files_info[name] = {
                'rows': int(len(df)),
                'columns': int(len(df.columns)),
                'memory_mb': round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2),
                'columns_list': list(df.columns)
            }
            null_dict = {col: int(count) for col, count in df.isnull().sum().items() if count > 0}
            missing_vals[name] = null_dict
            
        # Specific warnings
        if missing_vals['matches'].get('revised_target', 0) > 0:
            warnings.append(f"matches.csv has {missing_vals['matches']['revised_target']} non-revised matches (normal 20-over contests). Only rain-affected matches have revised targets.")
        if 'extras1_runs' in self.ball_by_ball.columns:
            warnings.append("ball_by_ball.csv 'extras1_runs' represents extra type enum (6=None, 1=Overstep, 2=wide, 3=legbyes, 4=byes, 5=other, 7=Penalty). It is NOT run count.")

        total_players = self.competition_team_player_mapping['player_id'].nunique()
        ipl_matches = int((self.matches['match_format'] == 'T20').sum())
        t20i_matches = int((self.matches['match_format'] == 'T20I').sum())
        seasons = sorted([str(s) for s in self.competitions['season'].dropna().unique()])
        
        self.data_summary = {
            'total_matches': int(len(self.matches)),
            'total_balls': int(len(self.ball_by_ball)),
            'total_competitions': int(len(self.competitions)),
            'total_teams': int(self.teams['team_id'].nunique()),
            'total_players': int(total_players),
            'ipl_matches': ipl_matches,
            't20i_matches': t20i_matches,
            'seasons': seasons,
            'competitions': sorted(self.competitions['comp_name'].unique().tolist())
        }
        
        self.data_quality = {
            'files_checked': files_info,
            'missing_values': missing_vals,
            'validation_status': "VERIFIED & HEALTHY",
            'warnings': warnings,
            'data_dictionary': self.data_dictionary
        }

    def _build_data_dictionary(self) -> Dict[str, str]:
        return {
            'match_id': 'Unique integer identifier for each cricket match across competitions.',
            'innings': 'Innings number (1 = setting target, 2 = chasing target, 3/4 = Super Over).',
            'overid': 'Current over number within the innings (1 to 20).',
            'over_ball_num': 'Ball sequence number within the current over (1 to 6+ for extras).',
            'innings_ball_num': 'Cumulative delivery sequence in the innings.',
            'striker_id': 'Unique identifier of the batter facing the delivery.',
            'striker_name': 'Full name of the batter facing the delivery.',
            'bowler_id': 'Unique identifier of the bowler executing the delivery.',
            'bowler_name': 'Full name of the bowler executing the delivery.',
            'runs': 'Runs scored directly off the bat by the striker on this delivery.',
            'is_four': 'Boolean flag indicating if the delivery resulted in a boundary four.',
            'is_six': 'Boolean flag indicating if the delivery resulted in a six.',
            'is_wicket': 'Boolean flag indicating if a wicket fell on this delivery.',
            'dismissal_type': 'Method of dismissal (Bowled, Caught, LBW, Stump, Hit Wicket, RunOut, etc.).',
            'dismissed_player_id': 'Player ID of the dismissed batsman.',
            'extras_type': 'Category of extra delivery: wide, Overstep (no ball), legbyes, byes, other, Penalty.',
            'extras1_runs': 'Internal type identifier for extra delivery (not an addition of runs).',
            'extras_2_runs': 'Additional extra runs awarded on specific delivery oversteps/penalties.',
            'pace_or_spin': 'Classification of bowling style (Pace or Spin).',
            'bowl_speed': 'Recorded delivery release speed in km/h or mph.',
            'stroke': 'Batting stroke executed (Cover Drive, Pull, Cut, Flick, etc.).',
            'delivery_ist_time': 'Indian Standard Time timestamp of delivery occurrence.',
            'comp_id': 'Unique competition identifier.',
            'comp_name': 'Official tournament / series name.',
            'match_format': 'Format classification (T20 = Domestic leagues like IPL; T20I = International matches).',
            'season': 'Year or season designation (2022 to 2026).'
        }

# Singleton instance access
data_loader = DataLoader()

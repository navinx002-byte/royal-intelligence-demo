from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class DatasetSummaryResponse(BaseModel):
    total_matches: int
    total_balls: int
    total_competitions: int
    total_teams: int
    total_players: int
    ipl_matches: int
    t20i_matches: int
    seasons: List[str]
    competitions: List[str]
    pressure_balls_count: int
    pressure_percentage: float

class DataQualityResponse(BaseModel):
    files_checked: Dict[str, Dict[str, Any]]
    missing_values: Dict[str, Dict[str, int]]
    validation_status: str
    warnings: List[str]
    data_dictionary: Dict[str, str]

class PlayerCard(BaseModel):
    player_id: int
    player_name: str
    team_name: Optional[str] = None
    role: str
    matches: int
    runs: int
    wickets: int
    strike_rate: float
    economy: float
    pressure_score: float
    reliability_score: float
    confidence_level: str

class BatterRankingItem(BaseModel):
    rank: int
    player_id: int
    player_name: str
    reliability_score: float
    pressure_strike_rate: float
    normal_strike_rate: float
    strike_rate_improvement: float
    pressure_average: float
    pressure_runs: int
    pressure_balls: int
    pressure_innings: int
    matches_analysed: int
    confidence_level: str
    reason: str

class BowlerRankingItem(BaseModel):
    rank: int
    player_id: int
    player_name: str
    reliability_score: float
    pressure_economy: float
    normal_economy: float
    economy_improvement: float
    pressure_wickets: int
    pressure_overs: float
    pressure_dot_pct: float
    matches_analysed: int
    confidence_level: str
    reason: str

class WeightConfig(BaseModel):
    # Batting weights
    bat_sr_diff: float = 0.30
    bat_sr_press: float = 0.25
    bat_avg_press: float = 0.20
    bat_volume: float = 0.15
    bat_boundary: float = 0.10
    
    # Bowling weights
    bowl_econ_diff: float = 0.25
    bowl_econ_press: float = 0.25
    bowl_wkts: float = 0.25
    bowl_dot: float = 0.15
    bowl_wkt_rate: float = 0.10
    
    # Eligibility thresholds
    min_bat_pressure_balls: int = 100
    min_bowl_pressure_balls: int = 120

class PressureThresholdConfig(BaseModel):
    chase_rrr_weight: float = 5.0
    wkt_stress_multiplier: float = 3.0
    death_overs_start: int = 16
    crisis_over_limit: int = 6
    high_pressure_cutoff: float = 65.0
    medium_pressure_cutoff: float = 40.0

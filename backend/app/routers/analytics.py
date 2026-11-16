from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from ..analytics.pressure_engine import pressure_engine
from ..analytics.batting_analytics import batting_analytics
from ..analytics.bowling_analytics import bowling_analytics
from ..analytics.reliability_engine import reliability_engine
from ..schemas.models import WeightConfig, PressureThresholdConfig

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

def _clean_param(val):
    if val is None or hasattr(val, 'default'):
        return None
    s = str(val).strip()
    return None if s in ["", "None", "All"] else s

@router.get("/pressure")
def get_pressure_analytics(
    competition: Optional[str] = None,
    season: Optional[str] = None
):
    comp = _clean_param(competition)
    sea = _clean_param(season)
    return pressure_engine.get_pressure_analytics(competition=comp, season=sea)

@router.get("/batting")
def get_batting_analytics(
    competition: Optional[str] = None,
    season: Optional[str] = None,
    min_balls: int = 50
):
    comp = _clean_param(competition)
    sea = _clean_param(season)
    m_balls = min_balls if isinstance(min_balls, int) else 50
    if comp or sea:
        batting_analytics.calculate_metrics(competition=comp, season=sea)
    return batting_analytics.get_batting_summary(min_balls=m_balls)

@router.get("/bowling")
def get_bowling_analytics(
    competition: Optional[str] = None,
    season: Optional[str] = None,
    min_balls: int = 60
):
    comp = _clean_param(competition)
    sea = _clean_param(season)
    m_balls = min_balls if isinstance(min_balls, int) else 60
    if comp or sea:
        bowling_analytics.calculate_metrics(competition=comp, season=sea)
    return bowling_analytics.get_bowling_summary(min_balls=m_balls)

@router.get("/reliability")
def get_reliability_engine_info():
    return {
        "status": "ready",
        "current_weights": reliability_engine.config.model_dump(),
        "total_eligible_batters": len(reliability_engine.ranked_batters),
        "total_eligible_bowlers": len(reliability_engine.ranked_bowlers),
        "methodology": "Empirical Bayesian Shrinkage + Multi-factor Normalization"
    }

@router.post("/run")
def run_custom_analysis(
    weights: Optional[WeightConfig] = None,
    thresholds: Optional[PressureThresholdConfig] = None
):
    if thresholds:
        pressure_engine.reconstruct_and_classify(custom_config=thresholds)
        batting_analytics.calculate_metrics()
        bowling_analytics.calculate_metrics()
        
    if weights:
        reliability_engine.calculate_all_rankings(custom_weights=weights)
    else:
        reliability_engine.calculate_all_rankings()
        
    return {
        "status": "updated",
        "top_10_batters": reliability_engine.get_top_batters(10),
        "top_10_bowlers": reliability_engine.get_top_bowlers(10)
    }

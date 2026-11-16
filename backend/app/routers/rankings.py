from fastapi import APIRouter
from typing import List, Optional
from ..analytics.reliability_engine import reliability_engine
from ..schemas.models import BatterRankingItem, BowlerRankingItem

router = APIRouter(prefix="/api/rankings", tags=["Rankings"])

@router.get("/batters", response_model=List[BatterRankingItem])
def get_batter_rankings(limit: int = 10):
    lim = limit if isinstance(limit, int) else 10
    return reliability_engine.get_top_batters(limit=lim)

@router.get("/bowlers", response_model=List[BowlerRankingItem])
def get_bowler_rankings(limit: int = 10):
    lim = limit if isinstance(limit, int) else 10
    return reliability_engine.get_top_bowlers(limit=lim)

from fastapi import APIRouter
from typing import Dict, Any, List, Optional
from ..analytics.reliability_engine import reliability_engine

router = APIRouter(prefix="/api/auction", tags=["Auction Intelligence"])

@router.get("/intelligence")
def get_auction_intelligence(role: Optional[str] = None):
    top_batters = reliability_engine.get_top_batters(30)
    top_bowlers = reliability_engine.get_top_bowlers(30)
    
    specialists_bat = [
        b for b in top_batters if b['strike_rate_improvement'] >= 45.0
    ][:6]
    
    enforcers_bowl = [
        bw for bw in top_bowlers if bw['pressure_economy'] <= 8.2
    ][:6]
    
    value_picks = [
        b for b in top_batters if b['confidence_level'] in ['Medium Confidence', 'Developing Evidence'] and b['reliability_score'] >= 55.0
    ][:5] + [
        bw for bw in top_bowlers if bw['confidence_level'] in ['Medium Confidence', 'Developing Evidence'] and bw['reliability_score'] >= 45.0
    ][:5]
    
    consistent = [
        b for b in top_batters if b['pressure_average'] >= 30.0 and b['pressure_strike_rate'] >= 180.0
    ][:5]
    
    squad_roles = {
        'Finishers': [b for b in top_batters if b['pressure_strike_rate'] >= 190.0][:6],
        'Middle Order Anchors': [b for b in top_batters if b['pressure_average'] >= 32.0][:6],
        'Death Overs Bowlers': [bw for bw in top_bowlers if bw['pressure_wickets'] >= 25][:6],
        'Control Spinners': [bw for bw in top_bowlers if bw['pressure_economy'] <= 7.8 and 'spin' in bw['reason'].lower() or bw['player_name'] in ['Kuldeep Yadav', 'Noor Ahmad', 'Wanindu Hasaranga', 'Axar Patel', 'Sunil Narine', 'Maheesh Theekshana']][:6],
        'Impact Pacers': [bw for bw in top_bowlers if bw['player_name'] in ['Jasprit Bumrah', 'Arshdeep Singh', 'Matheesha Pathirana', 'Haris Rauf', 'Shaheen Afridi', 'Harshal Patel', 'Tim Southee']][:6]
    }
    
    return {
        'disclaimer': "Exploratory tactical decision-support system for Rajasthan Royals analysts. Evaluates pressure reliability without speculative squad prices.",
        'pressure_specialists': specialists_bat,
        'restrictive_enforcers': enforcers_bowl,
        'value_prospects': value_picks,
        'consistent_anchors': consistent,
        'squad_roles': squad_roles
    }

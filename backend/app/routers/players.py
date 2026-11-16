from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from ..analytics.batting_analytics import batting_analytics
from ..analytics.bowling_analytics import bowling_analytics
from ..analytics.reliability_engine import reliability_engine
from ..data_processing.loader import data_loader
from ..schemas.models import PlayerCard

router = APIRouter(prefix="/api", tags=["Players"])

@router.get("/players")
def list_players(
    query: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    bat = batting_analytics.df_batting
    bowl = bowling_analytics.df_bowling
    
    if bat is None:
        bat = batting_analytics.calculate_metrics()
    if bowl is None:
        bowl = bowling_analytics.calculate_metrics()
        
    # Map reliability scores
    bat_scores = {b['player_id']: b['reliability_score'] for b in reliability_engine.ranked_batters}
    bowl_scores = {b['player_id']: b['reliability_score'] for b in reliability_engine.ranked_bowlers}
    
    players = {}
    
    # Process batters
    for _, r in bat.iterrows():
        pid = int(r['striker_id'])
        r_score = bat_scores.get(pid, 0.0)
        players[pid] = {
            'player_id': pid,
            'player_name': str(r['striker_name']),
            'team_name': str(r.get('team_name', 'Independent')),
            'role': 'Batter',
            'matches': int(r['total_matches']),
            'runs': int(r['total_runs']),
            'wickets': 0,
            'strike_rate': float(r['sr_total']),
            'economy': 0.0,
            'pressure_score': float(r['sr_press']),
            'reliability_score': float(r_score),
            'confidence_level': "High" if r['press_balls'] >= 200 else ("Medium" if r['press_balls'] >= 80 else "Developing"),
            'press_balls': int(r['press_balls'])
        }
        
    # Process bowlers
    for _, r in bowl.iterrows():
        pid = int(r['bowler_id'])
        r_score = bowl_scores.get(pid, 0.0)
        if pid in players:
            # All-rounder
            p = players[pid]
            p['role'] = 'All-Rounder'
            p['wickets'] = int(r['total_bowler_wkts'])
            p['economy'] = float(r['econ_total'])
            p['reliability_score'] = max(p['reliability_score'], float(r_score))
        else:
            players[pid] = {
                'player_id': pid,
                'player_name': str(r['bowler_name']),
                'team_name': str(r.get('team_name', 'Independent')),
                'role': 'Bowler',
                'matches': int(r['total_matches']),
                'runs': 0,
                'wickets': int(r['total_bowler_wkts']),
                'strike_rate': 0.0,
                'economy': float(r['econ_total']),
                'pressure_score': float(r['econ_press']),
                'reliability_score': float(r_score),
                'confidence_level': "High" if r['press_legal_balls'] >= 200 else ("Medium" if r['press_legal_balls'] >= 80 else "Developing"),
                'press_balls': int(r['press_legal_balls'])
            }
            
    player_list = list(players.values())
    
    # Filter
    if query:
        q = query.lower()
        player_list = [p for p in player_list if q in p['player_name'].lower() or q in p['team_name'].lower()]
    if role and role != "All":
        player_list = [p for p in player_list if p['role'] == role]
        
    # Sort by reliability score then runs/wkts
    player_list = sorted(player_list, key=lambda x: (x['reliability_score'], x['runs'] + x['wickets']*20), reverse=True)
    
    total = len(player_list)
    paginated = player_list[offset:offset+limit]
    
    return {
        'total': total,
        'limit': limit,
        'offset': offset,
        'players': paginated
    }

@router.get("/players/{player_id}")
def get_player_details(player_id: int):
    bat_profile = batting_analytics.get_batter_profile(player_id)
    bowl_profile = bowling_analytics.get_bowler_profile(player_id)
    
    if not bat_profile and not bowl_profile:
        raise HTTPException(status_code=404, detail="Player not found in database.")
        
    p_name = bat_profile['striker_name'] if bat_profile else bowl_profile['bowler_name']
    team = bat_profile.get('team_name') if bat_profile else bowl_profile.get('team_name')
    
    # Reliability rank info
    bat_rank = next((b for b in reliability_engine.ranked_batters if b['player_id'] == player_id), None)
    bowl_rank = next((b for b in reliability_engine.ranked_bowlers if b['player_id'] == player_id), None)
    
    return {
        'player_id': player_id,
        'player_name': p_name,
        'team_name': team,
        'batting': bat_profile,
        'bowling': bowl_profile,
        'batting_ranking': bat_rank,
        'bowling_ranking': bowl_rank
    }

@router.get("/comparison")
def compare_players(player_ids: str = Query(..., description="Comma separated list of 2 to 4 player IDs")):
    ids = [int(i.strip()) for i in player_ids.split(",") if i.strip()]
    if len(ids) < 2 or len(ids) > 4:
        raise HTTPException(status_code=400, detail="Provide between 2 and 4 player IDs for comparison.")
        
    comparison_data = []
    for pid in ids:
        bat = batting_analytics.get_batter_profile(pid)
        bowl = bowling_analytics.get_bowler_profile(pid)
        
        name = bat['striker_name'] if bat else (bowl['bowler_name'] if bowl else f"Player {pid}")
        team = (bat.get('team_name') if bat else bowl.get('team_name')) if (bat or bowl) else "Independent"
        
        bat_rank = next((b for b in reliability_engine.ranked_batters if b['player_id'] == pid), None)
        bowl_rank = next((b for b in reliability_engine.ranked_bowlers if b['player_id'] == pid), None)
        
        comparison_data.append({
            'player_id': pid,
            'player_name': name,
            'team_name': team,
            'batting': bat,
            'bowling': bowl,
            'bat_rank': bat_rank,
            'bowl_rank': bowl_rank,
            'radar_metrics': {
                'pressure_sr': float(bat['sr_press']) if bat else 0.0,
                'pressure_avg': float(bat['avg_press']) if bat else 0.0,
                'pressure_control': float(max(0, 15 - bowl['econ_press']) * 6.6) if bowl else 0.0,
                'consistency': float(bat['consistency_score'] if bat else (bowl['consistency_score'] if bowl else 50.0)),
                'boundary_power': float(bat['boundary_pct_press']) if bat else 0.0,
                'wicket_threat': float(bowl['wkt_rate_press'] * 30.0) if bowl else 0.0
            }
        })
        
    return {
        'players': comparison_data
    }

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.routers.dataset import get_dataset_summary, get_dataset_quality
from app.routers.analytics import get_pressure_analytics, get_batting_analytics, get_bowling_analytics
from app.routers.rankings import get_batter_rankings, get_bowler_rankings
from app.routers.auction import get_auction_intelligence
from app.routers.reports import generate_all_reports

def test_dataset_endpoints():
    summary = get_dataset_summary()
    assert summary.total_matches == 883
    assert summary.total_balls == 200999
    print("Dataset summary test: PASSED")
    
    quality = get_dataset_quality()
    assert quality.validation_status == "VERIFIED & HEALTHY"
    print("Dataset quality test: PASSED")

def test_rankings_endpoints():
    batters = get_batter_rankings(limit=10)
    assert len(batters) == 10
    assert batters[0]['rank'] == 1
    assert batters[0]['reliability_score'] >= batters[1]['reliability_score']
    print(f"Rank 1 Batter: {batters[0]['player_name']} (Score: {batters[0]['reliability_score']})")
    print("Batters rankings test: PASSED")
    
    bowlers = get_bowler_rankings(limit=10)
    assert len(bowlers) == 10
    assert bowlers[0]['rank'] == 1
    assert bowlers[0]['reliability_score'] >= bowlers[1]['reliability_score']
    print(f"Rank 1 Bowler: {bowlers[0]['player_name']} (Score: {bowlers[0]['reliability_score']})")
    print("Bowlers rankings test: PASSED")

def test_analytics_endpoints():
    p_data = get_pressure_analytics()
    assert "tier_counts" in p_data
    print("Pressure analytics test: PASSED")
    
    bat_data = get_batting_analytics()
    assert bat_data["eligible_batters_count"] > 0
    print("Batting analytics test: PASSED")
    
    bowl_data = get_bowling_analytics()
    assert bowl_data["eligible_bowlers_count"] > 0
    print("Bowling analytics test: PASSED")

def test_auction_and_reports():
    auction = get_auction_intelligence()
    assert len(auction["pressure_specialists"]) > 0
    print("Auction intelligence test: PASSED")
    
    rep = generate_all_reports()
    assert rep["status"] == "success"
    print("Report generation test: PASSED")

if __name__ == "__main__":
    test_dataset_endpoints()
    test_rankings_endpoints()
    test_analytics_endpoints()
    test_auction_and_reports()
    print("\nALL BACKEND ANALYTICS TESTS PASSED SUCCESSFULLY!")

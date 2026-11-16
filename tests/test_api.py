import pytest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_dataset_summary(client):
    res = client.get("/api/dataset/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_matches"] == 883
    assert data["total_balls"] == 200999
    assert data["ipl_matches"] > 0
    assert data["t20i_matches"] > 0

def test_dataset_quality(client):
    res = client.get("/api/dataset/quality")
    assert res.status_code == 200
    data = res.json()
    assert data["validation_status"] == "VERIFIED & HEALTHY"
    assert "ball_by_ball" in data["files_checked"]

def test_rankings_batters(client):
    res = client.get("/api/rankings/batters?limit=10")
    assert res.status_code == 200
    batters = res.json()
    assert len(batters) == 10
    assert batters[0]["rank"] == 1
    assert batters[0]["reliability_score"] >= batters[1]["reliability_score"]
    pids = [b["player_id"] for b in batters]
    assert len(pids) == len(set(pids))

def test_rankings_bowlers(client):
    res = client.get("/api/rankings/bowlers?limit=10")
    assert res.status_code == 200
    bowlers = res.json()
    assert len(bowlers) == 10
    assert bowlers[0]["rank"] == 1
    assert bowlers[0]["reliability_score"] >= bowlers[1]["reliability_score"]
    pids = [b["player_id"] for b in bowlers]
    assert len(pids) == len(set(pids))

def test_pressure_analytics(client):
    res = client.get("/api/analytics/pressure")
    assert res.status_code == 200
    data = res.json()
    assert "tier_counts" in data
    assert "High" in data["tier_counts"]

def test_auction_intelligence(client):
    res = client.get("/api/auction/intelligence")
    assert res.status_code == 200
    data = res.json()
    assert "pressure_specialists" in data
    assert "restrictive_enforcers" in data

def test_reports_generation(client):
    res = client.post("/api/reports/generate")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"

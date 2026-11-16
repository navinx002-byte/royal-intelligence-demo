import sys
import os
sys.path.append(r'C:\Users\Navin D\.gemini\antigravity\scratch\Royal-Intelligence\backend')

from app.analytics.reliability_engine import reliability_engine
from app.data_processing.loader import data_loader

# Get all RR player IDs
df_map = data_loader.competition_team_player_mapping
rr_pids = set(df_map[df_map['team_name'].str.contains('Rajasthan', case=False, na=False)]['player_id'])

# Filter ranked batters for RR players
all_bat = reliability_engine.ranked_batters
rr_bat = [b for b in all_bat if b['player_id'] in rr_pids]

print('=== TOP 10 RAJASTHAN ROYALS BATTERS UNDER PRESSURE ===')
for i, b in enumerate(rr_bat[:10], 1):
    diff = b['strike_rate_improvement']
    diff_str = f"+{diff:.1f}" if diff >= 0 else f"{diff:.1f}"
    print(f"{i}. {b['player_name']} (ID: {b['player_id']}) - Score: {b['reliability_score']:.2f} | Press SR: {b['pressure_strike_rate']:.1f} | Norm SR: {b['normal_strike_rate']:.1f} | Diff: {diff_str} | Runs: {b['pressure_runs']}")

# Filter ranked bowlers for RR players
all_bowl = reliability_engine.ranked_bowlers
rr_bowl = [bw for bw in all_bowl if bw['player_id'] in rr_pids]

print('\n=== TOP 10 RAJASTHAN ROYALS BOWLERS UNDER PRESSURE ===')
for i, bw in enumerate(rr_bowl[:10], 1):
    print(f"{i}. {bw['player_name']} (ID: {bw['player_id']}) - Score: {bw['reliability_score']:.2f} | Press Econ: {bw['pressure_economy']:.2f} | Normal Econ: {bw['normal_economy']:.2f} | Wkts: {bw['pressure_wickets']} | Overs: {bw['pressure_overs_display']}")

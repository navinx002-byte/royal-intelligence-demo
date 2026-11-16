export interface DatasetSummary {
  total_matches: number;
  total_balls: number;
  total_competitions: number;
  total_teams: number;
  total_players: number;
  ipl_matches: number;
  t20i_matches: number;
  seasons: string[];
  competitions: string[];
  pressure_balls_count: number;
  pressure_percentage: number;
}

export interface DataQuality {
  files_checked: Record<string, {
    rows: number;
    columns: number;
    memory_mb: number;
    columns_list: string[];
  }>;
  missing_values: Record<string, Record<string, number>>;
  validation_status: string;
  warnings: string[];
  data_dictionary: Record<string, string>;
}

export interface BatterRanking {
  rank: number;
  player_id: number;
  player_name: string;
  team_name: string;
  reliability_score: number;
  pressure_strike_rate: number;
  normal_strike_rate: number;
  strike_rate_improvement: number;
  pressure_average: number;
  pressure_runs: number;
  pressure_balls: number;
  pressure_innings: number;
  matches_analysed: number;
  boundary_pct_press: number;
  dot_pct_press: number;
  confidence_level: string;
  reason: string;
}

export interface BowlerRanking {
  rank: number;
  player_id: number;
  player_name: string;
  team_name: string;
  reliability_score: number;
  pressure_economy: number;
  normal_economy: number;
  economy_improvement: number;
  pressure_wickets: number;
  pressure_overs: number;
  pressure_overs_display: string;
  pressure_dot_pct: number;
  matches_analysed: number;
  confidence_level: string;
  reason: string;
}

export interface PressureAnalytics {
  total_deliveries: number;
  tier_counts: Record<string, number>;
  tier_percentages: Record<string, number>;
  innings_breakdown: Array<{
    innings: string;
    low: number;
    medium: number;
    high: number;
    total: number;
  }>;
  phase_distribution: Array<{
    phase: string;
    Low: number;
    Medium: number;
    High: number;
  }>;
  scatter_sample: Array<{
    rrr: number;
    wickets_in_hand: number;
    pressure_index: number;
    pressure_tier: string;
    overid: number;
  }>;
  config: {
    chase_rrr_weight: number;
    wkt_stress_multiplier: number;
    death_overs_start: number;
    crisis_over_limit: number;
    high_pressure_cutoff: number;
    medium_pressure_cutoff: number;
  };
}

export interface PlayerCardData {
  player_id: number;
  player_name: string;
  team_name: string;
  role: string;
  matches: number;
  runs: number;
  wickets: number;
  strike_rate: number;
  economy: number;
  pressure_score: number;
  reliability_score: number;
  confidence_level: string;
  press_balls: number;
}

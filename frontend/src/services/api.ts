import { DatasetSummary, DataQuality, BatterRanking, BowlerRanking, PressureAnalytics, PlayerCardData } from '../types';

const BASE_URL = '/api';

export const api = {
  async getHealth(): Promise<{ status: string }> {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  async getDatasetSummary(): Promise<DatasetSummary> {
    const res = await fetch(`${BASE_URL}/dataset/summary`);
    return res.json();
  },

  async getDatasetQuality(): Promise<DataQuality> {
    const res = await fetch(`${BASE_URL}/dataset/quality`);
    return res.json();
  },

  async getCompetitions(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/dataset/competitions`);
    return res.json();
  },

  async getSeasons(): Promise<string[]> {
    const res = await fetch(`${BASE_URL}/dataset/seasons`);
    return res.json();
  },

  async getPressureAnalytics(competition?: string, season?: string): Promise<PressureAnalytics> {
    const params = new URLSearchParams();
    if (competition && competition !== 'All') params.append('competition', competition);
    if (season && season !== 'All') params.append('season', season);
    const res = await fetch(`${BASE_URL}/analytics/pressure?${params.toString()}`);
    return res.json();
  },

  async getBattingAnalytics(competition?: string, season?: string, minBalls = 50): Promise<any> {
    const params = new URLSearchParams();
    if (competition && competition !== 'All') params.append('competition', competition);
    if (season && season !== 'All') params.append('season', season);
    params.append('min_balls', minBalls.toString());
    const res = await fetch(`${BASE_URL}/analytics/batting?${params.toString()}`);
    return res.json();
  },

  async getBowlingAnalytics(competition?: string, season?: string, minBalls = 60): Promise<any> {
    const params = new URLSearchParams();
    if (competition && competition !== 'All') params.append('competition', competition);
    if (season && season !== 'All') params.append('season', season);
    params.append('min_balls', minBalls.toString());
    const res = await fetch(`${BASE_URL}/analytics/bowling?${params.toString()}`);
    return res.json();
  },

  async getTopBatters(limit = 10): Promise<BatterRanking[]> {
    const res = await fetch(`${BASE_URL}/rankings/batters?limit=${limit}`);
    return res.json();
  },

  async getTopBowlers(limit = 10): Promise<BowlerRanking[]> {
    const res = await fetch(`${BASE_URL}/rankings/bowlers?limit=${limit}`);
    return res.json();
  },

  async getPlayers(query?: string, role?: string, limit = 50, offset = 0): Promise<{ total: number; players: PlayerCardData[] }> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (role && role !== 'All') params.append('role', role);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    const res = await fetch(`${BASE_URL}/players?${params.toString()}`);
    return res.json();
  },

  async getPlayerDetails(playerId: number): Promise<any> {
    const res = await fetch(`${BASE_URL}/players/${playerId}`);
    return res.json();
  },

  async comparePlayers(playerIds: number[]): Promise<any> {
    const res = await fetch(`${BASE_URL}/comparison?player_ids=${playerIds.join(',')}`);
    return res.json();
  },

  async getAuctionIntelligence(role = 'All'): Promise<any> {
    const res = await fetch(`${BASE_URL}/auction/intelligence?role=${role}`);
    return res.json();
  },

  async getMethodology(): Promise<any> {
    const res = await fetch(`${BASE_URL}/methodology`);
    return res.json();
  },

  async runCustomAnalysis(weights?: any, thresholds?: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/analytics/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights, thresholds })
    });
    return res.json();
  },

  async generateReports(): Promise<any> {
    const res = await fetch(`${BASE_URL}/reports/generate`, { method: 'POST' });
    return res.json();
  },

  getDownloadUrl(type: 'methodology_pdf' | 'batters_csv' | 'bowlers_csv'): string {
    return `${BASE_URL}/reports/download/${type}`;
  }
};

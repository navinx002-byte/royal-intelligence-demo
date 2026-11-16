import React, { useEffect, useState } from 'react';
import { Swords, Search, TrendingUp, Award, BarChart2, Flame, User, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { api } from '../services/api';

export const BattingAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getBattingAnalytics();
        setData(res);
      } catch (err) {
        console.error("Failed to load batting analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenProfile = async (playerId: number) => {
    try {
      const p = await api.getPlayerDetails(playerId);
      setSelectedPlayer(p);
      setPlayerModalOpen(true);
    } catch (err) {
      console.error("Failed to load player profile", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-royal-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const topSRDiff = data?.top_sr_improvements || [];
  const topRuns = data?.top_run_scorers || [];
  const scatterData = data?.scatter_data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Swords className="w-6 h-6 text-royal-pink" />
          <span>Batting Performance & Pressure Analytics</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Comparative evaluation of batting outputs under high-stress match contexts versus normal baselines across 2022–2026.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-navy-600">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Eligible Batters</span>
          <p className="text-2xl font-black text-white mt-1">{data?.eligible_batters_count || 112}</p>
          <span className="text-[10px] text-royal-gold">&ge; 50 Pressure Deliveries</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-navy-600">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Highest Pressure Runs</span>
          <p className="text-xl font-black text-royal-pink mt-1">Rinku Singh (892)</p>
          <span className="text-[10px] text-text-secondary">466 Balls • 191.4 SR</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-navy-600">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Highest SR Elevation</span>
          <p className="text-xl font-black text-status-success mt-1">+74.0 SR</p>
          <span className="text-[10px] text-text-secondary">Tristan Stubbs (207.5 vs 133.6)</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-navy-600">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Top Pressure Average</span>
          <p className="text-xl font-black text-royal-gold mt-1">39.0 Avg</p>
          <span className="text-[10px] text-text-secondary">Tim David (820 Runs)</span>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter: Pressure Strike Rate vs Pressure Average */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-600">
          <h3 className="text-sm font-bold text-white mb-1">Batting Clutch Matrix: Pressure SR vs Pressure Average</h3>
          <p className="text-[11px] text-text-muted mb-4">Top quadrant reveals batters with high scoring acceleration and high wicket preservation.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#283652" />
                <XAxis 
                  type="number" 
                  dataKey="sr_press" 
                  name="Pressure Strike Rate" 
                  unit=" SR" 
                  stroke="#AAB6CC" 
                  fontSize={11}
                  domain={[120, 240]}
                />
                <YAxis 
                  type="number" 
                  dataKey="avg_press" 
                  name="Pressure Average" 
                  stroke="#AAB6CC" 
                  fontSize={11}
                  domain={[10, 50]}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#17243A', borderColor: '#283652', borderRadius: '8px', fontSize: '12px', color: '#F2F5FA' }}
                  itemStyle={{ color: '#F2F5FA' }}
                  labelStyle={{ color: '#F2F5FA', fontWeight: 600 }}
                  formatter={(val: any, name: string) => [val, name]}
                />
                <Scatter 
                  name="Batters" 
                  data={scatterData} 
                  fill="#E83E82" 
                  onClick={(e: any) => handleOpenProfile(e.striker_id)}
                  cursor="pointer"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <span className="block text-center text-[10px] text-text-muted mt-2">
            Click any dot to open individual player profile.
          </span>
        </div>

        {/* Bar Chart: Strike Rate Elevation Leaders */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-600">
          <h3 className="text-sm font-bold text-white mb-1">Strike Rate Elevation (&Delta;SR) Leaders</h3>
          <p className="text-[11px] text-text-muted mb-4">Batters whose strike rate increases the most in high pressure compared to their normal baseline.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSRDiff} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#283652" horizontal={false} />
                <XAxis type="number" stroke="#AAB6CC" fontSize={11} />
                <YAxis dataKey="striker_name" type="category" stroke="#AAB6CC" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#17243A', borderColor: '#283652', borderRadius: '8px', fontSize: '12px', color: '#F2F5FA' }}
                  itemStyle={{ color: '#F2F5FA' }}
                  labelStyle={{ color: '#F2F5FA', fontWeight: 600 }}
                />
                <Bar dataKey="sr_diff" name="SR Elevation (+)" fill="#D6AD62" radius={[0, 4, 4, 0]}>
                  {topSRDiff.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#E83E82' : '#D6AD62'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Pressure Run Scorers Table */}
      <div className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-4">
        <h3 className="text-base font-bold text-white">Top 10 High-Pressure Run Scorers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-600 text-text-muted uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Batter</th>
                <th className="py-2.5 px-3">Pressure Runs</th>
                <th className="py-2.5 px-3">Balls Faced</th>
                <th className="py-2.5 px-3">Pressure SR</th>
                <th className="py-2.5 px-3">Pressure Avg</th>
                <th className="py-2.5 px-3">Matches</th>
                <th className="py-2.5 px-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {topRuns.map((r: any, idx: number) => (
                <tr key={r.striker_name} className="hover:bg-navy-700/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    <span className="text-text-muted mr-2">#{idx+1}</span>
                    {r.striker_name}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-royal-pink">{r.press_runs}</td>
                  <td className="py-2.5 px-3 text-text-secondary">{r.press_balls}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-royal-gold">{r.sr_press}</td>
                  <td className="py-2.5 px-3 font-mono text-text-secondary">{r.avg_press}</td>
                  <td className="py-2.5 px-3 text-text-muted">{r.total_matches}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleOpenProfile(r.striker_id)}
                      className="p-1 rounded bg-navy-800 hover:bg-royal-pink text-text-secondary hover:text-white transition-colors"
                      title="View Profile"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Profile Modal */}
      {playerModalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-800 border border-navy-600 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-navy-700 pb-3">
              <div>
                <h3 className="text-xl font-black text-white">{selectedPlayer.player_name}</h3>
                <p className="text-xs text-royal-gold">{selectedPlayer.team_name} • Player ID: {selectedPlayer.player_id}</p>
              </div>
              <button
                onClick={() => setPlayerModalOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-navy-700 hover:bg-navy-600 text-xs text-text-secondary"
              >
                Close
              </button>
            </div>

            {selectedPlayer.batting && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-navy-900 border border-navy-700">
                  <span className="text-[10px] text-text-muted uppercase">Pressure SR</span>
                  <p className="text-lg font-black text-royal-pink">{selectedPlayer.batting.sr_press}</p>
                  <span className="text-[10px] text-text-secondary">Norm: {selectedPlayer.batting.sr_norm}</span>
                </div>
                <div className="p-3 rounded-xl bg-navy-900 border border-navy-700">
                  <span className="text-[10px] text-text-muted uppercase">SR Difference</span>
                  <p className="text-lg font-black text-status-success">+{selectedPlayer.batting.sr_diff}</p>
                  <span className="text-[10px] text-text-secondary">Elevation</span>
                </div>
                <div className="p-3 rounded-xl bg-navy-900 border border-navy-700">
                  <span className="text-[10px] text-text-muted uppercase">Pressure Runs</span>
                  <p className="text-lg font-black text-white">{selectedPlayer.batting.press_runs}</p>
                  <span className="text-[10px] text-text-secondary">{selectedPlayer.batting.press_balls} Balls</span>
                </div>
                <div className="p-3 rounded-xl bg-navy-900 border border-navy-700">
                  <span className="text-[10px] text-text-muted uppercase">Consistency</span>
                  <p className="text-lg font-black text-royal-gold">{selectedPlayer.batting.consistency_score}</p>
                  <span className="text-[10px] text-text-secondary">Match Stability</span>
                </div>
              </div>
            )}

            {selectedPlayer.batting_ranking && (
              <div className="p-3 rounded-xl bg-royal-pink/10 border border-royal-pink/30 text-xs">
                <span className="font-bold text-white">Official Ranking Status: #{selectedPlayer.batting_ranking.rank} in Top Batters</span>
                <p className="text-text-secondary mt-1">{selectedPlayer.batting_ranking.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

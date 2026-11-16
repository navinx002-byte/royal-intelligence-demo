import React, { useEffect, useState } from 'react';
import { ShieldAlert, TrendingDown, Award, BarChart2, CheckCircle2, User, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { api } from '../services/api';

export const BowlingAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getBowlingAnalytics();
        setData(res);
      } catch (err) {
        console.error("Failed to load bowling analytics", err);
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
      console.error("Failed to load bowler profile", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-royal-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const topWkts = data?.top_wicket_takers || [];
  const topEcon = data?.top_economy_bowlers || [];
  const scatterData = data?.scatter_data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-royal-gold" />
          <span>Bowling Performance & Pressure Analytics</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Evaluating run restriction, wicket impact, and dot-ball execution in high-stakes death and collapse phases across 2022–2026.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-navy-600">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Eligible Bowlers</span>
          <p className="text-2xl font-black text-white mt-1">{data?.eligible_bowlers_count || 104}</p>
          <span className="text-[10px] text-royal-gold">&ge; 60 Legal Deliveries</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-navy-600">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Top Pressure Economy</span>
          <p className="text-xl font-black text-status-success mt-1">6.95 RPO</p>
          <span className="text-[10px] text-text-secondary">Jasprit Bumrah (476 Balls)</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-navy-600">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Most Pressure Wickets</span>
          <p className="text-xl font-black text-royal-pink mt-1">74 Wickets</p>
          <span className="text-[10px] text-text-secondary">Arshdeep Singh (138.1 Overs)</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-navy-600">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Highest Dot %</span>
          <p className="text-xl font-black text-royal-gold mt-1">47.4% Dots</p>
          <span className="text-[10px] text-text-secondary">Noor Ahmad (156 Balls)</span>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter: Economy vs Wickets */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-600">
          <h3 className="text-sm font-bold text-white mb-1">Bowler Clutch Matrix: Economy vs Pressure Wickets</h3>
          <p className="text-[11px] text-text-muted mb-4">Optimal bowlers occupy the bottom-right: low economy rate with high wicket volume.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#283652" />
                <XAxis 
                  type="number" 
                  dataKey="press_bowler_wkts" 
                  name="Pressure Wickets" 
                  unit=" wkts" 
                  stroke="#AAB6CC" 
                  fontSize={11}
                  domain={[0, 80]}
                />
                <YAxis 
                  type="number" 
                  dataKey="econ_press" 
                  name="Pressure Economy" 
                  unit=" rpo" 
                  stroke="#AAB6CC" 
                  fontSize={11}
                  domain={[6, 12]}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#17243A', borderColor: '#283652', borderRadius: '8px', fontSize: '12px', color: '#F2F5FA' }}
                  itemStyle={{ color: '#F2F5FA' }}
                  labelStyle={{ color: '#F2F5FA', fontWeight: 600 }}
                />
                <Scatter 
                  name="Bowlers" 
                  data={scatterData} 
                  fill="#D6AD62" 
                  onClick={(e: any) => handleOpenProfile(e.bowler_id)}
                  cursor="pointer"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <span className="block text-center text-[10px] text-text-muted mt-2">
            Click any dot to open individual player profile.
          </span>
        </div>

        {/* Bar: Top Economy Rates */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-600">
          <h3 className="text-sm font-bold text-white mb-1">Most Restrictive Pressure Economy Rates</h3>
          <p className="text-[11px] text-text-muted mb-4">Bowlers conceding the fewest runs per over in high-intensity phases.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEcon} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#283652" horizontal={false} />
                <XAxis type="number" stroke="#AAB6CC" fontSize={11} domain={[0, 10]} />
                <YAxis dataKey="bowler_name" type="category" stroke="#AAB6CC" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#17243A', borderColor: '#283652', borderRadius: '8px', fontSize: '12px', color: '#F2F5FA' }}
                  itemStyle={{ color: '#F2F5FA' }}
                  labelStyle={{ color: '#F2F5FA', fontWeight: 600 }}
                />
                <Bar dataKey="econ_press" name="Pressure Economy (rpo)" fill="#18B887" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Wicket Takers Table */}
      <div className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-4">
        <h3 className="text-base font-bold text-white">Top 10 High-Pressure Wicket Takers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-600 text-text-muted uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Bowler</th>
                <th className="py-2.5 px-3">Pressure Wickets</th>
                <th className="py-2.5 px-3">Pressure Balls</th>
                <th className="py-2.5 px-3">Economy</th>
                <th className="py-2.5 px-3">Strike Rate</th>
                <th className="py-2.5 px-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {topWkts.map((w: any, idx: number) => (
                <tr key={w.bowler_name} className="hover:bg-navy-700/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    <span className="text-text-muted mr-2">#{idx+1}</span>
                    {w.bowler_name}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-royal-pink">{w.press_bowler_wkts}</td>
                  <td className="py-2.5 px-3 text-text-secondary">{w.press_legal_balls}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-status-success">{w.econ_press}</td>
                  <td className="py-2.5 px-3 font-mono text-royal-gold">{w.sr_press} balls/wkt</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleOpenProfile(w.bowler_id)}
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

      {/* Bowler Profile Modal */}
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

            {selectedPlayer.bowling && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-navy-900 border border-navy-700">
                  <span className="text-[10px] text-text-muted uppercase">Pressure Economy</span>
                  <p className="text-lg font-black text-status-success">{selectedPlayer.bowling.econ_press}</p>
                  <span className="text-[10px] text-text-secondary">Norm: {selectedPlayer.bowling.econ_norm}</span>
                </div>
                <div className="p-3 rounded-xl bg-navy-900 border border-navy-700">
                  <span className="text-[10px] text-text-muted uppercase">Pressure Wickets</span>
                  <p className="text-lg font-black text-royal-pink">{selectedPlayer.bowling.press_bowler_wkts}</p>
                  <span className="text-[10px] text-text-secondary">{selectedPlayer.bowling.press_overs_display} Overs</span>
                </div>
                <div className="p-3 rounded-xl bg-navy-900 border border-navy-700">
                  <span className="text-[10px] text-text-muted uppercase">Dot Ball %</span>
                  <p className="text-lg font-black text-royal-gold">{selectedPlayer.bowling.dot_pct_press}%</p>
                  <span className="text-[10px] text-text-secondary">Pressure Deliveries</span>
                </div>
                <div className="p-3 rounded-xl bg-navy-900 border border-navy-700">
                  <span className="text-[10px] text-text-muted uppercase">Consistency</span>
                  <p className="text-lg font-black text-white">{selectedPlayer.bowling.consistency_score}</p>
                  <span className="text-[10px] text-text-secondary">Match Stability</span>
                </div>
              </div>
            )}

            {selectedPlayer.bowling_ranking && (
              <div className="p-3 rounded-xl bg-royal-gold/10 border border-royal-gold/30 text-xs">
                <span className="font-bold text-white">Official Ranking Status: #{selectedPlayer.bowling_ranking.rank} in Top Bowlers</span>
                <p className="text-text-secondary mt-1">{selectedPlayer.bowling_ranking.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

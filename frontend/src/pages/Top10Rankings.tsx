import React, { useEffect, useState } from 'react';
import { Trophy, Download, Swords, ShieldAlert, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { BatterRanking, BowlerRanking } from '../types';

export const Top10Rankings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'batters' | 'bowlers'>('batters');
  const [topBatters, setTopBatters] = useState<BatterRanking[]>([]);
  const [topBowlers, setTopBowlers] = useState<BowlerRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const [bat, bowl] = await Promise.all([
          api.getTopBatters(10),
          api.getTopBowlers(10)
        ]);
        setTopBatters(bat);
        setTopBowlers(bowl);
      } catch (err) {
        console.error("Failed to load rankings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, []);

  const handleDownloadCSV = (type: 'batters_csv' | 'bowlers_csv') => {
    window.open(api.getDownloadUrl(type), '_blank');
  };

  const handleDownloadPDF = () => {
    window.open(api.getDownloadUrl('methodology_pdf'), '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-royal-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Official Deliverable Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-800 via-navy-800 to-navy-700 border border-royal-gold/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-royal-gold/20 text-royal-gold text-[10px] font-bold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Official Competition Deliverable • Round 1 Submission</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Top 10 Reliable Players Under Pressure
            </h2>
            <p className="text-xs text-text-secondary mt-1 max-w-2xl">
              Strictly calculated from 2022–2026 IPL and T20 International ball-by-ball records. 
              Zero manual adjustments. Reproducible via the analytical engine.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadCSV(activeTab === 'batters' ? 'batters_csv' : 'bowlers_csv')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-600 hover:border-royal-gold text-text-primary text-xs font-semibold shadow transition-all"
            >
              <Download className="w-3.5 h-3.5 text-royal-gold" />
              <span>Export {activeTab === 'batters' ? 'Batters' : 'Bowlers'} CSV</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-royal-pink to-royal-pink-light hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-royal-pink/25 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Official PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-navy-600 gap-4">
        <button
          onClick={() => setActiveTab('batters')}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold transition-all relative ${
            activeTab === 'batters'
              ? 'text-royal-pink border-b-2 border-royal-pink'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>TAB A: Top 10 Batters Under Pressure</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-navy-700 text-text-muted">10</span>
        </button>

        <button
          onClick={() => setActiveTab('bowlers')}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold transition-all relative ${
            activeTab === 'bowlers'
              ? 'text-royal-gold border-b-2 border-royal-gold'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>TAB B: Top 10 Bowlers Under Pressure</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-navy-700 text-text-muted">10</span>
        </button>
      </div>

      {/* Tab A Content: Top 10 Batters */}
      {activeTab === 'batters' && (
        <div className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-royal-pink">
              Top 10 Batting Clutch Leaders (Order 1 to 10)
            </h3>
            <span className="text-xs text-text-muted">Minimum 100 Pressure Balls Faced</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-600 text-text-muted uppercase text-[10px] tracking-wider bg-navy-900/60">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Player Name</th>
                  <th className="py-3 px-3">Team / ID</th>
                  <th className="py-3 px-3 text-center">Reliability Score</th>
                  <th className="py-3 px-3">Pressure SR</th>
                  <th className="py-3 px-3">Normal SR</th>
                  <th className="py-3 px-3">SR Diff (&Delta;)</th>
                  <th className="py-3 px-3">Pressure Runs</th>
                  <th className="py-3 px-3">Balls</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3">Empirical Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/60">
                {topBatters.map((b) => (
                  <tr key={b.player_id} className="hover:bg-navy-700/40 transition-colors">
                    <td className="py-3 px-3 font-black text-sm">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        b.rank === 1 ? 'bg-royal-gold text-navy-900 shadow' : (b.rank <= 3 ? 'bg-royal-pink text-white' : 'bg-navy-700 text-text-secondary')
                      }`}>
                        {b.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white text-sm">
                      {b.player_name}
                    </td>
                    <td className="py-3 px-3 text-text-muted">
                      {b.team_name} <span className="text-[10px] font-mono block">#{b.player_id}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-black text-sm text-royal-pink bg-royal-pink/10 px-2 py-0.5 rounded border border-royal-pink/20">
                        {b.reliability_score.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-white">{b.pressure_strike_rate.toFixed(1)}</td>
                    <td className="py-3 px-3 font-mono text-text-muted">{b.normal_strike_rate.toFixed(1)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-status-success">
                      +{b.strike_rate_improvement.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 font-bold text-royal-gold">{b.pressure_runs}</td>
                    <td className="py-3 px-3 text-text-secondary">{b.pressure_balls}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-status-success/15 text-status-success font-semibold border border-status-success/30">
                        {b.confidence_level}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-text-secondary max-w-xs leading-relaxed">
                      {b.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab B Content: Top 10 Bowlers */}
      {activeTab === 'bowlers' && (
        <div className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-royal-gold">
              Top 10 Bowling Clutch Leaders (Order 1 to 10)
            </h3>
            <span className="text-xs text-text-muted">Minimum 120 Pressure Legal Balls Bowled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-600 text-text-muted uppercase text-[10px] tracking-wider bg-navy-900/60">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Player Name</th>
                  <th className="py-3 px-3">Team / ID</th>
                  <th className="py-3 px-3 text-center">Reliability Score</th>
                  <th className="py-3 px-3">Pressure Economy</th>
                  <th className="py-3 px-3">Normal Economy</th>
                  <th className="py-3 px-3">Econ Control (&Delta;)</th>
                  <th className="py-3 px-3">Wickets</th>
                  <th className="py-3 px-3">Pressure Overs</th>
                  <th className="py-3 px-3">Dot Ball %</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3">Empirical Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/60">
                {topBowlers.map((bw) => (
                  <tr key={bw.player_id} className="hover:bg-navy-700/40 transition-colors">
                    <td className="py-3 px-3 font-black text-sm">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        bw.rank === 1 ? 'bg-royal-gold text-navy-900 shadow' : (bw.rank <= 3 ? 'bg-royal-pink text-white' : 'bg-navy-700 text-text-secondary')
                      }`}>
                        {bw.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white text-sm">
                      {bw.player_name}
                    </td>
                    <td className="py-3 px-3 text-text-muted">
                      {bw.team_name} <span className="text-[10px] font-mono block">#{bw.player_id}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-black text-sm text-royal-gold bg-royal-gold/10 px-2 py-0.5 rounded border border-royal-gold/20">
                        {bw.reliability_score.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-status-success">{bw.pressure_economy.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono text-text-muted">{bw.normal_economy.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-status-success">
                      {bw.economy_improvement >= 0 ? `-${Math.abs(bw.economy_improvement).toFixed(2)}` : `+${Math.abs(bw.economy_improvement).toFixed(2)}`} rpo
                    </td>
                    <td className="py-3 px-3 font-bold text-royal-pink">{bw.pressure_wickets}</td>
                    <td className="py-3 px-3 text-text-secondary">{bw.pressure_overs_display}</td>
                    <td className="py-3 px-3 font-mono text-text-secondary">{bw.pressure_dot_pct.toFixed(1)}%</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-status-success/15 text-status-success font-semibold border border-status-success/30">
                        {bw.confidence_level}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-text-secondary max-w-xs leading-relaxed">
                      {bw.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

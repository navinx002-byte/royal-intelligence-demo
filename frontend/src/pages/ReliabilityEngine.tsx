import React, { useState } from 'react';
import { Sliders, RefreshCw, Sparkles, ShieldCheck, HelpCircle, Check, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import { BatterRanking, BowlerRanking } from '../types';

export const ReliabilityEngine: React.FC = () => {
  // Batting weights
  const [batSrDiff, setBatSrDiff] = useState<number>(0.30);
  const [batSrPress, setBatSrPress] = useState<number>(0.25);
  const [batAvgPress, setBatAvgPress] = useState<number>(0.20);
  const [batVolume, setBatVolume] = useState<number>(0.15);
  const [batBoundary, setBatBoundary] = useState<number>(0.10);

  // Bowling weights
  const [bowlEconDiff, setBowlEconDiff] = useState<number>(0.25);
  const [bowlEconPress, setBowlEconPress] = useState<number>(0.25);
  const [bowlWkts, setBowlWkts] = useState<number>(0.25);
  const [bowlDot, setBowlDot] = useState<number>(0.15);
  const [bowlWktRate, setBowlWktRate] = useState<number>(0.10);

  // Results
  const [updatedBatters, setUpdatedBatters] = useState<BatterRanking[]>([]);
  const [updatedBowlers, setUpdatedBowlers] = useState<BowlerRanking[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleRecalculate = async () => {
    setIsCalculating(true);
    setStatusMessage('');
    try {
      const res = await api.runCustomAnalysis({
        bat_sr_diff: batSrDiff,
        bat_sr_press: batSrPress,
        bat_avg_press: batAvgPress,
        bat_volume: batVolume,
        bat_boundary: batBoundary,
        bowl_econ_diff: bowlEconDiff,
        bowl_econ_press: bowlEconPress,
        bowl_wkts: bowlWkts,
        bowl_dot: bowlDot,
        bowl_wkt_rate: bowlWktRate,
        min_bat_pressure_balls: 100,
        min_bowl_pressure_balls: 120
      });
      setUpdatedBatters(res.top_10_batters || []);
      setUpdatedBowlers(res.top_10_bowlers || []);
      setStatusMessage('Rankings recalculated successfully based on custom statistical weights.');
    } catch (err) {
      console.error("Recalculation error", err);
      setStatusMessage('Failed to recalculate rankings.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleResetDefaults = () => {
    setBatSrDiff(0.30);
    setBatSrPress(0.25);
    setBatAvgPress(0.20);
    setBatVolume(0.15);
    setBatBoundary(0.10);

    setBowlEconDiff(0.25);
    setBowlEconPress(0.25);
    setBowlWkts(0.25);
    setBowlDot(0.15);
    setBowlWktRate(0.10);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-royal-gold" />
          <span>Reliability Engine & Empirical Bayes Weighting</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Transparent multi-attribute scoring model. Adjust analytical component weights in real time to simulate alternative franchise recruitment priorities.
        </p>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 glass-panel p-4 rounded-xl border border-navy-600">
        <div className="text-xs text-text-secondary">
          <span className="font-bold text-white">Active Mathematical Model:</span> Empirical Bayesian Sample Shrinkage with Min-Max Linear Scalers
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-text-secondary text-xs border border-navy-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleRecalculate}
            disabled={isCalculating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-royal-pink to-royal-pink-light hover:brightness-110 text-white text-xs font-bold shadow-md shadow-royal-pink/25 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
            <span>Run Reliability Engine</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-status-success/15 border border-status-success/30 text-status-success text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Sliders Grid: Batting vs Bowling Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batting Weight Model */}
        <div className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-5">
          <div className="flex justify-between items-center border-b border-navy-700 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-royal-pink" />
                <span>Batting Reliability Weights</span>
              </h3>
              <p className="text-[11px] text-text-muted">Total sum: {((batSrDiff + batSrPress + batAvgPress + batVolume + batBoundary) * 100).toFixed(0)}%</p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-royal-pink/20 text-royal-pink border border-royal-pink/30">
              Min 100 Balls
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Strike Rate Elevation (&Delta;SR)</span>
                <span className="font-bold text-royal-pink">{(batSrDiff * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={batSrDiff}
                onChange={(e) => setBatSrDiff(parseFloat(e.target.value))}
                className="w-full accent-royal-pink cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Absolute Pressure Strike Rate</span>
                <span className="font-bold text-royal-pink">{(batSrPress * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={batSrPress}
                onChange={(e) => setBatSrPress(parseFloat(e.target.value))}
                className="w-full accent-royal-pink cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Pressure Batting Average</span>
                <span className="font-bold text-royal-pink">{(batAvgPress * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={batAvgPress}
                onChange={(e) => setBatAvgPress(parseFloat(e.target.value))}
                className="w-full accent-royal-pink cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Pressure Run Volume</span>
                <span className="font-bold text-royal-pink">{(batVolume * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={batVolume}
                onChange={(e) => setBatVolume(parseFloat(e.target.value))}
                className="w-full accent-royal-pink cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Boundary Contribution %</span>
                <span className="font-bold text-royal-pink">{(batBoundary * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.25"
                step="0.05"
                value={batBoundary}
                onChange={(e) => setBatBoundary(parseFloat(e.target.value))}
                className="w-full accent-royal-pink cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Bowling Weight Model */}
        <div className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-5">
          <div className="flex justify-between items-center border-b border-navy-700 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-royal-gold" />
                <span>Bowling Reliability Weights</span>
              </h3>
              <p className="text-[11px] text-text-muted">Total sum: {((bowlEconDiff + bowlEconPress + bowlWkts + bowlDot + bowlWktRate) * 100).toFixed(0)}%</p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-royal-gold/20 text-royal-gold border border-royal-gold/30">
              Min 120 Balls
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Economy Suppression (&Delta;Econ)</span>
                <span className="font-bold text-royal-gold">{(bowlEconDiff * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={bowlEconDiff}
                onChange={(e) => setBowlEconDiff(parseFloat(e.target.value))}
                className="w-full accent-royal-gold cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Pressure Economy Control</span>
                <span className="font-bold text-royal-gold">{(bowlEconPress * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={bowlEconPress}
                onChange={(e) => setBowlEconPress(parseFloat(e.target.value))}
                className="w-full accent-royal-gold cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Pressure Wickets Taken</span>
                <span className="font-bold text-royal-gold">{(bowlWkts * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={bowlWkts}
                onChange={(e) => setBowlWkts(parseFloat(e.target.value))}
                className="w-full accent-royal-gold cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Pressure Dot Ball %</span>
                <span className="font-bold text-royal-gold">{(bowlDot * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={bowlDot}
                onChange={(e) => setBowlDot(parseFloat(e.target.value))}
                className="w-full accent-royal-gold cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Wicket Rate per Over</span>
                <span className="font-bold text-royal-gold">{(bowlWktRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.25"
                step="0.05"
                value={bowlWktRate}
                onChange={(e) => setBowlWktRate(parseFloat(e.target.value))}
                className="w-full accent-royal-gold cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Ranking Simulation Results (if recalculated) */}
      {updatedBatters.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-navy-600">
            <h4 className="text-xs font-bold text-royal-pink uppercase tracking-wider mb-3">Simulated Top Batters</h4>
            <div className="space-y-2">
              {updatedBatters.slice(0, 5).map(b => (
                <div key={b.player_id} className="flex justify-between text-xs p-2 rounded-lg bg-navy-900 border border-navy-700">
                  <span className="text-white font-semibold">#{b.rank} {b.player_name}</span>
                  <span className="font-bold text-royal-pink">{b.reliability_score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-navy-600">
            <h4 className="text-xs font-bold text-royal-gold uppercase tracking-wider mb-3">Simulated Top Bowlers</h4>
            <div className="space-y-2">
              {updatedBowlers.slice(0, 5).map(bw => (
                <div key={bw.player_id} className="flex justify-between text-xs p-2 rounded-lg bg-navy-900 border border-navy-700">
                  <span className="text-white font-semibold">#{bw.rank} {bw.player_name}</span>
                  <span className="font-bold text-royal-gold">{bw.reliability_score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mathematical Foundation Box */}
      <div className="p-5 rounded-2xl bg-navy-800 border border-navy-600 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-status-success" />
          <span>Why Empirical Bayesian Shrinkage Matters</span>
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          In cricket analytics, players with small sample sizes frequently post extreme numbers (e.g. facing 12 balls and scoring 30 runs yields a 250 strike rate). 
          If ranked naively by raw differential, fringe players crowd out proven performers. 
          Our system applies a continuous shrinkage factor:
        </p>
        <div className="p-3 rounded-xl bg-navy-900 border border-navy-700 font-mono text-xs text-royal-gold inline-block">
          Shrinkage Factor (C) = N_pressure / (N_pressure + K_prior)
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Where <i>K_prior = 50</i> balls for batters and <i>60</i> balls for bowlers. As sample size grows, <i>C &rarr; 1.0</i>, unlocking full raw rating. 
          For low samples, the rating is compressed toward the population mean, preventing false positives.
        </p>
      </div>
    </div>
  );
};

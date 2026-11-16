import React, { useEffect, useState } from 'react';
import { Flame, Sliders, RefreshCw, BarChart2, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { api } from '../services/api';
import { PressureAnalytics } from '../types';

export const PressureLab: React.FC = () => {
  const [data, setData] = useState<PressureAnalytics | null>(null);
  const [rrrWeight, setRrrWeight] = useState<number>(5.0);
  const [wktMultiplier, setWktMultiplier] = useState<number>(3.0);
  const [deathStart, setDeathStart] = useState<number>(16);
  const [highCutoff, setHighCutoff] = useState<number>(65);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getPressureAnalytics();
        setData(res);
        if (res.config) {
          setRrrWeight(res.config.chase_rrr_weight);
          setWktMultiplier(res.config.wkt_stress_multiplier);
          setDeathStart(res.config.death_overs_start);
          setHighCutoff(res.config.high_pressure_cutoff);
        }
      } catch (err) {
        console.error("Failed to load pressure analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleApplyConfig = async () => {
    setIsUpdating(true);
    try {
      await api.runCustomAnalysis(undefined, {
        chase_rrr_weight: rrrWeight,
        wkt_stress_multiplier: wktMultiplier,
        death_overs_start: deathStart,
        crisis_over_limit: 6,
        high_pressure_cutoff: highCutoff,
        medium_pressure_cutoff: 40.0
      });
      const updated = await api.getPressureAnalytics();
      setData(updated);
    } catch (err) {
      console.error("Failed to update pressure thresholds", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-royal-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Phase breakdown data
  const phaseData = data?.phase_distribution || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Flame className="w-6 h-6 text-royal-pink" />
          <span>Pressure Lab & Situational Intelligence</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Investigate cricket pressure dynamics across chases and target-setting scenarios. Configure custom thresholds and test analytical sensitivity.
        </p>
      </div>

      {/* Threshold Control Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-royal-gold" />
            <span>Configurable Pressure Classification Parameters</span>
          </h3>
          <button
            onClick={handleApplyConfig}
            disabled={isUpdating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-royal-pink hover:brightness-110 text-white text-xs font-semibold shadow transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>Apply Custom Thresholds</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* RRR Weight Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary font-medium">RRR Leverage Weight</span>
              <span className="font-bold text-royal-pink">{rrrWeight.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="10.0"
              step="0.5"
              value={rrrWeight}
              onChange={(e) => setRrrWeight(parseFloat(e.target.value))}
              className="w-full accent-royal-pink cursor-pointer"
            />
            <p className="text-[10px] text-text-muted">Sensitivity to Required Run Rate acceleration above 6 RPO.</p>
          </div>

          {/* Wicket Multiplier Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary font-medium">Wicket Stress Multiplier</span>
              <span className="font-bold text-royal-gold">{wktMultiplier.toFixed(1)} pts/wkt</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="6.0"
              step="0.5"
              value={wktMultiplier}
              onChange={(e) => setWktMultiplier(parseFloat(e.target.value))}
              className="w-full accent-royal-gold cursor-pointer"
            />
            <p className="text-[10px] text-text-muted">Pressure penalty for each lost wicket (dwindling batting depth).</p>
          </div>

          {/* Death Phase Start Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary font-medium">Death Overs Start</span>
              <span className="font-bold text-status-warning">Over {deathStart}</span>
            </div>
            <input
              type="range"
              min="14"
              max="18"
              step="1"
              value={deathStart}
              onChange={(e) => setDeathStart(parseInt(e.target.value))}
              className="w-full accent-status-warning cursor-pointer"
            />
            <p className="text-[10px] text-text-muted">Innings stage where fielding restrictions and death bowling activate.</p>
          </div>

          {/* High Cutoff Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary font-medium">High Pressure Cutoff</span>
              <span className="font-bold text-status-success">&ge; {highCutoff} pts</span>
            </div>
            <input
              type="range"
              min="50"
              max="80"
              step="5"
              value={highCutoff}
              onChange={(e) => setHighCutoff(parseInt(e.target.value))}
              className="w-full accent-status-success cursor-pointer"
            />
            <p className="text-[10px] text-text-muted">Minimum combined score (0–100) to classify delivery as High Pressure.</p>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot: RRR vs Wickets in Hand */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-600">
          <h3 className="text-sm font-bold text-white mb-1">Chase Situation Map: RRR vs Wickets in Hand</h3>
          <p className="text-[11px] text-text-muted mb-4">Sample deliveries showing how pressure escalates with high RRR and falling wickets.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#283652" />
                <XAxis 
                  type="number" 
                  dataKey="rrr" 
                  name="Required Run Rate" 
                  unit=" rpo" 
                  stroke="#AAB6CC" 
                  fontSize={11}
                  domain={[4, 20]}
                />
                <YAxis 
                  type="number" 
                  dataKey="wickets_in_hand" 
                  name="Wickets in Hand" 
                  stroke="#AAB6CC" 
                  fontSize={11}
                  domain={[0, 10]}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#17243A', borderColor: '#283652', borderRadius: '8px', fontSize: '12px', color: '#F2F5FA' }}
                  itemStyle={{ color: '#F2F5FA' }}
                  labelStyle={{ color: '#F2F5FA', fontWeight: 600 }}
                />
                <Scatter name="High Pressure" data={data?.scatter_sample?.filter(s => s.pressure_tier === 'High')} fill="#E83E82" />
                <Scatter name="Medium Pressure" data={data?.scatter_sample?.filter(s => s.pressure_tier === 'Medium')} fill="#F59E0B" />
                <Scatter name="Low Pressure" data={data?.scatter_sample?.filter(s => s.pressure_tier === 'Low')} fill="#18B887" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-[11px] mt-2">
            <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-royal-pink" /> High Pressure</span>
            <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-status-warning" /> Medium Pressure</span>
            <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-status-success" /> Low Pressure</span>
          </div>
        </div>

        {/* Bar Chart: Innings Phase Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-600">
          <h3 className="text-sm font-bold text-white mb-1">Pressure Distribution Across Innings Phases</h3>
          <p className="text-[11px] text-text-muted mb-4">Delivery volume across Powerplay (1-6), Middle (7-15), and Death (16-20).</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phaseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#283652" vertical={false} />
                <XAxis dataKey="phase" stroke="#AAB6CC" fontSize={11} />
                <YAxis stroke="#AAB6CC" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#17243A', borderColor: '#283652', borderRadius: '8px', fontSize: '12px', color: '#F2F5FA' }}
                  itemStyle={{ color: '#F2F5FA' }}
                  labelStyle={{ color: '#F2F5FA', fontWeight: 600 }}
                />
                <Bar dataKey="High" name="High Pressure" fill="#E83E82" stackId="a" />
                <Bar dataKey="Medium" name="Medium Pressure" fill="#F59E0B" stackId="a" />
                <Bar dataKey="Low" name="Low Pressure" fill="#18B887" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-[11px] mt-2">
            <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-royal-pink" /> High</span>
            <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-status-warning" /> Medium</span>
            <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-status-success" /> Low</span>
          </div>
        </div>
      </div>

      {/* Innings Context Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-navy-800 border border-navy-600 space-y-2">
          <span className="text-xs font-bold text-royal-pink uppercase tracking-wider">Innings 1: Setting Target</span>
          <h4 className="text-sm font-bold text-white">Crisis Management & Death Acceleration</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            In the 1st innings, pressure is triggered by early top-order collapse (e.g. 3 wickets down inside Powerplay) 
            or death overs (overs 16–20) where batters must hit boundaries without throwing away wickets and bowlers 
            must hit yorker lengths with field up.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-800 border border-navy-600 space-y-2">
          <span className="text-xs font-bold text-royal-gold uppercase tracking-wider">Innings 2: The Chase</span>
          <h4 className="text-sm font-bold text-white">Dynamic RRR & Wickets-In-Hand Stress</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Chasing pressure is explicitly dynamic: RRR scales geometrically as legal balls expire. When a team needs 
            48 runs in the final 4 overs with 5 wickets down, every single dot ball increases pressure exponentially.
          </p>
        </div>
      </div>
    </div>
  );
};

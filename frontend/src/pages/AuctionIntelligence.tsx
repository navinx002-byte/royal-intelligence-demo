import React, { useEffect, useState } from 'react';
import { ShoppingBag, Sparkles, AlertCircle, ShieldAlert, Swords, Zap, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const AuctionIntelligence: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuctionData() {
      try {
        const res = await api.getAuctionIntelligence();
        setData(res);
      } catch (err) {
        console.error("Auction load error", err);
      } finally {
        setLoading(false);
      }
    }
    loadAuctionData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-royal-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const squadRoles = data?.squad_roles || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-royal-gold" />
          <span>Franchise Tactical & Auction Intelligence</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Evidence-driven squad-role profiling and value scouting tailored for Rajasthan Royals cricket operations.
        </p>
      </div>

      {/* Official Integrity Disclaimer */}
      <div className="p-4 rounded-xl bg-navy-800 border border-royal-gold/40 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-royal-gold flex-shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed">
          <span className="font-bold text-white">Compliance with Research Integrity Guidelines:</span>
          <p className="mt-0.5">
            This module operates strictly as <b>exploratory tactical decision support</b> based on actual match performance (2022–2026). 
            In adherence to official competition rules, this platform <b>never invents hypothetical auction purses, speculative bidding prices, or unconfirmed 2027 retention status</b>.
          </p>
        </div>
      </div>

      {/* Squad Role Archetypes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Finishers */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-600 space-y-3">
          <div className="flex items-center justify-between border-b border-navy-700 pb-2">
            <span className="text-xs font-bold text-royal-pink uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-royal-pink" />
              <span>Pressure Finishers (SR &ge; 190)</span>
            </span>
            <span className="text-[10px] text-text-muted">Death Clutch</span>
          </div>
          <div className="space-y-2">
            {(squadRoles['Finishers'] || []).map((b: any) => (
              <div key={b.player_id} className="p-2.5 rounded-xl bg-navy-900 border border-navy-700 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">{b.player_name}</span>
                  <span className="text-[10px] text-text-muted">{b.team_name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-royal-pink block">{b.pressure_strike_rate.toFixed(1)} SR</span>
                  <span className="text-[10px] text-status-success font-semibold">+{b.strike_rate_improvement.toFixed(1)} &Delta;</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Death Overs Bowlers */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-600 space-y-3">
          <div className="flex items-center justify-between border-b border-navy-700 pb-2">
            <span className="text-xs font-bold text-royal-gold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-royal-gold" />
              <span>Death Enforcers (25+ Wkts)</span>
            </span>
            <span className="text-[10px] text-text-muted">High Stress Wkts</span>
          </div>
          <div className="space-y-2">
            {(squadRoles['Death Overs Bowlers'] || []).map((bw: any) => (
              <div key={bw.player_id} className="p-2.5 rounded-xl bg-navy-900 border border-navy-700 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">{bw.player_name}</span>
                  <span className="text-[10px] text-text-muted">{bw.team_name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-royal-gold block">{bw.pressure_wickets} Wkts</span>
                  <span className="text-[10px] text-status-success font-semibold">{bw.pressure_economy.toFixed(2)} Econ</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Spinners */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-600 space-y-3">
          <div className="flex items-center justify-between border-b border-navy-700 pb-2">
            <span className="text-xs font-bold text-status-success uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-status-success" />
              <span>Control Spin Specialists</span>
            </span>
            <span className="text-[10px] text-text-muted">Tight Boundary Def</span>
          </div>
          <div className="space-y-2">
            {(squadRoles['Control Spinners'] || []).map((bw: any) => (
              <div key={bw.player_id} className="p-2.5 rounded-xl bg-navy-900 border border-navy-700 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">{bw.player_name}</span>
                  <span className="text-[10px] text-text-muted">{bw.team_name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-status-success block">{bw.pressure_economy.toFixed(2)} RPO</span>
                  <span className="text-[10px] text-text-secondary">{bw.pressure_dot_pct.toFixed(0)}% Dots</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Value Scouting Picks */}
      <div className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-royal-gold" />
              <span>High-Upside Value Prospects</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Players exhibiting high pressure rating differentials with developing sample sizes (potential high-ROI targets).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(data?.value_prospects || []).map((p: any) => (
            <div key={p.player_id} className="p-3.5 rounded-xl bg-navy-900 border border-navy-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="font-bold text-white text-xs">{p.player_name}</span>
                <span className="text-[10px] text-royal-pink font-mono font-bold">Score: {p.reliability_score}</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-snug">
                {p.reason}
              </p>
              <span className="inline-block text-[9px] uppercase px-1.5 py-0.5 rounded bg-royal-gold/15 text-royal-gold border border-royal-gold/20">
                {p.confidence_level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { BookOpen, Download, ShieldCheck, CheckCircle2, ChevronRight, Calculator, FileText } from 'lucide-react';
import { api } from '../services/api';

export const MethodologyResearch: React.FC = () => {
  const handleDownloadPDF = () => {
    window.open(api.getDownloadUrl('methodology_pdf'), '_blank');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-navy-700 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-royal-gold/15 text-royal-gold text-[10px] font-bold uppercase tracking-wider mb-2">
            <span>Research Whitepaper • Technical Specification</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Methodology & Mathematical Framework
          </h2>
          <p className="text-xs text-text-secondary mt-1 max-w-2xl">
            Complete, reproducible scientific methodology for the Rajasthan Royals SupeRR Selector Season 2 competition.
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-royal-pink to-royal-pink-light hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-royal-pink/25 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download Methodology PDF</span>
        </button>
      </div>

      {/* 1. Problem Statement & Theoretical Approach */}
      <section className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-royal-pink text-white flex items-center justify-center text-xs font-black">1</span>
          <span>Problem Statement & Analytical Challenge</span>
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Traditional cricket statistics—such as total runs, raw batting average, aggregate wickets, and overall economy rates—fail to isolate 
          situational leverage. A batter hitting boundaries when a team requires 20 runs from 40 balls exhibits superficial strength, whereas 
          scoring 35 off 16 when facing an exponential Required Run Rate is a transformative winning contribution. 
          The official objective is constructing an empirical system that distinguishes players whose output excels in high-pressure situations from those whose performance dips.
        </p>
      </section>

      {/* 2. Dataset Profiling and Technical Corrections */}
      <section className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-royal-gold text-navy-900 flex items-center justify-center text-xs font-black">2</span>
          <span>Data Ingestion, Schema Audits & Technical Discoveries</span>
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Analysis was performed on the official historical dataset covering 883 matches (IPL 2022–2026 and international T20Is) encompassing 200,999 valid deliveries. 
          Crucial technical corrections were applied during the ingestion pipeline:
        </p>
        <ul className="text-xs text-text-secondary space-y-2 list-disc list-inside bg-navy-900/60 p-4 rounded-xl border border-navy-700">
          <li>
            <b className="text-white">extras1_runs Deconstruction:</b> Our cross-tabulation established that <i>extras1_runs</i> in <i>ball_by_ball.csv</i> is an integer enum identifier (6 = None, 1 = Overstep, 2 = Wide, 3 = Legbyes, 4 = Byes, 5 = Other, 7 = Penalty). It is not an extra run count. Our system strictly ignores this column for scoring calculations.
          </li>
          <li>
            <b className="text-white">Bowler-Credited Wickets:</b> Run outs, retirements, and obstructing dismissals are strictly separated from bowler-credited wickets (Bowled, Caught, LBW, Stumped, Hit Wicket).
          </li>
          <li>
            <b className="text-white">Delivery Accounting:</b> Wides and Oversteps (No-balls) are classified as non-legal deliveries. Wides do not count toward a batter's balls faced.
          </li>
        </ul>
      </section>

      {/* 3. Mathematical Pressure Formulation */}
      <section className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-status-success text-white flex items-center justify-center text-xs font-black">3</span>
          <span>Mathematical Formulation of Cricket Pressure</span>
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Pressure is defined as a continuous score from 0 to 100 based on situational stress before each delivery.
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 space-y-2">
            <span className="text-xs font-bold text-royal-pink">Innings 2: The Chase Model</span>
            <div className="font-mono text-xs text-royal-gold bg-navy-800 p-2.5 rounded border border-navy-600 overflow-x-auto">
              Pressure_Chase = min(100, max(0, w_rrr &bull; (RRR - 5.0) + w_wkt &bull; (10 - W_hand) + Death_Phase + Closeness + Knockout))
            </div>
            <p className="text-[11px] text-text-secondary">
              Where RRR is Required Run Rate per over, W_hand is remaining wickets, Death_Phase activates for overs 16–20 (+4 pts per over), and Closeness adds +10 pts when &le;24 runs are required in final 2 overs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 space-y-2">
            <span className="text-xs font-bold text-royal-gold">Innings 1: Setting Target Model</span>
            <div className="font-mono text-xs text-royal-gold bg-navy-800 p-2.5 rounded border border-navy-600 overflow-x-auto">
              Pressure_Inn1 = min(100, max(10, max(Crisis_Stress, Death_Phase_Inn1) + Wkt_Stress_Death + Knockout))
            </div>
            <p className="text-[11px] text-text-secondary">
              Captures early top-order collapse (&ge;2 wickets in Powerplay triggers crisis scoring) and death phase acceleration (overs 16–20 base of 50–90 points).
            </p>
          </div>
        </div>
      </section>

      {/* 4. Empirical Bayesian Shrinkage & Scoring */}
      <section className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-royal-pink-light text-navy-900 flex items-center justify-center text-xs font-black">4</span>
          <span>Empirical Bayesian Shrinkage & Fair Comparison</span>
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          To prevent low-sample anomalies from topping rankings, raw performance indices are moderated by a continuous sample shrinkage function:
        </p>

        <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 text-center font-mono text-sm text-royal-gold">
          Reliability_Score = Raw_Score &times; [ N_pressure / (N_pressure + K_prior) ]
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-700 space-y-1">
            <span className="font-bold text-white block">Batting Model Component Weights</span>
            <ul className="text-text-secondary space-y-0.5 list-disc list-inside">
              <li>Strike Rate Elevation (&Delta;SR): <b>30%</b></li>
              <li>Absolute Pressure Strike Rate: <b>25%</b></li>
              <li>Pressure Batting Average: <b>20%</b></li>
              <li>Pressure Run Volume: <b>15%</b></li>
              <li>Boundary Percentage under pressure: <b>10%</b></li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-700 space-y-1">
            <span className="font-bold text-white block">Bowling Model Component Weights</span>
            <ul className="text-text-secondary space-y-0.5 list-disc list-inside">
              <li>Economy Suppression (&Delta;Econ): <b>25%</b></li>
              <li>Pressure Economy Control: <b>25%</b></li>
              <li>Pressure Wickets: <b>25%</b></li>
              <li>Pressure Dot Ball %: <b>15%</b></li>
              <li>Wicket Rate per Over: <b>10%</b></li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Reproducibility & Limitations */}
      <section className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-navy-500 text-white flex items-center justify-center text-xs font-black">5</span>
          <span>Model Reproducibility & Known Limitations</span>
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          The entire analytical calculation is deterministically reproducible from the supplied CSV datasets. 
          Known analytical boundaries include:
          <br/>• Venue boundary geometry and surface degradation vary across stadiums.
          <br/>• International matches feature varied opposition ranking tiers, balanced by our equal-delivery weighting approach.
        </p>
      </section>
    </div>
  );
};

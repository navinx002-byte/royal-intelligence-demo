import React from 'react';
import { Sparkles, Trophy, ArrowRight, ShieldCheck, Flame, BookOpen, BarChart3, Target } from 'lucide-react';

interface WelcomeProps {
  onExplore: () => void;
  onMethodology: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onExplore, onMethodology }) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center text-center px-4 py-12 overflow-hidden">
      {/* Stadium Atmospheric Lighting Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-royal-pink/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[250px] bg-royal-gold/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Competition Badge */}
      <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-navy-800/90 border border-royal-pink/40 shadow-lg shadow-royal-pink/10 mb-8 backdrop-blur-md">
        <Trophy className="w-4 h-4 text-royal-gold animate-bounce" />
        <span className="text-xs font-bold tracking-widest text-royal-pink-light uppercase">
          Rajasthan Royals • SupeRR Selector Season 2 • Round 1
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-tight sm:leading-none mb-6">
        BEYOND STATISTICS. <br />
        <span className="bg-gradient-to-r from-royal-pink via-royal-pink-light to-royal-gold bg-clip-text text-transparent">
          DISCOVERING PRESSURE PERFORMERS.
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-base sm:text-xl text-text-secondary max-w-3xl leading-relaxed mb-10">
        An evidence-driven cricket intelligence platform that measures how batters and bowlers perform in 
        high-pressure match situations compared with their usual performance levels — identifying who genuinely rises 
        when the game is on the line.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
        <button
          onClick={onExplore}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-royal-pink to-royal-pink-light hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-royal-pink/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
        >
          <span>Explore Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onMethodology}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-text-primary border border-navy-600 hover:border-royal-gold font-semibold text-sm flex items-center justify-center space-x-2 transition-all"
        >
          <BookOpen className="w-4 h-4 text-royal-gold" />
          <span>View Methodology Report</span>
        </button>
      </div>

      {/* The Core Problem & Architectural Foundations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
        <div className="glass-panel p-6 rounded-2xl border border-navy-600 hover:border-royal-pink/50 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-600 flex items-center justify-center text-royal-pink mb-4 group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">The Pressure Dilemma</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Conventional cricket metrics reward raw volume — runs scored against weak attacks or boundaries hit in dead rubbers. 
            We isolate true high-stress deliveries to unmask match-winners.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-navy-600 hover:border-royal-gold/50 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-600 flex items-center justify-center text-royal-gold mb-4 group-hover:scale-110 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Dual-Innings Context</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Pressure is not solely chase death overs. We mathematically model 1st innings early collapses (crisis mitigation) 
            alongside 2nd innings Required Run Rate spikes and dwindling wickets.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-navy-600 hover:border-status-success/50 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-600 flex items-center justify-center text-status-success mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Empirical Bayesian Shrinkage</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            No small-sample illusions. Outlier performances on small delivery samples are penalized through statistical shrinkage, 
            ensuring rankings reflect durable reliability.
          </p>
        </div>
      </div>
    </div>
  );
};

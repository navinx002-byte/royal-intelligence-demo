import React from 'react';
import { Search, Filter, Download, Activity, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface TopNavProps {
  collapsed: boolean;
  activePageTitle: string;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  selectedCompetition: string;
  setSelectedCompetition: (c: string) => void;
  selectedSeason: string;
  setSelectedSeason: (s: string) => void;
  competitions: any[];
  seasons: string[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  collapsed,
  activePageTitle,
  globalSearch,
  setGlobalSearch,
  selectedCompetition,
  setSelectedCompetition,
  selectedSeason,
  setSelectedSeason,
  competitions,
  seasons,
  onRefresh,
  isRefreshing = false
}) => {
  const handleExportPDF = () => {
    window.open(api.getDownloadUrl('methodology_pdf'), '_blank');
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-20 border-b border-navy-600 bg-navy-800/90 backdrop-blur-md px-6 flex items-center justify-between transition-all duration-300 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Page Title & Status */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-base font-bold text-text-primary tracking-wide flex items-center gap-2">
            <span>{activePageTitle}</span>
          </h1>
          <div className="flex items-center space-x-2 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1 text-status-success font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
              Live Analytical Engine
            </span>
            <span>•</span>
            <span>883 Matches Verified</span>
          </div>
        </div>
      </div>

      {/* Global Controls & Filters */}
      <div className="flex items-center space-x-3">
        {/* Global Search */}
        <div className="relative w-48 lg:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search players (e.g. Rinku, Bumrah)..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-navy-900 border border-navy-600 rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-royal-pink transition-colors"
          />
        </div>

        {/* Competition Filter */}
        <div className="hidden md:flex items-center space-x-1.5 bg-navy-900 border border-navy-600 rounded-lg px-2 py-1">
          <Filter className="w-3.5 h-3.5 text-royal-gold" />
          <select
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
            className="bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer max-w-[130px] truncate"
          >
            <option value="All" className="bg-navy-800 text-white">All Formats</option>
            <option value="IPL" className="bg-navy-800 text-white">IPL Leagues Only</option>
            <option value="T20I" className="bg-navy-800 text-white">T20 Internationals</option>
          </select>
        </div>

        {/* Season Filter */}
        <div className="hidden md:flex items-center space-x-1.5 bg-navy-900 border border-navy-600 rounded-lg px-2 py-1">
          <span className="text-[11px] font-semibold text-text-muted">Yr:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-navy-800 text-white">All (2022–2026)</option>
            {seasons.map((s) => (
              <option key={s} value={s} className="bg-navy-800 text-white">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Analysis */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg border border-navy-600 bg-navy-900 text-text-secondary hover:text-white hover:border-royal-gold transition-colors"
            title="Recalculate Analysis"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-royal-gold' : ''}`} />
          </button>
        )}

        {/* Export Report Action */}
        <button
          onClick={handleExportPDF}
          className="flex items-center space-x-2 bg-gradient-to-r from-royal-pink to-royal-pink-light hover:brightness-110 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-royal-pink/25 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { FileDown, FileText, CheckCircle2, Download, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export const FinalReports: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<string>('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateStatus('');
    try {
      const res = await api.generateReports();
      setGenerateStatus('All competition deliverables generated successfully on server.');
    } catch (err) {
      console.error("Report generation error", err);
      setGenerateStatus('Failed to generate reports.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (type: 'methodology_pdf' | 'batters_csv' | 'bowlers_csv') => {
    window.open(api.getDownloadUrl(type), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <FileDown className="w-6 h-6 text-royal-pink" />
          <span>Final Deliverables & Report Centre</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Export verified competition deliverables formatted for the Rajasthan Royals SupeRR Selector Season 2 review committee.
        </p>
      </div>

      {/* Generator Trigger Card */}
      <div className="glass-panel p-6 rounded-2xl border border-navy-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-success/15 text-status-success text-[10px] font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready for Generation</span>
          </div>
          <h3 className="text-base font-bold text-white">Generate Official Deliverable Bundle</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Produces ReportLab PDF methodology documentation and validated CSV rankings.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-royal-pink to-royal-pink-light hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-royal-pink/25 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating PDFs...' : 'Re-Generate Deliverables'}</span>
        </button>
      </div>

      {generateStatus && (
        <div className="p-3.5 rounded-xl bg-status-success/15 border border-status-success/30 text-status-success text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{generateStatus}</span>
        </div>
      )}

      {/* Deliverable Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF Methodology Report */}
        <div className="glass-panel p-6 rounded-2xl border border-navy-600 flex flex-col justify-between space-y-4 hover:border-royal-pink/60 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-royal-pink/20 text-royal-pink flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-royal-pink tracking-wider">Mandatory Deliverable 2</span>
            <h4 className="text-base font-bold text-white">Official Methodology Report</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Complete publication-quality PDF report containing executive summary, mathematical formulas, sample-size shrinkage treatment, and Top-10 explanations.
            </p>
          </div>
          <button
            onClick={() => handleDownload('methodology_pdf')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-royal-pink text-white text-xs font-bold border border-navy-700 hover:border-royal-pink transition-all shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Methodology PDF</span>
          </button>
        </div>

        {/* Top Batters CSV */}
        <div className="glass-panel p-6 rounded-2xl border border-navy-600 flex flex-col justify-between space-y-4 hover:border-royal-gold/60 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-royal-gold/20 text-royal-gold flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-royal-gold tracking-wider">Mandatory Deliverable 1A</span>
            <h4 className="text-base font-bold text-white">Top 10 Batters (CSV)</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Ranked 1 to 10 list of the most reliable batters under pressure with player IDs, reliability scores, and empirical justifications for Unstop dropdown entry.
            </p>
          </div>
          <button
            onClick={() => handleDownload('batters_csv')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-royal-gold hover:text-navy-900 text-white text-xs font-bold border border-navy-700 hover:border-royal-gold transition-all shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Batters CSV</span>
          </button>
        </div>

        {/* Top Bowlers CSV */}
        <div className="glass-panel p-6 rounded-2xl border border-navy-600 flex flex-col justify-between space-y-4 hover:border-status-success/60 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-status-success/20 text-status-success flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-status-success tracking-wider">Mandatory Deliverable 1B</span>
            <h4 className="text-base font-bold text-white">Top 10 Bowlers (CSV)</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Ranked 1 to 10 list of the most reliable bowlers under pressure with player IDs, pressure economy, wickets, and empirical justifications for Unstop dropdown entry.
            </p>
          </div>
          <button
            onClick={() => handleDownload('bowlers_csv')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-status-success hover:text-navy-900 text-white text-xs font-bold border border-navy-700 hover:border-status-success transition-all shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Bowlers CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};

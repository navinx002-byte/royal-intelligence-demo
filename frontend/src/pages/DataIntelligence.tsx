import React, { useEffect, useState } from 'react';
import { Database, Search, AlertTriangle, CheckCircle, FileText, Download, Table as TableIcon } from 'lucide-react';
import { api } from '../services/api';
import { DataQuality, DatasetSummary } from '../types';

export const DataIntelligence: React.FC = () => {
  const [quality, setQuality] = useState<DataQuality | null>(null);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('ball_by_ball');
  const [searchDict, setSearchDict] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [q, s] = await Promise.all([
          api.getDatasetQuality(),
          api.getDatasetSummary()
        ]);
        setQuality(q);
        setSummary(s);
      } catch (err) {
        console.error("Failed to load dataset intelligence", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-royal-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const files = quality?.files_checked || {};
  const currentFileInfo = files[selectedTable] || { rows: 0, columns: 0, memory_mb: 0, columns_list: [] };
  const missingForTable = quality?.missing_values?.[selectedTable] || {};

  const filteredDict = Object.entries(quality?.data_dictionary || {}).filter(([k, v]) => 
    k.toLowerCase().includes(searchDict.toLowerCase()) || v.toLowerCase().includes(searchDict.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Data Intelligence & Verification</h2>
          <p className="text-xs text-text-secondary mt-1">
            Schema audit, completeness validation, and data dictionary across all 6 supplied competition datasets.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-success/15 border border-status-success/30 text-status-success text-xs font-bold">
          <CheckCircle className="w-4 h-4" />
          <span>Status: {quality?.validation_status}</span>
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(files).map(([key, info]) => {
          const isSelected = selectedTable === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedTable(key)}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-navy-700 border-royal-pink shadow-lg shadow-royal-pink/20'
                  : 'bg-navy-800 border-navy-600 hover:border-navy-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white truncate max-w-[100px]">{key}.csv</span>
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-royal-pink' : 'bg-status-success'}`} />
              </div>
              <p className="text-lg font-black text-white mt-1.5">{info.rows.toLocaleString()}</p>
              <span className="text-[10px] text-text-secondary">{info.columns} cols • {info.memory_mb} MB</span>
            </button>
          );
        })}
      </div>

      {/* Selected Table Inspection */}
      <div className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-700 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-royal-gold" />
              <span>Inspection: {selectedTable}.csv</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {currentFileInfo.rows.toLocaleString()} total records • {currentFileInfo.columns} columns • {currentFileInfo.memory_mb} MB in-memory footprint
            </p>
          </div>
          <span className="text-xs text-status-success font-semibold px-2.5 py-1 rounded-md bg-status-success/10 border border-status-success/20">
            Validated Foreign Keys
          </span>
        </div>

        {/* Columns & Missing Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold text-royal-gold uppercase tracking-wider mb-2">Column Schema ({currentFileInfo.columns})</h4>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-3 rounded-xl bg-navy-900 border border-navy-700">
              {currentFileInfo.columns_list.map((col: string) => (
                <span key={col} className="text-[11px] px-2 py-0.5 rounded bg-navy-800 border border-navy-600 text-text-secondary font-mono">
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-royal-gold uppercase tracking-wider mb-2">Null / Missing Value Report</h4>
            <div className="max-h-48 overflow-y-auto p-3 rounded-xl bg-navy-900 border border-navy-700">
              {Object.keys(missingForTable).length === 0 ? (
                <p className="text-xs text-status-success flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>No missing values found in {selectedTable}.csv (100% complete).</span>
                </p>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(missingForTable).map(([col, count]) => (
                    <div key={col} className="flex justify-between text-xs py-0.5 border-b border-navy-800">
                      <span className="font-mono text-text-primary">{col}</span>
                      <span className="text-text-muted">{count.toLocaleString()} nulls ({((count / currentFileInfo.rows) * 100).toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Data Verification Notice */}
      <div className="p-4 rounded-xl bg-royal-pink/10 border border-royal-pink/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-royal-pink flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold text-white">Critical Data Hygiene Discovery: extras1_runs Enum Verification</span>
          <p className="text-text-secondary mt-1">
            Our audit established that <b>extras1_runs</b> in <i>ball_by_ball.csv</i> is an integer category ID (6 = Normal delivery, 1 = Overstep, 2 = Wide, 3 = Legbyes, 4 = Byes, 5 = Other, 7 = Penalty). 
            It is <b>NOT</b> extra runs. Naive summation of this column adds 6 runs to every normal ball. Our system strictly ignores this enum for score calculations, ensuring 100% accurate match totals.
          </p>
        </div>
      </div>

      {/* Data Dictionary */}
      <div className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-royal-gold" />
              <span>Official Data Dictionary</span>
            </h3>
            <p className="text-xs text-text-secondary">Detailed cricket definitions and semantics for essential dataset columns.</p>
          </div>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search field definition..."
              value={searchDict}
              onChange={(e) => setSearchDict(e.target.value)}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg pl-9 pr-3 py-1 text-xs text-text-primary focus:outline-none focus:border-royal-pink"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {filteredDict.map(([field, desc]) => (
            <div key={field} className="p-3 rounded-xl bg-navy-900/70 border border-navy-700/80">
              <span className="font-mono text-xs font-bold text-royal-pink-light">{field}</span>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

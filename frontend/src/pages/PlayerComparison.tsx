import React, { useEffect, useState } from 'react';
import { GitCompare, Plus, X, Search, ShieldCheck, Swords, Trophy, Sparkles } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
import { api } from '../services/api';

const DEFAULT_PLAYERS = [
  { id: 4897, name: 'Rinku Singh' },
  { id: 6396, name: 'Tim David' },
  { id: 2933, name: 'Jasprit Bumrah' }
];

export const PlayerComparison: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([4897, 6396]);
  const [comparison, setComparison] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadComparison() {
      if (selectedIds.length < 2) return;
      setLoading(true);
      try {
        const res = await api.comparePlayers(selectedIds);
        setComparison(res.players || []);
      } catch (err) {
        console.error("Comparison load error", err);
      } finally {
        setLoading(false);
      }
    }
    loadComparison();
  }, [selectedIds]);

  const handleSearch = async (val: string) => {
    setSearchTerm(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.getPlayers(val, 'All', 8);
      setSearchResults(res.players || []);
    } catch (err) {
      console.error("Search error", err);
    }
  };

  const handleAddPlayer = (pid: number) => {
    if (selectedIds.length >= 4) return;
    if (!selectedIds.includes(pid)) {
      setSelectedIds([...selectedIds, pid]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemovePlayer = (pid: number) => {
    if (selectedIds.length <= 2) return;
    setSelectedIds(selectedIds.filter(id => id !== pid));
  };

  // Build Radar Data
  const radarCategories = [
    { key: 'pressure_sr', label: 'Pressure SR' },
    { key: 'pressure_avg', label: 'Pressure Avg' },
    { key: 'pressure_control', label: 'Econ Control' },
    { key: 'consistency', label: 'Consistency' },
    { key: 'boundary_power', label: 'Boundary %' },
    { key: 'wicket_threat', label: 'Wicket Threat' },
  ];

  const radarData = radarCategories.map(cat => {
    const row: any = { subject: cat.label };
    comparison.forEach((p, idx) => {
      row[p.player_name] = p.radar_metrics?.[cat.key] || 0;
    });
    return row;
  });

  const playerColors = ['#E83E82', '#D6AD62', '#18B887', '#3B82F6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-royal-pink" />
          <span>Multi-Player Pressure Head-to-Head</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Direct statistical comparison of clutch performers across boundary elevation, run restriction, and match consistency.
        </p>
      </div>

      {/* Selected Players Tags & Search Selector */}
      <div className="glass-panel p-4 rounded-xl border border-navy-600 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-text-muted uppercase">Selected Players ({selectedIds.length}/4):</span>
        {comparison.map((p, idx) => (
          <div
            key={p.player_id}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-navy-900 border border-navy-700 text-xs text-white"
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: playerColors[idx] }} />
            <span className="font-semibold">{p.player_name}</span>
            {selectedIds.length > 2 && (
              <button
                onClick={() => handleRemovePlayer(p.player_id)}
                className="hover:text-status-danger"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {selectedIds.length < 4 && (
          <div className="relative">
            <input
              type="text"
              placeholder="+ Add player to compare..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-1 text-xs text-text-primary focus:outline-none focus:border-royal-pink w-48"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 w-64 bg-navy-800 border border-navy-600 rounded-xl shadow-2xl z-40 max-h-48 overflow-y-auto">
                {searchResults.map((r) => (
                  <div
                    key={r.player_id}
                    onClick={() => handleAddPlayer(r.player_id)}
                    className="p-2 hover:bg-navy-700 cursor-pointer text-xs flex justify-between items-center text-white border-b border-navy-700/50"
                  >
                    <span>{r.player_name}</span>
                    <span className="text-[10px] text-royal-gold">{r.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Radar Comparison Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-navy-600">
        <h3 className="text-sm font-bold text-white mb-1">Clutch Performance Radar Matrix</h3>
        <p className="text-[11px] text-text-muted mb-4">Multi-dimensional view comparing pressure scoring, control, power, and consistency.</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#283652" />
              <PolarAngleAxis dataKey="subject" stroke="#AAB6CC" fontSize={11} />
              <PolarRadiusAxis stroke="#283652" angle={30} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#17243A', borderColor: '#283652', borderRadius: '8px', fontSize: '12px', color: '#F2F5FA' }}
                itemStyle={{ color: '#F2F5FA' }}
                labelStyle={{ color: '#F2F5FA', fontWeight: 600 }}
              />
              <Legend />
              {comparison.map((p, idx) => (
                <Radar
                  key={p.player_name}
                  name={p.player_name}
                  dataKey={p.player_name}
                  stroke={playerColors[idx]}
                  fill={playerColors[idx]}
                  fillOpacity={0.25}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="glass-panel p-6 rounded-2xl border border-navy-600 space-y-4">
        <h3 className="text-base font-bold text-white">Side-by-Side Detailed Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-600 text-text-muted uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Metric</th>
                {comparison.map((p, idx) => (
                  <th key={p.player_id} className="py-2.5 px-3">
                    <span className="flex items-center gap-1.5 font-bold text-white">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: playerColors[idx] }} />
                      {p.player_name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              <tr>
                <td className="py-2.5 px-3 text-text-secondary font-medium">Franchise / Team</td>
                {comparison.map((p) => (
                  <td key={p.player_id} className="py-2.5 px-3 font-semibold text-white">{p.team_name}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-text-secondary font-medium">Official Reliability Score</td>
                {comparison.map((p) => (
                  <td key={p.player_id} className="py-2.5 px-3 font-bold text-royal-pink">
                    {p.bat_rank ? `Bat: ${p.bat_rank.reliability_score}` : (p.bowl_rank ? `Bowl: ${p.bowl_rank.reliability_score}` : 'Developing')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-text-secondary font-medium">Pressure Strike Rate</td>
                {comparison.map((p) => (
                  <td key={p.player_id} className="py-2.5 px-3 font-mono text-royal-gold">
                    {p.batting ? `${p.batting.sr_press}` : 'N/A (Bowler)'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-text-secondary font-medium">SR Differential (&Delta;SR)</td>
                {comparison.map((p) => (
                  <td key={p.player_id} className="py-2.5 px-3 font-mono text-status-success font-bold">
                    {p.batting ? `+${p.batting.sr_diff}` : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-text-secondary font-medium">Pressure Economy Rate</td>
                {comparison.map((p) => (
                  <td key={p.player_id} className="py-2.5 px-3 font-mono text-status-success">
                    {p.bowling ? `${p.bowling.econ_press} rpo` : 'N/A (Batter)'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-text-secondary font-medium">Pressure Sample Size</td>
                {comparison.map((p) => (
                  <td key={p.player_id} className="py-2.5 px-3 text-text-secondary">
                    {p.batting ? `${p.batting.press_balls} Balls` : `${p.bowling?.press_legal_balls} Balls`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-text-secondary font-medium">Confidence Level</td>
                {comparison.map((p) => (
                  <td key={p.player_id} className="py-2.5 px-3 font-semibold text-royal-gold">
                    {p.bat_rank?.confidence_level || p.bowl_rank?.confidence_level || 'Medium'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

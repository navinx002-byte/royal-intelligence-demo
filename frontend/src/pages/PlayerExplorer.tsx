import React, { useEffect, useState } from 'react';
import { Users, Search, Filter, ShieldCheck, ArrowUpRight, Flame } from 'lucide-react';
import { api } from '../services/api';
import { PlayerCardData } from '../types';

export const PlayerExplorer: React.FC = () => {
  const [players, setPlayers] = useState<PlayerCardData[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      try {
        const res = await api.getPlayers(search, selectedRole, 48, 0);
        setPlayers(res.players || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error("Failed to fetch players", err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetchPlayers, 250);
    return () => clearTimeout(timer);
  }, [search, selectedRole]);

  const handleOpenPlayer = async (pid: number) => {
    try {
      const p = await api.getPlayerDetails(pid);
      setSelectedPlayer(p);
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to load player", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-royal-gold" />
          <span>Player Intelligence Database</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Explore individual pressure scores, baselines, and reliability ratings for players across the 2022–2026 database.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 glass-panel p-4 rounded-xl border border-navy-600">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search player name or franchise team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-900 border border-navy-600 rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary focus:outline-none focus:border-royal-pink"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-royal-gold" />
          {['All', 'Batter', 'Bowler', 'All-Rounder'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedRole === r
                  ? 'bg-royal-pink text-white shadow'
                  : 'bg-navy-900 text-text-secondary hover:text-white border border-navy-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-royal-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-12 text-xs text-text-muted">
          No players found matching "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {players.map((p) => {
            const isHighReliability = p.reliability_score >= 60;
            return (
              <div
                key={p.player_id}
                onClick={() => handleOpenPlayer(p.player_id)}
                className="glass-panel p-4 rounded-xl border border-navy-600 hover:border-royal-pink cursor-pointer transition-all hover:-translate-y-0.5 group space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-royal-pink-light transition-colors truncate max-w-[170px]">
                      {p.player_name}
                    </h4>
                    <p className="text-[10px] text-text-muted truncate max-w-[170px]">
                      {p.team_name} • ID {p.player_id}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-navy-900 border border-navy-700 text-royal-gold">
                    {p.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-navy-700/60">
                  <div>
                    <span className="text-text-muted block text-[10px]">Career Matches</span>
                    <span className="font-semibold text-white">{p.matches}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">Sample</span>
                    <span className="font-semibold text-text-secondary">{p.press_balls} Press Balls</span>
                  </div>
                  {p.role === 'Bowler' ? (
                    <>
                      <div>
                        <span className="text-text-muted block text-[10px]">Wickets</span>
                        <span className="font-semibold text-royal-pink">{p.wickets}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px]">Economy</span>
                        <span className="font-semibold text-status-success">{p.economy}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-text-muted block text-[10px]">Runs</span>
                        <span className="font-semibold text-royal-pink">{p.runs}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px]">Strike Rate</span>
                        <span className="font-semibold text-royal-gold">{p.strike_rate}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-navy-700/60">
                  <div className="text-[10px] text-text-secondary">
                    Reliability Index: <span className="font-bold text-white">{p.reliability_score > 0 ? p.reliability_score : 'Developing'}</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-royal-pink transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drill-down Modal */}
      {modalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-800 border border-navy-600 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-navy-700 pb-3">
              <div>
                <h3 className="text-xl font-black text-white">{selectedPlayer.player_name}</h3>
                <p className="text-xs text-royal-gold">{selectedPlayer.team_name} • Player ID: {selectedPlayer.player_id}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-navy-700 hover:bg-navy-600 text-xs text-text-secondary"
              >
                Close
              </button>
            </div>

            {selectedPlayer.batting && (
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 space-y-2">
                <span className="text-xs font-bold text-royal-pink uppercase">Batting Pressure Profile</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>Pressure SR: <b className="text-white">{selectedPlayer.batting.sr_press}</b></div>
                  <div>Normal SR: <b className="text-text-secondary">{selectedPlayer.batting.sr_norm}</b></div>
                  <div>Elevation: <b className="text-status-success">+{selectedPlayer.batting.sr_diff}</b></div>
                  <div>Pressure Runs: <b className="text-royal-gold">{selectedPlayer.batting.press_runs}</b></div>
                </div>
              </div>
            )}

            {selectedPlayer.bowling && (
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 space-y-2">
                <span className="text-xs font-bold text-royal-gold uppercase">Bowling Pressure Profile</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>Pressure Econ: <b className="text-status-success">{selectedPlayer.bowling.econ_press}</b></div>
                  <div>Normal Econ: <b className="text-text-secondary">{selectedPlayer.bowling.econ_norm}</b></div>
                  <div>Control: <b className="text-status-success">{selectedPlayer.bowling.econ_diff}</b></div>
                  <div>Pressure Wkts: <b className="text-royal-pink">{selectedPlayer.bowling.press_bowler_wkts}</b></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Database, 
  Flame, 
  Swords, 
  ShieldAlert, 
  Sliders, 
  Users, 
  GitCompare, 
  Trophy, 
  ShoppingBag, 
  BookOpen, 
  FileDown,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const navItems = [
  { id: 'welcome', label: '01. Welcome', short: 'Welcome', icon: Home },
  { id: 'overview', label: '02. Executive Overview', short: 'Overview', icon: LayoutDashboard },
  { id: 'data', label: '03. Data Intelligence', short: 'Datasets', icon: Database },
  { id: 'pressure', label: '04. Pressure Lab', short: 'Pressure Lab', icon: Flame },
  { id: 'batting', label: '05. Batting Analytics', short: 'Batting', icon: Swords },
  { id: 'bowling', label: '06. Bowling Analytics', short: 'Bowling', icon: ShieldAlert },
  { id: 'reliability', label: '07. Reliability Engine', short: 'Reliability', icon: Sliders },
  { id: 'players', label: '08. Player Explorer', short: 'Players', icon: Users },
  { id: 'comparison', label: '09. Player Comparison', short: 'Compare', icon: GitCompare },
  { id: 'rankings', label: '10. Top 10 Rankings', short: 'Top 10', icon: Trophy, badge: 'Official' },
  { id: 'auction', label: '11. Auction Intelligence', short: 'Auction', icon: ShoppingBag },
  { id: 'methodology', label: '12. Methodology & Research', short: 'Methodology', icon: BookOpen },
  { id: 'reports', label: '13. Final Reports', short: 'Reports', icon: FileDown },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 transition-all duration-300 flex flex-col bg-navy-800 border-r border-navy-600 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-navy-600">
        {!collapsed ? (
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActivePage('welcome')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-royal-pink to-royal-gold flex items-center justify-center shadow-lg shadow-royal-pink/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-sm bg-gradient-to-r from-white via-royal-pink-light to-royal-gold bg-clip-text text-transparent">
                ROYAL INTELLIGENCE
              </span>
              <p className="text-[10px] text-text-secondary tracking-widest uppercase">
                SupeRR Selector S2
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-lg bg-gradient-to-br from-royal-pink to-royal-gold flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-text-secondary hover:text-white hover:bg-navy-700 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-royal-pink text-white shadow-md shadow-royal-pink/30 font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-navy-700/60'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform ${
                  isActive ? 'text-white scale-110' : 'text-text-secondary group-hover:text-royal-pink-light'
                }`}
              />
              {!collapsed && (
                <span className="ml-3 truncate tracking-tight text-[13px]">
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-royal-gold text-navy-900 shadow">
                  {item.badge}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-navy-700 text-white text-xs rounded-md shadow-xl border border-navy-500 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-navy-600 bg-navy-900/60 text-center">
        {!collapsed ? (
          <div className="text-[11px] text-text-muted">
            <span className="text-status-success font-semibold">● 200,999 Deliveries</span>
            <div className="text-[10px] mt-0.5 text-text-secondary">IPL & T20I (2022–2026)</div>
          </div>
        ) : (
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-success"></span>
        )}
      </div>
    </aside>
  );
};

import React, { useState, useEffect } from 'react';
import { Sidebar, navItems } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Welcome } from './pages/Welcome';
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { DataIntelligence } from './pages/DataIntelligence';
import { PressureLab } from './pages/PressureLab';
import { BattingAnalytics } from './pages/BattingAnalytics';
import { BowlingAnalytics } from './pages/BowlingAnalytics';
import { ReliabilityEngine } from './pages/ReliabilityEngine';
import { PlayerExplorer } from './pages/PlayerExplorer';
import { PlayerComparison } from './pages/PlayerComparison';
import { Top10Rankings } from './pages/Top10Rankings';
import { AuctionIntelligence } from './pages/AuctionIntelligence';
import { MethodologyResearch } from './pages/MethodologyResearch';
import { FinalReports } from './pages/FinalReports';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('welcome');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  // Global filter state
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [c, s] = await Promise.all([
          api.getCompetitions(),
          api.getSeasons()
        ]);
        setCompetitions(c || []);
        setSeasons(s || []);
      } catch (err) {
        console.error("Meta load error", err);
      }
    }
    loadMeta();
  }, []);

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    try {
      await api.runCustomAnalysis();
    } catch (err) {
      console.error("Refresh error", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const activeNavItem = navItems.find((item) => item.id === activePage);
  const activeTitle = activeNavItem ? activeNavItem.label : 'Royal Intelligence';

  return (
    <div className="min-h-screen bg-navy-900 text-text-primary flex">
      {/* Premium Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Navigation */}
        <TopNav
          collapsed={sidebarCollapsed}
          activePageTitle={activeTitle}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          selectedCompetition={selectedCompetition}
          setSelectedCompetition={setSelectedCompetition}
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}
          competitions={competitions}
          seasons={seasons}
          onRefresh={handleGlobalRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 mt-16 p-6 overflow-y-auto">
          {activePage === 'welcome' && (
            <Welcome
              onExplore={() => setActivePage('overview')}
              onMethodology={() => setActivePage('methodology')}
            />
          )}
          {activePage === 'overview' && <ExecutiveOverview />}
          {activePage === 'data' && <DataIntelligence />}
          {activePage === 'pressure' && <PressureLab />}
          {activePage === 'batting' && <BattingAnalytics />}
          {activePage === 'bowling' && <BowlingAnalytics />}
          {activePage === 'reliability' && <ReliabilityEngine />}
          {activePage === 'players' && <PlayerExplorer />}
          {activePage === 'comparison' && <PlayerComparison />}
          {activePage === 'rankings' && <Top10Rankings />}
          {activePage === 'auction' && <AuctionIntelligence />}
          {activePage === 'methodology' && <MethodologyResearch />}
          {activePage === 'reports' && <FinalReports />}
        </main>
      </div>
    </div>
  );
};

export default App;

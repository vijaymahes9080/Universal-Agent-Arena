import React, { useState } from 'react';
import { ArenaProvider, useArena } from './context/ArenaContext';
import { Registry } from './pages/Registry';
import { Arena } from './pages/Arena';
import { Simulation } from './pages/Simulation';
import { Marketplace } from './pages/Marketplace';
import { Leaderboard } from './pages/Leaderboard';
import { Cpu, Play, Globe, ShoppingBag, Award, Radio } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const [tab, setTab] = useState<'registry' | 'arena' | 'simulation' | 'marketplace' | 'leaderboard'>('registry');
  const { connected } = useArena();

  const navItems = [
    { id: 'registry', label: 'Agent Registry', icon: Cpu },
    { id: 'arena', label: 'Combat Arena', icon: Play },
    { id: 'simulation', label: 'Simulation World', icon: Globe },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award }
  ];

  const renderActivePage = () => {
    switch (tab) {
      case 'registry': return <Registry />;
      case 'arena': return <Arena />;
      case 'simulation': return <Simulation />;
      case 'marketplace': return <Marketplace />;
      case 'leaderboard': return <Leaderboard />;
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col grid-bg">
      {/* Top Header */}
      <header className="glass-header sticky top-0 z-40 px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            🜔
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-slate-200">Universal Agent Arena</h1>
            <span className="text-[10px] font-semibold text-neonCyan tracking-widest block uppercase mt-0.5">Autonomous Simulation OS</span>
          </div>
        </div>

        {/* WebSocket Status */}
        <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-900 px-3 py-1.5 rounded-full">
          <Radio className={`w-3.5 h-3.5 ${connected ? 'text-neonGreen animate-pulse' : 'text-rose-500'}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Telemetry: <span className={connected ? 'text-neonGreen' : 'text-rose-500'}>{connected ? 'Connected' : 'Offline'}</span>
          </span>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-60 bg-[#090d19]/80 border-r border-slate-900/60 p-4 space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? 'bg-blue-600/10 border border-blue-500/25 text-neonBlue shadow-[0_0_15px_rgba(59,130,246,0.05)]'
                    : 'bg-transparent border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ArenaProvider>
      <DashboardContent />
    </ArenaProvider>
  );
};

export default App;

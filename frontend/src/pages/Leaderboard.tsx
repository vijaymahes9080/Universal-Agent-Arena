import React, { useEffect, useState } from 'react';
import { Award, DollarSign, Brain, Zap } from 'lucide-react';

interface LeaderboardAgent {
  uaid: string;
  name: string;
  creator: string;
  balance: number;
  reputation: number;
  tier: number;
  model: string;
}

interface LeaderboardData {
  economy: LeaderboardAgent[];
  reputation: LeaderboardAgent[];
  reasoning: LeaderboardAgent[];
  speed: LeaderboardAgent[];
}

export const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [tab, setTab] = useState<'economy' | 'reputation' | 'reasoning' | 'speed'>('economy');

  const API_URL = `http://${window.location.hostname || 'localhost'}:8000/api/leaderboard`;

  const fetchLeaderboards = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
    const interval = setInterval(fetchLeaderboards, 8000);
    return () => clearInterval(interval);
  }, []);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/40';
      case 2: return 'bg-slate-300/10 text-slate-300 border border-slate-700/40';
      case 3: return 'bg-amber-950/40 text-amber-600 border border-amber-800/40';
      default: return 'bg-slate-900/30 text-slate-400 border border-slate-850';
    }
  };

  const getStatValue = (a: LeaderboardAgent) => {
    switch (tab) {
      case 'economy': return `${a.balance.toFixed(1)} 🜔`;
      case 'reputation': return `${a.reputation.toFixed(1)} REP`;
      case 'reasoning': return `Tier ${a.tier}`;
      case 'speed': return a.model;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient">Global Leaderboards</h2>
        <p className="text-slate-400 text-xs mt-0.5">Real-time tracking of AI agents across economy, trust, latency capabilities, and reasoning depth.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-850 gap-2 pb-1">
        {[
          { id: 'economy', label: 'Credits Economy', icon: DollarSign, color: 'text-neonGreen' },
          { id: 'reputation', label: 'Reputation', icon: Award, color: 'text-neonBlue' },
          { id: 'reasoning', label: 'Evolutionary Tier', icon: Brain, color: 'text-neonPurple' },
          { id: 'speed', label: 'Inference Engine', icon: Zap, color: 'text-amber-400' }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2 border-b-2 text-xs font-semibold transition ${
                isActive
                  ? 'border-neonBlue text-slate-100 bg-blue-950/5'
                  : 'border-transparent text-slate-450 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${t.color}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="glass p-5 rounded-2xl border-slate-850">
        {!data ? (
          <div className="text-center py-12 text-slate-500 text-xs italic">Loading ranks...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 uppercase tracking-widest font-bold text-[10px]">
                  <th className="pb-3.5 pl-3">Rank</th>
                  <th className="pb-3.5">UAID</th>
                  <th className="pb-3.5">Agent Name</th>
                  <th className="pb-3.5">Creator Node</th>
                  <th className="pb-3.5 text-right pr-3">Metrics</th>
                </tr>
              </thead>
              <tbody>
                {data[tab].map((a, idx) => (
                  <tr key={a.uaid} className="border-b border-slate-900/60 hover:bg-slate-900/10 transition">
                    <td className="py-3 pl-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${getRankBadge(idx + 1)}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-neonCyan">{a.uaid}</td>
                    <td className="py-3 font-semibold text-slate-200">{a.name}</td>
                    <td className="py-3 text-slate-400">{a.creator}</td>
                    <td className="py-3 text-right pr-3 font-bold font-mono text-slate-200">
                      {getStatValue(a)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

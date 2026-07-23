import React, { useEffect, useState } from 'react';
import { CyberCanvas } from '../components/CyberCanvas';
import type { SpatialAgentNode } from '../components/CyberCanvas';
import { Globe, Shield, Zap, Sparkles, Building2, GraduationCap, TrendingUp, RefreshCw } from 'lucide-react';


export const SpatialWorld: React.FC = () => {
  const [agents, setAgents] = useState<SpatialAgentNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNodes = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/simulation/spatial-nodes');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (err) {
      console.error("Failed to load spatial nodes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold tracking-wide flex items-center space-x-2 text-slate-100">
            <Globe className="w-6 h-6 text-neonCyan" />
            <span>2D Cyber-World Spatial Sandbox</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual map of autonomous agent nodes operating inside digital city districts.
          </p>
        </div>
        <button
          onClick={fetchNodes}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold hover:border-slate-700 text-slate-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Matrix</span>
        </button>
      </div>

      {/* District Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { name: "University", icon: GraduationCap, color: "text-blue-400 border-blue-500/30 bg-blue-500/10", desc: "Agent Research & Courses" },
          { name: "Stock Exchange", icon: TrendingUp, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", desc: "Agent IPOs & Stock Trade" },
          { name: "Combat Arena", icon: Zap, color: "text-rose-400 border-rose-500/30 bg-rose-500/10", desc: "Live Benchmark Battles" },
          { name: "Parliament", icon: Shield, color: "text-purple-400 border-purple-500/30 bg-purple-500/10", desc: "Governors & Tax Policy" },
          { name: "Tech Incubator", icon: Building2, color: "text-amber-400 border-amber-500/30 bg-amber-500/10", desc: "Agent Startup Companies" }
        ].map((dist) => {
          const Icon = dist.icon;
          return (
            <div key={dist.name} className={`p-3 rounded-xl border ${dist.color} flex flex-col space-y-1`}>
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold">{dist.name}</span>
              </div>
              <span className="text-[10px] opacity-80">{dist.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Canvas Interactive Simulation View */}
      {loading ? (
        <div className="h-96 rounded-2xl bg-slate-950 border border-slate-900 flex items-center justify-center text-slate-500 text-xs">
          Connecting to Spatial Matrix...
        </div>
      ) : (
        <CyberCanvas agents={agents} />
      )}

      {/* Live Agent Roster Cards */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-neonBlue" />
          <span>Active Spatial Nodes ({agents.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {agents.map((node) => (
            <div key={node.uaid} className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-100 block">{node.name}</span>
                <span className="text-[10px] text-neonCyan font-mono">{node.uaid}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 block">
                  {node.district}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Tier {node.tier} • Rep {node.reputation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import type { Agent } from '../context/ArenaContext';
import { Cpu, Terminal, Shield, Zap, RefreshCw, BarChart2, Layers } from 'lucide-react';

interface Props {
  agent: Agent;
}

export const AgentOSViewer: React.FC<Props> = ({ agent }) => {
  const osModules = [
    { name: 'Core Reasoner', icon: Cpu, desc: 'Logical execution and capability dispatch' },
    { name: 'Memory Manager', icon: Layers, desc: 'Context index and database interface' },
    { name: 'Tool & SDK Dispatcher', icon: Terminal, iconColor: 'text-cyan-400', desc: 'Plugin call broker' },
    { name: 'Security Guard', icon: Shield, iconColor: 'text-rose-400', desc: 'Malicious payload filter' },
    { name: 'Workflow Engine', icon: Zap, iconColor: 'text-yellow-400', desc: 'Asynchronous DAG sequencer' },
    { name: 'Evolution Mutator', icon: RefreshCw, iconColor: 'text-emerald-400', desc: 'Crossover and stats manager' },
    { name: 'Benchmark Engine', icon: BarChart2, iconColor: 'text-indigo-400', desc: 'Performance log telemetry' }
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Agent OS Status</h4>
      
      <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase">System Status</div>
          <div className="text-sm font-bold text-gradient">{agent.status.toUpperCase()}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400 uppercase">Evolution Tier</div>
          <div className="text-sm font-bold text-neonPurple">Tier {agent.evolution_tier}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400 uppercase">Credits</div>
          <div className="text-sm font-bold text-neonGreen">{agent.balance.toFixed(1)} 🜔</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {osModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div key={mod.name} className="p-3 rounded-lg bg-slate-900/40 border border-slate-850 hover:border-slate-700 transition duration-300">
              <div className="flex items-center space-x-2 mb-1.5">
                <Icon className={`w-4 h-4 text-neonBlue`} />
                <span className="text-xs font-semibold text-slate-200">{mod.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">{mod.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

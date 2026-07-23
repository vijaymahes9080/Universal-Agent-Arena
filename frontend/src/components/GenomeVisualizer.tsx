import React from 'react';
import type { Genome } from '../context/ArenaContext';

interface Props {
  genome: Genome;
}

export const GenomeVisualizer: React.FC<Props> = ({ genome }) => {
  const stats = [
    { label: 'Planning Depth', key: 'planning', color: 'from-blue-500 to-cyan-400' },
    { label: 'Context Memory', key: 'memory', color: 'from-purple-500 to-pink-500' },
    { label: 'Inference Speed', key: 'speed', color: 'from-amber-400 to-orange-500' },
    { label: 'Reasoning Core', key: 'reasoning', color: 'from-emerald-400 to-teal-500' },
    { label: 'Code Assembly', key: 'coding', color: 'from-rose-500 to-red-500' },
    { label: 'Creativity Factor', key: 'creativity', color: 'from-indigo-400 to-purple-600' },
    { label: 'Negotiation Strategy', key: 'negotiation', color: 'from-yellow-400 to-amber-500' },
    { label: 'Collaboration Multiplier', key: 'collaboration', color: 'from-cyan-400 to-teal-400' },
    { label: 'Risk Propensity', key: 'risk_taking', color: 'from-purple-500 to-rose-400' }
  ];

  return (
    <div className="space-y-3.5">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Agent Genome DNA</h4>
      {stats.map((s) => {
        const val = genome[s.key as keyof Genome] || 50;
        return (
          <div key={s.key} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">{s.label}</span>
              <span className="text-slate-400">{val} / 100</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${s.color} transition-all duration-500 ease-out shadow-[0_0_8px_rgba(255,255,255,0.1)]`}
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

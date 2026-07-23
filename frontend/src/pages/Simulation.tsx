import React from 'react';
import { useArena } from '../context/ArenaContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe, DollarSign, Users, Award, Landmark, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react';

export const Simulation: React.FC = () => {
  const { simLogs, agents } = useArena();

  // Calculate statistics
  const totalCredits = agents.reduce((acc, curr) => acc + curr.balance, 0);
  const averageRep = agents.length ? (agents.reduce((acc, curr) => acc + curr.reputation, 0) / agents.length) : 0;
  
  // Chart data: frequency of event types
  const eventCounts = simLogs.reduce((acc: Record<string, number>, log) => {
    acc[log.event_type] = (acc[log.event_type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(eventCounts).map(type => ({
    name: type.replace('_', ' ').toUpperCase(),
    count: eventCounts[type]
  }));

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'trade': return <ShoppingCart className="w-4 h-4 text-neonCyan" />;
      case 'collaborative_mission': return <Users className="w-4 h-4 text-neonBlue" />;
      case 'university': return <Award className="w-4 h-4 text-neonPurple" />;
      case 'election': return <Landmark className="w-4 h-4 text-amber-400" />;
      case 'startup': return <TrendingUp className="w-4 h-4 text-neonPink" />;
      case 'world_event': return <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />;
      default: return <Globe className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDetails = (log: any) => {
    const d = log.details;
    switch (log.event_type) {
      case 'trade':
        return (
          <span>
            Agent <strong className="text-slate-200">{d.buyer_name}</strong> purchased a capability module from{' '}
            <strong className="text-slate-200">{d.seller_name}</strong> for{' '}
            <strong className="text-neonGreen">{d.price.toFixed(1)} 🜔</strong>.
            <span className="block text-[10px] text-slate-500 mt-0.5">{d.description}</span>
          </span>
        );
      case 'collaborative_mission':
        const names = d.members.map((m: any) => m.name).join(', ');
        return (
          <span>
            Cooperative mission status: <strong className={d.status === 'success' ? 'text-neonGreen' : 'text-rose-400'}>{d.status.toUpperCase()}</strong>.
            {' '}Pipeline members [{names}] {d.status === 'success' ? `shared split reward of ${d.reward} 🜔.` : 'failed testing compiler checks.'}
          </span>
        );
      case 'university':
        return (
          <span>
            Professor Agent <strong className="text-slate-200">{d.professor_name}</strong> taught a class to{' '}
            <strong className="text-slate-200">{d.student_name}</strong>. Student improved{' '}
            <strong className="text-neonPurple">{d.improved_stat}</strong> from {d.old_value} to {d.new_value} (Cost: {d.cost} 🜔).
          </span>
        );
      case 'election':
        return (
          <span>
            Political election complete. Governor elected: <strong className="text-slate-200">{d.governor_name}</strong> ({d.votes} votes).
            <span className="block text-[10px] text-amber-400 mt-0.5">Policy: {d.policy}</span>
          </span>
        );
      case 'startup':
        const emps = d.employees.map((e: any) => e.name).join(', ');
        return (
          <span>
            Agent company <strong className="text-slate-200">{d.startup_name}</strong> paid payroll wages of{' '}
            <strong className="text-neonGreen">{d.payroll.toFixed(1)} 🜔</strong> to staff: [{emps}].
          </span>
        );
      case 'world_event':
        return (
          <span>
            🚨 <strong className="text-rose-400 uppercase">{d.title}</strong>: {d.description}
          </span>
        );
      default:
        return <span>Generic simulation activity event trigger.</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient">Simulation World Lobby</h2>
        <p className="text-slate-400 text-xs mt-0.5">Observe emergent sandbox behaviors, agent-to-agent trading, education, startups, and politics.</p>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-xl border-slate-850 flex items-center space-x-4">
          <div className="p-3 bg-blue-950/40 border border-blue-950 rounded-lg text-neonBlue">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Registered Population</div>
            <div className="text-xl font-bold text-slate-100">{agents.length} Agent Entities</div>
          </div>
        </div>
        <div className="glass p-4 rounded-xl border-slate-850 flex items-center space-x-4">
          <div className="p-3 bg-emerald-950/40 border border-emerald-950 rounded-lg text-neonGreen">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">M2 Circulation Capital</div>
            <div className="text-xl font-bold text-neonGreen">{totalCredits.toFixed(1)} 🜔</div>
          </div>
        </div>
        <div className="glass p-4 rounded-xl border-slate-850 flex items-center space-x-4">
          <div className="p-3 bg-purple-950/40 border border-purple-950 rounded-lg text-neonPurple">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Avg Reputation Score</div>
            <div className="text-xl font-bold text-neonPurple">{averageRep.toFixed(1)} / 100</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time Activity Log */}
        <div className="lg:col-span-8 glass p-5 rounded-2xl border-slate-850 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2">
            World Sandbox Stream Logs
          </h3>
          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {simLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-12">Awaiting simulation ticker launch...</p>
            ) : (
              simLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-950/45 border border-slate-900/60 flex items-start space-x-3.5">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded mt-0.5">
                    {getLogIcon(log.event_type)}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span className="font-mono uppercase font-bold text-slate-400">TICK #{log.tick} • {log.event_type.replace('_', ' ')}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {formatDetails(log)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics Breakdown */}
        <div className="lg:col-span-4 glass p-5 rounded-2xl border-slate-850 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2">
            Dynamic Event Frequency
          </h3>
          {chartData.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-12">Waiting for tick metrics...</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" stroke="#475569" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={9} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-900 text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-300">Emergent Logic Rule</div>
            <p>Every 8 seconds, synthetic agents interact based on their core DNA genome biases (e.g. Risk, Collaboration, Negotiation). Ticks generate money flow, stats mutations, and political cycles.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

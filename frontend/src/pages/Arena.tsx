import React, { useState, useEffect } from 'react';
import { useArena } from '../context/ArenaContext';
import type { Battle } from '../context/ArenaContext';
import { Play, Clock, Zap, DollarSign, Database } from 'lucide-react';

export const Arena: React.FC = () => {
  const { agents, battles, activeBattle, startBattle } = useArena();
  const [mode, setMode] = useState('classic');
  const [taskName, setTaskName] = useState('Autonomous Code Generator');
  const [agent1Uaid, setAgent1Uaid] = useState('');
  const [agent2Uaid, setAgent2Uaid] = useState('');
  
  const [backendTasks, setBackendTasks] = useState<Record<string, any>>({});
  const [viewingHistoryId, setViewingHistoryId] = useState<number | null>(null);

  // Fetch tasks metadata
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname || 'localhost'}:8000/api/tasks`);
        if (res.ok) setBackendTasks(await res.json());
      } catch (e) {
        console.error("Error fetching tasks", e);
      }
    };
    fetchTasks();
  }, []);

  // Set default agents
  useEffect(() => {
    if (agents.length >= 2 && (!agent1Uaid || !agent2Uaid)) {
      setAgent1Uaid(agents[0].uaid);
      setAgent2Uaid(agents[1].uaid);
    }
  }, [agents, agent1Uaid, agent2Uaid]);

  const handleStartBattle = async () => {
    if (!agent1Uaid || !agent2Uaid || agent1Uaid === agent2Uaid) {
      alert("Please select two unique agents.");
      return;
    }
    setViewingHistoryId(null);
    await startBattle(mode, taskName, [agent1Uaid, agent2Uaid]);
  };

  // Determine current display battle
  let displayedBattle: Battle | null = activeBattle;
  if (viewingHistoryId !== null) {
    const historyBattle = battles.find(b => b.id === viewingHistoryId);
    if (historyBattle) displayedBattle = historyBattle;
  }

  const getStepColor = (stepName: string, activeStep: string, isCompleted: boolean) => {
    if (isCompleted) return 'border-neonGreen bg-emerald-950/20 text-emerald-400';
    if (activeStep === stepName) return 'border-neonBlue bg-blue-950/20 text-blue-400 animate-pulse';
    return 'border-slate-800 bg-slate-900/35 text-slate-500';
  };

  const getStepIndexByName = (name: string) => {
    const steps = ["PLANNING", "RESEARCH", "EXECUTION", "VERIFICATION"];
    return steps.indexOf(name) + 1;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient">Agent Battle Arena</h2>
        <p className="text-slate-400 text-xs mt-0.5">Pit AI genomes against each other in real-time reasoning and task execution wars.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Matchmaker Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass p-5 rounded-2xl border-slate-850 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-neonBlue" />
              <span>Match Matchmaker</span>
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Challenge Task</label>
              <select
                value={taskName}
                onChange={e => setTaskName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-neonBlue outline-none"
              >
                {Object.keys(backendTasks).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              {backendTasks[taskName] && (
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed bg-slate-950/50 p-2 rounded border border-slate-900">
                  {backendTasks[taskName].description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Battle Mode</label>
              <select
                value={mode}
                onChange={e => setMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-neonBlue outline-none"
              >
                <option value="classic">Classic (Balanced Weights)</option>
                <option value="speed_run">Speed Run (Latency is King)</option>
                <option value="lowest_cost">Lowest Cost (Token Efficiency)</option>
                <option value="highest_accuracy">Highest Accuracy (Zero Hallucination)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Combatant A</label>
                <select
                  value={agent1Uaid}
                  onChange={e => setAgent1Uaid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 focus:border-neonBlue outline-none"
                >
                  <option value="">Select Agent</option>
                  {agents.map(a => (
                    <option key={a.uaid} value={a.uaid}>{a.name} ({a.uaid})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Combatant B</label>
                <select
                  value={agent2Uaid}
                  onChange={e => setAgent2Uaid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 focus:border-neonBlue outline-none"
                >
                  <option value="">Select Agent</option>
                  {agents.map(a => (
                    <option key={a.uaid} value={a.uaid}>{a.name} ({a.uaid})</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleStartBattle}
              disabled={activeBattle?.status === 'running'}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              <span>Queue Battle Run</span>
            </button>
          </div>

          {/* Previous Battles List */}
          <div className="glass p-5 rounded-2xl border-slate-850 space-y-3.5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
              Battle Logs History
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {battles.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">No matches queued yet.</p>
              ) : (
                battles.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setViewingHistoryId(b.id)}
                    className={`p-2.5 rounded bg-slate-950/40 border text-xs cursor-pointer flex justify-between items-center transition ${
                      viewingHistoryId === b.id || (viewingHistoryId === null && activeBattle?.id === b.id)
                        ? 'border-indigo-500/40 bg-indigo-950/15'
                        : 'border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{b.task_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {b.mode.replace('_', ' ').toUpperCase()} • Match #{b.id}
                      </div>
                    </div>
                    <div className="text-right">
                      {b.status === 'completed' ? (
                        <span className="text-[10px] font-bold text-neonGreen font-mono">DONE</span>
                      ) : b.status === 'running' ? (
                        <span className="text-[10px] font-bold text-neonBlue animate-pulse font-mono">LIVE</span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 font-mono">PENDING</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Battle Simulation Panel */}
        <div className="lg:col-span-8">
          {displayedBattle ? (
            <div className="glass p-5 rounded-2xl border-slate-850 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-850 pb-4">
                <div>
                  <span className="text-xs font-mono text-neonCyan font-bold uppercase">{displayedBattle.mode.replace('_', ' ')} MODE</span>
                  <h3 className="text-lg font-bold text-slate-100 mt-0.5">{displayedBattle.task_name}</h3>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-3">
                    <span>Match ID: #{displayedBattle.id}</span>
                    <span>Status: <span className={displayedBattle.status === 'completed' ? 'text-neonGreen font-semibold' : 'text-neonBlue font-semibold'}>{displayedBattle.status.toUpperCase()}</span></span>
                  </div>
                </div>

                {displayedBattle.status === 'completed' && displayedBattle.winner_uaid && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-center">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Winner</div>
                    <div className="text-sm font-bold text-neonGreen">
                      {agents.find(a => a.uaid === displayedBattle!.winner_uaid)?.name || displayedBattle.winner_uaid}
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Pipeline Pipeline Visualizer */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold tracking-wider">
                {["PLANNING", "RESEARCH", "EXECUTION", "VERIFICATION"].map((st) => {
                  // Determine status
                  const timeline = displayedBattle?.log_timeline || [];
                  const lastStep = timeline[timeline.length - 1];
                  const lastStepName = lastStep ? lastStep.step_name : '';
                  const lastStepIdx = getStepIndexByName(lastStepName);
                  const currentStepIdx = getStepIndexByName(st);
                  
                  const isCompleted = displayedBattle?.status === 'completed' || lastStepIdx > currentStepIdx;
                  
                  return (
                    <div
                      key={st}
                      className={`p-2.5 rounded-lg border transition duration-300 ${getStepColor(st, lastStepName, isCompleted)}`}
                    >
                      {st}
                    </div>
                  );
                })}
              </div>

              {/* Multi-Agent Console Outputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedBattle.agent_ids.map((uaid) => {
                  const agent = agents.find(a => a.uaid === uaid);
                  const timeline = displayedBattle!.log_timeline || [];
                  const agentSteps = timeline.filter(s => s.agent_uaid === uaid);
                  const finalScore = displayedBattle!.scores ? displayedBattle!.scores[uaid] : null;
                  const finalMetrics = displayedBattle!.metrics ? displayedBattle!.metrics[uaid] : null;

                  return (
                    <div key={uaid} className="p-4 rounded-xl bg-slate-950/70 border border-slate-900 flex flex-col justify-between h-[450px]">
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                          <div>
                            <div className="text-sm font-bold text-slate-100">{agent?.name || 'Loading Agent...'}</div>
                            <span className="text-[10px] font-mono text-slate-400">{uaid}</span>
                          </div>
                          {finalScore !== null && (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-semibold">SCORE</span>
                              <span className="text-sm font-black text-neonCyan">{finalScore} / 100</span>
                            </div>
                          )}
                        </div>

                        {/* Terminal log panel */}
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {agentSteps.length === 0 ? (
                            <div className="text-xs text-slate-600 italic mt-8 text-center">Awaiting execution thread...</div>
                          ) : (
                            agentSteps.map((step, idx) => (
                              <div key={idx} className="space-y-1 text-xs border-b border-slate-900/60 pb-2">
                                <div className="flex items-center space-x-1 text-neonPurple font-bold font-mono text-[10px]">
                                  <span>[{step.step_name}]</span>
                                </div>
                                <div className="text-slate-400 bg-slate-900/60 p-1.5 rounded font-mono text-[11px] leading-tight">
                                  <span className="text-slate-500 font-bold block text-[10px] mb-0.5"># internal thoughts</span>
                                  {step.thoughts}
                                </div>
                                <div className="text-slate-200 bg-slate-900/30 p-1.5 rounded font-mono text-[11px] border border-slate-900/50 mt-1">
                                  <span className="text-neonCyan font-bold block text-[10px] mb-0.5"># raw return payload</span>
                                  <pre className="whitespace-pre-wrap">{step.content}</pre>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Final Run Metrics */}
                      {finalMetrics && (
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-400 border-t border-slate-900 pt-3 mt-2">
                          <div className="bg-slate-900/35 p-1 rounded">
                            <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-neonBlue" />
                            <div className="font-bold text-slate-200 font-mono">{finalMetrics.latency.toFixed(2)}s</div>
                            <div className="text-[8px] uppercase">Latency</div>
                          </div>
                          <div className="bg-slate-900/35 p-1 rounded">
                            <Database className="w-3.5 h-3.5 mx-auto mb-1 text-neonPurple" />
                            <div className="font-bold text-slate-200 font-mono">{finalMetrics.token_usage}</div>
                            <div className="text-[8px] uppercase">Tokens</div>
                          </div>
                          <div className="bg-slate-900/35 p-1 rounded">
                            <DollarSign className="w-3.5 h-3.5 mx-auto mb-1 text-neonGreen" />
                            <div className="font-bold text-slate-200 font-mono">${finalMetrics.cost.toFixed(4)}</div>
                            <div className="text-[8px] uppercase">Cost</div>
                          </div>
                          <div className="bg-slate-900/35 p-1 rounded">
                            <Zap className="w-3.5 h-3.5 mx-auto mb-1 text-neonPink" />
                            <div className="font-bold text-slate-200 font-mono">{finalMetrics.energy ? finalMetrics.energy.toFixed(1) : 0.0} J</div>
                            <div className="text-[8px] uppercase">Energy</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass p-16 text-center rounded-2xl text-slate-500 text-sm">
              Configure and start a battle run using the Matchmaker panel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

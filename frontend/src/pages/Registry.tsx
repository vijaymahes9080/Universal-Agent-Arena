import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import type { Genome } from '../context/ArenaContext';
import { GenomeVisualizer } from '../components/GenomeVisualizer';
import { AgentOSViewer } from '../components/AgentOSViewer';
import { Cpu, Plus, Dna, Info } from 'lucide-react';

export const Registry: React.FC = () => {
  const { agents, registerAgent, evolveAgent } = useArena();
  const [selectedUaid, setSelectedUaid] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [creator, setCreator] = useState('');
  const [model, setModel] = useState('mock-agent-v1');
  const [genome, setGenome] = useState<Genome>({
    planning: 50,
    memory: 50,
    speed: 50,
    reasoning: 50,
    coding: 50,
    creativity: 50,
    negotiation: 50,
    collaboration: 50,
    risk_taking: 50
  });

  const selectedAgent = agents.find(a => a.uaid === selectedUaid) || agents[0];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !creator) return;
    await registerAgent(name, model, creator, genome);
    setName('');
    setCreator('');
    setIsRegistering(false);
  };

  const handleGenomeSlider = (key: keyof Genome, val: number) => {
    setGenome(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Universal Agent Registry</h2>
          <p className="text-slate-400 text-xs mt-0.5">Explore active digital entities, modify genomes, and boot up new nodes.</p>
        </div>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-xs font-semibold hover:opacity-90 shadow-lg hover:shadow-blue-500/10 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Agent Node</span>
        </button>
      </div>

      {isRegistering && (
        <form onSubmit={handleRegister} className="glass p-5 rounded-xl border-indigo-500/20 max-w-2xl space-y-4 animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5 border-b border-slate-800 pb-2">
            <Cpu className="w-4 h-4 text-neonCyan" />
            <span>Deploy New Agent Instance</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Agent Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Nexus-Core-9"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-neonBlue outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Creator</label>
              <input
                type="text"
                value={creator}
                onChange={e => setCreator(e.target.value)}
                placeholder="e.g. Human-Lab"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-neonBlue outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Model Engine</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-neonBlue outline-none"
              >
                <option value="mock-agent-v1">Simulated Inference Engine</option>
                <option value="gpt-4o">OpenAI GPT-4o (requires API Key)</option>
                <option value="claude-3-sonnet">Anthropic Sonnet (requires API Key)</option>
                <option value="llama-3">Ollama Local Llama-3</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase flex items-center space-x-1 border-b border-slate-900 pb-1">
              <Dna className="w-3.5 h-3.5 text-neonPurple" />
              <span>Configure Starting DNA Genome Parameters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.keys(genome).map((key) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-slate-400">
                    <span className="capitalize">{key.replace('_', ' ')}</span>
                    <span>{genome[key as keyof Genome]}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={genome[key as keyof Genome]}
                    onChange={e => handleGenomeSlider(key as keyof Genome, parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-neonPurple"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-neonBlue hover:bg-blue-600 rounded text-xs text-white font-semibold"
            >
              Deploy Node
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Agent List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Registered AI Entities</h3>
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {agents.map((a) => {
              const isActive = selectedAgent?.uaid === a.uaid;
              return (
                <div
                  key={a.uaid}
                  onClick={() => setSelectedUaid(a.uaid)}
                  className={`p-3.5 rounded-xl cursor-pointer transition border ${
                    isActive
                      ? 'bg-indigo-950/20 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.08)]'
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-slate-400">{a.uaid}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      a.status === 'idle' ? 'bg-emerald-950/45 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950/45 text-amber-400 border border-amber-800/40'
                    }`}>{a.status}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 mt-1">{a.name}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                    <span>Tier {a.evolution_tier} • {a.creator}</span>
                    <span className="font-bold text-neonGreen">{a.balance.toFixed(1)} 🜔</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent Detail Panel */}
        <div className="lg:col-span-7">
          {selectedAgent ? (
            <div className="glass p-5 rounded-2xl border-slate-850 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-850 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-neonCyan font-bold">{selectedAgent.uaid}</span>
                    <span className="text-xs text-slate-400">• Version {selectedAgent.version}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mt-0.5">{selectedAgent.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Creator: {selectedAgent.creator} | License: {selectedAgent.license}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => evolveAgent(selectedAgent.uaid, 'mutation')}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition"
                  >
                    Mutate Genome (100 🜔)
                  </button>
                  <button
                    onClick={() => evolveAgent(selectedAgent.uaid, 'tier_upgrade')}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-900 to-indigo-900 border border-indigo-700/30 hover:opacity-90 rounded-lg text-xs font-semibold text-white transition shadow-lg"
                  >
                    Upgrade Tier (500 🜔)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <GenomeVisualizer genome={selectedAgent.genome} />
                </div>
                <div className="space-y-4">
                  <AgentOSViewer agent={selectedAgent} />
                  
                  {/* Capabilities List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Capabilities</h4>
                    {selectedAgent.capabilities.length === 0 ? (
                      <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-850 text-slate-500 text-xs flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5" />
                        <span>No specialized capability plugins purchased.</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAgent.capabilities.map((c) => (
                          <span key={c} className="text-[10px] font-semibold bg-blue-950/40 text-blue-400 border border-blue-800/40 px-2 py-0.5 rounded-full">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass p-12 text-center rounded-2xl text-slate-500 text-sm">
              Deploy an agent node or select one from the list to analyze.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

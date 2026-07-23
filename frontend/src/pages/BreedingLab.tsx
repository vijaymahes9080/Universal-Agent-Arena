import React, { useEffect, useState } from 'react';
import { Dna, Sparkles, Zap, GitMerge, CheckCircle2 } from 'lucide-react';


interface Agent {
  uaid: string;
  name: string;
  evolution_tier: number;
  genome: Record<string, number>;
}

interface InheritedSummary {
  [trait: string]: {
    p1: number;
    p2: number;
    final: number;
    mutated: boolean;
  };
}

export const BreedingLab: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [parent1, setParent1] = useState<string>('');
  const [parent2, setParent2] = useState<string>('');
  const [mutationRate, setMutationRate] = useState<number>(0.05);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ offspring: Agent; record: InheritedSummary } | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/agents');
        if (res.ok) {
          const data = await res.json();
          setAgents(data);
          if (data.length >= 2) {
            setParent1(data[0].uaid);
            setParent2(data[1].uaid);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAgents();
  }, []);

  const handleBreed = async () => {
    if (!parent1 || !parent2 || parent1 === parent2) {
      alert("Please select two distinct parent agents.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/breeding/crossbreed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent1_uaid: parent1,
          parent2_uaid: parent2,
          mutation_rate: mutationRate
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const err = await res.json();
        alert(`Breeding Error: ${err.detail}`);
      }
    } catch (err: any) {
      alert(`Breeding failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const p1Obj = agents.find(a => a.uaid === parent1);
  const p2Obj = agents.find(a => a.uaid === parent2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-wide flex items-center space-x-2 text-slate-100">
          <Dna className="w-6 h-6 text-purple-400" />
          <span>Genetic Breeding Lab & Mutation Gauntlet</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform DNA crossover between two high-tier parent agents. Synthesize Generation-2 hybrid offspring with inherited genomes and randomized beneficial mutations.
        </p>
      </div>

      {/* Parent Selection & Hybrid Fusion Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Parent 1 Card */}
        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
            <Zap className="w-4 h-4" />
            <span>Parent Genome Alpha</span>
          </h3>
          <select
            value={parent1}
            onChange={(e) => setParent1(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
          >
            {agents.map(a => (
              <option key={a.uaid} value={a.uaid}>{a.name} (Tier {a.evolution_tier})</option>
            ))}
          </select>
          {p1Obj && (
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/60 text-xs space-y-1.5">
              <span className="font-bold text-slate-200 block">{p1Obj.name}</span>
              <span className="text-[10px] text-neonCyan font-mono block">{p1Obj.uaid}</span>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1">
                <span>Reasoning: {p1Obj.genome.reasoning}</span>
                <span>Speed: {p1Obj.genome.speed}</span>
                <span>Coding: {p1Obj.genome.coding}</span>
                <span>Creativity: {p1Obj.genome.creativity}</span>
              </div>
            </div>
          )}
        </div>

        {/* Fusion Chamber Controller */}
        <div className="bg-slate-950 border border-purple-900/40 rounded-2xl p-5 text-center space-y-4 shadow-[0_0_25px_rgba(147,51,234,0.1)]">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <GitMerge className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">DNA Crossover Engine</h4>
            <span className="text-[10px] text-slate-400">Recombination + Mutation</span>
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Mutation Probability</span>
              <span className="text-purple-400">{(mutationRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.25"
              step="0.01"
              value={mutationRate}
              onChange={(e) => setMutationRate(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <button
            onClick={handleBreed}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-xs text-white hover:brightness-110 transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing DNA...' : 'SYNTHESIZE HYBRID GENOME'}</span>
          </button>
        </div>

        {/* Parent 2 Card */}
        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
            <Zap className="w-4 h-4" />
            <span>Parent Genome Beta</span>
          </h3>
          <select
            value={parent2}
            onChange={(e) => setParent2(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            {agents.map(a => (
              <option key={a.uaid} value={a.uaid}>{a.name} (Tier {a.evolution_tier})</option>
            ))}
          </select>
          {p2Obj && (
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/60 text-xs space-y-1.5">
              <span className="font-bold text-slate-200 block">{p2Obj.name}</span>
              <span className="text-[10px] text-neonCyan font-mono block">{p2Obj.uaid}</span>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1">
                <span>Reasoning: {p2Obj.genome.reasoning}</span>
                <span>Speed: {p2Obj.genome.speed}</span>
                <span>Coding: {p2Obj.genome.coding}</span>
                <span>Creativity: {p2Obj.genome.creativity}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Synthesis Result Display */}
      {result && (
        <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-6 space-y-5 shadow-[0_0_30px_rgba(168,85,247,0.15)] animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-900 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">Generation-2 Hybrid Born</span>
              <h3 className="text-lg font-black text-slate-100">{result.offspring.name}</h3>
              <span className="text-xs text-neonCyan font-mono">{result.offspring.uaid} • Tier {result.offspring.evolution_tier}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>Hybrid Synthesis Complete</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Inherited Gene Matrix Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(result.record).map(([trait, data]) => (
                <div key={trait} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200 capitalize">{trait}</span>
                    <span className="font-mono font-bold text-purple-400 text-sm">{data.final}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                    <span>P1: {data.p1}</span>
                    <span>P2: {data.p2}</span>
                    {data.mutated && (
                      <span className="text-amber-400 font-bold flex items-center space-x-0.5">
                        <Sparkles className="w-3 h-3" />
                        <span>Mutated</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

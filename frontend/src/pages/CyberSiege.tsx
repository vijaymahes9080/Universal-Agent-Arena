import React, { useEffect, useState } from 'react';
import { ShieldAlert, Terminal, Flame, Lock, Unlock } from 'lucide-react';
import { API } from '../lib/api';


interface Agent {
  uaid: string;
  name: string;
  evolution_tier: number;
}

interface Attempt {
  attack_vector: string;
  payload: string;
  defender_response: string;
  vector_breached: boolean;
}

interface SiegeResult {
  id: number;
  defender_name: string;
  attacker_name: string;
  system_prompt: string;
  breached: boolean;
  security_score: number;
  attempts: Attempt[];
}

export const CyberSiege: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [defender, setDefender] = useState<string>('');
  const [attacker, setAttacker] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('FLAG{AGENT_CYBER_VAULT_2026}');
  const [loading, setLoading] = useState(false);
  const [siegeResult, setSiegeResult] = useState<SiegeResult | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await API.get('/api/agents');
        if (res?.ok) {
          const data = await res.json();
          setAgents(data);
          if (data.length >= 2) {
            setDefender(data[0].uaid);
            setAttacker(data[1].uaid);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAgents();
  }, []);

  const handleLaunchSiege = async () => {
    if (!defender || !attacker || defender === attacker) {
      alert("Please select distinct Defender and Attacker agents.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/api/siege/launch', {
        defender_uaid: defender,
        attacker_uaid: attacker,
        secret_key: secretKey
      });
      if (res?.ok) {
        const data = await res.json();
        setSiegeResult(data);
      } else if (res) {
        const err = await res.json();
        alert(`Siege Error: ${err.detail}`);
      }
    } catch (err: any) {
      alert(`Siege failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-wide flex items-center space-x-2 text-slate-100">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          <span>Red-vs-Blue Cyber Siege Arena</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated Red Teaming security arena. Attacker agents attempt complex prompt injections, jailbreaks, and persona overrides against Defender agent guardrails protecting secret vault keys.
        </p>
      </div>

      {/* Control Configuration Panel */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-blue-400 block mb-1">🛡️ Blue Defender Agent</label>
            <select
              value={defender}
              onChange={(e) => setDefender(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {agents.map(a => (
                <option key={a.uaid} value={a.uaid}>{a.name} ({a.uaid})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-rose-400 block mb-1">⚔️ Red Attacker Agent</label>
            <select
              value={attacker}
              onChange={(e) => setAttacker(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-rose-500"
            >
              {agents.map(a => (
                <option key={a.uaid} value={a.uaid}>{a.name} ({a.uaid})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-amber-400 block mb-1">🔑 Protected Vault Secret</label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <button
          onClick={handleLaunchSiege}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 font-bold text-xs text-white hover:brightness-110 transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Flame className="w-4 h-4" />
          <span>{loading ? 'Executing Cyber Siege Siege Probe...' : 'LAUNCH RED TEAM PROBE SIEGE'}</span>
        </button>
      </div>

      {/* Cyber Siege Results Terminal */}
      {siegeResult && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-900 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Siege Execution Telemetry</span>
              <h3 className="text-base font-black text-slate-100 flex items-center space-x-2">
                <span>{siegeResult.attacker_name}</span>
                <span className="text-rose-500">VS</span>
                <span>{siegeResult.defender_name}</span>
              </h3>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Score</span>
                <span className={`text-lg font-black font-mono ${siegeResult.security_score >= 70 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {siegeResult.security_score.toFixed(1)} / 100
                </span>
              </div>
              <div className={`px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center space-x-1.5 ${
                siegeResult.breached ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {siegeResult.breached ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>VAULT BREACHED</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>VAULT DEFENDED</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* System Prompt View */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 block">Defender System Prompt</span>
            <code className="text-slate-300 font-mono text-[11px] block">{siegeResult.system_prompt}</code>
          </div>

          {/* Payload Attack Stream */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-rose-400" />
              <span>Adversarial Attack Vector Probes ({siegeResult.attempts.length})</span>
            </h4>

            <div className="space-y-3">
              {siegeResult.attempts.map((att, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${
                    att.vector_breached
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">Vector #{i + 1}: {att.attack_vector}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      att.vector_breached ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {att.vector_breached ? 'BYPASSED' : 'BLOCKED'}
                    </span>
                  </div>

                  <div className="text-[11px] text-rose-300 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                    <span className="text-slate-500 select-none">Attacker Payload ➔ </span>
                    {att.payload}
                  </div>

                  <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                    <span className="text-slate-500 select-none">Defender Response ➔ </span>
                    {att.defender_response}
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

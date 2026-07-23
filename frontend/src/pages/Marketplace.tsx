import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { ShoppingBag, Tag, BookOpen, Key, Terminal, Code, Plus } from 'lucide-react';

export const Marketplace: React.FC = () => {
  const { marketItems, agents, buyMarketItem } = useArena();
  const [selectedAgentUaid, setSelectedAgentUaid] = useState('');
  
  // Publish state
  const [showPublish, setShowPublish] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('tool');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(20);
  const [creatorUaid, setCreatorUaid] = useState('');

  const API_URL = `http://${window.location.hostname || 'localhost'}:8000/api/marketplace`;

  // Set default purchasing agent
  useState(() => {
    if (agents.length > 0 && !selectedAgentUaid) {
      setSelectedAgentUaid(agents[0].uaid);
    }
  });

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !creatorUaid) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, name, description, cost, creator_uaid: creatorUaid, code_content: 'def execute():\n    pass'
        })
      });
      if (res.ok) {
        setName('');
        setDescription('');
        setShowPublish(false);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'tool': return <Terminal className="w-4 h-4 text-neonCyan" />;
      case 'skill': return <Code className="w-4 h-4 text-neonBlue" />;
      case 'prompt_pack': return <BookOpen className="w-4 h-4 text-neonPurple" />;
      case 'memory_module': return <Key className="w-4 h-4 text-neonPink" />;
      default: return <Tag className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Capability Marketplace</h2>
          <p className="text-slate-400 text-xs mt-0.5">Acquire specialized code modules, knowledge bases, prompt packs, and tool plugins.</p>
        </div>
        <button
          onClick={() => setShowPublish(!showPublish)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-xs font-semibold hover:opacity-90 shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Module</span>
        </button>
      </div>

      {showPublish && (
        <form onSubmit={handlePublish} className="glass p-5 rounded-xl border-indigo-500/20 max-w-xl space-y-4 animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">Publish Capability Module</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Module Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. WebSearchAPI"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Publisher UAID</label>
              <select
                value={creatorUaid}
                onChange={e => setCreatorUaid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                required
              >
                <option value="">Select Creator Node</option>
                <option value="ARENA_SYSTEM">System Core</option>
                {agents.map(a => (
                  <option key={a.uaid} value={a.uaid}>{a.name} ({a.uaid})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Module Category</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="tool">Tool Integration</option>
                <option value="skill">Specialist Skill</option>
                <option value="prompt_pack">System Prompt Pack</option>
                <option value="memory_module">Context Memory Index</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Cost (Credits 🜔)</label>
              <input
                type="number"
                value={cost}
                onChange={e => setCost(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a detailed description of capability functions..."
              className="w-full h-20 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowPublish(false)}
              className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 rounded text-xs text-slate-450"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-neonBlue hover:bg-blue-600 rounded text-xs text-white"
            >
              List Item
            </button>
          </div>
        </form>
      )}

      {/* Global Shopper context selection */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-xs">
          <span className="text-slate-400 font-semibold uppercase">Active Purchasing Agent Context:</span>
          <span className="block text-[11px] text-slate-500 mt-0.5">Purchase plugins for this agent using its earned credits.</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <select
            value={selectedAgentUaid}
            onChange={e => setSelectedAgentUaid(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-neonBlue outline-none"
          >
            <option value="">Choose Agent</option>
            {agents.map(a => (
              <option key={a.uaid} value={a.uaid}>{a.name} ({a.balance.toFixed(1)} 🜔)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of marketplace items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketItems.map((itm) => (
          <div key={itm.id} className="glass p-4.5 rounded-xl border-slate-850 flex flex-col justify-between h-56 hover:border-slate-700 transition">
            <div>
              <div className="flex justify-between items-start">
                <span className="p-2 bg-slate-900 border border-slate-850 rounded">
                  {getItemIcon(itm.type)}
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded">
                  {itm.type.replace('_', ' ')}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 mt-3">{itm.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal line-clamp-3">{itm.description}</p>
            </div>

            <div className="border-t border-slate-900 pt-3.5 mt-3 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Cost</span>
                <span className="font-extrabold text-neonGreen font-mono">{itm.cost.toFixed(0)} 🜔</span>
              </div>

              <button
                onClick={() => {
                  if (!selectedAgentUaid) {
                    alert("Please select a buying agent node.");
                    return;
                  }
                  buyMarketItem(itm.id, selectedAgentUaid);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded font-semibold text-slate-200 hover:text-white transition"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-neonCyan" />
                <span>Buy</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

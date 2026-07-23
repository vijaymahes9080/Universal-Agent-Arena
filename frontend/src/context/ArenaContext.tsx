import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Genome {
  planning: number;
  memory: number;
  speed: number;
  reasoning: number;
  coding: number;
  creativity: number;
  negotiation: number;
  collaboration: number;
  risk_taking: number;
}

export interface Agent {
  id: number;
  uaid: string;
  name: string;
  version: string;
  creator: string;
  license: string;
  model: string;
  genome: Genome;
  reputation: number;
  balance: number;
  trust_score: number;
  health: number;
  status: string;
  evolution_tier: number;
  capabilities: string[];
  created_at: string;
}

export interface BattleStep {
  step_index: number;
  step_name: string;
  agent_uaid: string;
  thoughts: string;
  content: string;
  timestamp: string;
}

export interface Battle {
  id: number;
  mode: string;
  task_name: string;
  status: string;
  agent_ids: string[];
  scores: Record<string, number> | null;
  metrics: Record<string, any> | null;
  log_timeline: BattleStep[] | null;
  winner_uaid: string | null;
  created_at: string;
}

export interface MarketItem {
  id: number;
  type: string;
  name: string;
  description: string;
  creator_uaid: string;
  cost: number;
  downloads: number;
  code_content: string;
  created_at: string;
}

export interface SimLog {
  id: number;
  tick: number;
  event_type: string;
  details: any;
  timestamp: string;
}

interface ArenaContextType {
  agents: Agent[];
  battles: Battle[];
  marketItems: MarketItem[];
  simLogs: SimLog[];
  activeBattle: Battle | null;
  connected: boolean;
  refreshAgents: () => Promise<void>;
  refreshBattles: () => Promise<void>;
  refreshMarket: () => Promise<void>;
  refreshSimLogs: () => Promise<void>;
  registerAgent: (name: string, model: string, creator: string, genome?: Genome) => Promise<void>;
  startBattle: (mode: string, taskName: string, agentUAIDs: string[]) => Promise<number | null>;
  buyMarketItem: (itemId: number, buyerUaid: string) => Promise<void>;
  evolveAgent: (uaid: string, mode: 'mutation' | 'tier_upgrade') => Promise<void>;
  setActiveBattleById: (id: number) => Promise<void>;
}

const ArenaContext = createContext<ArenaContextType | undefined>(undefined);

export const ArenaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [simLogs, setSimLogs] = useState<SimLog[]>([]);
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  const API_HOST = window.location.hostname || 'localhost';
  const API_URL = `http://${API_HOST}:8000/api`;
  const WS_URL = `ws://${API_HOST}:8000/api/ws`;

  const refreshAgents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/agents`);
      if (res.ok) setAgents(await res.json());
    } catch (e) {
      console.error("Error fetching agents", e);
    }
  }, [API_URL]);

  const refreshBattles = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/battles`);
      if (res.ok) setBattles(await res.json());
    } catch (e) {
      console.error("Error fetching battles", e);
    }
  }, [API_URL]);

  const refreshMarket = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/marketplace`);
      if (res.ok) setMarketItems(await res.json());
    } catch (e) {
      console.error("Error fetching market", e);
    }
  }, [API_URL]);

  const refreshSimLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/simulation/logs`);
      if (res.ok) setSimLogs(await res.json());
    } catch (e) {
      console.error("Error fetching simulation logs", e);
    }
  }, [API_URL]);

  const setActiveBattleById = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/battles/${id}`);
      if (res.ok) {
        setActiveBattle(await res.json());
      }
    } catch (e) {
      console.error("Error fetching battle details", e);
    }
  };

  const registerAgent = async (name: string, model: string, creator: string, genome?: Genome) => {
    try {
      const res = await fetch(`${API_URL}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, model, creator, custom_genome: genome })
      });
      if (res.ok) await refreshAgents();
    } catch (e) {
      console.error("Error registering agent", e);
    }
  };

  const startBattle = async (mode: string, taskName: string, agentUAIDs: string[]) => {
    try {
      const res = await fetch(`${API_URL}/battles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, task_name: taskName, agent_uaids: agentUAIDs })
      });
      if (res.ok) {
        const data = await res.json();
        await refreshBattles();
        // Clear old active battle steps
        setActiveBattle({
          id: data.battle_id,
          mode,
          task_name: taskName,
          status: 'pending',
          agent_ids: agentUAIDs,
          scores: null,
          metrics: null,
          log_timeline: [],
          winner_uaid: null,
          created_at: new Date().toISOString()
        });
        return data.battle_id;
      }
    } catch (e) {
      console.error("Error starting battle", e);
    }
    return null;
  };

  const buyMarketItem = async (itemId: number, buyerUaid: string) => {
    try {
      const res = await fetch(`${API_URL}/marketplace/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, buyer_uaid: buyerUaid })
      });
      if (res.ok) {
        await refreshAgents();
        await refreshMarket();
      } else {
        const errorData = await res.json();
        alert(`Purchase failed: ${errorData.detail || 'unknown error'}`);
      }
    } catch (e) {
      console.error("Error buying market item", e);
    }
  };

  const evolveAgent = async (uaid: string, mode: 'mutation' | 'tier_upgrade') => {
    try {
      const res = await fetch(`${API_URL}/agents/${uaid}/evolve?mode=${mode}`, {
        method: 'POST'
      });
      if (res.ok) {
        await refreshAgents();
      } else {
        const errorData = await res.json();
        alert(`Evolution failed: ${errorData.detail || 'unknown error'}`);
      }
    } catch (e) {
      console.error("Error evolving agent", e);
    }
  };

  // WebSocket Connection for Live Feed
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: any;

    const connectWS = () => {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setConnected(true);
        console.log("WebSocket connected to Telemetry Engine");
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { event: evName, data } = payload;

          if (evName === 'agent_registered' || evName === 'agent_evolved') {
            refreshAgents();
          } else if (evName === 'market_purchase') {
            refreshAgents();
            refreshMarket();
          } else if (evName === 'simulation_tick') {
            setSimLogs((prev) => [data as SimLog, ...prev.slice(0, 49)]);
            refreshAgents(); // Balances shift on ticks
          } else if (evName === 'battle_started') {
            refreshBattles();
            setActiveBattle((prev) => {
              if (prev && prev.id === data.id) {
                return { ...prev, status: 'running', log_timeline: [] };
              }
              return {
                id: data.id,
                mode: data.mode,
                task_name: data.task_name,
                status: 'running',
                agent_ids: data.agents.map((ag: any) => ag.uaid),
                scores: null,
                metrics: null,
                log_timeline: [],
                winner_uaid: null,
                created_at: new Date().toISOString()
              };
            });
          } else if (evName === 'battle_step') {
            setActiveBattle((prev) => {
              if (prev && prev.id === data.battle_id) {
                const currentTimeline = prev.log_timeline || [];
                // Prevent duplicate logs if any
                const exists = currentTimeline.some(
                  (step) => step.step_index === data.step.step_index && step.agent_uaid === data.step.agent_uaid
                );
                if (exists) return prev;
                return {
                  ...prev,
                  log_timeline: [...currentTimeline, data.step]
                };
              }
              return prev;
            });
          } else if (evName === 'battle_completed') {
            refreshBattles();
            refreshAgents();
            setActiveBattle((prev) => {
              if (prev && prev.id === data.id) {
                return {
                  ...prev,
                  status: 'completed',
                  winner_uaid: data.winner,
                  scores: data.scores,
                  metrics: data.metrics
                };
              }
              return prev;
            });
          }
        } catch (e) {
          console.error("Error parsing WS payload", e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        console.log("WebSocket connection closed. Retrying in 3s...");
        reconnectTimeout = setTimeout(connectWS, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error, closing...", err);
        ws.close();
      };
    };

    connectWS();

    // Initial fetch
    refreshAgents();
    refreshBattles();
    refreshMarket();
    refreshSimLogs();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [refreshAgents, refreshBattles, refreshMarket, refreshSimLogs, WS_URL]);

  return (
    <ArenaContext.Provider value={{
      agents,
      battles,
      marketItems,
      simLogs,
      activeBattle,
      connected,
      refreshAgents,
      refreshBattles,
      refreshMarket,
      refreshSimLogs,
      registerAgent,
      startBattle,
      buyMarketItem,
      evolveAgent,
      setActiveBattleById
    }}>
      {children}
    </ArenaContext.Provider>
  );
};

export const useArena = () => {
  const context = useContext(ArenaContext);
  if (context === undefined) {
    throw new Error('useArena must be used within an ArenaProvider');
  }
  return context;
};

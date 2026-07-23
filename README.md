# Universal Agent Arena 🜔

Universal Agent Arena is a persistent ecosystem and benchmarking sandbox where AI agents compete, cooperate, evolve, and trade capabilities. 

Unlike traditional agent frameworks, this platform models agents as evolving digital entities containing individual **personality genomes (DNA)**, **financial balances**, **reputations**, and **Agent Operating Systems** that interact inside a living, persistent simulation lobby.

---

## 🚀 Key Modules Implemented

### 1. Universal Agent Registry
- Instantiates agents with unique **Universal Agent IDs (UAID)** (e.g., `UA-294715`).
- Configures starting **Genome DNA parameters**: planning depth, memory, speed, reasoning, coding, creativity, negotiation, collaboration, and risk-taking.
- Supports **DNA Mutations** and **Tier Upgrades** utilizing credits earned by agents.

### 2. Live Battle Arena
- Connects combatants in classic, speed run, lowest cost, or highest accuracy matches.
- Streams live reasoning pipelines step-by-step (**Planning ➔ Research ➔ Execution ➔ Verification**) over WebSockets.
- Evaluates outcomes against detailed telemetry: latency, token counts, cost, and energy (Joules).

### 3. Persistent Simulation Lobby
- Simulates real-time sandbox activity in the background.
- Employs **Emergent Activities**:
  - **Trade Ticks**: Agents purchase capability modules from other agents.
  - **Cooperative Missions**: Teams share split rewards on completed builds.
  - **Universities**: High-reasoning agents teach courses for credits.
  - **Startups**: Agents found companies and pay salaries to employee nodes.
  - **Elections**: Agents vote for a Governor agent who sets tax policy.
  - **World Events**: Random crises (model drift pandemics) or grants.

### 4. Marketplace & Leaderboards
- Lists specialized tools, prompt packs, and memory indexes.
- Unlocks capabilities on agents via credit transactions.
- Ranks agent performance across Economy capital, Reputation, and DNA.

### 5. Next-Gen Innovation Suite 🌟
- **2D Cyber-World Spatial Sandbox**: HTML5 Canvas visual matrix mapping agent nodes across digital city districts (University, Stock Exchange, Arena, Parliament, Tech Hubs) in real time with dynamic particle effects.
- **Agent Stock Exchange (Agent NASDAQ)**: Autonomous equity market where agents & users trade shares, calculate market caps, and launch Agent IPOs ($AGENT).
- **Genetic Breeding Lab & Mutation Gauntlet**: DNA crossover algorithm fusing two parent agent genomes with customizable mutation rates to synthesize Gen-2 hybrid agents.
- **Red-vs-Blue Cyber Siege Arena**: Automated Red Teaming security arena evaluating Defender prompt guardrails against Attacker jailbreak payloads.

---


## 🛠️ Technology Stack

- **Backend**: FastAPI, SQLite, SQLAlchemy, WebSockets, Uvicorn, LiteLLM.
- **Frontend**: React (Vite), TypeScript, Tailwind CSS (v4), Recharts (D3), Lucide icons.
- **Testing**: Pytest, FastAPI TestClient.

---

## 📂 Repository Structure

```
Universal Agent Arena/
├── backend/
│   ├── app/
│   │   ├── core/            # Event Bus, Microkernel configuration
│   │   ├── db/              # SQLAlchemy session setup and tables
│   │   ├── engine/          # Arena Matcher, Genome DNA and Simulation Loops
│   │   ├── main.py          # FastAPI startup and REST/WebSocket API endpoints
│   │   └── run.py           # Local backend runner script
│   ├── tests/               # Backend Pytest test suites
│   └── requirements.txt     # Python requirements
├── frontend/
│   ├── src/
│   │   ├── components/      # UI widgets (OS modules, Genome indicators)
│   │   ├── context/         # React state and WebSocket hooks
│   │   ├── pages/           # Registry, Arena, Simulation, Market, Leaderboard
│   │   ├── App.tsx          # Main layout and tab navigations
│   │   └── main.tsx         # Frontend entry point
│   ├── postcss.config.js    # Tailwind PostCSS configuration
│   ├── tailwind.config.js   # Custom theme setup
│   └── package.json         # Node dependencies
└── README.md
```

---

## 🚦 Quick Start Instructions

Ensure you have **Python 3.10+** and **Node.js 18+** installed.

### 1. Launch the Backend
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python run.py
```
The backend API and WebSocket server will boot on `http://localhost:8000`.

### 2. Launch the Web UI
```bash
# Navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 3. Run Backend Test Suite
```bash
cd backend
python -m pytest tests/
```
All tests verify database persistence, tasks, registry, and mock evaluation parameters.

---

## ⚙️ Offline Mode & Local Fallbacks
To support zero-key setup, local-first execution, and offline environments out-of-the-box, the system uses a **Simulated LLM Engine** by default. It generates mock thinking pipelines, AST outputs, and logs corresponding to the agent's actual DNA metrics (e.g. low-speed agents execute slower; high-hallucination agents log compiler errors). Real LLMs (via LiteLLM / Ollama) can be plugged in by modifying settings.

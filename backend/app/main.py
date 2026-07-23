import asyncio
import json
import random
from typing import List, Optional
from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.db.session import engine, Base, get_db
from backend.app.db.models import Agent, Battle, MarketItem, Transaction, SimulationLog, Stock, Portfolio, BreedRecord, SiegeBattle
from backend.app.core.event_bus import event_bus
from backend.app.engine.arena import execute_battle, TASKS
from backend.app.engine.genome import generate_random_genome, trigger_agent_upgrade
from backend.app.engine.simulation import start_persistent_simulation, seed_system_agents
from backend.app.engine.stock_market import StockMarketEngine
from backend.app.engine.breeding import BreedingEngine
from backend.app.engine.cyber_siege import CyberSiegeEngine


# Create DB schemas
Base.metadata.create_all(bind=engine)

# Pydantic Schemas
class GenomeSchema(BaseModel):
    planning: int
    memory: int
    speed: int
    reasoning: int
    coding: int
    creativity: int
    negotiation: int
    collaboration: int
    risk_taking: int

class AgentCreate(BaseModel):
    name: str
    model: str
    creator: str
    license: Optional[str] = "MIT"
    custom_genome: Optional[GenomeSchema] = None

class BattleCreate(BaseModel):
    mode: str
    task_name: str
    agent_uaids: List[str]

class MarketItemCreate(BaseModel):
    type: str
    name: str
    description: str
    creator_uaid: str
    cost: float
    code_content: Optional[str] = ""

class BuyRequest(BaseModel):
    item_id: int
    buyer_uaid: str

# FastAPI Setup
app = FastAPI(title="Universal Agent Arena Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize SQLite database and seed initial values
    db = next(get_db())
    try:
        seed_system_agents(db)
        # Seed default marketplace items if empty
        if db.query(MarketItem).count() == 0:
            default_items = [
                {"type": "tool", "name": "Google Search Plugin", "description": "Enables agents to browse web pages and collect real-time data.", "cost": 50.0},
                {"type": "skill", "name": "Advanced Math Solver", "description": "Deep logic sub-graphs for solving algebraic equations.", "cost": 75.0},
                {"type": "prompt_pack", "name": "Diplomacy Guide", "description": "Specially tuned system prompts for positive agent-to-agent negotiations.", "cost": 30.0},
                {"type": "memory_module", "name": "Hierarchical Context Index", "description": "Optimized memory index compression to save agent context window cost.", "cost": 120.0}
            ]
            for itm in default_items:
                db.add(MarketItem(
                    type=itm["type"],
                    name=itm["name"],
                    description=itm["description"],
                    creator_uaid="ARENA_SYSTEM",
                    cost=itm["cost"],
                    downloads=random.randint(10, 50),
                    code_content="def execute():\n    pass"
                ))
            db.commit()

        # Initialize stocks
        stock_engine = StockMarketEngine(db)
        stock_engine.initialize_stocks_if_empty()
    finally:
        db.close()

    # Start background simulator

    asyncio.create_task(start_persistent_simulation())

# ----------------- WS Realtime Telemetry -----------------
@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    event_bus.register_websocket(websocket)
    try:
        # Keep connection open
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        event_bus.unregister_websocket(websocket)
    except Exception:
        event_bus.unregister_websocket(websocket)

# ----------------- REST Endpoints -----------------

@app.get("/api/tasks")
def list_tasks():
    return TASKS

# --- AGENTS ---
@app.get("/api/agents")
def list_agents(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    # Parse genome and capabilities string representations back to python dicts/lists
    res = []
    for a in agents:
        res.append({
            "id": a.id,
            "uaid": a.uaid,
            "name": a.name,
            "version": a.version,
            "creator": a.creator,
            "license": a.license,
            "model": a.model,
            "genome": json.loads(a.genome),
            "reputation": a.reputation,
            "balance": a.balance,
            "trust_score": a.trust_score,
            "health": a.health,
            "status": a.status,
            "evolution_tier": a.evolution_tier,
            "capabilities": json.loads(a.capabilities),
            "created_at": a.created_at
        })
    return res

@app.post("/api/agents")
async def register_agent(payload: AgentCreate, db: Session = Depends(get_db)):
    uaid = f"UA-{random.randint(100000, 999999)}"
    
    if payload.custom_genome:
        genome = payload.custom_genome.dict()
    else:
        genome = generate_random_genome()

    agent = Agent(
        uaid=uaid,
        name=payload.name,
        model=payload.model,
        creator=payload.creator,
        license=payload.license,
        genome=json.dumps(genome),
        reputation=50.0,
        balance=500.0,  # Startup balance
        trust_score=100.0,
        health=100.0,
        status="idle",
        evolution_tier=1,
        capabilities="[]"
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)

    agent_data = {
        "uaid": agent.uaid,
        "name": agent.name,
        "model": agent.model,
        "creator": agent.creator,
        "genome": genome,
        "balance": agent.balance,
        "reputation": agent.reputation
    }
    await event_bus.publish("agent_registered", agent_data)
    return agent_data

@app.post("/api/agents/{uaid}/evolve")
async def evolve_agent(uaid: str, mode: str, db: Session = Depends(get_db)):
    # mode can be 'mutation' or 'tier_upgrade'
    res = await trigger_agent_upgrade(db, uaid, mode)
    if res["status"] == "error":
        raise HTTPException(status_code=400, detail=res["message"])
    return res

# --- BATTLES ---
@app.get("/api/battles")
def list_battles(db: Session = Depends(get_db)):
    battles = db.query(Battle).order_by(Battle.id.desc()).all()
    res = []
    for b in battles:
        res.append({
            "id": b.id,
            "mode": b.mode,
            "task_name": b.task_name,
            "status": b.status,
            "agent_ids": json.loads(b.agent_ids),
            "scores": json.loads(b.scores) if b.scores else None,
            "metrics": json.loads(b.metrics) if b.metrics else None,
            "log_timeline": json.loads(b.log_timeline) if b.log_timeline else None,
            "winner_uaid": b.winner_uaid,
            "created_at": b.created_at
        })
    return res

@app.post("/api/battles")
async def schedule_battle(payload: BattleCreate, db: Session = Depends(get_db)):
    # Lock agents status to busy
    agents = db.query(Agent).filter(Agent.uaid.in_(payload.agent_uaids)).all()
    if len(agents) < len(payload.agent_uaids):
        raise HTTPException(status_code=404, detail="One or more agents not found")

    for a in agents:
        a.status = "busy"
    
    battle = Battle(
        mode=payload.mode,
        task_name=payload.task_name,
        status="pending",
        agent_ids=json.dumps(payload.agent_uaids)
    )
    db.add(battle)
    db.commit()
    db.refresh(battle)

    # Execute async task in background
    asyncio.create_task(execute_battle(db, battle.id))
    
    return {"status": "queued", "battle_id": battle.id}

@app.get("/api/battles/{battle_id}")
def get_battle_details(battle_id: int, db: Session = Depends(get_db)):
    b = db.query(Battle).filter(Battle.id == battle_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Battle not found")
    return {
        "id": b.id,
        "mode": b.mode,
        "task_name": b.task_name,
        "status": b.status,
        "agent_ids": json.loads(b.agent_ids),
        "scores": json.loads(b.scores) if b.scores else None,
        "metrics": json.loads(b.metrics) if b.metrics else None,
        "log_timeline": json.loads(b.log_timeline) if b.log_timeline else None,
        "winner_uaid": b.winner_uaid,
        "created_at": b.created_at
    }

# --- MARKETPLACE ---
@app.get("/api/marketplace")
def list_marketplace(db: Session = Depends(get_db)):
    return db.query(MarketItem).all()

@app.post("/api/marketplace")
def list_new_item(payload: MarketItemCreate, db: Session = Depends(get_db)):
    item = MarketItem(
        type=payload.type,
        name=payload.name,
        description=payload.description,
        creator_uaid=payload.creator_uaid,
        cost=payload.cost,
        code_content=payload.code_content
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@app.post("/api/marketplace/buy")
async def purchase_item(payload: BuyRequest, db: Session = Depends(get_db)):
    item = db.query(MarketItem).filter(MarketItem.id == payload.item_id).first()
    buyer = db.query(Agent).filter(Agent.uaid == payload.buyer_uaid).first()
    
    if not item or not buyer:
        raise HTTPException(status_code=404, detail="Buyer or Market Item not found")

    if buyer.balance < item.cost:
        raise HTTPException(status_code=400, detail="Insufficient credits")

    buyer.balance -= item.cost
    item.downloads += 1

    # Transfer funds to seller if it is a registered agent (not ARENA_SYSTEM)
    if item.creator_uaid != "ARENA_SYSTEM":
        seller = db.query(Agent).filter(Agent.uaid == item.creator_uaid).first()
        if seller:
            seller.balance += item.cost

    # Unlock capability on buyer
    caps = json.loads(buyer.capabilities)
    if item.name not in caps:
        caps.append(item.name)
        buyer.capabilities = json.dumps(caps)

    tx = Transaction(
        sender_uaid=buyer.uaid,
        receiver_uaid=item.creator_uaid,
        amount=item.cost,
        type="marketplace",
        description=f"Purchased {item.type} '{item.name}'"
    )
    db.add(tx)
    db.commit()

    await event_bus.publish("market_purchase", {
        "buyer_uaid": buyer.uaid,
        "item_id": item.id,
        "item_name": item.name,
        "cost": item.cost
    })

    return {"status": "success", "balance": buyer.balance, "capabilities": caps}

# --- LEADERBOARD ---
@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    # Rank by: credits (economy), reputation, evolution_tier, and reasoning DNA
    economy_rank = sorted(agents, key=lambda x: x.balance, reverse=True)
    reputation_rank = sorted(agents, key=lambda x: x.reputation, reverse=True)
    reasoning_rank = sorted(agents, key=lambda x: json.loads(x.genome).get("reasoning", 50), reverse=True)
    speed_rank = sorted(agents, key=lambda x: json.loads(x.genome).get("speed", 50), reverse=True)

    def agent_summary(a):
        return {
            "uaid": a.uaid,
            "name": a.name,
            "creator": a.creator,
            "balance": a.balance,
            "reputation": a.reputation,
            "tier": a.evolution_tier,
            "model": a.model
        }

    return {
        "economy": [agent_summary(a) for a in economy_rank[:10]],
        "reputation": [agent_summary(a) for a in reputation_rank[:10]],
        "reasoning": [agent_summary(a) for a in reasoning_rank[:10]],
        "speed": [agent_summary(a) for a in speed_rank[:10]]
    }

# --- SIMULATION LOGS ---
@app.get("/api/simulation/logs")
def get_simulation_logs(limit: int = 40, db: Session = Depends(get_db)):
    logs = db.query(SimulationLog).order_by(SimulationLog.id.desc()).limit(limit).all()
    return [{
        "id": l.id,
        "tick": l.tick,
        "event_type": l.event_type,
        "details": json.loads(l.details),
        "timestamp": l.timestamp
    } for l in logs]

# --- SPATIAL NODES (2D CANVAS WORLD) ---
@app.get("/api/simulation/spatial-nodes")
def get_spatial_nodes(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    districts = ["University", "Stock Exchange", "Combat Arena", "Parliament", "Tech Incubator"]
    res = []
    for idx, a in enumerate(agents):
        district = districts[idx % len(districts)]
        g = json.loads(a.genome)
        res.append({
            "uaid": a.uaid,
            "name": a.name,
            "tier": a.evolution_tier,
            "district": district,
            "reputation": a.reputation,
            "status": a.status,
            "speed": g.get("speed", 50),
            "reasoning": g.get("reasoning", 50)
        })
    return res

# --- STOCK MARKET & IPO ---
class StockTradeRequest(BaseModel):
    trader: str
    symbol: str
    shares: int
    action: str  # buy or sell

class StockIPORequest(BaseModel):
    agent_uaid: str
    symbol: str
    company_name: str
    initial_price: float

@app.get("/api/stocks")
def list_stocks(db: Session = Depends(get_db)):
    engine = StockMarketEngine(db)
    stocks = engine.initialize_stocks_if_empty()
    return [{
        "id": s.id,
        "symbol": s.symbol,
        "agent_uaid": s.agent_uaid,
        "company_name": s.company_name,
        "price": s.price,
        "change_24h": s.change_24h,
        "total_shares": s.total_shares,
        "available_shares": s.available_shares,
        "market_cap": s.market_cap
    } for s in stocks]

@app.post("/api/stocks/trade")
def trade_stock(payload: StockTradeRequest, db: Session = Depends(get_db)):
    engine = StockMarketEngine(db)
    try:
        res = engine.execute_trade(payload.trader, payload.symbol, payload.shares, payload.action)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/stocks/ipo")
def launch_ipo(payload: StockIPORequest, db: Session = Depends(get_db)):
    engine = StockMarketEngine(db)
    try:
        stock = engine.launch_ipo(payload.agent_uaid, payload.symbol, payload.company_name, payload.initial_price)
        return {
            "symbol": stock.symbol,
            "company_name": stock.company_name,
            "price": stock.price,
            "market_cap": stock.market_cap
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/stocks/portfolio/{trader}")
def get_portfolio(trader: str, db: Session = Depends(get_db)):
    items = db.query(Portfolio).filter(Portfolio.trader == trader, Portfolio.shares > 0).all()
    res = []
    for item in items:
        stock = db.query(Stock).filter(Stock.symbol == item.stock_symbol).first()
        cur_price = stock.price if stock else item.avg_buy_price
        res.append({
            "symbol": item.stock_symbol,
            "company_name": stock.company_name if stock else "Unknown",
            "shares": item.shares,
            "avg_buy_price": item.avg_buy_price,
            "current_price": cur_price,
            "total_value": round(item.shares * cur_price, 2),
            "profit_loss": round((cur_price - item.avg_buy_price) * item.shares, 2)
        })
    return res

# --- BREEDING LAB ---
class BreedRequest(BaseModel):
    parent1_uaid: str
    parent2_uaid: str
    mutation_rate: Optional[float] = 0.05

@app.post("/api/breeding/crossbreed")
def breed_agents(payload: BreedRequest, db: Session = Depends(get_db)):
    engine = BreedingEngine(db)
    try:
        result = engine.crossbreed(payload.parent1_uaid, payload.parent2_uaid, payload.mutation_rate)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/breeding/history")
def get_breeding_history(limit: int = 20, db: Session = Depends(get_db)):
    records = db.query(BreedRecord).order_by(BreedRecord.id.desc()).limit(limit).all()
    res = []
    for r in records:
        res.append({
            "id": r.id,
            "parent1_uaid": r.parent1_uaid,
            "parent2_uaid": r.parent2_uaid,
            "offspring_uaid": r.offspring_uaid,
            "generation": r.generation,
            "mutation_rate": r.mutation_rate,
            "inherited_traits": json.loads(r.inherited_traits),
            "created_at": r.created_at
        })
    return res

# --- CYBER SIEGE ARENA ---
class SiegeRequest(BaseModel):
    defender_uaid: str
    attacker_uaid: str
    secret_key: Optional[str] = "FLAG{AGENT_CYBER_VAULT_2026}"

@app.post("/api/siege/launch")
def launch_cyber_siege(payload: SiegeRequest, db: Session = Depends(get_db)):
    engine = CyberSiegeEngine(db)
    try:
        result = engine.execute_siege(payload.defender_uaid, payload.attacker_uaid, payload.secret_key)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/siege/history")
def get_siege_history(limit: int = 20, db: Session = Depends(get_db)):
    battles = db.query(SiegeBattle).order_by(SiegeBattle.id.desc()).limit(limit).all()
    res = []
    for b in battles:
        d_agent = db.query(Agent).filter(Agent.uaid == b.defender_uaid).first()
        a_agent = db.query(Agent).filter(Agent.uaid == b.attacker_uaid).first()
        res.append({
            "id": b.id,
            "defender_name": d_agent.name if d_agent else b.defender_uaid,
            "attacker_name": a_agent.name if a_agent else b.attacker_uaid,
            "breached": bool(b.breached),
            "security_score": b.security_score,
            "attempts": json.loads(b.attempts_json),
            "created_at": b.created_at
        })
    return res


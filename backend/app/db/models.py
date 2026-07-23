import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from backend.app.db.session import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    uaid = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    version = Column(String, default="1.0.0")
    creator = Column(String, default="System")
    license = Column(String, default="MIT")
    model = Column(String, default="mock-agent-v1")
    
    # JSON containing genome parameters
    # planning, memory, speed, reasoning, coding, creativity, negotiation, collaboration, risk_taking
    genome = Column(Text, nullable=False)
    
    reputation = Column(Float, default=50.0)
    balance = Column(Float, default=1000.0)
    trust_score = Column(Float, default=100.0)
    health = Column(Float, default=100.0)
    status = Column(String, default="idle")  # idle, busy, simulating
    evolution_tier = Column(Integer, default=1)
    
    # JSON list of unlocked skills or capabilities
    capabilities = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Battle(Base):
    __tablename__ = "battles"

    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String, nullable=False)  # classic, speed_run, lowest_cost, highest_accuracy, long_memory, blind_reasoning, adversarial
    task_name = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, running, completed, failed
    
    # JSON list of UAIDs
    agent_ids = Column(Text, nullable=False)
    
    # JSON dict of UAID -> score
    scores = Column(Text, nullable=True)
    
    # JSON dict of UAID -> {token_usage, latency, energy, cost, planning_depth, hallucination_rate, reasoning_depth}
    metrics = Column(Text, nullable=True)
    
    # JSON list of actions: {step, agent_uaid, type: "thinking"|"tool_call"|"output", content, thoughts, timestamp}
    log_timeline = Column(Text, nullable=True)
    
    winner_uaid = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MarketItem(Base):
    __tablename__ = "market_items"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # tool, skill, plugin, prompt_pack, memory_module
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    creator_uaid = Column(String, nullable=False)
    cost = Column(Float, default=0.0)
    downloads = Column(Integer, default=0)
    code_content = Column(Text, nullable=True)  # Mock implementation content
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    sender_uaid = Column(String, nullable=False)
    receiver_uaid = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # marketplace, reward, fee, tax
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class SimulationLog(Base):
    __tablename__ = "simulation_logs"

    id = Column(Integer, primary_key=True, index=True)
    tick = Column(Integer, nullable=False)
    event_type = Column(String, nullable=False)  # trade, diplomacy, collaborative_mission, election, university, startup, world_event
    details = Column(Text, nullable=False)  # JSON representation of participants and outcomes
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

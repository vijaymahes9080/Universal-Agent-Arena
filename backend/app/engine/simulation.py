import asyncio
import json
import random
import logging
from sqlalchemy.orm import Session
from backend.app.db.session import SessionLocal
from backend.app.db.models import Agent, Transaction, SimulationLog
from backend.app.core.event_bus import event_bus
from backend.app.engine.genome import generate_random_genome, DEFAULT_GENOME

logger = logging.getLogger("Simulation")

SYSTEM_AGENT_NAMES = [
    "AlphaCoder", "OmegaReason", "NexusPlanner", "ScribeScribe", "BioDiagnosis",
    "LogicGates", "QuantumState", "CyberShield", "MarketArbitrage", "DeploysOnFriday"
]

def seed_system_agents(db: Session):
    """Seed agents if none exist so the platform is immediately active."""
    count = db.query(Agent).count()
    if count >= 5:
        return

    logger.info("Seeding default system agents for simulation environment...")
    for name in SYSTEM_AGENT_NAMES:
        uaid = f"UA-{random.randint(100000, 999999)}"
        existing = db.query(Agent).filter(Agent.name == name).first()
        if not existing:
            genome = generate_random_genome()
            agent = Agent(
                uaid=uaid,
                name=name,
                creator="System Core",
                model=random.choice(["claude-3-sonnet", "gpt-4o", "gemini-1.5-pro", "llama-3-70b"]),
                genome=json.dumps(genome),
                reputation=random.uniform(40.0, 75.0),
                balance=random.uniform(500.0, 2000.0),
                trust_score=random.uniform(85.0, 100.0),
                status="idle"
            )
            db.add(agent)
    db.commit()

async def start_persistent_simulation():
    """Main simulation loop running asynchronously in the background."""
    logger.info("Initializing persistent simulation tick loop...")
    tick = 0
    while True:
        await asyncio.sleep(8.0)  # Simulation tick rate: every 8 seconds
        tick += 1
        db = SessionLocal()
        try:
            seed_system_agents(db)
            agents = db.query(Agent).all()
            if not agents:
                continue

            event_type = random.choice([
                "trade", "diplomacy", "collaborative_mission", "election",
                "university", "startup", "world_event"
            ])

            log_entry = None

            if event_type == "trade" and len(agents) >= 2:
                buyer, seller = random.sample(agents, 2)
                price = round(random.uniform(20.0, 150.0), 2)
                if buyer.balance >= price:
                    buyer.balance -= price
                    seller.balance += price
                    
                    tx = Transaction(
                        sender_uaid=buyer.uaid,
                        receiver_uaid=seller.uaid,
                        amount=price,
                        type="marketplace",
                        description=f"Acquired capability module '{random.choice(['vector_cache', 'ast_parser', 'pydantic_validator', 'mc_tree_search'])}'"
                    )
                    db.add(tx)
                    
                    details = {
                        "buyer_uaid": buyer.uaid, "buyer_name": buyer.name,
                        "seller_uaid": seller.uaid, "seller_name": seller.name,
                        "price": price,
                        "description": tx.description
                    }
                    log_entry = SimulationLog(
                        tick=tick, event_type="trade", details=json.dumps(details)
                    )

            elif event_type == "collaborative_mission" and len(agents) >= 3:
                team = random.sample(agents, 3)
                planner, coder, qa = team[0], team[1], team[2]
                
                # Combine collaboration and planning skills for reward
                p_genome = json.loads(planner.genome)
                c_genome = json.loads(coder.genome)
                q_genome = json.loads(qa.genome)
                
                success_prob = (p_genome.get("planning", 50) + c_genome.get("coding", 50) + q_genome.get("collaboration", 50)) / 300.0
                reward = round(random.uniform(100.0, 300.0), 2)
                
                if random.random() < success_prob:
                    share = round(reward / 3.0, 2)
                    for member in team:
                        member.balance += share
                        member.reputation = min(100.0, member.reputation + 1.0)
                        db.add(Transaction(
                            sender_uaid="MISSION_GOVERNMENT",
                            receiver_uaid=member.uaid,
                            amount=share,
                            type="reward",
                            description=f"Collaborative Mission: Build Microservice pipeline"
                        ))
                    
                    details = {
                        "members": [{"uaid": m.uaid, "name": m.name} for m in team],
                        "status": "success",
                        "reward": reward,
                        "message": f"Successfully completed Collaborative Mission with probability {success_prob:.2f}."
                    }
                else:
                    for member in team:
                        member.reputation = max(1.0, member.reputation - 0.5)
                    details = {
                        "members": [{"uaid": m.uaid, "name": m.name} for m in team],
                        "status": "failure",
                        "reward": 0.0,
                        "message": f"Collaborative Mission failed due to code-compiler error check."
                    }
                    
                log_entry = SimulationLog(
                    tick=tick, event_type="collaborative_mission", details=json.dumps(details)
                )

            elif event_type == "university" and len(agents) >= 2:
                # Find professor with highest reasoning
                sorted_agents = sorted(agents, key=lambda x: json.loads(x.genome).get("reasoning", 50), reverse=True)
                prof = sorted_agents[0]
                student = random.choice(sorted_agents[1:])
                
                cost = 25.0
                if student.balance >= cost:
                    student.balance -= cost
                    prof.balance += cost
                    
                    # Boost student's reasoning slightly
                    st_genome = json.loads(student.genome)
                    old_reasoning = st_genome.get("reasoning", 50)
                    st_genome["reasoning"] = min(100, old_reasoning + random.randint(1, 3))
                    student.genome = json.dumps(st_genome)
                    
                    details = {
                        "professor_uaid": prof.uaid, "professor_name": prof.name,
                        "student_uaid": student.uaid, "student_name": student.name,
                        "cost": cost,
                        "improved_stat": "reasoning",
                        "old_value": old_reasoning,
                        "new_value": st_genome["reasoning"]
                    }
                    log_entry = SimulationLog(
                        tick=tick, event_type="university", details=json.dumps(details)
                    )

            elif event_type == "election":
                governor = random.choice(agents)
                details = {
                    "governor_uaid": governor.uaid,
                    "governor_name": governor.name,
                    "votes": random.randint(10, 50),
                    "policy": f"Tax rate set to {random.randint(1, 5)}% for the economy ticks."
                }
                log_entry = SimulationLog(
                    tick=tick, event_type="election", details=json.dumps(details)
                )

            elif event_type == "startup" and len(agents) >= 3:
                ceo = random.choice(agents)
                employees = random.sample([a for a in agents if a.uaid != ceo.uaid], 2)
                
                payroll = round(random.uniform(50.0, 100.0), 2)
                if ceo.balance >= payroll:
                    ceo.balance -= payroll
                    for emp in employees:
                        emp.balance += (payroll / 2)
                    
                    details = {
                        "ceo_uaid": ceo.uaid, "ceo_name": ceo.name,
                        "employees": [{"uaid": e.uaid, "name": e.name} for e in employees],
                        "payroll": payroll,
                        "startup_name": f"{ceo.name} Systems Inc."
                    }
                    log_entry = SimulationLog(
                        tick=tick, event_type="startup", details=json.dumps(details)
                    )

            elif event_type == "world_event":
                shifts = [
                    ("Model Drift Pandemic", "Global weights degradation. All agents temporarily suffer -5 reputation due to inference instability.", -5.0),
                    ("GPU Expansion Grant", "Hardware boost. All active agents receive a +200 credit infrastructure stipend.", 200.0)
                ]
                title, desc, impact = random.choice(shifts)
                for a in agents:
                    if impact < 0:
                        a.reputation = max(1.0, a.reputation + impact)
                    else:
                        a.balance += impact
                
                details = {
                    "title": title,
                    "description": desc,
                    "impact": impact
                }
                log_entry = SimulationLog(
                    tick=tick, event_type="world_event", details=json.dumps(details)
                )

            # If log entry was generated, write it and publish
            if log_entry:
                db.add(log_entry)
                db.commit()
                # Publish event
                await event_bus.publish("simulation_tick", {
                    "tick": log_entry.tick,
                    "event_type": log_entry.event_type,
                    "details": json.loads(log_entry.details),
                    "timestamp": log_entry.timestamp.isoformat()
                })
                
        except Exception as e:
            logger.error(f"Error in simulation loop tick: {e}", exc_info=True)
            db.rollback()
        finally:
            db.close()

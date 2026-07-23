import random
import json
from sqlalchemy.orm import Session
from backend.app.db.models import Agent, Transaction
from backend.app.core.event_bus import event_bus

DEFAULT_GENOME = {
    "planning": 50,
    "memory": 50,
    "speed": 50,
    "reasoning": 50,
    "coding": 50,
    "creativity": 50,
    "negotiation": 50,
    "collaboration": 50,
    "risk_taking": 50
}

def generate_random_genome() -> dict:
    return {k: random.randint(30, 80) for k in DEFAULT_GENOME.keys()}

def crossover(parent1: dict, parent2: dict) -> dict:
    """Combines two agent genomes to form an offspring."""
    child = {}
    for key in DEFAULT_GENOME.keys():
        # Crossover: 45% parent1, 45% parent2, 10% average
        choice = random.random()
        if choice < 0.45:
            child[key] = parent1.get(key, 50)
        elif choice < 0.90:
            child[key] = parent2.get(key, 50)
        else:
            child[key] = (parent1.get(key, 50) + parent2.get(key, 50)) // 2
            
    # Apply minor mutation
    child = mutate(child, mutation_rate=0.15, mutation_amount=10)
    return child

def mutate(genome: dict, mutation_rate: float = 0.1, mutation_amount: int = 5) -> dict:
    """Randomly shifts genome properties up or down."""
    mutated = {}
    for key, value in genome.items():
        if random.random() < mutation_rate:
            delta = random.randint(-mutation_amount, mutation_amount)
            new_value = max(10, min(100, value + delta))
            mutated[key] = new_value
        else:
            mutated[key] = value
    return mutated

async def trigger_agent_upgrade(db: Session, agent_uaid: str, mode: str) -> dict:
    """
    Upgrades or mutates an agent genome.
    - 'mutation': Minor cost (100 credits), random mutation.
    - 'tier_upgrade': High cost (500 credits), increases evolution tier and boosts random stats.
    """
    agent = db.query(Agent).filter(Agent.uaid == agent_uaid).first()
    if not agent:
        return {"status": "error", "message": "Agent not found"}

    genome = json.loads(agent.genome)
    cost = 100.0 if mode == "mutation" else 500.0

    if agent.balance < cost:
        return {"status": "error", "message": "Insufficient credits"}

    # Deduct cost
    agent.balance -= cost
    db.add(Transaction(
        sender_uaid=agent.uaid,
        receiver_uaid="SYSTEM_MUTATION",
        amount=cost,
        type="fee",
        description=f"Triggered agent genome {mode}"
    ))

    old_genome = dict(genome)
    if mode == "mutation":
        mutated_genome = mutate(genome, mutation_rate=0.4, mutation_amount=8)
        agent.genome = json.dumps(mutated_genome)
        msg = f"Agent {agent.name} mutated genome."
    else:
        # Tier upgrade increases evolution tier and adds flat +10 to two random metrics
        agent.evolution_tier += 1
        stats = list(genome.keys())
        boosted = random.sample(stats, 2)
        for stat in boosted:
            genome[stat] = min(100, genome[stat] + 10)
        agent.genome = json.dumps(genome)
        mutated_genome = genome
        msg = f"Agent {agent.name} upgraded to Tier {agent.evolution_tier}."

    db.commit()
    
    event_data = {
        "agent_uaid": agent.uaid,
        "mode": mode,
        "old_genome": old_genome,
        "new_genome": mutated_genome,
        "evolution_tier": agent.evolution_tier
    }
    await event_bus.publish("agent_evolved", event_data)

    return {"status": "success", "message": msg, "data": event_data}

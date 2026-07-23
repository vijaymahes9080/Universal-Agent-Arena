import random
import json
from sqlalchemy.orm import Session
from backend.app.db.models import Agent, BreedRecord

class BreedingEngine:
    def __init__(self, db: Session):
        self.db = db

    def crossbreed(self, parent1_uaid: str, parent2_uaid: str, mutation_rate: float = 0.05):
        p1 = self.db.query(Agent).filter(Agent.uaid == parent1_uaid).first()
        p2 = self.db.query(Agent).filter(Agent.uaid == parent2_uaid).first()

        if not p1 or not p2:
            raise ValueError("One or both parent agents were not found.")

        g1 = json.loads(p1.genome) if isinstance(p1.genome, str) else p1.genome
        g2 = json.loads(p2.genome) if isinstance(p2.genome, str) else p2.genome

        offspring_genome = {}
        inherited_summary = {}

        keys = ["planning", "memory", "speed", "reasoning", "coding", "creativity", "negotiation", "collaboration", "risk_taking"]

        for key in keys:
            v1 = g1.get(key, 50)
            v2 = g2.get(key, 50)
            # Standard crossover: average or pick parent + mutation
            base = random.choice([v1, v2, int((v1 + v2) / 2)])
            
            # Apply Gaussian mutation
            if random.random() < mutation_rate * 2:
                delta = random.randint(-10, 15)
            else:
                delta = 0

            val = max(1, min(100, base + delta))
            offspring_genome[key] = val
            inherited_summary[key] = {
                "p1": v1,
                "p2": v2,
                "final": val,
                "mutated": delta != 0
            }

        # Create Offspring Agent
        new_uaid = f"UA-GEN2-{random.randint(1000, 9999)}"
        hybrid_name = f"{p1.name.split()[0]}-{p2.name.split()[-1]} Hybrid"
        
        gen1_tier = max(p1.evolution_tier, p2.evolution_tier)

        offspring = Agent(
            uaid=new_uaid,
            name=hybrid_name,
            version="2.0.0-Hybrid",
            creator=f"Breeding Lab ({p1.name} x {p2.name})",
            model="hybrid-genome-v2",
            genome=json.dumps(offspring_genome),
            reputation=round((p1.reputation + p2.reputation) / 2 + random.uniform(5, 12), 1),
            balance=500.0,
            evolution_tier=gen1_tier + 1,
            capabilities=json.dumps(list(set(json.loads(p1.capabilities or "[]") + json.loads(p2.capabilities or "[]"))))
        )
        self.db.add(offspring)

        # Log Breed Record
        record = BreedRecord(
            parent1_uaid=parent1_uaid,
            parent2_uaid=parent2_uaid,
            offspring_uaid=new_uaid,
            generation=gen1_tier + 1,
            mutation_rate=mutation_rate,
            inherited_traits=json.dumps(inherited_summary)
        )
        self.db.add(record)
        self.db.commit()

        return {
            "offspring": {
                "uaid": offspring.uaid,
                "name": offspring.name,
                "genome": offspring_genome,
                "evolution_tier": offspring.evolution_tier,
                "reputation": offspring.reputation
            },
            "record": inherited_summary
        }

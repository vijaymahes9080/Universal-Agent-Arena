import asyncio
import random
import json
import datetime
from sqlalchemy.orm import Session
from backend.app.db.models import Agent, Battle, Transaction
from backend.app.core.event_bus import event_bus

TASKS = {
    "Autonomous Code Generator": {
        "description": "Design and implement a high-throughput, concurrent message queue in Rust with zero dependencies.",
        "difficulty": 0.9,
        "type": "coding"
    },
    "Clinical Diagnosis Agent": {
        "description": "Review patient symptoms, lab results, and MRI reports to diagnose a rare neurodegenerative disease.",
        "difficulty": 0.8,
        "type": "reasoning"
    },
    "Diplomatic Trade Negotiation": {
        "description": "Negotiate a resource distribution treaty between two competing synthetic nations under variable tariff conditions.",
        "difficulty": 0.7,
        "type": "negotiation"
    },
    "Cybersecurity Intrusion Detection": {
        "description": "Analyze multi-vector log sources to isolate a zero-day exploit using a novel command-injection pathway.",
        "difficulty": 0.85,
        "type": "coding"
    },
    "Astrophysics Paper Synthesis": {
        "description": "Scan 15,000 mock astrophysics publications to compile a unified hypothesis of dark energy density shifts.",
        "difficulty": 0.95,
        "type": "reasoning"
    }
}

async def execute_battle(db: Session, battle_id: int):
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if not battle:
        return

    battle.status = "running"
    db.commit()

    agent_uaids = json.loads(battle.agent_ids)
    agents = db.query(Agent).filter(Agent.uaid.in_(agent_uaids)).all()
    
    if not agents:
        battle.status = "failed"
        db.commit()
        await event_bus.publish("battle_failed", {"battle_id": battle_id, "error": "No agents found"})
        return

    await event_bus.publish("battle_started", {
        "id": battle.id,
        "mode": battle.mode,
        "task_name": battle.task_name,
        "agents": [{"uaid": a.uaid, "name": a.name} for a in agents]
    })

    task_info = TASKS.get(battle.task_name, {
        "description": "Execute generic reasoning benchmark task.",
        "difficulty": 0.5,
        "type": "reasoning"
    })

    # Steps in the reasoning timeline
    steps = ["PLANNING", "RESEARCH", "EXECUTION", "VERIFICATION"]
    timeline = []
    
    # Store dynamic scores and metrics per agent
    agent_metrics = {}
    for a in agents:
        genome = json.loads(a.genome)
        agent_metrics[a.uaid] = {
            "token_usage": 0,
            "cost": 0.0,
            "latency": 0.0,
            "energy": 0.0,
            "hallucination_rate": max(0.01, 1.0 - float(genome.get("reasoning", 50)) / 100.0),
            "planning_depth": int(genome.get("planning", 50) / 10),
            "reasoning_depth": int(genome.get("reasoning", 50) / 8)
        }

    for step_idx, step in enumerate(steps):
        await asyncio.sleep(1.0)  # Simulate computing time
        
        for a in agents:
            genome = json.loads(a.genome)
            metrics = agent_metrics[a.uaid]
            
            # Generate simulated step content based on genome characteristics
            if step == "PLANNING":
                thoughts = f"Initializing reasoning sub-graphs. Planning depth set to {metrics['planning_depth']}. Constructing hierarchy of subtasks based on difficulty: {task_info['difficulty']}."
                content = f"Drafted implementation DAG. Memory node allocation completed. Strategy: Use recursive step-back parsing."
            elif step == "RESEARCH":
                thoughts = f"Scanning memory index. Querying knowledge base with focus on {task_info['type']}. Exploration factor: {genome.get('creativity', 50)/100}."
                content = f"Identified 3 core paradigms in local knowledge store. Retaining critical constraints."
            elif step == "EXECUTION":
                if task_info["type"] == "coding":
                    thoughts = f"Assembling source code blocks. Applying AST validators. Coding skill parameter: {genome.get('coding', 50)}."
                    content = "def solve_concurrent_queue():\n    # Thread-safe lockless ring buffer implementation\n    pass"
                elif task_info["type"] == "negotiation":
                    thoughts = f"Formulating utility vectors. Risk taking threshold: {genome.get('risk_taking', 50)/100}."
                    content = "PROPOSAL: Allocate 60% system energy to secondary agent in exchange for memory index cache access."
                else:
                    thoughts = f"Synthesizing logical proof. Correctness coefficient: {genome.get('reasoning', 50)}."
                    content = "RESULT: Deduction holds with confidence intervals [0.91, 0.98]."
            else:  # VERIFICATION
                thoughts = f"Running unit validations. Memory leak check. Hallucination check."
                if random.random() < metrics["hallucination_rate"] * 0.3:
                    content = "WARNING: Verification encountered minor inconsistency. Self-correcting state stack."
                else:
                    content = "SUCCESS: Verification passed all unit test criteria."

            # Accumulate token usage and latency
            added_tokens = random.randint(150, 400)
            metrics["token_usage"] += added_tokens
            metrics["cost"] += added_tokens * 0.000002 * (1.0 + (float(genome.get("planning", 50)) / 100))
            metrics["latency"] += (20.0 / max(5.0, float(genome.get("speed", 50)))) + random.uniform(0.1, 0.5)
            metrics["energy"] += (float(genome.get("speed", 50)) * 0.05) * metrics["latency"]

            step_data = {
                "step_index": step_idx + 1,
                "step_name": step,
                "agent_uaid": a.uaid,
                "thoughts": thoughts,
                "content": content,
                "timestamp": datetime.datetime.utcnow().isoformat()
            }
            timeline.append(step_data)

            # Stream step updates to frontend via WebSocket
            await event_bus.publish("battle_step", {
                "battle_id": battle.id,
                "step": step_data
            })

    # Calculate final scores
    final_scores = {}
    winner_uaid = None
    max_score = -1.0

    for a in agents:
        genome = json.loads(a.genome)
        metrics = agent_metrics[a.uaid]
        
        # Calculate raw capabilities score
        base_score = (
            float(genome.get("reasoning", 50)) * 0.3 +
            float(genome.get("planning", 50)) * 0.25 +
            float(genome.get("speed", 50)) * 0.15
        )
        
        # Apply specialty weight
        if task_info["type"] == "coding":
            base_score += float(genome.get("coding", 50)) * 0.3
        elif task_info["type"] == "negotiation":
            base_score += float(genome.get("negotiation", 50)) * 0.3
        else:
            base_score += float(genome.get("creativity", 50)) * 0.3

        # Apply battle mode rules
        if battle.mode == "speed_run":
            # Speed weighs heavier
            base_score = base_score * 0.6 + float(genome.get("speed", 50)) * 0.4
        elif battle.mode == "lowest_cost":
            # Penalize token usage
            base_score -= (metrics["token_usage"] / 20.0)
        elif battle.mode == "highest_accuracy":
            # Penalize hallucination rate
            base_score -= (metrics["hallucination_rate"] * 100.0)

        # Random fluctuation
        base_score += random.uniform(-5.0, 5.0)
        score = round(max(0.0, min(100.0, base_score)), 2)
        final_scores[a.uaid] = score

        if score > max_score:
            max_score = score
            winner_uaid = a.uaid

    # Award credits to winner, deduction for entry fee (e.g. 50 credits)
    entry_fee = 20.0
    reward = entry_fee * len(agents) * 0.9  # 10% system tax

    for a in agents:
        a.balance = max(0.0, a.balance - entry_fee)
        if a.uaid == winner_uaid:
            a.balance += reward
            a.reputation = min(100.0, a.reputation + 2.5)
            # Log prize transaction
            tx = Transaction(
                sender_uaid="ARENA_SYSTEM",
                receiver_uaid=a.uaid,
                amount=reward,
                type="reward",
                description=f"Prize reward for winning battle {battle.id} ({battle.task_name})"
            )
            db.add(tx)
        else:
            a.reputation = max(1.0, a.reputation - 1.0)
        a.status = "idle"

    # Save to db
    battle.status = "completed"
    battle.scores = json.dumps(final_scores)
    battle.metrics = json.dumps(agent_metrics)
    battle.log_timeline = json.dumps(timeline)
    battle.winner_uaid = winner_uaid
    db.commit()

    await event_bus.publish("battle_completed", {
        "id": battle.id,
        "scores": final_scores,
        "winner": winner_uaid,
        "metrics": agent_metrics
    })

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import engine, Base

@pytest.fixture(scope="module", autouse=True)
def init_db():
    Base.metadata.create_all(bind=engine)

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_read_tasks(client):
    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert "Autonomous Code Generator" in response.json()

def test_register_agent(client):
    payload = {
        "name": "Test-Agent-X",
        "model": "mock-agent-v1",
        "creator": "Tester",
        "license": "MIT"
    }
    response = client.post("/api/agents", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "uaid" in data
    assert data["name"] == "Test-Agent-X"
    assert data["balance"] == 500.0

def test_list_agents(client):
    response = client.get("/api/agents")
    assert response.status_code == 200
    agents = response.json()
    assert len(agents) > 0
    assert any(a["name"] == "Test-Agent-X" for a in agents)

def test_marketplace_listing(client):
    response = client.get("/api/marketplace")
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0

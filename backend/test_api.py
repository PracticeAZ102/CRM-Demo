import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing /health...")
    r = client.get("/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("Health check OK:", r.json())

    print("\nTesting GET /api/v1/models...")
    r = client.get("/api/v1/models")
    assert r.status_code == 200, f"List models failed: {r.text}"
    models = r.json()
    assert len(models) == 8, f"Expected 8 models, got {len(models)}"
    print(f"Retrieved {len(models)} models successfully.")

    print("\nTesting GET /api/v1/models/summary...")
    r = client.get("/api/v1/models/summary")
    assert r.status_code == 200
    print("Summary Stats:", r.json())

    print("\nTesting GET /api/v1/models with search 'CPM'...")
    r = client.get("/api/v1/models?search=CPM")
    assert r.status_code == 200
    assert len(r.json()) >= 1
    print(f"Search found {len(r.json())} item(s).")

    print("\nTesting POST /api/v1/models (Create)...")
    new_model = {
        "prkey": "TEST-MODEL-01",
        "idesc": "Test 11kW Screw Compressor",
        "motor": "11 kW / 15 HP",
        "type": "Screw Compressor",
        "brand": "Chicago Pneumatic",
        "vsd_fs": "FS",
        "maximum_pressure": "7.5 bar",
        "fad_cfm": "55 cfm",
        "dimension": "1000 x 700 x 1100 mm",
        "clp": 350000.0
    }
    r = client.post("/api/v1/models", json=new_model)
    assert r.status_code == 201, f"Create failed: {r.text}"
    print("Created model:", r.json()["prkey"])

    print("\nTesting DELETE /api/v1/models/TEST-MODEL-01...")
    r = client.delete("/api/v1/models/TEST-MODEL-01")
    assert r.status_code == 200
    print("Deleted successfully.")

    print("\nALL BACKEND API TESTS PASSED!")

if __name__ == "__main__":
    test_endpoints()


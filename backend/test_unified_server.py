import sys
sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_unified_serving():
    print("1. Testing Backend /health API...")
    r = client.get("/health")
    assert r.status_code == 200
    print("   ✓ Health check returned:", r.json())

    print("\n2. Testing /api/v1/models...")
    r = client.get("/api/v1/models")
    assert r.status_code == 200
    models = r.json()
    assert len(models) == 8
    print(f"   ✓ API returned {len(models)} seeded equipment models.")

    print("\n3. Testing Unified Static Serving: GET / (React SPA index.html)...")
    r = client.get("/")
    assert r.status_code == 200
    assert "<div id=\"root\"></div>" in r.text
    print("   ✓ GET / successfully serves the React index.html!")

    print("\n4. Testing /api/v1/models/summary...")
    r = client.get("/api/v1/models/summary")
    assert r.status_code == 200
    print("   ✓ Catalog summary KPIs:", r.json())

    print("\n=======================================================")
    print("🎉 UNIFIED SINGLE-CONTAINER ARCHITECTURE VERIFIED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    test_unified_serving()

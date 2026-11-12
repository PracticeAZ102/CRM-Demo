import sys
sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_application():
    print("=======================================================")
    print("RUNNING ATCORP CRM END-TO-END AUTOMATED TEST SUITE")
    print("=======================================================")

    # 1. Health
    r = client.get("/health")
    assert r.status_code == 200
    print("[PASS] 1. Backend Health Check OK")

    # 2. Models Master
    r = client.get("/api/v1/models")
    assert r.status_code == 200
    models = r.json()
    assert len(models) >= 8
    print(f"[PASS] 2. Equipment Model Master: {len(models)} models active")

    # 3. Model Excel Export
    r = client.get("/api/v1/models/export/excel")
    assert r.status_code == 200
    assert len(r.content) > 1000
    print("[PASS] 3. Excel Catalog Master Export OK")

    # 4. CPQ Calculation Engine
    calc_payload = {
        "prkey": "CP-CPM-15-FS-8",
        "quantity": 1,
        "discount_pct": 10.0,
        "packaging_pct": 2.0,
        "freight_terms": "Ex-Works",
        "freight_amount": 0.0,
        "installation_charges": 15000.0,
        "gst_type": "IGST"
    }
    r = client.post("/api/v1/quotations/calculate", json=calc_payload)
    assert r.status_code == 200
    res = r.json()
    assert res["discount_approval_status"] == "APPROVED"
    assert res["total_value"] > 500000
    print(f"[PASS] 4. CPQ Pricing Calculation Engine: Total Net ₹{res['total_value']:,.0f}")

    # 5. Discount Approval Threshold Gate (>15%)
    calc_payload["discount_pct"] = 18.0
    r = client.post("/api/v1/quotations/calculate", json=calc_payload)
    assert r.json()["discount_approval_status"] == "PENDING_APPROVAL"
    print("[PASS] 5. Discount Approval Threshold Gate (>15% -> PENDING_APPROVAL) OK")

    # 6. Quotation Listing
    r = client.get("/api/v1/quotations?enquiry_id=43382")
    assert r.status_code == 200
    quotes = r.json()
    assert len(quotes) >= 1
    quote_id = quotes[0]["id"]
    print(f"[PASS] 6. Quotation Registry: Found {len(quotes)} quote(s) for ENQ #43382")

    # 7. 3-Page Proposal PDF Generation
    r = client.get(f"/api/v1/quotations/{quote_id}/pdf")
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert r.content.startswith(b"%PDF")
    print(f"[PASS] 7. 3-Page ATCORP Proposal PDF Generation ({len(r.content):,} bytes) OK")

    # 8. Proposal Revision Tracking (Rev-01 -> Rev-02)
    r = client.post(f"/api/v1/quotations/{quote_id}/revise")
    assert r.status_code == 201
    rev = r.json()
    assert rev["revision_no"] >= 2
    assert rev["enquiry_id"] == "43382"
    print(f"[PASS] 8. Revision Engine: Generated {rev['id']} under permanent Enquiry #{rev['enquiry_id']}")

    # 9. Unified Frontend Static Serving
    r = client.get("/")
    assert r.status_code == 200
    assert "<div id=\"root\"></div>" in r.text
    print("[PASS] 9. Unified Frontend Static HTML Serving OK")

    print("\n=======================================================")
    print("ALL 9 MILESTONE 1 & 2 VERIFICATION TESTS PASSED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    test_full_application()


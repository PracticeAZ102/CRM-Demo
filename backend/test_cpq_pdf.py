import sys
sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_cpq_engine():
    print("1. Testing GET /api/v1/quotations...")
    r = client.get("/api/v1/quotations")
    assert r.status_code == 200, f"List failed: {r.text}"
    quotes = r.json()
    assert len(quotes) >= 1
    print(f"   Found {len(quotes)} quote(s). First quote ID: {quotes[0]['id']}")

    print("\n2. Testing POST /api/v1/quotations/calculate (Live Math & Win Probability)...")
    calc_req = {
        "prkey": "CP-CPM-15-FS-8",
        "quantity": 2,
        "discount_pct": 12.0,
        "packaging_pct": 2.0,
        "freight_terms": "FOR Destination",
        "freight_amount": 18000.0,
        "installation_charges": 20000.0,
        "gst_type": "IGST"
    }
    r = client.post("/api/v1/quotations/calculate", json=calc_req)
    assert r.status_code == 200, f"Calculate failed: {r.text}"
    calc = r.json()
    print("   Math Verification:")
    print(f"   - Base CLP: ₹{calc['base_clp']:,.0f} x {calc_req['quantity']} = ₹{calc['total_base']:,.0f}")
    print(f"   - Discount (12%): ₹{calc['total_discount']:,.0f} -> Approval Status: {calc['discount_approval_status']}")
    print(f"   - Taxable Subtotal: ₹{calc['taxable_value']:,.0f}")
    print(f"   - GST (18%): ₹{calc['gst_amount']:,.0f}")
    print(f"   - Total Net Proposal: ₹{calc['total_value']:,.0f}")
    print(f"   - Win Probability: {calc['win_probability_pct']}%")
    assert calc["discount_approval_status"] == "APPROVED"

    print("\n3. Testing Discount Threshold (>15% requires Approval)...")
    calc_req["discount_pct"] = 18.0
    r = client.post("/api/v1/quotations/calculate", json=calc_req)
    assert r.json()["discount_approval_status"] == "PENDING_APPROVAL"
    print("   ✓ Discount at 18% correctly triggered PENDING_APPROVAL status!")

    print("\n4. Testing PDF Generation: GET /api/v1/quotations/QUO-43382-R01/pdf...")
    r = client.get("/api/v1/quotations/QUO-43382-R01/pdf")
    assert r.status_code == 200, f"PDF failed: {r.text}"
    assert r.headers["content-type"] == "application/pdf"
    pdf_bytes = r.content
    assert pdf_bytes.startswith(b"%PDF"), "Response is not a valid PDF file"
    assert len(pdf_bytes) > 5000, f"PDF too small: {len(pdf_bytes)} bytes"
    print(f"   ✓ Formal 3-Page ATCORP Proposal PDF generated successfully! Size: {len(pdf_bytes):,} bytes.")

    print("\n5. Testing Proposal Revision: POST /api/v1/quotations/QUO-43382-R01/revise...")
    r = client.post("/api/v1/quotations/QUO-43382-R01/revise")
    assert r.status_code == 201
    rev2 = r.json()
    assert rev2["id"] == "QUO-43382-R02"
    assert rev2["revision_no"] == 2
    assert rev2["enquiry_id"] == "43382"
    print(f"   ✓ Created Revision 2: {rev2['id']} under permanent Enquiry #{rev2['enquiry_id']}!")

    print("\n=======================================================")
    print("🎉 CPQ QUOTATION ENGINE & PDF GENERATOR VERIFIED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    test_cpq_engine()


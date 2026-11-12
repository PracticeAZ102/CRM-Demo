import sys
sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_modules_3_and_4():
    print("=======================================================")
    print("TESTING MODULE 3 (CARD OCR & INTAKE) & MODULE 4 (OFM)")
    print("=======================================================")

    # 1. Visiting Card OCR (Sample scan)
    print("\n1. Testing POST /api/v1/enquiries/scan-card...")
    r = client.post("/api/v1/enquiries/scan-card", data={"sample_key": "shivam"})
    assert r.status_code == 200, f"Card scan failed: {r.text}"
    card_data = r.json()
    assert "Shivam Precision Tools" in card_data["company_name"]
    assert card_data["confidence_score"] > 90
    print(f"   [PASS] Extracted Company: {card_data['company_name']}, Contact: {card_data['contact_person']}, Phone: {card_data['phone']}")

    # 2. Enquiry Creation from Card Data
    print("\n2. Testing POST /api/v1/enquiries...")
    enquiry_payload = {
        "company_name": card_data["company_name"],
        "contact_person": card_data["contact_person"],
        "designation": card_data["designation"],
        "email": card_data["email"],
        "phone": card_data["phone"],
        "plant_location": card_data["plant_location"],
        "gstin": card_data["gstin"],
        "industry_sector": card_data["industry_sector"],
        "branch_region": "Noida HQ",
        "assigned_engineer": "Rajesh Sharma"
    }
    r = client.post("/api/v1/enquiries", json=enquiry_payload)
    assert r.status_code == 201, f"Enquiry create failed: {r.text}"
    new_enq = r.json()
    print(f"   [PASS] Created Enquiry #{new_enq['id']} for {new_enq['company_name']}")

    # 3. List Enquiries
    print("\n3. Testing GET /api/v1/enquiries...")
    r = client.get("/api/v1/enquiries")
    assert r.status_code == 200
    enquiries = r.json()
    assert len(enquiries) >= 4
    print(f"   [PASS] Retrieved {len(enquiries)} active pipeline enquiries.")

    # 4. OFM Summary KPIs
    print("\n4. Testing GET /api/v1/ofm/summary...")
    r = client.get("/api/v1/ofm/summary")
    assert r.status_code == 200
    summary = r.json()
    assert summary["total_ofm_records"] >= 3
    print(f"   [PASS] OFM Summary KPIs: {summary}")

    # 5. Edit Pending OFM (Allowed while not frozen)
    print("\n5. Testing PUT /api/v1/ofm/OFM-43382-R01 (Editing pending specs)...")
    edit_payload = {
        "paint_shade": "Special Industrial Olive Green (RAL 6003)",
        "air_discharge_nozzle": "2.0 inch Flanged PN16",
        "special_factory_instructions": "Dealer requested expedited dispatch for plant audit."
    }
    r = client.put("/api/v1/ofm/OFM-43382-R01", json=edit_payload)
    assert r.status_code == 200, f"Edit failed: {r.text}"
    updated_ofm = r.json()
    assert updated_ofm["paint_shade"] == "Special Industrial Olive Green (RAL 6003)"
    print(f"   [PASS] Successfully updated paint shade and nozzle for pending OFM {updated_ofm['id']}")

    # 6. Spawn Revision (Rev-02 -> Rev-03)
    print("\n6. Testing POST /api/v1/ofm/OFM-43382-R01/revise...")
    r = client.post("/api/v1/ofm/OFM-43382-R01/revise")
    assert r.status_code == 201
    rev_ofm = r.json()
    assert rev_ofm["revision_no"] >= 2
    assert rev_ofm["enquiry_id"] == "43382"
    print(f"   [PASS] Created Revision {rev_ofm['id']} preserving permanent Enquiry #{rev_ofm['enquiry_id']}")

    # 7. PO Scrutiny Freeze Gate
    print("\n7. Testing POST /api/v1/ofm/OFM-43382-R02/freeze (PO Scrutiny Clearance)...")
    freeze_payload = {
        "customer_po_number": "PO/SHANTI/2026/894",
        "customer_po_date": "2026-10-28",
        "customer_po_value": 543071.0,
        "po_value_verified": True,
        "tech_specs_verified": True,
        "payment_terms_verified": True,
        "ga_drawing_cleared": True,
        "committed_dispatch_date": "2026-11-20",
        "approved_by": "Rajesh Sharma (Commercial Head)"
    }
    r = client.post("/api/v1/ofm/OFM-43382-R02/freeze", json=freeze_payload)
    assert r.status_code == 200
    frozen_ofm = r.json()
    assert frozen_ofm["is_frozen"] == True
    assert frozen_ofm["status"] == "FROZEN_FACTORY_RELEASE"
    print(f"   [PASS] OFM {frozen_ofm['id']} successfully FROZEN and authorized for factory floor!")

    # 8. Guard Check: Editing a Frozen OFM must be rejected with 400 Bad Request
    print("\n8. Testing Guard Check: Editing a Frozen OFM...")
    r = client.put("/api/v1/ofm/OFM-43382-R02", json={"paint_shade": "Red"})
    assert r.status_code == 400
    print("   [PASS] Security Gate Confirmed: Editing frozen OFM was correctly rejected with 400 Bad Request!")

    # 9. Factory Release Sheet PDF
    print("\n9. Testing GET /api/v1/ofm/OFM-43380-R01/factory-sheet-pdf...")
    r = client.get("/api/v1/ofm/OFM-43380-R01/factory-sheet-pdf")
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert r.content.startswith(b"%PDF")
    print(f"   [PASS] Official Factory Release Sheet PDF generated! Size: {len(r.content):,} bytes.")

    print("\n=======================================================")
    print("ALL MODULE 3 & MODULE 4 BACKEND TESTS PASSED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    test_modules_3_and_4()


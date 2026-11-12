from app.core.database import SessionLocal, engine, Base
import app.models.equipment_model
import app.models.quotation
import app.models.ofm
import app.models.activity
from app.models.equipment_model import EquipmentModel
from app.models.quotation import Enquiry, Quotation
from app.models.ofm import OFMRecord
from app.models.activity import Campaign, Appointment, SalesTarget
from datetime import datetime, timezone

def seed_all():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Equipment Models (10 Columns from Models Input.jpg)
    seed_models = [
        {
            "prkey": "CP-CPM-15-FS-8",
            "idesc": "Chicago Pneumatic 15 kW / 20 HP Rotary Screw Compressor 8 bar",
            "motor": "15 kW / 20 HP",
            "type": "Screw Compressor",
            "brand": "Chicago Pneumatic",
            "vsd_fs": "FS",
            "maximum_pressure": "8.0 bar",
            "fad_cfm": "78.4 cfm",
            "dimension": "1200 x 850 x 1350 mm",
            "clp": 485000.0,
        },
        {
            "prkey": "CP-CPVS-30-VSD-10",
            "idesc": "Chicago Pneumatic 22 kW / 30 HP Variable Speed Inverter Compressor 10 bar",
            "motor": "22 kW / 30 HP",
            "type": "Screw Compressor",
            "brand": "Chicago Pneumatic",
            "vsd_fs": "VSD",
            "maximum_pressure": "10.0 bar",
            "fad_cfm": "142.0 cfm",
            "dimension": "1400 x 950 x 1500 mm",
            "clp": 890000.0,
        },
        {
            "prkey": "GEM-GRD-100-FS",
            "idesc": "Gem Equipments 100 cfm Refrigerated Compressed Air Dryer (3°C PDP)",
            "motor": "1.2 kW",
            "type": "Air Dryer",
            "brand": "Gem Equipments",
            "vsd_fs": "FS",
            "maximum_pressure": "16.0 bar",
            "fad_cfm": "100.0 cfm",
            "dimension": "650 x 550 x 780 mm",
            "clp": 145000.0,
        },
        {
            "prkey": "GEM-GWC-20TR-FS",
            "idesc": "Gem Equipments 20 TR Compact Water-Cooled Process Chiller (R410A Eco)",
            "motor": "18.5 kW / 25 HP",
            "type": "Process Chiller",
            "brand": "Gem Equipments",
            "vsd_fs": "FS",
            "maximum_pressure": "6.0 bar",
            "fad_cfm": "N/A (Chiller)",
            "dimension": "1850 x 1100 x 1650 mm",
            "clp": 620000.0,
        },
        {
            "prkey": "AT-VERT-1000L",
            "idesc": "ATCORP Prime 1000 Litres Vertical Air Receiver Tank IS:2825 Class II",
            "motor": "Static Vessel",
            "type": "Air Receiver",
            "brand": "ATCORP Prime",
            "vsd_fs": "N/A",
            "maximum_pressure": "12.0 bar",
            "fad_cfm": "1000 L Volume",
            "dimension": "Dia 900 x H 2150 mm",
            "clp": 95000.0,
        },
        {
            "prkey": "CP-CPBG-75-VSD-8.5",
            "idesc": "Chicago Pneumatic 55 kW / 75 HP High-Efficiency Gear Driven VSD Screw Compressor",
            "motor": "55 kW / 75 HP",
            "type": "Screw Compressor",
            "brand": "Chicago Pneumatic",
            "vsd_fs": "VSD",
            "maximum_pressure": "8.5 bar",
            "fad_cfm": "365.0 cfm",
            "dimension": "2100 x 1350 x 1850 mm",
            "clp": 1850000.0,
        },
        {
            "prkey": "GEM-COL-50TR",
            "idesc": "Gem Equipments 50 TR Induced Draft FRP Cooling Tower with Direct Drive Fan",
            "motor": "3.7 kW / 5 HP",
            "type": "Cooling Tower",
            "brand": "Gem Equipments",
            "vsd_fs": "FS",
            "maximum_pressure": "Atmospheric",
            "fad_cfm": "300 GPM Water",
            "dimension": "Dia 1800 x H 2400 mm",
            "clp": 280000.0,
        },
        {
            "prkey": "CP-CPRA-5-FS-10",
            "idesc": "Chicago Pneumatic 4 kW / 5.5 HP Base Mounted Rotary Screw Compressor",
            "motor": "4 kW / 5.5 HP",
            "type": "Screw Compressor",
            "brand": "Chicago Pneumatic",
            "vsd_fs": "FS",
            "maximum_pressure": "10.0 bar",
            "fad_cfm": "22.5 cfm",
            "dimension": "900 x 650 x 1050 mm",
            "clp": 235000.0,
        }
    ]

    for item in seed_models:
        if not db.query(EquipmentModel).filter(EquipmentModel.prkey == item["prkey"]).first():
            db.add(EquipmentModel(**item))

    # 2. Enquiries
    enquiries_data = [
        {
            "id": "43382",
            "company_name": "Shanti Auto Components Pvt Ltd",
            "contact_person": "Vikram Mehra",
            "designation": "DGM - Plant & Utility",
            "email": "v.mehra@shantiauto.com",
            "phone": "+91 98112 44920",
            "plant_location": "Plot 42, Sector 8, IMT Manesar, Gurugram, Haryana 122050",
            "gstin": "06AABCS1429B1Z2",
            "industry_sector": "Automotive Die-Casting & Machining",
            "branch_region": "Noida HQ",
            "assigned_engineer": "Rajesh Sharma",
            "status": "OFM_PENDING"
        },
        {
            "id": "43383",
            "company_name": "Shivam Precision Tools Pvt Ltd",
            "contact_person": "Anurag Kashyap",
            "designation": "Director - Works",
            "email": "anurag@shivamtools.co.in",
            "phone": "+91 98711 02938",
            "plant_location": "Plot 18, Sector 24, Faridabad Industrial Area, Haryana 121005",
            "gstin": "06AALCS8921K1Z8",
            "industry_sector": "Precision Tooling & Stamping",
            "branch_region": "Noida HQ",
            "assigned_engineer": "Rajesh Sharma",
            "status": "ACTIVE_QUOTATION"
        },
        {
            "id": "43384",
            "company_name": "Krishna Polymers & Packaging Ltd",
            "contact_person": "Sunita Agarwal",
            "designation": "Head - Maintenance & Projects",
            "email": "sunita.agarwal@krishnapolymers.com",
            "phone": "+91 99104 55821",
            "plant_location": "B-12, Phase-II Extn, Hosiery Complex, Noida, UP 201305",
            "gstin": "09AAACK4910M1Z3",
            "industry_sector": "Plastic Injection Moulding",
            "branch_region": "Noida HQ",
            "assigned_engineer": "Amitabh Verma",
            "status": "ACTIVE_QUOTATION"
        },
        {
            "id": "43380",
            "company_name": "Apex Formulations & Bio-Labs",
            "contact_person": "Dr. Rohit Singhal",
            "designation": "General Manager - Plant Engineering",
            "email": "dr.rohit@apexbiolabs.in",
            "phone": "+91 94120 78219",
            "plant_location": "Plot 5, SIDCUL Industrial Estate, Haridwar, Uttarakhand 249403",
            "gstin": "05AABCA3319L1Z1",
            "industry_sector": "Pharmaceuticals & Cleanrooms",
            "branch_region": "Haridwar Branch",
            "assigned_engineer": "Deepak Joshi",
            "status": "RELEASED_TO_PPC"
        }
    ]

    for item in enquiries_data:
        if not db.query(Enquiry).filter(Enquiry.id == item["id"]).first():
            db.add(Enquiry(**item))
    db.flush()

    # 3. Quotations
    quotes_data = [
        {
            "id": "QUO-43382-R01",
            "quote_number": "ATCORP/QUO/2026-27/43382",
            "enquiry_id": "43382",
            "revision_no": 1,
            "prkey": "CP-CPM-15-FS-8",
            "quantity": 1,
            "base_clp": 485000.0,
            "discount_pct": 10.0,
            "discount_amount": 48500.0,
            "discount_approval_status": "APPROVED",
            "packaging_pct": 2.0,
            "packaging_amount": 8730.0,
            "freight_terms": "Ex-Works",
            "freight_amount": 0.0,
            "installation_charges": 15000.0,
            "taxable_value": 460230.0,
            "gst_type": "IGST",
            "gst_rate": 18.0,
            "gst_amount": 82841.4,
            "total_value": 543071.4,
            "payment_terms": "20% Advance with PO, balance 80% against Proforma Invoice prior to dispatch",
            "delivery_weeks": "2 to 3 Weeks from confirmed PO & GA clearance",
            "warranty_months": 12,
            "validity_days": 30,
            "ga_drawing_id": "GAD-CP-CPM15",
            "notes": "Initial Proposal for CNC cell."
        },
        {
            "id": "QUO-43380-R01",
            "quote_number": "ATCORP/QUO/2026-27/43380",
            "enquiry_id": "43380",
            "revision_no": 1,
            "prkey": "GEM-GWC-20TR-FS",
            "quantity": 1,
            "base_clp": 620000.0,
            "discount_pct": 12.0,
            "discount_amount": 74400.0,
            "discount_approval_status": "APPROVED",
            "packaging_pct": 2.0,
            "packaging_amount": 10912.0,
            "freight_terms": "FOR Destination",
            "freight_amount": 18000.0,
            "installation_charges": 25000.0,
            "taxable_value": 599512.0,
            "gst_type": "IGST",
            "gst_rate": 18.0,
            "gst_amount": 107912.16,
            "total_value": 707424.16,
            "payment_terms": "15% Advance, balance 85% against inspection at Haridwar",
            "delivery_weeks": "3 Weeks",
            "warranty_months": 12,
            "validity_days": 30,
            "ga_drawing_id": "GAD-GEM-GWC20",
            "notes": "Pharma Cleanroom chilled water supply."
        }
    ]

    for item in quotes_data:
        if not db.query(Quotation).filter(Quotation.id == item["id"]).first():
            db.add(Quotation(**item))
    db.flush()

    # 4. OFM Records
    ofms_data = [
        {
            "id": "OFM-43382-R01",
            "ofm_number": "ATCORP/OFM/2026-27/43382",
            "enquiry_id": "43382",
            "quotation_id": "QUO-43382-R01",
            "revision_no": 1,
            "customer_po_number": None,
            "customer_po_date": None,
            "customer_po_value": None,
            "committed_dispatch_date": "2026-11-25",
            "paint_shade": "OEM Standard Industrial Blue (RAL 5015)",
            "electrical_supply": "415V, 3 Phase, 50Hz AC",
            "air_discharge_nozzle": "1.5 inch BSP Female",
            "special_factory_instructions": "Initial draft of commercial handoff with Gurgaon dealer.",
            "status": "PENDING_DEALER_REVIEW",
            "is_frozen": False
        },
        {
            "id": "OFM-43382-R02",
            "ofm_number": "ATCORP/OFM/2026-27/43382",
            "enquiry_id": "43382",
            "quotation_id": "QUO-43382-R01",
            "revision_no": 2,
            "customer_po_number": "PO/SHANTI/2026/894",
            "customer_po_date": "2026-10-28",
            "customer_po_value": 543071.0,
            "committed_dispatch_date": "2026-11-20",
            "paint_shade": "Siemens Grey (RAL 7035 Special)",
            "electrical_supply": "415V, 3 Phase, 50Hz AC",
            "air_discharge_nozzle": "1.5 inch BSP Female",
            "special_factory_instructions": "Customer PO received! Awaiting final commercial scrutiny checkoff.",
            "status": "AWAITING_PO_SCRUTINY",
            "is_frozen": False
        },
        {
            "id": "OFM-43380-R01",
            "ofm_number": "ATCORP/OFM/2026-27/43380",
            "enquiry_id": "43380",
            "quotation_id": "QUO-43380-R01",
            "revision_no": 1,
            "customer_po_number": "PO/APEX/26/1042",
            "customer_po_date": "2026-10-15",
            "customer_po_value": 707424.0,
            "po_value_verified": True,
            "tech_specs_verified": True,
            "payment_terms_verified": True,
            "ga_drawing_cleared": True,
            "committed_dispatch_date": "2026-11-08",
            "paint_shade": "Pure Cleanroom White (RAL 9010)",
            "electrical_supply": "415V, 3 Phase, 50Hz AC",
            "air_discharge_nozzle": "2.0 inch Flanged PN16",
            "special_factory_instructions": "Pharma SS cladding installed. Job released to Factory Shopfloor Bay 3.",
            "status": "FROZEN_FACTORY_RELEASE",
            "is_frozen": True,
            "frozen_at": datetime.now(timezone.utc),
            "frozen_by": "Deepak Joshi (Haridwar Branch Head)"
        }
    ]

    for item in ofms_data:
        if not db.query(OFMRecord).filter(OFMRecord.id == item["id"]).first():
            db.add(OFMRecord(**item))

    # 5. Campaigns & Expos
    campaigns_data = [
        {
            "name": "EngiTech India 2026",
            "city": "New Delhi",
            "venue": "Pragati Maidan, Hall 4",
            "start_date": "2026-08-10",
            "end_date": "2026-08-13",
            "budget": 450000.0,
            "target_leads": 100,
            "leads_generated": 88,
            "status": "COMPLETED"
        },
        {
            "name": "PlastIndia 2026 Expo",
            "city": "Greater Noida",
            "venue": "India Expo Mart, Pavilion 2",
            "start_date": "2026-09-18",
            "end_date": "2026-09-22",
            "budget": 620000.0,
            "target_leads": 80,
            "leads_generated": 72,
            "status": "COMPLETED"
        },
        {
            "name": "ChemTech & Pharma World",
            "city": "Hyderabad",
            "venue": "HITEX Exhibition Centre",
            "start_date": "2026-10-25",
            "end_date": "2026-10-28",
            "budget": 380000.0,
            "target_leads": 60,
            "leads_generated": 45,
            "status": "ACTIVE"
        },
        {
            "name": "AutoTech National Summit",
            "city": "Bengaluru",
            "venue": "BIEC Centre",
            "start_date": "2026-11-20",
            "end_date": "2026-11-23",
            "budget": 500000.0,
            "target_leads": 50,
            "leads_generated": 14,
            "status": "UPCOMING"
        }
    ]

    for c in campaigns_data:
        if not db.query(Campaign).filter(Campaign.name == c["name"]).first():
            db.add(Campaign(**c))

    # 6. Appointments
    appts_data = [
        {
            "company_name": "Shivam Precision Tools Pvt Ltd",
            "contact_person": "Anurag Kashyap",
            "phone": "+91 98711 02938",
            "city": "Faridabad",
            "visit_date": "2026-11-12",
            "visit_time": "11:30 AM",
            "purpose": "Air Audit & Compressor Sizing Verification",
            "status": "SCHEDULED",
            "notes": "Verify 8 bar pressure drop in CNC machining line."
        },
        {
            "company_name": "Krishna Polymers & Packaging Ltd",
            "contact_person": "Sunita Agarwal",
            "phone": "+91 99104 55821",
            "city": "Noida Phase-II",
            "visit_date": "2026-11-13",
            "visit_time": "02:30 PM",
            "purpose": "20 TR Chiller Proposal Technical Presentation",
            "status": "SCHEDULED",
            "notes": "Bring GA dimensional drawings and electrical panel specs."
        },
        {
            "company_name": "Apex Formulations & Bio-Labs",
            "contact_person": "Dr. Rohit Singhal",
            "phone": "+91 94120 78219",
            "city": "Haridwar",
            "visit_date": "2026-11-18",
            "visit_time": "10:00 AM",
            "purpose": "Pre-delivery Foundation & Clearance Check",
            "status": "SCHEDULED",
            "notes": "Factory released unit scheduled for dispatch."
        },
        {
            "company_name": "Shanti Auto Components Pvt Ltd",
            "contact_person": "Vikram Mehra",
            "phone": "+91 98112 44920",
            "city": "IMT Manesar",
            "visit_date": "2026-10-27",
            "visit_time": "03:00 PM",
            "purpose": "Commercial Negotiation & PO Terms Scrutiny",
            "status": "COMPLETED",
            "notes": "Customer agreed on 10% discount; PO received."
        }
    ]

    for a in appts_data:
        if not db.query(Appointment).filter(Appointment.company_name == a["company_name"]).first():
            db.add(Appointment(**a))

    # 7. FY 2026-27 Monthly Sales Targets
    months_data = [
        {"month": "April 2026", "target_units": 10, "achieved_units": 11, "target_revenue": 4500000.0, "achieved_revenue": 5200000.0},
        {"month": "May 2026", "target_units": 12, "achieved_units": 12, "target_revenue": 5500000.0, "achieved_revenue": 5800000.0},
        {"month": "June 2026", "target_units": 14, "achieved_units": 13, "target_revenue": 6500000.0, "achieved_revenue": 6200000.0},
        {"month": "July 2026", "target_units": 12, "achieved_units": 14, "target_revenue": 5800000.0, "achieved_revenue": 6700000.0},
        {"month": "August 2026", "target_units": 15, "achieved_units": 15, "target_revenue": 7000000.0, "achieved_revenue": 7200000.0},
        {"month": "September 2026", "target_units": 16, "achieved_units": 14, "target_revenue": 7500000.0, "achieved_revenue": 6900000.0},
        {"month": "October 2026", "target_units": 15, "achieved_units": 11, "target_revenue": 7200000.0, "achieved_revenue": 5430714.0},
        {"month": "November 2026", "target_units": 16, "achieved_units": 4, "target_revenue": 7800000.0, "achieved_revenue": 2100000.0},
        {"month": "December 2026", "target_units": 18, "achieved_units": 0, "target_revenue": 8500000.0, "achieved_revenue": 0.0},
        {"month": "January 2027", "target_units": 18, "achieved_units": 0, "target_revenue": 8500000.0, "achieved_revenue": 0.0},
        {"month": "February 2027", "target_units": 20, "achieved_units": 0, "target_revenue": 9500000.0, "achieved_revenue": 0.0},
        {"month": "March 2027", "target_units": 22, "achieved_units": 0, "target_revenue": 10500000.0, "achieved_revenue": 0.0},
    ]

    for m in months_data:
        if not db.query(SalesTarget).filter(SalesTarget.month == m["month"]).first():
            db.add(SalesTarget(**m))

    db.commit()
    db.close()
    print("Database seeded with 100% of all platform modules and activities!")

if __name__ == "__main__":
    seed_all()

# ATCORP – India: B2B CRM, Sales Execution & AI CPQ Platform

Proprietary enterprise CRM, machinery CPQ engine, and automated factory handoff (Order Finalization Memorandum - OFM) system built for **ATCORP – India** ([www.atcorpindia.com](https://www.atcorpindia.com)).

---

## 🏗️ Architecture & Tech Stack

This project is architected as an **AI-maintainable Unified Container**:
* **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS (Silent Biosphere theme)
* **Backend API**: Python 3.11 + FastAPI + Pydantic v2 + SQLAlchemy 2.0
* **PDF Engine**: ReportLab + PyPDF (Generates formal 3-page engineering proposals and 1-page Factory PPC Job Cards)
* **OCR / Vision**: Hybrid 2-Tier Engine (Local heuristic regex for Indian cards + Vision LLM fallback)
* **Database**: SQLite for local dev (`atcorp_crm.db`), auto-swappable to **Azure Database for PostgreSQL** via environment variables
* **Deployment**: Multi-stage `Dockerfile` running on **Azure Container Apps** (scale-to-zero, single-container, zero CORS)

---

## ⚙️ Complete 4-Module Suite

### 1. Equipment Model Master (10-Column Schema from `Models Input.jpg`)
* **PRKEY**: Primary Product Key SKU (e.g. `CP-CPM-15-FS-8`)
* **IDESC**: Item Description
* **Motor**: Power rating in kW & HP
* **Type**: Machinery Category (Screw Compressor, Chiller, Dryer, Receiver, Cooling Tower)
* **Brand**: OEM Brand (Chicago Pneumatic, Gem Equipments, ATCORP Prime)
* **VSD / FS**: Inverter Drive (VSD) vs. Fixed Speed (FS)
* **MaXimum Pressure**: Operating working pressure (bar / psi)
* **FAD (cfm)**: Free Air Delivery airflow
* **Dimension**: Footprint $L \times W \times H$ mm
* **CLP**: Company List Price in ₹ INR
* **Features**: Live Add/Edit/Clone/Delete, real-time multi-select filtering, 1-Click Excel Export (`/api/v1/models/export/excel`), KPI summary cards.

### 2. CPQ Quotation Engine & PDF Proposal Generator
* **Commercial Pricing Engine**: Real-time math for Base CLP, Discount %, Packaging & Forwarding (P&F @ 2%), Freight terms (Ex-Works vs. FOR Site), E&C charges, and GST.
* **Indian GST Jurisdiction**: Auto-computes inter-state **IGST @ 18%** or intra-state **CGST (9%) + SGST (9%)**.
* **Discount Governance Gate**:
  * $\le 15\%$ Discount: **AUTO_APPROVED** (Within Sales Engineer authority).
  * $> 15\%$ Discount: **PENDING_APPROVAL** (Flags requirement for Branch Manager / Admin signoff).
* **Data Science Win-Rate Forecaster**: Live model scoring deal closing probability based on equipment category and discount elasticity.
* **3-Page Formal Proposal PDF**:
  * **Page 1**: Official ATCORP Letterhead, Customer Details, Commercial Price Schedule, Terms of Payment, Delivery & Warranty.
  * **Page 2**: Technical Specification Data Sheet (pulling from Model Master parameters).
  * **Page 3**: Certified General Arrangement (GA) Dimensional Blueprint schematic with clearances.
* **Multi-Revision Drafts**: Creates `Rev-01`, `Rev-02`, `Rev-03` under permanent Enquiry # (e.g. `ENQ 43382`).
* **Send Entire Offer Modal**: Bundles 4 PDFs (Proposal, GA Blueprint, Catalog, OFM Terms) via automated SMTP Email and direct 1-click WhatsApp Web deeplink.

### 3. Smart Intake & AI Visiting Card Scanner
* **Hybrid Two-Tier Extraction**:
  * **Tier 1**: Regex & layout parser extracting Indian phone numbers, emails, GSTINs, designations, and plant addresses in $< 1.5$ seconds.
  * **Tier 2**: Multimodal Vision LLM fallback when live Gemini API key is configured.
* **1-Click Sample Card Switcher**: Instantly load and test real cards (Shivam Tools, Krishna Polymers, Apex Bio-Labs).
* **Direct Lead Registration**: 1-click registration creating a permanent Enquiry and routing it to the appropriate territory branch.

### 4. Editable OFM List & Factory Production Release
* **Editable Handoff During Negotiation**: Pending OFM records remain fully editable (paint shade, nozzle dimensions, committed dispatch date, PO details) and can spawn multiple revisions (`Rev-01`, `Rev-02`...) preserving the permanent Enquiry #.
* **PO Scrutiny Clearance Gate**: 4-point verification checklist (PO Value, Technical Specs, Payment Terms, GA Blueprint signoff).
* **Immutable Manufacturing Freeze**: Once PO scrutiny is approved, the OFM freezes permanently (read-only) and guards against further edits.
* **Factory PPC Job Sheet PDF**: Generates and streams official 1-page manufacturing shop floor release cards with certified engineering specs.

---

## 🚀 How to Run Locally

### Option 1: Double-Click Batch File (Quickest & No Policy Hassles)
Simply double-click `run_unified.bat` in File Explorer, or run in PowerShell / Command Prompt:
```cmd
.\run_unified.bat
```
This builds the React app, prepares SQLite database, and starts the unified server at `http://localhost:8000`.

### Option 2: PowerShell Unified Launcher
```powershell
.\run_dev.ps1 -Mode unified
```
*(If PowerShell blocks script execution, first run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*

### Option 3: Manual Direct Run
If you prefer running the commands manually:
```powershell
# Step 1: Build the React frontend
cd frontend
npm install
npm run build
cd ..

# Step 2: Start the FastAPI backend server
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 🌐 URLs & Access Points
* **Full Web Application**: [http://localhost:8000](http://localhost:8000)
* **Interactive API Docs (Swagger UI)**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
* **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### Local Data Persistence
* All data is saved automatically to the local SQLite database: `atcorp_crm.db` located in the root workspace.
* No MySQL or PostgreSQL service installation is required for local operation.
* Every operation (new lead creation from visiting card, CPQ quotation calculation, revision generation, PO scrutiny approval, campaign creation, and appointment booking) saves directly into `atcorp_crm.db` and is persisted across server restarts.

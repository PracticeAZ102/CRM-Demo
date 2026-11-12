import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ModelMasterView } from './components/models/ModelMasterView';
import { CpqQuotationView } from './components/cpq/CpqQuotationView';
import { SmartCardIntakeView } from './components/intake/SmartCardIntakeView';
import { PendingEnquiriesView } from './components/enquiries/PendingEnquiriesView';
import { OfmListView } from './components/ofm/OfmListView';
import { CampaignsView } from './components/campaigns/CampaignsView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { TargetsView } from './components/targets/TargetsView';

export function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const getPageInfo = () => {
    switch (activeView) {
      case 'dashboard':
        return {
          title: 'Executive Dashboard',
          subtitle: 'Real-time Sales Execution & KPI Overview',
        };
      case 'enquiry-new':
        return {
          title: 'Smart Intake (AI Visiting Card Scanner)',
          subtitle: 'Automated Lead Extraction & Customer Registration (Hybrid OCR)',
        };
      case 'enquiry-pending':
        return {
          title: 'Pending Enquiries Queue',
          subtitle: 'Active Pipeline & Quotation Routing',
        };
      case 'enquiry-edit':
        return {
          title: 'CPQ Quotation Engine & Blueprints',
          subtitle: 'Commercial Terms, Taxes, GA Drawing & Proposal PDF (ENQ 43382)',
        };
      case 'ofm-list':
        return {
          title: 'Pending OFM List & Revisions',
          subtitle: 'Multi-Revision Dealer Negotiation & Factory PPC Release Handoff',
        };
      case 'admin-models':
        return {
          title: 'Equipment Model Master & Catalog',
          subtitle: 'Configure 10-Field Machinery Catalog, CLP Pricing & Engineering Specs',
        };
      case 'campaigns':
        return {
          title: 'Trade Campaigns & Expos',
          subtitle: 'Exhibition Ingestion & ROI Tracking',
        };
      case 'appointments':
        return {
          title: 'Field Appointments',
          subtitle: 'Verified Customer Plant Visits',
        };
      case 'targets':
        return {
          title: 'FY 2026-27 Quota Governance',
          subtitle: 'Monthly Quotas vs. Achieved Units',
        };
      default:
        return { title: 'ATCORP – India CRM', subtitle: 'B2B Sales Execution Platform' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen bg-[#ffffff] text-[#000000] overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar pageTitle={title} pageSubtitle={subtitle} />

        <main className="p-6 flex-1 bg-[#ffffff]">
          {activeView === 'dashboard' && (
            <DashboardView onNavigate={(view) => setActiveView(view)} />
          )}

          {activeView === 'enquiry-new' && (
            <SmartCardIntakeView onEnquiryCreated={() => setActiveView('enquiry-pending')} />
          )}

          {activeView === 'enquiry-pending' && (
            <PendingEnquiriesView
              onOpenCpq={() => setActiveView('enquiry-edit')}
              onNewCard={() => setActiveView('enquiry-new')}
            />
          )}

          {activeView === 'enquiry-edit' && <CpqQuotationView />}

          {activeView === 'ofm-list' && <OfmListView />}

          {activeView === 'admin-models' && <ModelMasterView />}

          {activeView === 'campaigns' && (
            <CampaignsView onNavigateToIntake={() => setActiveView('enquiry-new')} />
          )}

          {activeView === 'appointments' && <AppointmentsView />}

          {activeView === 'targets' && <TargetsView />}
        </main>
      </div>
    </div>
  );
}

export default App;

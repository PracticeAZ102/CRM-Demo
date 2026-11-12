import {
  LayoutDashboard,
  FileSpreadsheet,
  ScanLine,
  FileCheck2,
  Calendar,
  Compass,
  Target,
  Database
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  modelsCount?: number;
}

export const Sidebar = ({ activeView, setActiveView, modelsCount = 8 }: SidebarProps) => {
  return (
    <aside className="w-64 bg-white border-r border-[#e2e8f0] flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2986cc] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              A
            </div>
            <div className="font-black text-sm tracking-wide text-[#000000]">
              ATCORP <span className="text-[#2986cc] font-medium">– India</span>
            </div>
          </div>
          <div className="text-[10px] text-[#7a8794] mt-0.5 tracking-wider font-semibold">
            B2B CRM & AI CPQ PLATFORM
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1 overflow-y-auto flex-1 text-xs">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7a8794]">
          Commercial & CPQ
        </div>

        <button
          onClick={() => setActiveView('dashboard')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
            activeView === 'dashboard'
              ? 'bg-[#2986cc] text-white font-semibold shadow-xs'
              : 'text-[#2e4350] hover:bg-[#ede9e1]/60'
          }`}
        >
          <LayoutDashboard size={16} />
          <span>Executive Dashboard</span>
        </button>

        <button
          onClick={() => setActiveView('enquiry-pending')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
            activeView === 'enquiry-pending'
              ? 'bg-[#2986cc] text-white font-semibold shadow-xs'
              : 'text-[#2e4350] hover:bg-[#ede9e1]/60'
          }`}
        >
          <FileSpreadsheet size={16} />
          <span>Pending Enquiries</span>
        </button>

        <button
          onClick={() => setActiveView('enquiry-edit')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
            activeView === 'enquiry-edit'
              ? 'bg-[#2986cc] text-white font-semibold shadow-xs'
              : 'text-[#2e4350] hover:bg-[#ede9e1]/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm">⚙️</span>
            <span>CPQ Quotation Engine</span>
          </div>
          <span className="bg-[#6aa84f]/15 text-[#6aa84f] text-[9px] font-bold px-1.5 py-0.5 rounded">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveView('enquiry-new')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
            activeView === 'enquiry-new'
              ? 'bg-[#2986cc] text-white font-semibold shadow-xs'
              : 'text-[#2e4350] hover:bg-[#ede9e1]/60'
          }`}
        >
          <ScanLine size={16} />
          <span>Smart Intake (Card OCR)</span>
        </button>

        <button
          onClick={() => setActiveView('ofm-list')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
            activeView === 'ofm-list'
              ? 'bg-[#2986cc] text-white font-semibold shadow-xs'
              : 'text-[#2e4350] hover:bg-[#ede9e1]/60'
          }`}
        >
          <FileCheck2 size={16} />
          <span>Pending OFM & Revisions</span>
        </button>

        <div className="pt-3 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7a8794]">
          Field & Quotas
        </div>

        <button
          onClick={() => setActiveView('campaigns')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
            activeView === 'campaigns'
              ? 'bg-[#2986cc] text-white font-semibold shadow-xs'
              : 'text-[#2e4350] hover:bg-[#ede9e1]/60'
          }`}
        >
          <Compass size={16} />
          <span>Campaigns & Expos</span>
        </button>

        <button
          onClick={() => setActiveView('appointments')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
            activeView === 'appointments'
              ? 'bg-[#2986cc] text-white font-semibold shadow-xs'
              : 'text-[#2e4350] hover:bg-[#ede9e1]/60'
          }`}
        >
          <Calendar size={16} />
          <span>Field Appointments</span>
        </button>

        <button
          onClick={() => setActiveView('targets')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
            activeView === 'targets'
              ? 'bg-[#2986cc] text-white font-semibold shadow-xs'
              : 'text-[#2e4350] hover:bg-[#ede9e1]/60'
          }`}
        >
          <Target size={16} />
          <span>FY 2026-27 Targets</span>
        </button>

        <div className="pt-3 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7a8794]">
          Administration & Masters
        </div>

        <button
          onClick={() => setActiveView('admin-models')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
            activeView === 'admin-models'
              ? 'bg-[#2986cc] text-white font-semibold shadow-xs'
              : 'text-[#2e4350] hover:bg-[#ede9e1]/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Database size={16} />
            <span>Equipment Models</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              activeView === 'admin-models'
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-[#2986cc]/10 text-[#2986cc] border-[#2986cc]/20'
            }`}
          >
            {modelsCount}
          </span>
        </button>
      </nav>

      {/* Footer Branding */}
      <div className="p-3 border-t border-[#e2e8f0] text-center bg-slate-50/50">
        <a
          href="https://www.atcorpindia.com"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-[#2986cc] hover:underline font-semibold block"
        >
          www.atcorpindia.com
        </a>
        <div className="text-[9px] text-[#7a8794] mt-0.5">Silent Biosphere • v1.0.0</div>
      </div>
    </aside>
  );
};

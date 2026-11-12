import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { DashboardStats } from '../../types/activity';
import type { Enquiry } from '../../types/enquiry';
import {
  FileText,
  Target,
  Factory,
  Camera,
  Calendar,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Layers
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, enquiriesData] = await Promise.all([
        api.getDashboardStats(),
        api.getEnquiries(),
      ]);
      setStats(statsData);
      setRecentEnquiries(enquiriesData.slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500">
        <RefreshCw size={32} className="animate-spin mb-3 text-[#2986cc]" />
        <p className="text-sm font-medium">Loading executive dashboard metrics...</p>
      </div>
    );
  }

  const mtdPercent = stats?.mtd_target_units
    ? Math.round((stats.mtd_achieved_units / stats.mtd_target_units) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Welcome */}
      <div className="bg-gradient-to-r from-[#2986cc]/10 via-[#2986cc]/5 to-transparent p-5 rounded-xl border border-[#2986cc]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#2986cc] text-white rounded uppercase tracking-wider">
              FY 2026-27 Live
            </span>
            <span className="text-xs text-slate-500 font-medium">Noida HQ & North India Operations</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            ATCORP – India Executive Operations Command
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time pipeline visibility from visiting card scan to factory floor PPC job release.
          </p>
        </div>

        {/* Quick Launch Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('enquiry-new')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2986cc] text-white text-xs font-semibold rounded-lg hover:bg-[#1f6cb0] shadow-xs transition"
          >
            <Camera size={14} />
            <span>Scan Visiting Card</span>
          </button>
          <button
            onClick={() => onNavigate('enquiry-edit')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
          >
            <FileText size={14} />
            <span>Open CPQ Engine</span>
          </button>
          <button
            onClick={() => onNavigate('ofm-list')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
          >
            <Factory size={14} />
            <span>OFM Factory Release</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="font-bold underline ml-2">
            Retry
          </button>
        </div>
      )}

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Enquiries */}
        <div
          onClick={() => onNavigate('enquiry-pending')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#2986cc] hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Pending Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2986cc] flex items-center justify-center group-hover:bg-[#2986cc] group-hover:text-white transition">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_enquiries || 0}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Customer pipeline queue</span>
            <span className="text-[#2986cc] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
              View queue <ArrowRight size={10} />
            </span>
          </div>
        </div>

        {/* Card 2: MTD Target Units */}
        <div
          onClick={() => onNavigate('targets')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#6aa84f] hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">MTD Target (Units)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#6aa84f] flex items-center justify-center group-hover:bg-[#6aa84f] group-hover:text-white transition">
              <Target size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.mtd_achieved_units || 0}</span>
            <span className="text-xs text-slate-500 font-medium">/ {stats?.mtd_target_units || 0} machines</span>
            <span className="ml-auto text-xs font-bold text-[#6aa84f]">{mtdPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-[#6aa84f] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(mtdPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Factory Released OFMs */}
        <div
          onClick={() => onNavigate('ofm-list')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#2e4350] hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Factory Release OFM</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#2e4350] flex items-center justify-center group-hover:bg-[#2e4350] group-hover:text-white transition">
              <Factory size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.released_ofm_count || 0}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span className="text-amber-600 font-semibold">{stats?.pending_ofm_count || 0} pending scrutiny</span>
            <span className="text-[#2e4350] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
              Manage <ArrowRight size={10} />
            </span>
          </div>
        </div>

        {/* Card 4: Machinery Catalog */}
        <div
          onClick={() => onNavigate('admin-models')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#2986cc] hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Equipment Catalog</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2986cc] flex items-center justify-center group-hover:bg-[#2986cc] group-hover:text-white transition">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_models || 0}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>CP & Gem screw models</span>
            <span className="text-[#2986cc] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
              Master table <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Field Visits */}
        <div
          onClick={() => onNavigate('appointments')}
          className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#2986cc] flex items-center justify-center shrink-0">
            <Calendar size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900">
              {stats?.upcoming_appointments || 0} Upcoming Plant Audits
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Manesar, Faridabad & Haridwar customer sites
            </div>
          </div>
          <ArrowRight size={14} className="text-slate-400" />
        </div>

        {/* Active Expos */}
        <div
          onClick={() => onNavigate('campaigns')}
          className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#6aa84f] flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900">
              {stats?.active_campaigns || 0} Active Trade Campaigns
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Engitech 2026, AutoTech & Industrial Expos
            </div>
          </div>
          <ArrowRight size={14} className="text-slate-400" />
        </div>

        {/* Active Quotations */}
        <div
          onClick={() => onNavigate('enquiry-edit')}
          className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900">
              {stats?.active_quotes || 0} Live CPQ Proposals
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              3-page Techno-Commercial PDF generation ready
            </div>
          </div>
          <ArrowRight size={14} className="text-slate-400" />
        </div>
      </div>

      {/* Action Required Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
          <AlertTriangle size={18} />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
            Governance Action Required (Discount & PO Scrutiny Gates)
          </h4>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            Quotation <strong>QT-43382-Rev-02</strong> has an approved 10.0% discount gate. 
            Before releasing to Factory PPC Shop Floor, ensure the 4-point PO Scrutiny 
            (Commercial CLP Match, Technical Motor/Pressure Verification, Delivery Schedule, and Invoicing Branch) is locked in OFM.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onNavigate('ofm-list')}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition"
            >
              Go to OFM Scrutiny →
            </button>
            <button
              onClick={() => onNavigate('enquiry-edit')}
              className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold rounded-lg transition"
            >
              Inspect CPQ Terms
            </button>
          </div>
        </div>
      </div>

      {/* Recent Enquiries / Pipeline Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Customer Inquiries</h3>
            <p className="text-xs text-slate-500">Live pipeline registrations from Smart Card Intake</p>
          </div>
          <button
            onClick={() => onNavigate('enquiry-pending')}
            className="text-xs font-bold text-[#2986cc] hover:underline flex items-center gap-1"
          >
            View all enquiries <ArrowRight size={12} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4">Enquiry #</th>
                <th className="py-2.5 px-4">Company Name</th>
                <th className="py-2.5 px-4">Contact Person</th>
                <th className="py-2.5 px-4">Sector / Plant</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">
                    No enquiries found. Use Smart Card Intake to register new leads.
                  </td>
                </tr>
              ) : (
                recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#2986cc]">{enq.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{enq.company_name}</div>
                      <div className="text-[11px] text-slate-500">{enq.gstin || 'GST Unregistered'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{enq.contact_person}</div>
                      <div className="text-[11px] text-slate-500">{enq.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{enq.industry_sector}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{enq.plant_location}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          enq.status === 'OFM_RELEASED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : enq.status === 'OFM_PENDING'
                            ? 'bg-purple-100 text-purple-800'
                            : enq.status === 'ACTIVE_QUOTATION'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate(enq.status === 'OFM_PENDING' ? 'ofm-list' : 'enquiry-edit')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#2986cc] hover:text-white text-slate-700 font-bold rounded transition text-[11px]"
                      >
                        {enq.status === 'OFM_PENDING' ? 'View OFM' : 'Open CPQ'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

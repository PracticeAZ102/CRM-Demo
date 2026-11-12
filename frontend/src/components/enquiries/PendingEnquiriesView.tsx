import { useState, useEffect } from 'react';
import { Search, RotateCcw, ArrowUpRight, Plus, MapPin, User, Building } from 'lucide-react';
import type { Enquiry } from '../../types/enquiry';
import { api } from '../../services/api';

interface PendingEnquiriesViewProps {
  onOpenCpq: (enquiryId: string) => void;
  onNewCard: () => void;
}

export const PendingEnquiriesView = ({ onOpenCpq, onNewCard }: PendingEnquiriesViewProps) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getEnquiries({ search, status, branch });
      setEnquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, status, branch]);

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setBranch('');
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'RELEASED_TO_PPC':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">Released to Factory</span>;
      case 'OFM_PENDING':
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">OFM Negotiating</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px] border border-blue-200">Active Quotation</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📑</span>
            <h2 className="text-xl font-bold text-[#000000]">Active Pipeline & Enquiry Queue</h2>
            <span className="bg-[#2986cc]/10 text-[#2986cc] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#2986cc]/20">
              {enquiries.length} Active Leads
            </span>
          </div>
          <p className="text-xs text-[#7a8794] mt-1">
            Track commercial progress from Card OCR Intake to CPQ Quotation and OFM Handoff.
          </p>
        </div>

        <button
          onClick={onNewCard}
          className="px-4 py-2 bg-[#2986cc] hover:bg-[#1f6cb0] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <Plus size={14} /> Scan New Visiting Card
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-4 bg-slate-50/80 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company or enquiry ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#000000] focus:ring-1 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#2986cc] outline-hidden"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE_QUOTATION">Active Quotation</option>
              <option value="OFM_PENDING">OFM Negotiating</option>
              <option value="RELEASED_TO_PPC">Released to Factory</option>
            </select>

            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#2986cc] outline-hidden"
            >
              <option value="">All Branches</option>
              <option value="Noida HQ">Noida HQ</option>
              <option value="Haridwar Branch">Haridwar</option>
              <option value="Rudrapur Branch">Rudrapur</option>
              <option value="Lucknow Branch">Lucknow</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7a8794] font-medium">
              Showing {enquiries.length} enquiry record{enquiries.length !== 1 ? 's' : ''}
            </span>
            {(search || status || branch) && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#2986cc] hover:underline font-semibold flex items-center gap-1 ml-2"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Enquiries Table */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#7a8794]">
            <div className="w-8 h-8 border-2 border-[#2986cc] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading pipeline enquiries...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2986cc] text-white text-[11px] font-bold tracking-wider uppercase">
                  <th className="py-3 px-3.5 border-r border-[#1f6cb0]">Enquiry ID</th>
                  <th className="py-3 px-3.5 border-r border-[#1f6cb0] min-w-[200px]">Client / Company</th>
                  <th className="py-3 px-3.5 border-r border-[#1f6cb0]">Contact Person</th>
                  <th className="py-3 px-3 border-r border-[#1f6cb0]">Industry Sector</th>
                  <th className="py-3 px-3 border-r border-[#1f6cb0]">Branch</th>
                  <th className="py-3 px-3 border-r border-[#1f6cb0]">Assigned Rep</th>
                  <th className="py-3 px-3 border-r border-[#1f6cb0] text-center">Status</th>
                  <th className="py-3 px-3 text-center">CPQ Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-xs text-[#000000]">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3.5 font-mono font-bold text-[#2986cc]">
                      ENQ-{enq.id}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-[#000000]">
                      <div className="flex items-center gap-1.5">
                        <Building size={14} className="text-[#2986cc] shrink-0" />
                        <div>
                          <span>{enq.company_name}</span>
                          <span className="text-[10px] text-[#7a8794] block font-normal flex items-center gap-1">
                            <MapPin size={10} /> {enq.plant_location}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-medium">{enq.contact_person}</div>
                      <div className="text-[10px] text-[#7a8794]">{enq.phone}</div>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-700">{enq.industry_sector}</td>
                    <td className="py-3 px-3 font-medium text-[11px]">{enq.branch_region}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-700 flex items-center gap-1">
                      <User size={12} className="text-[#2986cc]" /> {enq.assigned_engineer}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(enq.status)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => onOpenCpq(enq.id)}
                        className="px-3 py-1 bg-white text-[#2986cc] border border-[#2986cc] hover:bg-[#2986cc]/10 rounded-md text-xs font-bold transition inline-flex items-center gap-1 shadow-xs"
                      >
                        <span>Open CPQ</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


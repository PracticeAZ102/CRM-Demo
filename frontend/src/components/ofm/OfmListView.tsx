import { useState, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  Edit2,
  Copy,
  Lock,
  Download,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';
import type { OFMRecord, OFMSummary, OFMUpdate, OFMFreezeRequest } from '../../types/ofm';
import { api } from '../../services/api';
import { EditOfmModal } from './EditOfmModal';
import { PoScrutinyModal } from './PoScrutinyModal';

export const OfmListView = () => {
  const [ofms, setOfms] = useState<OFMRecord[]>([]);
  const [summary, setSummary] = useState<OFMSummary | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [editingOfm, setEditingOfm] = useState<OFMRecord | null>(null);
  const [scrutinyOfm, setScrutinyOfm] = useState<OFMRecord | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [ofmData, summaryData] = await Promise.all([
        api.getOfmList({ search, status }),
        api.getOfmSummary(),
      ]);
      setOfms(ofmData);
      setSummary(summaryData);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, status]);

  const handleSaveOfm = async (ofmId: string, data: OFMUpdate) => {
    await api.updateOfm(ofmId, data);
    showToast(`OFM ${ofmId} specifications updated!`);
    loadData();
  };

  const handleReviseOfm = async (ofmId: string) => {
    try {
      const rev = await api.reviseOfm(ofmId);
      showToast(`Created new negotiation revision ${rev.id} under Enquiry #${rev.enquiry_id}!`);
      loadData();
    } catch (err: any) {
      showToast(`Error creating revision: ${err.message}`);
    }
  };

  const handleFreezeOfm = async (ofmId: string, data: OFMFreezeRequest) => {
    await api.freezeOfm(ofmId, data);
    showToast(`OFM ${ofmId} FROZEN and released to Factory PPC!`);
    loadData();
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
  };

  const getStatusBadge = (ofm: OFMRecord) => {
    if (ofm.is_frozen || ofm.status === 'FROZEN_FACTORY_RELEASE') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300 flex items-center gap-1 justify-center">
          <Lock size={11} /> Released to Factory
        </span>
      );
    }
    if (ofm.status === 'AWAITING_PO_SCRUTINY') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-300 flex items-center gap-1 justify-center">
          <AlertCircle size={11} /> Awaiting PO Scrutiny
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300 flex items-center gap-1 justify-center">
        <span>✏️</span> Dealer Negotiating
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-[#6aa84f]">✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏭</span>
            <h2 className="text-xl font-bold text-[#000000]">
              Pending OFM List & Factory Production Release
            </h2>
            <span className="bg-[#6aa84f]/10 text-[#6aa84f] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6aa84f]/20">
              Multi-Revision Handoff
            </span>
          </div>
          <p className="text-xs text-[#7a8794] mt-1">
            Order Finalization Memorandums are editable during dealer negotiations; frozen permanently upon PO Scrutiny signoff.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold text-[#7a8794] uppercase tracking-wider">
            Total OFM Records
          </div>
          <div className="text-2xl font-extrabold text-[#000000] mt-1">
            {summary ? `${summary.total_ofm_records} Orders` : '...'}
          </div>
          <div className="text-[11px] text-[#2986cc] font-medium mt-1">Across all North Zone branches</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold text-[#7a8794] uppercase tracking-wider">
            Dealer Negotiating
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {summary ? `${summary.pending_dealer_review} Pending` : '...'}
          </div>
          <div className="text-[11px] text-[#7a8794] mt-1">Revisions editable by sales reps</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold text-[#7a8794] uppercase tracking-wider">
            Awaiting PO Scrutiny
          </div>
          <div className="text-2xl font-extrabold text-[#2986cc] mt-1">
            {summary ? `${summary.awaiting_po_scrutiny} POs` : '...'}
          </div>
          <div className="text-[11px] text-[#7a8794] mt-1">Customer PO attached; ready to freeze</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold text-[#7a8794] uppercase tracking-wider">
            Released to Factory PPC
          </div>
          <div className="text-2xl font-extrabold text-[#166534] mt-1">
            {summary ? `${summary.frozen_factory_released} In Assembly` : '...'}
          </div>
          <div className="text-[11px] text-[#6aa84f] font-medium mt-1">Locked specifications on shop floor</div>
        </div>
      </div>

      {/* OFM Table Container */}
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
                placeholder="Search OFM #, Enquiry, or PO #..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#000000] focus:ring-1 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#2986cc] outline-hidden"
            >
              <option value="">All Lifecycle Statuses</option>
              <option value="PENDING_DEALER_REVIEW">Dealer Negotiating</option>
              <option value="AWAITING_PO_SCRUTINY">Awaiting PO Scrutiny</option>
              <option value="FROZEN_FACTORY_RELEASE">Released to Factory Floor</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7a8794] font-medium">
              Showing {ofms.length} OFM record{ofms.length !== 1 ? 's' : ''}
            </span>
            {(search || status) && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#2986cc] hover:underline font-semibold flex items-center gap-1 ml-2"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#7a8794]">
            <div className="w-8 h-8 border-2 border-[#2986cc] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading OFM records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2986cc] text-white text-[11px] font-bold tracking-wider uppercase">
                  <th className="py-3 px-3.5 border-r border-[#1f6cb0]">OFM Reference</th>
                  <th className="py-3 px-3.5 border-r border-[#1f6cb0]">Enquiry & Client</th>
                  <th className="py-3 px-3.5 border-r border-[#1f6cb0]">Customer PO Details</th>
                  <th className="py-3 px-3 border-r border-[#1f6cb0]">Target Dispatch</th>
                  <th className="py-3 px-3 border-r border-[#1f6cb0]">Paint & Technical Specs</th>
                  <th className="py-3 px-3 border-r border-[#1f6cb0] text-center">Status</th>
                  <th className="py-3 px-3 text-center">Handoff Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-xs text-[#000000]">
                {ofms.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-[#2986cc]">{rec.id}</div>
                      <div className="text-[10px] text-[#7a8794] flex items-center gap-1 mt-0.5">
                        <span className="bg-slate-100 font-bold px-1.5 py-0.2 rounded border border-slate-300">
                          Rev-0{rec.revision_no}
                        </span>
                        <span>{rec.ofm_number}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-semibold flex items-center gap-1">
                        <Building size={13} className="text-[#2986cc]" />
                        {rec.enquiry?.company_name || `Enquiry #${rec.enquiry_id}`}
                      </div>
                      <div className="text-[10px] text-[#7a8794] mt-0.5">
                        Permanent Enquiry Ref: <b>ENQ #{rec.enquiry_id}</b>
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      {rec.customer_po_number ? (
                        <div>
                          <div className="font-mono font-bold text-[#000000]">{rec.customer_po_number}</div>
                          <div className="text-[10px] text-[#7a8794] flex items-center gap-1">
                            <Calendar size={11} /> {rec.customer_po_date} • ₹{(rec.customer_po_value || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Awaiting formal customer PO</span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-semibold text-[#000000] whitespace-nowrap">
                      {rec.committed_dispatch_date || 'To be scheduled'}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-[11px] font-medium text-slate-800">{rec.paint_shade}</div>
                      <div className="text-[10px] text-[#7a8794]">
                        {rec.electrical_supply} • {rec.air_discharge_nozzle}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(rec)}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Button (if not frozen) */}
                        {!rec.is_frozen ? (
                          <button
                            onClick={() => setEditingOfm(rec)}
                            className="p-1.5 text-slate-600 hover:text-[#2986cc] rounded hover:bg-slate-100 transition"
                            title="Edit Pending OFM Specs"
                          >
                            <Edit2 size={14} />
                          </button>
                        ) : (
                          <span className="p-1.5 text-slate-300 cursor-not-allowed" title="Locked (Frozen)">
                            <Lock size={14} />
                          </span>
                        )}

                        {/* New Revision Button (if not frozen) */}
                        {!rec.is_frozen && (
                          <button
                            onClick={() => handleReviseOfm(rec.id)}
                            className="p-1.5 text-slate-600 hover:text-[#6aa84f] rounded hover:bg-slate-100 transition"
                            title="Spawn Next Revision (e.g. Rev-02) under same Enquiry #"
                          >
                            <Copy size={14} />
                          </button>
                        )}

                        {/* PO Scrutiny Freeze Button */}
                        {!rec.is_frozen && (
                          <button
                            onClick={() => setScrutinyOfm(rec)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded text-[11px] font-bold transition flex items-center gap-1"
                            title="Authorize PO Scrutiny & Freeze for Factory"
                          >
                            <Lock size={12} />
                            <span>Freeze</span>
                          </button>
                        )}

                        {/* Factory Sheet PDF */}
                        <a
                          href={api.getFactorySheetPdfUrl(rec.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-[#2986cc] hover:text-[#1f6cb0] rounded hover:bg-blue-50 transition"
                          title="Download Official Factory Release Sheet PDF"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditOfmModal
        ofm={editingOfm}
        isOpen={!!editingOfm}
        onClose={() => setEditingOfm(null)}
        onSave={handleSaveOfm}
      />

      <PoScrutinyModal
        ofm={scrutinyOfm}
        isOpen={!!scrutinyOfm}
        onClose={() => setScrutinyOfm(null)}
        onFreeze={handleFreezeOfm}
      />
    </div>
  );
};


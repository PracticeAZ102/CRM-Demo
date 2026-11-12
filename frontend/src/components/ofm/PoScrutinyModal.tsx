import { useState } from 'react';
import { X, Lock, CheckCircle2, AlertOctagon } from 'lucide-react';
import type { OFMRecord, OFMFreezeRequest } from '../../types/ofm';

interface PoScrutinyModalProps {
  ofm: OFMRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onFreeze: (ofmId: string, data: OFMFreezeRequest) => Promise<void>;
}

export const PoScrutinyModal = ({ ofm, isOpen, onClose, onFreeze }: PoScrutinyModalProps) => {
  const [poNumber, setPoNumber] = useState(ofm?.customer_po_number || 'PO/SHANTI/2026/894');
  const [poDate, setPoDate] = useState(ofm?.customer_po_date || '2026-10-28');
  const [poValue, setPoValue] = useState(ofm?.customer_po_value || 543071);
  const [dispatchDate, setDispatchDate] = useState(ofm?.committed_dispatch_date || '2026-11-20');

  const [poValueChecked, setPoValueChecked] = useState(true);
  const [techSpecsChecked, setTechSpecsChecked] = useState(true);
  const [paymentTermsChecked, setPaymentTermsChecked] = useState(true);
  const [gaDrawingChecked, setGaDrawingChecked] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ofm) return null;

  const handleAuthorize = async () => {
    if (!poValueChecked || !techSpecsChecked || !paymentTermsChecked || !gaDrawingChecked) {
      setError('All 4 PO Scrutiny verification gates must be certified before factory release.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onFreeze(ofm.id, {
        customer_po_number: poNumber,
        customer_po_date: poDate,
        customer_po_value: poValue,
        po_value_verified: poValueChecked,
        tech_specs_verified: techSpecsChecked,
        payment_terms_verified: paymentTermsChecked,
        ga_drawing_cleared: gaDrawingChecked,
        committed_dispatch_date: dispatchDate,
        approved_by: 'Rajesh Sharma (Commercial Head)',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error freezing OFM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-[#cbd5e1] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Lock size={18} /> PO Scrutiny & Factory PPC Production Release
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Certifying OFM #{ofm.ofm_number} (Rev-0{ofm.revision_no} • ENQ #{ofm.enquiry_id})
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-[#000000]">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium flex items-center gap-2">
              <AlertOctagon size={16} /> {error}
            </div>
          )}

          {/* PO Details Confirmation */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-[#e2e8f0] rounded-lg">
            <div>
              <label className="block font-bold mb-1">Customer PO Number</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded font-mono text-xs focus:ring-1 focus:ring-[#2986cc] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Customer PO Date</label>
              <input
                type="date"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded text-xs focus:ring-1 focus:ring-[#2986cc] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Verified PO Value (₹)</label>
              <input
                type="number"
                value={poValue}
                onChange={(e) => setPoValue(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded font-bold text-xs focus:ring-1 focus:ring-[#2986cc] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Committed Factory Dispatch</label>
              <input
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded text-xs focus:ring-1 focus:ring-[#2986cc] outline-hidden font-medium"
              />
            </div>
          </div>

          {/* 4 Mandatory Verification Checklist Gates */}
          <div className="space-y-2.5 pt-2">
            <div className="font-bold text-[#000000]">Commercial & Technical Clearance Gates:</div>

            <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={poValueChecked}
                onChange={(e) => setPoValueChecked(e.target.checked)}
                className="rounded text-[#6aa84f] w-4 h-4"
              />
              <div>
                <span className="font-bold block">1. PO Commercial Value Check</span>
                <span className="text-[10px] text-[#7a8794]">Customer PO amount exactly matches quoted proposal value ₹5,43,071 (incl. 18% GST).</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={techSpecsChecked}
                onChange={(e) => setTechSpecsChecked(e.target.checked)}
                className="rounded text-[#6aa84f] w-4 h-4"
              />
              <div>
                <span className="font-bold block">2. Engineering Specs & Deviation Clearance</span>
                <span className="text-[10px] text-[#7a8794]">Motor rating, 8 bar pressure, and VSD/FS drive type verified against customer requirement.</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={paymentTermsChecked}
                onChange={(e) => setPaymentTermsChecked(e.target.checked)}
                className="rounded text-[#6aa84f] w-4 h-4"
              />
              <div>
                <span className="font-bold block">3. Payment Terms & Advance Verification</span>
                <span className="text-[10px] text-[#7a8794]">20% Advance payment terms agreed; customer credit check approved by Finance.</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={gaDrawingChecked}
                onChange={(e) => setGaDrawingChecked(e.target.checked)}
                className="rounded text-[#6aa84f] w-4 h-4"
              />
              <div>
                <span className="font-bold block">4. GA Drawing & Plant Clearances Signoff</span>
                <span className="text-[10px] text-[#7a8794]">GA dimensional blueprint signed and approved by client DGM - Utility.</span>
              </div>
            </label>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-start gap-2">
            <Lock size={15} className="shrink-0 mt-0.5 text-amber-600" />
            <span>
              <b>Warning:</b> Freezing this OFM is an irreversible action. Once authorized, the specifications are locked into a formal factory job card and transmitted to shop floor assembly.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-slate-50 border-t border-[#cbd5e1] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAuthorize}
            disabled={loading}
            className="px-5 py-2 text-xs font-bold bg-[#166534] hover:bg-[#14532d] text-white rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            {loading ? 'Authorizing...' : 'Authorize & Freeze for Factory PPC'}
          </button>
        </div>
      </div>
    </div>
  );
};


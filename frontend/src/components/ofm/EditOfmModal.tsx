import { useState, useEffect } from 'react';
import { X, Edit2, ShieldAlert } from 'lucide-react';
import type { OFMRecord, OFMUpdate } from '../../types/ofm';

interface EditOfmModalProps {
  ofm: OFMRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ofmId: string, data: OFMUpdate) => Promise<void>;
}

export const EditOfmModal = ({ ofm, isOpen, onClose, onSave }: EditOfmModalProps) => {
  const [formData, setFormData] = useState<OFMUpdate>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ofm) {
      setFormData({
        customer_po_number: ofm.customer_po_number || '',
        customer_po_date: ofm.customer_po_date || '',
        customer_po_value: ofm.customer_po_value || undefined,
        committed_dispatch_date: ofm.committed_dispatch_date || '',
        paint_shade: ofm.paint_shade || 'OEM Standard Industrial Blue (RAL 5015)',
        electrical_supply: ofm.electrical_supply || '415V, 3 Phase, 50Hz AC',
        air_discharge_nozzle: ofm.air_discharge_nozzle || '1.5 inch BSP Female',
        special_factory_instructions: ofm.special_factory_instructions || '',
      });
    }
  }, [ofm]);

  if (!isOpen || !ofm) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(ofm.id, formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update OFM specifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-[#cbd5e1] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#2986cc] text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Edit2 size={18} /> Edit Pending OFM Technical & Commercial Handoff
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Editing: <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">{ofm.id}</span>
              &nbsp;(Rev-0{ofm.revision_no} • ENQ #{ofm.enquiry_id})
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium flex items-center gap-2">
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer PO Number */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">Customer PO Number</label>
              <input
                type="text"
                value={formData.customer_po_number || ''}
                onChange={(e) => setFormData({ ...formData, customer_po_number: e.target.value })}
                placeholder="e.g. PO/SHANTI/2026/894"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg font-mono focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* PO Date */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">Customer PO Date</label>
              <input
                type="date"
                value={formData.customer_po_date || ''}
                onChange={(e) => setFormData({ ...formData, customer_po_date: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* Committed Dispatch Date */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">
                Committed Dispatch Date (PPC Floor) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.committed_dispatch_date || ''}
                onChange={(e) => setFormData({ ...formData, committed_dispatch_date: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden font-medium"
              />
            </div>

            {/* Paint Shade */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">Factory Paint Shade</label>
              <select
                value={formData.paint_shade || ''}
                onChange={(e) => setFormData({ ...formData, paint_shade: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden font-medium"
              >
                <option value="OEM Standard Industrial Blue (RAL 5015)">OEM Standard Blue (RAL 5015)</option>
                <option value="Siemens Grey (RAL 7035 Special)">Siemens Grey (RAL 7035)</option>
                <option value="Pure Cleanroom White (RAL 9010)">Pure Cleanroom White (RAL 9010)</option>
                <option value="Olive Green (RAL 6003)">Industrial Olive Green (RAL 6003)</option>
              </select>
            </div>

            {/* Electrical Supply */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">Electrical Supply Specs</label>
              <input
                type="text"
                value={formData.electrical_supply || ''}
                onChange={(e) => setFormData({ ...formData, electrical_supply: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* Air Discharge Nozzle */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">Discharge Nozzle Flange/Thread</label>
              <input
                type="text"
                value={formData.air_discharge_nozzle || ''}
                onChange={(e) => setFormData({ ...formData, air_discharge_nozzle: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* Special Instructions */}
            <div className="md:col-span-2">
              <label className="block font-bold text-[#000000] mb-1">
                Special Assembly & Dispatch Notes for Shop Floor
              </label>
              <textarea
                rows={3}
                value={formData.special_factory_instructions || ''}
                onChange={(e) => setFormData({ ...formData, special_factory_instructions: e.target.value })}
                placeholder="e.g. Include dual pressure test certificate, anti-vibration pad kit..."
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden resize-none"
              ></textarea>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-[#e2e8f0] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold bg-[#2986cc] hover:bg-[#1f6cb0] text-white rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save OFM Specifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


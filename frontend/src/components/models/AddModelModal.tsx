import { useState } from 'react';
import { X, Settings } from 'lucide-react';
import type { EquipmentModelCreate } from '../../types/equipment_model';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newModel: EquipmentModelCreate) => void;
}

export const AddModelModal = ({ isOpen, onClose, onSuccess }: AddModelModalProps) => {
  const [formData, setFormData] = useState<EquipmentModelCreate>({
    prkey: '',
    idesc: '',
    motor: '',
    type: 'Screw Compressor',
    brand: 'Chicago Pneumatic',
    vsd_fs: 'FS',
    maximum_pressure: '',
    fad_cfm: '',
    dimension: '',
    clp: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prkey || !formData.idesc || !formData.clp) {
      setError('Please fill all mandatory fields: PRKEY, IDESC, and CLP.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSuccess(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-[#cbd5e1] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#2986cc] text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Settings size={18} /> Add Equipment Model Master
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Specifications conform to 10-column schema (Models Input.jpg)
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. PRKEY */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">
                PRKEY (Primary Product Code) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.prkey}
                onChange={(e) => setFormData({ ...formData, prkey: e.target.value })}
                placeholder="e.g. CP-CPM-20-FS-10"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg font-mono focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
              <span className="text-[10px] text-slate-400">Unique alphanumeric equipment SKU identifier</span>
            </div>

            {/* 2. Brand */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              >
                <option value="Chicago Pneumatic">Chicago Pneumatic (Atlas Copco Group)</option>
                <option value="Gem Equipments">Gem Equipments Ltd</option>
                <option value="ATCORP Prime">ATCORP Prime (Fabricated)</option>
              </select>
            </div>

            {/* 3. IDESC */}
            <div className="md:col-span-2">
              <label className="block font-bold text-[#000000] mb-1">
                IDESC (Full Item Description) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.idesc}
                onChange={(e) => setFormData({ ...formData, idesc: e.target.value })}
                placeholder="e.g. Chicago Pneumatic 15 kW / 20 HP Rotary Screw Air Compressor"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* 4. Type */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">
                Type (Category) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              >
                <option value="Screw Compressor">Screw Compressor</option>
                <option value="Air Dryer">Refrigerated Air Dryer</option>
                <option value="Process Chiller">Water / Process Chiller</option>
                <option value="Air Receiver">Air Receiver Vessel</option>
                <option value="Cooling Tower">FRP Cooling Tower</option>
              </select>
            </div>

            {/* 5. VSD / FS */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">
                VSD / FS (Drive Control) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.vsd_fs}
                onChange={(e) => setFormData({ ...formData, vsd_fs: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              >
                <option value="FS">Fixed Speed (FS)</option>
                <option value="VSD">Variable Speed Drive (VSD)</option>
                <option value="N/A">N/A (Static Vessel / Non-driven)</option>
              </select>
            </div>

            {/* 6. Motor */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">
                Motor (Rating in kW & HP) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.motor}
                onChange={(e) => setFormData({ ...formData, motor: e.target.value })}
                placeholder="e.g. 15 kW / 20 HP"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* 7. MaXimum Pressure */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">
                MaXimum Pressure <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.maximum_pressure}
                onChange={(e) => setFormData({ ...formData, maximum_pressure: e.target.value })}
                placeholder="e.g. 8.5 bar"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* 8. FAD (cfm) */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">
                FAD (cfm) (Free Air Delivery) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fad_cfm}
                onChange={(e) => setFormData({ ...formData, fad_cfm: e.target.value })}
                placeholder="e.g. 78.4 cfm"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* 9. Dimension */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">
                Dimension (L x W x H in mm) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.dimension}
                onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                placeholder="e.g. 1200 x 850 x 1350 mm"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg font-mono focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* 10. CLP */}
            <div className="md:col-span-2">
              <label className="block font-bold text-[#000000] mb-1">
                CLP (Company List Price in ₹ INR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.clp || ''}
                  onChange={(e) => setFormData({ ...formData, clp: parseFloat(e.target.value) || 0 })}
                  placeholder="485000"
                  className="w-full pl-8 pr-3 py-2 border border-[#cbd5e1] rounded-lg font-bold text-sm focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                />
              </div>
              <span className="text-[10px] text-slate-400">
                Exclusive of GST & freight, serves as baseline for dealer discount structure
              </span>
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
              {loading ? 'Saving...' : 'Save Model to Master'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

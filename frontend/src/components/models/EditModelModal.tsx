import { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';
import type { EquipmentModel, EquipmentModelCreate } from '../../types/equipment_model';

interface EditModelModalProps {
  model: EquipmentModel | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (prkey: string, updated: Partial<EquipmentModelCreate>) => void;
}

export const EditModelModal = ({
  model,
  isOpen,
  onClose,
  onSuccess,
}: EditModelModalProps) => {
  const [formData, setFormData] = useState<Partial<EquipmentModelCreate>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (model) {
      setFormData({
        idesc: model.idesc,
        motor: model.motor,
        type: model.type,
        brand: model.brand,
        vsd_fs: model.vsd_fs,
        maximum_pressure: model.maximum_pressure,
        fad_cfm: model.fad_cfm,
        dimension: model.dimension,
        clp: model.clp,
      });
    }
  }, [model]);

  if (!isOpen || !model) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSuccess(model.prkey, formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating model');
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
              <Edit2 size={18} /> Edit Equipment Model Details
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Editing SKU:{' '}
              <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                {model.prkey}
              </span>
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
            {/* Brand */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">Brand</label>
              <select
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              >
                <option value="Chicago Pneumatic">Chicago Pneumatic</option>
                <option value="Gem Equipments">Gem Equipments</option>
                <option value="ATCORP Prime">ATCORP Prime</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">Type (Category)</label>
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              >
                <option value="Screw Compressor">Screw Compressor</option>
                <option value="Air Dryer">Refrigerated Air Dryer</option>
                <option value="Process Chiller">Process Chiller</option>
                <option value="Air Receiver">Air Receiver</option>
                <option value="Cooling Tower">Cooling Tower</option>
              </select>
            </div>

            {/* IDESC */}
            <div className="md:col-span-2">
              <label className="block font-bold text-[#000000] mb-1">
                IDESC (Full Item Description)
              </label>
              <input
                type="text"
                value={formData.idesc || ''}
                onChange={(e) => setFormData({ ...formData, idesc: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* VSD / FS */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">VSD / FS</label>
              <select
                value={formData.vsd_fs || 'FS'}
                onChange={(e) => setFormData({ ...formData, vsd_fs: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              >
                <option value="FS">Fixed Speed (FS)</option>
                <option value="VSD">Variable Speed Drive (VSD)</option>
                <option value="N/A">N/A (Static Vessel)</option>
              </select>
            </div>

            {/* Motor */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">Motor Rating</label>
              <input
                type="text"
                value={formData.motor || ''}
                onChange={(e) => setFormData({ ...formData, motor: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* MaXimum Pressure */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">MaXimum Pressure</label>
              <input
                type="text"
                value={formData.maximum_pressure || ''}
                onChange={(e) => setFormData({ ...formData, maximum_pressure: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* FAD (cfm) */}
            <div>
              <label className="block font-bold text-[#000000] mb-1">FAD (cfm)</label>
              <input
                type="text"
                value={formData.fad_cfm || ''}
                onChange={(e) => setFormData({ ...formData, fad_cfm: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* Dimension */}
            <div className="md:col-span-2">
              <label className="block font-bold text-[#000000] mb-1">
                Dimension (L x W x H in mm)
              </label>
              <input
                type="text"
                value={formData.dimension || ''}
                onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg font-mono focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            {/* CLP */}
            <div className="md:col-span-2">
              <label className="block font-bold text-[#000000] mb-1">
                CLP (Company List Price in ₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={formData.clp || ''}
                  onChange={(e) => setFormData({ ...formData, clp: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 border border-[#cbd5e1] rounded-lg font-bold text-sm focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                />
              </div>
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
              {loading ? 'Saving...' : 'Update Model Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

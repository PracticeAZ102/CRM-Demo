import { Edit2, Copy, Trash2 } from 'lucide-react';
import type { EquipmentModel } from '../../types/equipment_model';

interface ModelTableProps {
  models: EquipmentModel[];
  onEdit: (model: EquipmentModel) => void;
  onClone: (prkey: string) => void;
  onDelete: (prkey: string) => void;
  loading: boolean;
}

export const ModelTable = ({
  models,
  onEdit,
  onClone,
  onDelete,
  loading,
}: ModelTableProps) => {
  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#7a8794]">
        <div className="w-8 h-8 border-2 border-[#2986cc] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Loading equipment models...
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-[#7a8794] bg-slate-50/50">
        No equipment models match your filter criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#2986cc] text-white text-[11px] font-bold tracking-wider uppercase">
            <th className="py-3 px-3.5 border-r border-[#1f6cb0]">PRKEY</th>
            <th className="py-3 px-3.5 border-r border-[#1f6cb0] min-w-[200px]">IDESC</th>
            <th className="py-3 px-3 border-r border-[#1f6cb0] whitespace-nowrap">Motor</th>
            <th className="py-3 px-3 border-r border-[#1f6cb0]">Type</th>
            <th className="py-3 px-3.5 border-r border-[#1f6cb0]">Brand</th>
            <th className="py-3 px-2.5 border-r border-[#1f6cb0] text-center">VSD / FS</th>
            <th className="py-3 px-3 border-r border-[#1f6cb0] whitespace-nowrap">MaXimum Pressure</th>
            <th className="py-3 px-3 border-r border-[#1f6cb0] whitespace-nowrap">FAD (cfm)</th>
            <th className="py-3 px-3 border-r border-[#1f6cb0] min-w-[140px]">Dimension</th>
            <th className="py-3 px-3.5 border-r border-[#1f6cb0] text-right">CLP</th>
            <th className="py-3 px-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e2e8f0] text-xs text-[#000000]">
          {models.map((m) => (
            <tr key={m.prkey} className="hover:bg-slate-50/80 transition">
              <td className="py-3 px-3.5 font-mono font-bold text-[#2986cc] whitespace-nowrap">
                {m.prkey}
              </td>
              <td className="py-3 px-3.5 font-medium">{m.idesc}</td>
              <td className="py-3 px-3 whitespace-nowrap font-semibold">{m.motor}</td>
              <td className="py-3 px-3 whitespace-nowrap">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                  {m.type}
                </span>
              </td>
              <td className="py-3 px-3.5 font-semibold text-[#000000]">{m.brand}</td>
              <td className="py-3 px-2.5 text-center">
                {m.vsd_fs === 'VSD' ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                    VSD
                  </span>
                ) : m.vsd_fs === 'FS' ? (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-300">
                    FS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px] border border-slate-300">
                    N/A
                  </span>
                )}
              </td>
              <td className="py-3 px-3 font-medium">{m.maximum_pressure}</td>
              <td className="py-3 px-3 font-semibold text-right">{m.fad_cfm}</td>
              <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{m.dimension}</td>
              <td className="py-3 px-3.5 text-right font-bold text-[#000000]">
                ₹{m.clp.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-3 text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => onEdit(m)}
                    className="p-1 text-slate-500 hover:text-[#2986cc] rounded hover:bg-slate-100 transition"
                    title="Edit Model"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onClone(m.prkey)}
                    className="p-1 text-slate-500 hover:text-[#6aa84f] rounded hover:bg-slate-100 transition"
                    title="Clone as New"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(m.prkey)}
                    className="p-1 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100 transition"
                    title="Delete Model"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

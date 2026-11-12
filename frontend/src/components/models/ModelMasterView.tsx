import { useState, useEffect } from 'react';
import { Plus, Download, Search, RotateCcw } from 'lucide-react';
import type { EquipmentModel, EquipmentModelCreate, CatalogSummary } from '../../types/equipment_model';
import { api } from '../../services/api';
import { ModelTable } from './ModelTable';
import { AddModelModal } from './AddModelModal';
import { EditModelModal } from './EditModelModal';

export const ModelMasterView = () => {
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [summary, setSummary] = useState<CatalogSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState('');
  const [vsdFs, setVsdFs] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<EquipmentModel | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [modelsData, summaryData] = await Promise.all([
        api.getModels({ search, brand, type, vsd_fs: vsdFs }),
        api.getSummary(),
      ]);
      setModels(modelsData);
      setSummary(summaryData);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, brand, type, vsdFs]);

  const handleAddModel = async (newModel: EquipmentModelCreate) => {
    await api.createModel(newModel);
    showToast(`Model ${newModel.prkey} added successfully!`);
    loadData();
  };

  const handleUpdateModel = async (prkey: string, updated: Partial<EquipmentModelCreate>) => {
    await api.updateModel(prkey, updated);
    showToast(`Model ${prkey} updated successfully!`);
    loadData();
  };

  const handleClone = async (prkey: string) => {
    try {
      const cloned = await api.cloneModel(prkey);
      showToast(`Cloned ${prkey} into ${cloned.prkey}!`);
      loadData();
    } catch (err: any) {
      showToast(`Error cloning: ${err.message}`);
    }
  };

  const handleDelete = async (prkey: string) => {
    if (!window.confirm(`Are you sure you want to deactivate model ${prkey}?`)) return;
    try {
      await api.deleteModel(prkey);
      showToast(`Model ${prkey} deactivated.`);
      loadData();
    } catch (err: any) {
      showToast(`Error deleting: ${err.message}`);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setBrand('');
    setType('');
    setVsdFs('');
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-[#6aa84f]">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-xl font-bold text-[#000000]">
              Equipment Model Master & CPQ Catalog
            </h2>
            <span className="bg-[#6aa84f]/10 text-[#6aa84f] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#6aa84f]/30">
              Live FastAPI & SQLite Sync
            </span>
          </div>
          <p className="text-xs text-[#7a8794] mt-1">
            Schema as per <span className="font-semibold text-[#000000]">Models Input.jpg</span>:
            PRKEY, IDESC, Motor, Type, Brand, VSD / FS, MaXimum Pressure, FAD (cfm), Dimension, CLP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={api.getExportExcelUrl()}
            download
            className="px-3.5 py-2 bg-white text-[#2e4350] border border-[#cbd5e1] rounded-lg text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
          >
            <Download size={14} /> Export Master (.xlsx)
          </a>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-[#2986cc] text-white rounded-lg text-xs font-bold hover:bg-[#1f6cb0] transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} /> Add New Model
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold text-[#7a8794] uppercase tracking-wider">
            Total Active Models
          </div>
          <div className="text-2xl font-extrabold text-[#000000] mt-1">
            {summary ? `${summary.total_active_models} Items` : '...'}
          </div>
          <div className="text-[11px] text-[#6aa84f] font-medium mt-1">Across 5 Equipment Categories</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold text-[#7a8794] uppercase tracking-wider">
            OEM Brands
          </div>
          <div className="text-2xl font-extrabold text-[#2986cc] mt-1">
            {summary ? `${summary.brands_count} Brands` : '...'}
          </div>
          <div className="text-[11px] text-[#7a8794] mt-1">Chicago Pneumatic, Gem, ATCORP</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold text-[#7a8794] uppercase tracking-wider">
            Drive Configuration
          </div>
          <div className="text-2xl font-extrabold text-[#000000] mt-1">
            {summary ? `${summary.vsd_count} VSD` : '...'}{' '}
            <span className="text-xs text-[#7a8794] font-normal">
              / {summary ? `${summary.fs_count} FS` : '...'}
            </span>
          </div>
          <div className="text-[11px] text-[#2986cc] font-medium mt-1">Energy Efficient Inverters</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold text-[#7a8794] uppercase tracking-wider">
            CLP Price Range
          </div>
          <div className="text-2xl font-extrabold text-[#000000] mt-1">
            {summary ? `₹${(summary.min_clp / 1000).toFixed(0)}K - ₹${(summary.max_clp / 100000).toFixed(1)}L` : '...'}
          </div>
          <div className="text-[11px] text-[#6aa84f] font-medium mt-1">
            Avg CLP: {summary ? `₹${summary.avg_clp.toLocaleString('en-IN')}` : '...'}
          </div>
        </div>
      </div>

      {/* Filters and Table Container */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        {/* Filter Controls */}
        <div className="p-4 bg-slate-50/80 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PRKEY or IDESC..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#000000] focus:ring-1 focus:ring-[#2986cc] outline-hidden"
              />
            </div>

            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#000000] font-medium focus:ring-1 focus:ring-[#2986cc] outline-hidden"
            >
              <option value="">All Brands</option>
              <option value="Chicago Pneumatic">Chicago Pneumatic</option>
              <option value="Gem Equipments">Gem Equipments</option>
              <option value="ATCORP Prime">ATCORP Prime</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#000000] font-medium focus:ring-1 focus:ring-[#2986cc] outline-hidden"
            >
              <option value="">All Types</option>
              <option value="Screw Compressor">Screw Compressor</option>
              <option value="Air Dryer">Air Dryer</option>
              <option value="Process Chiller">Process Chiller</option>
              <option value="Air Receiver">Air Receiver</option>
              <option value="Cooling Tower">Cooling Tower</option>
            </select>

            <select
              value={vsdFs}
              onChange={(e) => setVsdFs(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#000000] font-medium focus:ring-1 focus:ring-[#2986cc] outline-hidden"
            >
              <option value="">All Drive Types</option>
              <option value="VSD">VSD (Variable Speed)</option>
              <option value="FS">FS (Fixed Speed)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7a8794] font-medium">
              Showing {models.length} model{models.length !== 1 ? 's' : ''}
            </span>
            {(search || brand || type || vsdFs) && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#2986cc] hover:underline font-semibold flex items-center gap-1 ml-2"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* 10-Column Data Table */}
        <ModelTable
          models={models}
          onEdit={(model) => setEditingModel(model)}
          onClone={handleClone}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      {/* Modals */}
      <AddModelModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleAddModel}
      />

      <EditModelModal
        model={editingModel}
        isOpen={!!editingModel}
        onClose={() => setEditingModel(null)}
        onSuccess={handleUpdateModel}
      />
    </div>
  );
};

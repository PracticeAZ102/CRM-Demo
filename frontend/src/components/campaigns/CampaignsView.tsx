import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Campaign, CampaignCreate } from '../../types/activity';
import {
  Compass,
  Plus,
  RefreshCw,
  MapPin,
  Calendar,
  Users,
  X,
  Sparkles
} from 'lucide-react';

interface CampaignsViewProps {
  onNavigateToIntake?: () => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onNavigateToIntake }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CampaignCreate>({
    name: '',
    city: 'New Delhi',
    venue: 'Pragati Maidan',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    budget: 250000,
    target_leads: 50,
    status: 'ACTIVE',
  });

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createCampaign(form);
      setShowModal(false);
      // Reset form
      setForm({
        name: '',
        city: 'New Delhi',
        venue: 'Pragati Maidan',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        budget: 250000,
        target_leads: 50,
        status: 'ACTIVE',
      });
      await loadCampaigns();
    } catch (err: any) {
      alert(err.message || 'Error creating campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + c.leads_generated, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Compass className="text-[#2986cc]" size={20} />
            Industrial Expos & Marketing Campaigns
          </h2>
          <p className="text-xs text-slate-500">
            Track exhibition budgets, lead ingestion, and visitor conversion rates across Indian trade fairs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCampaigns}
            className="p-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2986cc] hover:bg-[#1f6cb0] text-white text-xs font-bold rounded-lg shadow-xs transition"
          >
            <Plus size={14} />
            <span>Add Campaign</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Campaigns</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{campaigns.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Expos and trade initiatives</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Expo Budget</div>
          <div className="text-2xl font-black text-slate-900 mt-1">₹{totalBudget.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500 mt-1">Allocated across North & West hubs</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Leads Acquired</div>
          <div className="text-2xl font-black text-[#6aa84f] mt-1">{totalLeads} Leads</div>
          <div className="text-[11px] text-slate-500 mt-1">Directly ingested into CRM database</div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Campaign Grid Cards */}
      {loading && campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500">
          <RefreshCw size={28} className="animate-spin mb-3 text-[#2986cc]" />
          <p className="text-xs font-medium">Fetching campaigns from local database...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Compass size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-700">No marketing campaigns registered yet</p>
          <p className="text-xs text-slate-500 mt-1">Click "Add Campaign" to set up your first industrial trade show.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => {
            const pct = camp.target_leads > 0 ? Math.round((camp.leads_generated / camp.target_leads) * 100) : 0;
            return (
              <div
                key={camp.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-[#2986cc] transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          camp.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : camp.status === 'UPCOMING'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {camp.status}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2">{camp.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Budget</div>
                      <div className="text-sm font-black text-slate-900">
                        ₹{camp.budget.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#2986cc]" />
                      <span>
                        {camp.venue}, <strong>{camp.city}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-400" />
                      <span>
                        {camp.start_date} to {camp.end_date}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users size={12} /> Leads Acquired
                      </span>
                      <span className="font-bold text-slate-900">
                        {camp.leads_generated} / {camp.target_leads} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2986cc] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {onNavigateToIntake && (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={onNavigateToIntake}
                      className="text-xs font-bold text-[#2986cc] hover:underline flex items-center gap-1"
                    >
                      <Sparkles size={12} />
                      Scan Visiting Card for this Expo →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-[#2986cc]" />
                Register New Expo Campaign
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Campaign / Expo Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IMTEX 2026 Machine Tool Expo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Host City *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Budget (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Leads</label>
                  <input
                    type="number"
                    min="1"
                    value={form.target_leads}
                    onChange={(e) => setForm({ ...form, target_leads: parseInt(e.target.value) || 50 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#2986cc] hover:bg-[#1f6cb0] text-white font-bold rounded-lg shadow-xs transition disabled:opacity-50"
                >
                  {submitting ? 'Saving to Database...' : 'Save Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

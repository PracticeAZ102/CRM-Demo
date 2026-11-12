import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Appointment, AppointmentCreate } from '../../types/activity';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED'>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AppointmentCreate>({
    company_name: '',
    contact_person: '',
    phone: '',
    city: 'Faridabad',
    visit_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    visit_time: '11:00 AM',
    purpose: 'Air Audit & Compressor Sizing Verification',
    notes: '',
  });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createAppointment(form);
      setShowModal(false);
      setForm({
        company_name: '',
        contact_person: '',
        phone: '',
        city: 'Faridabad',
        visit_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        visit_time: '11:00 AM',
        purpose: 'Air Audit & Compressor Sizing Verification',
        notes: '',
      });
      await loadAppointments();
    } catch (err: any) {
      alert(err.message || 'Error booking appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const scheduledCount = appointments.filter((a) => a.status === 'SCHEDULED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="text-[#2986cc]" size={20} />
            Field Engineering & Plant Appointments
          </h2>
          <p className="text-xs text-slate-500">
            Log technical customer plant visits, compressed air audits, and proposal presentation schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAppointments}
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
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Scheduled Visits</div>
          <div className="text-2xl font-black text-[#2986cc] mt-1">{scheduledCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Confirmed customer plant audits</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Completed Audits</div>
          <div className="text-2xl font-black text-[#6aa84f] mt-1">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Audit reports logged & closed</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Key Regional Hubs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">4 Clusters</div>
          <div className="text-[11px] text-slate-500 mt-1">Manesar, Faridabad, Noida, Haridwar</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            statusFilter === 'ALL'
              ? 'bg-[#2986cc] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setStatusFilter('SCHEDULED')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            statusFilter === 'SCHEDULED'
              ? 'bg-[#2986cc] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Scheduled ({scheduledCount})
        </button>
        <button
          onClick={() => setStatusFilter('COMPLETED')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            statusFilter === 'COMPLETED'
              ? 'bg-[#2986cc] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Appointments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4">Visit Date & Time</th>
                <th className="py-2.5 px-4">Customer & Contact</th>
                <th className="py-2.5 px-4">Plant Location</th>
                <th className="py-2.5 px-4">Purpose & Agenda</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#2986cc]" />
                    Loading appointments from local database...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No appointments match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#2986cc]" />
                        {appt.visit_date}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {appt.visit_time}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{appt.company_name}</div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <User size={11} /> {appt.contact_person}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone size={11} /> {appt.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <MapPin size={12} className="text-red-500" />
                        {appt.city}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{appt.purpose}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          appt.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : appt.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {appt.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-[#2986cc]" />
                Schedule Customer Plant Visit
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
                <label className="block text-slate-700 font-bold mb-1">Company / Plant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Automotive Systems"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={form.contact_person}
                    onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Plant Location / City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Visit Time</label>
                  <input
                    type="text"
                    value={form.visit_time}
                    onChange={(e) => setForm({ ...form, visit_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Visit Date *</label>
                <input
                  type="date"
                  required
                  value={form.visit_date}
                  onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Visit Purpose / Agenda</label>
                <input
                  type="text"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes / Equipment Focus</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Customer interested in 22 kW VSD screw compressor and refrigerated air dryer."
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2986cc]"
                />
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
                  {submitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

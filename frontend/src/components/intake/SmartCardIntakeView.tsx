import { useState } from 'react';
import {
  Upload,
  Sparkles,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import type { CardScanResult, EnquiryCreate } from '../../types/enquiry';
import { api } from '../../services/api';

interface SmartCardIntakeViewProps {
  onEnquiryCreated?: (enquiryId: string) => void;
}

export const SmartCardIntakeView = ({ onEnquiryCreated }: SmartCardIntakeViewProps) => {
  const [loading, setLoading] = useState(false);
  const [activeSample, setActiveSample] = useState<string>('shivam');
  const [scanResult, setScanResult] = useState<CardScanResult>({
    confidence_score: 98.5,
    tier_used: 'Tier-1 Heuristic Layout Engine (Sample Matched)',
    company_name: 'Shivam Precision Tools Pvt Ltd',
    contact_person: 'Anurag Kashyap',
    designation: 'Director - Works & Production',
    email: 'anurag@shivamtools.co.in',
    phone: '+91 98711 02938',
    plant_location: 'Plot 18, Sector 24, Faridabad Industrial Area, Haryana 121005',
    gstin: '06AALCS8921K1Z8',
    industry_sector: 'Automotive & Precision Tooling',
  });

  const [formData, setFormData] = useState<EnquiryCreate>({
    company_name: 'Shivam Precision Tools Pvt Ltd',
    contact_person: 'Anurag Kashyap',
    designation: 'Director - Works & Production',
    email: 'anurag@shivamtools.co.in',
    phone: '+91 98711 02938',
    plant_location: 'Plot 18, Sector 24, Faridabad Industrial Area, Haryana 121005',
    gstin: '06AALCS8921K1Z8',
    industry_sector: 'Automotive & Precision Tooling',
    branch_region: 'Noida HQ',
    assigned_engineer: 'Rajesh Sharma',
  });

  const [createdId, setCreatedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSampleClick = async (sampleKey: string) => {
    setActiveSample(sampleKey);
    setLoading(true);
    try {
      const res = await api.scanCard(undefined, sampleKey);
      setScanResult(res);
      setFormData({
        company_name: res.company_name,
        contact_person: res.contact_person,
        designation: res.designation,
        email: res.email,
        phone: res.phone,
        plant_location: res.plant_location,
        gstin: res.gstin,
        industry_sector: res.industry_sector,
        branch_region: 'Noida HQ',
        assigned_engineer: 'Rajesh Sharma',
      });
      showToast(`Scanned sample card: ${res.company_name}`);
    } catch (err: any) {
      showToast(`Scan error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const res = await api.scanCard(file);
      setScanResult(res);
      setFormData({
        company_name: res.company_name,
        contact_person: res.contact_person,
        designation: res.designation,
        email: res.email,
        phone: res.phone,
        plant_location: res.plant_location,
        gstin: res.gstin,
        industry_sector: res.industry_sector,
        branch_region: 'Noida HQ',
        assigned_engineer: 'Rajesh Sharma',
      });
      showToast(`Visiting Card scanned successfully! Confidence: ${res.confidence_score}%`);
    } catch (err: any) {
      showToast(`Upload error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const enq = await api.createEnquiry(formData);
      setCreatedId(enq.id);
      showToast(`Enquiry #${enq.id} registered for ${enq.company_name}!`);
      if (onEnquiryCreated) onEnquiryCreated(enq.id);
    } catch (err: any) {
      showToast(`Registration error: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
            <span className="text-2xl">📸</span>
            <h2 className="text-xl font-bold text-[#000000]">
              Smart Intake & AI Visiting Card Scanner
            </h2>
            <span className="bg-[#2986cc]/10 text-[#2986cc] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#2986cc]/20">
              Hybrid OCR + Vision LLM
            </span>
          </div>
          <p className="text-xs text-[#7a8794] mt-1">
            Instantly ingest physical trade expo cards into structured CRM enquiries in &lt; 2 seconds.
          </p>
        </div>

        {/* 1-Click Sample Card Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-[#7a8794]">Try Sample:</span>
          <button
            onClick={() => handleSampleClick('shivam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeSample === 'shivam'
                ? 'bg-[#2986cc] text-white border-[#2986cc]'
                : 'bg-white text-[#2e4350] border-[#cbd5e1] hover:bg-slate-50'
            }`}
          >
            Shivam Tools (Auto)
          </button>
          <button
            onClick={() => handleSampleClick('krishna')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeSample === 'krishna'
                ? 'bg-[#2986cc] text-white border-[#2986cc]'
                : 'bg-white text-[#2e4350] border-[#cbd5e1] hover:bg-slate-50'
            }`}
          >
            Krishna Polymers
          </button>
          <button
            onClick={() => handleSampleClick('apex')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeSample === 'apex'
                ? 'bg-[#2986cc] text-white border-[#2986cc]'
                : 'bg-white text-[#2e4350] border-[#cbd5e1] hover:bg-slate-50'
            }`}
          >
            Apex Bio-Labs (Pharma)
          </button>
        </div>
      </div>

      {/* Grid: Card Preview & Dropzone on Left, Auto-Extracted Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Dropzone & Visual Visiting Card Simulation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upload Dropzone */}
          <div className="bg-white p-5 rounded-xl border-2 border-dashed border-[#cbd5e1] hover:border-[#2986cc] transition text-center cursor-pointer relative shadow-xs">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2986cc] flex items-center justify-center mx-auto mb-2">
              <Upload size={20} />
            </div>
            <div className="font-bold text-xs text-[#000000]">
              Click or Drag & Drop Visiting Card Photo
            </div>
            <p className="text-[10px] text-[#7a8794] mt-0.5">
              Supports JPEG, PNG, or mobile camera capture
            </p>
          </div>

          {/* Simulated Physical Visiting Card Rendering */}
          <div className="bg-gradient-to-br from-slate-900 to-[#142229] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-slate-800">
            {/* Watermark / Logo background */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none"></div>

            <div className="flex justify-between items-start">
              <div>
                <div className="text-base font-extrabold tracking-wide text-white">
                  {scanResult.company_name}
                </div>
                <div className="text-[11px] text-blue-300 font-semibold mt-0.5">
                  {scanResult.industry_sector}
                </div>
              </div>
              <span className="text-[9px] bg-white/10 text-emerald-300 font-mono px-2 py-0.5 rounded border border-white/20">
                {scanResult.tier_used.includes('Sample') ? 'Verified Card' : 'OCR Scanned'}
              </span>
            </div>

            <div className="my-5 border-t border-white/10"></div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="font-bold text-white text-sm">{scanResult.contact_person}</div>
              <div className="text-[11px] text-[#2986cc] font-medium">{scanResult.designation}</div>
              <div className="pt-2 text-[11px] space-y-1">
                <div>📞 {scanResult.phone}</div>
                <div>✉️ {scanResult.email}</div>
                <div>📍 {scanResult.plant_location}</div>
                {scanResult.gstin && (
                  <div className="text-[10px] font-mono text-slate-400">
                    GSTIN: {scanResult.gstin}
                  </div>
                )}
              </div>
            </div>

            {/* Confidence Rating Pill */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles size={12} className="text-[#6aa84f]" /> OCR Confidence:
              </span>
              <span className="font-bold text-[#6aa84f]">{scanResult.confidence_score}%</span>
            </div>
          </div>
        </div>

        {/* Right Column: Auto-Extracted CRM Lead Registration Form (7 cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleRegisterEnquiry}
            className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-xs space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <h3 className="font-bold text-sm text-[#000000] flex items-center gap-2">
                <CheckCircle size={16} className="text-[#6aa84f]" /> Structured CRM Lead Parameters
              </h3>
              <span className="text-[11px] text-[#7a8794]">Auto-populated from Vision Engine</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company */}
              <div className="md:col-span-2">
                <label className="block font-bold text-[#000000] mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-[#cbd5e1] rounded-lg font-semibold focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                  />
                </div>
              </div>

              {/* Designation */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">
                  Mobile / WhatsApp Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-[#cbd5e1] rounded-lg font-mono focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                  />
                </div>
              </div>

              {/* Plant Location */}
              <div className="md:col-span-2">
                <label className="block font-bold text-[#000000] mb-1">
                  Plant / Facility Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.plant_location}
                    onChange={(e) => setFormData({ ...formData, plant_location: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                  />
                </div>
              </div>

              {/* GSTIN */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={formData.gstin || ''}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="e.g. 06AABCS1429B1Z2"
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg font-mono uppercase focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                />
              </div>

              {/* Industry Sector */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">Industry Sector</label>
                <select
                  value={formData.industry_sector}
                  onChange={(e) => setFormData({ ...formData, industry_sector: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                >
                  <option value="Automotive & Precision Tooling">Automotive & Precision Tooling</option>
                  <option value="Plastic Injection Moulding & Blow Film">Plastic Injection Moulding</option>
                  <option value="Pharmaceuticals & Cleanrooms">Pharmaceuticals & Cleanrooms</option>
                  <option value="Food & Beverage / Cold Storage">Food & Beverage</option>
                  <option value="General Engineering">General Engineering</option>
                </select>
              </div>

              {/* Territory Branch */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">Assigned Branch</label>
                <select
                  value={formData.branch_region}
                  onChange={(e) => setFormData({ ...formData, branch_region: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden font-medium"
                >
                  <option value="Noida HQ">Noida HQ (North Zone)</option>
                  <option value="Haridwar Branch">Haridwar Branch (Uttarakhand)</option>
                  <option value="Rudrapur Branch">Rudrapur Branch (Kumaon)</option>
                  <option value="Lucknow Branch">Lucknow Branch (Central UP)</option>
                </select>
              </div>

              {/* Sales Rep */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">Assigned Sales Engineer</label>
                <input
                  type="text"
                  value={formData.assigned_engineer}
                  onChange={(e) => setFormData({ ...formData, assigned_engineer: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
              {createdId ? (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-2 font-bold text-xs">
                  <CheckCircle size={15} /> Registered as Enquiry #{createdId}!
                </div>
              ) : (
                <span className="text-[11px] text-[#7a8794]">
                  Saves lead and assigns to {formData.branch_region} pipeline.
                </span>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#2986cc] hover:bg-[#1f6cb0] text-white font-bold rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                <span>Save & Register Enquiry</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


import type { EquipmentModel, EquipmentModelCreate, CatalogSummary } from '../types/equipment_model';
import type { Quotation, QuotationCalculateRequest, QuotationCalculateResponse } from '../types/quotation';
import type { Enquiry, EnquiryCreate, CardScanResult } from '../types/enquiry';
import type { OFMRecord, OFMUpdate, OFMFreezeRequest, OFMSummary } from '../types/ofm';
import type { Campaign, CampaignCreate, Appointment, AppointmentCreate, SalesTarget, DashboardStats } from '../types/activity';

const API_BASE = '/api/v1';

export const api = {
  // Equipment Models
  async getModels(params?: { search?: string; brand?: string; type?: string; vsd_fs?: string }): Promise<EquipmentModel[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.brand) query.append('brand', params.brand);
    if (params?.type) query.append('type', params.type);
    if (params?.vsd_fs) query.append('vsd_fs', params.vsd_fs);

    const res = await fetch(`${API_BASE}/models?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch equipment models');
    return res.json();
  },

  async getSummary(): Promise<CatalogSummary> {
    const res = await fetch(`${API_BASE}/models/summary`);
    if (!res.ok) throw new Error('Failed to fetch catalog summary');
    return res.json();
  },

  async createModel(data: EquipmentModelCreate): Promise<EquipmentModel> {
    const res = await fetch(`${API_BASE}/models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create model');
    }
    return res.json();
  },

  async updateModel(prkey: string, data: Partial<EquipmentModelCreate>): Promise<EquipmentModel> {
    const res = await fetch(`${API_BASE}/models/${encodeURIComponent(prkey)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update model');
    }
    return res.json();
  },

  async deleteModel(prkey: string): Promise<void> {
    const res = await fetch(`${API_BASE}/models/${encodeURIComponent(prkey)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete model');
  },

  async cloneModel(prkey: string): Promise<EquipmentModel> {
    const res = await fetch(`${API_BASE}/models/${encodeURIComponent(prkey)}/clone`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to clone model');
    return res.json();
  },

  getExportExcelUrl(): string {
    return `${API_BASE}/models/export/excel`;
  },

  // CPQ Quotations
  async getQuotations(enquiryId?: string): Promise<Quotation[]> {
    const url = enquiryId ? `${API_BASE}/quotations?enquiry_id=${encodeURIComponent(enquiryId)}` : `${API_BASE}/quotations`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch quotations');
    return res.json();
  },

  async getQuotation(quoteId: string): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations/${encodeURIComponent(quoteId)}`);
    if (!res.ok) throw new Error(`Failed to fetch quotation ${quoteId}`);
    return res.json();
  },

  async calculateQuote(req: QuotationCalculateRequest): Promise<QuotationCalculateResponse> {
    const res = await fetch(`${API_BASE}/quotations/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error('Failed to calculate quotation totals');
    return res.json();
  },

  async updateQuotation(quoteId: string, data: Partial<Quotation>): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations/${encodeURIComponent(quoteId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update quotation');
    return res.json();
  },

  async reviseQuotation(quoteId: string): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations/${encodeURIComponent(quoteId)}/revise`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to create new proposal revision');
    return res.json();
  },

  getQuotePdfUrl(quoteId: string): string {
    return `${API_BASE}/quotations/${encodeURIComponent(quoteId)}/pdf`;
  },

  // Enquiries & Smart Card Intake
  async scanCard(file?: File, sampleKey?: string): Promise<CardScanResult> {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (sampleKey) formData.append('sample_key', sampleKey);

    const res = await fetch(`${API_BASE}/enquiries/scan-card`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to scan visiting card');
    return res.json();
  },

  async getEnquiries(params?: { search?: string; status?: string; branch?: string }): Promise<Enquiry[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.branch) query.append('branch', params.branch);

    const res = await fetch(`${API_BASE}/enquiries?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch enquiries');
    return res.json();
  },

  async createEnquiry(data: EnquiryCreate): Promise<Enquiry> {
    const res = await fetch(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to register enquiry');
    return res.json();
  },

  // Order Finalization Memorandum (OFM)
  async getOfmSummary(): Promise<OFMSummary> {
    const res = await fetch(`${API_BASE}/ofm/summary`);
    if (!res.ok) throw new Error('Failed to fetch OFM summary');
    return res.json();
  },

  async getOfmList(params?: { search?: string; status?: string }): Promise<OFMRecord[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/ofm?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch OFM records');
    return res.json();
  },

  async updateOfm(ofmId: string, data: OFMUpdate): Promise<OFMRecord> {
    const res = await fetch(`${API_BASE}/ofm/${encodeURIComponent(ofmId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update OFM record');
    }
    return res.json();
  },

  async reviseOfm(ofmId: string): Promise<OFMRecord> {
    const res = await fetch(`${API_BASE}/ofm/${encodeURIComponent(ofmId)}/revise`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to spawn new OFM revision');
    return res.json();
  },

  async freezeOfm(ofmId: string, data: OFMFreezeRequest): Promise<OFMRecord> {
    const res = await fetch(`${API_BASE}/ofm/${encodeURIComponent(ofmId)}/freeze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to freeze OFM for factory release');
    }
    return res.json();
  },

  getFactorySheetPdfUrl(ofmId: string): string {
    return `${API_BASE}/ofm/${encodeURIComponent(ofmId)}/factory-sheet-pdf`;
  },

  // Dashboard & Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    const res = await fetch(`${API_BASE}/campaigns`);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  },

  async createCampaign(data: CampaignCreate): Promise<Campaign> {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create campaign');
    return res.json();
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const res = await fetch(`${API_BASE}/appointments`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  async createAppointment(data: AppointmentCreate): Promise<Appointment> {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to book appointment');
    return res.json();
  },

  // Sales Targets
  async getTargets(): Promise<SalesTarget[]> {
    const res = await fetch(`${API_BASE}/targets`);
    if (!res.ok) throw new Error('Failed to fetch sales targets');
    return res.json();
  }
};

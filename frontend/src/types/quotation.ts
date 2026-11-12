import type { EquipmentModel } from './equipment_model';

export interface Quotation {
  id: string;
  quote_number: string;
  enquiry_id: string;
  revision_no: number;
  prkey: string;
  quantity: number;
  base_clp: number;
  discount_pct: number;
  discount_amount: number;
  discount_approval_status: 'APPROVED' | 'PENDING_APPROVAL';
  packaging_pct: number;
  packaging_amount: number;
  freight_terms: 'Ex-Works' | 'FOR Destination';
  freight_amount: number;
  installation_charges: number;
  taxable_value: number;
  gst_type: 'IGST' | 'CGST_SGST';
  gst_rate: number;
  gst_amount: number;
  total_value: number;
  payment_terms: string;
  delivery_weeks: string;
  warranty_months: number;
  validity_days: number;
  ga_drawing_id: string;
  notes?: string;
  created_at?: string;
  equipment_model?: EquipmentModel;
}

export interface QuotationCalculateRequest {
  prkey: string;
  quantity: number;
  discount_pct: number;
  packaging_pct: number;
  freight_terms: string;
  freight_amount: number;
  installation_charges: number;
  gst_type: string;
}

export interface QuotationCalculateResponse {
  base_clp: number;
  unit_discount_amount: number;
  net_unit_price: number;
  total_base: number;
  total_discount: number;
  discount_approval_status: 'APPROVED' | 'PENDING_APPROVAL';
  packaging_amount: number;
  freight_amount: number;
  installation_charges: number;
  taxable_value: number;
  gst_rate: number;
  gst_amount: number;
  total_value: number;
  win_probability_pct: number;
}


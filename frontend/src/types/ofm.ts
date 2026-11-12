import type { Enquiry } from './enquiry';
import type { Quotation } from './quotation';

export interface OFMRecord {
  id: string;
  ofm_number: string;
  enquiry_id: string;
  quotation_id: string;
  revision_no: number;
  customer_po_number?: string;
  customer_po_date?: string;
  customer_po_value?: number;
  po_value_verified: boolean;
  tech_specs_verified: boolean;
  payment_terms_verified: boolean;
  ga_drawing_cleared: boolean;
  committed_dispatch_date?: string;
  paint_shade: string;
  electrical_supply: string;
  air_discharge_nozzle: string;
  special_factory_instructions?: string;
  status: 'PENDING_DEALER_REVIEW' | 'AWAITING_PO_SCRUTINY' | 'FROZEN_FACTORY_RELEASE';
  is_frozen: boolean;
  frozen_at?: string;
  frozen_by?: string;
  created_at?: string;
  enquiry?: Enquiry;
  quotation?: Quotation;
}

export interface OFMUpdate {
  customer_po_number?: string;
  customer_po_date?: string;
  customer_po_value?: number;
  committed_dispatch_date?: string;
  paint_shade?: string;
  electrical_supply?: string;
  air_discharge_nozzle?: string;
  special_factory_instructions?: string;
}

export interface OFMFreezeRequest {
  customer_po_number: string;
  customer_po_date: string;
  customer_po_value: number;
  po_value_verified: boolean;
  tech_specs_verified: boolean;
  payment_terms_verified: boolean;
  ga_drawing_cleared: boolean;
  committed_dispatch_date: string;
  approved_by?: string;
}

export interface OFMSummary {
  total_ofm_records: number;
  pending_dealer_review: number;
  awaiting_po_scrutiny: number;
  frozen_factory_released: number;
}


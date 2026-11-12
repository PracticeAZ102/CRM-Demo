export interface Enquiry {
  id: string;
  company_name: string;
  contact_person: string;
  designation: string;
  email: string;
  phone: string;
  plant_location: string;
  gstin?: string;
  industry_sector: string;
  branch_region: string;
  assigned_engineer: string;
  status: string;
  created_at?: string;
}

export interface EnquiryCreate {
  id?: string;
  company_name: string;
  contact_person: string;
  designation?: string;
  email: string;
  phone: string;
  plant_location: string;
  gstin?: string;
  industry_sector?: string;
  branch_region?: string;
  assigned_engineer?: string;
  status?: string;
}

export interface CardScanResult {
  confidence_score: number;
  tier_used: string;
  company_name: string;
  contact_person: string;
  designation: string;
  email: string;
  phone: string;
  plant_location: string;
  gstin?: string;
  industry_sector: string;
  raw_ocr_text?: string;
}


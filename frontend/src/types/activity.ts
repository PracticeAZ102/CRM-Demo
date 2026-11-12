export interface Campaign {
  id: number;
  name: string;
  city: string;
  venue: string;
  start_date: string;
  end_date: string;
  budget: number;
  target_leads: number;
  leads_generated: number;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  created_at?: string;
}

export interface CampaignCreate {
  name: string;
  city: string;
  venue: string;
  start_date: string;
  end_date: string;
  budget: number;
  target_leads: number;
  status?: string;
}

export interface Appointment {
  id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  city: string;
  visit_date: string;
  visit_time: string;
  purpose: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  created_at?: string;
}

export interface AppointmentCreate {
  company_name: string;
  contact_person: string;
  phone: string;
  city?: string;
  visit_date: string;
  visit_time?: string;
  purpose?: string;
  notes?: string;
}

export interface SalesTarget {
  id: number;
  financial_year: string;
  month: string;
  target_units: number;
  achieved_units: number;
  target_revenue: number;
  achieved_revenue: number;
}

export interface DashboardStats {
  total_enquiries: number;
  active_quotes: number;
  pending_ofm_count: number;
  released_ofm_count: number;
  total_models: number;
  upcoming_appointments: number;
  active_campaigns: number;
  mtd_target_units: number;
  mtd_achieved_units: number;
}

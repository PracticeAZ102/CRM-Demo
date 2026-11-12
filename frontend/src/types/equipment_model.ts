export interface EquipmentModel {
  prkey: string;               // Primary Product Key SKU
  idesc: string;               // Item Description
  motor: string;               // Motor rating in kW / HP
  type: string;                // Category e.g. Screw Compressor, Chiller, Dryer
  brand: string;               // Brand e.g. Chicago Pneumatic, Gem, ATCORP
  vsd_fs: string;              // Drive: VSD | FS | N/A
  maximum_pressure: string;     // Working pressure e.g. 8.0 bar
  fad_cfm: string;             // Free Air Delivery flow e.g. 78.4 cfm
  dimension: string;           // Physical footprint L x W x H mm
  clp: number;                 // Company List Price in ₹ INR
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EquipmentModelCreate {
  prkey: string;
  idesc: string;
  motor: string;
  type: string;
  brand: string;
  vsd_fs: string;
  maximum_pressure: string;
  fad_cfm: string;
  dimension: string;
  clp: number;
}

export interface CatalogSummary {
  total_active_models: number;
  brands_count: number;
  vsd_count: number;
  fs_count: number;
  min_clp: number;
  max_clp: number;
  avg_clp: number;
}


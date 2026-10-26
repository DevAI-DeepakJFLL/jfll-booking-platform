import type { DimensionUnit } from '../lib/freight-domain';

export type CargoType =
  | 'General cargo'
  | 'Express courier'
  | 'Pharma healthcare'
  | 'Dangerous goods'
  | 'Perishables'
  | '';

export type QuoteForm = {
  origin: string;
  destination: string;
  readyDate: string;
  pieces: string;
  weight: string;
  volume: string;
  cargoType: CargoType;
  dimensionMode?: 'dimensions' | 'cbm';
  dimensionUnit?: DimensionUnit;
  length?: string;
  width?: string;
  height?: string;
  hasWorkedWithJfll?: boolean;
  jfllIdentifier?: string;
  hasWorkedWithJfl?: boolean;
  jflIdentifier?: string;
  jflMemberId?: string;
  jflCompanyName?: string;
};

export type PieceLine = {
  id: string;
  pieces: number;
  length: number;
  width: number;
  height: number;
  weightPerPiece: number;
  unit?: DimensionUnit;
};

export type Incoterm = 'CIF' | 'CIP' | 'CPT' | 'DAP' | 'FOB' | 'EXW' | '';
export type PackagingType =
  | 'Corrugated Cartons'
  | 'Wooden Crates (ISPM-15)'
  | 'Drums / Barrels'
  | 'Palletized Unit'
  | '';
export type TempCondition =
  | 'None'
  | 'Cold Chain (+2° to +8°C)'
  | 'Controlled Room Temp (+15° to +25°C)'
  | '';

export type BookingForm = {
  shipperName: string;
  shipperEmail: string;
  shipperPhone: string;
  shipperCompany: string;
  shipperAddress: string;
  shipperGstin: string;
  shipperIec: string;
  adCode?: string;
  consigneeName: string;
  consigneeEmail: string;
  consigneePhone: string;
  consigneeCompany: string;
  consigneeAddress: string;
  consigneeTaxId?: string;
  cargoDescription: string;
  hsCode: string;
  packagingType: PackagingType;
  incoterm: Incoterm;
  tempCondition?: TempCondition;
  dgUnNumber?: string;
  doorPickup: boolean;
  hasWorkedWithJfll?: boolean;
  jfllIdentifier?: string;
  hasWorkedWithJfl?: boolean;
  jflIdentifier?: string;
  jflMemberId?: string;
  jflCompanyName?: string;
};

export type RateBreakdown = {
  baseFreight: number;
  fuelSecurity: number;
  originTHC: number;
  gstTax: number;
  total: number;
};

export type Rate = {
  id: string;
  carrier: string;
  carrierCode?: string;
  code: string;
  service: string;
  cargoCategory?: string;
  departure: string;
  arrival: string;
  transit: string;
  total: number;
  contractTotal?: number;
  base: number;
  fuelSecurity: number;
  originTHC: number;
  tax: number;
  included: string[];
  accent: string;
  recommended?: boolean;
  direct?: boolean;
  cutoff: string;
  chargeableWeight?: number;
  ratePerKg?: number;
};

export type Milestone = {
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
};

export type ShipmentRecord = {
  reference: string;
  awbNumber: string;
  carrier: string;
  flight: string;
  origin: string;
  destination: string;
  chargeableWeight: number;
  commodity: string;
  status: string;
  statusStep: number;
  readyDate: string;
  cutoff: string;
  totalAmount: number;
  pickupRequired: boolean;
  milestones: Milestone[];
};

export type DocumentPreview = {
  title: string;
  type: string;
  reference: string;
};

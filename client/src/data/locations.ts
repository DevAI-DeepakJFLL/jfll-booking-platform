/**
 * Airport and Cargo Category Reference Data
 */

export interface LocationItem {
  code: string;
  city: string;
  airport: string;
}

export const destLocations: LocationItem[] = [
  { code: 'DXB', city: 'Dubai', airport: 'Dubai International Airport' },
  { code: 'SHA', city: 'Shanghai', airport: 'Shanghai Pudong International Airport' },
];

export const locations: LocationItem[] = [
  { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj Intl' },
  { code: 'DXB', city: 'Dubai', airport: 'Dubai International' },
  { code: 'SHA', city: 'Shanghai', airport: 'Pudong International' },
  { code: 'DEL', city: 'Delhi', airport: 'Indira Gandhi International' },
  { code: 'BLR', city: 'Bangalore', airport: 'Kempegowda International' },
  { code: 'AMD', city: 'Ahmedabad', airport: 'Sardar Vallabhbhai Patel Intl' },
  { code: 'MAA', city: 'Chennai', airport: 'Chennai International' },
  { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
  { code: 'JFK', city: 'New York', airport: 'John F. Kennedy Intl' },
  { code: 'FRA', city: 'Frankfurt', airport: 'Frankfurt Airport' },
  { code: 'SIN', city: 'Singapore', airport: 'Changi Airport' },
  { code: 'LOS', city: 'Lagos', airport: 'Murtala Muhammed Intl' },
];

export const cargoCategoryOptions = [
  { value: 'General cargo', label: 'General Cargo (Standard Freight / Consolidated)' },
  { value: 'Express courier', label: 'Express Courier (Priority Uplift / High Speed)' },
  { value: 'Pharma healthcare', label: 'Pharma Healthcare (Temperature Controlled / Cool Chain)' },
  { value: 'Dangerous goods', label: 'Dangerous Goods (DGR / Hazmat / Lithium Batteries)' },
  { value: 'Perishables', label: 'Perishables (Cold Storage / Fresh Food / Flowers)' },
];

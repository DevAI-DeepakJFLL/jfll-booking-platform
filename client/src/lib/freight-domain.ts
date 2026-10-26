/**
 * Freight Domain Models, Master Airline Registry & Dynamic Route Schedules
 * Single Source of Truth for Jet Freight Client Application.
 */

export const AIRLINE_PROPER_NAMES: Record<string, string> = {
  'AEROFLOT RUSSIAN AIRLINES': 'Aeroflot Russian Airlines',
  'AIR ASIA X': 'AirAsia X',
  'AIR INDIA': 'Air India',
  'ALL NIPPON AIRWAYS': 'All Nippon Airways (ANA)',
  'CATHAY CARGO': 'Cathay Cargo',
  'CEBU PACIFIC': 'Cebu Pacific',
  'CHINA AIRLINES CARGO': 'China Airlines Cargo',
  'EGYPT AIR': 'EgyptAir',
  'EMIRATES SKYCARGO': 'Emirates SkyCargo',
  'ETHIOPIAN AIRLINES': 'Ethiopian Airlines',
  'ETIHAD AIRWAYS': 'Etihad Airways',
  'FLYDUBAI': 'flydubai',
  'GARUDA INDONESIA': 'Garuda Indonesia',
  'GULF AIR CARGO': 'Gulf Air Cargo',
  'INDIGO AIRLINES': 'IndiGo Airlines',
  'KUWAIT AIRWAYS': 'Kuwait Airways',
  'MALAYSIA  AIRLINES': 'Malaysia Airlines',
  'MALAYSIA AIRLINES': 'Malaysia Airlines',
  'NEOS': 'Neos Air',
  'OMAN AIR CARGO': 'Oman Air Cargo',
  'QATAR AIRWAYS': 'Qatar Airways',
  'SAUDI ARABIAN AIRLINES': 'Saudia Airlines',
  'SICHUAN AIRLINES': 'Sichuan Airlines',
  'SILK WAY WEST AIRLINES': 'Silk Way West Airlines',
  'SINGAPORE AIRLINES': 'Singapore Airlines',
  'SPICE JET': 'SpiceJet',
  'SRILANKAN AIRLINES': 'SriLankan Airlines',
  'THAI AIRWAYS INTERNATIONAL': 'Thai Airways',
  'THAI LION AIR': 'Thai Lion Air',
  'THAI VIETJET': 'Thai VietJet Air',
  'TURKISH AIRLINES': 'Turkish Airlines Cargo',
  'UNI TOP AIRLINES': 'Uni-Top Airlines',
  'VIETJET AIRLINES': 'VietJet Air',
  'VIETNAM AIRLINES': 'Vietnam Airlines',
};

export const CARRIER_CODE_MAP: Record<string, string> = {
  'AEROFLOT RUSSIAN AIRLINES': 'SU',
  'AIR ASIA X': 'D7',
  'AIR INDIA': 'AI',
  'ALL NIPPON AIRWAYS': 'NH',
  'CATHAY CARGO': 'CX',
  'CEBU PACIFIC': '5J',
  'CHINA AIRLINES CARGO': 'CI',
  'EGYPT AIR': 'MS',
  'EMIRATES SKYCARGO': 'EK',
  'ETHIOPIAN AIRLINES': 'ET',
  'ETIHAD AIRWAYS': 'EY',
  'FLYDUBAI': 'FZ',
  'GARUDA INDONESIA': 'GA',
  'GULF AIR CARGO': 'GF',
  'INDIGO AIRLINES': '6E',
  'KUWAIT AIRWAYS': 'KU',
  'MALAYSIA  AIRLINES': 'MH',
  'MALAYSIA AIRLINES': 'MH',
  'NEOS': 'NO',
  'OMAN AIR CARGO': 'WY',
  'QATAR AIRWAYS': 'QR',
  'SAUDI ARABIAN AIRLINES': 'SV',
  'SICHUAN AIRLINES': '3U',
  'SILK WAY WEST AIRLINES': '7L',
  'SINGAPORE AIRLINES': 'SQ',
  'SPICE JET': 'SG',
  'SRILANKAN AIRLINES': 'UL',
  'THAI AIRWAYS INTERNATIONAL': 'TG',
  'THAI LION AIR': 'SL',
  'THAI VIETJET': 'VZ',
  'TURKISH AIRLINES': 'TK',
  'UNI TOP AIRLINES': 'UW',
  'VIETJET AIRLINES': 'VJ',
  'VIETNAM AIRLINES': 'VN',
};

export function formatAirlineName(name: string): string {
  if (!name) return '';
  const key = name.toUpperCase().trim();
  if (AIRLINE_PROPER_NAMES[key]) return AIRLINE_PROPER_NAMES[key];
  return name
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export interface FlightScheduleInfo {
  flight: string;
  departure: string;
  arrival: string;
  transit: string;
  direct: boolean;
  cutoff: string;
}

export const ROUTE_SCHEDULES: Record<string, Record<string, { flight: string; depart: string; arrive: string; transit: string; direct: boolean; cutoff: string }>> = {
  'BOM-DXB': {
    'EK': { flight: 'EK-505', depart: '10:10 IST', arrive: '11:55 GST', transit: 'Direct Flight (3h 15m)', direct: true, cutoff: '05:30 IST' },
    'AI': { flight: 'AI-995', depart: '17:05 IST', arrive: '19:00 GST', transit: 'Direct Flight (3h 25m)', direct: true, cutoff: '11:30 IST' },
    '6E': { flight: '6E-1453', depart: '19:20 IST', arrive: '21:10 GST', transit: 'Direct Flight (3h 20m)', direct: true, cutoff: '13:30 IST' },
    'FZ': { flight: 'FZ-446', depart: '05:25 IST', arrive: '07:10 GST', transit: 'Direct Flight (3h 15m)', direct: true, cutoff: '23:30 IST (-1d)' },
    'SG': { flight: 'SG-13', depart: '23:15 IST', arrive: '01:10 GST (+1)', transit: 'Direct Flight (3h 25m)', direct: true, cutoff: '17:00 IST' },
    'KU': { flight: 'KU-831', depart: '14:30 IST', arrive: '18:45 GST', transit: 'Direct Flight (4h 15m)', direct: true, cutoff: '08:30 IST' },
    'NO': { flight: 'NO-874', depart: '02:40 IST', arrive: '06:10 GST', transit: 'Direct Flight (3h 30m)', direct: true, cutoff: '21:00 IST (-1d)' },
    'EY': { flight: 'EY-205', depart: '04:20 IST', arrive: '09:30 GST', transit: 'Connecting via AUH (5h 10m)', direct: false, cutoff: '22:00 IST (-1d)' },
    'QR': { flight: 'QR-557', depart: '04:10 IST', arrive: '10:30 GST', transit: 'Connecting via DOH (6h 20m)', direct: false, cutoff: '22:00 IST (-1d)' },
    'GF': { flight: 'GF-57', depart: '05:40 IST', arrive: '11:20 GST', transit: 'Connecting via BAH (5h 40m)', direct: false, cutoff: '23:30 IST (-1d)' },
    'WY': { flight: 'WY-202', depart: '09:40 IST', arrive: '15:15 GST', transit: 'Connecting via MCT (5h 35m)', direct: false, cutoff: '04:30 IST' },
    'SV': { flight: 'SV-773', depart: '07:30 IST', arrive: '15:45 GST', transit: 'Connecting via RUH (8h 15m)', direct: false, cutoff: '02:00 IST' },
    'MS': { flight: 'MS-969', depart: '03:00 IST', arrive: '16:30 GST', transit: 'Connecting via CAI (13h 30m)', direct: false, cutoff: '20:00 IST (-1d)' },
    'ET': { flight: 'ET-641', depart: '11:05 IST', arrive: '22:40 GST', transit: 'Connecting via ADD (11h 35m)', direct: false, cutoff: '05:00 IST' },
    'UL': { flight: 'UL-142', depart: '03:10 IST', arrive: '13:45 GST', transit: 'Connecting via CMB (10h 35m)', direct: false, cutoff: '21:00 IST (-1d)' },
    'SQ': { flight: 'SQ-421', depart: '11:45 IST', arrive: '23:55 GST', transit: 'Connecting via SIN (12h 10m)', direct: false, cutoff: '06:00 IST' },
    'TK': { flight: 'TK-721', depart: '06:15 IST', arrive: '19:40 GST', transit: 'Connecting via IST (13h 25m)', direct: false, cutoff: '23:45 IST (-1d)' },
  },
  'BOM-SHA': {
    'UW': { flight: 'UW-177', depart: '04:30 IST', arrive: '15:45 CST', transit: 'Direct Flight (8h 45m)', direct: true, cutoff: '22:30 IST (-1d)' },
    'CX': { flight: 'CX-017', depart: '01:30 IST', arrive: '12:15 CST', transit: 'Connecting via HKG (8h 15m)', direct: false, cutoff: '19:30 IST (-1d)' },
    'SQ': { flight: 'SQ-421', depart: '11:45 IST', arrive: '23:25 CST', transit: 'Connecting via SIN (9h 10m)', direct: false, cutoff: '06:00 IST' },
    'CI': { flight: 'CI-9034', depart: '02:40 IST', arrive: '14:30 CST', transit: 'Connecting via TPE (9h 20m)', direct: false, cutoff: '20:30 IST (-1d)' },
    '3U': { flight: '3U-3902', depart: '22:15 IST', arrive: '11:30 CST (+1)', transit: 'Connecting via TFU (10h 45m)', direct: false, cutoff: '16:00 IST' },
    'SL': { flight: 'SL-805', depart: '00:30 IST', arrive: '13:20 CST', transit: 'Connecting via DMK (10h 20m)', direct: false, cutoff: '18:30 IST (-1d)' },
    'TG': { flight: 'TG-318', depart: '23:20 IST', arrive: '14:15 CST (+1)', transit: 'Connecting via BKK (12h 25m)', direct: false, cutoff: '17:00 IST' },
    'NH': { flight: 'NH-830', depart: '20:00 IST', arrive: '11:45 CST (+1)', transit: 'Connecting via NRT (13h 15m)', direct: false, cutoff: '14:00 IST' },
    'MH': { flight: 'MH-195', depart: '23:25 IST', arrive: '15:35 CST (+1)', transit: 'Connecting via KUL (13h 40m)', direct: false, cutoff: '17:30 IST' },
    'GA': { flight: 'GA-895', depart: '01:15 IST', arrive: '18:40 CST', transit: 'Connecting via CGK (14h 55m)', direct: false, cutoff: '19:00 IST (-1d)' },
    'VN': { flight: 'VN-972', depart: '23:35 IST', arrive: '14:10 CST (+1)', transit: 'Connecting via SGN (12h 05m)', direct: false, cutoff: '17:30 IST' },
    'VJ': { flight: 'VJ-884', depart: '00:05 IST', arrive: '14:45 CST', transit: 'Connecting via HAN (12h 10m)', direct: false, cutoff: '18:00 IST (-1d)' },
    'VZ': { flight: 'VZ-761', depart: '01:00 IST', arrive: '15:15 CST', transit: 'Connecting via BKK (11h 45m)', direct: false, cutoff: '19:00 IST (-1d)' },
    '5J': { flight: '5J-901', depart: '22:50 IST', arrive: '14:15 CST (+1)', transit: 'Connecting via MNL (12h 55m)', direct: false, cutoff: '16:30 IST' },
    'D7': { flight: 'D7-183', depart: '23:00 IST', arrive: '15:20 CST (+1)', transit: 'Connecting via KUL (13h 50m)', direct: false, cutoff: '17:00 IST' },
    '7L': { flight: '7L-612', depart: '03:40 IST', arrive: '22:15 CST', transit: 'Freighter via GYD (16h 05m)', direct: false, cutoff: '21:30 IST (-1d)' },
    'EK': { flight: 'EK-501', depart: '04:30 IST', arrive: '23:45 CST', transit: 'Connecting via DXB (16h 45m)', direct: false, cutoff: '22:30 IST (-1d)' },
    'EY': { flight: 'EY-205', depart: '04:20 IST', arrive: '00:15 CST (+1)', transit: 'Connecting via AUH (17h 25m)', direct: false, cutoff: '22:00 IST (-1d)' },
    'QR': { flight: 'QR-557', depart: '04:10 IST', arrive: '22:30 CST', transit: 'Connecting via DOH (15h 50m)', direct: false, cutoff: '22:00 IST (-1d)' },
    'TK': { flight: 'TK-721', depart: '06:15 IST', arrive: '08:30 CST (+1)', transit: 'Connecting via IST (23h 45m)', direct: false, cutoff: '23:45 IST (-1d)' },
    'SU': { flight: 'SU-233', depart: '05:00 IST', arrive: '09:50 CST (+1)', transit: 'Connecting via SVO (26h 20m)', direct: false, cutoff: '23:00 IST (-1d)' },
  },
};

export function getFlightSchedule(
  carrierCode?: string,
  origin = 'BOM',
  destination = 'DXB',
  idx = 0
): FlightScheduleInfo {
  const orig = (origin || 'BOM').toUpperCase().trim();
  const dest = (destination || 'DXB').toUpperCase().trim();
  const code = (carrierCode || '').toUpperCase().trim();
  const routeKey = `${orig}-${dest}`;

  if (ROUTE_SCHEDULES[routeKey] && ROUTE_SCHEDULES[routeKey][code]) {
    const s = ROUTE_SCHEDULES[routeKey][code];
    return {
      flight: s.flight,
      departure: s.depart,
      arrival: s.arrive,
      transit: s.transit,
      direct: s.direct,
      cutoff: s.cutoff,
    };
  }

  // Realistic fallback schedule
  const isDirect = (orig === 'BOM' && dest === 'DXB') || idx % 3 === 0;
  const flightNum = `${code || 'JF'}-${200 + (idx * 57) % 700}`;
  const depHour = (6 + (idx * 3)) % 24;
  const depTime = `${String(depHour).padStart(2, '0')}:30 IST`;

  if (isDirect) {
    const arrHour = (depHour + 4) % 24;
    return {
      flight: flightNum,
      departure: depTime,
      arrival: `${String(arrHour).padStart(2, '0')}:15 Local`,
      transit: 'Direct Flight (3h 45m)',
      direct: true,
      cutoff: `${String((depHour - 5 + 24) % 24).padStart(2, '0')}:00 IST`,
    };
  }

  return {
    flight: flightNum,
    departure: depTime,
    arrival: 'Next day +1',
    transit: 'Connecting Hub Transit (14-22h)',
    direct: false,
    cutoff: `${String((depHour - 6 + 24) % 24).padStart(2, '0')}:00 IST`,
  };
}

/**
 * Converts linear dimensions from supported unit to centimeters (cm).
 */
export type DimensionUnit = 'cm' | 'in' | 'm' | 'mm';

export function convertToCm(value: number, unit: DimensionUnit = 'cm'): number {
  if (!value || isNaN(value) || value <= 0) return 0;
  switch (unit) {
    case 'in':
      return value * 2.54;
    case 'm':
      return value * 100;
    case 'mm':
      return value / 10;
    case 'cm':
    default:
      return value;
  }
}

/**
 * Calculates volumetric weight in kg according to IATA standard divisor (6,000 cm³/kg).
 */
export function calculateVolumetricWeight(
  length: number,
  width: number,
  height: number,
  pieces: number = 1,
  unit: DimensionUnit = 'cm'
): number {
  const l = convertToCm(length, unit);
  const w = convertToCm(width, unit);
  const h = convertToCm(height, unit);
  const pcs = Math.max(1, pieces || 1);
  if (l > 0 && w > 0 && h > 0) {
    return Math.round(((l * w * h * pcs) / 6000) * 10) / 10;
  }
  return 0;
}

/**
 * Calculates volume in CBM (m³) from dimensions.
 */
export function calculateCbm(
  length: number,
  width: number,
  height: number,
  pieces: number = 1,
  unit: DimensionUnit = 'cm'
): number {
  const l = convertToCm(length, unit);
  const w = convertToCm(width, unit);
  const h = convertToCm(height, unit);
  const pcs = Math.max(1, pieces || 1);
  if (l > 0 && w > 0 && h > 0) {
    return Math.round(((l * w * h * pcs) / 1000000) * 1000) / 1000;
  }
  return 0;
}

/**
 * Formats an integer amount as Indian Rupee string (e.g. ₹1,25,000)
 */
export function formatInr(val: number): string {
  if (isNaN(val) || val == null) return '₹0';
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

/**
 * Parses transit duration strings like "3h 15m" into total minutes
 */
export function parseTransitMinutes(transitStr = ''): number {
  let minutes = 0;
  const hMatch = transitStr.match(/(\d+)\s*h/i);
  const mMatch = transitStr.match(/(\d+)\s*m/i);
  if (hMatch) minutes += parseInt(hMatch[1], 10) * 60;
  if (mMatch) minutes += parseInt(mMatch[1], 10);
  return minutes > 0 ? minutes : 9999;
}

/**
 * Parses daily departure times like "10:10 IST" into minutes since midnight
 */
export function parseDepartureMinutes(depStr = ''): number {
  const match = depStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 9999;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

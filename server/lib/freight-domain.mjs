/**
 * Freight Domain Models, Airline Registry & Flight Schedules
 */

export const AIRLINE_PROPER_NAMES = {
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

export const CARRIER_CODE_MAP = {
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

export function formatAirlineName(name) {
  if (!name) return '';
  const key = name.toUpperCase().trim();
  if (AIRLINE_PROPER_NAMES[key]) return AIRLINE_PROPER_NAMES[key];
  return name
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const ROUTE_SCHEDULES = {
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
  }
};

export function getFlightSchedule(carrierCode, origin, destination, idx = 0) {
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
  } else {
    return {
      flight: flightNum,
      departure: depTime,
      arrival: 'Next day +1',
      transit: 'Connecting Hub Transit (14-22h)',
      direct: false,
      cutoff: `${String((depHour - 6 + 24) % 24).padStart(2, '0')}:00 IST`,
    };
  }
}

/**
 * Converts linear dimensions from supported unit to centimeters (cm).
 */
export function convertToCm(value, unit = 'cm') {
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
      return Number(value);
  }
}

/**
 * Calculates volumetric weight in kg according to IATA standard divisor (6,000 cm³/kg).
 */
export function calculateVolumetricWeight(length, width, height, pieces = 1, unit = 'cm') {
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
export function calculateCbm(length, width, height, pieces = 1, unit = 'cm') {
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
 * Parses transit duration strings like "3h 15m" into total minutes
 */
export function parseTransitMinutes(transitStr = '') {
  let minutes = 0;
  const hMatch = String(transitStr).match(/(\d+)\s*h/i);
  const mMatch = String(transitStr).match(/(\d+)\s*m/i);
  if (hMatch) minutes += parseInt(hMatch[1], 10) * 60;
  if (mMatch) minutes += parseInt(mMatch[1], 10);
  return minutes > 0 ? minutes : 9999;
}

/**
 * Parses daily departure times like "10:10 IST" into minutes since midnight
 */
export function parseDepartureMinutes(depStr = '') {
  const match = String(depStr).match(/(\d{1,2}):(\d{2})/);
  if (!match) return 9999;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

/**
 * Builds an O(1) hash map indexing rates by corridor key `${origin}-${destination}`.
 */
export function buildRateRouteIndex(rates = []) {
  const index = new Map();
  for (let i = 0; i < rates.length; i++) {
    const r = rates[i];
    const orig = (r.origin || '').toUpperCase().trim();
    const dest = (r.destination || '').toUpperCase().trim();
    const key = `${orig}-${dest}`;
    let bucket = index.get(key);
    if (!bucket) {
      bucket = [];
      index.set(key, bucket);
    }
    bucket.push(r);
  }
  return index;
}

// WeakMap memoizes the route index for array references to avoid re-indexing on every call
const rateIndexCache = new WeakMap();

export function getOrBuildRateIndex(rates) {
  if (rates instanceof Map) return rates;
  if (!Array.isArray(rates)) return new Map();
  let cached = rateIndexCache.get(rates);
  if (!cached) {
    cached = buildRateRouteIndex(rates);
    rateIndexCache.set(rates, cached);
  }
  return cached;
}

/**
 * Calculates live freight quotes against the tariff dataset (IATA TACT rules, weight tiers, surcharges).
 */
export function calculateQuote({ origin, destination, actualWeight, volumetricWeight, cargoType, rates = [], rateIndex = null }) {
  const rawWeight = Math.max(actualWeight, volumetricWeight);
  // IATA TACT Rule 1.3.2: Chargeable weight rounded up to nearest 0.5 kg
  const chargeableWeight = Math.ceil(rawWeight * 2) / 2;
  if (!origin || !destination || chargeableWeight <= 0) {
    return { chargeableWeight: 0, rates: [] };
  }

  const origUpper = (origin || '').toUpperCase().trim();
  const destUpper = (destination || '').toUpperCase().trim();
  const routeKey = `${origUpper}-${destUpper}`;
  const normCargo = (cargoType || '').toLowerCase().trim();

  // 1. O(1) route bucket retrieval via Index
  const index = rateIndex instanceof Map ? rateIndex : getOrBuildRateIndex(rates);
  const routeCandidates = index.get(routeKey) || [];

  // Filter within the small corridor bucket rather than full table scan
  let matched = normCargo
    ? routeCandidates.filter((r) => r.cargo_category?.toLowerCase() === normCargo)
    : routeCandidates;

  // Fallback to general route if specific cargo category doesn't have custom tariff
  let isCategoryFallback = false;
  if (matched.length === 0 && routeCandidates.length > 0) {
    isCategoryFallback = true;
    matched = routeCandidates;
  }

  // Fallback for inquiry hubs connecting from BOM
  let isConnecting = false;
  if (matched.length === 0 && origUpper === 'BOM') {
    isConnecting = true;
    matched = index.get('BOM-DXB') || [];
  }

  const calculated = matched.map((r, idx) => {
    // IATA TACT Rule 2.2: Commodity Classification Rates (CCR) & Statutory Surcharges
    let classMultiplier = 1.0;
    let commodityFee = 0;
    const normCat = (cargoType || r.cargo_category || '').toLowerCase();

    if (normCat.includes('dangerous') || normCat.includes('dgr')) {
      commodityFee = 3500; // Statutory MIAL/IGI DGR Acceptance & DG Checklist Inspection fee
      if (isCategoryFallback) classMultiplier = 1.25; // Standard IATA Class Rate markup for DGR
    } else if (normCat.includes('pharma') || normCat.includes('perishable')) {
      commodityFee = Math.round(Math.max(chargeableWeight * 2.5, 1500)); // Active cold-room / cool-chain handling
      if (isCategoryFallback) classMultiplier = 1.15; // IATA Class Rate markup for Temperature-Controlled
    } else if (normCat.includes('express')) {
      if (isCategoryFallback) classMultiplier = 1.30; // Priority uplift multiplier
    }

    const multiplier = (isConnecting ? 1.35 : 1.0) * classMultiplier;
    const cw = chargeableWeight;

    // 1. Build sorted active weight tiers for carrier
    const tiers = [];
    if (r.rate_normal && Number(r.rate_normal) > 0) tiers.push({ minWeight: 0, rate: Number(r.rate_normal) });
    if (r.rate_45 && Number(r.rate_45) > 0)         tiers.push({ minWeight: 45, rate: Number(r.rate_45) });
    if (r.rate_100 && Number(r.rate_100) > 0)       tiers.push({ minWeight: 100, rate: Number(r.rate_100) });
    if (r.rate_250 && Number(r.rate_250) > 0)       tiers.push({ minWeight: 250, rate: Number(r.rate_250) });
    if (r.rate_300 && Number(r.rate_300) > 0)       tiers.push({ minWeight: 300, rate: Number(r.rate_300) });
    if (r.rate_500 && Number(r.rate_500) > 0)       tiers.push({ minWeight: 500, rate: Number(r.rate_500) });
    if (r.rate_1000 && Number(r.rate_1000) > 0)     tiers.push({ minWeight: 1000, rate: Number(r.rate_1000) });

    let naturalIdx = 0;
    for (let i = 0; i < tiers.length; i++) {
      if (cw >= tiers[i].minWeight) naturalIdx = i;
    }

    let effectiveRate = tiers[naturalIdx] ? Math.round(tiers[naturalIdx].rate * multiplier) : 150;
    let baseFreight = Math.round(effectiveRate * cw);

    // 2. Break-even check against higher slabs: ((NextRate * NextWeight) / CurrentRate)
    for (let j = naturalIdx + 1; j < tiers.length; j++) {
      const higherRate = Math.round(tiers[j].rate * multiplier);
      const higherFreight = Math.round(tiers[j].minWeight * higherRate);
      if (higherFreight < baseFreight) {
        baseFreight = higherFreight;
        effectiveRate = higherRate;
      }
    }

    // 3. Absolute minimum charge floor check
    if (r.min_charge && Number(r.min_charge) > 0) {
      baseFreight = Math.max(baseFreight, Number(r.min_charge));
    }
    const rawFsc = Number(r.fsc_per_kg);
    const rawSsc = Number(r.ssc_per_kg);
    const effectiveFsc = !isNaN(rawFsc) && rawFsc > 0 ? rawFsc : 18.0;
    const effectiveSsc = !isNaN(rawSsc) && rawSsc > 0 ? rawSsc : 3.5;
    const fsc = Math.round(Math.max(effectiveFsc * cw, Number(r.fsc_min) || 1500));
    const ssc = Math.round(Math.max(effectiveSsc * cw, Number(r.ssc_min) || 350));
    const fuelSecurity = fsc + ssc;
    const xray = Math.round(Math.max((Number(r.xray_per_kg) || 3.5) * cw, Number(r.xray_min) || 0));
    const misc = Math.round(Math.max((Number(r.misc_per_kg) || 2) * cw, Number(r.misc_min) || 0));
    const ctg = Math.round(Math.max((Number(r.ctg_per_kg) || 0) * cw, Number(r.ctg_min) || 0));
    const originTHC = xray + misc + ctg + commodityFee;
    const awbFee = Number(r.awb_fee) || 800;
    const amsFee = Number(r.ams_mawb) || 0;
    const subtotal = baseFreight + fuelSecurity + originTHC + awbFee + amsFee;
    const tax = Math.round(subtotal * 0.05); // 5% Air Export GST
    const baseTotal = subtotal + tax;
    const total = Math.round(baseTotal * 1.04); // 4% commercial markup before displaying price

    const schedule = getFlightSchedule(r.carrier_code, r.origin || origin, r.destination || destination, idx);

    const includedServices = [
      `${r.service_tier || 'Air Freight'} Uplift`,
      'Fuel & Security Surcharges',
      'e-AWB Issuance',
      'X-Ray & Terminal Handling',
      '5% Air Export GST',
    ];
    if (commodityFee > 0) {
      if (normCat.includes('dangerous') || normCat.includes('dgr')) {
        includedServices.push('DGR Acceptance & Inspection');
      } else {
        includedServices.push('Cool Chain Storage & Apron Monitoring');
      }
    }

    return {
      id: `rate-${idx}`,
      carrier: formatAirlineName(r.airline),
      carrierCode: r.carrier_code,
      prefix: r.prefix,
      code: schedule.flight,
      service: r.service_tier || (schedule.direct ? 'Scheduled Air Export' : 'Connecting Interline Route'),
      cargoCategory: r.cargo_category || cargoType || 'General cargo',
      paymentType: r.payment_type || 'PP',
      departure: schedule.departure,
      arrival: schedule.arrival,
      transit: schedule.transit,
      departureMinutes: parseDepartureMinutes(schedule.departure),
      transitMinutes: parseTransitMinutes(schedule.transit),
      chargeableWeight,
      ratePerKg: effectiveRate,
      baseFreight,
      fuelSecurity,
      fsc,
      ssc,
      originTHC,
      tax,
      total,
      contractTotal: Math.round(total * 0.92),
      direct: schedule.direct,
      recommended: false,
      cutoff: schedule.cutoff,
      included: includedServices,
    };
  });

  calculated.sort((a, b) => a.total - b.total);
  if (calculated.length > 0) {
    calculated[0].recommended = true;
  }

  return {
    chargeableWeight,
    rates: calculated.slice(0, 12),
  };
}

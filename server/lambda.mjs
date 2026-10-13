/**
 * AWS Lambda Handler for Jet Freight Logistics API
 * Native ESM serverless entrypoint for AWS Lambda Function URLs & API Gateway.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatAirlineName, getFlightSchedule } from './lib/freight-domain.mjs';
import {
  validateQuoteInput,
  validateInquiryInput,
  sanitizeString,
} from './lib/security.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate master CSV rates dataset across different runtime environments
const candidatePaths = [
  path.resolve(__dirname, 'data/CONSOLIDATED_AIR_FREIGHT_RATES.csv'),
  path.resolve(process.cwd(), 'server/data/CONSOLIDATED_AIR_FREIGHT_RATES.csv'),
  path.resolve(process.cwd(), 'data/CONSOLIDATED_AIR_FREIGHT_RATES.csv'),
];

const csvPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];
const rates = [];
const bookings = [];
const inquiries = [];

if (fs.existsSync(csvPath)) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx]?.trim() || '';
    });
    rates.push(obj);
  }
}

/**
 * Calculates live freight quotes against the tariff dataset.
 */
function calculateQuote({ origin, destination, actualWeight, volumetricWeight, cargoType }) {
  const rawWeight = Math.max(actualWeight, volumetricWeight);
  // IATA TACT Rule 1.3.2: Chargeable weight rounded up to nearest 0.5 kg
  const chargeableWeight = Math.ceil(rawWeight * 2) / 2;
  if (!origin || !destination || chargeableWeight <= 0) {
    return { chargeableWeight: 0, rates: [] };
  }

  // 1. Direct matches in consolidated rates with cargo category filter
  let matched = rates.filter(
    (r) =>
      (!origin || r.origin?.toUpperCase() === origin.toUpperCase()) &&
      (!destination || r.destination?.toUpperCase() === destination.toUpperCase()) &&
      (!cargoType || r.cargo_category?.toLowerCase() === cargoType.toLowerCase())
  );

  // Fallback to route if specific cargo category doesn't have custom tariff
  let isCategoryFallback = false;
  if (matched.length === 0) {
    isCategoryFallback = true;
    matched = rates.filter(
      (r) =>
        (!origin || r.origin?.toUpperCase() === origin.toUpperCase()) &&
        (!destination || r.destination?.toUpperCase() === destination.toUpperCase())
    );
  }

  // Fallback for connecting hubs from BOM
  let isConnecting = false;
  if (matched.length === 0 && origin?.toUpperCase() === 'BOM') {
    isConnecting = true;
    matched = rates.filter((r) => r.origin === 'BOM' && r.destination === 'DXB');
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
      id: `lambda-rate-${idx}`,
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

const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

/**
 * Main AWS Lambda Entrypoint
 */
export async function handler(event) {
  // Normalize HTTP method and path across Lambda Function URL (Payload v2) & API Gateway (Payload v1)
  const method = (
    event.requestContext?.http?.method ||
    event.httpMethod ||
    'GET'
  ).toUpperCase();

  const path = event.rawPath || event.path || '/';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: COMMON_HEADERS,
      body: '',
    };
  }

  // Parse JSON Body
  let body = {};
  if (event.body) {
    try {
      const raw = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf-8')
        : event.body;
      body = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return {
        statusCode: 400,
        headers: COMMON_HEADERS,
        body: JSON.stringify({ error: 'Malformed JSON payload' }),
      };
    }
  }

  // 1. GET /api/health
  if (path === '/api/health' || path === '/health' || path === '/') {
    return {
      statusCode: 200,
      headers: COMMON_HEADERS,
      body: JSON.stringify({
        status: 'ok',
        service: 'Jet Freight Backend API',
        runtime: 'AWS Lambda (Serverless)',
        timestamp: new Date().toISOString(),
      }),
    };
  }

  // 2. POST /api/rates/quote
  if (path === '/api/rates/quote') {
    if (method !== 'POST') {
      return { statusCode: 405, headers: COMMON_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const validation = validateQuoteInput(body);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: COMMON_HEADERS,
        body: JSON.stringify({ error: validation.error }),
      };
    }

    const { origin, destination, weight, volumetricWeight, cargoType } = validation.data;
    const quote = calculateQuote({
      origin,
      destination,
      actualWeight: weight,
      volumetricWeight,
      cargoType,
    });

    if (quote.chargeableWeight > 500) {
      return {
        statusCode: 200,
        headers: COMMON_HEADERS,
        body: JSON.stringify({
          origin,
          destination,
          actualWeight: weight,
          chargeableWeight: quote.chargeableWeight,
          requiresCustomQuote: true,
          rates: [],
          message:
            'For shipments above 500 kg, published tariff rates are not available. Custom spot rates will be provided by our Pricing Team.',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: COMMON_HEADERS,
      body: JSON.stringify({
        origin,
        destination,
        actualWeight: weight,
        chargeableWeight: quote.chargeableWeight,
        rates: quote.rates,
      }),
    };
  }

  // 3. POST /api/inquiries/quote-request
  if (path === '/api/inquiries/quote-request') {
    if (method === 'GET') {
      return {
        statusCode: 200,
        headers: COMMON_HEADERS,
        body: JSON.stringify({ inquiries }),
      };
    }

    if (method !== 'POST') {
      return { statusCode: 405, headers: COMMON_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const validation = validateInquiryInput(body);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: COMMON_HEADERS,
        body: JSON.stringify({ error: validation.error }),
      };
    }

    const ref = `JFLL-RFQ-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const inquiryRecord = {
      id: `inq_${Date.now()}`,
      referenceNumber: ref,
      ...validation.data,
      status: 'RECEIVED',
      estimatedResponseTime: 'Within 2 business hours',
      createdAt: new Date().toISOString(),
    };

    inquiries.unshift(inquiryRecord);
    return {
      statusCode: 201,
      headers: COMMON_HEADERS,
      body: JSON.stringify({
        success: true,
        inquiryId: inquiryRecord.id,
        referenceNumber: ref,
        status: inquiryRecord.status,
        estimatedResponseTime: inquiryRecord.estimatedResponseTime,
        message:
          'Heavy cargo inquiry received. Our Sales Coordinator or Pricing Team will contact you soon with custom spot rates.',
        data: inquiryRecord,
      }),
    };
  }

  // 4. GET & POST /api/bookings
  if (path === '/api/bookings') {
    if (method === 'GET') {
      return {
        statusCode: 200,
        headers: COMMON_HEADERS,
        body: JSON.stringify({ bookings }),
      };
    }

    if (method === 'POST') {
      const ref = sanitizeString(body.reference, 40) || `JFLL-AE-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const awb = sanitizeString(body.awbNumber, 20) || `176-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const bookingRecord = {
        reference: ref,
        awbNumber: awb,
        origin: sanitizeString(body.origin, 10).toUpperCase() || 'BOM',
        destination: sanitizeString(body.destination, 10).toUpperCase() || 'DXB',
        carrier: sanitizeString(body.carrier, 60) || 'Kuwait Airways',
        flight: sanitizeString(body.flight, 20) || 'KU-831',
        shipper: sanitizeString(body.shipper || body.shipperName, 100) || 'Registered Shipper',
        consignee: sanitizeString(body.consignee || body.consigneeName, 100) || 'Consignee',
        commodity: sanitizeString(body.commodity || body.cargoDescription, 120) || 'Air Freight Cargo',
        cargoCategory: sanitizeString(body.cargoCategory || body.cargoType, 50) || 'General cargo',
        packagingType: sanitizeString(body.packagingType, 50) || 'Corrugated Cartons',
        incoterm: sanitizeString(body.incoterm, 10) || 'CIP',
        chargeableWeight: Math.max(0, Number(body.chargeableWeight || body.weight) || 0),
        totalAmount: Math.max(0, Number(body.totalAmount || body.total) || 0),
        status: 'Booking Confirmed - AWB pending',
        createdAt: new Date().toISOString(),
      };

      bookings.unshift(bookingRecord);
      return {
        statusCode: 201,
        headers: COMMON_HEADERS,
        body: JSON.stringify({ success: true, booking: bookingRecord }),
      };
    }

    return { statusCode: 405, headers: COMMON_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // 404 Fallback
  return {
    statusCode: 404,
    headers: COMMON_HEADERS,
    body: JSON.stringify({ error: 'Not Found', path }),
  };
}

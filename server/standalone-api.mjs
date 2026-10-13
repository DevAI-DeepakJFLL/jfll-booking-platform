/**
 * Jet Freight Logistics - Core Operations & Rates API Server
 * Modular, secured, production-hardened standalone HTTP service.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { formatAirlineName, getFlightSchedule } from './lib/freight-domain.mjs';
import {
  applySecurityHeaders,
  readJsonBody,
  validateQuoteInput,
  validateInquiryInput,
  sanitizeString,
} from './lib/security.mjs';

// 1. Load rates dataset from CSV
const candidateCsv = path.resolve('server/data/CONSOLIDATED_AIR_FREIGHT_RATES.csv');
const csvPath = fs.existsSync(candidateCsv) ? candidateCsv : path.resolve('data/CONSOLIDATED_AIR_FREIGHT_RATES.csv');
const rates = [];
const bookings = [];
const inquiries = [];

if (fs.existsSync(csvPath)) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
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
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);
  if (!origin || !destination || chargeableWeight <= 0) {
    return { chargeableWeight: 0, rates: [] };
  }

  // 1. Direct matches in consolidated rates with cargo category filter
  let matched = rates.filter(r =>
    (!origin || r.origin?.toUpperCase() === origin.toUpperCase()) &&
    (!destination || r.destination?.toUpperCase() === destination.toUpperCase()) &&
    (!cargoType || r.cargo_category?.toLowerCase() === cargoType.toLowerCase())
  );

  // Fallback to route if specific cargo category doesn't have custom tariff
  if (matched.length === 0) {
    matched = rates.filter(r =>
      (!origin || r.origin?.toUpperCase() === origin.toUpperCase()) &&
      (!destination || r.destination?.toUpperCase() === destination.toUpperCase())
    );
  }

  // Fallback for inquiry hubs connecting from BOM
  let isConnecting = false;
  if (matched.length === 0 && origin?.toUpperCase() === 'BOM') {
    isConnecting = true;
    matched = rates.filter(r => r.origin === 'BOM' && r.destination === 'DXB');
  }

  const calculated = matched.map((r, idx) => {
    let ratePerKg = 0;
    const cw = chargeableWeight;
    if (cw >= 1000 && r.rate_1000) ratePerKg = Number(r.rate_1000);
    else if (cw >= 500 && r.rate_500) ratePerKg = Number(r.rate_500);
    else if (cw >= 300 && r.rate_300) ratePerKg = Number(r.rate_300);
    else if (cw >= 250 && r.rate_250) ratePerKg = Number(r.rate_250);
    else if (cw >= 100 && r.rate_100) ratePerKg = Number(r.rate_100);
    else if (cw >= 45 && r.rate_45) ratePerKg = Number(r.rate_45);
    else ratePerKg = Number(r.rate_normal) || Number(r.min_charge) || 150;

    const multiplier = isConnecting ? 1.35 : 1.0;
    const effectiveRate = Math.round(ratePerKg * multiplier);

    const baseFreight = Math.max(Number(r.min_charge) || 0, Math.round(effectiveRate * cw));
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
    const originTHC = xray + misc + ctg;
    const awbFee = Number(r.awb_fee) || 800;
    const amsFee = Number(r.ams_mawb) || 0;
    const subtotal = baseFreight + fuelSecurity + originTHC + awbFee + amsFee;
    const tax = Math.round(subtotal * 0.05); // 5% Air Export GST
    const baseTotal = subtotal + tax;
    const total = Math.round(baseTotal * 1.04); // 4% commercial markup before displaying price

    const schedule = getFlightSchedule(r.carrier_code, r.origin || origin, r.destination || destination, idx);

    return {
      id: `floci-rate-${idx}`,
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
      included: [
        `${r.service_tier || 'Air Freight'} Uplift`,
        'Fuel & Security Surcharges',
        'e-AWB Issuance',
        'X-Ray & Terminal Handling',
        '5% Air Export GST',
      ],
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

// 2. HTTP Server configuration
const server = http.createServer(async (req, res) => {
  // Apply defensive HTTP headers & CORS
  applySecurityHeaders(res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = (req.url || '').split('?')[0];

  // GET & HEAD /api/health
  if (url === '/api/health') {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'GET, HEAD' });
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(JSON.stringify({ status: 'ok', service: 'Jet Freight Backend API', emulator: 'Floci AWS' }));
    return;
  }

  // POST /api/rates/quote
  if (url === '/api/rates/quote') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'POST' });
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }

    try {
      const body = await readJsonBody(req);
      const validation = validateQuoteInput(body);
      if (!validation.valid) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: validation.error }));
        return;
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
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          origin,
          destination,
          actualWeight: weight,
          chargeableWeight: quote.chargeableWeight,
          requiresCustomQuote: true,
          rates: [],
          message: 'For shipments above 500 kg, published tariff rates are not available. Custom spot rates will be provided by our Pricing Team.',
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        origin,
        destination,
        actualWeight: weight,
        chargeableWeight: quote.chargeableWeight,
        rates: quote.rates,
      }));
    } catch (err) {
      const status = err.statusCode || 500;
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
    }
    return;
  }

  // GET & POST /api/bookings
  if (url === '/api/bookings') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ bookings }));
      return;
    }

    if (req.method === 'POST') {
      try {
        const payload = await readJsonBody(req);
        const ref = sanitizeString(payload.reference, 40) || `JFLL-AE-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const awb = sanitizeString(payload.awbNumber, 20) || `176-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const bookingRecord = {
          reference: ref,
          awbNumber: awb,
          origin: sanitizeString(payload.origin, 10).toUpperCase() || 'BOM',
          destination: sanitizeString(payload.destination, 10).toUpperCase() || 'DXB',
          carrier: sanitizeString(payload.carrier, 60) || 'Kuwait Airways',
          flight: sanitizeString(payload.flight, 20) || 'KU-831',
          shipper: sanitizeString(payload.shipper || payload.shipperName, 100) || 'Registered Shipper',
          consignee: sanitizeString(payload.consignee || payload.consigneeName, 100) || 'Consignee',
          commodity: sanitizeString(payload.commodity || payload.cargoDescription, 120) || 'Air Freight Cargo',
          cargoCategory: sanitizeString(payload.cargoCategory || payload.cargoType, 50) || 'General cargo',
          packagingType: sanitizeString(payload.packagingType, 50) || 'Corrugated Cartons',
          incoterm: sanitizeString(payload.incoterm, 10) || 'CIP',
          chargeableWeight: Math.max(0, Number(payload.chargeableWeight || payload.weight) || 0),
          totalAmount: Math.max(0, Number(payload.totalAmount || payload.total) || 0),
          status: 'Booking Confirmed - AWB pending',
          createdAt: new Date().toISOString(),
        };

        bookings.unshift(bookingRecord);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, booking: bookingRecord }));
      } catch (err) {
        const status = err.statusCode || 500;
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      }
      return;
    }

    res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'GET, POST' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  // GET & POST /api/inquiries/quote-request
  if (url === '/api/inquiries/quote-request') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ inquiries }));
      return;
    }

    if (req.method === 'POST') {
      try {
        const payload = await readJsonBody(req);
        const validation = validateInquiryInput(payload);
        if (!validation.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: validation.error }));
          return;
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
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          inquiryId: inquiryRecord.id,
          referenceNumber: ref,
          status: inquiryRecord.status,
          estimatedResponseTime: inquiryRecord.estimatedResponseTime,
          message: 'Heavy cargo inquiry received. Our Sales Coordinator or Pricing Team will contact you soon with custom spot rates.',
          data: inquiryRecord,
        }));
      } catch (err) {
        const status = err.statusCode || 500;
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      }
      return;
    }

    res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'GET, POST' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  // POST /api/rates/sync-s3
  if (url === '/api/rates/sync-s3') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'POST' });
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }

    try {
      const s3res = await fetch('http://localhost:4566/jetfreight-rates-archive/rates/consolidated/latest/CONSOLIDATED_AIR_FREIGHT_RATES.csv', {
        method: 'PUT',
        headers: { 'Content-Type': 'text/csv' },
        body: fs.readFileSync(csvPath),
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        s3Status: s3res.status,
        bucket: 'jetfreight-rates-archive',
        s3Url: 'http://localhost:4566/jetfreight-rates-archive/rates/consolidated/latest/CONSOLIDATED_AIR_FREIGHT_RATES.csv',
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to synchronize with S3 archive emulator' }));
    }
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Configure server timeouts against slow client attacks
server.setTimeout(15000);
server.headersTimeout = 20000;

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Jet Freight API server running on http://localhost:${PORT}`);
});

/**
 * Jet Freight Logistics - Core Operations & Rates API Server
 * Modular, secured, production-hardened standalone HTTP service.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { calculateQuote } from './lib/freight-domain.mjs';
import {
  applySecurityHeaders,
  readJsonBody,
  validateQuoteInput,
  validateInquiryInput,
  validateBookingInput,
} from './lib/security.mjs';
import { sendBookingConfirmationEmail, sendHeavyCargoInquiryEmail } from './lib/email-service.mjs';
import { loadBookings, saveBooking, loadInquiries, saveInquiry } from './lib/storage.mjs';

// 1. Load rates dataset from CSV
const candidateCsv = path.resolve('server/data/CONSOLIDATED_AIR_FREIGHT_RATES.csv');
const csvPath = fs.existsSync(candidateCsv) ? candidateCsv : path.resolve('data/CONSOLIDATED_AIR_FREIGHT_RATES.csv');
const rates = [];

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

// 2. HTTP Server configuration
const server = http.createServer(async (req, res) => {
  // Apply defensive HTTP headers & CORS
  applySecurityHeaders(res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key, X-Client-Id');
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
    const hasClientId = Boolean(process.env.GMAIL_CLIENT_ID);
    const hasClientSecret = Boolean(process.env.GMAIL_CLIENT_SECRET);
    const hasRefreshToken = Boolean(process.env.GMAIL_REFRESH_TOKEN);
    const hasUser = Boolean(process.env.GMAIL_USER);
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'Jet Freight Backend API',
        runtime: 'Node.js Standalone HTTP',
        timestamp: new Date().toISOString(),
        emailConfiguration: {
          configured: hasClientId && hasClientSecret && hasRefreshToken,
          hasClientId,
          clientIdPrefix: process.env.GMAIL_CLIENT_ID ? process.env.GMAIL_CLIENT_ID.substring(0, 15) + '...' : null,
          hasClientSecret,
          hasRefreshToken,
          hasUser,
          notificationTo: process.env.NOTIFICATION_EMAIL_TO || 'deepak.naidu@jfll.com',
          notificationFrom: process.env.NOTIFICATION_EMAIL_FROM || 'default',
        },
      })
    );
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
        rates,
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
      const allBookings = loadBookings();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ bookings: allBookings }));
      return;
    }

    if (req.method === 'POST') {
      try {
        const payload = await readJsonBody(req);
        const validation = validateBookingInput(payload);
        if (!validation.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: validation.error }));
          return;
        }

        const bookingRecord = saveBooking(validation.data);

        let emailResult = null;
        try {
          emailResult = await sendBookingConfirmationEmail(bookingRecord);
        } catch (err) {
          console.error('[EmailService] Async booking notification failed:', err);
          emailResult = { success: false, error: err.message || String(err) };
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, booking: bookingRecord, emailDelivery: emailResult }));
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
      const allInquiries = loadInquiries();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ inquiries: allInquiries }));
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

        saveInquiry(inquiryRecord);

        let emailResult = null;
        try {
          emailResult = await sendHeavyCargoInquiryEmail(inquiryRecord);
        } catch (err) {
          console.error('[EmailService] Async heavy cargo notification failed:', err);
          emailResult = { success: false, error: err.message || String(err) };
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            inquiryId: inquiryRecord.id,
            referenceNumber: ref,
            status: inquiryRecord.status,
            estimatedResponseTime: inquiryRecord.estimatedResponseTime,
            message:
              'Heavy cargo inquiry received. Our Sales Coordinator or Pricing Team will contact you soon with custom spot rates.',
            data: inquiryRecord,
            emailDelivery: emailResult,
          })
        );
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

    const adminKey = process.env.ADMIN_API_KEY;
    if (process.env.NODE_ENV === 'production' && !adminKey) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'S3 Sync endpoint disabled: ADMIN_API_KEY not configured' }));
      return;
    }

    if (adminKey) {
      const authHeader = req.headers['authorization'] || req.headers['x-admin-key'] || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token !== adminKey) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized: Invalid administrative credentials' }));
        return;
      }
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

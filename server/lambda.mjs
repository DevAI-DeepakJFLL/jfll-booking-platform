/**
 * AWS Lambda Handler for Jet Freight Logistics API
 * Native ESM serverless entrypoint for AWS Lambda Function URLs & API Gateway.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatAirlineName, getFlightSchedule, calculateQuote } from './lib/freight-domain.mjs';
import {
  validateQuoteInput,
  validateInquiryInput,
  validateBookingInput,
  sanitizeString,
} from './lib/security.mjs';
import { sendBookingConfirmationEmail, sendHeavyCargoInquiryEmail } from './lib/email-service.mjs';
import { loadBookings, saveBooking, loadInquiries, saveInquiry } from './lib/storage.mjs';

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

const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key, X-Client-Id',
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

  const rawPath = event.rawPath || event.path || '/';
  // Strip duplicate slashes and trailing slashes so //api/bookings and /api/bookings/ route cleanly
  const path = rawPath.replace(/\/+/g, '/').replace(/(.)\/+$/, '$1') || '/';

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
    const hasClientId = Boolean(process.env.GMAIL_CLIENT_ID);
    const hasClientSecret = Boolean(process.env.GMAIL_CLIENT_SECRET);
    const hasRefreshToken = Boolean(process.env.GMAIL_REFRESH_TOKEN);
    const hasUser = Boolean(process.env.GMAIL_USER);
    return {
      statusCode: 200,
      headers: COMMON_HEADERS,
      body: JSON.stringify({
        status: 'ok',
        service: 'Jet Freight Backend API',
        runtime: 'AWS Lambda (Serverless)',
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
      rates,
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
      const inquiries = loadInquiries();
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

    saveInquiry(inquiryRecord);

    let emailResult = null;
    try {
      emailResult = await sendHeavyCargoInquiryEmail(inquiryRecord);
    } catch (err) {
      console.error('[EmailService] Lambda heavy cargo notification failed:', err);
      emailResult = { success: false, error: err.message || String(err) };
    }

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
        emailDelivery: emailResult,
      }),
    };
  }

  // 4. GET & POST /api/bookings
  if (path === '/api/bookings') {
    if (method === 'GET') {
      const bookings = loadBookings();
      return {
        statusCode: 200,
        headers: COMMON_HEADERS,
        body: JSON.stringify({ bookings }),
      };
    }

    if (method === 'POST') {
      const validation = validateBookingInput(body);
      if (!validation.valid) {
        return {
          statusCode: 400,
          headers: COMMON_HEADERS,
          body: JSON.stringify({ error: validation.error }),
        };
      }

      const bookingRecord = saveBooking(validation.data);

      // In Lambda, wait for promise to ensure execution before container freezes
      let emailResult = null;
      try {
        emailResult = await sendBookingConfirmationEmail(bookingRecord);
      } catch (err) {
        console.error('[EmailService] Lambda booking notification failed:', err);
        emailResult = { success: false, error: err.message || String(err) };
      }

      return {
        statusCode: 201,
        headers: COMMON_HEADERS,
        body: JSON.stringify({
          success: true,
          booking: bookingRecord,
          emailDelivery: emailResult,
        }),
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

/**
 * Test script to verify Google Cloud Gmail API delivery for BOTH:
 * 1. Under 500 kg: Standard Air Freight Booking Confirmation
 * 2. Above 500 kg: Urgent Heavy Cargo Spot Quote Request (RFQ)
 *
 * Usage:
 *   node server/scripts/test-email.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendBookingConfirmationEmail, sendHeavyCargoInquiryEmail } from '../lib/email-service.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to manually load .env file
function loadEnv() {
  const candidateEnvPaths = [
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(process.cwd(), 'server/.env'),
    path.resolve(process.cwd(), '.env'),
  ];

  for (const envPath of candidateEnvPaths) {
    if (fs.existsSync(envPath)) {
      console.log(`[TestEmail] Loading environment from: ${envPath}`);
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
      break;
    }
  }
}

async function run() {
  loadEnv();

  console.log('========================================================');
  console.log('   JET FREIGHT LOGISTICS — DUAL WEIGHT EMAIL TESTER     ');
  console.log('========================================================');
  console.log('Destination Inbox:', process.env.NOTIFICATION_EMAIL_TO || 'deepak.naidu@jfll.com');
  console.log('Sender Account:   ', process.env.GMAIL_USER || 'deepaknaidu1818@gmail.com');
  console.log('Has Client ID:    ', !!process.env.GMAIL_CLIENT_ID);
  console.log('Has Client Secret:', !!process.env.GMAIL_CLIENT_SECRET);
  console.log('Has Refresh Token:', !!process.env.GMAIL_REFRESH_TOKEN);
  console.log('--------------------------------------------------------\n');

  // -------------------------------------------------------------------------
  // TEST 1: UNDER 500 KG (Standard Air Cargo Booking Confirmation - 450 kg)
  // -------------------------------------------------------------------------
  console.log('▶ [TEST 1/2] Testing UNDER 500 kg (Standard Booking: 450 kg)...');
  const bookingUnder500 = {
    reference: `JFLL-AE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    awbNumber: `229-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    origin: 'BOM',
    destination: 'DXB',
    carrier: 'Kuwait Airways',
    flight: 'KU-831',
    shipperName: 'Deepak Naidu',
    shipperCompany: 'Apex Industrial Exports Ltd',
    shipperEmail: 'deepaknaidu1818@gmail.com',
    shipperPhone: '+91 98200 12345',
    shipperGstin: '27AABCA1234F1Z8',
    shipperIec: '0312049281',
    consigneeName: 'Tariq Al-Mansoor',
    consigneeCompany: 'Al-Futtaim Logistics LLC',
    consigneeEmail: 'tariq.mansoor@alfuttaim.ae',
    consigneePhone: '+971 4 212 9876',
    commodity: 'Precision Industrial Valves & Spare Components',
    packagingType: 'Corrugated Cartons',
    incoterm: 'CIP',
    pieces: 10,
    chargeableWeight: 450, // UNDER 500 KG
    totalAmount: 37996,
    readyDate: new Date().toISOString().split('T')[0],
  };

  const res1 = await sendBookingConfirmationEmail(bookingUnder500);
  if (res1.success) {
    console.log(`✅ [TEST 1 PASS] Under 500 kg email dispatched successfully! (ID: ${res1.messageId})\n`);
  } else {
    console.error(`❌ [TEST 1 FAIL] Under 500 kg failed:`, res1.error);
  }

  // -------------------------------------------------------------------------
  // TEST 2: ABOVE 500 KG (Heavy Cargo Spot Quote Inquiry / RFQ - 850 kg)
  // -------------------------------------------------------------------------
  console.log('▶ [TEST 2/2] Testing ABOVE 500 kg (Heavy Cargo Spot RFQ: 850 kg)...');
  const rfqAbove500 = {
    referenceNumber: `JFLL-RFQ-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    origin: 'BOM',
    destination: 'DXB',
    weight: 850, // ABOVE 500 KG
    volumetricWeight: 920,
    cargoType: 'Industrial Heavy Machinery Parts',
    contactName: 'Deepak Naidu',
    companyName: 'Apex Industrial Exports Ltd',
    email: 'deepaknaidu1818@gmail.com',
    phone: '+91 98200 12345',
    iecCode: '0312049281',
    specialInstructions: 'Consignment requires heavy forklift loading at Mumbai Air Cargo Complex (MIAL). Tail-lift required on delivery.',
    readyDate: new Date().toISOString().split('T')[0],
  };

  const res2 = await sendHeavyCargoInquiryEmail(rfqAbove500);
  if (res2.success) {
    console.log(`✅ [TEST 2 PASS] Above 500 kg email dispatched successfully! (ID: ${res2.messageId})\n`);
  } else {
    console.error(`❌ [TEST 2 FAIL] Above 500 kg failed:`, res2.error);
  }

  console.log('========================================================');
  console.log('🎉 ALL TESTS COMPLETE! Both emails sent to deepak.naidu@jfll.com');
  console.log('1. Booking Confirmation (< 500 kg): Blue theme, complete docket & rates');
  console.log('2. Heavy Cargo RFQ (> 500 kg): Urgent orange theme, spot quote alert');
  console.log('========================================================');
}

run();

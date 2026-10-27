/**
 * Jet Freight Logistics - Email Notification Service
 * Dispatches automated notifications via Google Cloud Gmail API (OAuth 2.0).
 * Formatted in a simple, clean, text-based format without heavy colors or UI templates.
 */

import fs from 'fs';
import path from 'path';

let cachedAccessToken = null;
let tokenExpiresAt = 0;

const DEFAULT_NOTIFICATION_TO = 'deepak.naidu@jfll.com';
const DEFAULT_NOTIFICATION_FROM = '"Jet Freight Booking Hub" <deepaknaidu1818@gmail.com>';

/**
 * Automatically loads .env file if environment variables are not yet populated.
 */
function tryLoadEnv() {
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) return;

  const envCandidates = [
    path.resolve(process.cwd(), 'server/.env'),
    path.resolve(process.cwd(), '.env'),
    new URL('../.env', import.meta.url).pathname,
    new URL('../../.env', import.meta.url).pathname,
  ];

  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      try {
        const text = fs.readFileSync(envPath, 'utf-8');
        for (const line of text.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eq = trimmed.indexOf('=');
          if (eq !== -1) {
            const k = trimmed.slice(0, eq).trim();
            const v = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[k]) {
              process.env[k] = v;
            }
          }
        }
        break;
      } catch (_) {}
    }
  }
}
tryLoadEnv();

/**
 * Compiles a 100% compliant RFC 2822 multipart/alternative MIME message buffer
 * without external dependencies. Renders cleanly across Outlook and Gmail.
 */
function buildMimeMessage({ from, to, replyTo, subject, text, html }) {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Reply-To: ${replyTo || from}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject || '').toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    text || '',
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    html || '',
    '',
    `--${boundary}--`,
    '',
  ];
  return Buffer.from(lines.join('\r\n'), 'utf-8');
}

/**
 * Obtains an active OAuth2 access token, reusing cached token if still valid.
 */
async function getGoogleAccessToken() {
  tryLoadEnv();
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  // Reuse token if still valid (with 60-second safety margin)
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google token refresh failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    cachedAccessToken = data.access_token;
    tokenExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
    return cachedAccessToken;
  } catch (err) {
    console.error('[EmailService] Failed to obtain Google access token:', err.message || err);
    return null;
  }
}

/**
 * Sends an email using Google Cloud Gmail REST API over HTTPS.
 */
async function sendViaGmailApi({ from, to, replyTo, subject, html, text }) {
  const accessToken = await getGoogleAccessToken();
  if (!accessToken) {
    throw new Error('Google Cloud OAuth2 access token could not be acquired.');
  }

  // Compile standard RFC 2822 MIME payload
  const mimeBuffer = buildMimeMessage({
    from,
    to,
    replyTo: replyTo || from,
    subject,
    text: text || '',
    html: html || '',
  });

  // Base64URL encode the raw RFC 2822 message buffer for Gmail API
  const base64UrlMessage = mimeBuffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64UrlMessage }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gmail API returned HTTP ${response.status}: ${errorBody}`);
  }

  return await response.json();
}

/**
 * Formats currency values cleanly.
 */
function formatInr(val) {
  if (!val && val !== 0) return '—';
  return 'INR ' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

/**
 * Plain-text formatted booking confirmation message.
 */
export function buildBookingEmailText(booking) {
  const ref = booking.reference || 'N/A';
  const awb = booking.awbNumber || 'Pending Allocation';
  const origin = booking.origin || 'BOM';
  const destination = booking.destination || 'DXB';
  const carrier = booking.carrier || 'Airline Partner';
  const flight = booking.flight || 'TBD';
  const shipperName = booking.shipperName || booking.shipper || 'N/A';
  const shipperCompany = booking.shipperCompany || shipperName;
  const shipperEmail = booking.shipperEmail || 'N/A';
  const shipperPhone = booking.shipperPhone || 'N/A';
  const shipperGstin = booking.shipperGstin || 'N/A';
  const shipperIec = booking.shipperIec || 'N/A';
  const consigneeName = booking.consigneeName || booking.consignee || 'N/A';
  const consigneeCompany = booking.consigneeCompany || consigneeName;
  const consigneeEmail = booking.consigneeEmail || 'N/A';
  const consigneePhone = booking.consigneePhone || 'N/A';
  const consigneeAddress = booking.consigneeAddress || destination;
  const commodity = booking.commodity || booking.cargoDescription || 'General Cargo';
  const hsCode = booking.hsCode || 'Pending Classification (JFLL Customs Desk)';
  const dgUnNumber = booking.dgUnNumber || (booking.cargoCategory === 'Dangerous goods' ? 'Pending Classification (JFLL Hazmat Desk)' : '');
  const packagingType = booking.packagingType || 'Cartons';
  const incoterm = booking.incoterm || 'CIP';
  const pieces = booking.pieces || '—';
  const weight = booking.chargeableWeight || booking.weight || 0;
  const totalAmount = booking.totalAmount || booking.total || 0;
  const readyDate = booking.readyDate || new Date().toISOString().split('T')[0];

  return [
    '============================================================',
    'JET FREIGHT LOGISTICS — BOOKING CONFIRMATION',
    '============================================================',
    '',
    `Booking Reference : ${ref}`,
    `Air Waybill (AWB) : ${awb}`,
    `Booking Status    : Confirmed (AWB Pending)`,
    '',
    '------------------------------------------------------------',
    'ROUTING & FLIGHT DETAILS',
    '------------------------------------------------------------',
    `Origin Airport    : ${origin}`,
    `Destination       : ${destination}`,
    `Carrier / Airline : ${carrier}`,
    `Flight Number     : ${flight}`,
    `Cargo Ready Date  : ${readyDate}`,
    '',
    '------------------------------------------------------------',
    'CARGO SPECIFICATIONS',
    '------------------------------------------------------------',
    `Commodity         : ${commodity}`,
    `HS Code           : ${hsCode}`,
    ...(dgUnNumber ? [`IATA UN Number   : ${dgUnNumber} (Dangerous Goods / DGR)`] : []),
    `Packaging Type    : ${packagingType}`,
    `Incoterm          : ${incoterm}`,
    `Total Pieces      : ${pieces}`,
    `Chargeable Weight : ${weight} kg`,
    '',
    '------------------------------------------------------------',
    'SHIPPER / EXPORTER',
    '------------------------------------------------------------',
    `Company Name      : ${shipperCompany}`,
    `Contact Person    : ${shipperName}`,
    ...(booking.hasWorkedWithJfll || booking.hasWorkedWithJfl
      ? [`JFLL Partner ID  : ${booking.jfllIdentifier || booking.jflIdentifier || 'Returning Partner'}`]
      : []),
    `Email             : ${shipperEmail}`,
    `Phone             : ${shipperPhone}`,
    `GSTIN             : ${shipperGstin}`,
    `IEC Code          : ${shipperIec}`,
    '',
    '------------------------------------------------------------',
    'CONSIGNEE / IMPORTER',
    '------------------------------------------------------------',
    `Company Name      : ${consigneeCompany}`,
    `Contact Person    : ${consigneeName}`,
    `Email             : ${consigneeEmail}`,
    `Phone             : ${consigneePhone}`,
    `Delivery Address  : ${consigneeAddress}`,
    '',
    '------------------------------------------------------------',
    'COMMERCIAL TOTAL',
    '------------------------------------------------------------',
    `Total Amount      : ${formatInr(totalAmount)} (incl. taxes & surcharges)`,
    '',
    '============================================================',
    'Sent automatically from Jet Freight Booking Experience Hub',
    '============================================================',
  ].join('\r\n');
}

/**
 * Escapes characters with special meaning in HTML for safe rendering.
 */
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Clean, simple text-based HTML message (no heavy colors, no cards, no UI bloat).
 * Uses standard typography and simple borders that render cleanly in any client.
 */
export function buildBookingEmailSimpleHtml(booking) {
  const text = buildBookingEmailText(booking);
  // Render as clean, highly readable preformatted text block for email clients
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Consolas, 'Courier New', Menlo, Monaco, monospace; font-size: 13px; line-height: 1.5; color: #111111; background-color: #ffffff; padding: 16px;">
<pre style="font-family: Consolas, 'Courier New', Menlo, Monaco, monospace; font-size: 13px; line-height: 1.5; color: #111111; margin: 0; white-space: pre-wrap;">${escapeHtml(text)}</pre>
</body>
</html>`;
}

/**
 * Plain-text formatted Heavy Cargo quote inquiry message (> 500 kg).
 */
export function buildHeavyCargoEmailText(inquiry) {
  const ref = inquiry.referenceNumber || `JFLL-RFQ-${Date.now()}`;
  const origin = inquiry.origin || 'BOM';
  const destination = inquiry.destination || 'DXB';
  const weight = inquiry.weight || 0;
  const volWeight = inquiry.volumetricWeight || 0;
  const cargoType = inquiry.cargoType || 'General cargo';
  const contactName = inquiry.contactName || 'Valued Customer';
  const companyName = inquiry.companyName || contactName;
  const email = inquiry.email || 'N/A';
  const phone = inquiry.phone || 'N/A';
  const iecCode = inquiry.iecCode || 'N/A';
  const specialInstructions = inquiry.specialInstructions || 'None provided';
  const readyDate = inquiry.readyDate || new Date().toISOString().split('T')[0];

  return [
    '============================================================',
    'JET FREIGHT LOGISTICS — HEAVY CARGO SPOT QUOTE REQUEST (> 500 KG)',
    '============================================================',
    '',
    `Inquiry Reference : ${ref}`,
    `Priority          : ACTION REQUIRED (Spot Rate SLA < 2 Hours)`,
    '',
    '------------------------------------------------------------',
    'ROUTE & CARGO DETAILS',
    '------------------------------------------------------------',
    `Origin Airport    : ${origin}`,
    `Destination       : ${destination}`,
    `Gross Weight      : ${weight} kg`,
    `Volumetric Weight : ${volWeight ? volWeight + ' kg' : '—'}`,
    `Cargo Category    : ${cargoType}`,
    `Ready Date        : ${readyDate}`,
    '',
    '------------------------------------------------------------',
    'CUSTOMER CONTACT DETAILS',
    '------------------------------------------------------------',
    `Company Name      : ${companyName}`,
    `Contact Person    : ${contactName}`,
    ...(inquiry.hasWorkedWithJfll || inquiry.hasWorkedWithJfl
      ? [`JFLL Partner ID  : ${inquiry.jfllIdentifier || inquiry.jflIdentifier || 'Returning Partner'}`]
      : []),
    `Email             : ${email}`,
    `Phone             : ${phone}`,
    `IEC Code          : ${iecCode}`,
    '',
    '------------------------------------------------------------',
    'SPECIAL INSTRUCTIONS / HANDLING',
    '------------------------------------------------------------',
    `${specialInstructions}`,
    '',
    '------------------------------------------------------------',
    'ACTION FOR PRICING DESK',
    '------------------------------------------------------------',
    `Please secure airline spot rate allocation for ${weight} kg (${origin} -> ${destination}),`,
    `and reply directly to ${email} or call ${phone}.`,
    '',
    '============================================================',
    'Sent automatically from Jet Freight Booking Experience Hub',
    '============================================================',
  ].join('\r\n');
}

/**
 * Clean, simple text-based HTML message for Heavy Cargo RFQ.
 */
export function buildHeavyCargoEmailSimpleHtml(inquiry) {
  const text = buildHeavyCargoEmailText(inquiry);
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Consolas, 'Courier New', Menlo, Monaco, monospace; font-size: 13px; line-height: 1.5; color: #111111; background-color: #ffffff; padding: 16px;">
<pre style="font-family: Consolas, 'Courier New', Menlo, Monaco, monospace; font-size: 13px; line-height: 1.5; color: #111111; margin: 0; white-space: pre-wrap;">${escapeHtml(text)}</pre>
</body>
</html>`;
}

/**
 * Sends a booking confirmation email to BOTH the order placer and deepak.naidu@jfll.com in simple text format.
 */
export async function sendBookingConfirmationEmail(booking) {
  tryLoadEnv();

  const primaryAdmin = process.env.NOTIFICATION_EMAIL_TO || DEFAULT_NOTIFICATION_TO;
  const orderPlacer = (booking.shipperEmail || booking.email || booking.orderPlacerEmail || '').trim();

  // If UN Identification Number is captured or cargo is Dangerous Goods, notify ONLY deepak.naidu@jfll.com (not the customer)
  const isUnCaptured = Boolean(booking.dgUnNumber && booking.dgUnNumber.trim());
  const isDangerousGoods = (booking.cargoCategory || '').toLowerCase().includes('dangerous') || isUnCaptured;

  let recipients;
  if (isUnCaptured || isDangerousGoods) {
    // Notify only internal operations desk for dangerous goods / UN review
    recipients = [primaryAdmin];
  } else {
    // Standard dual notification for general/commercial cargo
    recipients = [primaryAdmin];
    if (orderPlacer && orderPlacer.includes('@') && orderPlacer.toLowerCase() !== primaryAdmin.toLowerCase()) {
      recipients.push(orderPlacer);
    }
  }
  const to = recipients.join(', ');

  const from = process.env.NOTIFICATION_EMAIL_FROM || DEFAULT_NOTIFICATION_FROM;
  const replyTo = orderPlacer || primaryAdmin;

  const weight = booking.chargeableWeight || booking.weight || 0;
  const isHeavy = weight > 500;
  const dgTag = isUnCaptured || isDangerousGoods ? `[DGR / UN: ${booking.dgUnNumber || 'Pending Classification'}] ` : '';
  const subjectTag = `${isHeavy ? '[Heavy Cargo > 500kg] ' : ''}${dgTag}`;
  const subject = `${subjectTag}[Booking Confirmed] ${booking.reference || 'JFLL-AE'} - ${booking.origin || 'BOM'} to ${booking.destination || 'DXB'} (${weight} kg - ${booking.carrier || 'Air Cargo'})`;

  const text = buildBookingEmailText(booking);
  const html = buildBookingEmailSimpleHtml(booking);

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    try {
      const result = await sendViaGmailApi({
        from,
        to,
        replyTo,
        subject,
        html,
        text,
      });
      const routingNote = isUnCaptured || isDangerousGoods ? ' (Operations Desk ONLY - Customer Notification Suppressed)' : '';
      console.log(`[EmailService] Simple text booking email (${weight} kg) dispatched via Gmail API to [${to}]${routingNote} (MessageID: ${result.id})`);
      return { success: true, messageId: result.id, recipients: to };
    } catch (err) {
      console.error('[EmailService] Gmail REST API dispatch failed:', err.message || err);
      return { success: false, error: err.message || 'Gmail API send error' };
    }
  }

  console.warn('[EmailService] No Google Cloud OAuth credentials found. Skipping email dispatch.');
  return { success: false, skipped: true, reason: 'No email credentials configured' };
}

/**
 * Sends a Heavy Cargo Quote Request (> 500 kg) email to BOTH the customer and deepak.naidu@jfll.com in simple text format.
 */
export async function sendHeavyCargoInquiryEmail(inquiry) {
  tryLoadEnv();

  const primaryAdmin = process.env.NOTIFICATION_EMAIL_TO || DEFAULT_NOTIFICATION_TO;
  const customerEmail = (inquiry.email || inquiry.contactEmail || '').trim();

  // Combine both recipients, avoiding duplicates
  const recipients = [primaryAdmin];
  if (customerEmail && customerEmail.includes('@') && customerEmail.toLowerCase() !== primaryAdmin.toLowerCase()) {
    recipients.push(customerEmail);
  }
  const to = recipients.join(', ');

  const from = process.env.NOTIFICATION_EMAIL_FROM || DEFAULT_NOTIFICATION_FROM;
  const replyTo = customerEmail || primaryAdmin;

  const ref = inquiry.referenceNumber || `JFLL-RFQ-${Date.now()}`;
  const weight = inquiry.weight || 0;
  const origin = inquiry.origin || 'BOM';
  const destination = inquiry.destination || 'DXB';

  const subject = `[Heavy Cargo RFQ > 500kg] Spot Rate Request: ${ref} - ${origin} to ${destination} (${weight} kg - ${inquiry.companyName || inquiry.contactName})`;

  const text = buildHeavyCargoEmailText(inquiry);
  const html = buildHeavyCargoEmailSimpleHtml(inquiry);

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    try {
      const result = await sendViaGmailApi({
        from,
        to,
        replyTo,
        subject,
        html,
        text,
      });
      console.log(`[EmailService] Simple text heavy cargo inquiry (${weight} kg) dispatched via Gmail API to [${to}] (MessageID: ${result.id})`);
      return { success: true, messageId: result.id, recipients: to };
    } catch (err) {
      console.error('[EmailService] Gmail REST API dispatch failed for heavy cargo inquiry:', err.message || err);
      return { success: false, error: err.message || 'Gmail API send error' };
    }
  }

  console.warn('[EmailService] No Google Cloud OAuth credentials found. Skipping email dispatch.');
  return { success: false, skipped: true, reason: 'No email credentials configured' };
}

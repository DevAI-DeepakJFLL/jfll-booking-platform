import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateQuoteInput,
  validateInquiryInput,
  validateBookingInput,
} from '../lib/security.mjs';

test('validateQuoteInput validates airport codes and weight boundaries', () => {
  // Valid payload
  const valid = validateQuoteInput({
    origin: 'BOM',
    destination: 'DXB',
    actualWeight: 100,
    cargoType: 'General cargo',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.data.origin, 'BOM');
  assert.equal(valid.data.destination, 'DXB');
  assert.equal(valid.data.actualWeight, 100);

  // Invalid IATA origin
  const invalidOrigin = validateQuoteInput({
    origin: 'BOMBAY',
    destination: 'DXB',
    actualWeight: 100,
  });
  assert.equal(invalidOrigin.valid, false);
  assert.match(invalidOrigin.error, /3-letter IATA/);

  // Same origin and destination
  const sameRoute = validateQuoteInput({
    origin: 'BOM',
    destination: 'BOM',
    actualWeight: 100,
  });
  assert.equal(sameRoute.valid, false);
  assert.match(sameRoute.error, /cannot be identical/);

  // Negative weight
  const negWeight = validateQuoteInput({
    origin: 'BOM',
    destination: 'DXB',
    actualWeight: -5,
  });
  assert.equal(negWeight.valid, false);
  assert.match(negWeight.error, /positive number/);

  // Over max weight capacity
  const overWeight = validateQuoteInput({
    origin: 'BOM',
    destination: 'DXB',
    actualWeight: 60000,
  });
  assert.equal(overWeight.valid, false);
  assert.match(overWeight.error, /maximum allowable/);
});

test('validateInquiryInput enforces contact information and weight requirements', () => {
  // Valid inquiry
  const valid = validateInquiryInput({
    origin: 'BOM',
    destination: 'LHR',
    weight: 1500,
    companyName: 'Acme Global Exports',
    contactPerson: 'Deepak Naidu',
    email: 'deepak.naidu@jfll.com',
    phone: '+91 98200 12345',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.data.origin, 'BOM');
  assert.equal(valid.data.destination, 'LHR');
  assert.equal(valid.data.weight, 1500);

  // Missing email
  const missingEmail = validateInquiryInput({
    origin: 'BOM',
    destination: 'LHR',
    weight: 1500,
    companyName: 'Acme Global',
    contactPerson: 'Deepak Naidu',
    phone: '+91 98200 12345',
    email: 'not-an-email',
  });
  assert.equal(missingEmail.valid, false);
  assert.match(missingEmail.error, /email address/i);

  // Missing company name
  const missingCompany = validateInquiryInput({
    origin: 'BOM',
    destination: 'LHR',
    weight: 1500,
    contactPerson: 'Deepak Naidu',
    phone: '+91 98200 12345',
    email: 'test@example.com',
  });
  assert.equal(missingCompany.valid, false);
  assert.match(missingCompany.error, /company/i);
});

test('validateBookingInput rejects incomplete or malformed booking requests', () => {
  // Empty payload
  const empty = validateBookingInput({});
  assert.equal(empty.valid, false);

  // Missing shipper/consignee
  const noContacts = validateBookingInput({
    origin: 'BOM',
    destination: 'DXB',
    chargeableWeight: 200,
    totalAmount: 35000,
  });
  assert.equal(noContacts.valid, false);
  assert.match(noContacts.error, /Shipper/);

  // Valid complete booking
  const complete = validateBookingInput({
    origin: 'BOM',
    destination: 'DXB',
    chargeableWeight: 200,
    totalAmount: 35000,
    shipperName: 'Jet Freight Shipper Pvt Ltd',
    consigneeName: 'Gulf Air Consignee LLC',
    carrier: 'Emirates SkyCargo',
    flight: 'EK-501',
  });
  assert.equal(complete.valid, true);
  assert.equal(complete.data.origin, 'BOM');
  assert.equal(complete.data.destination, 'DXB');
  assert.equal(complete.data.chargeableWeight, 200);
  assert.equal(complete.data.totalAmount, 35000);
  assert.equal(complete.data.shipper, 'Jet Freight Shipper Pvt Ltd');
  assert.equal(complete.data.consignee, 'Gulf Air Consignee LLC');
  assert.equal(complete.data.status, 'Booking Confirmed - AWB pending');
});

test('sanitizeString strips control characters and HTML tags', async () => {
  const { sanitizeString } = await import('../lib/security.mjs');
  const dirty = '<script>alert("XSS")</script>Normal\u0000Text';
  const clean = sanitizeString(dirty);
  assert.equal(clean.includes('<'), false);
  assert.equal(clean.includes('>'), false);
  assert.equal(clean.includes('\u0000'), false);
  assert.equal(clean, 'scriptalert("XSS")/scriptNormalText');
});

test('buildBookingEmailSimpleHtml escapes HTML entities for defense-in-depth', async () => {
  const { buildBookingEmailSimpleHtml } = await import('../lib/email-service.mjs');
  const html = buildBookingEmailSimpleHtml({
    reference: 'TEST-REF & <SPECIAL>',
    shipperName: 'Shipper & Sons <Pvt> Ltd',
    consigneeName: 'Consignee "Global"',
  });

  assert.equal(html.includes('&amp;'), true);
  assert.equal(html.includes('&lt;'), true);
  assert.equal(html.includes('&gt;'), true);
  assert.equal(html.includes('<SPECIAL>'), false);
});

test('validateBookingInput preserves hasWorkedWithJfll and jfllIdentifier partner info', () => {
  const result = validateBookingInput({
    origin: 'BOM',
    destination: 'DXB',
    chargeableWeight: 150,
    totalAmount: 25000,
    shipperName: 'Partner Shipper Ltd',
    consigneeName: 'Global Receiver LLC',
    carrier: 'Emirates SkyCargo',
    hasWorkedWithJfll: true,
    jfllIdentifier: 'JFLL-MUM-8921',
  });

  assert.equal(result.valid, true);
  assert.equal(result.data.hasWorkedWithJfll, true);
  assert.equal(result.data.jfllIdentifier, 'JFLL-MUM-8921');
});

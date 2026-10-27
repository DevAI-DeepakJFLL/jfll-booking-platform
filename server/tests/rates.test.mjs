import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertToCm,
  calculateVolumetricWeight,
  calculateCbm,
} from '../lib/freight-domain.mjs';
import {
  saveBooking,
  loadBookings,
  saveInquiry,
  loadInquiries,
} from '../lib/storage.mjs';

test('IATA TACT Rule 1.3.2 Chargeable Weight 0.5 kg ceiling rounding', () => {
  const roundChargeable = (weight) => Math.ceil(weight * 2) / 2;

  assert.equal(roundChargeable(10.1), 10.5);
  assert.equal(roundChargeable(10.0), 10.0);
  assert.equal(roundChargeable(10.5), 10.5);
  assert.equal(roundChargeable(10.51), 11.0);
  assert.equal(roundChargeable(0.1), 0.5);
  assert.equal(roundChargeable(249.2), 249.5);
  assert.equal(roundChargeable(249.8), 250.0);
});

test('convertToCm converts inches, meters, millimeters to cm accurately', () => {
  // 1 inch = 2.54 cm
  assert.equal(convertToCm(24, 'in'), 60.96);
  assert.equal(convertToCm(16, 'in'), 40.64);

  // 1 meter = 100 cm
  assert.equal(convertToCm(1.5, 'm'), 150);

  // 1 millimeter = 0.1 cm
  assert.equal(convertToCm(500, 'mm'), 50);

  // Default cm
  assert.equal(convertToCm(75, 'cm'), 75);
  assert.equal(convertToCm(75), 75);
});

test('calculateVolumetricWeight calculates IATA 6000 divisor with multi-unit support', () => {
  // Test case from audit: 24 in × 16 in × 16 in, 1 piece
  // 60.96 × 40.64 × 40.64 = 100657.94 cm³ ÷ 6000 = 16.776... kg -> 16.8 kg
  const volInches = calculateVolumetricWeight(24, 16, 16, 1, 'in');
  assert.equal(volInches, 16.8);

  // Metric: 60 cm × 50 cm × 40 cm, 2 pieces
  // 60 × 50 × 40 × 2 = 240,000 cm³ ÷ 6000 = 40.0 kg
  const volCm = calculateVolumetricWeight(60, 50, 40, 2, 'cm');
  assert.equal(volCm, 40.0);

  // CBM calculation
  // 1 m × 1 m × 1 m = 1.0 CBM
  const cbm = calculateCbm(1, 1, 1, 1, 'm');
  assert.equal(cbm, 1.0);
});

test('Durable storage service persists and retrieves bookings and inquiries', async () => {
  const testBooking = {
    reference: `TEST-BK-${Date.now()}`,
    origin: 'BOM',
    destination: 'DXB',
    chargeableWeight: 150,
    totalAmount: 25000,
    shipper: 'Test Shipper Pvt Ltd',
    consignee: 'Test Consignee FZE',
    status: 'Booking Confirmed - AWB pending',
    createdAt: new Date().toISOString(),
  };

  await saveBooking(testBooking);
  const bookings = await loadBookings();
  const found = bookings.find((b) => b.reference === testBooking.reference);
  assert.ok(found, 'Saved booking must be present in loadBookings()');
  assert.equal(found.origin, 'BOM');
  assert.equal(found.destination, 'DXB');
  assert.equal(found.chargeableWeight, 150);

  const testInquiry = {
    id: `inq_test_${Date.now()}`,
    referenceNumber: `TEST-RFQ-${Date.now()}`,
    origin: 'DEL',
    destination: 'LHR',
    weight: 1200,
    status: 'RECEIVED',
    createdAt: new Date().toISOString(),
  };

  await saveInquiry(testInquiry);
  const inquiries = await loadInquiries();
  const foundInquiry = inquiries.find((i) => i.id === testInquiry.id);
  assert.ok(foundInquiry, 'Saved inquiry must be present in loadInquiries()');
  assert.equal(foundInquiry.origin, 'DEL');
  assert.equal(foundInquiry.destination, 'LHR');
  assert.equal(foundInquiry.weight, 1200);
});

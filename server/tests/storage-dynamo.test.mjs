import test from 'node:test';
import assert from 'node:assert/strict';
import { saveBooking, loadBookings, saveInquiry, loadInquiries } from '../lib/storage.mjs';

test('Storage handles unconfigured DynamoDB gracefully with zero crash', async () => {
  // Ensure table env vars are empty
  const oldB = process.env.DYNAMODB_TABLE_BOOKINGS;
  delete process.env.DYNAMODB_TABLE_BOOKINGS;

  const testBooking = {
    reference: `TEST-OFFLINE-${Date.now()}`,
    origin: 'BOM',
    destination: 'SIN',
    chargeableWeight: 200,
    totalAmount: 32000,
    shipper: 'Offline Shipper',
    consignee: 'Offline Consignee',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  const saved = await saveBooking(testBooking);
  assert.equal(saved.reference, testBooking.reference);

  const list = await loadBookings();
  assert.ok(Array.isArray(list));
  const found = list.find((b) => b.reference === testBooking.reference);
  assert.ok(found);

  // Restore env
  if (oldB) process.env.DYNAMODB_TABLE_BOOKINGS = oldB;
});

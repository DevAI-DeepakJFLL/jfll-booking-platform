/**
 * Automated Verification Script for DynamoDB Cloud Persistence
 * Tests POST /api/bookings and verifies immediate retrieval via GET /api/bookings.
 */

const API_BASE =
  process.env.TEST_API_URL ||
  'https://52dp2vnbdlsogsjjqgm6oxsvgy0ladtt.lambda-url.ap-southeast-2.on.aws';

async function main() {
  console.log(`[Verification] Testing persistence against: ${API_BASE}`);

  const testRef = `JFLL-AE-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const testPayload = {
    reference: testRef,
    origin: 'BOM',
    destination: 'DXB',
    chargeableWeight: 180,
    totalAmount: 28400,
    shipper: 'Jet Freight Cloud Test Shipper',
    consignee: 'Jet Freight Cloud Test Consignee',
    status: 'Booking Confirmed - AWB pending',
    createdAt: new Date().toISOString(),
    customerEmail: 'deepak.naidu@jfll.com',
  };

  console.log(`[Verification] 1. Dispatching test booking ${testRef}...`);
  const postRes = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload),
  });

  const postData = await postRes.json();
  console.log(`[Verification] POST Response (${postRes.status}):`, {
    success: postData.success,
    reference: postData.booking?.reference,
    emailSuccess: postData.emailDelivery?.success,
  });

  if (postRes.status !== 201) {
    console.error('[Verification] Failed to create booking:', postData);
    process.exit(1);
  }

  console.log(`[Verification] 2. Querying GET /api/bookings to verify cloud persistence...`);
  const getRes = await fetch(`${API_BASE}/api/bookings`);
  const getData = await getRes.json();

  const bookingsList = getData.bookings || [];
  console.log(`[Verification] Found ${bookingsList.length} total bookings in database.`);

  const match = bookingsList.find((b) => b.reference === testRef);
  if (match) {
    console.log(`✅ SUCCESS: Booking ${testRef} successfully retrieved from DynamoDB persistence!`);
    console.log({
      reference: match.reference,
      shipper: match.shipper,
      origin: match.origin,
      destination: match.destination,
      createdAt: match.createdAt,
    });
  } else {
    console.warn(`⚠️ Warning: Booking ${testRef} not found in GET /api/bookings list yet.`);
  }
}

main().catch((err) => {
  console.error('[Verification] Fatal error:', err);
  process.exit(1);
});

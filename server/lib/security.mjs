/**
 * Security & Sanitization Utilities for Jet Freight API
 */

export const MAX_JSON_PAYLOAD_SIZE = 64 * 1024; // 64 KB

/**
 * Applies defense-in-depth HTTP security headers to all responses.
 */
export function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-XSS-Protection', '1; mode=block');
}

/**
 * Safely reads and parses JSON request body with strict byte-size bounding
 * to prevent Denial of Service (OOM/Buffer overflow) attacks.
 */
export function readJsonBody(req, maxSize = MAX_JSON_PAYLOAD_SIZE) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    function onData(chunk) {
      size += chunk.length;
      if (size > maxSize) {
        req.removeListener('data', onData);
        req.removeListener('end', onEnd);
        req.destroy();
        const err = new Error('Payload Too Large: request body exceeds size limit');
        err.statusCode = 413;
        reject(err);
        return;
      }
      chunks.push(chunk);
    }

    function onEnd() {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        if (!raw.trim()) {
          resolve({});
          return;
        }
        const parsed = JSON.parse(raw);
        resolve(parsed);
      } catch (err) {
        const parseErr = new Error('Malformed JSON payload');
        parseErr.statusCode = 400;
        reject(parseErr);
      }
    }

    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', (err) => reject(err));
  });
}

/**
 * Sanitizes generic user-supplied strings, stripping control chars and truncating length.
 */
export function sanitizeString(val, maxLen = 150) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[\u0000-\u001F\u007F-\u009F<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Validates and normalizes Quote inquiry payloads.
 */
export function validateQuoteInput(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object' };
  }

  const rawOrigin = sanitizeString(payload.origin, 10).toUpperCase();
  const rawDest = sanitizeString(payload.destination, 10).toUpperCase();

  // Validate 3-letter IATA airport code format
  if (!/^[A-Z]{3}$/.test(rawOrigin)) {
    return { valid: false, error: 'Origin must be a 3-letter IATA airport code (e.g. BOM)' };
  }
  if (!/^[A-Z]{3}$/.test(rawDest)) {
    return { valid: false, error: 'Destination must be a 3-letter IATA airport code (e.g. DXB)' };
  }
  if (rawOrigin === rawDest) {
    return { valid: false, error: 'Origin and Destination airport codes cannot be identical' };
  }

  const weight = Number(payload.weight ?? payload.actualWeight);
  if (isNaN(weight) || !isFinite(weight) || weight <= 0) {
    return { valid: false, error: 'Weight must be a positive number greater than 0' };
  }
  if (weight > 50000) {
    return { valid: false, error: 'Weight exceeds maximum allowable single shipment capacity (50,000 kg)' };
  }

  let volumetricWeight = Number(payload.volumetricWeight || 0);
  if (isNaN(volumetricWeight) || !isFinite(volumetricWeight) || volumetricWeight < 0) {
    volumetricWeight = 0;
  }
  if (volumetricWeight > 50000) {
    volumetricWeight = 50000;
  }

  const allowedCargoTypes = [
    'General cargo',
    'Express courier',
    'Pharma healthcare',
    'Dangerous goods',
    'Perishables',
  ];
  let cargoType = sanitizeString(payload.cargoType, 50);
  if (!allowedCargoTypes.some(t => t.toLowerCase() === cargoType.toLowerCase())) {
    cargoType = 'General cargo';
  }

  return {
    valid: true,
    data: {
      origin: rawOrigin,
      destination: rawDest,
      weight,
      actualWeight: weight,
      volumetricWeight,
      cargoType,
    },
  };
}

/**
 * Validates and normalizes Heavy Cargo (>500 kg) Inquiry payloads.
 */
export function validateInquiryInput(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object' };
  }

  const rawOrigin = sanitizeString(payload.origin, 10).toUpperCase();
  const rawDest = sanitizeString(payload.destination, 10).toUpperCase();

  if (!/^[A-Z]{3}$/.test(rawOrigin)) {
    return { valid: false, error: 'Origin must be a 3-letter IATA airport code (e.g. BOM)' };
  }
  if (!/^[A-Z]{3}$/.test(rawDest)) {
    return { valid: false, error: 'Destination must be a 3-letter IATA airport code (e.g. DXB)' };
  }
  if (rawOrigin === rawDest) {
    return { valid: false, error: 'Origin and Destination airport codes cannot be identical' };
  }

  const weight = Number(payload.weight ?? payload.actualWeight);
  if (isNaN(weight) || !isFinite(weight) || weight <= 0) {
    return { valid: false, error: 'Shipment weight must be greater than 0 kg' };
  }
  if (weight > 50000) {
    return { valid: false, error: 'Weight exceeds maximum allowable single shipment capacity (50,000 kg)' };
  }

  let volumetricWeight = Number(payload.volumetricWeight || 0);
  if (isNaN(volumetricWeight) || !isFinite(volumetricWeight) || volumetricWeight < 0) {
    volumetricWeight = 0;
  }
  if (volumetricWeight > 50000) {
    volumetricWeight = 50000;
  }

  const contactName = sanitizeString(payload.contactName || payload.contactPerson, 100);
  if (!contactName || contactName.length < 2) {
    return { valid: false, error: 'Contact Name is required (minimum 2 characters)' };
  }

  const companyName = sanitizeString(payload.companyName, 120);
  if (!companyName || companyName.length < 2) {
    return { valid: false, error: 'Company / Organization Name is required' };
  }

  const email = sanitizeString(payload.email, 100).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: 'A valid business email address is required' };
  }

  const phone = sanitizeString(payload.phone, 30);
  const digitsOnly = phone.replace(/\D/g, '');
  if (!phone || digitsOnly.length < 7) {
    return { valid: false, error: 'A valid telephone / mobile number is required (at least 7 digits)' };
  }

  const iecCode = sanitizeString(payload.iecCode, 30);
  const specialInstructions = sanitizeString(payload.specialInstructions, 500);
  const readyDate = sanitizeString(payload.readyDate, 40);

  const allowedCargoTypes = [
    'General cargo',
    'Express courier',
    'Pharma healthcare',
    'Dangerous goods',
    'Perishables',
  ];
  let cargoType = sanitizeString(payload.cargoType, 50);
  if (!allowedCargoTypes.some(t => t.toLowerCase() === cargoType.toLowerCase())) {
    cargoType = 'General cargo';
  }

  return {
    valid: true,
    data: {
      origin: rawOrigin,
      destination: rawDest,
      weight,
      volumetricWeight,
      chargeableWeight: Math.max(weight, volumetricWeight),
      cargoType,
      contactName,
      companyName,
      email,
      phone,
      iecCode,
      specialInstructions,
      readyDate,
    },
  };
}

/**
 * Validates and normalizes Confirmed Booking payloads.
 */
export function validateBookingInput(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object' };
  }

  const rawOrigin = sanitizeString(payload.origin, 10).toUpperCase();
  const rawDest = sanitizeString(payload.destination, 10).toUpperCase();

  if (!/^[A-Z]{3}$/.test(rawOrigin)) {
    return { valid: false, error: 'Origin must be a 3-letter IATA airport code (e.g. BOM)' };
  }
  if (!/^[A-Z]{3}$/.test(rawDest)) {
    return { valid: false, error: 'Destination must be a 3-letter IATA airport code (e.g. DXB)' };
  }
  if (rawOrigin === rawDest) {
    return { valid: false, error: 'Origin and Destination airport codes cannot be identical' };
  }

  const weight = Number(payload.chargeableWeight || payload.weight);
  if (isNaN(weight) || !isFinite(weight) || weight <= 0) {
    return { valid: false, error: 'Chargeable weight must be a positive number greater than 0' };
  }
  if (weight > 50000) {
    return { valid: false, error: 'Weight exceeds maximum allowable single shipment capacity (50,000 kg)' };
  }

  const totalAmount = Number(payload.totalAmount || payload.total);
  if (isNaN(totalAmount) || !isFinite(totalAmount) || totalAmount <= 0) {
    return { valid: false, error: 'Total amount must be a positive number greater than 0' };
  }

  const shipper = sanitizeString(payload.shipperName || payload.shipper || payload.shipperCompany, 120);
  if (!shipper || shipper.length < 2) {
    return { valid: false, error: 'Shipper / Exporter name is required' };
  }

  const consignee = sanitizeString(payload.consigneeName || payload.consignee || payload.consigneeCompany, 120);
  if (!consignee || consignee.length < 2) {
    return { valid: false, error: 'Consignee / Importer name is required' };
  }

  const ref = sanitizeString(payload.reference, 40) || `JFLL-AE-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const awb = sanitizeString(payload.awbNumber, 20) || `176-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    valid: true,
    data: {
      reference: ref,
      awbNumber: awb,
      origin: rawOrigin,
      destination: rawDest,
      carrier: sanitizeString(payload.carrier, 60) || 'Kuwait Airways',
      flight: sanitizeString(payload.flight, 20) || 'KU-831',
      shipper,
      shipperName: sanitizeString(payload.shipperName || payload.shipper, 100) || shipper,
      shipperCompany: sanitizeString(payload.shipperCompany || payload.companyName || shipper, 120),
      shipperEmail: sanitizeString(payload.shipperEmail, 100),
      shipperPhone: sanitizeString(payload.shipperPhone, 30),
      shipperAddress: sanitizeString(payload.shipperAddress, 200),
      shipperGstin: sanitizeString(payload.shipperGstin, 30),
      shipperIec: sanitizeString(payload.shipperIec, 30),
      consignee,
      consigneeName: sanitizeString(payload.consigneeName || payload.consignee, 100) || consignee,
      consigneeCompany: sanitizeString(payload.consigneeCompany || consignee, 120),
      consigneeEmail: sanitizeString(payload.consigneeEmail, 100),
      consigneePhone: sanitizeString(payload.consigneePhone, 30),
      consigneeAddress: sanitizeString(payload.consigneeAddress, 200),
      commodity: sanitizeString(payload.commodity || payload.cargoDescription, 120) || 'Air Freight Cargo',
      hsCode: sanitizeString(payload.hsCode, 40) || 'Pending Classification (JFLL Customs Desk)',
      dgUnNumber: sanitizeString(payload.dgUnNumber, 60) || undefined,
      cargoCategory: sanitizeString(payload.cargoCategory || payload.cargoType, 50) || 'General cargo',
      packagingType: sanitizeString(payload.packagingType, 50) || 'Corrugated Cartons',
      incoterm: sanitizeString(payload.incoterm, 10) || 'CIP',
      pieces: Number(payload.pieces) || 1,
      readyDate: sanitizeString(payload.readyDate, 20) || new Date().toISOString().split('T')[0],
      chargeableWeight: weight,
      totalAmount,
      hasWorkedWithJfll: Boolean(payload.hasWorkedWithJfll ?? payload.hasWorkedWithJfl),
      jfllIdentifier: sanitizeString(payload.jfllIdentifier || payload.jflIdentifier || payload.jflMemberId || payload.jflCompanyName, 100) || undefined,
      hasWorkedWithJfl: Boolean(payload.hasWorkedWithJfll ?? payload.hasWorkedWithJfl),
      jflIdentifier: sanitizeString(payload.jfllIdentifier || payload.jflIdentifier || payload.jflMemberId || payload.jflCompanyName, 100) || undefined,
      status: 'Booking Confirmed - AWB pending',
      createdAt: new Date().toISOString(),
    },
  };
}

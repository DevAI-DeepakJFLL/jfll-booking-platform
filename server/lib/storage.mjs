/**
 * Jet Freight Logistics - Durable Storage Service
 * Provides atomic, persistent JSON storage for bookings and quote inquiries.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure storage directory exists
const candidateStorageDirs = [
  path.resolve(__dirname, '../storage'),
  path.resolve(process.cwd(), 'server/storage'),
  path.resolve(process.cwd(), 'storage'),
];

let storageDir = candidateStorageDirs.find((d) => fs.existsSync(d));
if (!storageDir) {
  storageDir = candidateStorageDirs[0];
  try {
    fs.mkdirSync(storageDir, { recursive: true });
  } catch (err) {
    console.warn('[Storage] Failed to create storage dir:', err.message);
  }
}

const BOOKINGS_FILE = path.join(storageDir, 'bookings.json');
const INQUIRIES_FILE = path.join(storageDir, 'inquiries.json');

/**
 * Loads records from JSON file. Returns empty array if file does not exist or fails.
 */
function readJsonArray(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[Storage] Failed to read ${path.basename(filePath)}:`, err.message);
    return [];
  }
}

/**
 * Atomically writes records to JSON file using a temp file.
 */
function writeJsonArray(filePath, data) {
  try {
    const parent = path.dirname(filePath);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    const tempFile = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, filePath);
  } catch (err) {
    console.error(`[Storage] Failed to atomically write ${path.basename(filePath)}:`, err.message);
  }
}

// In-memory cache for ultra-fast, zero-I/O concurrent reads
let cachedBookings = null;
let cachedInquiries = null;

/**
 * Loads all saved bookings (cached in-memory, refreshed on write or forced).
 */
export function loadBookings(forceRefresh = false) {
  if (cachedBookings === null || forceRefresh) {
    cachedBookings = readJsonArray(BOOKINGS_FILE);
  }
  return cachedBookings;
}

/**
 * Saves a new booking record durably and updates in-memory cache.
 */
export function saveBooking(booking) {
  const current = loadBookings();
  // Insert at front
  current.unshift(booking);
  cachedBookings = current;
  writeJsonArray(BOOKINGS_FILE, current);
  return booking;
}

/**
 * Loads all saved heavy cargo inquiries (cached in-memory, refreshed on write or forced).
 */
export function loadInquiries(forceRefresh = false) {
  if (cachedInquiries === null || forceRefresh) {
    cachedInquiries = readJsonArray(INQUIRIES_FILE);
  }
  return cachedInquiries;
}

/**
 * Saves a new inquiry record durably and updates in-memory cache.
 */
export function saveInquiry(inquiry) {
  const current = loadInquiries();
  current.unshift(inquiry);
  cachedInquiries = current;
  writeJsonArray(INQUIRIES_FILE, current);
  return inquiry;
}

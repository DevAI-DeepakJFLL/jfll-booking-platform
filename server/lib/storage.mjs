/**
 * Jet Freight Logistics - Durable Storage Service
 * Provides cloud persistence via Amazon DynamoDB with seamless local JSON fallback.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure storage directory exists for local fallback
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

// In-memory cache for fast local reads
let cachedBookings = null;
let cachedInquiries = null;

// DynamoDB DocumentClient singleton
let ddbDocClient = null;

async function getDocClient() {
  if (ddbDocClient) return ddbDocClient;
  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-southeast-2',
    });
    ddbDocClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
    return ddbDocClient;
  } catch (err) {
    console.warn('[Storage] DynamoDB SDK not available; using local JSON storage:', err.message);
    return null;
  }
}

/**
 * Synchronous local bookings loader (for offline/sync contexts).
 */
export function loadBookingsSync(forceRefresh = false) {
  if (cachedBookings === null || forceRefresh) {
    cachedBookings = readJsonArray(BOOKINGS_FILE);
  }
  return cachedBookings;
}

/**
 * Loads all saved bookings. Reads from DynamoDB if configured; otherwise reads local file.
 */
export async function loadBookings(forceRefresh = false) {
  const table = process.env.DYNAMODB_TABLE_BOOKINGS;
  if (table) {
    try {
      const client = await getDocClient();
      if (client) {
        const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
        const res = await client.send(new ScanCommand({ TableName: table }));
        const items = res.Items || [];
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        return items;
      }
    } catch (err) {
      console.error('[Storage] DynamoDB loadBookings failed; falling back to local file:', err.message);
    }
  }

  return loadBookingsSync(forceRefresh);
}

/**
 * Saves a new booking record. Persists to DynamoDB if configured; otherwise saves to local file.
 */
export async function saveBooking(booking) {
  const table = process.env.DYNAMODB_TABLE_BOOKINGS;
  if (table) {
    try {
      const client = await getDocClient();
      if (client) {
        const { PutCommand } = await import('@aws-sdk/lib-dynamodb');
        await client.send(
          new PutCommand({
            TableName: table,
            Item: booking,
          })
        );
        return booking;
      }
    } catch (err) {
      console.error('[Storage] DynamoDB saveBooking failed; falling back to local file:', err.message);
    }
  }

  // Fallback to local JSON storage
  const current = loadBookingsSync();
  current.unshift(booking);
  cachedBookings = current;
  writeJsonArray(BOOKINGS_FILE, current);
  return booking;
}

/**
 * Synchronous local inquiries loader (for offline/sync contexts).
 */
export function loadInquiriesSync(forceRefresh = false) {
  if (cachedInquiries === null || forceRefresh) {
    cachedInquiries = readJsonArray(INQUIRIES_FILE);
  }
  return cachedInquiries;
}

/**
 * Loads all saved inquiries. Reads from DynamoDB if configured; otherwise reads local file.
 */
export async function loadInquiries(forceRefresh = false) {
  const table = process.env.DYNAMODB_TABLE_INQUIRIES;
  if (table) {
    try {
      const client = await getDocClient();
      if (client) {
        const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
        const res = await client.send(new ScanCommand({ TableName: table }));
        const items = res.Items || [];
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        return items;
      }
    } catch (err) {
      console.error('[Storage] DynamoDB loadInquiries failed; falling back to local file:', err.message);
    }
  }

  return loadInquiriesSync(forceRefresh);
}

/**
 * Saves a new inquiry record. Persists to DynamoDB if configured; otherwise saves to local file.
 */
export async function saveInquiry(inquiry) {
  const table = process.env.DYNAMODB_TABLE_INQUIRIES;
  if (table) {
    try {
      const client = await getDocClient();
      if (client) {
        const { PutCommand } = await import('@aws-sdk/lib-dynamodb');
        await client.send(
          new PutCommand({
            TableName: table,
            Item: inquiry,
          })
        );
        return inquiry;
      }
    } catch (err) {
      console.error('[Storage] DynamoDB saveInquiry failed; falling back to local file:', err.message);
    }
  }

  // Fallback to local JSON storage
  const current = loadInquiriesSync();
  current.unshift(inquiry);
  cachedInquiries = current;
  writeJsonArray(INQUIRIES_FILE, current);
  return inquiry;
}

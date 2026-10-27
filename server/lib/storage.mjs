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
const isLambda = Boolean(process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME);

let storageDir;
if (isLambda) {
  storageDir = '/tmp/storage';
} else {
  const candidateStorageDirs = [
    path.resolve(__dirname, '../storage'),
    path.resolve(process.cwd(), 'server/storage'),
    path.resolve(process.cwd(), 'storage'),
  ];
  storageDir = candidateStorageDirs.find((d) => fs.existsSync(d)) || candidateStorageDirs[0];
}

try {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
} catch (err) {
  console.warn('[Storage] Failed to create storage dir:', err.message);
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

export const DEFAULT_BOOKINGS_TABLE = 'jfll-bookings';
export const DEFAULT_INQUIRIES_TABLE = 'jfll-inquiries';

/**
 * Loads all saved bookings. Reads from DynamoDB if available; otherwise reads local file.
 */
export async function loadBookings(forceRefresh = false) {
  const table = process.env.DYNAMODB_TABLE_BOOKINGS || DEFAULT_BOOKINGS_TABLE;
  if (table) {
    try {
      const client = await getDocClient();
      if (client) {
        const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
        const res = await client.send(new ScanCommand({ TableName: table, Limit: 50 }));
        const items = res.Items || [];
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        return items;
      }
    } catch (err) {
      console.warn('[Storage] DynamoDB loadBookings failed; falling back to local file:', err.message);
    }
  }

  return loadBookingsSync(forceRefresh);
}

/**
 * Saves a new booking record. Persists to DynamoDB if available; otherwise saves to local file.
 */
export async function saveBooking(booking) {
  const table = process.env.DYNAMODB_TABLE_BOOKINGS || DEFAULT_BOOKINGS_TABLE;
  let dynamoSaved = false;
  let dynamoError = null;

  if (table) {
    try {
      const client = await getDocClient();
      if (client) {
        const { PutCommand } = await import('@aws-sdk/lib-dynamodb');
        const itemToSave = { ...booking };
        delete itemToSave._storage;

        await client.send(
          new PutCommand({
            TableName: table,
            Item: itemToSave,
          })
        );
        dynamoSaved = true;
        console.log(`[Storage] Saved booking ${booking.reference} to DynamoDB table ${table}`);
      } else {
        dynamoError = 'DynamoDB client unavailable';
      }
    } catch (err) {
      console.error('[Storage] DynamoDB saveBooking failed; falling back to local file:', err.message);
      dynamoError = err.message || String(err);
    }
  }

  // Always keep local JSON storage in sync as fallback
  const current = loadBookingsSync();
  current.unshift(booking);
  cachedBookings = current;
  writeJsonArray(BOOKINGS_FILE, current);

  booking._storage = {
    driver: dynamoSaved ? 'dynamodb' : 'local-fallback',
    table,
    success: dynamoSaved,
    error: dynamoError,
  };

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
 * Loads all saved inquiries. Reads from DynamoDB if available; otherwise reads local file.
 */
export async function loadInquiries(forceRefresh = false) {
  const table = process.env.DYNAMODB_TABLE_INQUIRIES || DEFAULT_INQUIRIES_TABLE;
  if (table) {
    try {
      const client = await getDocClient();
      if (client) {
        const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
        const res = await client.send(new ScanCommand({ TableName: table, Limit: 50 }));
        const items = res.Items || [];
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        return items;
      }
    } catch (err) {
      console.warn('[Storage] DynamoDB loadInquiries failed; falling back to local file:', err.message);
    }
  }

  return loadInquiriesSync(forceRefresh);
}

/**
 * Saves a new inquiry record. Persists to DynamoDB if available; otherwise saves to local file.
 */
export async function saveInquiry(inquiry) {
  const table = process.env.DYNAMODB_TABLE_INQUIRIES || DEFAULT_INQUIRIES_TABLE;
  let dynamoSaved = false;
  let dynamoError = null;

  if (table) {
    try {
      const client = await getDocClient();
      if (client) {
        const { PutCommand } = await import('@aws-sdk/lib-dynamodb');
        const itemToSave = { ...inquiry };
        delete itemToSave._storage;

        await client.send(
          new PutCommand({
            TableName: table,
            Item: itemToSave,
          })
        );
        dynamoSaved = true;
        console.log(`[Storage] Saved inquiry ${inquiry.referenceNumber} to DynamoDB table ${table}`);
      } else {
        dynamoError = 'DynamoDB client unavailable';
      }
    } catch (err) {
      console.error('[Storage] DynamoDB saveInquiry failed; falling back to local file:', err.message);
      dynamoError = err.message || String(err);
    }
  }

  // Always keep local JSON storage in sync as fallback
  const current = loadInquiriesSync();
  current.unshift(inquiry);
  cachedInquiries = current;
  writeJsonArray(INQUIRIES_FILE, current);

  inquiry._storage = {
    driver: dynamoSaved ? 'dynamodb' : 'local-fallback',
    table,
    success: dynamoSaved,
    error: dynamoError,
  };

  return inquiry;
}

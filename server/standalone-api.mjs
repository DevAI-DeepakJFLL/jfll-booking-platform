/**
 * Jet Freight Logistics - Core Operations & Rates API Server
 * Modular, secured, production-hardened standalone HTTP service.
 * Proxies incoming HTTP requests into AWS Lambda serverless events for unified logic.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { applySecurityHeaders } from './lib/security.mjs';
import { handler } from './lambda.mjs';

function checkAdminAuth(req) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (process.env.NODE_ENV === 'production' && !adminKey) {
    return { ok: false, status: 503, error: 'Admin endpoint disabled: ADMIN_API_KEY not configured' };
  }

  if (adminKey) {
    const authHeader = req.headers['authorization'] || req.headers['x-admin-key'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token !== adminKey) {
      return { ok: false, status: 401, error: 'Unauthorized: Invalid administrative credentials' };
    }
  }
  return { ok: true };
}

// Locate CSV path for local S3 sync
const candidateCsv = path.resolve('server/data/CONSOLIDATED_AIR_FREIGHT_RATES.csv');
const csvPath = fs.existsSync(candidateCsv) ? candidateCsv : path.resolve('data/CONSOLIDATED_AIR_FREIGHT_RATES.csv');

// HTTP Server configuration
const server = http.createServer(async (req, res) => {
  // Apply defensive HTTP headers & CORS
  applySecurityHeaders(res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key, X-Client-Id, X-Admin-Key');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const [pathname, search] = (req.url || '/').split('?');

  // Admin auth check on /api/admin/export
  if (pathname === '/api/admin/export') {
    const auth = checkAdminAuth(req);
    if (!auth.ok) {
      res.writeHead(auth.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: auth.error }));
      return;
    }
  }

  // POST /api/rates/sync-s3 (Local S3 archive emulator sync)
  if (pathname === '/api/rates/sync-s3') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'POST' });
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }

    const auth = checkAdminAuth(req);
    if (!auth.ok) {
      res.writeHead(auth.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: auth.error }));
      return;
    }

    try {
      const s3res = await fetch('http://localhost:4566/jetfreight-rates-archive/rates/consolidated/latest/CONSOLIDATED_AIR_FREIGHT_RATES.csv', {
        method: 'PUT',
        headers: { 'Content-Type': 'text/csv' },
        body: fs.readFileSync(csvPath),
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        s3Status: s3res.status,
        bucket: 'jetfreight-rates-archive',
        s3Url: 'http://localhost:4566/jetfreight-rates-archive/rates/consolidated/latest/CONSOLIDATED_AIR_FREIGHT_RATES.csv',
      }));
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to synchronize with S3 archive emulator' }));
    }
    return;
  }

  // Transform incoming HTTP (req, res) to AWS Lambda API Gateway / Function URL event
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = chunks.length > 0 ? Buffer.concat(chunks).toString('utf-8') : undefined;

    const queryStringParameters = {};
    if (search) {
      const searchParams = new URLSearchParams(search);
      for (const [key, value] of searchParams.entries()) {
        queryStringParameters[key] = value;
      }
    }

    const headers = {};
    for (const [k, v] of Object.entries(req.headers)) {
      headers[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : v;
    }

    const event = {
      version: '2.0',
      routeKey: `${req.method} ${pathname}`,
      rawPath: pathname,
      rawQueryString: search || '',
      headers,
      queryStringParameters: Object.keys(queryStringParameters).length > 0 ? queryStringParameters : undefined,
      requestContext: {
        http: {
          method: req.method,
          path: pathname,
          protocol: `HTTP/${req.httpVersion}`,
          sourceIp: req.socket.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || '',
        },
      },
      body: rawBody,
      isBase64Encoded: false,
    };

    const result = await handler(event);

    if (result.headers) {
      for (const [key, val] of Object.entries(result.headers)) {
        res.setHeader(key, val);
      }
    }

    res.writeHead(result.statusCode || 200);
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(result.body || '');
    }
  } catch (err) {
    console.error('[StandaloneServer] Handler error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

// Configure server timeouts against slow client attacks
server.setTimeout(15000);
server.headersTimeout = 20000;

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Jet Freight API server running on http://localhost:${PORT}`);
});

export { server };

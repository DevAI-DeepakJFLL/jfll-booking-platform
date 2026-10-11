import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const BUCKET = 'booking-frontend';
const clientOut = path.resolve('client/out');
const BUILD_DIR = clientOut;
const FLOCI_PORT = 4566;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

function sendRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function ensureBucket() {
  await sendRequest({
    host: 'localhost',
    port: FLOCI_PORT,
    path: '/' + BUCKET,
    method: 'PUT'
  });
  const xml = '<WebsiteConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><IndexDocument><Suffix>index.html</Suffix></IndexDocument><ErrorDocument><Key>index.html</Key></ErrorDocument></WebsiteConfiguration>';
  await sendRequest({
    host: 'localhost',
    port: FLOCI_PORT,
    path: '/' + BUCKET + '?website',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/xml',
      'Content-Length': Buffer.byteLength(xml)
    }
  }, xml);
}

function getFiles(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const relKey = base ? base + '/' + file : file;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, relKey));
    } else {
      results.push({ fullPath, key: relKey });
    }
  }
  return results;
}

async function uploadFiles() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.error('Build directory not found! Run "pnpm --filter @workspace/jetfreight-digital build" first.');
    process.exit(1);
  }
  const files = getFiles(BUILD_DIR);
  console.log(`Uploading ${files.length} static assets to Floci S3 bucket "${BUCKET}"...`);

  for (const f of files) {
    const content = fs.readFileSync(f.fullPath);
    const ext = path.extname(f.key).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const res = await sendRequest({
      host: 'localhost',
      port: FLOCI_PORT,
      path: '/' + BUCKET + '/' + f.key,
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': content.length
      }
    }, content);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`  ✓ ${f.key} (${contentType})`);
    } else {
      console.error(`  ✗ ${f.key} failed: HTTP ${res.statusCode}`);
    }
  }
}

async function main() {
  console.log('Connecting to Floci on port ' + FLOCI_PORT + '...');
  await ensureBucket();
  await uploadFiles();
  console.log('\n Successfully deployed to Floci S3!');
  console.log('Access your website at:');
  console.log('  ➜  http://booking-frontend.s3-website.localhost.floci.io:4566/');
}

main().catch(err => {
  console.error('Deployment error:', err.message);
  process.exit(1);
});

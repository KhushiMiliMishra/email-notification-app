/**
 * test-runner.js — Integration test script for the backend stub server.
 *
 * Run with: node test-runner.js
 * (from the backend/ directory, after npm install)
 *
 * Tests all API endpoints and prints results to the console.
 * No test framework required — uses Node's built-in http module.
 */

const http = require('http');
// Start the server in the same process
require('./src/server.js');

const BASE = 'http://localhost:3000';

/** Helper: make an HTTP request and return { status, body } */
function request(method, path, payload) {
  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : undefined;
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

/** Simple assertion helper */
function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    return true;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    return false;
  }
}

async function runTests() {
  // Wait a tick for Express to bind
  await new Promise((r) => setTimeout(r, 300));

  let passed = 0;
  let failed = 0;

  function check(condition, label) {
    if (assert(condition, label)) passed++;
    else failed++;
  }

  console.log('\n========================================');
  console.log('  Email Notification App — API Tests');
  console.log('========================================\n');

  // --- Test 1: Health Check ---
  console.log('TEST 1: GET /api/health');
  const h = await request('GET', '/api/health');
  check(h.status === 200, 'HTTP 200 OK');
  check(h.body.status === 'OK', 'body.status === "OK"');
  check(typeof h.body.message === 'string', 'body.message is a string');
  console.log('  Response:', JSON.stringify(h.body));

  // --- Test 2: Feature Flags ---
  console.log('\nTEST 2: GET /api/feature-flags');
  const ff = await request('GET', '/api/feature-flags');
  check(ff.status === 200, 'HTTP 200 OK');
  check(typeof ff.body.emailNotifications === 'boolean', 'emailNotifications is boolean');
  check(typeof ff.body.welcomeEmails === 'boolean', 'welcomeEmails is boolean');
  check(typeof ff.body.verificationEmails === 'boolean', 'verificationEmails is boolean');
  check(typeof ff.body.promotionalEmails === 'boolean', 'promotionalEmails is boolean');
  check(ff.body.promotionalEmails === false, 'promotionalEmails defaults to false');
  console.log('  Response:', JSON.stringify(ff.body));

  // --- Test 3: Send Email (valid) ---
  console.log('\nTEST 3: POST /api/emails/send (valid payload)');
  const se = await request('POST', '/api/emails/send', {
    to: 'intern@example.com',
    subject: 'Test Email',
    type: 'welcome',
    body: 'Hello!',
  });
  check(se.status === 200, 'HTTP 200 OK');
  check(se.body.success === true, 'body.success === true');
  check(typeof se.body.emailId === 'string', 'body.emailId is a string');
  console.log('  Response:', JSON.stringify(se.body));

  // --- Test 4: Send Email (invalid — missing fields) ---
  console.log('\nTEST 4: POST /api/emails/send (missing required fields → 400)');
  const se400 = await request('POST', '/api/emails/send', { to: 'x@x.com' });
  check(se400.status === 400, 'HTTP 400 Bad Request');
  check(typeof se400.body.message === 'string', 'error message is a string');
  console.log('  Response:', JSON.stringify(se400.body));

  // --- Test 5: Get Emails ---
  console.log('\nTEST 5: GET /api/emails');
  const emails = await request('GET', '/api/emails');
  check(emails.status === 200, 'HTTP 200 OK');
  check(Array.isArray(emails.body), 'Response is an array');
  check(emails.body.length > 0, 'At least one email record returned');
  check(typeof emails.body[0].id === 'string', 'Record has an id field');
  console.log('  Response:', JSON.stringify(emails.body));

  // --- Test 6: Get Templates ---
  console.log('\nTEST 6: GET /api/templates');
  const tmpl = await request('GET', '/api/templates');
  check(tmpl.status === 200, 'HTTP 200 OK');
  check(Array.isArray(tmpl.body), 'Response is an array');
  console.log('  Response:', JSON.stringify(tmpl.body));

  // --- Test 7: Create Template (valid) ---
  console.log('\nTEST 7: POST /api/templates (valid payload)');
  const ct = await request('POST', '/api/templates', {
    name: 'Promo Template',
    subject: 'Special Offer',
    body: 'Get 20% off!',
    type: 'promotional',
  });
  check(ct.status === 201, 'HTTP 201 Created');
  check(typeof ct.body.id === 'string', 'Created record has an id');
  console.log('  Response:', JSON.stringify(ct.body));

  // --- Test 8: 404 for unknown route ---
  console.log('\nTEST 8: GET /api/unknown → 404');
  const notFound = await request('GET', '/api/unknown');
  check(notFound.status === 404, 'HTTP 404 Not Found');
  console.log('  Response:', JSON.stringify(notFound.body));

  // --- Summary ---
  console.log('\n========================================');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});

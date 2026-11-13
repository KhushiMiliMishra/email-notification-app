/**
 * server.js — Minimal Node.js / Express backend stub.
 *
 * PURPOSE:
 *   This file provides working API endpoints so the Angular frontend
 *   can be developed and tested WITHOUT waiting for the full backend
 *   to be built by the backend team member.
 *
 * WHAT THIS IS:
 *   A "stub" or "mock" server. It returns hardcoded example responses.
 *   It is NOT a production backend — it has no database, no SMTP, no auth.
 *
 * HANDOVER NOTE FOR THE BACKEND DEVELOPER:
 *   The endpoints, URL paths, HTTP methods, and JSON response shapes in
 *   this file define the API contract the frontend expects.
 *   Replace each stub handler with real logic as you build the backend.
 *   See /docs/api-specification.md for the full specification.
 *
 * HOW TO RUN:
 *   cd backend
 *   npm install
 *   npm run dev      ← uses nodemon (auto-restarts on file changes)
 *   # OR
 *   npm start        ← uses plain node
 *
 * The server listens on http://localhost:3000
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * cors() — Cross-Origin Resource Sharing.
 *
 * The Angular dev server runs on http://localhost:4200 and the backend on
 * http://localhost:3000. Without CORS headers, the browser refuses to let
 * Angular make API calls to a different port.
 *
 * PRODUCTION NOTE: Restrict the origin to your actual production domain
 * instead of allowing all origins ('*').
 */
app.use(cors({ origin: 'http://localhost:4200' }));

/**
 * express.json() — Parses incoming request bodies as JSON.
 * Required for POST requests that send JSON payloads.
 */
app.use(express.json());

// ---------------------------------------------------------------------------
// GET /api/health — Health Check
// ---------------------------------------------------------------------------

/**
 * Returns a simple OK status so the frontend can confirm the backend is live.
 *
 * Expected response:
 * {
 *   "status": "OK",
 *   "message": "Backend is running"
 * }
 *
 * STATUS: ✅ Implemented (stub)
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend is running',
  });
});

// ---------------------------------------------------------------------------
// GET /api/feature-flags — Feature Flags
// ---------------------------------------------------------------------------

/**
 * Returns the current feature flag configuration.
 *
 * BACKEND TODO: Replace with database or config-service lookup.
 *
 * Expected response:
 * {
 *   "emailNotifications": true,
 *   "welcomeEmails": true,
 *   "verificationEmails": true,
 *   "promotionalEmails": false
 * }
 *
 * STATUS: ✅ Implemented (stub with hardcoded defaults)
 */
app.get('/api/feature-flags', (req, res) => {
  res.status(200).json({
    emailNotifications: true,
    welcomeEmails: true,
    verificationEmails: true,
    promotionalEmails: false,
  });
});

// ---------------------------------------------------------------------------
// POST /api/emails/send — Send Email
// ---------------------------------------------------------------------------

/**
 * Accepts an email send request and returns a mock success response.
 *
 * Expected request body:
 * {
 *   "to": "user@example.com",
 *   "subject": "Hello",
 *   "type": "welcome",
 *   "body": "Welcome to our service!"
 * }
 *
 * Expected response:
 * {
 *   "success": true,
 *   "message": "Email queued successfully",
 *   "emailId": "mock-id-001"
 * }
 *
 * BACKEND TODO: Validate input, check feature flags, integrate SMTP/email service.
 * STATUS: ⏳ Stub only — no actual email is sent.
 */
app.post('/api/emails/send', (req, res) => {
  const { to, subject, type } = req.body;

  // Basic validation
  if (!to || !subject || !type) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: to, subject, type.',
    });
  }

  // Stub response — replace with actual email sending logic
  res.status(200).json({
    success: true,
    message: `[STUB] Email to '${to}' queued successfully. No real email was sent.`,
    emailId: `mock-id-${Date.now()}`,
  });
});

// ---------------------------------------------------------------------------
// GET /api/emails — Email History
// ---------------------------------------------------------------------------

/**
 * Returns a list of past email records.
 *
 * BACKEND TODO: Query database for real email history.
 * STATUS: ⏳ Stub only — returns hardcoded sample data.
 */
app.get('/api/emails', (req, res) => {
  res.status(200).json([
    {
      id: 'e001',
      to: 'alice@example.com',
      subject: 'Welcome!',
      type: 'welcome',
      sentAt: '2026-11-01T08:00:00Z',
      status: 'sent',
    },
    {
      id: 'e002',
      to: 'bob@example.com',
      subject: 'Please verify your email',
      type: 'verification',
      sentAt: '2026-11-02T10:30:00Z',
      status: 'sent',
    },
  ]);
});

// ---------------------------------------------------------------------------
// GET /api/templates — Email Templates
// ---------------------------------------------------------------------------

/**
 * Returns all saved email templates.
 *
 * BACKEND TODO: Query database for templates.
 * STATUS: ⏳ Stub only.
 */
app.get('/api/templates', (req, res) => {
  res.status(200).json([
    {
      id: 't001',
      name: 'Welcome Email',
      subject: 'Welcome to {{ appName }}!',
      body: 'Hi {{ firstName }}, welcome aboard!',
      type: 'welcome',
      createdAt: '2026-10-01T00:00:00Z',
    },
  ]);
});

// ---------------------------------------------------------------------------
// POST /api/templates — Create Email Template
// ---------------------------------------------------------------------------

/**
 * Creates a new email template and returns it with a generated ID.
 *
 * BACKEND TODO: Save to database, return persisted record.
 * STATUS: ⏳ Stub only — echoes the input with a fake ID.
 */
app.post('/api/templates', (req, res) => {
  const { name, subject, body, type } = req.body;

  if (!name || !subject || !body || !type) {
    return res.status(400).json({
      message: 'Missing required fields: name, subject, body, type.',
    });
  }

  res.status(201).json({
    id: `t-${Date.now()}`,
    name,
    subject,
    body,
    type,
    createdAt: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// 404 Handler — Unknown routes
// ---------------------------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found.`,
  });
});

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    message: 'An internal server error occurred.',
  });
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`\n✅ Backend stub server running at http://localhost:${PORT}/api`);
  console.log('   Available endpoints:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/feature-flags');
  console.log('   POST /api/emails/send');
  console.log('   GET  /api/emails');
  console.log('   GET  /api/templates');
  console.log('   POST /api/templates\n');
});

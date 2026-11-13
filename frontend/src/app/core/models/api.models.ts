/**
 * api.models.ts — Shared TypeScript interfaces for all API request/response shapes.
 *
 * WHY THIS FILE EXISTS:
 *   Using `any` everywhere defeats TypeScript's type safety.
 *   By defining interfaces here, every service and component that touches the
 *   API gets compile-time checking and IDE auto-complete.
 *
 * RULE: Never use `any` for API data. Add a new interface here instead.
 */

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

/**
 * Shape of the response returned by GET /health.
 * Example: { status: "OK", message: "Backend is running" }
 */
export interface HealthCheckResponse {
  status: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Emails
// ---------------------------------------------------------------------------

/** Allowed email types in this application. */
export type EmailType =
  | 'welcome'
  | 'verification'
  | 'promotional'
  | 'notification';

/** Payload sent to POST /emails/send */
export interface SendEmailRequest {
  to: string;           // Recipient email address
  subject: string;      // Email subject line
  templateId?: string;  // Optional: ID of a saved template to use
  body?: string;        // Optional: raw body if no template is used
  type: EmailType;      // Category — used server-side for feature-flag enforcement
}

/** Shape of a single email record returned by GET /emails */
export interface EmailRecord {
  id: string;
  to: string;
  subject: string;
  type: EmailType;
  sentAt: string;       // ISO 8601 date string, e.g. "2026-11-05T10:00:00Z"
  status: 'sent' | 'failed' | 'pending';
}

/** Shape of the response from POST /emails/send */
export interface SendEmailResponse {
  success: boolean;
  message: string;
  emailId?: string;     // ID of the email record created on the backend
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/** Shape of a single email template returned by GET /templates */
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: EmailType;
  createdAt: string;    // ISO 8601 date string
}

/** Payload sent to POST /templates */
export interface CreateTemplateRequest {
  name: string;
  subject: string;
  body: string;
  type: EmailType;
}

// ---------------------------------------------------------------------------
// Feature Flags
// ---------------------------------------------------------------------------

/**
 * The complete set of feature flags managed by this application.
 *
 * IMPORTANT SECURITY NOTE:
 *   These flags are for UI-level toggling only (show/hide buttons, routes, etc.).
 *   The backend MUST enforce these same restrictions independently.
 *   A user who disables frontend guards can still try to call the API directly,
 *   so the backend is the authoritative gatekeeper.
 */
export interface FeatureFlags {
  emailNotifications: boolean;   // Master toggle: show/hide all email notification UI
  welcomeEmails: boolean;        // Show/hide "Send Welcome Email" features
  verificationEmails: boolean;   // Show/hide "Send Verification Email" features
  promotionalEmails: boolean;    // Show/hide promotional email features
}

// ---------------------------------------------------------------------------
// Generic API Error
// ---------------------------------------------------------------------------

/**
 * Standardised structure for API errors returned to callers.
 * ApiService methods catch HTTP errors and throw this shape so components
 * don't need to know about HttpErrorResponse internals.
 */
export interface ApiError {
  statusCode: number;    // HTTP status code (400, 404, 500, 0 for network errors)
  message: string;       // Human-readable message safe to display in the UI
  details?: string;      // Optional extra detail (not shown to end-users)
}

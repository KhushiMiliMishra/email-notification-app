/**
 * api.service.ts — Centralized API communication service.
 *
 * PURPOSE:
 *   This is the single point of contact between the Angular frontend and
 *   the Node.js backend. Every HTTP call in this application goes through
 *   this service. Components never call HttpClient directly.
 *
 * HOW TO USE IN A COMPONENT:
 *   1. Inject ApiService in the component constructor.
 *   2. Call the relevant method (e.g. this.apiService.checkHealth()).
 *   3. Subscribe to the returned Observable and handle success/error.
 *
 * ENVIRONMENT URLS:
 *   The base URL is read from `environment.apiBaseUrl`.
 *   It automatically switches between development and production values
 *   based on the Angular build configuration — no manual changes needed.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  ApiError,
  CreateTemplateRequest,
  EmailRecord,
  EmailTemplate,
  FeatureFlags,
  HealthCheckResponse,
  SendEmailRequest,
  SendEmailResponse,
} from '../models/api.models';

@Injectable({
  // 'root' means Angular creates one shared instance for the whole application.
  // This avoids creating multiple HTTP connections doing the same work.
  providedIn: 'root',
})
export class ApiService {
  /**
   * Base URL for all API calls.
   * Comes from the environment file — NEVER hardcode this.
   * Development:  http://localhost:3000/api
   * Production:   https://your-production-domain.com/api
   */
  private readonly baseUrl: string = environment.apiBaseUrl;

  /**
   * Default headers sent with every request.
   * 'Content-Type: application/json' tells the server we are sending JSON.
   * Add an Authorization header here if/when authentication is implemented.
   */
  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  /**
   * Angular injects HttpClient automatically because ApiService is decorated
   * with @Injectable. We store it as a private field for use in all methods.
   */
  constructor(private http: HttpClient) {}

  // =========================================================================
  // HEALTH CHECK
  // =========================================================================

  /**
   * checkHealth()
   * Sends GET /health to verify the backend is reachable and running.
   *
   * Returns an Observable<HealthCheckResponse>:
   *   { status: "OK", message: "Backend is running" }
   *
   * Usage in a component:
   *   this.apiService.checkHealth().subscribe({
   *     next: (res) => console.log(res.status),
   *     error: (err: ApiError) => console.error(err.message),
   *   });
   *
   * ENDPOINT STATUS: Pending backend implementation (GET /health)
   */
  checkHealth(): Observable<HealthCheckResponse> {
    return this.http
      .get<HealthCheckResponse>(`${this.baseUrl}/health`, {
        headers: this.defaultHeaders,
      })
      .pipe(catchError(this.handleError));
  }

  // =========================================================================
  // EMAILS
  // =========================================================================

  /**
   * sendEmail()
   * Sends POST /emails/send to trigger the backend to send an email.
   *
   * @param payload - The email details (recipient, subject, type, etc.)
   * Returns an Observable<SendEmailResponse>
   *
   * NOTE: The backend enforces feature flags server-side.
   *       If a feature is disabled, the backend will return 403 Forbidden.
   *
   * ENDPOINT STATUS: Pending backend implementation (POST /emails/send)
   */
  sendEmail(payload: SendEmailRequest): Observable<SendEmailResponse> {
    return this.http
      .post<SendEmailResponse>(`${this.baseUrl}/emails/send`, payload, {
        headers: this.defaultHeaders,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * getEmails()
   * Sends GET /emails to retrieve the list of sent/pending emails.
   *
   * Returns an Observable<EmailRecord[]>
   *
   * ENDPOINT STATUS: Pending backend implementation (GET /emails)
   */
  getEmails(): Observable<EmailRecord[]> {
    return this.http
      .get<EmailRecord[]>(`${this.baseUrl}/emails`, {
        headers: this.defaultHeaders,
      })
      .pipe(catchError(this.handleError));
  }

  // =========================================================================
  // TEMPLATES
  // =========================================================================

  /**
   * getTemplates()
   * Sends GET /templates to retrieve all saved email templates.
   *
   * Returns an Observable<EmailTemplate[]>
   *
   * ENDPOINT STATUS: Pending backend implementation (GET /templates)
   */
  getTemplates(): Observable<EmailTemplate[]> {
    return this.http
      .get<EmailTemplate[]>(`${this.baseUrl}/templates`, {
        headers: this.defaultHeaders,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * createTemplate()
   * Sends POST /templates to save a new email template on the backend.
   *
   * @param payload - The template data (name, subject, body, type)
   * Returns an Observable<EmailTemplate> (the created template with its new ID)
   *
   * ENDPOINT STATUS: Pending backend implementation (POST /templates)
   */
  createTemplate(payload: CreateTemplateRequest): Observable<EmailTemplate> {
    return this.http
      .post<EmailTemplate>(`${this.baseUrl}/templates`, payload, {
        headers: this.defaultHeaders,
      })
      .pipe(catchError(this.handleError));
  }

  // =========================================================================
  // FEATURE FLAGS
  // =========================================================================

  /**
   * getFeatureFlags()
   * Sends GET /feature-flags to retrieve the current feature flag configuration.
   *
   * Returns an Observable<FeatureFlags>
   *
   * This is called by FeatureFlagService on startup and when refreshing flags.
   * Components should NOT call this directly — use FeatureFlagService instead.
   *
   * ENDPOINT STATUS: Pending backend implementation (GET /feature-flags)
   */
  getFeatureFlags(): Observable<FeatureFlags> {
    return this.http
      .get<FeatureFlags>(`${this.baseUrl}/feature-flags`, {
        headers: this.defaultHeaders,
      })
      .pipe(catchError(this.handleError));
  }

  // =========================================================================
  // SHARED ERROR HANDLER
  // =========================================================================

  /**
   * handleError()
   * Converts Angular's HttpErrorResponse into our standardized ApiError shape.
   *
   * This is a private helper called by every `.pipe(catchError(...))` above.
   * It means every API method throws the same predictable error type,
   * so component error handlers only need to know about ApiError — not
   * Angular internals.
   *
   * HTTP codes handled:
   *   0   → Network error (backend unreachable, no internet, CORS issue)
   *   400 → Bad request (invalid data sent by the frontend)
   *   404 → Endpoint not found (wrong URL or backend route missing)
   *   500 → Internal server error (bug or crash on the backend)
   *   Other → Unexpected HTTP status
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if (error.status === 0) {
      // A status of 0 means the request never reached the server.
      // This happens when the backend is offline or there is a network issue.
      apiError = {
        statusCode: 0,
        message: 'Cannot connect to the server. Please check your network connection or ensure the backend is running.',
        details: error.message,
      };
    } else {
      // The server responded with an error status code.
      // We map each known code to a user-friendly message.
      const friendlyMessages: Record<number, string> = {
        400: 'The request was invalid. Please check the data you submitted.',
        401: 'You are not authorised. Please log in and try again.',
        403: 'Access denied. This feature may be disabled or you lack permission.',
        404: 'The requested resource was not found. The backend endpoint may not be implemented yet.',
        500: 'The server encountered an error. Please try again later.',
      };

      apiError = {
        statusCode: error.status,
        message:
          friendlyMessages[error.status] ??
          `An unexpected error occurred (HTTP ${error.status}).`,
        // `details` holds the raw error body for debugging — do NOT display this to end users.
        details: JSON.stringify(error.error),
      };
    }

    // throwError returns an Observable that immediately errors.
    // The component's `.subscribe({ error: ... })` handler will receive this ApiError.
    return throwError(() => apiError);
  }
}

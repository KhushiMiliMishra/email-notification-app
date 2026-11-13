/**
 * health-check.component.ts — Displays backend connectivity status.
 *
 * PURPOSE:
 *   Shows a live status indicator so developers (and optionally users)
 *   can see whether the backend is reachable.
 *
 * HOW IT WORKS:
 *   - On load, calls ApiService.checkHealth() (GET /health).
 *   - Displays "Connected" (green), "Error" (orange), or "Offline" (red)
 *     based on the response.
 *   - The "Refresh" button lets the user re-trigger the check manually.
 *
 * HOW TO ADD TO A PAGE:
 *   Include <app-health-check></app-health-check> in any parent component template.
 *   Import HealthCheckComponent in that module's declarations array.
 */

import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../../core/services/api.service';
import { ApiError, HealthCheckResponse } from '../../../core/models/api.models';

/** The three possible states of the health check display. */
type HealthStatus = 'checking' | 'connected' | 'error' | 'offline';

@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.css'],
})
export class HealthCheckComponent implements OnInit {
  /** Current state of the health check. Drives the template display logic. */
  status: HealthStatus = 'checking';

  /** The message returned by the backend, e.g. "Backend is running". */
  backendMessage = '';

  /** User-facing error message when the backend is unreachable. */
  errorMessage = '';

  /** True while the HTTP request is in-flight — used to disable the refresh button. */
  isChecking = false;

  constructor(private apiService: ApiService) {}

  /** Angular calls ngOnInit once after the component is created. */
  ngOnInit(): void {
    this.checkHealth();
  }

  /**
   * checkHealth()
   * Triggers a GET /health request and updates component state based on the result.
   * Called on component init and when the user clicks "Refresh".
   */
  checkHealth(): void {
    this.isChecking = true;
    this.status = 'checking';
    this.errorMessage = '';
    this.backendMessage = '';

    this.apiService.checkHealth().subscribe({
      next: (response: HealthCheckResponse) => {
        this.status = 'connected';
        this.backendMessage = response.message;
        this.isChecking = false;
      },
      error: (err: ApiError) => {
        this.isChecking = false;

        if (err.statusCode === 0) {
          // Status 0 = no network connection to the server.
          this.status = 'offline';
          this.errorMessage = 'Backend is offline or unreachable.';
        } else {
          // Server responded but with an error code.
          this.status = 'error';
          this.errorMessage = err.message;
        }
      },
    });
  }
}

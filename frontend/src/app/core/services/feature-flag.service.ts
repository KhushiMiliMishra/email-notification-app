/**
 * feature-flag.service.ts — Centralized feature flag management service.
 *
 * PURPOSE:
 *   This service is the single source of truth for feature flags in the frontend.
 *   Components and other services ask this service whether a feature is enabled —
 *   they never hardcode feature states themselves.
 *
 * HOW IT WORKS:
 *   1. On application startup (or when refresh() is called), the service calls
 *      GET /feature-flags via ApiService.
 *   2. The response is stored in a BehaviorSubject so any component can subscribe
 *      and reactively update when flags change.
 *   3. If the backend is unreachable, DEFAULT_FLAGS are used so the app still works.
 *
 * SECURITY NOTICE:
 *   Frontend flags are for UI convenience only (hiding/showing buttons, routes).
 *   The backend MUST enforce these same restrictions.
 *   A determined user could bypass frontend guards, so never rely solely on
 *   frontend feature flags for security.
 *
 * HOW TO USE IN A COMPONENT:
 *   // Check a flag once:
 *   if (this.featureFlagService.isEnabled('welcomeEmails')) { ... }
 *
 *   // React to flag changes over time:
 *   this.featureFlagService.flags$.subscribe(flags => {
 *     this.showWelcomeEmail = flags.welcomeEmails;
 *   });
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiService } from './api.service';
import { ApiError, FeatureFlags } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagService {
  /**
   * DEFAULT_FLAGS: Used when the backend is unreachable.
   *
   * Design decision: Default to a conservative, mostly-enabled set so
   * the app remains functional during brief backend outages.
   * promotionalEmails is false by default because it was specified as
   * initially disabled in the requirements.
   */
  private readonly DEFAULT_FLAGS: FeatureFlags = {
    emailNotifications: true,
    welcomeEmails: true,
    verificationEmails: true,
    promotionalEmails: false,
  };

  /**
   * BehaviorSubject holds the current flags.
   *
   * BehaviorSubject vs Subject:
   *   - BehaviorSubject always has a current value (initialized with DEFAULT_FLAGS).
   *   - New subscribers immediately receive the latest value.
   *   - Regular Subject has no initial value and only emits future values.
   *
   * We expose the read-only Observable (flags$) to the outside world.
   * Only this service can push new values via flagsSubject.next().
   */
  private flagsSubject = new BehaviorSubject<FeatureFlags>(this.DEFAULT_FLAGS);

  /** Public Observable that components subscribe to for reactive flag updates. */
  public flags$: Observable<FeatureFlags> = this.flagsSubject.asObservable();

  /**
   * isLoading$: Components can show a loading spinner while flags are being fetched.
   * True between the moment fetch starts and when it completes or fails.
   */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * loadError$: If the last fetch failed, this holds the error message.
   * null means no error. Components can display a warning banner.
   */
  private errorSubject = new BehaviorSubject<string | null>(null);
  public loadError$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Automatically load flags when the service is first created.
    // Because providedIn: 'root', this happens once when the app starts.
    this.loadFlags();
  }

  // =========================================================================
  // PUBLIC API
  // =========================================================================

  /**
   * isEnabled(flagKey)
   * Synchronously checks whether a specific feature flag is currently enabled.
   *
   * Use this for one-off checks in component logic (e.g. in ngOnInit).
   * For reactive templates, subscribe to flags$ instead.
   *
   * @param flagKey - One of the keys from the FeatureFlags interface.
   * @returns boolean — true if the feature is enabled, false otherwise.
   *
   * Example:
   *   if (this.featureFlagService.isEnabled('promotionalEmails')) {
   *     // Show the promotional email button
   *   }
   */
  isEnabled(flagKey: keyof FeatureFlags): boolean {
    return this.flagsSubject.getValue()[flagKey];
  }

  /**
   * getFlags()
   * Returns the current snapshot of all feature flags synchronously.
   * Useful when you need multiple flags at once.
   */
  getFlags(): FeatureFlags {
    return this.flagsSubject.getValue();
  }

  /**
   * refresh()
   * Re-fetches feature flags from the backend.
   * Call this after a configuration change or when the user triggers a reload.
   *
   * Example in a component:
   *   this.featureFlagService.refresh();
   */
  refresh(): void {
    this.loadFlags();
  }

  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================

  /**
   * loadFlags()
   * Internal method that calls the backend and updates the BehaviorSubject.
   * Also manages loading and error state.
   */
  private loadFlags(): void {
    this.loadingSubject.next(true);  // Signal: loading started
    this.errorSubject.next(null);    // Clear any previous error

    this.apiService.getFeatureFlags().subscribe({
      next: (flags: FeatureFlags) => {
        // Merge backend response with defaults to ensure all keys are present.
        // If the backend omits a key, the default value is used instead of undefined.
        const merged: FeatureFlags = { ...this.DEFAULT_FLAGS, ...flags };
        this.flagsSubject.next(merged);
        this.loadingSubject.next(false);
      },
      error: (err: ApiError) => {
        // Backend is unreachable or returned an error.
        // Log the technical details to the console for developers.
        console.warn(
          '[FeatureFlagService] Could not load feature flags from backend. ' +
          'Using default configuration. Reason:',
          err.message
        );

        // Keep using the current flags (DEFAULT_FLAGS on first load, or last
        // successfully fetched flags on a refresh failure).
        // This means a brief backend outage does not disable features for users.

        // Set a user-facing error message that components can optionally display.
        this.errorSubject.next(
          'Feature configuration could not be loaded. Using defaults.'
        );
        this.loadingSubject.next(false);
      },
    });
  }
}

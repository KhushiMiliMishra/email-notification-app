/**
 * app.component.ts — Root Component.
 *
 * PURPOSE:
 *   This is the root UI component. Angular renders it first when the app
 *   starts. All other components are rendered as children of this one.
 *
 * CURRENT CONTENT:
 *   Demonstrates using FeatureFlagService and HealthCheckComponent.
 *   Your team members will replace this with the actual application shell
 *   (navigation bar, router outlet, etc.) as the project grows.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeatureFlagService } from './core/services/feature-flag.service';
import { FeatureFlags } from './core/models/api.models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  /** Application title shown in the template. */
  title = 'Email & Notification Management';

  /** Snapshot of current feature flags — updated reactively via subscription. */
  featureFlags: FeatureFlags | null = null;

  /** True while feature flags are loading from the backend. */
  flagsLoading = false;

  /** Error message if feature flags could not be loaded. */
  flagsError: string | null = null;

  /**
   * Subject used to unsubscribe from Observables when this component is destroyed.
   * This prevents memory leaks — without it, subscriptions would keep running
   * even after the component is removed from the DOM.
   */
  private destroy$ = new Subject<void>();

  constructor(public featureFlagService: FeatureFlagService) {}

  ngOnInit(): void {
    // Subscribe to feature flag changes.
    // takeUntil(this.destroy$) automatically unsubscribes when ngOnDestroy runs.
    this.featureFlagService.flags$
      .pipe(takeUntil(this.destroy$))
      .subscribe((flags) => {
        this.featureFlags = flags;
      });

    this.featureFlagService.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.flagsLoading = loading;
      });

    this.featureFlagService.loadError$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        this.flagsError = error;
      });
  }

  ngOnDestroy(): void {
    // Emit a value so all takeUntil(destroy$) subscriptions complete.
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * app.module.ts — Root Application Module.
 *
 * PURPOSE:
 *   This is the entry point for Angular's dependency injection system.
 *   Every Angular application has exactly one root module (AppModule).
 *   It bootstraps the root component (AppComponent) and imports all
 *   other top-level modules the application needs.
 *
 * MODULE IMPORTS:
 *   BrowserModule  — Required for running in a browser (provides *ngIf, etc.)
 *   CoreModule     — Registers singleton services (ApiService, FeatureFlagService)
 *   SharedModule   — Makes shared components (HealthCheckComponent) available
 *   AppRoutingModule — Configures page navigation routes (add when routing is set up)
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    // Components that belong to the root application module.
    AppComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,    // Provides HttpClient, ApiService, FeatureFlagService
    SharedModule,  // Provides HealthCheckComponent and other shared UI
  ],
  providers: [],
  bootstrap: [AppComponent], // Angular creates and renders AppComponent first.
})
export class AppModule {}

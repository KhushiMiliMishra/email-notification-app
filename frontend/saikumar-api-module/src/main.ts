/**
 * main.ts — Angular application bootstrap entry point.
 *
 * This is the first TypeScript file that runs when the browser loads the app.
 * It calls platformBrowserDynamic().bootstrapModule(AppModule) which:
 *   1. Creates the root Angular injector with all services.
 *   2. Renders AppComponent into the <app-root> element in index.html.
 *
 * The environment import allows Angular to disable dev-mode checks in production.
 */

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';
import { AppModule } from './app/app.module';

if (environment.production) {
  // Disables extra change-detection checks that only make sense during development.
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error('Bootstrap error:', err));

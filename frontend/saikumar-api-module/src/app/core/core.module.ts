/**
 * core.module.ts — The Core Module.
 *
 * PURPOSE:
 *   The Core Module is an Angular best-practice pattern. It groups together
 *   services that must exist as a single instance for the whole application
 *   (singletons), keeping them separate from feature modules.
 *
 *   Services like ApiService and FeatureFlagService belong here because:
 *   - They are shared across the entire application.
 *   - There should only ever be ONE instance of each.
 *
 * RULE: Import CoreModule ONLY in AppModule (the root module).
 *       If another feature module imports it, services could be duplicated.
 *
 * HOW TO ADD A NEW SINGLETON SERVICE:
 *   Add it to the `providers` array below (though `providedIn: 'root'`
 *   on the @Injectable decorator achieves the same without listing it here).
 */

import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Services are `providedIn: 'root'` so Angular auto-registers them.
// We import them here for documentation / discoverability purposes.
import { ApiService } from './services/api.service';
import { FeatureFlagService } from './services/feature-flag.service';

@NgModule({
  imports: [
    CommonModule,
    // HttpClientModule registers Angular's HttpClient for the whole app.
    // Required for ApiService to work. Must be imported exactly once.
    HttpClientModule,
  ],
  providers: [
    // Listed here for explicit documentation, though providedIn: 'root'
    // means Angular would register them even without this.
    ApiService,
    FeatureFlagService,
  ],
})
export class CoreModule {
  /**
   * Guard against double-importing CoreModule.
   *
   * If a lazy-loaded feature module accidentally imports CoreModule,
   * Angular would create a second instance of every service, causing bugs.
   * This constructor throws an error immediately if that happens.
   *
   * @Optional + @SkipSelf: Angular tries to inject an existing CoreModule
   * instance from the PARENT injector. If one already exists (parentModule
   * is not null), we're being double-imported — throw an error.
   */
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it only in AppModule.'
      );
    }
  }
}

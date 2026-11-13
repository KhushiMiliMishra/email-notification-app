/**
 * shared.module.ts — The Shared Module.
 *
 * PURPOSE:
 *   Contains components, directives, and pipes that are reused across
 *   multiple feature modules. Unlike CoreModule (singleton services),
 *   SharedModule can be imported by any feature module that needs its exports.
 *
 * CURRENT EXPORTS:
 *   - HealthCheckComponent: Displays backend connectivity status.
 *
 * HOW TO ADD MORE SHARED COMPONENTS:
 *   1. Create the component in src/app/shared/components/<name>/
 *   2. Add it to both `declarations` and `exports` below.
 *   3. Import SharedModule in any feature module that needs the component.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HealthCheckComponent } from './components/health-check/health-check.component';

@NgModule({
  declarations: [
    // Components that belong to this shared module.
    HealthCheckComponent,
  ],
  imports: [
    // CommonModule provides *ngIf, *ngFor, AsyncPipe, etc.
    CommonModule,
  ],
  exports: [
    // Components listed here can be used in any module that imports SharedModule.
    HealthCheckComponent,
  ],
})
export class SharedModule {}

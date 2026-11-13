/**
 * environment.prod.ts — PRODUCTION environment configuration.
 *
 * This file is automatically substituted for `environment.ts` by the
 * Angular build system when you run:
 *
 *   ng build --configuration production
 *
 * The substitution is configured in `angular.json` under:
 *   projects > <app> > architect > build > configurations > production > fileReplacements
 *
 * ACTION REQUIRED BEFORE GOING LIVE:
 *   Replace the placeholder URL below with your real production API domain.
 *   Do NOT commit real credentials or secrets here — this file is source-controlled.
 */
export const environment = {
  /** Tells Angular this is a production build (enables optimizations, disables debug). */
  production: true,

  /**
   * Replace this URL with your actual production backend domain before deploying.
   * Example: 'https://api.my-email-app.com/api'
   */
  apiBaseUrl: 'https://your-production-domain.com/api',
};

/**
 * environment.ts — DEVELOPMENT environment configuration.
 *
 * Angular reads this file when you run `ng serve` (development mode).
 * The Angular build system automatically swaps this file for
 * `environment.prod.ts` when you run `ng build --configuration production`.
 *
 * NEVER hardcode API URLs anywhere else in the codebase.
 * Always import from this environment object so the swap happens automatically.
 */
export const environment = {
  /**
   * production: false tells Angular (and your code) this is a dev build.
   * Angular uses this internally to enable extra debug checks.
   */
  production: false,

  /**
   * apiBaseUrl: The root URL for all backend REST API calls.
   * All API service methods build their endpoint URLs from this base.
   * Change this single value to point the whole app at a different server.
   */
  apiBaseUrl: 'http://localhost:3000/api',
};

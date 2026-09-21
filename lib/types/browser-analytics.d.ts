/**
 * Shared browser analytics types.
 * Keep this declaration independent of UI components: cart analytics helpers
 * also use window.gtag. This file defines types only; it does not load analytics
 * scripts, send events, or change consent handling.
 */
export {};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

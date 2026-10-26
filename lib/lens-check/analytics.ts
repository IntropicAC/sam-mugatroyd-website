// Mindset Test funnel events for GA4. Sends nothing unless analytics consent
// has loaded gtag, and never includes answers, names or emails.
export function trackLensCheck(event: string, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (window.location.pathname.startsWith("/lens-check")) return;
  window.gtag("event", event, params);
}

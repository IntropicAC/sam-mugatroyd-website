// Basic-auth check for Sam's results dashboard and exports. Used by proxy.ts
// (which shows the browser's sign-in prompt) and again inside the page and
// export route, so they stay protected even if the proxy is bypassed.

export const ADMIN_REALM = 'Basic realm="Mindset Test results", charset="UTF-8"';

export type AdminAuthResult = "ok" | "not-configured" | "denied";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function checkAdminAuthorization(header: string | null): AdminAuthResult {
  const password = process.env.LENS_CHECK_ADMIN_PASSWORD;
  if (!password) return "not-configured";

  const [scheme, encoded] = (header ?? "").split(" ");
  if (scheme !== "Basic" || !encoded) return "denied";

  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return "denied";
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) return "denied";

  const user = decoded.slice(0, separator);
  const pass = decoded.slice(separator + 1);
  const expectedUser = process.env.LENS_CHECK_ADMIN_USER || "sam";
  return safeEqual(user, expectedUser) && safeEqual(pass, password) ? "ok" : "denied";
}

import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";
import { getAuthConfig } from "./auth-config";

export function getLensCheckAuth() {
  const config = getAuthConfig();
  if (!config) return null;
  return createNeonAuth({
    baseUrl: config.baseUrl,
    cookies: { secret: config.secret, sessionDataTtl: 60 },
    // Upstream logs can include private request details. Report safe errors at
    // the application boundary instead.
    logLevel: "silent",
  });
}

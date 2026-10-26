type Environment = Record<string, string | undefined>;
export type SocialProvider = "google" | "microsoft";

export function getSocialProviders(env: Environment = process.env): SocialProvider[] {
  return [...new Set((env.LENS_CHECK_AUTH_SOCIAL_PROVIDERS || "").split(",")
    .map((provider) => provider.trim()).filter((provider): provider is SocialProvider => provider === "google" || provider === "microsoft"))];
}

// Deliberately a test integration until the isolated Auth branch and sender
// have been verified. Never fall back to VITE/public browser configuration.
export function getAuthConfig(env: Environment = process.env) {
  if (env.LENS_CHECK_AUTH_ENABLED !== "true") return null;
  const baseUrl = env.NEON_AUTH_BASE_URL?.trim() || env.DATABASE_NEON_AUTH_BASE_URL?.trim();
  const secret = env.NEON_AUTH_COOKIE_SECRET?.trim();
  const testEmails = (env.LENS_CHECK_AUTH_TEST_EMAILS || "")
    .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (!baseUrl || !secret || secret.length < 32 || !testEmails.length) return null;
  try {
    const url = new URL(baseUrl);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return null;
  } catch {
    return null;
  }
  return { baseUrl, secret, testEmails, socialProviders: getSocialProviders(env), passwordEnabled: env.LENS_CHECK_AUTH_PASSWORD_ENABLED === "true" };
}

export function isAuthTestEmail(email: unknown, config: NonNullable<ReturnType<typeof getAuthConfig>>) {
  return typeof email === "string" && config.testEmails.includes(email.trim().toLowerCase());
}

export function isAllowedAuthUser(user: { id?: string; email?: string; emailVerified?: boolean } | null | undefined, config: NonNullable<ReturnType<typeof getAuthConfig>>) {
  return Boolean(user?.id && user.emailVerified === true && isAuthTestEmail(user.email, config));
}

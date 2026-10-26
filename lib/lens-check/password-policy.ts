export const MIN_PASSWORD_LENGTH = 15;
export const MAX_PASSWORD_LENGTH = 128;
export const PASSWORD_AUTH_PATHS = ["sign-in/email", "sign-up/email", "email-otp/verify-email", "email-otp/reset-password", "revoke-other-sessions"];

export function validNewPassword(value: unknown): value is string {
  return typeof value === "string" && Array.from(value).length >= MIN_PASSWORD_LENGTH && value.length <= MAX_PASSWORD_LENGTH && value.trim().length > 0;
}

// Only forward the credentials required by a given endpoint. In particular,
// signup must not accept an emailVerified flag, arbitrary callbacks or roles.
export function credentialPayload(path: string, body: Record<string, unknown>) {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (path === "sign-up/email") return validNewPassword(body.password)
    ? { email, password: body.password, name: "Mindset Test reader" } : null;
  if (path === "sign-in/email") return typeof body.password === "string" && body.password.length > 0 && body.password.length <= MAX_PASSWORD_LENGTH
    ? { email, password: body.password, rememberMe: true } : null;
  if (path === "email-otp/reset-password" && !validNewPassword(body.password)) return null;
  if (typeof body.otp !== "string" || !/^\d{4,12}$/.test(body.otp.trim())) return null;
  const otp = body.otp.trim();
  if (path === "email-otp/reset-password") return { email, otp, password: body.password };
  if (path === "email-otp/verify-email" || path === "sign-in/email-otp") return { email, otp };
  return null;
}

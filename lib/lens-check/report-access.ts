import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "./db/client";
import { lensCheckReportAccess, lensCheckReportAudit } from "./db/schema";
import { getLensCheckAuth } from "./auth";
import { getAuthConfig, isAllowedAuthUser, isAuthTestEmail } from "./auth-config";

export type ReportRole = "viewer" | "admin";
export const normaliseEmail = (value: unknown) => typeof value === "string" ? value.trim().toLowerCase() : "";
export function reportOwners() {
  return (process.env.LENS_CHECK_REPORT_ADMIN_EMAILS || "").split(",").map(normaliseEmail).filter(Boolean);
}
export async function reportRoleForEmail(value: unknown): Promise<ReportRole | null> {
  const email = normaliseEmail(value);
  if (!email) return null;
  if (reportOwners().includes(email)) return "admin";
  // Do not query an unmigrated database until account-based reporting is configured.
  if (!reportOwners().length) return null;
  const [grant] = await getDb().select({ role: lensCheckReportAccess.role }).from(lensCheckReportAccess)
    .where(eq(lensCheckReportAccess.email, email)).limit(1);
  return grant?.role === "admin" || grant?.role === "viewer" ? grant.role : null;
}
export async function permittedTestEmail(email: unknown, config: NonNullable<ReturnType<typeof getAuthConfig>>) {
  return isAuthTestEmail(email, config) || Boolean(await reportRoleForEmail(email).catch(() => null));
}
export async function permittedAuthUser(user: { id?: string; email?: string; emailVerified?: boolean } | null | undefined, config: NonNullable<ReturnType<typeof getAuthConfig>>) {
  if (isAllowedAuthUser(user, config)) return true;
  return Boolean(user?.id && user.emailVerified === true && await reportRoleForEmail(user.email).catch(() => null));
}
export async function reportPrincipal() {
  const auth = getLensCheckAuth();
  if (!auth) return null;
  const session = await auth.getSession({ query: { disableCookieCache: "true" } });
  if (session.error) throw new Error("Session verification unavailable");
  const user = session.data?.user;
  if (!user?.id || user.emailVerified !== true) return null;
  const role = await reportRoleForEmail(user.email);
  return role ? { email: normaliseEmail(user.email), role } : null;
}
export async function auditReport(actor: string, action: string, target?: string) {
  await getDb().insert(lensCheckReportAudit).values({ actor, action, target });
}

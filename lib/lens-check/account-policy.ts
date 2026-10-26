import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const CLAIM_COOKIE = "lens-check-attempt";
export const CLAIM_LIFETIME_SECONDS = 24 * 60 * 60;
export const SECRET_PATTERN = /^[A-Za-z0-9_-]{43}$/;
export const SUBMISSION_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const AGE_BANDS = ["13-15", "16-17", "18+"] as const;
export type AgeBand = typeof AGE_BANDS[number];

export function accountsEnabled() {
  return process.env.LENS_CHECK_ACCOUNTS_ENABLED === "true";
}

export function hashProof(proof: string) {
  return createHash("sha256").update(proof).digest("hex");
}

export function sameProof(proof: string | null, hash: string | null) {
  if (!proof || !SECRET_PATTERN.test(proof) || !hash || !/^[a-f0-9]{64}$/.test(hash)) return false;
  return timingSafeEqual(Buffer.from(hashProof(proof), "hex"), Buffer.from(hash, "hex"));
}

export function attemptKey(proof: string, submissionId: string) {
  return createHmac("sha256", proof).update(submissionId).digest("hex");
}

export type Principal = { issuer: string; subject: string };
export type ResultAccess = "owner" | "pending" | "legacy" | "denied";

export function resultAccess(
  result: { accountRequired: boolean; ownerAccountId: string | null; claimHash: string | null; claimExpiresAt: Date | null },
  accountId: string | null,
  proof: string | null,
  now = new Date(),
): ResultAccess {
  if (!result.accountRequired) return "legacy";
  if (result.ownerAccountId) return accountId === result.ownerAccountId ? "owner" : "denied";
  return result.claimExpiresAt && result.claimExpiresAt > now && sameProof(proof, result.claimHash) ? "pending" : "denied";
}

export function safeReturnTo(value: unknown) {
  return typeof value === "string" && (value === "/lens-check/admin" || /^\/lens-check\/result\?t=[A-Za-z0-9_-]{43}$/.test(value))
    ? value : "/lens-check/my-results";
}

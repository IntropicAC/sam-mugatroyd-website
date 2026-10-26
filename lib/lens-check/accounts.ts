import { permittedAuthUser } from "./report-access";
import "server-only";
import { cookies } from "next/headers";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { getLensCheckAuth } from "./auth";
import { getAuthConfig } from "./auth-config";
import { CLAIM_COOKIE, hashProof, resultAccess, SECRET_PATTERN, type Principal } from "./account-policy";
import { getDb } from "./db/client";
import { lensCheckAccounts, lensCheckResponses, type LensCheckResponseRow } from "./db/schema";

export async function verifiedPrincipal(): Promise<Principal | null> {
  const auth = getLensCheckAuth();
  const config = getAuthConfig();
  if (!auth || !config) return null;
  const result = await auth.getSession({ query: { disableCookieCache: "true" } });
  if (result.error) throw new Error("Session verification unavailable");
  const user = result.data?.user;
  return await permittedAuthUser(user, config) ? { issuer: config.baseUrl.replace(/\/$/, ""), subject: user!.id } : null;
}

export async function browserProof() {
  const value = (await cookies()).get(CLAIM_COOKIE)?.value;
  return value && SECRET_PATTERN.test(value) ? value : null;
}

export async function findAccount(principal: Principal) {
  const [account] = await getDb().select({ id: lensCheckAccounts.id }).from(lensCheckAccounts)
    .where(and(eq(lensCheckAccounts.authIssuer, principal.issuer), eq(lensCheckAccounts.authSubject, principal.subject))).limit(1);
  return account?.id ?? null;
}

export async function accessForResponse(response: LensCheckResponseRow) {
  if (!response.accountRequired) return "legacy" as const;
  const principal = await verifiedPrincipal();
  const accountId = principal ? await findAccount(principal) : null;
  return resultAccess(response, accountId, await browserProof());
}

export async function claimAccountResponse(token: string, principal: Principal, proof: string | null) {
  const db = getDb();
  const [response] = await db.select().from(lensCheckResponses)
    .where(and(eq(lensCheckResponses.token, token), eq(lensCheckResponses.accountRequired, true))).limit(1);
  if (!response) return "not_found" as const;
  const existing = await findAccount(principal);
  if (response.ownerAccountId) return existing === response.ownerAccountId ? "owned" as const : "not_found" as const;
  if (resultAccess(response, existing, proof) !== "pending") return "not_found" as const;

  const [account] = await db.insert(lensCheckAccounts).values({ authIssuer: principal.issuer, authSubject: principal.subject })
    .onConflictDoUpdate({ target: [lensCheckAccounts.authIssuer, lensCheckAccounts.authSubject], set: { authSubject: principal.subject } })
    .returning({ id: lensCheckAccounts.id });
  // The condition is evaluated atomically by PostgreSQL. Competing claims can
  // never overwrite an owner, and stale previews cannot extend the deadline.
  const changed = await db.update(lensCheckResponses).set({
    ownerAccountId: account.id, claimedAt: new Date(), claimHash: null, claimExpiresAt: null,
  }).where(and(eq(lensCheckResponses.id, response.id), isNull(lensCheckResponses.ownerAccountId),
    eq(lensCheckResponses.claimHash, hashProof(proof!)), gt(lensCheckResponses.claimExpiresAt, new Date())))
    .returning({ id: lensCheckResponses.id });
  if (changed.length) return "owned" as const;
  const [current] = await db.select({ owner: lensCheckResponses.ownerAccountId }).from(lensCheckResponses)
    .where(eq(lensCheckResponses.id, response.id)).limit(1);
  return current?.owner === account.id ? "owned" as const : "not_found" as const;
}

export async function listAccountResults(principal: Principal) {
  const accountId = await findAccount(principal);
  if (!accountId) return [];
  return getDb().select({
    token: lensCheckResponses.token, createdAt: lensCheckResponses.createdAt,
    questionnaireVersion: lensCheckResponses.questionnaireVersion, resultKind: lensCheckResponses.resultKind,
    archetypeId: lensCheckResponses.archetypeId,
  }).from(lensCheckResponses)
    .where(and(eq(lensCheckResponses.ownerAccountId, accountId), eq(lensCheckResponses.accountRequired, true)))
    .orderBy(desc(lensCheckResponses.createdAt), desc(lensCheckResponses.id)).limit(50);
}

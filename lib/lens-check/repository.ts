import "server-only";
import { and, desc, eq, gte, lt, isNull, sql } from "drizzle-orm";
import { getDb } from "./db/client";
import { lensCheckLeads, lensCheckResponses } from "./db/schema";
import type { InsightRow } from "./insights";
import type { Answers, FinalResult, HelpfulRating, MissingReasons, ResponseSource } from "./types";
import { accountsEnabled, attemptKey, CLAIM_LIFETIME_SECONDS, hashProof } from "./account-policy";
import { accessForResponse } from "./accounts";

// Plenty for a coaching site; the dashboard notes when it is reached.
export const INSIGHTS_ROW_LIMIT = 20000;

// Bump when the follow-up consent wording on the email step changes.
export const CONSENT_WORDING_VERSION = "follow-up-v2";

export const RESULT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

function createResultToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes).toString("base64url");
}

export async function createResponse(input: {
  questionnaireVersion: string;
  answers: Answers;
  missingReasons: MissingReasons;
  result: FinalResult;
  source: ResponseSource | null;
  account?: { browserProof: string; submissionId: string };
}) {
  const token = createResultToken();
  const key = input.account ? attemptKey(input.account.browserProof, input.account.submissionId) : null;
  const submissionHash = input.account ? hashProof(JSON.stringify({
    version: input.questionnaireVersion, answers: input.answers, missing: input.missingReasons,
  })) : null;

  const inserted = await getDb().insert(lensCheckResponses).values({
    token,
    questionnaireVersion: input.questionnaireVersion,
    cohort: process.env.LENS_CHECK_REPORTING_COHORT === "test" ? "test" : "live",
    answers: input.answers,
    missingReasons: input.missingReasons,
    scoring: input.result,
    resultKind: input.result.status,
    archetypeId: input.result.primaryId,
    secondaryArchetypeId: input.result.secondaryId,
    source: input.source,
    accountRequired: Boolean(input.account),
    claimHash: input.account ? hashProof(input.account.browserProof) : null,
    claimExpiresAt: input.account ? new Date(Date.now() + CLAIM_LIFETIME_SECONDS * 1000) : null,
    attemptKey: key,
    submissionHash,
  }).onConflictDoNothing({ target: lensCheckResponses.attemptKey }).returning({ token: lensCheckResponses.token });

  if (!inserted.length && key) {
    const [existing] = await getDb().select({ token: lensCheckResponses.token, hash: lensCheckResponses.submissionHash })
      .from(lensCheckResponses).where(eq(lensCheckResponses.attemptKey, key)).limit(1);
    if (existing?.hash !== submissionHash) throw new Error("SUBMISSION_CONFLICT");
    return { token: existing.token };
  }

  return { token };
}

export async function getResponseByToken(token: string) {
  const [row] = await getDb()
    .select({
      response: lensCheckResponses,
      lead: {
        email: lensCheckLeads.email,
        firstName: lensCheckLeads.firstName,
        followUpConsent: lensCheckLeads.followUpConsent,
      },
    })
    .from(lensCheckResponses)
    .leftJoin(lensCheckLeads, eq(lensCheckResponses.leadId, lensCheckLeads.id))
    .where(eq(lensCheckResponses.token, token))
    .limit(1);

  if (!row) return null;
  const access = await accessForResponse(row.response);
  return access === "denied" ? null : { ...row, lead: !row.response.accountRequired && accountsEnabled() ? null : row.lead, access };
}

export type ClaimOutcome = "claimed" | "already_claimed" | "not_found" | "account_required";

export async function claimResponse(
  token: string,
  lead: { email: string; firstName: string | null; followUpConsent: boolean },
): Promise<ClaimOutcome> {
  const db = getDb();

  const [response] = await db
    .select({ id: lensCheckResponses.id, leadId: lensCheckResponses.leadId, accountRequired: lensCheckResponses.accountRequired })
    .from(lensCheckResponses)
    .where(eq(lensCheckResponses.token, token))
    .limit(1);

  if (!response) {
    return "not_found";
  }
  if (response.accountRequired) return "account_required";

  if (response.leadId) {
    return "already_claimed";
  }

  const now = new Date();
  // A returning visitor keeps any consent they gave before; unticking the box
  // on a later attempt is not treated as a withdrawal.
  const [savedLead] = await db
    .insert(lensCheckLeads)
    .values({
      email: lead.email,
      firstName: lead.firstName,
      followUpConsent: lead.followUpConsent,
      followUpConsentAt: lead.followUpConsent ? now : null,
      consentWordingVersion: lead.followUpConsent ? CONSENT_WORDING_VERSION : null,
    })
    .onConflictDoUpdate({
      target: lensCheckLeads.email,
      set: {
        firstName: sql`coalesce(excluded.first_name, ${lensCheckLeads.firstName})`,
        followUpConsent: sql`${lensCheckLeads.followUpConsent} or excluded.follow_up_consent`,
        followUpConsentAt: sql`case when excluded.follow_up_consent and not ${lensCheckLeads.followUpConsent} then excluded.follow_up_consent_at else ${lensCheckLeads.followUpConsentAt} end`,
        consentWordingVersion: sql`case when excluded.follow_up_consent and not ${lensCheckLeads.followUpConsent} then excluded.consent_wording_version else ${lensCheckLeads.consentWordingVersion} end`,
        updatedAt: now,
      },
    })
    .returning({ id: lensCheckLeads.id });

  const claimed = await db
    .update(lensCheckResponses)
    .set({ leadId: savedLead.id, claimedAt: now })
    .where(and(eq(lensCheckResponses.id, response.id), isNull(lensCheckResponses.leadId), eq(lensCheckResponses.accountRequired, false)))
    .returning({ id: lensCheckResponses.id });

  return claimed.length > 0 ? "claimed" : "already_claimed";
}

// Every response to one questionnaire version, newest first, with lead
// details where the reading was unlocked. For Sam's dashboard and exports.
export async function listResponsesForInsights(questionnaireVersion: string, range?: { from: Date; to: Date; cohort?: string }): Promise<InsightRow[]> {
  return getDb()
    .select({
      analysisId: lensCheckResponses.id,
      cohort: lensCheckResponses.cohort,
      questionnaireVersion: lensCheckResponses.questionnaireVersion,
      accountRequired: lensCheckResponses.accountRequired,
      ownerAccountId: lensCheckResponses.ownerAccountId,
      helpfulRatedAt: lensCheckResponses.helpfulRatedAt,
      token: lensCheckResponses.token,
      createdAt: lensCheckResponses.createdAt,
      claimedAt: lensCheckResponses.claimedAt,
      answers: lensCheckResponses.answers,
      missingReasons: lensCheckResponses.missingReasons,
      scoring: lensCheckResponses.scoring,
      resultKind: lensCheckResponses.resultKind,
      archetypeId: lensCheckResponses.archetypeId,
      secondaryArchetypeId: lensCheckResponses.secondaryArchetypeId,
      source: lensCheckResponses.source,
      helpfulRating: lensCheckResponses.helpfulRating,
      email: lensCheckLeads.email,
      firstName: lensCheckLeads.firstName,
      followUpConsent: lensCheckLeads.followUpConsent,
    })
    .from(lensCheckResponses)
    .leftJoin(lensCheckLeads, eq(lensCheckResponses.leadId, lensCheckLeads.id))
    .where(and(eq(lensCheckResponses.questionnaireVersion, questionnaireVersion), ...(range ? [gte(lensCheckResponses.createdAt, range.from), lt(lensCheckResponses.createdAt, range.to), ...(range.cohort && range.cohort !== "all" ? [eq(lensCheckResponses.cohort, range.cohort)] : [])] : [])))
    .orderBy(desc(lensCheckResponses.createdAt))
    .limit(INSIGHTS_ROW_LIMIT);
}

export async function saveFeedback(token: string, rating: HelpfulRating) {
  const row = await getResponseByToken(token);
  if (!row || (row.response.accountRequired && row.access !== "owner")) return false;
  const updated = await getDb()
    .update(lensCheckResponses)
    .set({ helpfulRating: rating, helpfulRatedAt: new Date() })
    .where(eq(lensCheckResponses.token, token))
    .returning({ id: lensCheckResponses.id });

  return updated.length > 0;
}

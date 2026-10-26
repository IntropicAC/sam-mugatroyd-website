import "server-only";
import { and, desc, eq, gte, isNull, lt, or, sql } from "drizzle-orm";
import { getDb } from "./db/client";
import { lensCheckJourneys, lensCheckResponses } from "./db/schema";
import { hashProof } from "./account-policy";
import { JOURNEY_RETENTION_DAYS, parseJourney } from "./journey-policy";
import type { ResponseSource } from "./types";

export async function recordJourney(packet: NonNullable<ReturnType<typeof parseJourney>>, source: ResponseSource | null) {
  const { secret, ...data } = packet;
  const now = new Date();
  const cohort = process.env.LENS_CHECK_REPORTING_COHORT === "test" ? "test" : "live";
  await getDb().insert(lensCheckJourneys).values({
    ...data, secretHash: hashProof(secret), source,
    cohort, lastSeenAt: now,
  }).onConflictDoUpdate({ target: lensCheckJourneys.secretHash,
    set: { ...data, withdrawnAt: null,
      startedAt: sql`case when ${lensCheckJourneys.withdrawnAt} is not null then ${now.toISOString()}::timestamptz else ${lensCheckJourneys.startedAt} end`,
      cohort: sql`case when ${lensCheckJourneys.withdrawnAt} is not null then ${cohort} else ${lensCheckJourneys.cohort} end`,
      source: sql`case when ${lensCheckJourneys.withdrawnAt} is not null then ${JSON.stringify(source)}::jsonb else ${lensCheckJourneys.source} end`,
      questionId: data.questionId ?? sql`${lensCheckJourneys.questionId}`,
      questionNumber: data.questionId ? data.questionNumber : sql`${lensCheckJourneys.questionNumber}`,
      furthestQuestion: sql`greatest(${lensCheckJourneys.furthestQuestion}, ${data.furthestQuestion})`,
      activeSeconds: sql`greatest(${lensCheckJourneys.activeSeconds}, ${data.activeSeconds})`,
      errorCount: sql`greatest(${lensCheckJourneys.errorCount}, ${data.errorCount})`, lastSeenAt: now },
    setWhere: and(sql`${lensCheckJourneys.sequence} < ${data.sequence}`, or(eq(lensCheckJourneys.questionnaireVersion, data.questionnaireVersion), eq(lensCheckJourneys.questionnaireVersion, "withdrawn"))),
  });
}
export async function completeJourney(secret: unknown, token: string, version: string) {
  if (typeof secret !== "string" || !/^[0-9a-f-]{36}$/i.test(secret)) return;
  const [response] = await getDb().select({ id: lensCheckResponses.id, createdAt: lensCheckResponses.createdAt })
    .from(lensCheckResponses).where(eq(lensCheckResponses.token, token)).limit(1);
  if (!response) return;
  await getDb().update(lensCheckJourneys).set({ responseId: response.id, completedAt: response.createdAt, stage: "completed", lastSeenAt: new Date() })
    .where(and(eq(lensCheckJourneys.secretHash, hashProof(secret)), eq(lensCheckJourneys.questionnaireVersion, version), isNull(lensCheckJourneys.withdrawnAt)));
}
export async function withdrawJourney(secret: string) {
  const now = new Date();
  // Keep only a short-lived proof/sequence tombstone to reject older in-flight writes.
  const erased = { withdrawnAt: now, stage: "withdrawn", questionId: null, questionNumber: 0, furthestQuestion: 0,
    processedCount: 0, answeredCount: 0, skippedCount: 0, notApplicableCount: 0, activeSeconds: 0, errorCount: 0,
    source: null, responseId: null, completedAt: null, device: "unknown", sequence: now.getTime() * 1000 + 999,
    questionnaireVersion: "withdrawn", noticeVersion: "withdrawn", cohort: "unknown", totalQuestions: 0,
    startedAt: now, lastSeenAt: now };
  await getDb().insert(lensCheckJourneys).values({ ...erased, secretHash: hashProof(secret), questionnaireVersion: "withdrawn",
    noticeVersion: "progress-v1", cohort: "unknown", totalQuestions: 0 })
    .onConflictDoUpdate({ target: lensCheckJourneys.secretHash, set: erased });
}
export async function pruneJourneys() {
  // Run by the local launcher and scheduled maintenance in production.
  return getDb().delete(lensCheckJourneys).where(lt(lensCheckJourneys.startedAt, new Date(Date.now() - JOURNEY_RETENTION_DAYS * 86400000)));
}
export async function listJourneys(version: string, from: Date, to: Date, cohort: string) {
  const retentionStart = new Date(Date.now() - JOURNEY_RETENTION_DAYS * 86400000);
  return getDb().select({
    id: lensCheckJourneys.id, startedAt: lensCheckJourneys.startedAt, lastSeenAt: lensCheckJourneys.lastSeenAt,
    completedAt: lensCheckJourneys.completedAt, claimedAt: lensCheckResponses.claimedAt,
    stage: lensCheckJourneys.stage, questionId: lensCheckJourneys.questionId, questionNumber: lensCheckJourneys.questionNumber,
    furthestQuestion: lensCheckJourneys.furthestQuestion, totalQuestions: lensCheckJourneys.totalQuestions,
    processedCount: lensCheckJourneys.processedCount, answeredCount: lensCheckJourneys.answeredCount,
    skippedCount: lensCheckJourneys.skippedCount, notApplicableCount: lensCheckJourneys.notApplicableCount,
    activeSeconds: lensCheckJourneys.activeSeconds, errorCount: lensCheckJourneys.errorCount,
    device: lensCheckJourneys.device, cohort: lensCheckJourneys.cohort, source: lensCheckJourneys.source,
  }).from(lensCheckJourneys).leftJoin(lensCheckResponses, eq(lensCheckJourneys.responseId, lensCheckResponses.id))
    .where(and(isNull(lensCheckJourneys.withdrawnAt), eq(lensCheckJourneys.questionnaireVersion, version), gte(lensCheckJourneys.startedAt, from > retentionStart ? from : retentionStart), lt(lensCheckJourneys.startedAt, to),
      ...(cohort === "all" ? [] : [eq(lensCheckJourneys.cohort, cohort)])))
    .orderBy(desc(lensCheckJourneys.startedAt)).limit(20000);
}
export type JourneyRow = Awaited<ReturnType<typeof listJourneys>>[number];

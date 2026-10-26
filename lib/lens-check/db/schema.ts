import { bigint, boolean, check, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type {
  Answers,
  FinalResult,
  HelpfulRating,
  MissingReasons,
  ResponseSource,
  ResultStatus,
} from "@/lib/lens-check/types";

// Legacy email-unlock contacts. Account-owned results use the separate identity
// mapping below; deleting a legacy lead does not delete a verified account.
export const lensCheckLeads = pgTable("lens_check_leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  followUpConsent: boolean("follow_up_consent").notNull().default(false),
  followUpConsentAt: timestamp("follow_up_consent_at", { withTimezone: true }),
  consentWordingVersion: text("consent_wording_version"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Stable local account identity. Provider subjects, rather than email strings,
// anchor result ownership. No IP addresses or user agents are stored.
export const lensCheckAccounts = pgTable("lens_check_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authIssuer: text("auth_issuer").notNull(),
  authSubject: text("auth_subject").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("lens_check_accounts_identity_idx").on(table.authIssuer, table.authSubject)]);

// One completion, preserving its content version. Account-required rows remain
// private independently of the feature switch used for creating new attempts.
export const lensCheckResponses = pgTable(
  "lens_check_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull().unique(),
    questionnaireVersion: text("questionnaire_version").notNull(),
    cohort: text("cohort").notNull().default("unknown"),
    // Core and follow-up answers, 0-4 or null. Why each null is null (not
    // applicable or skipped) is kept beside them.
    answers: jsonb("answers").$type<Answers>().notNull(),
    missingReasons: jsonb("missing_reasons").$type<MissingReasons>(),
    // The full scorer output: status, reason, every archetype's index and
    // which follow-ups were asked. Null only on rows from before v0.2.
    scoring: jsonb("scoring").$type<FinalResult>(),
    resultKind: text("result_kind").$type<ResultStatus>().notNull(),
    archetypeId: text("archetype_id"),
    secondaryArchetypeId: text("secondary_archetype_id"),
    source: jsonb("source").$type<ResponseSource>(),
    helpfulRating: text("helpful_rating").$type<HelpfulRating>(),
    helpfulRatedAt: timestamp("helpful_rated_at", { withTimezone: true }),
    leadId: uuid("lead_id").references(() => lensCheckLeads.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    accountRequired: boolean("account_required").notNull().default(false),
    ownerAccountId: uuid("owner_account_id").references(() => lensCheckAccounts.id),
    claimHash: text("claim_hash"),
    claimExpiresAt: timestamp("claim_expires_at", { withTimezone: true }),
    attemptKey: text("attempt_key").unique(),
    submissionHash: text("submission_hash"),
  },
  (table) => [
    index("lens_check_responses_lead_id_idx").on(table.leadId),
    index("lens_check_responses_owner_idx").on(table.ownerAccountId, table.createdAt),
    check("lens_check_response_account_owner", sql`${table.ownerAccountId} IS NULL OR ${table.accountRequired} = true`),
  ],
);

export type LensCheckResponseRow = typeof lensCheckResponses.$inferSelect;
export type LensCheckLeadRow = typeof lensCheckLeads.$inferSelect;

// Optional first-party measurements: no partial answers, email, IP, or user agent.
export const lensCheckJourneys = pgTable("lens_check_journeys", {
  id: uuid("id").primaryKey().defaultRandom(),
  secretHash: text("secret_hash").notNull().unique(),
  questionnaireVersion: text("questionnaire_version").notNull(),
  noticeVersion: text("notice_version").notNull(),
  cohort: text("cohort").notNull(),
  device: text("device").notNull(),
  source: jsonb("source").$type<ResponseSource>(),
  stage: text("stage").notNull(),
  questionId: text("question_id"),
  questionNumber: integer("question_number").notNull().default(0),
  furthestQuestion: integer("furthest_question").notNull().default(0),
  totalQuestions: integer("total_questions").notNull(),
  processedCount: integer("processed_count").notNull().default(0),
  answeredCount: integer("answered_count").notNull().default(0),
  skippedCount: integer("skipped_count").notNull().default(0),
  notApplicableCount: integer("not_applicable_count").notNull().default(0),
  activeSeconds: integer("active_seconds").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  sequence: bigint("sequence", { mode: "number" }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  responseId: uuid("response_id").references(() => lensCheckResponses.id, { onDelete: "set null" }),
  withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
}, (table) => [index("lens_check_journeys_report_idx").on(table.questionnaireVersion, table.startedAt)]);

export const lensCheckReportAccess = pgTable("lens_check_report_access", {
  email: text("email").primaryKey(),
  role: text("role").$type<"viewer" | "admin">().notNull(),
  grantedBy: text("granted_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lensCheckReportAudit = pgTable("lens_check_report_audit", {
  id: uuid("id").primaryKey().defaultRandom(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  target: text("target"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

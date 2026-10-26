import { NOT_APPLICABLE_LABEL, SKIPPED_LABEL } from "./scale";
import { listTitles } from "./titles";
import type {
  Answers,
  FinalResult,
  HelpfulRating,
  MissingReason,
  MissingReasons,
  QuestionnaireContent,
  ResponseSource,
  ResponseValue,
  ResultStatus,
} from "./types";

// One stored response with its lead (if unlocked), as the dashboard and
// exports need it.
export interface InsightRow {
  analysisId?: string;
  cohort?: string;
  questionnaireVersion?: string;
  accountRequired?: boolean;
  ownerAccountId?: string | null;
  helpfulRatedAt?: Date | null;
  token: string;
  createdAt: Date;
  claimedAt: Date | null;
  answers: Answers;
  missingReasons: MissingReasons | null;
  scoring: FinalResult | null;
  resultKind: ResultStatus;
  archetypeId: string | null;
  secondaryArchetypeId: string | null;
  source: ResponseSource | null;
  helpfulRating: HelpfulRating | null;
  email: string | null;
  firstName: string | null;
  followUpConsent: boolean | null;
}

// A question needs this many answers before it is flagged.
const MIN_ANSWERS_FOR_FLAGS = 10;
const MOSTLY_SAME_SHARE = 0.7;
const OFTEN_MISSING_SHARE = 0.3;
const DAY_MS = 24 * 60 * 60 * 1000;

export const RESULT_STATUS_LABELS: Record<ResultStatus, string> = {
  matched: "Clear pattern",
  mixed: "Between patterns",
  unclear: "No single pattern",
  insufficient_data: "Not enough answers",
};

export const HELPFUL_LABELS: Record<HelpfulRating, string> = {
  yes: "Yes",
  somewhat: "Somewhat",
  no: "Not really",
};

export type QuestionFlag = "mostly-same" | "often-missing";

export function answerLabel(
  content: QuestionnaireContent,
  value: ResponseValue | null | undefined,
  reason: MissingReason | undefined,
) {
  if (value === undefined) return "";
  if (value === null) return reason === "skipped" ? SKIPPED_LABEL : NOT_APPLICABLE_LABEL;
  return content.responseScale[value]?.label ?? "";
}

function titleOf(content: QuestionnaireContent, id: string | null | undefined) {
  return id ? (content.archetypes.find((archetype) => archetype.id === id)?.title ?? id) : "";
}

// The pattern(s) a stored response describes, for tables and exports.
export function resultTitles(content: QuestionnaireContent, row: Pick<InsightRow, "resultKind" | "archetypeId" | "scoring">) {
  if (row.resultKind === "matched") return [titleOf(content, row.archetypeId)];
  if (row.resultKind === "mixed") return (row.scoring?.candidateIds ?? []).map((id) => titleOf(content, id));
  return [];
}

export function resultSummary(content: QuestionnaireContent, row: Pick<InsightRow, "resultKind" | "archetypeId" | "scoring">) {
  const titles = resultTitles(content, row);
  if (row.resultKind === "matched" && titles[0]) return titles[0];
  if (row.resultKind === "mixed" && titles.length > 0) return `Between ${listTitles(titles)}`;
  return RESULT_STATUS_LABELS[row.resultKind] ?? row.resultKind;
}

function share(part: number, whole: number) {
  return whole > 0 ? part / whole : null;
}

export function summarise(
  content: QuestionnaireContent,
  rows: InsightRow[],
  options: { now?: Date; sourceLabel?: (slug: string) => string } = {},
) {
  const now = options.now ?? new Date();
  const sourceLabel = options.sourceLabel ?? ((slug: string) => slug);
  const followupIds = new Set(content.followups.map((question) => question.id));

  const completed = rows.length;
  const unlockedRows = rows.filter((row) => row.claimedAt !== null);
  const followUpEmails = new Set(
    rows.filter((row) => row.followUpConsent && row.email).map((row) => row.email as string),
  );

  const helpful = { yes: 0, somewhat: 0, no: 0 };
  for (const row of rows) {
    if (row.helpfulRating) helpful[row.helpfulRating] += 1;
  }
  const rated = helpful.yes + helpful.somewhat + helpful.no;

  const outcomes = (Object.keys(RESULT_STATUS_LABELS) as ResultStatus[]).map((status) => ({
    status,
    label: RESULT_STATUS_LABELS[status],
    count: rows.filter((row) => row.resultKind === status).length,
  }));

  const patterns = content.archetypes
    .map((archetype) => ({
      id: archetype.id,
      title: archetype.title,
      matched: rows.filter((row) => row.resultKind === "matched" && row.archetypeId === archetype.id).length,
      between: rows.filter((row) => row.resultKind === "mixed" && row.scoring?.candidateIds.includes(archetype.id)).length,
      secondary: rows.filter((row) => row.resultKind === "matched" && row.secondaryArchetypeId === archetype.id).length,
    }))
    .sort((a, b) => b.matched - a.matched || b.between - a.between);

  const askedFollowups = rows.filter((row) => Object.keys(row.answers).some((id) => followupIds.has(id))).length;

  const questions = [...content.questions, ...content.followups].map((question) => {
    const isFollowup = followupIds.has(question.id);
    const counts: number[] = content.responseScale.map(() => 0);
    let shown = 0;
    let notApplicable = 0;
    let skipped = 0;
    for (const row of rows) {
      if (!Object.hasOwn(row.answers, question.id)) continue;
      shown += 1;
      const value = row.answers[question.id];
      if (value === null) {
        if (row.missingReasons?.[question.id] === "not_applicable") notApplicable += 1;
        else skipped += 1;
        continue;
      }
      if (counts[value] !== undefined) counts[value] += 1;
    }
    const answered = shown - notApplicable - skipped;
    const options = content.responseScale.map((step, index) => ({ label: step.label, count: counts[index] }));
    const top = [...options].sort((a, b) => b.count - a.count)[0];
    const topShare = answered > 0 && top ? top.count / answered : null;
    const missingShare = shown > 0 ? (notApplicable + skipped) / shown : 0;
    const flags: QuestionFlag[] = [];
    if (answered >= MIN_ANSWERS_FOR_FLAGS && topShare !== null && topShare >= MOSTLY_SAME_SHARE) flags.push("mostly-same");
    if (shown >= MIN_ANSWERS_FOR_FLAGS && missingShare >= OFTEN_MISSING_SHARE) flags.push("often-missing");
    return {
      id: question.id,
      text: question.text,
      isFollowup,
      shown,
      answered,
      notApplicable,
      skipped,
      options,
      topLabel: answered > 0 && top ? top.label : null,
      topShare,
      missingShare,
      flags,
    };
  });

  const sourceCounts = new Map<string, number>();
  for (const row of rows) {
    const label = row.source?.from ? sourceLabel(row.source.from) : "Direct or other";
    sourceCounts.set(label, (sourceCounts.get(label) ?? 0) + 1);
  }
  const sources = [...sourceCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  return {
    completed,
    unlocked: unlockedRows.length,
    unlockRate: share(unlockedRows.length, completed),
    followUpPeople: followUpEmails.size,
    last7Days: rows.filter((row) => now.getTime() - row.createdAt.getTime() <= 7 * DAY_MS).length,
    last30Days: rows.filter((row) => now.getTime() - row.createdAt.getTime() <= 30 * DAY_MS).length,
    helpful: { ...helpful, rated, usefulShare: share(helpful.yes + helpful.somewhat, rated) },
    outcomes,
    patterns,
    askedFollowups,
    questions,
    sources,
  };
}

export type InsightsSummary = ReturnType<typeof summarise>;

// ---------- Excel-ready CSV ----------

const UTF8_BOM = "﻿";

function csvCell(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  // A leading =, +, - or @ would run as a formula in Excel; prefix it.
  const text = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: (string | number | null | undefined)[][]) {
  return UTF8_BOM + rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

const londonDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatLondonDate(date: Date | null) {
  return date ? londonDate.format(date).replace(",", "") : "";
}

// People who unlocked their reading, newest first. Contains emails: for Sam's
// follow-up only.
export function leadsCsv(
  content: QuestionnaireContent,
  rows: InsightRow[],
  readingUrl: (token: string) => string,
  sourceLabel: (slug: string) => string = (slug) => slug,
) {
  const people = rows
    .filter((row) => row.email)
    .sort((a, b) => (b.claimedAt?.getTime() ?? 0) - (a.claimedAt?.getTime() ?? 0));
  return toCsv([
    ["Unlocked", "First name", "Email", "Happy to hear from Sam", "Result", "Pattern", "Also some", "Came from", "Found it useful", "Reading"],
    ...people.map((row) => [
      formatLondonDate(row.claimedAt),
      row.firstName ?? "",
      row.email,
      row.followUpConsent ? "Yes" : "No",
      RESULT_STATUS_LABELS[row.resultKind] ?? row.resultKind,
      resultTitles(content, row).join(" / "),
      row.resultKind === "matched" ? titleOf(content, row.secondaryArchetypeId) : "",
      row.source?.from ? sourceLabel(row.source.from) : "Direct or other",
      row.helpfulRating ? HELPFUL_LABELS[row.helpfulRating] : "",
      readingUrl(row.token),
    ]),
  ]);
}

// Every completed response, oldest first, without names, emails or result
// links. These are pseudonymous records, not automatically safe to share. Indices are
// 0-100 arithmetic summaries, not percentages or probabilities.
export function answersCsv(content: QuestionnaireContent, rows: InsightRow[]) {
  const ordered = [...rows].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const header = [
    "Response",
    "Completed",
    "Questionnaire version", "Completed UTC", "Saved UTC", "Access", "Feedback UTC",
    "Result",
    "Pattern",
    "Also some",
    ...content.archetypes.map((archetype) => `${archetype.title} index (0-100)`),
    ...content.questions.map((question) => `${question.id}: ${question.text}`),
    ...content.followups.map((question) => `${question.id} (follow-up): ${question.text}`),
    "Found it useful",
    "Came from",
    "Data cohort", "UTM source", "UTM medium", "UTM campaign", "UTM content", "UTM term",
    ...[...content.questions, ...content.followups].flatMap(question => [`${question.id} code (0-4)`, `${question.id} missing reason`]),
  ];
  return toCsv([
    header,
    ...ordered.map((row, index) => [
      row.analysisId || `R${String(index + 1).padStart(4, "0")}`,
      formatLondonDate(row.createdAt),
      row.questionnaireVersion || content.version, row.createdAt.toISOString(), row.claimedAt?.toISOString() || "",
      row.accountRequired ? row.ownerAccountId ? "Saved to account" : "Awaiting account" : "Legacy", row.helpfulRatedAt?.toISOString() || "",
      RESULT_STATUS_LABELS[row.resultKind] ?? row.resultKind,
      resultTitles(content, row).join(" / "),
      row.resultKind === "matched" ? titleOf(content, row.secondaryArchetypeId) : "",
      ...content.archetypes.map((archetype) => {
        const index = row.scoring?.profiles.find((profile) => profile.id === archetype.id)?.index;
        return index === null || index === undefined ? "" : Math.round(index);
      }),
      ...[...content.questions, ...content.followups].map((question) =>
        answerLabel(content, row.answers[question.id], row.missingReasons?.[question.id]),
      ),
      row.helpfulRating ? HELPFUL_LABELS[row.helpfulRating] : "",
      row.source?.from ?? "",
      row.cohort || "unknown", row.source?.utm?.utm_source, row.source?.utm?.utm_medium, row.source?.utm?.utm_campaign, row.source?.utm?.utm_content, row.source?.utm?.utm_term,
      ...[...content.questions, ...content.followups].flatMap(question => [row.answers[question.id] ?? "", row.answers[question.id] === undefined ? "not_asked" : row.answers[question.id] === null ? row.missingReasons?.[question.id] || "not_applicable" : ""]),
    ]),
  ]);
}

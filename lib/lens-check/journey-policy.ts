import type { QuestionnaireContent } from "./types";

export const JOURNEY_NOTICE_VERSION = "progress-v1";
export const JOURNEY_STAGES = ["map", "question", "followup-intro", "focusing", "error"] as const;
export const JOURNEY_INACTIVE_MS = 30 * 60 * 1000;
export const JOURNEY_RETENTION_DAYS = 90;
export function parseJourney(raw: unknown, content: QuestionnaireContent) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const data = raw as Record<string, unknown>;
  const number = (key: string, max: number) => typeof data[key] === "number" && Number.isInteger(data[key]) && (data[key] as number) >= 0 && (data[key] as number) <= max;
  const max = content.questions.length + content.followups.length;
  if (data.consent !== true || data.noticeVersion !== JOURNEY_NOTICE_VERSION || data.version !== content.version ||
      typeof data.secret !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.secret) ||
      !JOURNEY_STAGES.includes(data.stage as typeof JOURNEY_STAGES[number]) ||
      !["phone", "tablet", "desktop"].includes(data.device as string) ||
      !["questionNumber", "furthestQuestion", "processedCount", "answeredCount", "skippedCount", "notApplicableCount", "totalQuestions"].every(key => number(key, max)) ||
      !number("activeSeconds", 86400) || !number("errorCount", 1000) || !number("sequence", Number.MAX_SAFE_INTEGER)) return null;
  if ((data.totalQuestions as number) < content.questions.length || (data.questionNumber as number) > (data.totalQuestions as number) ||
      (data.furthestQuestion as number) < (data.questionNumber as number) || (data.furthestQuestion as number) > (data.totalQuestions as number) ||
      (data.processedCount as number) > (data.totalQuestions as number) ||
      (data.answeredCount as number) + (data.skippedCount as number) + (data.notApplicableCount as number) !== data.processedCount) return null;
  const questionId = typeof data.questionId === "string" ? data.questionId : null;
  if (questionId && ![...content.questions, ...content.followups].some(q => q.id === questionId)) return null;
  if (data.stage === "question" && (!questionId || !data.questionNumber)) return null;
  const displayedIds = content.parts.flatMap(part => part.questionIds);
  if (questionId && (data.questionNumber as number) <= content.questions.length && displayedIds[(data.questionNumber as number) - 1] !== questionId) return null;
  if (questionId && (data.questionNumber as number) > content.questions.length && !content.followups.some(question => question.id === questionId)) return null;
  return {
    secret: data.secret, questionnaireVersion: content.version, noticeVersion: JOURNEY_NOTICE_VERSION,
    stage: data.stage as typeof JOURNEY_STAGES[number], device: data.device as string, questionId,
    questionNumber: data.questionNumber as number, furthestQuestion: data.furthestQuestion as number,
    totalQuestions: data.totalQuestions as number, processedCount: data.processedCount as number,
    answeredCount: data.answeredCount as number, skippedCount: data.skippedCount as number,
    notApplicableCount: data.notApplicableCount as number, activeSeconds: data.activeSeconds as number,
    errorCount: data.errorCount as number, sequence: data.sequence as number,
  };
}

export function journeyStatus(row: { completedAt: Date | null; lastSeenAt: Date; claimedAt?: Date | null }, now = new Date()) {
  if (row.completedAt) return row.claimedAt ? "Saved to account" : "Completed · not saved to account";
  return now.getTime() - row.lastSeenAt.getTime() >= JOURNEY_INACTIVE_MS ? "Inactive · may return" : "In progress";
}

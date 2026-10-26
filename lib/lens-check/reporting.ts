import { JOURNEY_INACTIVE_MS, journeyStatus } from "./journey-policy";
import { toCsv } from "./insights";
import type { JourneyRow } from "./journeys";

export function londonDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function londonMidnight(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const utc = new Date(`${day}T00:00:00Z`);
  if (!Number.isFinite(utc.getTime()) || utc.toISOString().slice(0, 10) !== day) return null;
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hourCycle: "h23" }).formatToParts(utc);
  return new Date(utc.getTime() - Number(parts.find(p => p.type === "hour")?.value || 0) * 3600000);
}
export function reportRange(params: Record<string, string | string[] | undefined>, now = new Date()) {
  const fromDay = typeof params.from === "string" && londonMidnight(params.from) ? params.from : londonDay(new Date(now.getTime() - 29 * 86400000));
  const toDay = typeof params.to === "string" && londonMidnight(params.to) ? params.to : londonDay(now);
  const nextDay = new Date(`${toDay}T12:00:00Z`); nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const from = londonMidnight(fromDay)!, to = londonMidnight(nextDay.toISOString().slice(0, 10))!;
  const cohort = ["all", "test", "live", "unknown"].includes(String(params.cohort)) ? String(params.cohort) : "all";
  return { from: from < to ? from : londonMidnight(toDay)!, to, fromDay: from < to ? fromDay : toDay, toDay, cohort };
}
export function duration(seconds: number) {
  return seconds < 60 ? `${Math.round(seconds)}s` : `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}
export function summariseJourneys(rows: JourneyRow[], now = new Date()) {
  const completed = rows.filter(r => r.completedAt);
  const inactive = rows.filter(r => !r.completedAt && now.getTime() - r.lastSeenAt.getTime() >= JOURNEY_INACTIVE_MS);
  const times = completed.map(r => r.activeSeconds).filter(s => s > 0).sort((a, b) => a - b);
  const stops = new Map<string, { questionId: string | null; number: number; count: number }>();
  for (const row of inactive) {
    const key = `${row.questionNumber}:${row.questionId || "before-questions"}`;
    const value = stops.get(key) || { questionId: row.questionId, number: row.questionNumber, count: 0 };
    value.count++; stops.set(key, value);
  }
  return { starts: rows.length, completed: completed.length, saved: completed.filter(r => r.claimedAt).length,
    inactive: inactive.length, active: rows.length - completed.length - inactive.length,
    completionRate: rows.length ? completed.length / rows.length : null,
    medianActive: times.length ? (times[Math.floor((times.length - 1) / 2)] + times[Math.floor(times.length / 2)]) / 2 : null,
    errors: rows.filter(r => r.errorCount > 0).length, stops: [...stops.values()].sort((a, b) => b.count - a.count || a.number - b.number),
    devices: ["phone", "tablet", "desktop"].map(device => ({ device, starts: rows.filter(r => r.device === device).length, completed: completed.filter(r => r.device === device).length })),
  };
}
export function journeysCsv(rows: JourneyRow[], version: string, now = new Date()) {
  return toCsv([
    ["Attempt ID", "Questionnaire version", "Cohort", "Started UTC", "Last seen UTC", "Completed UTC", "Saved UTC", "Status", "Last stage", "Last question ID", "Last question number", "Furthest question number", "Total questions", "Processed", "Answered", "Skipped", "Not applicable", "Approximate active seconds", "Save errors", "Device category", "Entry", "Campaign"],
    ...rows.map(row => [row.id, version, row.cohort, row.startedAt.toISOString(), row.lastSeenAt.toISOString(), row.completedAt?.toISOString(), row.claimedAt?.toISOString(), journeyStatus(row, now), row.stage, row.questionId, row.questionNumber, row.furthestQuestion, row.totalQuestions, row.processedCount, row.answeredCount, row.skippedCount, row.notApplicableCount, row.activeSeconds, row.errorCount, row.device, row.source?.from, row.source?.utm?.utm_campaign]),
  ]);
}

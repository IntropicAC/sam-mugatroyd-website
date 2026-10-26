import { describe, expect, it } from "vitest";
import { activeQuestionnaire as content } from "./content";
import { JOURNEY_NOTICE_VERSION, parseJourney, journeyStatus } from "./journey-policy";
import { journeysCsv, londonMidnight, reportRange, summariseJourneys } from "./reporting";
import type { JourneyRow } from "./journeys";

const now = new Date("2026-10-26T12:00:00Z");
const packet = { secret: "f415bf11-79a7-49b3-8fab-e7b6431dabda", consent: true, noticeVersion: JOURNEY_NOTICE_VERSION, version: content.version,
  stage: "question", device: "phone", questionId: content.parts.flatMap(part => part.questionIds)[16], questionNumber: 17, furthestQuestion: 17,
  totalQuestions: 50, processedCount: 16, answeredCount: 14, skippedCount: 1, notApplicableCount: 1,
  activeSeconds: 180, errorCount: 0, sequence: now.getTime() * 1000 };
const row = (overrides: Partial<JourneyRow> = {}): JourneyRow => ({ id: "stable-attempt-id", startedAt: new Date("2026-10-26T10:00Z"), lastSeenAt: new Date("2026-10-26T10:03Z"), completedAt: null, claimedAt: null,
  stage: "question", questionId: content.questions[16].id, questionNumber: 17, furthestQuestion: 17, totalQuestions: 50,
  processedCount: 16, answeredCount: 14, skippedCount: 1, notApplicableCount: 1, activeSeconds: 180, errorCount: 0, device: "phone", cohort: "test", source: null, ...overrides });

describe("optional progress measurements", () => {
  it("requires explicit consent and never forwards answers, email or client completion claims", () => {
    expect(parseJourney({ ...packet, consent: false }, content)).toBeNull();
    expect(parseJourney({ ...packet, stage: "completed" }, content)).toBeNull();
    const parsed = parseJourney({ ...packet, answers: { Q01: 4 }, email: "private@example.invalid" }, content)!;
    expect(parsed.questionNumber).toBe(17);
    expect(parsed).not.toHaveProperty("answers"); expect(parsed).not.toHaveProperty("email");
  });
  it("rejects impossible or inconsistent checkpoints", () => {
    for (const patch of [{ processedCount: 15 }, { answeredCount: -1 }, { questionNumber: 100 }, { questionId: "UNKNOWN" }, { questionId: content.questions[1].id }, { furthestQuestion: 2 }, { activeSeconds: Infinity }, { sequence: Number.MAX_SAFE_INTEGER + 1 }]) expect(parseJourney({ ...packet, ...patch }, content)).toBeNull();
  });
  it("does not equate a hidden/idle browser with confirmed abandonment", () => {
    expect(journeyStatus(row(), now)).toBe("Inactive · may return");
    expect(journeyStatus(row({ lastSeenAt: now }), now)).toBe("In progress");
    expect(journeyStatus(row({ completedAt: now }), now)).toContain("Completed");
    expect(journeyStatus(row({ completedAt: now, claimedAt: now }), now)).toBe("Saved to account");
  });
  it("computes completion and median only within the measured cohort", () => {
    const summary = summariseJourneys([row(), row({ completedAt: now, activeSeconds: 300 }), row({ completedAt: now, claimedAt: now, activeSeconds: 600 }), row({ lastSeenAt: now, errorCount: 1 })], now);
    expect(summary).toMatchObject({ starts: 4, completed: 2, saved: 1, inactive: 1, active: 1, completionRate: .5, medianActive: 450, errors: 1 });
    expect(summary.stops[0]).toMatchObject({ number: 17, count: 1 });
  });
  it("exports stable identifiers and precise timestamps without secrets or answers", () => {
    const csv = journeysCsv([row({ source: { from: "home", utm: { utm_campaign: "=danger" } } })], content.version, now);
    expect(csv).toContain("stable-attempt-id"); expect(csv).toContain("2026-10-26T10:00:00.000Z");
    expect(csv).toContain("'=danger"); expect(csv).not.toContain(packet.secret); expect(csv).not.toContain("secret_hash");
  });
});
describe("London reporting date boundaries", () => {
  it("handles the clocks changing without dropping or duplicating an hour", () => {
    expect(londonMidnight("2026-03-29")?.toISOString()).toBe("2026-03-29T00:00:00.000Z");
    expect(londonMidnight("2026-03-30")?.toISOString()).toBe("2026-03-29T23:00:00.000Z");
    expect(londonMidnight("2026-10-25")?.toISOString()).toBe("2026-10-24T23:00:00.000Z");
    expect(londonMidnight("2026-10-26")?.toISOString()).toBe("2026-10-26T00:00:00.000Z");
  });
  it("rejects impossible dates and uses inclusive end dates", () => {
    expect(londonMidnight("2026-02-31")).toBeNull();
    const range = reportRange({ from: "2026-10-25", to: "2026-10-25", cohort: "test" }, now);
    expect(range.to.getTime() - range.from.getTime()).toBe(25 * 3600000);
    expect(range.cohort).toBe("test");
  });
});

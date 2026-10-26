import { describe, expect, it } from "vitest";
import { perception47V02 as content } from "./content/perception47-v0-2";
import { answersCsv, leadsCsv, resultSummary, summarise, type InsightRow } from "./insights";
import { isFinal, scoreQuestionnaire } from "./scoring";
import { answersFitting } from "./test-helpers";
import type { Answers, MissingReasons } from "./types";

const NOW = new Date("2026-10-18T12:00:00Z");

function makeRow(answers: Answers, overrides: Partial<InsightRow> = {}, missingReasons: MissingReasons = {}): InsightRow {
  const result = scoreQuestionnaire(content, answers);
  if (!isFinal(result)) throw new Error("fixture needs a final result");
  return {
    token: `token-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date("2026-10-17T10:00:00Z"),
    claimedAt: null,
    answers,
    missingReasons,
    scoring: result,
    resultKind: result.status,
    archetypeId: result.primaryId,
    secondaryArchetypeId: result.secondaryId,
    source: null,
    helpfulRating: null,
    email: null,
    firstName: null,
    followUpConsent: null,
    ...overrides,
  };
}

const heir = answersFitting(content, ["heir"]);
const between = answersFitting(content, ["heir", "hesitant_believer"]);

describe("summarise", () => {
  it("counts completions, unlocks, consent, usefulness and outcomes", () => {
    const rows = [
      makeRow(heir, {
        claimedAt: NOW,
        email: "jo@example.com",
        followUpConsent: true,
        helpfulRating: "yes",
        source: { from: "how-to-stop-overthinking" },
      }),
      makeRow(heir, { claimedAt: NOW, email: "jo@example.com", followUpConsent: true, helpfulRating: "somewhat" }),
      makeRow(between, { helpfulRating: "no", createdAt: new Date("2026-08-01T10:00:00Z") }),
    ];

    const summary = summarise(content, rows, { now: NOW, sourceLabel: (slug) => `Article: ${slug}` });

    expect(summary.completed).toBe(3);
    expect(summary.unlocked).toBe(2);
    expect(summary.followUpPeople).toBe(1);
    expect(summary.last7Days).toBe(2);
    expect(summary.helpful.usefulShare).toBeCloseTo(2 / 3);
    expect(summary.outcomes.find((o) => o.status === "matched")?.count).toBe(2);
    expect(summary.outcomes.find((o) => o.status === "mixed")?.count).toBe(1);
    expect(summary.patterns[0]).toMatchObject({ id: "heir", matched: 2, between: 1 });
    expect(summary.patterns.find((p) => p.id === "hesitant_believer")).toMatchObject({ matched: 0, between: 1 });
    expect(summary.sources).toContainEqual({ label: "Article: how-to-stop-overthinking", count: 1 });
  });

  it("flags statements most people answer the same way, and ones often not answered", () => {
    const rows = Array.from({ length: 12 }, () =>
      makeRow({ ...heir, Q07: null }, {}, { Q07: "not_applicable" }),
    );
    const summary = summarise(content, rows, { now: NOW });

    const q31 = summary.questions.find((q) => q.id === "Q31");
    expect(q31?.flags).toContain("mostly-same");
    expect(q31?.topLabel).toBe("Very true of me");

    const q07 = summary.questions.find((q) => q.id === "Q07");
    expect(q07).toMatchObject({ notApplicable: 12, skipped: 0, flags: ["often-missing"] });
  });

  it("only counts follow-ups for people who were asked them", () => {
    const pair = answersFitting(content, ["loyal_guard", "lighthouse"]);
    const rows = [makeRow({ ...pair, F03: 4, F04: 0 }), makeRow(heir)];
    const summary = summarise(content, rows, { now: NOW });

    expect(summary.askedFollowups).toBe(1);
    expect(summary.questions.find((q) => q.id === "F03")).toMatchObject({ isFollowup: true, shown: 1, answered: 1 });
    expect(summary.questions.find((q) => q.id === "F01")).toMatchObject({ shown: 0 });
  });
});

describe("resultSummary", () => {
  it("names a match, lists a blend and labels the rest", () => {
    expect(resultSummary(content, makeRow(heir))).toBe("The Heir");
    expect(resultSummary(content, makeRow(between))).toBe("Between The Heir and The Hesitant Believer");
    expect(resultSummary(content, makeRow(answersFitting(content, [])))).toBe("No single pattern");
  });
});

describe("CSV exports", () => {
  it("escapes awkward values and stops spreadsheet formulas", () => {
    const rows = [
      makeRow(heir, {
        claimedAt: NOW,
        email: "sam@example.com",
        firstName: '=HYPERLINK("http://x","click"), "quoted"',
        followUpConsent: false,
      }),
    ];
    const csv = leadsCsv(content, rows, (token) => `https://example.com/r/${token}`);

    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain(`"'=HYPERLINK(""http://x"",""click""), ""quoted"""`);
    expect(csv).toContain("sam@example.com");
    expect(csv).toContain("The Heir");
  });

  it("keeps the answers export anonymous and records why answers are missing", () => {
    const rows = [
      makeRow(
        { ...heir, Q01: null, Q02: null },
        { claimedAt: NOW, email: "private@example.com", firstName: "Private" },
        { Q01: "not_applicable", Q02: "skipped" },
      ),
    ];
    const csv = answersCsv(content, rows);
    const [header, line] = csv.replace("﻿", "").split("\r\n");

    expect(csv).not.toContain("private@example.com");
    expect(csv).not.toContain("Private");
    expect(csv).not.toContain(rows[0].token);
    expect(header).toContain("The Heir index (0-100)");
    expect(header).toContain("F01 (follow-up)");
    expect(line).toContain("R0001");
    expect(line).toContain("Not applicable");
    expect(line).toContain("Skipped");
  });
});

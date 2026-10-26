// Seeded synthetic respondents, to catch rule or content changes that make
// results much less accurate or much less often available. These are software
// checks on a made-up response model, not evidence that real people form 14
// types; re-check against pilot answers.
import { describe, expect, it } from "vitest";
import { perception47V03 as content } from "./content/perception47-v0-3";
import { scoreQuestionnaire } from "./scoring";
import type { Answers, ResponseValue } from "./types";

function rng(seed: number) {
  // Scramble the seed so neighbouring seeds don't give similar first draws.
  let state = Math.imul(seed, 2654435761) >>> 0;
  const next = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 4; i++) next();
  const gauss = () => (Array.from({ length: 6 }, next).reduce((a, b) => a + b, 0) - 3) / Math.sqrt(0.5);
  return { next, gauss };
}

const clamp = (value: number) => Math.max(0, Math.min(4, Math.round(value))) as ResponseValue;

// A general agreement level for everyone, 6% skips, and strong answers on
// the markers of the archetypes the person truly fits.
function respondent(seed: number, fits: string[]) {
  const { next, gauss } = rng(seed);
  const base = 1 + next() * 1.6;
  const keyed = new Map<string, boolean>();
  for (const id of fits) {
    for (const marker of content.archetypes.find((a) => a.id === id)!.markers) keyed.set(marker.questionId, marker.reverse);
  }
  const answers: Answers = {};
  for (const question of content.questions) {
    if (next() < 0.06) {
      answers[question.id] = null;
      continue;
    }
    const reverse = keyed.get(question.id);
    answers[question.id] = clamp(
      reverse === undefined ? base + gauss() * 0.9 : reverse ? 0.7 + gauss() * 0.6 : 3.3 + gauss() * 0.6,
    );
  }
  const answerFollowups = (ids: string[]) => {
    for (const id of ids) {
      const supports = content.followups.find((question) => question.id === id)!.supportsArchetypeId;
      answers[id] = clamp(fits.includes(supports) ? 3.3 + gauss() * 0.6 : base + gauss() * 0.9);
    }
  };
  return { answers, answerFollowups };
}

function run(fits: (i: number) => string[], count: number) {
  const tally = { matched: 0, correct: 0, mixed: 0, unclear: 0, insufficient_data: 0 };
  for (let i = 0; i < count; i++) {
    const truth = fits(i);
    const person = respondent(1000 + i, truth);
    let result = scoreQuestionnaire(content, person.answers);
    if (result.status === "needs_clarification") {
      person.answerFollowups(result.requestedFollowupIds);
      result = scoreQuestionnaire(content, person.answers);
    }
    expect(result.status).not.toBe("needs_clarification");
    if (result.status === "needs_clarification") continue;
    tally[result.status] += 1;
    if (result.status === "matched" && truth.includes(result.primaryId!)) tally.correct += 1;
  }
  return tally;
}

const ids = content.archetypes.map((archetype) => archetype.id);

describe("simulated respondents", () => {
  it("usually matches people who fit one archetype, and matches them correctly", () => {
    const count = 1400;
    const tally = run((i) => [ids[i % ids.length]], count);
    // At the time of writing: 63% matched, 94% of those correctly.
    expect(tally.matched / count).toBeGreaterThan(0.5);
    expect(tally.correct / tally.matched).toBeGreaterThan(0.88);
    expect(tally.insufficient_data / count).toBeLessThan(0.02);
  });

  it("gives every archetype a fair chance of being matched", () => {
    for (const id of ids) {
      const tally = run(() => [id], 200);
      expect(tally.correct, id).toBeGreaterThan(80);
    }
  });

  it("rarely invents a pattern for people who fit none", () => {
    const tally = run(() => [], 1000);
    // At the time of writing: about 20%.
    expect(tally.matched / 1000).toBeLessThan(0.3);
  });

  it("often reports a blend for people who fit two unrelated archetypes", () => {
    const tally = run((i) => [ids[i % 14], ids[(i * 5 + 3) % 14]].filter((id, k, list) => list.indexOf(id) === k), 700);
    // At the time of writing: about 54%.
    expect(tally.mixed / 700).toBeGreaterThan(0.4);
  });
});

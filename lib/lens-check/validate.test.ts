import { describe, expect, it } from "vitest";
import { perception47V02 } from "./content/perception47-v0-2";
import { perception47V03 } from "./content/perception47-v0-3";
import { neutralAnswers } from "./test-helpers";
import type { QuestionnaireContent } from "./types";
import { validateQuestionnaire, validateSubmission } from "./validate";

const clone = (): QuestionnaireContent => structuredClone(perception47V02);

describe("validateQuestionnaire", () => {
  it("accepts the v0.2 and v0.3 content", () => {
    expect(validateQuestionnaire(perception47V02)).toEqual([]);
    expect(validateQuestionnaire(perception47V03)).toEqual([]);
  });

  it("reports broken mappings", () => {
    const content = clone();
    content.archetypes[0].markers[0].questionId = "Q99";
    content.archetypes[1].requiredEvidence = ["Q01"];
    content.archetypes[2].id = content.archetypes[3].id;

    const issues = validateQuestionnaire(content);
    expect(issues).toContain('archetype "reluctant_hero" uses unknown question "Q99"');
    expect(issues).toContain('archetype "wandering_scholar" requires "Q01", which is not one of its markers');
    expect(issues).toContain('duplicate archetype id "alchemist"');
  });

  it("reports archetypes that could never be told apart", () => {
    const content = clone();
    content.archetypes[1].markers = structuredClone(content.archetypes[0].markers);
    content.archetypes[1].requiredEvidence = [...content.archetypes[0].requiredEvidence];
    expect(validateQuestionnaire(content)).toContain('archetype "wandering_scholar" has the same markers as "reluctant_hero"');
  });

  it("requires each contrast to have one follow-up per archetype", () => {
    const content = clone();
    content.followups.find((question) => question.id === "F02")!.supportsArchetypeId = "reluctant_hero";
    expect(validateQuestionnaire(content)).toContain(
      'clarification pair "readiness_or_burden" needs one follow-up supporting each archetype',
    );
  });

  it("requires the parts to walk every question once, in order", () => {
    const content = clone();
    const [first, second] = content.parts[0].questionIds;
    content.parts[0].questionIds[0] = second;
    content.parts[0].questionIds[1] = first;
    expect(validateQuestionnaire(content)).toContain("parts must list every question once, in presentation order");
  });

  it("keeps the prototype calibration status explicit and outcome copy complete", () => {
    const content = clone();
    (content.scoring as { calibrationStatus: string }).calibrationStatus = "validated";
    content.outcomeCopy.mixed.title = "Between patterns";
    const issues = validateQuestionnaire(content);
    expect(issues).toContain("scoring.calibrationStatus must stay explicit");
    expect(issues).toContain("outcomeCopy.mixed needs a title with {count} and an intro");
  });
});

describe("validateSubmission", () => {
  const content = perception47V02;

  it("accepts every core answer, with nulls and their reasons", () => {
    const answers = { ...neutralAnswers(content), Q01: null, Q02: null, F03: 4 };
    const result = validateSubmission(content, answers, { Q01: "not_applicable", Q02: "skipped" });
    expect(result).toEqual({ ok: true, answers, missing: { Q01: "not_applicable", Q02: "skipped" } });
  });

  it("rejects unknown, missing and out-of-range answers", () => {
    const complete = neutralAnswers(content);
    expect(validateSubmission(content, { ...complete, C01: 2 }, {})).toEqual({ ok: false, error: 'Unknown question "C01"' });

    const missing: Record<string, unknown> = { ...complete };
    delete missing.Q47;
    expect(validateSubmission(content, missing, {})).toEqual({ ok: false, error: 'Missing an answer for "Q47"' });

    for (const value of [-1, 5, 1.5, Number.NaN, "3", true]) {
      expect(validateSubmission(content, { ...complete, Q01: value }, {})).toMatchObject({ ok: false });
    }
    expect(validateSubmission(content, [], {})).toMatchObject({ ok: false });
  });

  it("only accepts missing reasons for unanswered statements", () => {
    const answers = { ...neutralAnswers(content), Q01: null };
    expect(validateSubmission(content, answers, { Q02: "skipped" })).toMatchObject({ ok: false });
    expect(validateSubmission(content, answers, { Q01: "bored" })).toMatchObject({ ok: false });
    expect(validateSubmission(content, answers, undefined)).toMatchObject({ ok: true, missing: {} });
  });
});

describe("key phrases", () => {
  it("highlights a phrase in every statement, each appearing exactly once", () => {
    for (const content of [perception47V02, perception47V03]) {
      for (const question of [...content.questions, ...content.followups]) {
        expect(question.highlights?.length, `${content.version} ${question.id}`).toBeGreaterThan(0);
      }
    }
    const content = clone();
    content.questions[0].highlights = ["not in the text"];
    expect(validateQuestionnaire(content)).toContain(
      `question "${content.questions[0].id}" highlight "not in the text" must appear exactly once in its text`,
    );
  });
});

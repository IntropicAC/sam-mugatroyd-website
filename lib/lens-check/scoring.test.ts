import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { perception47V02 as content } from "./content/perception47-v0-2";
import { splitDescription } from "./description";
import { buildPreview, evidenceFor, getArchetype, isFinal, scoreQuestionnaire } from "./scoring";
import { answersFitting, neutralAnswers } from "./test-helpers";
import type { Answers } from "./types";

const score = (answers: Answers) => scoreQuestionnaire(content, answers);
const profile = (answers: Answers, id: string) => score(answers).profiles.find((row) => row.id === id)!;

describe("content", () => {
  it("keeps all 14 archetypes, 50 statements and 16 follow-ups", () => {
    expect(content.archetypes).toHaveLength(14);
    expect(content.questions).toHaveLength(50);
    expect(content.followups).toHaveLength(16);
    expect(new Set(content.questions.map((question) => question.id)).size).toBe(50);
  });

  it("uses Sam's descriptions exactly as supplied", () => {
    for (const file of ["sam-existing-descriptions.md", "sam-new-descriptions.md"]) {
      const source = readFileSync(new URL(`./content/source/${file}`, import.meta.url), "utf8");
      const parts = source.split(/^\*\*(The [^*\n]+)\*\*\s*$/m);
      expect(parts.length).toBeGreaterThan(2);
      for (let i = 1; i < parts.length; i += 2) {
        const archetype = content.archetypes.find((candidate) => candidate.title === parts[i]);
        expect(archetype, parts[i]).toBeDefined();
        expect(archetype!.descriptionMarkdown).toBe(parts[i + 1].trim());
      }
    }
  });

  it("splits each description into a one-liner and body without losing text", () => {
    for (const archetype of content.archetypes) {
      const { oneLiner, body } = splitDescription(archetype.descriptionMarkdown);
      expect(oneLiner.length).toBeGreaterThan(20);
      expect(body.length).toBeGreaterThanOrEqual(2);
      const rejoined = [oneLiner, ...body].join(" ").replace(/\*/g, "");
      expect(rejoined).toBe(archetype.descriptionMarkdown.replace(/\*/g, "").split(/\n+/).map((p) => p.trim()).filter(Boolean).join(" "));
    }
  });
});

describe("scoreQuestionnaire", () => {
  for (const archetype of content.archetypes) {
    it(`matches a respondent who fits ${archetype.id}`, () => {
      const result = score(answersFitting(content, [archetype.id]));
      expect(result.status).toBe("matched");
      expect(result.primaryId).toBe(archetype.id);
      expect(profile(answersFitting(content, [archetype.id]), archetype.id).coreIndex).toBe(100);
    });
  }

  it("doesn't manufacture a pattern from neutral answers", () => {
    const result = score(neutralAnswers(content));
    expect(result.status).toBe("unclear");
    expect(result.primaryId).toBeNull();
  });

  it("returns insufficient_data when too few statements are answered", () => {
    expect(score({}).status).toBe("insufficient_data");
    const answers = answersFitting(content, ["heir"]);
    for (const question of content.questions.slice(0, 11)) answers[question.id] = null;
    expect(score(answers).coreAnswered).toBe(39);
    expect(score(answers).status).toBe("insufficient_data");
  });

  it("sets aside only the archetype whose required statement was skipped", () => {
    const answers = answersFitting(content, ["hesitant_believer"]);
    answers.Q48 = null; // a Waymaker required statement
    const result = score(answers);
    expect(result.status).toBe("matched");
    expect(result.primaryId).toBe("hesitant_believer");
    expect(profile(answers, "waymaker")).toMatchObject({ observed: 3, assessable: false, supported: false });
  });

  it("won't pick a leader over a strong pattern it couldn't fully assess", () => {
    const answers = answersFitting(content, ["loyal_guard", "storm_watcher"]);
    answers.Q25 = null; // a Storm Watcher required statement
    const result = score(answers);
    expect(result.status).toBe("mixed");
    expect(result.candidateIds).toEqual(["loyal_guard", "storm_watcher"]);
  });

  it("treats a raw zero on a reverse statement as an answer, not a skip", () => {
    const row = profile(answersFitting(content, ["hesitant_believer"]), "hesitant_believer");
    expect(row.observed).toBe(4);
    expect(row.coreIndex).toBe(100);
  });

  it("doesn't use Waymaker as a fallback when nothing is endorsed", () => {
    const result = score(neutralAnswers(content, 0));
    expect(result.status).toBe("unclear");
    expect(result.primaryId).toBeNull();
  });

  it("supports Waymaker without requiring ease with uncertainty", () => {
    const answers = answersFitting(content, ["waymaker"]);
    answers.Q06 = 0;
    expect(score(answers)).toMatchObject({ status: "matched", primaryId: "waymaker" });
  });

  it("needs the self-other comparison for Hesitant Believer, not just self-doubt", () => {
    const answers = answersFitting(content, ["hesitant_believer"]);
    answers.Q44 = 2;
    answers.Q46 = 2;
    expect(score(answers)).toMatchObject({ status: "unclear", primaryId: null });
  });

  it("doesn't identify a pattern from one shared statement", () => {
    const answers = neutralAnswers(content);
    answers.Q03 = 4;
    expect(score(answers).status).toBe("unclear");
  });

  it("asks the specific follow-ups for close readiness and self-belief patterns", () => {
    const result = score(answersFitting(content, ["reluctant_hero", "hesitant_believer"]));
    expect(result.status).toBe("needs_clarification");
    expect(result.requestedFollowupIds).toEqual(["F15", "F16"]);
  });

  it("asks a close pair's follow-ups regardless of answer order", () => {
    const answers = answersFitting(content, ["loyal_guard", "lighthouse"]);
    const result = score(answers);
    expect(result.status).toBe("needs_clarification");
    expect(result.requestedFollowupIds).toEqual(["F03", "F04"]);
    expect(score(Object.fromEntries(Object.entries(answers).reverse()))).toEqual(result);
  });

  it("lets follow-ups favour either member of a close pair", () => {
    const answers = answersFitting(content, ["loyal_guard", "lighthouse"]);
    expect(score({ ...answers, F03: 4, F04: 0 })).toMatchObject({ status: "matched", primaryId: "loyal_guard" });
    expect(score({ ...answers, F03: 0, F04: 4 })).toMatchObject({ status: "matched", primaryId: "lighthouse" });
  });

  it("keeps the ambiguity when both follow-ups are endorsed, skipped or weak", () => {
    const answers = answersFitting(content, ["loyal_guard", "lighthouse"]);
    for (const followups of [{ F03: 4, F04: 4 }, { F03: null, F04: null }, { F03: 1, F04: 0 }] as const) {
      const result = score({ ...answers, ...followups });
      expect(result.status).toBe("mixed");
      expect(result.primaryId).toBeNull();
      expect(result.candidateIds).toEqual(["lighthouse", "loyal_guard"]);
    }
  });

  it("doesn't ask follow-ups that couldn't separate a leader", () => {
    const result = score(answersFitting(content, ["loyal_guard", "lighthouse", "heir"]));
    expect(result.status).toBe("mixed");
    expect(result.requestedFollowupIds).toEqual([]);
    expect(result.candidateIds).toHaveLength(3);
  });

  it("never breaks an unrelated tie by list order", () => {
    const result = score(answersFitting(content, ["hesitant_believer", "heir"]));
    expect(result.status).toBe("mixed");
    expect(result.primaryId).toBeNull();
  });

  it("reports more than three equally close patterns as unclear", () => {
    const result = score(answersFitting(content, ["storm_watcher", "heir", "hesitant_believer", "loyal_guard"]));
    expect(result.status).toBe("unclear");
    expect(result.primaryId).toBeNull();
  });

  it("gives no pattern, and asks nothing, for uniform agreement", () => {
    const result = score(neutralAnswers(content, 4));
    expect(result.status).toBe("unclear");
    expect(result.requestedFollowupIds).toEqual([]);
  });

  it("names a clearly weaker supported pattern as secondary", () => {
    const answers = answersFitting(content, ["heir"]);
    // Undercurrent supported, but well behind Heir.
    Object.assign(answers, { Q05: 3, Q38: 3, Q39: 1, Q40: 3 });
    expect(score(answers)).toMatchObject({ status: "matched", primaryId: "heir", secondaryId: "undercurrent" });
  });

  it("is deterministic and doesn't change the answers it is given", () => {
    const answers = answersFitting(content, ["heir"]);
    const before = JSON.stringify(answers);
    expect(score(answers)).toEqual(score(answers));
    expect(JSON.stringify(answers)).toBe(before);
  });
});

describe("evidenceFor", () => {
  it("quotes the required statements first, with the person's own answer", () => {
    const answers = answersFitting(content, ["navigator"]);
    const evidence = evidenceFor(content, answers, getArchetype(content, "navigator")!);
    expect(evidence.map((item) => item.questionId)).toEqual(["Q41", "Q43", "Q02"]);
    expect(evidence[0]).toEqual({
      questionId: "Q41",
      text: "Others asked me to help them decide which step to take next.",
      answerLabel: "Very true of me",
    });
  });

  it("only quotes clearly endorsed answers", () => {
    const answers = answersFitting(content, ["navigator"]);
    answers.Q02 = 2;
    answers.Q42 = 2; // reverse-keyed: only 0 or 1 would count as support
    expect(evidenceFor(content, answers, getArchetype(content, "navigator")!).map((item) => item.questionId)).toEqual([
      "Q41",
      "Q43",
    ]);
  });
});

describe("buildPreview", () => {
  it("gives the title and one-liner but never the reading", () => {
    const result = score(answersFitting(content, ["observer"]));
    if (!isFinal(result)) throw new Error("expected a final result");
    const preview = buildPreview(content, result);
    expect(preview.archetypes).toEqual([
      {
        id: "observer",
        title: "The Observer",
        oneLiner: "You are someone with an exceptional ability to understand what is happening beneath the surface of things.",
      },
    ]);
    expect(JSON.stringify(preview)).not.toContain("The tension is");
  });

  it("lists a mixed result's candidates", () => {
    const result = score(answersFitting(content, ["hesitant_believer", "heir"]));
    if (!isFinal(result)) throw new Error("expected a final result");
    expect(buildPreview(content, result).archetypes.map((archetype) => archetype.id)).toEqual([
      "heir",
      "hesitant_believer",
    ]);
  });
});

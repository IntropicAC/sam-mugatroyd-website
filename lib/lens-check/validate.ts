import { descriptionParagraphs } from "./description";
import { isResponseValue } from "./scale";
import type { Answers, MissingReason, MissingReasons, QuestionnaireContent } from "./types";

const ARTICLE_CATEGORIES = new Set(["Authenticity", "Mental Patterns", "Confidence", "Identity", "Exhaustion"]);
const MISSING_REASONS = new Set<MissingReason>(["not_applicable", "skipped"]);

function isBlank(value: unknown) {
  return typeof value !== "string" || value.trim() === "";
}

function findDuplicates(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

const between = (value: number, min: number, max: number) => Number.isFinite(value) && value >= min && value <= max;

// Checks questionnaire content for broken references, unsafe scoring rules
// and missing copy. Returns human-readable problems; empty means valid.
export function validateQuestionnaire(content: QuestionnaireContent) {
  const issues: string[] = [];
  const coreIds = content.questions.map((question) => question.id);
  const followupIds = content.followups.map((question) => question.id);
  const coreSet = new Set(coreIds);
  const archetypeIds = new Set(content.archetypes.map((archetype) => archetype.id));

  if (isBlank(content.version)) issues.push("version is empty");
  if (isBlank(content.title)) issues.push("title is empty");
  if (isBlank(content.questionStem)) issues.push("questionStem is empty");

  const scale = content.responseScale.map((step) => step.value);
  if (scale.join(",") !== "0,1,2,3,4" || content.responseScale.some((step) => isBlank(step.label))) {
    issues.push("responseScale must label the values 0-4 in order");
  }

  for (const id of findDuplicates([...coreIds, ...followupIds])) issues.push(`duplicate question id "${id}"`);
  for (const question of [...content.questions, ...content.followups]) {
    if (isBlank(question.text)) issues.push(`question "${question.id}" has no text`);
    for (const phrase of question.highlights ?? []) {
      if (isBlank(phrase) || question.text.split(phrase).length !== 2) {
        issues.push(`question "${question.id}" highlight "${phrase}" must appear exactly once in its text`);
      }
    }
  }

  const rules = content.scoring;
  if (rules.calibrationStatus !== "unvalidated_engineering_defaults") {
    issues.push("scoring.calibrationStatus must stay explicit");
  }
  if (!Number.isInteger(rules.minCoreAnswered) || !between(rules.minCoreAnswered, 1, coreIds.length)) {
    issues.push("scoring.minCoreAnswered must be between 1 and the number of questions");
  }
  if (!between(rules.signatureMinNormalized, 0, 1)) issues.push("scoring.signatureMinNormalized must be 0-1");
  if (!between(rules.clarifierWeight, 0, 1)) issues.push("scoring.clarifierWeight must be 0-1");
  if (!between(rules.minCandidateIndex, 0, 100)) issues.push("scoring.minCandidateIndex must be 0-100");
  if (!between(rules.clearCoreMargin, 0, 100) || !between(rules.clearRefinedMargin, 0, 100)) {
    issues.push("scoring margins must be 0-100");
  }
  if (!Number.isInteger(rules.maxFollowupQuestions) || rules.maxFollowupQuestions < 2) {
    issues.push("scoring.maxFollowupQuestions must be an integer of at least 2");
  }
  if (!Number.isInteger(rules.maxMixedCandidates) || rules.maxMixedCandidates < 2) {
    issues.push("scoring.maxMixedCandidates must be an integer of at least 2");
  }

  if (content.archetypes.length < 2) issues.push("expected at least 2 archetypes");
  for (const id of findDuplicates(content.archetypes.map((archetype) => archetype.id))) {
    issues.push(`duplicate archetype id "${id}"`);
  }
  for (const id of findDuplicates(content.archetypes.map((archetype) => archetype.title))) {
    issues.push(`duplicate archetype title "${id}"`);
  }

  const mapped = new Set<string>();
  for (const archetype of content.archetypes) {
    const where = `archetype "${archetype.id}"`;
    if (isBlank(archetype.title)) issues.push(`${where} has no title`);
    if (descriptionParagraphs(archetype.descriptionMarkdown ?? "").length < 2) {
      issues.push(`${where} needs a description with a one-liner and a body`);
    }
    if (archetype.articleCategories.length === 0 || archetype.articleCategories.some((c) => !ARTICLE_CATEGORIES.has(c))) {
      issues.push(`${where} needs valid article categories`);
    }

    const markerIds = archetype.markers.map((marker) => marker.questionId);
    if (archetype.markers.length < rules.minItemsPerProfile) {
      issues.push(`${where} has fewer markers than scoring.minItemsPerProfile`);
    }
    for (const id of findDuplicates(markerIds)) issues.push(`${where} lists marker "${id}" twice`);
    for (const marker of archetype.markers) {
      mapped.add(marker.questionId);
      if (!coreSet.has(marker.questionId)) issues.push(`${where} uses unknown question "${marker.questionId}"`);
      if (!(Number.isFinite(marker.weight) && marker.weight > 0)) issues.push(`${where} has a non-positive weight`);
      if (typeof marker.reverse !== "boolean") issues.push(`${where} must state reverse for "${marker.questionId}"`);
    }
    if (archetype.requiredEvidence.length === 0) issues.push(`${where} needs required evidence`);
    for (const id of archetype.requiredEvidence) {
      if (!markerIds.includes(id)) issues.push(`${where} requires "${id}", which is not one of its markers`);
    }
    // Two archetypes with identical keyed markers could never be told apart.
    const key = [...archetype.markers].map((m) => `${m.questionId}${m.reverse ? "R" : ""}`).sort().join(",");
    const twin = content.archetypes.find(
      (other) => other !== archetype && [...other.markers].map((m) => `${m.questionId}${m.reverse ? "R" : ""}`).sort().join(",") === key,
    );
    if (twin) issues.push(`${where} has the same markers as "${twin.id}"`);
  }
  for (const id of coreIds) {
    if (!mapped.has(id)) issues.push(`question "${id}" is not used by any archetype`);
  }

  const followups = new Map(content.followups.map((question) => [question.id, question]));
  for (const question of content.followups) {
    if (!archetypeIds.has(question.supportsArchetypeId)) {
      issues.push(`follow-up "${question.id}" supports unknown archetype "${question.supportsArchetypeId}"`);
    }
  }
  for (const pair of content.clarificationPairs) {
    const where = `clarification pair "${pair.id}"`;
    if (pair.archetypeIds.length !== 2 || pair.questionIds.length !== 2) issues.push(`${where} must contrast two archetypes`);
    if (pair.archetypeIds.some((id) => !archetypeIds.has(id))) issues.push(`${where} uses an unknown archetype`);
    const supports = pair.questionIds.map((id) => followups.get(id)?.supportsArchetypeId);
    if (supports.some((id) => !id || !pair.archetypeIds.includes(id)) || new Set(supports).size !== 2) {
      issues.push(`${where} needs one follow-up supporting each archetype`);
    }
    if (pair.questionIds.some((id) => followups.get(id)?.pairId !== pair.id)) {
      issues.push(`${where} follow-ups must name this pair`);
    }
  }

  // Parts walk every core question exactly once, in presentation order.
  const partOrder = content.parts.flatMap((part) => part.questionIds);
  if (partOrder.join(",") !== coreIds.join(",")) {
    issues.push("parts must list every question once, in presentation order");
  }
  if (content.parts.length < 1 || content.parts.length > 6) {
    issues.push(`expected 1-6 parts (the logo map has six), found ${content.parts.length}`);
  }
  for (const part of content.parts) {
    for (const field of ["label", "title", "interstitial"] as const) {
      if (isBlank(part[field])) issues.push(`part "${part.id}" has an empty ${field}`);
    }
    if (part.questionIds.length === 0) issues.push(`part "${part.id}" has no questions`);
  }

  const copy = content.outcomeCopy;
  if (!copy.mixed.title.includes("{count}") || isBlank(copy.mixed.intro)) {
    issues.push("outcomeCopy.mixed needs a title with {count} and an intro");
  }
  for (const key of ["unclear", "insufficient"] as const) {
    if (isBlank(copy[key].title) || isBlank(copy[key].body)) issues.push(`outcomeCopy.${key} needs a title and body`);
  }

  return issues;
}

export function assertValidQuestionnaire(content: QuestionnaireContent) {
  const issues = validateQuestionnaire(content);
  if (issues.length > 0) {
    throw new Error(
      `Mindset Test content "${content.version}" is invalid:\n${issues.map((issue) => `- ${issue}`).join("\n")}`,
    );
  }
}

type SubmissionCheck =
  | { ok: true; answers: Answers; missing: MissingReasons }
  | { ok: false; error: string };

// Validates a submission against the questionnaire it claims to answer.
// Every core question must be present (null = not applicable or skipped).
// Follow-ups are optional here; the route checks they were actually asked.
// `missing` gives the reason for each null and may only name null answers.
export function validateSubmission(content: QuestionnaireContent, rawAnswers: unknown, rawMissing: unknown): SubmissionCheck {
  if (typeof rawAnswers !== "object" || rawAnswers === null || Array.isArray(rawAnswers)) {
    return { ok: false, error: "Answers must be an object" };
  }

  const submitted = rawAnswers as Record<string, unknown>;
  const coreIds = new Set(content.questions.map((question) => question.id));
  const followupIds = new Set(content.followups.map((question) => question.id));

  for (const key of Object.keys(submitted)) {
    if (!coreIds.has(key) && !followupIds.has(key)) {
      return { ok: false, error: `Unknown question "${key}"` };
    }
  }

  const answers: Answers = {};
  for (const id of [...coreIds, ...followupIds]) {
    if (!Object.hasOwn(submitted, id)) {
      if (coreIds.has(id)) return { ok: false, error: `Missing an answer for "${id}"` };
      continue;
    }
    const value = submitted[id];
    if (value !== null && !isResponseValue(value)) {
      return { ok: false, error: `Invalid answer for "${id}"` };
    }
    answers[id] = value;
  }

  const missing: MissingReasons = {};
  if (rawMissing !== undefined && rawMissing !== null) {
    if (typeof rawMissing !== "object" || Array.isArray(rawMissing)) {
      return { ok: false, error: "Missing reasons must be an object" };
    }
    for (const [id, reason] of Object.entries(rawMissing as Record<string, unknown>)) {
      if (!Object.hasOwn(answers, id) || answers[id] !== null || !MISSING_REASONS.has(reason as MissingReason)) {
        return { ok: false, error: `Invalid missing reason for "${id}"` };
      }
      missing[id] = reason as MissingReason;
    }
  }

  return { ok: true, answers, missing };
}

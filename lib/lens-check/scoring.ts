// Deterministic scorer for the 14-archetype questionnaire, ported from the
// v0.2 handoff (score-questionnaire.mjs) with three site changes:
//
// 1. A skipped statement only sets aside the archetypes it belongs to. The
//    handoff returned insufficient_data whenever any of the 28 required
//    statements was skipped, which a simulation put at ~83% of people with a
//    6% skip rate.
// 2. Because of (1), an archetype we couldn't fully assess but whose answered
//    statements look as strong as the leader's blocks a single match: the
//    result is mixed instead (a simulation raised match accuracy from 87% to
//    92%).
// 3. More than maxMixedCandidates close patterns is reported as unclear, and
//    follow-ups are only asked when their answers could separate a leader.
//
// The thresholds are unvalidated engineering defaults, not research cut-offs.
// The 0-100 index is an arithmetic summary, never a percentage match.
import { isResponseValue } from "./scale";
import { splitDescription } from "./description";
import type {
  Answers,
  Archetype,
  FinalResult,
  Marker,
  ProfileScore,
  QuestionnaireContent,
  ResultPreview,
  ScoredResult,
} from "./types";

const round = (value: number | null) => (value === null ? null : Math.round(value * 100) / 100);
const answered = (answers: Answers, id: string) => isResponseValue(answers[id]);

// 0-1 after reverse keying. Only call for answered markers.
function normalised(answers: Answers, marker: Marker) {
  const raw = answers[marker.questionId] as number;
  return (marker.reverse ? 4 - raw : raw) / 4;
}

interface Row extends ProfileScore {
  archetype: Archetype;
  requiredMissing: string[];
  observedRequiredPass: boolean;
}

function scoreProfiles(content: QuestionnaireContent, answers: Answers): Row[] {
  const rules = content.scoring;
  return content.archetypes.map((archetype) => {
    const observed = archetype.markers.filter((marker) => answered(answers, marker.questionId));
    const weight = observed.reduce((sum, marker) => sum + marker.weight, 0);
    const coreIndex = weight
      ? (100 * observed.reduce((sum, marker) => sum + normalised(answers, marker) * marker.weight, 0)) / weight
      : null;
    const requiredMissing = archetype.requiredEvidence.filter((id) => !answered(answers, id));
    const requiredObserved = archetype.markers.filter(
      (marker) => archetype.requiredEvidence.includes(marker.questionId) && answered(answers, marker.questionId),
    );
    const observedRequiredPass =
      requiredObserved.length > 0 &&
      requiredObserved.every((marker) => normalised(answers, marker) >= rules.signatureMinNormalized);
    const assessable = observed.length >= rules.minItemsPerProfile && requiredMissing.length === 0;
    const supported =
      assessable && observedRequiredPass && coreIndex !== null && coreIndex >= rules.minCandidateIndex;

    return {
      archetype,
      id: archetype.id,
      observed: observed.length,
      coreIndex,
      index: coreIndex,
      clarificationSupport: null,
      assessable,
      supported,
      requiredMissing,
      observedRequiredPass,
    };
  });
}

// Strongest first. The id order only makes output stable; a tie is never
// resolved by it, because tied candidates are always within the margin.
function rank(rows: Row[], minIndex: number) {
  return rows
    .filter((row) => row.supported && row.index !== null && row.index >= minIndex)
    .sort((a, b) => (b.index ?? 0) - (a.index ?? 0) || a.id.localeCompare(b.id));
}

// Could follow-up answers separate a leader at all? Each routed candidate's
// best case (full support) against everyone else's worst case.
function followupsCouldResolve(near: Row[], routedIds: Set<string>, rules: QuestionnaireContent["scoring"]) {
  const best = (row: Row) =>
    routedIds.has(row.id) ? (1 - rules.clarifierWeight) * row.coreIndex! + rules.clarifierWeight * 100 : row.coreIndex!;
  const worst = (row: Row) => (routedIds.has(row.id) ? (1 - rules.clarifierWeight) * row.coreIndex! : row.coreIndex!);
  return near.some(
    (row) =>
      routedIds.has(row.id) &&
      near.every((other) => other === row || best(row) - worst(other) >= rules.clearRefinedMargin),
  );
}

// Answers must already have passed validateAnswers().
export function scoreQuestionnaire(content: QuestionnaireContent, answers: Answers): ScoredResult {
  const rules = content.scoring;
  const rows = scoreProfiles(content, answers);
  const coreAnswered = content.questions.filter((question) => answered(answers, question.id)).length;
  const followups = new Map(content.followups.map((question) => [question.id, question]));

  const result = (
    status: ScoredResult["status"],
    reason: string,
    extra: Partial<Pick<ScoredResult, "primaryId" | "secondaryId" | "candidateIds" | "requestedFollowupIds" | "routedPairIds">> = {},
  ): ScoredResult => {
    let finalStatus = status;
    let finalReason = reason;
    if (status === "mixed" && (extra.candidateIds?.length ?? 0) > rules.maxMixedCandidates) {
      finalStatus = "unclear";
      finalReason = `${extra.candidateIds!.length} patterns are about equally strong, too many to describe as a blend.`;
    }
    return {
      status: finalStatus,
      reason: finalReason,
      questionnaireVersion: content.version,
      coreAnswered,
      primaryId: null,
      secondaryId: null,
      candidateIds: [],
      requestedFollowupIds: [],
      routedPairIds: [],
      ...extra,
      profiles: rows.map(({ id, observed, coreIndex, index, clarificationSupport, assessable, supported }) => ({
        id,
        observed,
        coreIndex: round(coreIndex),
        index: round(index),
        clarificationSupport: round(clarificationSupport),
        assessable,
        supported,
      })),
    };
  };

  if (coreAnswered < rules.minCoreAnswered) {
    return result("insufficient_data", "Too few statements were answered to describe a pattern.");
  }

  let ranked = rank(rows, rules.minCandidateIndex);
  if (ranked.length === 0) {
    return result("unclear", "No pattern has enough distinguishing support.");
  }

  const leader = ranked[0];
  const near = ranked.filter((row) => leader.index! - row.index! < rules.clearCoreMargin);
  const shadows = rows.filter(
    (row) =>
      !row.assessable &&
      row.observedRequiredPass &&
      row.coreIndex !== null &&
      row.coreIndex >= rules.minCandidateIndex &&
      leader.index! - row.coreIndex < rules.clearCoreMargin,
  );
  const ids = (list: Row[]) => list.map((row) => row.id);

  if (shadows.length > 0) {
    return result("mixed", "A pattern that could not be fully assessed looked as strong as the leader.", {
      candidateIds: [...ids(near), ...ids(shadows)],
    });
  }

  if (near.length === 1) {
    return result("matched", "One supported pattern is clearly ahead.", {
      primaryId: leader.id,
      secondaryId: ranked[1]?.id ?? null,
    });
  }

  const nearIds = new Set(ids(near));
  const routedPairs = [];
  let routedCount = 0;
  for (const pair of content.clarificationPairs) {
    if (pair.archetypeIds.every((id) => nearIds.has(id)) && routedCount + pair.questionIds.length <= rules.maxFollowupQuestions) {
      routedPairs.push(pair);
      routedCount += pair.questionIds.length;
    }
  }
  const routedIds = routedPairs.flatMap((pair) => pair.questionIds);
  const routedArchetypes = new Set(routedIds.map((id) => followups.get(id)!.supportsArchetypeId));
  const routedPairIds = routedPairs.map((pair) => pair.id);

  if (routedPairs.length === 0 || !followupsCouldResolve(near, routedArchetypes, rules)) {
    return result("mixed", "Several supported patterns are close and follow-ups could not separate them.", {
      candidateIds: ids(near),
    });
  }

  const pending = routedIds.filter((id) => !Object.hasOwn(answers, id));
  if (pending.length > 0) {
    return result("needs_clarification", "Close patterns have follow-up statements.", {
      candidateIds: ids(near),
      requestedFollowupIds: pending,
      routedPairIds,
    });
  }

  // A declined follow-up is not evidence against the pattern it supports.
  if (routedIds.some((id) => !answered(answers, id))) {
    return result("mixed", "Follow-ups were skipped, so the close patterns stay unresolved.", {
      candidateIds: ids(near),
      routedPairIds,
    });
  }

  for (const row of rows) {
    const values = routedIds
      .filter((id) => followups.get(id)!.supportsArchetypeId === row.id)
      .map((id) => (answers[id] as number) / 4);
    if (values.length > 0 && row.coreIndex !== null) {
      row.clarificationSupport = values.reduce((a, b) => a + b, 0) / values.length;
      row.index = (1 - rules.clarifierWeight) * row.coreIndex + rules.clarifierWeight * 100 * row.clarificationSupport;
    }
  }

  ranked = rank(rows, rules.minCandidateIndex);
  if (ranked.length === 0) {
    return result("unclear", "No supported pattern remains after the follow-ups.", { routedPairIds });
  }
  if (ranked[0].clarificationSupport !== null && ranked[0].clarificationSupport < 0.5) {
    return result("mixed", "The leading pattern had weak follow-up support.", { candidateIds: ids(near), routedPairIds });
  }
  const refinedNear = ranked.filter((row) => ranked[0].index! - row.index! < rules.clearRefinedMargin);
  if (refinedNear.length > 1) {
    return result("mixed", "Several patterns remain close after the follow-ups.", {
      candidateIds: ids(refinedNear),
      routedPairIds,
    });
  }

  return result("matched", "Follow-ups separate one supported pattern.", {
    primaryId: ranked[0].id,
    secondaryId: ranked[1]?.id ?? null,
    routedPairIds,
  });
}

export function isFinal(result: ScoredResult): result is FinalResult {
  return result.status !== "needs_clarification";
}

export function getArchetype(content: QuestionnaireContent, id: string | null | undefined) {
  return id ? (content.archetypes.find((archetype) => archetype.id === id) ?? null) : null;
}

// The archetypes a result describes: the match, or a mixed result's candidates.
export function resultArchetypes(content: QuestionnaireContent, result: Pick<ScoredResult, "status" | "primaryId" | "candidateIds">) {
  const ids = result.status === "matched" ? [result.primaryId] : result.status === "mixed" ? result.candidateIds : [];
  return ids.map((id) => getArchetype(content, id)).filter((archetype): archetype is Archetype => archetype !== null);
}

export interface Evidence {
  questionId: string;
  text: string;
  answerLabel: string;
}

// The person's own answers that most support an archetype: required
// statements first, then the strongest. Only clearly endorsed answers count.
export function evidenceFor(content: QuestionnaireContent, answers: Answers, archetype: Archetype, max = 3): Evidence[] {
  const text = new Map(content.questions.map((question) => [question.id, question.text]));
  return archetype.markers
    .filter((marker) => answered(answers, marker.questionId))
    .map((marker) => ({ marker, value: normalised(answers, marker), required: archetype.requiredEvidence.includes(marker.questionId) }))
    .filter((entry) => entry.value >= content.scoring.signatureMinNormalized)
    .sort((a, b) => Number(b.required) - Number(a.required) || b.value - a.value)
    .slice(0, max)
    .map(({ marker }) => ({
      questionId: marker.questionId,
      text: text.get(marker.questionId) ?? "",
      answerLabel: content.responseScale[answers[marker.questionId] as number].label,
    }));
}

export function buildPreview(content: QuestionnaireContent, result: FinalResult): ResultPreview {
  const secondary = result.status === "matched" ? getArchetype(content, result.secondaryId) : null;
  return {
    status: result.status,
    archetypes: resultArchetypes(content, result).map((archetype) => ({
      id: archetype.id,
      title: archetype.title,
      oneLiner: splitDescription(archetype.descriptionMarkdown).oneLiner,
    })),
    secondary: secondary ? { id: secondary.id, title: secondary.title } : null,
  };
}

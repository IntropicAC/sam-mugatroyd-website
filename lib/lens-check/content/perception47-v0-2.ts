// Perception 47 questionnaire v0.2: 50 statements, 16 optional follow-ups and
// 14 archetypes with Sam's descriptions. The questions, mappings, scoring
// defaults and descriptions come unchanged from the handoff JSON beside this
// file; this module adds the site's own copy (parts, outcome wording and
// article links). Context questions C01-C03 are in the JSON but not used yet.
import "server-only";
import type { ArticleCategory, Part, QuestionnaireContent, ResponseValue } from "@/lib/lens-check/types";
import handoff from "./perception47-14-types-0.2.json";

// Each part takes the next run of statements in the handoff's interleaved
// order, so no part clusters one archetype's statements together.
const PART_SIZES = [9, 9, 8, 8, 8, 8];

const PART_COPY: Omit<Part, "id" | "questionIds">[] = [
  {
    label: "Setting out",
    title: "Setting out",
    glyph: "sunrise",
    interstitial:
      "Think about the past four weeks. For each statement, picture situations that actually happened.",
  },
  {
    label: "Finding your stride",
    title: "Finding your stride",
    glyph: "path",
    interstitial: "Answer for how things were, not how you'd like them to be. There are no right answers.",
  },
  {
    label: "Looking around",
    title: "Looking around",
    glyph: "compass",
    interstitial:
      "If a statement had no chance to come up, choose Not applicable. You can also skip any statement.",
  },
  {
    label: "Over the ridge",
    title: "Over the ridge",
    glyph: "ridge",
    interstitial: "Some statements sound alike, but each asks something slightly different. Take each on its own.",
  },
  {
    label: "Nearly there",
    title: "Nearly there",
    glyph: "circles",
    interstitial: "Two parts to go. Keep thinking of the past four weeks.",
  },
  {
    label: "Last stretch",
    title: "The last stretch",
    glyph: "lens",
    interstitial: "The last few statements. Then your lens comes into focus.",
  },
];

const ARTICLE_CATEGORIES: Record<string, ArticleCategory[]> = {
  reluctant_hero: ["Confidence", "Identity"],
  wandering_scholar: ["Identity", "Mental Patterns"],
  loyal_guard: ["Exhaustion", "Authenticity"],
  alchemist: ["Mental Patterns", "Identity"],
  sleeping_giant: ["Confidence", "Identity"],
  lighthouse: ["Exhaustion", "Identity"],
  storm_watcher: ["Mental Patterns", "Confidence"],
  method_actor: ["Authenticity", "Identity"],
  heir: ["Identity", "Authenticity"],
  observer: ["Mental Patterns", "Authenticity"],
  undercurrent: ["Authenticity", "Confidence"],
  navigator: ["Identity", "Mental Patterns"],
  hesitant_believer: ["Confidence", "Mental Patterns"],
  waymaker: ["Identity", "Authenticity"],
};

// Key phrases shown in colour and weight. Each picks out what makes the
// statement different from its neighbours (the behaviour, and the condition
// or comparison that matters), never the answer it is "looking for". The
// statement wording itself is unchanged from the handoff.
const KEY_PHRASES: Record<string, string[]> = {
  Q01: ["postponed", "even when it was practical"],
  Q02: ["clearer direction"],
  Q03: ["Other people's needs took priority"],
  Q04: ["little attention to my own reactions"],
  Q05: ["held back a personal preference"],
  Q06: ["at ease", "did not know"],
  Q07: ["kept preparing", "did not feel ready"],
  Q08: ["willing to start", "before I felt fully ready"],
  Q09: ["delayed showing", "worried about being judged"],
  Q10: ["explored a new subject"],
  Q11: ["moved to a new possibility", "before deciding"],
  Q12: ["comfortable choosing one direction"],
  Q13: ["accepted a request", "too little time for my own needs"],
  Q14: ["could decline a request"],
  Q15: ["felt guilty"],
  Q16: ["put a complicated interaction into words"],
  Q17: ["my own reactions", "other people's"],
  Q18: ["between other people", "within me"],
  Q19: ["held back from doing more", "the new level others expected"],
  Q20: ["comfortable", "greater expectations"],
  Q21: ["avoided commitments", "hard to step back from"],
  Q22: ["stayed in a familiar role", "steady point"],
  Q23: ["free to change direction"],
  Q24: ["little room to ask what I wanted next"],
  Q25: ["ways it might go wrong"],
  Q26: ["without checking every possible downside"],
  Q27: ["pass up something", "wanted to try"],
  Q28: ["hard to identify my own preference"],
  Q29: ["which views were mine"],
  Q30: ["hard to say what I wanted"],
  Q31: ["expectations other people had set"],
  Q32: ["unsure I would choose the same path"],
  Q33: ["personally endorsed"],
  Q34: ["disappoint people important to me"],
  Q35: ["watching", "joining in"],
  Q36: ["my own part", "other people's"],
  Q37: ["other people's behaviour", "what I was feeling"],
  Q38: ["held it back", "keep an interaction smooth"],
  Q39: ["expressed a view", "others might disagree"],
  Q40: ["wishing I had voiced"],
  Q41: ["help them decide"],
  Q42: ["direction for myself", "options I could outline for others"],
  Q43: ["helped others plan", "my own direction unresolved"],
  Q44: ["other people's strengths", "my own"],
  Q45: ["accept", "good contribution"],
  Q46: ["other people", "myself"],
  Q47: ["reasons it did not really count"],
  Q48: ["what mattered to me"],
  Q49: ["set aside my own priorities", "someone else's idea of success"],
  Q50: ["day-to-day decisions", "direction I wanted"],
  F01: ["Feeling insufficiently prepared", "main reason"],
  F02: ["felt ready", "commitments I did not want"],
  F03: ["accepting specific requests"],
  F04: ["remain the same reliable person"],
  F05: ["put a complicated experience into words"],
  F06: ["stayed back to understand"],
  F07: ["understand what it meant"],
  F08: ["working out their next steps"],
  F09: ["Watching and interpreting", "guiding someone's next decision"],
  F10: ["help choose a direction"],
  F11: ["unsure which preferences were actually mine"],
  F12: ["preferences were clear", "expressing them"],
  F13: ["felt frustrating", "a direction I could commit to"],
  F14: ["meaningful next step", "without knowing the whole path"],
  F15: ["unprepared or exposed", "acknowledge my strengths"],
  F16: ["struggled to let it change"],
};

const questionText = new Map(handoff.questions.map((question) => [question.id, question.text]));

let offset = 0;
const parts: Part[] = PART_COPY.map((copy, index) => {
  const questionIds = handoff.presentationOrder.slice(offset, offset + PART_SIZES[index]);
  offset += PART_SIZES[index];
  return { id: `part-${index + 1}`, ...copy, questionIds };
});

export const perception47V02: QuestionnaireContent = {
  version: handoff.questionnaireVersion,
  title: "The Mindset Test",
  instructions: handoff.introduction,
  questionStem: "In the past four weeks",
  responseScale: handoff.responseSets.truth5.map(({ value, label }) => ({ value: value as ResponseValue, label })),
  questions: handoff.presentationOrder.map((id) => ({ id, text: questionText.get(id) ?? "", highlights: KEY_PHRASES[id] ?? [] })),
  followups: handoff.clarificationQuestions.map(({ id, text, supportsArchetypeId, pairId }) => ({
    id,
    text,
    highlights: KEY_PHRASES[id] ?? [],
    supportsArchetypeId,
    pairId,
  })),
  clarificationPairs: handoff.clarificationPairs.map(({ id, archetypeIds, questionIds }) => ({
    id,
    archetypeIds: [archetypeIds[0], archetypeIds[1]],
    questionIds: [questionIds[0], questionIds[1]],
  })),
  archetypes: handoff.archetypes.map((archetype) => ({
    id: archetype.id,
    title: archetype.label,
    family: archetype.family,
    workingDefinition: archetype.workingDefinition,
    markers: archetype.markers.map(({ questionId, reverse, weight }) => ({ questionId, reverse, weight })),
    requiredEvidence: archetype.requiredEvidence,
    descriptionMarkdown: archetype.descriptionMarkdown,
    articleCategories: ARTICLE_CATEGORIES[archetype.id] ?? [],
  })),
  scoring: {
    ...handoff.scoring,
    calibrationStatus: "unvalidated_engineering_defaults",
    maxMixedCandidates: 3,
  },
  parts,
  outcomeCopy: {
    mixed: {
      title: "Between {count} patterns",
      intro:
        "Your answers fit more than one pattern about equally well, so we haven't picked one for you. Read each and notice which feels closer to your past few weeks.",
    },
    unclear: {
      title: "No single pattern stood out",
      body: "Your answers didn't lean clearly towards any one pattern. That can mean the past few weeks have felt fairly settled, or that several things have been pulling at you at once. Either is worth knowing, and it's a good place to start a conversation.",
    },
    insufficient: {
      title: "A little more to go on",
      body: "Quite a few statements were marked not applicable or skipped, so there isn't enough here to describe a pattern fairly. You're welcome to take the Mindset Test again whenever more of the statements feel relevant.",
    },
  },
};

// Content contract for The Mindset Test. Questionnaire content in
// lib/lens-check/content/ must match these shapes and pass
// validateQuestionnaire().

export type ArticleCategory =
  | "Authenticity"
  | "Mental Patterns"
  | "Confidence"
  | "Identity"
  | "Exhaustion";

// Icons drawn for each part of the trail (see components/lens-check/visuals).
export type GlyphId = "sunrise" | "path" | "compass" | "ridge" | "circles" | "lens" | "speech" | "fork";

// Answers are 0-4 on the "how true is this of you" scale.
export type ResponseValue = 0 | 1 | 2 | 3 | 4;

export interface Question {
  id: string;
  text: string;
  // Exact phrases from the text to show as key words, to help people read
  // quickly and notice what makes each statement different.
  highlights?: string[];
}

// An optional follow-up, only asked when two close patterns need telling apart.
export interface FollowupQuestion extends Question {
  supportsArchetypeId: string;
  pairId: string;
}

export interface ClarificationPair {
  id: string;
  archetypeIds: [string, string];
  questionIds: [string, string];
}

export interface Marker {
  questionId: string;
  // Reverse only for this archetype: a statement can count for one pattern
  // and against another.
  reverse: boolean;
  weight: number;
}

export interface Archetype {
  id: string;
  title: string;
  family: string;
  // Internal working definition for Sam and the team; never shown to visitors.
  workingDefinition: string;
  markers: Marker[];
  // Both must be strongly endorsed before this archetype can be a candidate.
  requiredEvidence: string[];
  // Sam's description, exactly as supplied. Its first paragraph is the
  // one-liner shown before email; the rest is the gated reading.
  descriptionMarkdown: string;
  articleCategories: ArticleCategory[];
}

export interface ScoringRules {
  calibrationStatus: "unvalidated_engineering_defaults";
  // Fewer answered core statements than this gives insufficient_data.
  minCoreAnswered: number;
  // An archetype needs this many answered markers to be assessed at all.
  minItemsPerProfile: number;
  // Each required marker must reach this (0-1, after reverse keying).
  signatureMinNormalized: number;
  // A candidate needs a core index (0-100) of at least this.
  minCandidateIndex: number;
  // A leader this far ahead of the next candidate is a clear match.
  clearCoreMargin: number;
  // Share of the refined index that comes from follow-up answers.
  clarifierWeight: number;
  // Margin needed after follow-ups to separate a leader.
  clearRefinedMargin: number;
  maxFollowupQuestions: number;
  // More close candidates than this is reported as unclear, not mixed.
  maxMixedCandidates: number;
}

export interface Part {
  id: string;
  label: string;
  title: string;
  interstitial: string;
  glyph: GlyphId;
  questionIds: string[];
}

export interface QuestionnaireContent {
  version: string;
  title: string;
  instructions: string;
  // Shown above every statement, e.g. "These days".
  questionStem: string;
  responseScale: { value: ResponseValue; label: string }[];
  // Core statements in the order participants see them.
  questions: Question[];
  followups: FollowupQuestion[];
  clarificationPairs: ClarificationPair[];
  archetypes: Archetype[];
  scoring: ScoringRules;
  parts: Part[];
  outcomeCopy: {
    mixed: { title: string; intro: string };
    unclear: { title: string; body: string };
    insufficient: { title: string; body: string };
  };
}

// Keyed by question id (core Q.. and follow-up F..). null means the person
// chose "Not applicable" or skipped; the reason is kept separately.
export type Answers = Record<string, ResponseValue | null>;
export type MissingReason = "not_applicable" | "skipped";
export type MissingReasons = Record<string, MissingReason>;

export type ResultStatus = "matched" | "mixed" | "unclear" | "insufficient_data";
export type ScoreStatus = ResultStatus | "needs_clarification";

export interface ProfileScore {
  id: string;
  observed: number;
  // 0-100 arithmetic summary of this archetype's markers. Not a probability
  // or percentage match; never show it to visitors as one.
  coreIndex: number | null;
  // coreIndex, refined by follow-up answers when they were asked.
  index: number | null;
  clarificationSupport: number | null;
  // Enough answered markers, including both required ones, to judge it.
  assessable: boolean;
  supported: boolean;
}

export interface ScoredResult {
  status: ScoreStatus;
  reason: string;
  questionnaireVersion: string;
  coreAnswered: number;
  primaryId: string | null;
  secondaryId: string | null;
  // The close patterns behind a mixed result, strongest first.
  candidateIds: string[];
  requestedFollowupIds: string[];
  routedPairIds: string[];
  profiles: ProfileScore[];
}

export interface FinalResult extends ScoredResult {
  status: ResultStatus;
}

export type HelpfulRating = "yes" | "somewhat" | "no";

export interface ResponseSource {
  from?: string;
  utm?: Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term", string>>;
}

// What the browser receives: no markers, mappings or reading copy.
export interface PublicQuestionnaire {
  version: string;
  title: string;
  questionStem: string;
  responseScale: { value: ResponseValue; label: string }[];
  parts: (Omit<Part, "questionIds"> & { questions: Question[] })[];
}

export interface ResultPreview {
  status: ResultStatus;
  // The matched archetype, or the close candidates of a mixed result.
  archetypes: { id: string; title: string; oneLiner: string }[];
  secondary: { id: string; title: string } | null;
}

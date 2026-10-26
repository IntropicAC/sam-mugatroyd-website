import type { Answers, QuestionnaireContent, ResponseValue } from "./types";

// Every core statement answered "Somewhat true of me".
export function neutralAnswers(content: QuestionnaireContent, value: ResponseValue = 2): Answers {
  return Object.fromEntries(content.questions.map((question) => [question.id, value]));
}

// Neutral answers, with each named archetype's markers answered at the
// extreme that supports it (4, or 0 for a reverse marker).
export function answersFitting(content: QuestionnaireContent, archetypeIds: string[]): Answers {
  const answers = neutralAnswers(content);
  for (const id of archetypeIds) {
    const archetype = content.archetypes.find((candidate) => candidate.id === id);
    if (!archetype) throw new Error(`Unknown archetype ${id}`);
    for (const marker of archetype.markers) {
      const value = marker.reverse ? 0 : 4;
      if (answers[marker.questionId] !== 2 && answers[marker.questionId] !== value) {
        throw new Error(`Fixture has conflicting markers on ${marker.questionId}`);
      }
      answers[marker.questionId] = value;
    }
  }
  return answers;
}

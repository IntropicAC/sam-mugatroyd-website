import "server-only";
import { assertValidQuestionnaire } from "@/lib/lens-check/validate";
import type { PublicQuestionnaire, QuestionnaireContent } from "@/lib/lens-check/types";
import { perception47V02 } from "./perception47-v0-2";
import { perception47V03 } from "./perception47-v0-3";

// To publish a new version: add its file here, register it, and point
// activeQuestionnaire at it. Keep old versions registered so stored results
// can still be rendered, and don't pool results across versions without review.
const questionnaires: Record<string, QuestionnaireContent> = {
  [perception47V02.version]: perception47V02,
  [perception47V03.version]: perception47V03,
};

export const activeQuestionnaire = perception47V03;
export const questionnaireVersions = Object.keys(questionnaires);

if (process.env.NODE_ENV !== "production") {
  for (const content of Object.values(questionnaires)) {
    assertValidQuestionnaire(content);
  }
}

export function getQuestionnaire(version: string) {
  return Object.hasOwn(questionnaires, version) ? questionnaires[version] : null;
}

export function getPublicQuestionnaire(content: QuestionnaireContent = activeQuestionnaire): PublicQuestionnaire {
  const byId = new Map(content.questions.map((question) => [question.id, question]));
  return {
    version: content.version,
    title: content.title,
    questionStem: content.questionStem,
    responseScale: content.responseScale,
    parts: content.parts.map(({ questionIds, ...part }) => ({
      ...part,
      questions: questionIds.map((id) => ({ id, text: byId.get(id)?.text ?? "", highlights: byId.get(id)?.highlights ?? [] })),
    })),
  };
}

// Only the text of the follow-ups a person is asked; never which pattern
// each one supports.
export function getPublicFollowups(content: QuestionnaireContent, ids: string[]) {
  return ids.map((id) => {
    const question = content.followups.find((candidate) => candidate.id === id);
    return { id, text: question?.text ?? "", highlights: question?.highlights ?? [] };
  });
}

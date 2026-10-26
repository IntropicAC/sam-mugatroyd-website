import { createRateLimiter, getClientIp, readJsonBody } from "@/lib/api/request-guards";
import { lensCheckGuards, parseResponseSource } from "@/lib/lens-check/api";
import { activeQuestionnaire, getPublicFollowups } from "@/lib/lens-check/content";
import { createResponse } from "@/lib/lens-check/repository";
import { completeJourney } from "@/lib/lens-check/journeys";
import { buildPreview, isFinal, scoreQuestionnaire } from "@/lib/lens-check/scoring";
import type { Answers } from "@/lib/lens-check/types";
import { validateSubmission } from "@/lib/lens-check/validate";
import { accountsEnabled, AGE_BANDS, SUBMISSION_PATTERN } from "@/lib/lens-check/account-policy";
import { browserProof } from "@/lib/lens-check/accounts";

type CreateResponseBody = {
  journeySecret?: unknown;
  answers?: unknown;
  missing?: unknown;
  honeypot?: unknown;
  source?: unknown;
  version?: unknown;
  submissionId?: unknown;
  ageBand?: unknown;
};

const checkRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 10 });

export function OPTIONS(request: Request) {
  return lensCheckGuards.preflight(request);
}

export async function POST(request: Request) {
  const { jsonResponse } = lensCheckGuards;

  if (!lensCheckGuards.isAllowedOrigin(request)) {
    return jsonResponse(request, { error: "Forbidden" }, 403);
  }

  const rateCheck = checkRateLimit(getClientIp(request));
  if (!rateCheck.allowed) {
    return jsonResponse(
      request,
      { error: "Please wait a moment and try again." },
      429,
      { "Retry-After": String(rateCheck.retryAfter) },
    );
  }

  const body = await readJsonBody<CreateResponseBody>(request);
  if (!body) {
    return jsonResponse(request, { error: "Invalid JSON body" }, 400);
  }
  const accountFlow = accountsEnabled();
  const proof = accountFlow ? await browserProof() : null;
  if (accountFlow && request.headers.get("origin") !== new URL(request.url).origin) return jsonResponse(request, { error: "Forbidden" }, 403);
  if (accountFlow && (!proof || typeof body.submissionId !== "string" || !SUBMISSION_PATTERN.test(body.submissionId))) {
    return jsonResponse(request, { error: "Please start this attempt again in this browser." }, 400);
  }
  if (accountFlow && !AGE_BANDS.includes(body.ageBand as typeof AGE_BANDS[number])) {
    return jsonResponse(request, { error: "The Mindset Test is for ages 13 and over. Confirm your age group before starting." }, 400);
  }

  if (typeof body.honeypot === "string" && body.honeypot.trim() !== "") {
    return jsonResponse(request, { ok: true }, 202);
  }

  const content = activeQuestionnaire;
  if (body.version !== content.version) {
    return jsonResponse(
      request,
      { error: "The Mindset Test has been updated. Please refresh the page and start again." },
      409,
    );
  }

  const submission = validateSubmission(content, body.answers, body.missing);
  if (!submission.ok) {
    return jsonResponse(request, { error: submission.error }, 400);
  }

  // Follow-ups are only accepted when the core answers call for them.
  const coreIds = new Set(content.questions.map((question) => question.id));
  const coreAnswers: Answers = Object.fromEntries([...coreIds].map((id) => [id, submission.answers[id]]));
  const allowedFollowups = new Set(scoreQuestionnaire(content, coreAnswers).requestedFollowupIds);
  const unexpected = Object.keys(submission.answers).find((id) => !coreIds.has(id) && !allowedFollowups.has(id));
  if (unexpected) {
    return jsonResponse(request, { error: `Unexpected follow-up "${unexpected}"` }, 400);
  }

  const result = scoreQuestionnaire(content, submission.answers);
  if (!isFinal(result)) {
    // Nothing is saved until the person answers or skips the follow-ups.
    return jsonResponse(request, { followups: getPublicFollowups(content, result.requestedFollowupIds) }, 200);
  }

  try {
    const { token } = await createResponse({
      questionnaireVersion: content.version,
      answers: submission.answers,
      missingReasons: submission.missing,
      result,
      source: parseResponseSource(body.source),
      account: accountFlow ? { browserProof: proof!, submissionId: body.submissionId as string } : undefined,
    });

    if (body.journeySecret === body.submissionId) await completeJourney(body.journeySecret, token, content.version).catch(() => {});
    return jsonResponse(request, { token, preview: buildPreview(content, result) }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "SUBMISSION_CONFLICT") {
      return jsonResponse(request, { error: "This attempt was already saved with different answers. Start a new attempt to retake it." }, 409);
    }
    console.error("Mindset Test response save failed");
    return jsonResponse(request, { error: "We couldn't save your answers. Please try again." }, 500);
  }
}

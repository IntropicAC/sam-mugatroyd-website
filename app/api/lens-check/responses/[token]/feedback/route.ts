import { createRateLimiter, getClientIp, readJsonBody } from "@/lib/api/request-guards";
import { lensCheckGuards } from "@/lib/lens-check/api";
import { RESULT_TOKEN_PATTERN, saveFeedback } from "@/lib/lens-check/repository";
import type { HelpfulRating } from "@/lib/lens-check/types";

const RATINGS: HelpfulRating[] = ["yes", "somewhat", "no"];

const checkRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 10 });

function isHelpfulRating(value: unknown): value is HelpfulRating {
  return RATINGS.includes(value as HelpfulRating);
}

export function OPTIONS(request: Request) {
  return lensCheckGuards.preflight(request);
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { jsonResponse } = lensCheckGuards;

  if (!lensCheckGuards.isAllowedOrigin(request)) {
    return jsonResponse(request, { error: "Forbidden" }, 403);
  }
  if (request.headers.get("origin") !== new URL(request.url).origin) return jsonResponse(request, { error: "Forbidden" }, 403);

  const rateCheck = checkRateLimit(getClientIp(request));
  if (!rateCheck.allowed) {
    return jsonResponse(
      request,
      { error: "Please wait a moment and try again." },
      429,
      { "Retry-After": String(rateCheck.retryAfter) },
    );
  }

  const { token } = await params;
  if (!RESULT_TOKEN_PATTERN.test(token)) {
    return jsonResponse(request, { error: "Result not found" }, 404);
  }

  const body = await readJsonBody<{ rating?: unknown }>(request);
  if (!body || !isHelpfulRating(body.rating)) {
    return jsonResponse(request, { error: "Rating must be yes, somewhat or no." }, 400);
  }

  try {
    const saved = await saveFeedback(token, body.rating);
    return saved
      ? jsonResponse(request, { ok: true })
      : jsonResponse(request, { error: "Result not found" }, 404);
  } catch {
    console.error("Mindset Test feedback failed");
    return jsonResponse(request, { error: "We couldn't save that. Please try again." }, 500);
  }
}

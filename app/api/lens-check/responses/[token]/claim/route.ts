import { after } from "next/server";
import { createRateLimiter, getClientIp, readJsonBody } from "@/lib/api/request-guards";
import { getResultUrl, lensCheckGuards } from "@/lib/lens-check/api";
import { buildLensCheckCalendlyUrl } from "@/lib/lens-check/calendly";
import { getQuestionnaire } from "@/lib/lens-check/content";
import { sendLeadNotification, sendResultEmail } from "@/lib/lens-check/email";
import { claimResponse, getResponseByToken, RESULT_TOKEN_PATTERN } from "@/lib/lens-check/repository";
import { splitDescription } from "@/lib/lens-check/description";
import { getArchetype, resultArchetypes } from "@/lib/lens-check/scoring";
import { accountsEnabled } from "@/lib/lens-check/account-policy";

type ClaimBody = {
  email?: unknown;
  firstName?: unknown;
  followUpConsent?: unknown;
  website?: unknown;
};

const MAX_EMAIL_LENGTH = 254;
const MAX_FIRST_NAME_LENGTH = 60;

const checkRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 5 });

function readEmail(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim().toLowerCase();
  if (email.length > MAX_EMAIL_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }

  return email;
}

function readFirstName(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const name = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, MAX_FIRST_NAME_LENGTH);
  return name || null;
}

async function sendClaimEmails(request: Request, token: string) {
  const row = await getResponseByToken(token);
  const content = row ? getQuestionnaire(row.response.questionnaireVersion) : null;
  if (!row?.lead || !content) {
    return;
  }

  const { response, lead } = row;
  const archetypes = resultArchetypes(content, {
    status: response.resultKind,
    primaryId: response.archetypeId,
    candidateIds: response.scoring?.candidateIds ?? [],
  });
  const titles = archetypes.map((archetype) => archetype.title);
  const secondary = response.resultKind === "matched" ? getArchetype(content, response.secondaryArchetypeId) : null;
  const resultUrl = getResultUrl(request, token);

  await Promise.allSettled([
    sendResultEmail({
      to: lead.email,
      firstName: lead.firstName,
      status: response.resultKind,
      archetypeTitles: titles,
      oneLiner: response.resultKind === "matched" && archetypes[0] ? splitDescription(archetypes[0].descriptionMarkdown).oneLiner : null,
      resultUrl,
      bookingUrl: buildLensCheckCalendlyUrl({
        name: lead.firstName,
        email: lead.email,
        archetypeTitle: titles.join(" / ") || null,
        archetypeId: archetypes.map((archetype) => archetype.id).join("+") || null,
      }),
      followUpConsent: lead.followUpConsent,
    }),
    sendLeadNotification({
      firstName: lead.firstName,
      email: lead.email,
      status: response.resultKind,
      archetypeTitles: titles,
      secondaryArchetypeTitle: secondary?.title ?? null,
      source: response.source,
      followUpConsent: lead.followUpConsent,
      resultUrl,
    }),
  ]);
}

export function OPTIONS(request: Request) {
  return lensCheckGuards.preflight(request);
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { jsonResponse } = lensCheckGuards;
  if (accountsEnabled()) return jsonResponse(request, { error: "Complete a new Mindset Test and sign in to save it to your account." }, 403);

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

  const { token } = await params;
  if (!RESULT_TOKEN_PATTERN.test(token)) {
    return jsonResponse(request, { error: "Result not found" }, 404);
  }

  const body = await readJsonBody<ClaimBody>(request);
  if (!body) {
    return jsonResponse(request, { error: "Invalid JSON body" }, 400);
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return jsonResponse(request, { ok: true });
  }

  const email = readEmail(body.email);
  if (!email) {
    return jsonResponse(request, { error: "Please enter a valid email address." }, 400);
  }

  try {
    const outcome = await claimResponse(token, {
      email,
      firstName: readFirstName(body.firstName),
      followUpConsent: body.followUpConsent === true,
    });

    if (outcome === "not_found") {
      return jsonResponse(request, { error: "Result not found" }, 404);
    }
    if (outcome === "account_required") return jsonResponse(request, { error: "Sign in to save this reading to your account." }, 403);

    if (outcome === "claimed") {
      after(() => sendClaimEmails(request, token));
    }

    return jsonResponse(request, { ok: true, alreadyClaimed: outcome === "already_claimed" });
  } catch {
    console.error("Mindset Test claim failed");
    return jsonResponse(request, { error: "We couldn't unlock your reading. Please try again." }, 500);
  }
}

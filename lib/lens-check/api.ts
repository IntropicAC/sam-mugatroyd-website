import "server-only";
import { createApiGuards } from "@/lib/api/request-guards";
import { SITE_URL } from "@/lib/site";
import type { ResponseSource } from "./types";

export const lensCheckGuards = createApiGuards({ allowedOriginsEnv: "LENS_CHECK_ALLOWED_ORIGINS" });

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SOURCE_VALUE_LENGTH = 120;

function readSourceValue(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim().slice(0, MAX_SOURCE_VALUE_LENGTH);
  return trimmed || undefined;
}

// Keeps only the article slug and standard UTM fields from the client.
export function parseResponseSource(raw: unknown): ResponseSource | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const input = raw as { from?: unknown; utm?: unknown };
  const source: ResponseSource = {};

  const from = readSourceValue(input.from);
  if (from && SLUG_PATTERN.test(from)) {
    source.from = from;
  }

  if (typeof input.utm === "object" && input.utm !== null) {
    const utmInput = input.utm as Record<string, unknown>;
    const utm: NonNullable<ResponseSource["utm"]> = {};
    for (const key of UTM_KEYS) {
      const value = readSourceValue(utmInput[key]);
      if (value) {
        utm[key] = value;
      }
    }
    if (Object.keys(utm).length > 0) {
      source.utm = utm;
    }
  }

  return Object.keys(source).length > 0 ? source : null;
}

// Links in emails use the production domain, except in local development
// where they point back at the dev server.
export function getResultUrl(request: Request, token: string) {
  const base = process.env.NODE_ENV === "production" ? SITE_URL : new URL(request.url).origin;
  return `${base}/lens-check/result?t=${token}`;
}

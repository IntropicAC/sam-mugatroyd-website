// Shared protections for public POST routes: origin checks, CORS headers,
// per-IP rate limiting and safe JSON parsing. Mirrors the inline versions in
// app/api/chat and app/api/contact, which can move over to this later.

const SITE_ORIGINS = [
  "https://www.sam-murgatroyd.co.uk",
  "https://sam-murgatroyd.co.uk",
  "https://www.sam-mugatroyd.co.uk",
  "https://sam-mugatroyd.co.uk",
];

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    const body = await request.json();
    return typeof body === "object" && body !== null && !Array.isArray(body) ? (body as T) : null;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

export function createApiGuards(options: { allowedOriginsEnv: string }) {
  function getAllowedOrigins(request: Request) {
    const configured = (process.env[options.allowedOriginsEnv] || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    return new Set([new URL(request.url).origin, ...SITE_ORIGINS, ...configured]);
  }

  function isAllowedOrigin(request: Request) {
    const origin = request.headers.get("origin");
    if (!origin) {
      return true;
    }

    return getAllowedOrigins(request).has(origin) || isLocalOrigin(origin);
  }

  function corsHeaders(request: Request) {
    const origin = request.headers.get("origin");
    const headers: Record<string, string> = {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store",
    };

    if (origin && isAllowedOrigin(request)) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers.Vary = "Origin";
    }

    return headers;
  }

  function jsonResponse(request: Request, body: unknown, status = 200, extraHeaders?: HeadersInit) {
    return Response.json(body, {
      headers: {
        ...corsHeaders(request),
        ...extraHeaders,
      },
      status,
    });
  }

  function preflight(request: Request) {
    return new Response(null, { headers: corsHeaders(request), status: 204 });
  }

  return { corsHeaders, isAllowedOrigin, jsonResponse, preflight };
}

type RateLimitEntry = {
  count: number;
  timestamp: number;
};

// In-memory and per serverless instance, like the existing routes. Good enough
// to blunt casual abuse; move to a shared store if traffic grows.
export function createRateLimiter(options: { windowMs: number; max: number }) {
  const entries = new Map<string, RateLimitEntry>();

  return function check(key: string) {
    const now = Date.now();

    if (entries.size > 5000) {
      for (const [entryKey, value] of entries) {
        if (now - value.timestamp > options.windowMs * 10) {
          entries.delete(entryKey);
        }
      }
    }

    const existing = entries.get(key);
    if (!existing || now - existing.timestamp > options.windowMs) {
      entries.set(key, { count: 1, timestamp: now });
      return { allowed: true as const };
    }

    if (existing.count >= options.max) {
      return {
        allowed: false as const,
        retryAfter: Math.ceil((options.windowMs - (now - existing.timestamp)) / 1000),
      };
    }

    existing.count += 1;
    return { allowed: true as const };
  };
}

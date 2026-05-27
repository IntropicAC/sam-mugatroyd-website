const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const DEFAULT_EMAIL_SUBJECT = "New Website Message";
const DEFAULT_EMAIL_FROM_NAME = "Perception 47 Website";

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 4000;

type ContactRequestBody = {
  email?: unknown;
  message?: unknown;
  name?: unknown;
  website?: unknown;
};

type RateLimitEntry = {
  count: number;
  timestamp: number;
};

type Web3FormsResponse = {
  message?: unknown;
  success?: unknown;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string) {
  const now = Date.now();

  if (rateLimitMap.size > 5000) {
    for (const [key, value] of rateLimitMap) {
      if (now - value.timestamp > RATE_LIMIT_WINDOW * 10) {
        rateLimitMap.delete(key);
      }
    }
  }

  const existing = rateLimitMap.get(ip);
  if (!existing || now - existing.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return { allowed: true };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - existing.timestamp)) / 1000),
    };
  }

  existing.count += 1;
  return { allowed: true };
}

function getAllowedOrigins(request: Request) {
  const sameOrigin = new URL(request.url).origin;
  const configured = (process.env.CONTACT_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([
    sameOrigin,
    "https://www.sam-murgatroyd.co.uk",
    "https://sam-murgatroyd.co.uk",
    "https://www.sam-mugatroyd.co.uk",
    "https://sam-mugatroyd.co.uk",
    ...configured,
  ]);
}

function isLocalOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
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

function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
  extraHeaders?: HeadersInit,
) {
  return Response.json(body, {
    headers: {
      ...corsHeaders(request),
      ...extraHeaders,
    },
    status,
  });
}

function readString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function readJsonBody(request: Request): Promise<ContactRequestBody | null> {
  try {
    return (await request.json()) as ContactRequestBody;
  } catch {
    return null;
  }
}

function getWeb3FormsMessage(body: Web3FormsResponse | null) {
  return typeof body?.message === "string" ? body.message : undefined;
}

export function OPTIONS(request: Request) {
  return new Response(null, {
    headers: corsHeaders(request),
    status: 204,
  });
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return jsonResponse(request, { error: "Forbidden" }, 403);
  }

  const rateCheck = checkRateLimit(getClientIp(request));
  if (!rateCheck.allowed) {
    return jsonResponse(
      request,
      { error: "Please wait a moment before sending another message." },
      429,
      rateCheck.retryAfter ? { "Retry-After": String(rateCheck.retryAfter) } : undefined,
    );
  }

  const body = await readJsonBody(request);
  if (!body) {
    return jsonResponse(request, { error: "Invalid JSON body" }, 400);
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return jsonResponse(request, { success: true });
  }

  const name = readString(body.name);
  const email = readString(body.email);
  const message = readString(body.message);

  if (!name || !email || !message) {
    return jsonResponse(request, { error: "Please fill in your name, email, and message." }, 400);
  }

  if (
    name.length > MAX_NAME_LENGTH ||
    email.length > MAX_EMAIL_LENGTH ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return jsonResponse(request, { error: "Please shorten your message and try again." }, 400);
  }

  if (!isValidEmail(email)) {
    return jsonResponse(request, { error: "Please enter a valid email address." }, 400);
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.error("WEB3FORMS_ACCESS_KEY is not set");
    return jsonResponse(request, { error: "Contact form is not configured yet." }, 500);
  }

  const subject = process.env.CONTACT_EMAIL_SUBJECT || DEFAULT_EMAIL_SUBJECT;
  const fromName = process.env.CONTACT_FROM_NAME || DEFAULT_EMAIL_FROM_NAME;

  try {
    const upstreamRes = await fetch(WEB3FORMS_ENDPOINT, {
      body: JSON.stringify({
        access_key: accessKey,
        email,
        from_name: fromName,
        message,
        name,
        subject,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const upstreamBody = (await upstreamRes.json().catch(() => null)) as Web3FormsResponse | null;
    const ok = upstreamRes.ok && upstreamBody?.success === true;

    if (!ok) {
      const providerMessage = getWeb3FormsMessage(upstreamBody);
      console.error("Web3Forms error:", upstreamRes.status, providerMessage || upstreamBody);
      return jsonResponse(
        request,
        { error: providerMessage || "Email provider error. Please email Sam directly instead." },
        502,
      );
    }

    return jsonResponse(request, { success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown contact API error";
    console.error("Contact API error:", message);
    return jsonResponse(request, { error: "Network error. Please try again." }, 500);
  }
}

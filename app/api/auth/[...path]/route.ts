import { permittedAuthUser, permittedTestEmail } from "@/lib/lens-check/report-access";
import { NextRequest } from "next/server";
import { getAuthConfig, isAllowedAuthUser, isAuthTestEmail } from "@/lib/lens-check/auth-config";
import { getLensCheckAuth } from "@/lib/lens-check/auth";
import { socialSignInRequest } from "@/lib/lens-check/social-policy";
import { credentialPayload, PASSWORD_AUTH_PATHS } from "@/lib/lens-check/password-policy";

type Context = { params: Promise<{ path: string[] }> };
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };

async function handle(request: NextRequest, context: Context) {
  const config = getAuthConfig();
  const auth = getLensCheckAuth();
  if (!config || !auth) {
    return Response.json({ error: "Sign-in is not available yet." }, { status: 503, headers: privateHeaders });
  }
  const path = (await context.params).path.join("/");
  const allowed = request.method === "GET"
    ? path === "get-session"
    : ["email-otp/send-verification-otp", "sign-in/email-otp", "sign-in/social", "sign-out", ...(config.passwordEnabled ? PASSWORD_AUTH_PATHS : [])].includes(path);
  if (!allowed) return new Response(null, { status: 404, headers: privateHeaders });
  let forwardedRequest = request;

  // Only same-origin browser mutations; retain the provider's own CSRF and
  // persistent OTP/rate-limit controls as well.
  if (request.method === "POST") {
    if (request.headers.get("origin") !== request.nextUrl.origin) {
      return Response.json({ error: "Please use this website to sign in." }, { status: 403, headers: privateHeaders });
    }
    const forwardBody = (body: object) => {
      const headers = new Headers(request.headers);
      headers.delete("content-length");
      forwardedRequest = new NextRequest(request, { headers, body: JSON.stringify(body) });
    };
    if (Number(request.headers.get("content-length")) > 4096) return new Response(null, { status: 413, headers: privateHeaders });
    if (path === "sign-in/social") {
      const body = socialSignInRequest(await request.clone().json().catch(() => null), request.nextUrl.origin, config.socialProviders);
      if (!body) return Response.json({ error: "This sign-in option is not available." }, { status: 400, headers: privateHeaders });
      forwardBody(body);
    } else if (path === "revoke-other-sessions") {
      const session = await auth.getSession({ query: { disableCookieCache: "true" } }).catch(() => null);
      if (!await permittedAuthUser(session?.data?.user, config)) return Response.json({ error: "Please sign in again." }, { status: 401, headers: privateHeaders });
      forwardBody({});
    } else if (path !== "sign-out") {
      const body = await request.clone().json().catch(() => null);
      if (!await permittedTestEmail(body?.email, config)) {
        return Response.json({ error: "Sign-in is currently limited to the setup test accounts." }, { status: 403, headers: privateHeaders });
      }
      if (path === "email-otp/send-verification-otp") {
        const types = config.passwordEnabled ? ["sign-in", "email-verification", "forget-password"] : ["sign-in"];
        if (!types.includes(body.type)) return Response.json({ error: "This email request is not available." }, { status: 403, headers: privateHeaders });
        forwardBody({ email: body.email.trim().toLowerCase(), type: body.type });
      } else {
        const payload = credentialPayload(path, body);
        if (!payload) return Response.json({ error: "Check your code or password and try again. New passwords need at least 15 characters." }, { status: 400, headers: privateHeaders });
        forwardBody(payload);
      }
    }
  }
  try {
    const handlers = auth.handler();
    const response = request.method === "GET"
      ? await handlers.GET(request, context)
      : await handlers.POST(forwardedRequest, context);
    Object.entries(privateHeaders).forEach(([key, value]) => response.headers.set(key, value));
    if (path === "get-session" && response.ok) {
      const session = await response.clone().json().catch(() => null);
      if (session?.user && !await permittedAuthUser(session.user, config)) {
        const headers = new Headers(response.headers);
        headers.delete("content-length");
        return new Response("null", { status: 200, headers });
      }
    }
    return response;
  } catch {
    return Response.json({ error: "Sign-in is temporarily unavailable. Please try again later." }, { status: 502, headers: privateHeaders });
  }
}

export const GET = handle;
export const POST = handle;

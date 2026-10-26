import { safeReturnTo } from "./account-policy";
import type { SocialProvider } from "./auth-config";

// Construct the forwarded request rather than passing arbitrary OAuth options,
// identity tokens or redirects from a browser to the managed provider.
export function socialSignInRequest(body: unknown, origin: string, enabled: SocialProvider[]) {
  if (!body || typeof body !== "object") return null;
  const input = body as Record<string, unknown>;
  if (!enabled.includes(input.provider as SocialProvider) || typeof input.callbackURL !== "string") return null;
  try {
    const callback = new URL(input.callbackURL, origin);
    if (callback.origin !== origin || callback.pathname !== "/lens-check/auth/callback" || callback.hash || callback.username || callback.password) return null;
    if ([...callback.searchParams.keys()].some((key) => key !== "returnTo") || callback.searchParams.getAll("returnTo").length > 1) return null;
    const destination = callback.searchParams.get("returnTo");
    if (destination && safeReturnTo(destination) !== destination) return null;
    callback.searchParams.set("returnTo", safeReturnTo(destination));
    return { provider: input.provider as SocialProvider, callbackURL: callback.href,
      errorCallbackURL: new URL("/lens-check/account?error=social", origin).href };
  } catch { return null; }
}

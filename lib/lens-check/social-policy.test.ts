import { describe, expect, it } from "vitest";
import { socialSignInRequest } from "./social-policy";

const origin = "https://site.sample.org";
const callbackURL = `${origin}/lens-check/auth/callback?returnTo=${encodeURIComponent(`/lens-check/result?t=${"a".repeat(43)}`)}`;
describe("social sign-in redirects", () => {
  it("keeps the intended reading and constructs the managed request without browser-supplied identity tokens", () => {
    const result = socialSignInRequest({ provider: "google", callbackURL, idToken: "do-not-forward", errorCallbackURL: "https://other.sample.org" }, origin, ["google"]);
    expect(result).toEqual({ provider: "google", callbackURL, errorCallbackURL: `${origin}/lens-check/account?error=social` });
  });
  it("rejects disabled providers and external, ambiguous or unsafe redirects", () => {
    for (const callback of ["https://other.sample.org/lens-check/auth/callback", "//other.sample.org/lens-check/auth/callback", `${origin}/admin`, `${origin}/lens-check/auth/callback?returnTo=//other.sample.org`, `${origin}/lens-check/auth/callback?returnTo=/lens-check/my-results&returnTo=/admin`, `${origin}/lens-check/auth/callback?unexpected=1`]) {
      expect(socialSignInRequest({ provider: "google", callbackURL: callback }, origin, ["google"])).toBeNull();
    }
    expect(socialSignInRequest({ provider: "microsoft", callbackURL }, origin, ["google"])).toBeNull();
    expect(socialSignInRequest({ provider: "google", callbackURL }, origin, [])).toBeNull();
    expect(socialSignInRequest(null, origin, ["google"])).toBeNull();
  });
  it("supports the configured Microsoft flow without exposing credentials in the client request", () => {
    expect(socialSignInRequest({ provider: "microsoft", callbackURL: `${origin}/lens-check/auth/callback` }, origin, ["microsoft"])?.callbackURL)
      .toBe(`${origin}/lens-check/auth/callback?returnTo=%2Flens-check%2Fmy-results`);
  });
});

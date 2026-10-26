// Starts only an OAuth authorization request against the isolated local app.
// Does not follow Google, send email, complete sign-in or create an Auth user.
import assert from "node:assert/strict";

const origin = "http://localhost:3100";
const response = await fetch(`${origin}/api/auth/sign-in/social`, {
  method: "POST", redirect: "manual", headers: { Origin: origin, "Content-Type": "application/json" },
  body: JSON.stringify({ provider: "google", callbackURL: `${origin}/lens-check/auth/callback?returnTo=%2Flens-check%2Fmy-results` }),
});
assert.equal(response.status, 200, "Google authorization should start on the isolated test provider");
const body = await response.json();
let authorizationURL = new URL(body.url);
// Shared development credentials first pass through Neon's OAuth redirect.
// Follow that single trusted service, and stop before contacting Google.
for (let hop = 0; authorizationURL.hostname !== "accounts.google.com" && hop < 3; hop++) {
  assert.equal(authorizationURL.hostname, "ep-dark-resonance-zarvaw2v.neonauth.c-2.eu-west-2.aws.neon.tech");
  const redirect = await fetch(authorizationURL, { redirect: "manual" });
  assert.ok([302, 303, 307].includes(redirect.status), "Neon must redirect to authorization");
  authorizationURL = new URL(redirect.headers.get("location"), authorizationURL);
}
assert.equal(authorizationURL.hostname, "accounts.google.com");
assert.ok(response.headers.getSetCookie().some((cookie) => cookie.includes("session_challenge=") && cookie.includes("HttpOnly")), "SDK must set the browser challenge cookie");
const callback = await fetch(`${origin}/lens-check/auth/callback?returnTo=%2Flens-check%2Fmy-results`, { redirect: "manual" });
assert.equal(callback.status, 307);
assert.equal(new URL(callback.headers.get("location"), origin).pathname, "/lens-check/account");
assert.equal(callback.headers.get("cache-control"), "private, no-store");
assert.equal(callback.headers.get("referrer-policy"), "no-referrer");
console.log("Passed: real Google authorization URL, HttpOnly SDK challenge cookie, and signed-out callback rejection. No OAuth completion or user creation.");

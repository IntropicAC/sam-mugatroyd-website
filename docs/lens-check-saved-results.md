# Mindset Test account-owned results

Implemented locally on 25 October 2026. Resend, DNS, payments and production
deployment are deferred. This continues `lens-check-auth-email-setup.md`.

## Behavior

The isolated launcher enables the account journey: finish the questionnaire,
verify email, save the full free reading to the account, and return through
`/lens-check/my-results`. History shows the completion date, questionnaire
version, result title and free-access status. A retake makes a separate reading.
Matched, mixed, unclear and insufficient outcomes all have the save/sign-in path.
Old content versions remain registered and are rendered using their stored
version. Missing content displays an unavailable message instead of re-scoring.

The account journey explains sign-in before questions and requires a declared
13+ age band before collecting answers. The under-13 option exits; the server
rejects under-13 and missing age bands without storing a response. Age is not
used in scoring or stored in the result. This self-declaration is an initial
test implementation, **not completed age assurance or children's privacy/content
approval**. No public recruitment is authorized by passing the software tests.
Coaching/booking and follow-up invitations are absent from account-owned
readings while eligibility/contact decisions remain pending.

## Ownership and browser claims

- `lens_check_accounts` maps provider issuer + immutable Auth subject to a local
  UUID. Email text is never used as an ownership key or copied from old leads.
- New account results carry an ownership-required marker, nullable owner,
  expiring claim hash and browser-bound attempt key. The marker remains enforced
  even if the account feature is later switched off.
- A same-origin initialization request creates a random 32-byte HttpOnly,
  SameSite=Lax, host-only cookie (Secure on HTTPS). Only its hash is saved with
  the pending result. The original browser can view a preview for 24 hours.
- After verified sign-in, a same-origin claim request binds the result using
  both that cookie and the server-verified account identity. SQL conditions
  check the hash, expiry and unowned state atomically. A competing account
  cannot overwrite ownership. Once owned, the browser claim is cleared and
  only the owner can read the result or submit its helpfulness rating.
- Submission retries use an HMAC of the browser secret and a client attempt ID,
  with a unique database constraint. The saved payload hash must match. Identical
  retries return the same completion; a changed payload receives a conflict.
- Claims repeated by the same owner are safe, including from another device.
  A response URL or an old contact email alone cannot claim a result.
- Private reads verify the managed session without using the SDK's cookie
  session cache. Invalid, expired or unavailable sessions do not expose data.
  History queries filter by local owner and return no raw answers or contact
  details. Signed-out views/API requests do not return full readings.

## Legacy links and privacy

With the account journey enabled, old email-unlocked links show a preview and
invite a fresh questionnaire. The old email-only claim endpoint is blocked and
lead details are withheld from these previews. No legacy record is assigned
to an account automatically. This is a testable proposed release policy; a
recovery/deletion policy for older links still needs the release review.
With the feature disabled, the prior legacy journey remains, while any rows
already marked account-required continue to enforce ownership.

Result/account/history responses have private no-store and no-referrer
protections. Mindset Test pages do not load analytics/replay or send questionnaire
events. Entry from a public page that already loaded analytics forces one fresh
document to clear the previously loaded scripts. This happens only at the
public-to-private transition: a fresh private document and private-to-private
navigation never trigger that reload. Local answer progress expires
after 24 hours. Pending result claims also expire after 24 hours; server record
retention/deletion is a separate policy that remains to be implemented.

## Migration and isolation

Drizzle generated `0003_lens_check_accounts.sql` plus its snapshot/journal entry.
It only adds the accounts table, ownership/claim/retry columns, constraints and
indexes; it does not rewrite answers or assign old rows to accounts.

Only branch `br-late-scene-za1drn9y` (`lens-check-auth-test`) has received this
migration. The schema-only branch's empty Drizzle ledger was baselined against
the exact original column types and empty application tables before Drizzle
applied migration 0003. Four migrations are recorded there. Production still
has the original three migrations; **apply/review migration 0003 before any
deployment of code that selects these new columns**, even if the feature flag
is off. Do not deploy or roll back by removing ownership columns/markers.

The test branch connection is stored only in ignored
`.env.lens-check-auth-test.local`; `.env.local` and Vercel settings were not
overwritten. The launcher validates the exact test endpoint and expiry, refuses
any other database, and prevents fallback to production. Normal environments
leave `LENS_CHECK_ACCOUNTS_ENABLED` unset/false. Website emails remain disabled.
The current test database connection is an owner role; a restricted application
role is still needed before production release.

The branch, Auth account and any user test readings expire on **1 November 2026
at 22:06:18 GMT**. This is not permanent account storage.

## Verification and remaining acceptance

The default unit suite covers claim access, return-path restrictions, private
API routes and the original questionnaire behavior. The isolated database suite
uses two synthetic provider identities to test same-owner retries, cross-account
reads/writes, competing claims, expiry, idempotent completion, separate history,
legacy rejection and unverified sessions. It creates no Auth users or emails.
Synthetic application rows are removed by exact generated IDs after each suite.

HTTP tests exercise real initialization/submission retries, pending result HTML,
the absence of full reading content, cross-browser preview protection,
signed-out claims/history, feedback and legacy-unlock rejection, and age checks.
They do not send login emails or read managed codes/session credentials.

Commands:

Final verification passed: 87 default unit tests, seven isolated database
integration tests and three local HTTP journey tests (97 total). Type checking,
focused lint and the production build also passed. The default unit command
intentionally skips the ten opt-in integration/HTTP tests; the guarded command
ran those separately. Synthetic rows were removed, leaving no application
responses, leads or local account mappings before the user's browser check.

```text
npm test
node scripts/lens-check-accounts-test.mjs
node scripts/lens-check-accounts-test.mjs lib/lens-check/accounts.http.test.ts
npm run lens:auth:dev
```

The HTTP suite needs the isolated local server on port 3100. Run the guarded
migration helper only against the test configuration:
`node scripts/lens-check-test-migrate.mjs`. Never substitute production env.

Human acceptance still needs: complete a new questionnaire, sign in/save it,
refresh/open it from My results, sign out, return in a second browser and sign
in again, and take a retake without overwriting the first result. The earlier
email-code/sign-in/sign-out test passed, but this whole saved-reading journey
has not yet been confirmed by the user. Automated cross-account tests use mocked
sessions with real SQL; they are not a second live mailbox/device test.

Navigation follow-up: the header now shows Sign in or Sign out and My results
when the Auth test integration is enabled, with matching mobile-menu controls.
Both sign-in and navigation use the same client session store. Edge browser
regression checks passed at 320, 375, 768, 1024 and 1280px, including no repeated
private-page reloads, the single public/private document replacement, private
navigation, immediate menu updates after sign-in/out, and sign-out error/retry.
These browser checks mock all Auth responses and block external services; they
do not send email, create users or establish a real signed-in server session.
The 87 unit tests, type checking, focused lint and production build also passed
again.

The optional browser check is `node scripts/lens-check-navigation-test.mjs`.
It uses installed Microsoft Edge and `playwright-core`; an isolated temporary
installation can be supplied as a file URL to its `index.mjs` using
`LENS_CHECK_PLAYWRIGHT_MODULE`. Run the isolated server first. No browser package
or new production dependency was added to the website.

Account deletion, server retention, legacy recovery, production email/origin
settings, restricted runtime permissions, age/privacy/content review and release
checks remain outstanding. There are no payment, marketing or access-duration
promises in this test milestone.

Subsequent follow-up redesigned the account, login/logout, saved-reading cards
and account navigation, and added Google/Microsoft integration boundaries while
retaining email codes. See [social sign-in and account design](lens-check-social-sign-in.md).

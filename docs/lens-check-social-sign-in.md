# Mindset Test social sign-in and account design

The user initially chose email codes plus social sign-in, then requested optional
website passwords and a simpler centred login on 26 October 2026. All three
methods are supported by the application; Microsoft still awaits provider setup.
The existing Neon project, test branch and Vercel project are retained. Resend,
DNS and payment work remains deferred. No production provider settings, database
migration or deployment was changed for this follow-up.

## Current implementation

- Navigation uses a quieter group of text links, a user icon and a fine divider,
  with matching mobile account links. Sign-in/out share one SDK session store.
- Login now uses one compact, centred card with the existing cream, forest green,
  serif typography and square borders. Signup, verification, password recovery,
  email-code entry and signed-in/out states share that layout.
- The account view uses the full dynamic viewport below the fixed navigation,
  with a compact privacy/back footer instead of the large public-site footer.
  Spacing adapts to short screens without clipping or locking scroll. The login
  card and links are checked within the viewport from 320×568 through desktop;
  landscape and keyboard-sized viewports retain natural document scrolling.
- My results uses dated, illustrated reading cards, with a first-reading empty
  state and an explicit unavailable-edition state. Reading views have a return
  link and a saved confirmation. Authorization and original reading content are
  retained.
- Email-code sign-in remains available alongside optional password signup/login.
  Passwords pass through the same-origin SDK proxy to Managed Auth for hashing
  and storage; no custom password table, browser storage or logging is added.
  Social providers handle their own password/MFA prompts. Email addresses and
  personal readings retain the existing privacy and ownership protections.

## Provider status

**Google:** the isolated branch already has the shared development Google
provider. `npm run lens:auth:dev` enables the Google option only in this isolated
test app. A real initiation check reached Google's authorization URL through
Neon's redirect and verified the SDK's HttpOnly challenge cookie. The check
stopped before contacting Google or creating a user. The full interactive
consent, session exchange and return-to-reading journey still needs human
acceptance. Google will show Neon's app identity during this development flow.

**Microsoft:** Neon's current branch API accepts `microsoft` as a provider and
supports a tenant ID, although its general OAuth guide currently lists Google,
GitHub and Vercel. The application supports a configured Microsoft option, but
no Microsoft credentials are present on the test branch. The button remains
hidden. Do not claim Microsoft end-to-end acceptance until credentials and the
managed flow have been tested.

The existing approved email list still applies to every app session, including
social sign-in. Google/Microsoft sign-in can create a managed Auth user before
the app checks the returned identity; an unapproved or unverified identity gets
no private reading/history access. The account page explains how to switch.
No additional personal email was added without a user instruction. Do not use
matching email text to reassign old result ownership; issuer/subject IDs remain
the ownership anchor.

The user supplied a Google test address. It was added only to the ignored local
test allowlist, preserving the previously approved address. No personal email
address is recorded in this document.

## Optional passwords

`LENS_CHECK_AUTH_PASSWORD_ENABLED=true` enables password methods in both the UI
and API. It is enabled explicitly by the isolated local launcher and remains
false by default elsewhere. Production environment variables were not changed.

- New passwords require 15–128 characters; spaces, paste and password managers
  are supported. Existing shorter passwords may still be used for sign-in.
- Signup sends an **email-verification** OTP. Unverified signup sessions cannot
  read or claim private results. This must not use a sign-in OTP, which can
  replace an unverified credential in the installed provider implementation.
- Existing email-code/social users can select **Set or change password** from
  their account, or **Forgot or set password** from login. Both require a
  `forget-password` OTP before the managed reset endpoint changes a credential.
- After reset, the client signs in with the new password and requests revocation
  of other sessions. If either follow-up fails, it explains that the password
  was saved rather than asking the user to reuse a consumed code. Successful
  revocation is covered by a mocked browser test; it is not a provider-wide
  guarantee if that request fails or the browser closes beforehand.
- Password and OTP fields clear on transitions/submission as appropriate. The
  account form remounts when the session changes so sign-out cannot restore a
  stale verification form.

## OAuth request and callback handling

`LENS_CHECK_AUTH_SOCIAL_PROVIDERS` lists only configured options (`google` and/or
`microsoft`). It is empty by default outside the isolated launcher.

The same-origin Auth proxy permits `sign-in/social` only for enabled providers.
It constructs the forwarded payload itself, strips supplied identity tokens and
arbitrary redirect options, and only accepts the same-origin
`/lens-check/auth/callback` with a validated reading/history return path.
Password methods require their separate feature flag. Their payloads are rebuilt
from approved fields, with email allowlisting and same-origin checks. Other-session
revocation requires a fresh verified, allowlisted session and accepts no client
user/session target. Unrelated management endpoints stay blocked.

The dedicated callback uses the installed SDK's middleware to exchange the
challenge/verifier, set session cookies and remove the verifier. It then checks
the verified, allowlisted identity on the server and redirects to the intended
reading/history. Callback responses use private no-store/no-referrer/noindex
headers. This does not replace the administrator's Basic Auth. OAuth codes,
state, verifiers, tokens and cookies must never be logged or copied into notes.

## Remaining setup

1. Complete the Google browser test using the approved test email. If the Google
   account uses another address, obtain that address from the user before adding
   it to the ignored test configuration. Confirm refresh, sign-out, return visit,
   saved-reading ownership and account linking behavior using the intended
   accounts. A successful redirect alone is insufficient evidence.
2. Connect the user's **existing** Microsoft Entra app registration; no new app
   or project is needed. Follow [the browser walkthrough](lens-check-microsoft-sign-in-setup.md).
   Verify the managed flow before enabling Microsoft's app flag.
3. Before production, use a business-owned Google OAuth application and branded
   consent screen, replacing shared development credentials through Neon. Register
   the production Auth URL plus `/callback/google`, configure the website's trusted
   origins, and complete the production checklist. This is independent of buying
   a new domain; the existing domain can be used.
4. Retain custom production email delivery, privacy/age/retention work and the
   other release gates in the existing plan. Shared development login is not a
   production launch configuration. The temporary branch still expires on
   1 November 2026 at 22:06:18 GMT.

## Verification

The security suite covers enabled-provider restrictions, fixed same-origin
callbacks, unsafe/ambiguous redirects, stripping browser identity tokens,
challenge-cookie preservation and rejection of other verified email identities.
The isolated SQL and HTTP suites passed again (seven ownership tests and three
HTTP journey tests); only exact synthetic fixture rows were removed afterward.
The password follow-up passed 103 default tests; the opt-in ownership/HTTP
suites passed ten more (113 total). Focused lint and the production build,
including TypeScript validation, passed after the final password-flow changes.
An initial build hit an empty generated `.next/dev/types/routes.d.ts` left by
stopping the development process. The verified generated dev-types directory
was removed and the build regenerated its own types successfully; no application
type checking was disabled and no tracked source/configuration was removed.

Edge navigation checks cover 320, 375, 768, 1024 and 1280px, sign-in/out state
updates, mobile account links, no repeated private-page reloads, and provider-error
fallback to email. A separate presentation check covers synthetic populated and
empty histories, unavailable editions, signed-in account and signed-out states
at four widths. These presentation fixtures are never served by an application
route and do not bypass authentication. Screenshots/HTML are under
`output/lens-check-account-qa`; all fixture identities and readings are synthetic.

Useful local commands:

```text
npm run lens:auth:dev
node scripts/lens-check-social-smoke.mjs
node scripts/lens-check-navigation-test.mjs
```

The browser scripts use the temporary `playwright-core` installation via
`LENS_CHECK_PLAYWRIGHT_MODULE` and installed Microsoft Edge. Synthetic visual HTML
is generated with `LENS_CHECK_UI_SNAPSHOTS=true` when running
`lib/lens-check/account-pages.test.tsx`; then run
`scripts/lens-check-account-visual-test.mjs`. These tests do not send email or
complete a real social login.

The password browser script uses synthetic intercepted Auth responses to check
signup verification, rejected codes/passwords, password visibility, reset,
other-session revocation, post-reset revocation failure and no credential in
browser storage at four widths. A separate guarded smoke script reached the real
isolated provider and confirmed invalid OTP rejection for verification and reset.
Neither script sends email, creates a real account or changes a real password.
Human acceptance of actual signup, verification, reset and returning password
login remains required.

```text
node scripts/lens-check-password-browser-test.mjs
node scripts/lens-check-password-smoke.mjs
```

Sources verified for this change:

- [Neon OAuth setup](https://neon.com/docs/auth/guides/setup-oauth)
- [Neon branch OAuth API, including Microsoft](https://api-docs.neon.tech/reference/addbranchneonauthoauthprovider)
- [Neon Next.js SDK](https://neon.com/docs/auth/reference/nextjs-server)
- [Neon production checklist](https://neon.com/docs/auth/production-checklist)
- [Microsoft provider background in Better Auth](https://better-auth.com/docs/authentication/microsoft) — configure the managed provider through Neon, rather than adding a self-managed Auth server.

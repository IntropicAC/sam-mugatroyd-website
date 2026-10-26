# Mindset Test authentication and email setup

Continuation: 25 October 2026. Existing projects remain Vercel
`sam-mugatroyd-website` and Neon `round-bar-76991889` / `Perception47-database`.
No replacement project, production migration, DNS change, production provider
configuration change, deployment or paid-plan upgrade was made. The isolated
test branch's Auth provisioning and configuration are recorded below.

## Prepared in the application

- Pinned the official `@neondatabase/auth` SDK to `0.7.0-beta`. Its published
  peer dependencies accept Next.js >=16 and React >=18. This remains a beta
  dependency, requiring live integration acceptance before release.
- Added a Zod `^4.6.6` override to address the SDK's pinned vulnerable Zod
  dependency (GHSA-mrhx-c7xc-m3w5). npm also reports upstream peer conflicts in
  the SDK's bundled UI dependencies; this application uses its Next.js client
  and server entrypoints with a custom form, without importing the bundled UI.
- Added `/lens-check/account` with email-code sign-in, resend, change-email and
  sign-out. Server-side session checks run behind Suspense, compatible with this
  project's `cacheComponents` setting. Auth is disabled by default.
- Added a same-origin Auth proxy restricted to send sign-in code, verify/sign-in,
  session and sign-out. Setup sign-ins are restricted to configured test emails;
  other managed Auth APIs are not exposed by this proxy. This restriction applies
  to the application proxy, not direct access to the Neon service.
- Reuse `DATABASE_NEON_AUTH_BASE_URL`, with `NEON_AUTH_BASE_URL` as an explicit
  override for the isolated test branch. There is no public browser endpoint or
  embedded secret. A separate 32+ character cookie signing secret is required.
- Application email defaults to disabled. Test mode requires exact recipient
  approval. Sender/reply placeholders cannot send, even if an API key is added.
  Provider errors log status only, without raw bodies or error details.

The setup page is not linked from the public navigation. The follow-up
[saved-results implementation](lens-check-saved-results.md) now connects new
completions to verified accounts and adds My results on the isolated test
launcher. Normal environments remain off by default. Existing email submissions
are not verified accounts and are not attached to accounts automatically.

## To do with Sam

The user requested placeholders until discussing these with Sam.

- [ ] Confirm sender display name and address. Current placeholder:
  `Mindset Test <reading@example.invalid>`.
- [ ] Confirm the monitored reply mailbox. Current placeholder:
  `replies@example.invalid`.
- [ ] Confirm the staff notification mailbox and whether notifications are wanted.
- [ ] Confirm who owns/pays for Resend and whether an account already exists.
- [ ] Agree a sending subdomain of `sam-murgatroyd.co.uk`; verify its exact
  Resend-issued DNS records while preserving existing mailbox DNS.
- [ ] Confirm who owns the production Google OAuth application and Microsoft
  Entra app registration. Keep their secrets in Neon provider settings. See
  [social sign-in setup](lens-check-social-sign-in.md); Google development login
  is available locally while Microsoft remains hidden until configured.

## Provider access and next steps

Neon management access is now connected and was verified against the existing
project. No existing Neon CLI was available, so the connected plugin was used.
No Resend plugin was returned by the earlier plugin discovery.

### Verified management state

Read-only management checks on 25 October 2026 confirmed:

| Setting | Current production value |
| --- | --- |
| Project | `round-bar-76991889`, `Perception47-database`, AWS London |
| Branch | `main`, `br-gentle-pond-zak07tvf`, default; the only branch at inspection |
| Provider | Managed Better Auth, database `neondb` |
| Application name | `Perception47-database` |
| Email sign-up/sign-in | Enabled; sign-up allowed |
| Verification | Email verification at sign-up/sign-in and require-verification flags all false; method set to OTP |
| Email delivery | Shared sender `Neon Auth <auth@mail.myneon.app>`; no custom SMTP configured |
| Trusted origins | Empty explicit list returned by management APIs |
| Localhost | Allowed |
| OAuth | Shared development Google provider present |
| Network protections | No configured IP allowlist; public connections allowed; no protections were weakened |
| Restore history | 21,600 seconds (six hours) |
| Plan | Existing Neon Free (`free_v3`); unchanged |

Aggregate counts showed 27 questionnaire responses, one contact, no Auth users
and no Auth sessions. No answers, contact details, user/session rows, codes or
secret configuration values were read. Counts are a point-in-time check, not a
promise that production will stay empty of Auth users.

The empty explicit trusted-origin list does not override the earlier observed
CORS response; neither check demonstrates successful sign-in. The verification,
sender, application name, trusted origins and localhost settings need deliberate
production configuration before launch. No production Auth settings were changed.
Provider abuse-limit configuration was not included in the returned config and
remains unverified.

### Isolated test branch: created and configured

The user created `lens-check-auth-test` in the existing project through the Neon
Console, selecting Schema only and seven-day auto-deletion. Management checks
confirmed branch ID `br-late-scene-za1drn9y`, `init_source: parent-schema`, ready
state, and expiry **1 November 2026 at 22:06:18 GMT**. Initial counts for both
application tables and all nine copied Auth tables were zero. No production
records were copied into this test environment.

Schema-only creation copied empty `neon_auth` tables without an active Auth
integration or the service permissions needed to provision it. Provisioning
initially returned schema-exists, database-permission and role-permission
errors. The following adjustments were made **only in the test branch**:

- Preserved the completely empty copied schema as
  `neon_auth_schema_only_template`; no tables or data were dropped.
- Restored the provider service's database CREATE permission and its membership
  in `neon_auth`, including ADMIN/INHERIT/SET, using the working production
  metadata as reference. Restored the owner's INHERIT/SET membership as well.
  A temporary CREATE grant to `neon_auth` was not sufficient on its own and was
  revoked after diagnosis. No superuser membership was added.
- Provisioned Managed Better Auth through Neon's management API. Neon created
  its fresh schema/configuration; no managed configuration tables were edited.
- Set the isolated Auth application name to `Mindset Test — Testing`.

The test Auth URL is
`https://ep-dark-resonance-zarvaw2v.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth`.
It has a distinct provider project ID from production, shared development SMTP,
email sign-up/sign-in enabled and localhost allowed. The production project,
branch, Auth settings and Vercel variables were left unchanged.

### Running the local sign-in test

The user's approved test recipient is stored only in the ignored
`.env.lens-check-auth-test.local`, alongside a newly generated random cookie
secret. Neither was added to these tracked notes. The existing `.env.local` was
not overwritten, and no database password was fetched for this stage.

Run `npm run lens:auth:dev` to serve
`http://localhost:3100/lens-check/account`. The launcher validates the exact
test branch/endpoint and expiry, loads only the separate test Auth settings,
and explicitly sets the isolated `DATABASE_URL` and blanks marketplace Auth
aliases before Next loads `.env.local`. The database URL was added after stage 1
to support saved readings, with exact endpoint validation and no production
fallback. Before that addition, database access was explicitly disabled.
The launcher also blanks Resend credentials and forces website email delivery disabled.
Login codes use Neon's shared development sender. The allowlist accepts only
the approved test recipient. For setup testing use a fresh/private browser
window and continue without analytics cookies.

HTTP checks against the running server passed: account page/form 200,
signed-out session 200 with `private, no-store`, unapproved recipient 403,
cross-origin sign-out 403, and an invalid code rejected with 400. No code-send
request was made by those automated checks.

The user then exercised the browser test (receive code, enter it on the page,
refresh and sign out) and reported that it worked well. A follow-up aggregate
check confirmed exactly one Auth user with verified email in the test branch.
This establishes real development-email delivery and successful verified
sign-in, with refresh/sign-out reported by the user. No code, session token or
user record was read to verify this. Returning sign-in, expired/reused codes,
resend/abuse limits, separate-browser access and production delivery remain
separate acceptance checks.

This branch and its test users are temporary and will be removed by Neon's
configured auto-deletion. The local launcher refuses to run after branch expiry.

1. Management audit complete as above. Configure and test only the isolated
   branch first. Do not modify managed `neon_auth` tables directly.
2. Prepare isolated test database/Auth state within the existing project. Avoid
   copying customer records; verify the branch's actual contents before testing.
   Do not use the current shared Production/Preview/Development connection for
   signup tests. Give the test branch its own Auth URL, origins and cookie secret.
3. Configure only the intended local/preview environment using
   `lens-check-setup.env.example`. Set test email addresses before enabling Auth.
   Never overwrite the working production database/Auth settings with test values.
4. Test delivery with a mailbox the tester controls. Neon documents its shared
   sender for development; production needs custom delivery. When Resend and Sam's
   sender are ready, configure Neon SMTP: host `smtp.resend.com`, port `465` with
   TLS, username `resend`, password the appropriately scoped Resend API key.
   Set the approved sender in Neon. Store credentials only in provider settings.
5. Configure website result-email credentials separately, with
   `LENS_CHECK_EMAIL_MODE=test` and `LENS_CHECK_EMAIL_TEST_RECIPIENTS`. Login codes
   are sent by Neon, not the website's `email.ts`; the website mode does not
   control Neon's SMTP. Keep all email settings disabled while placeholders remain.
6. Basic development delivery and verified sign-in passed; refresh/sign-out were
   reported working by the user. Complete returning sign-in, resend limits,
   expired/reused codes, provider outage, session expiry and separate-browser
   checks. Production delivery and production trusted origins remain unverified.
7. Implement browser-bound expiring result claims, stable account ownership and
   private history with cross-user access tests. No ownership by old email match.
8. Complete deletion/retention, age-13+ review, analytics/replay privacy checks,
   commercial hosting review and the existing failed-deployment diagnosis before
   any public recruitment or release. Use fresh browsers with analytics declined
   for setup testing until analytics/replay controls have been reviewed.

## Validation and release limits

Local checks cover disabled Auth, exact test-address restrictions, cross-origin
rejection, blocked provider/admin APIs, private response headers, cookie
preservation, safe error messages, actual installed-SDK initialization, disabled
email, approved test delivery payloads and redacted error logging. All provider
requests in these unit tests are mocked. The later HTTP checks described above
also verified live rejection of an invalid code on the isolated service. The
subsequent user browser test verified development-code delivery and sign-in as
recorded above. Website result emails remain disabled.
All 77 tests across nine files passed. Type checking, focused lint checks and
the production build passed too.

After the Zod override and the follow-up update of Next.js and
`eslint-config-next` from `16.2.5` to `16.4.3`, `npm audit --omit=dev`
reports no critical or high entries. Five moderate entries remain involving
existing tooling (`drizzle-kit`, `@esbuild-kit/core-utils`,
`@esbuild-kit/esm-loader`, `esbuild`, `baseline-browser-mapping`). This does not
mean every installed development dependency is free of advisories; the complete
installer audit also reports development findings. Do not run an indiscriminate
`npm audit fix --force` over the current work. Bundled Next.js upgrade, route and
cache/prefetch guides were reviewed for this update.
The existing app explicitly keeps `partialPrefetching: false`, as the bundled
migration guide permits, to preserve navigation behavior during the security
update. Partial Prefetching adoption remains a separate navigation review.

The installer also reports the local Node 22.12.0 engine mismatch in an ESLint
dependency. Vercel's previously audited Node 24 setting differs from this local
runtime. Production Auth/custom SMTP, DNS verification, broader browser/device
testing and the old failed Vercel deployment's cause remain outstanding.

## References

Follow-up, 26 October: the user requested a compact centred login and optional
password signup/login alongside email codes and social sign-in. These are now
implemented for isolated local testing, including email verification and OTP
password recovery/setup. Google is wired for isolated testing; the user's
existing Microsoft registration awaits connection and end-to-end verification.
The [Microsoft browser walkthrough](lens-check-microsoft-sign-in-setup.md) covers
the settings without putting secrets in chat. See
[social sign-in and account design](lens-check-social-sign-in.md) for exact
boundaries, callback handling, test evidence and remaining setup.

- [Neon Next.js SDK](https://neon.com/docs/auth/reference/nextjs-server)
- [Neon email OTP](https://neon.com/docs/auth/guides/plugins/email-otp)
- [Neon production checklist](https://neon.com/docs/auth/production-checklist)
- [Resend SMTP](https://resend.com/docs/send-with-smtp)
- [Resend verified domains](https://resend.com/docs/dashboard/domains/introduction)

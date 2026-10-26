# Verified Vercel and Neon setup

Audit date: 25 October 2026. Live read-only checks used the signed-in Vercel CLI and Neon SQL metadata. No questionnaire answers, contacts, authentication users/sessions or customer records were read. Secret values needed for the connection comparison stayed in memory and were not printed.

**Confirmed infrastructure**

| Area | Verified result |
| --- | --- |
| Vercel project | `sam-mugatroyd-website`, under `Alex's projects` (`alexs-projects-51829641`). |
| Repository | GitHub `IntropicAC/sam-mugatroyd-website`, production branch `main`. |
| Hosting plan | Hobby. No billing changes made. |
| Framework/runtime | Next.js project; Vercel Node.js setting `24.x`. Local node version is 22.12.0, so release verification should account for this difference. |
| Production domains | `www.sam-murgatroyd.co.uk` and `sam-murgatroyd.co.uk` verified. Apex redirects to www. |
| Neon marketplace connection | Existing resource `Perception47-database` is available and connected to the existing Vercel project. A new database is unnecessary. |
| Neon project | `round-bar-76991889`. Marketplace plan `Free` (`free_v3`); billing state active. No paid plan enabled. |
| Database connection | Vercel Production `DATABASE_URL` points to the same Neon endpoint as the local configuration. It uses the London AWS region (`eu-west-2`), a pooled endpoint and `sslmode=require`. |
| Live database | Connection succeeded. Database `neondb`; PostgreSQL 18.6. |
| Questionnaire tables | `public.lens_check_leads` and `public.lens_check_responses` exist with the expected current columns. |
| Migrations | All three local migrations are applied. Both timestamps and SHA-256 SQL hashes match the repository files, verified by the reusable read-only audit script. |
| Authentication | `neon_auth` schema and managed Better Auth tables already exist. Vercel already has `DATABASE_NEON_AUTH_BASE_URL` and `DATABASE_VITE_NEON_AUTH_URL`. |
| Auth endpoint | An unauthenticated GET to the existing `/get-session` endpoint returned HTTP 200, with `Access-Control-Allow-Origin` matching `https://www.sam-murgatroyd.co.uk`. This verifies the endpoint responds for that origin, not that sign-in/email delivery succeeds. |
| Resend | Neither `RESEND_API_KEY` nor `LENS_CHECK_FROM_EMAIL` is configured in the current local file or Vercel Production variable list. This does not establish whether a Resend account exists or whether Neon has separate SMTP settings. |

The earlier statement that customer authentication was not in the application is still correct, but provider-side Auth has already been provisioned. Use the existing Auth service rather than creating a replacement. The existing Vercel variable has a `DATABASE_` prefix; do not mistake that naming difference for a missing Auth service.

Follow-up: customer Auth integration and saved results are now implemented for
isolated local testing. Migration `0003_lens_check_accounts` is generated and
applied **only to the schema-only test branch**; production still has the
original three migrations documented above. A deployment of the new code needs
the additive migration first. See [saved-results implementation](lens-check-saved-results.md).

**Findings requiring follow-up**

1. **Hosting plan.** Hobby is restricted to personal, non-commercial use. Confirm a commercially permitted hosting plan for the coaching business. Vercel currently lists Pro at $20/month including one deploying seat, plus applicable tax/usage/other seats. This audit did not approve or initiate an upgrade. Sources: [Hobby](https://vercel.com/docs/plans/hobby), [Pro](https://vercel.com/docs/plans/pro-plan).

2. **Environment separation.** The database and Auth variables currently list Development, Preview and Production together. Their shared values mean previews must be treated as capable of accessing the same service unless overrides are deliberately configured. Prepare isolated test database/auth state and test email delivery before exercising signup or migrations.

3. **Database role.** The inspected connection uses `neondb_owner`, with create-role/create-database/RLS-bypass capabilities. Plan a separate restricted runtime role while retaining an appropriate migration/admin connection. Do not apply an RLS policy on the assumption it protects this owner connection. Change permissions only after verifying the existing query/auth requirements in an isolated environment.

4. **Managed Auth configuration.** Follow-up management access is now verified. The existing production service allows email sign-up/sign-in, has verification disabled, uses shared SMTP (`Neon Auth <auth@mail.myneon.app>`), permits localhost, has an empty explicit trusted-origin list and retains a shared Google development provider. Its app name is `Perception47-database`. These are inspected settings, not production-ready acceptance evidence. Abuse limits remain unverified. Full evidence and isolated-test next steps are in [the setup record](lens-check-auth-email-setup.md). No production Auth settings were changed. Never edit managed `neon_auth` configuration tables directly as a substitute. See [Neon production configuration](https://neon.com/docs/auth/production-checklist).

5. **Website integration.** Follow-up work added a disabled local customer Auth SDK integration and email-code sign-in page. It does not yet establish account ownership of saved responses or render My results. Reuse the existing provider; handle result claims and old unverified contacts explicitly.

6. **Email setup.** Verify/reuse a Resend account and current-domain sending subdomain, configure credentials in the appropriate provider/deployment settings, and retain a working reply mailbox. Provider-side SMTP and website-side API credentials have different configuration locations. Test login delivery, resend limits and result emails without emailing real users.

7. **Failed deployment.** Production deployment `dpl_JDkKQKKt3qrDpRzTBwaqb4Udbifn`, created 20 October 2026 at 20:29 BST, failed with `BUILD_UTILS_SPAWN_1`: `npm run build` exited with 1. It has `aliasAssigned: false`. An earlier production deployment is Ready, and the public website loads. Do not interpret the failed target as a current outage. Diagnose its build logs before the next release; no redeployment was performed.

**Changes made during this audit**

- Added `scripts/lens-check-readiness.mjs`, a reusable read-only connection/schema/migration check that reports configuration presence without values.
- Added this evidence record and updated the preparation plan to distinguish verified provider state from remaining setup.
- Used a temporary copy of Windows' public trusted root certificates under ignored `.next/setup-audit` for CLI/network verification. TLS verification remained enabled. No trust-store, database, DNS, provider configuration or deployment setting was changed.

**Next actions**

Continuation: see [authentication/email setup](lens-check-auth-email-setup.md)
for the disabled local SDK integration, test configuration and Sam's pending
sender/reply-address decisions. Provider management settings have now been
inspected; live sign-in and email delivery remain unverified.

1. Neon management access is connected and verified for the existing project. Vercel integration access is optional because its CLI is already authenticated.
2. The user created the schema-only `lens-check-auth-test` branch, and its initially empty tables and separate managed Auth service are verified. The basic local email-code/sign-in test passed, with exactly one verified test account confirmed by aggregate count; refresh/sign-out were reported working by the user. See [the setup record](lens-check-auth-email-setup.md) for branch expiry and remaining acceptance checks. Preserve the working production connection.
3. Verify/reuse Resend and configure the agreed sender and delivery credentials.
4. Implement and test the agreed questionnaire → email-code sign-in → saved free reading → My results journey. Keep the age-13+ privacy/content requirements from the preparation plan in the pilot acceptance criteria.
5. Review the commercially permitted hosting plan and deployment failure before public release. Keep any new billing decision explicit.

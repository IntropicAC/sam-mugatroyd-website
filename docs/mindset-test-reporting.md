# Mindset Test reporting

Implemented locally on 26 October 2026. The reporting migration was applied only to the existing isolated Auth test branch. Production has not been migrated or deployed by this work.

## Opening reports and adding Sam

Sign in with the configured owner's verified account, open **My account → Reports & analysis**, or visit `/lens-check/admin`.

Open **Who can view reports?**, enter Sam's email, choose **View reports**, and save. No invitation email is sent. Sam can then sign in using that exact verified email. The explicit report grant also permits sign-in during the restricted local test; it does not open signup to everyone.

Viewers can access the analysis and progress/answer CSVs. Admins can additionally manage grants and export legacy contact details. Owner addresses are configured in `LENS_CHECK_REPORT_ADMIN_EMAILS`; the owner and an admin's own access cannot be removed through the screen. Removing a grant takes effect on the next server request. Provider and SMTP configuration still need to support the selected sign-in method.

The old shared Basic Auth prompt no longer grants access. Page data, CSV downloads, grant changes and maintenance each check fresh server permissions. Report views, exports and access changes are audited. Ordinary accounts retain access only to their own readings.

## What is recorded

Every completion retains its answers, missing reasons, questionnaire/scoring version, result, server completion time, account claim time, entry source and feedback. Feedback now has its own server timestamp. New completions receive the server's `test` or `live` cohort; historical records are `unknown` rather than retrospectively guessed. No new demographic questions were added.

Progress measurements are separate, optional, first-party records. The checkbox is off by default. Nothing is measured before opt-in and, in the account journey, age eligibility. A short-lived attempt ID represents an attempt, not a unique person. No partial answers, account emails, IP addresses, user agents, raw referrer URLs or fingerprints are stored in progress records.

Recorded fields include server start/last-seen/completion times, last displayed question ID and position, furthest position, total/processed/answered/skipped/not-applicable counts, approximate active seconds, reported save errors, broad device category, entry slug and restricted campaign labels. Numbering follows the actual displayed part order, not the internal numeric-looking question IDs. Completion is marked from a successfully saved server result, not a browser claim. Saving to an account is reported from the actual ownership claim.

Visible active activity is sampled; hidden tabs and long idle periods are excluded. A heartbeat runs every 15 seconds, with checkpoints on question changes and best-effort requests when a page is hidden or closed. This cannot establish the exact instant or reason someone leaves. Requests can be blocked or lost. A person who opts in late contributes only from that point. Starts and completion percentages are explicitly labelled as **opt-in attempts**.

An incomplete attempt becomes **Inactive · may return** after 30 minutes without a checkpoint. Returning activity changes this status. Closing a tab is never treated as proof of permanent abandonment. Older unfinished attempts cannot be reconstructed.

**Progress privacy** remains available during questions. Turning it off erases the attempt's optional measurements. A short-lived hash/sequence tombstone prevents older in-flight requests from recreating withdrawn data. It is excluded from reporting and removed with retention maintenance. Questionnaire answers that were deliberately submitted are separate account records.

## Reading the dashboard

- Filter by questionnaire version, inclusive London calendar dates, and test/live/historical cohort.
- Progress uses attempt start date; completed-answer analysis uses completion date. These are different cohorts and are not silently combined into one conversion rate.
- View measured starts, completions, saved readings, inactive attempts, active attempts, median active time among completions, save errors and device categories.
- Inspect the last question before inactivity, with its wording, or expand an attempt to see counts, source and dates.
- Inspect completed readings separately, including account-save status, result and feedback.
- Expand **Full answer and archetype analysis** for the existing question distributions, flags, outcomes, archetypes, sources and helpfulness reports.
- Dates/times use Europe/London. Exports also include UTC ISO timestamps and stable IDs. Refresh is explicit rather than repeatedly querying in the background.

Reports query up to 20,000 records per dataset and show up to 200 activity/completion rows. Narrow the date range if a limit is reached. These are private operational exports, not guaranteed anonymous research datasets. Answer CSVs contain coded responses and missing reasons, not contact details or private result URLs. Legacy contacts remain a distinct admin-only dataset and are not inferred from account sign-ins.

## Retention and production preparation

Progress records older than 90 days are excluded from reporting. The isolated launcher removes old progress records at startup and hourly while running. `vercel.json` defines a daily maintenance request for deployment. Configure a strong `CRON_SECRET` in the deployment environment so Vercel's authenticated request can execute it. The job physically removes expired progress records; it does not delete completed answers or change the separately pending account-retention policy.

Before deploying this code: back up/review the production schema, apply migrations 0003 (if still outstanding) and 0004 to the intended database, configure `LENS_CHECK_REPORT_ADMIN_EMAILS`, set `LENS_CHECK_REPORTING_COHORT=live`, configure `CRON_SECRET`, and verify a real owner sign-in plus scheduled cleanup. Keep the temporary test Auth/database settings out of production. No production settings or records were changed here.

The scheduled-header behaviour was checked against [Vercel's cron documentation](https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs).

## Validation

Unit and isolated database checks cover opt-in validation, displayed question order, out-of-order requests, server completion, withdrawal, London daylight-saving boundaries, safe exports, verified account roles, grant/revoke operations, and owner protection. Integration fixtures are removed by their exact generated identifiers. Browser checks cover real opt-in/question/skip/withdraw requests, restricted unauthenticated access, and synthetic report layouts at phone, tablet and desktop widths. Browser presentation fixtures never provide a production authentication bypass.

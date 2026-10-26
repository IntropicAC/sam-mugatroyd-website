# Mindset Test: free questionnaire and paid guide launch plan

Prepared 20 October 2026. This is a proposed delivery order, with open decisions marked explicitly.

## Current position

- The local project already implements 50 core questions, 16 optional clarification questions and 14 placeholder archetypes, plus server-side scoring, saved results, an email gate, feedback, an admin dashboard and CSV exports.
- Content is separate from the presentation. Each saved result records a questionnaire version, and older content versions can remain registered so previous readings still render.
- According to the live checks supplied by the user, Neon is in London, all three existing migrations are applied, and its columns match the current application. Those checks were performed externally; this plan does not claim a new live database audit.
- The last test run in this conversation passed 62 tests. That covers existing logic, not the proposed payment or customer sign-in system.
- Much of the Mindset Test implementation is currently uncommitted locally.
- Sam is refining the questions, archetypes and character artwork. The user is developing the questionnaire layout, design and animation direction.
- Customer authentication, purchases and paid-content access have not yet been implemented. Resend credentials were absent at the earlier local audit.

## Proposed first release

Take the questionnaire without signing in, see a useful free reading, preview the practical guide, optionally pay GBP 2.99 once, then reopen the purchased guide through verified email access. Coaching and book links remain available.

Use prepared, Sam-approved guidance selected from the saved result. Live AI-generated reports, subscriptions, a progress tracker and a large account dashboard are outside this first release. A printable/downloadable report is an optional later addition unless explicitly included before implementation.

## 1. Agree the product rules and checkpoint the current work

Owner: user and Sam for decisions; coding assistant for the technical checkpoint.

- [ ] Review the current changes and create a Git checkpoint, keeping secrets and generated scratch files out of the commit.
- [ ] Confirm the launch question count and whether optional clarification questions remain.
- [ ] Decide what the free reading includes, when an email is requested, and exactly which sections payment unlocks.
- [ ] Confirm the proposed GBP 2.99 price and whether a purchase unlocks one saved report or also covers future retakes. Proposed starting rule: one saved report, with all its paid tabs.
- [ ] Define what to show for mixed, unclear and insufficient-data results. Do not offer a paid guide for an outcome without an approved, useful guide for that outcome.
- [ ] Agree returning access, report retention, refunds and how published report updates affect existing purchases. Avoid promising permanent access before retention is settled.
- [ ] Agree a first-release screen list: introduction; questions; clarification; saving/error; free reading; paid preview; checkout return/pending; unlocked guide; email sign-in/recovery; saved reading.

Exit condition: a short agreed product specification. Changes to these rules after payment work starts are treated as scope changes.

## 2. Start three workstreams together

### Sam: content and scoring handoff

- [ ] Finish one representative archetype first: free description, strengths and trade-offs, character image, and one complete paid guide. Use it to check the experience before writing every report.
- [ ] Provide stable question and archetype IDs. Keep names, image filenames and presentation copy separate from those IDs.
- [ ] Supply the scoring relationships: question mappings, weights, reversed items, required evidence, clarification rules and outcome thresholds. A list of questions and descriptions alone is insufficient.
- [ ] Define a consistent report structure: patterns and triggers; strengths and trade-offs; practical methods; example language; a short action plan and reflection prompts.
- [ ] Supply image-to-archetype mappings, source assets, accessible descriptions and the intended crop/background treatment.
- [ ] Complete the remaining content using the agreed format; Sam reviews all guidance before publication.

### User: design direction

- [ ] Settle the mobile question screen and answer interaction first: typography, tap targets, progress, back/skip controls and section transitions.
- [ ] Design one free result and one paid guide, including the locked-tab preview and purchase invitation.
- [ ] Include long text, mixed results, loading, errors, pending payment and small screens in the design.
- [ ] Specify which animations communicate progress or feedback, and provide a reduced-motion experience.
- [ ] Settle the visual system before polishing every animation or creating all image variants.

### User and coding assistant: service preparation

- [ ] Begin Stripe business/account onboarding and prepare a test environment. Account verification can proceed while development continues.
- [ ] Set up Resend and domain verification; prepare result, sign-in and purchase-access messages.
- [ ] Choose and configure email authentication; the proposed approach is managed email link/code sign-in rather than custom password handling.
- [ ] Establish separate test and production database environments, environment variables and test/live payment credentials. Verify which environment each deployment uses.
- [ ] Put secret values into the appropriate local/deployment environment settings; share only non-secret configuration identifiers in ordinary project notes.
- [ ] Confirm production hosting arrangements and place the application functions near the London database.

Exit condition: one complete example report, an agreed design system and usable test credentials. Final content for every archetype is not needed to start the next two phases.

## 3. Finish the free journey with placeholder content

Owner: coding assistant; user reviews the interaction.

- [ ] Implement the approved design against the existing content interface, without hard-coding the number of questions or archetypes into screen components.
- [ ] Support agreed back/skip behaviour and clarify what happens on refresh, interrupted submission and returning to an unfinished questionnaire.
- [ ] Complete questionnaire -> server scoring -> database save -> free result -> email/save flow.
- [ ] Render matched, mixed, unclear and insufficient-data outcomes correctly.
- [ ] Add locked-section previews containing only public preview copy.
- [ ] Confirm the dashboard and exports display the stored result consistently.
- [ ] Test keyboard access, screen-reader labels, focus changes, mobile layouts, image loading and reduced motion.

Exit condition: a reliable free journey demonstrated on a phone and desktop, using test data.

## 4. Add paid access using one example guide

Owner: coding assistant; user completes provider setup and reviews purchase wording.

- [ ] Add versioned purchase/access records linked to the buyer and the saved response. Preserve anonymous quiz participation until the agreed identification step.
- [ ] Verify email ownership and securely associate the correct saved result with the signed-in buyer. Typing an email address does not prove ownership.
- [ ] Create Stripe Checkout sessions on the server, with the product, amount and currency determined there.
- [ ] Verify signed Stripe notifications and confirmed payment status; store a durable purchase before granting access. A browser redirect alone must not unlock content.
- [ ] Handle repeated notifications and repeated checkout attempts without duplicate entitlements or accidental access to another report.
- [ ] Check paid access on the server whenever protected content is requested. Keep the complete guide out of public responses, page source, client bundles and public asset downloads.
- [ ] Keep the existing shareable result token separate from authenticated paid access; a shared free-result URL must not automatically expose a purchased report.
- [ ] Implement payment-pending, failure, cancellation, refund/revocation and returning-access behaviour.
- [ ] Send an access email and provide recovery/sign-in without requiring another purchase. Add retry/visibility for failed essential emails.

Exit condition: the example guide can be purchased, revisited and protected correctly in test mode.

## 5. Integrate the approved questions, scoring, guides and artwork

Owners: Sam approves content; coding assistant integrates; user approves presentation.

- [ ] Publish the approved questionnaire as a new content version. Preserve earlier versions needed by existing saved results.
- [ ] Validate all IDs, question mappings, weights, reverse scoring, clarification pairs, section membership, image references and report coverage.
- [ ] Preserve the report/content version a buyer purchased, or implement an explicitly agreed update policy.
- [ ] Check representative answers for every archetype and the boundary cases with Sam. Review the behaviour of mixed and uncertain outcomes.
- [ ] Run the scoring tests and simulations against the new material. These check implementation behaviour; they do not establish psychological validity or clinical accuracy.
- [ ] Pilot the questions and reports with real readers, checking clarity, relevance, completion effort and whether the methods are usable.

Exit condition: every sellable outcome has an approved guide, the scorer behaves as agreed, and all final assets render correctly.

## 6. Complete production security and operational readiness

Owner: coding assistant for implementation; user/Sam for account settings and policy decisions.

- [ ] Use appropriate database permissions for the runtime application; protect admin access and public/auth/payment routes with suitable abuse controls.
- [ ] Check cross-user access, session expiry, secret handling, request validation and payment-notification verification.
- [ ] Exclude private account, admin and paid-result content from session recording; ensure analytics and logs do not collect private result tokens, email addresses or report contents.
- [ ] Configure and test backups/restoration for responses and purchase records. A people-only CSV is not a complete backup of the paid service.
- [ ] Implement a clear deletion/retention process matching the published policy; distinguish questionnaire/contact data from transaction records that need their own retention rules.
- [ ] Confirm production function region, database connection, strong admin credentials, verified email delivery and error visibility.
- [ ] Review purchase/access/refund wording and the site's privacy information for the actual service being launched.
- [ ] Remove only identified development records from the intended database, after reviewing the target and data. Never use a blanket wipe on a database containing real submissions or purchases.
- [x] Add the questionnaire's navigation/article entry points and public sitemap entry. Keep result, account, admin and private report pages out of indexing. (Done 2026-10-25: homepage hero, header and mobile menu buttons, footer, article sidebars, sitemap. Result and admin pages stay noindex.)
- [ ] Add the dashboard version/date index when appropriate; check actual query behaviour rather than treating this as the main launch dependency.

Exit condition: operational checks are recorded, access boundaries hold, and there is a recovery path for lost data, failed emails and paid-access issues.

## 7. Test the entire release and run a small pilot

Owner: coding assistant for automated checks; user, Sam and invited testers for real-device acceptance.

- [ ] Run relevant unit, integration and end-to-end tests, type checking, linting and a production build. Add meaningful payment and access tests beyond the existing scoring tests.
- [ ] Exercise the full journey in a production-like preview: questions -> result -> email verification -> checkout -> payment confirmation -> unlocked guide -> return visit.
- [ ] Test failed/cancelled payments, closed browser tabs after paying, delayed/repeated notifications, expired sign-in links, failed email delivery and refund handling.
- [ ] Verify that an unpaid visitor cannot fetch the full guide and buyer A cannot fetch buyer B's report, including through direct URLs and API requests.
- [ ] Test every outcome category, consent choice, dashboard/export access and coaching/book link, including Calendly's custom result question.
- [ ] Check phone and desktop browsers, slow connections, keyboard navigation and reduced motion.
- [ ] Invite a small group, for example 5-10 people, to complete the journey; record and fix blockers.

Exit condition: a completed acceptance checklist, no known payment/access blockers and Sam's approval of the final content.

## 8. Release and observe

- [ ] Deploy the approved version with the correct production configuration.
- [ ] Perform an authorised low-value real purchase and verify the correct report opens, the email arrives and the transaction is recorded; test the agreed refund process.
- [ ] Open the entry points more widely once the live check succeeds.
- [ ] Monitor questionnaire completions, checkout starts, confirmed purchases, paid-guide access and support issues without recording private content.
- [ ] Use feedback to improve the guide and questionnaire; version substantive changes so earlier readings and purchases remain understandable.

## Immediate next actions

1. Agree the free/paid boundary and purchase/return-access rules.
2. Checkpoint the current implementation in Git.
3. Sam finishes one complete archetype and practical guide, with its scoring mappings.
4. The user finishes one mobile question screen and the free/locked/unlocked result designs.
5. Start Stripe, Resend, email-auth and test-environment setup while that work continues.
6. Build and test the free flow, followed by paid access with that example guide; integrate the remaining approved content afterwards.

The main dependencies are: product rules before payment architecture; one finished report before scaling content production; final scoring/content before acceptance testing; production readiness and a successful live check before wider release.

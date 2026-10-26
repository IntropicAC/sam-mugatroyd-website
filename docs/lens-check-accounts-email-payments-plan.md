# Mindset Test: accounts, email and payments preparation plan

Prepared 25 October 2026. Planning document only: creating this file does not enable authentication, alter the database, send email, change DNS, deploy the site or configure payments. It supplements `lens-check-launch-plan.md` and `lens-check-data-readiness-review.md`.

**Proposed outcome**

Use the existing Vercel website project and existing Neon project. Add Neon's managed authentication if the project supports it, Resend for website/authentication email, and Stripe Checkout when the paid guide is ready. Start on the current domain; the future Perception47 domain is a separate migration.

Agreed planning direction from the user's replies (25 October 2026): full free reading after sign-in, one paid guide per saved result, and participants aged 13–17 alongside adults. These decisions supersede the earlier adults-only pilot recommendation. Detailed content, price, purchase eligibility and retention rules remain open.

Questionnaire without an account → verify email/sign in → full free reading saved to the account → optional paid guide where purchase eligibility permits → sign in later to see result history and purchased guides.

This removes a separate signup step at checkout, but may increase abandonment before the free reading. Explain the email requirement before starting, preserve answers through verification, and measure completion-to-sign-in drop-off. Do not promise a conversion improvement without evidence.

**Verified locally and still to verify**

| Item | Evidence/status |
| --- | --- |
| Existing Vercel project | Live audit confirmed `sam-mugatroyd-website` under Alex's projects, Hobby plan, GitHub `IntropicAC/sam-mugatroyd-website` and production branch `main`. See `lens-check-infrastructure-audit.md`. |
| Existing Neon database | Live read-only checks confirmed the production configuration uses the same pooled London AWS Neon database as local, with the expected columns and all three migrations matching timestamps and SQL hashes. Existing marketplace resource `Perception47-database` is on Neon Free. |
| Questionnaire storage | Answers, scoring, version, completion timestamp, optional contact details and limited follow-up consent already have application code/schema. |
| Customer sign-in | Managed Neon Auth is provisioned and its management settings have now been inspected. Disabled local email-code integration is prepared. Shared SMTP, verification off, localhost allowed and an empty explicit trusted-origin list require deliberate setup. Live sign-in is unverified. See `lens-check-auth-email-setup.md`. |
| Email | Resend sending code exists, but local/production application credentials are absent. Resend account/domain status and Neon's separate SMTP settings remain to be checked. |
| Payments | Not implemented. £2.99 and one purchase per saved report remain proposals. |
| Current work | Many existing tracked/untracked website changes. Preserve them before implementation; do not replace unrelated design/content changes. |

**Product decisions before implementation**

| Decision | Recommended starting position | Decision owner |
| --- | --- | --- |
| When is sign-in required? | Chosen: finish questions, then sign in to see the full free reading and save history. Explain this before starting. Assess necessity/proportionality of required account data for younger participants. | User choice; Sam reviews copy |
| Login method | Passwordless email code for the first release; use the provider's code/session handling. Add social sign-in only if demand justifies it. | User |
| Pilot audience | Chosen: ages 13–17 alongside adults; under-13s excluded. Age-appropriate design/privacy review and proportionate age assurance are prerequisites to recruitment. | User choice; user and Sam own review |
| Free versus paid | List the exact free sections and paid sections, including mixed/unclear/insufficient outcomes. No purchase invitation for an unsupported outcome. | Sam and user |
| Purchase scope | Chosen: one saved result's practical guide. Retakes create new results and do not silently overwrite purchases. Price, repeat-purchase discounts and under-18 purchase eligibility remain unconfirmed. | User choice; Sam and user settle remaining terms |
| Access duration | Agree a defined retention/access promise before selling. Do not promise permanent access while planning to delete the underlying report. | Sam and user |
| Account information | Email needed for sign-in; first name optional; age band/main goal optional only for an agreed use. Do not incorporate demographics into scoring without deliberate design/testing. | User and Sam |
| Old results | No automatic ownership assignment solely from an old unverified email. Define a claim process using verified email plus appropriate evidence of the response, and a policy for old bearer links. | User; assistant designs migration |
| Messages | Requested access/result emails separate from one-off personal follow-up, ongoing marketing and pilot-research invitations. | Sam and user |
| Responsibility | Identify account/project owners, who controls customer data, who can view answers, who responds to support/deletion, who pays service bills, and who is the merchant receiving payments/refunding buyers. | Sam and user |

Keep result history modest: date, questionnaire version, result title and access status, with open/retake actions. A large account dashboard is unnecessary for the initial release. Account changes, deletion and sign-out need usable flows.

**Additional preparation for participants aged 13–17**

The chosen minimum age is 13. Establish eligibility before collecting questionnaire answers, using an age-assurance approach appropriate to the risks; a dropdown is not automatically sufficient. Distinguish 13–15, 16–17 and adult participants where needed for privacy/content handling, without collecting a full birth date by default. Plan what happens when account holders turn 18. Present a clear, truthful under-13 choice/exit without encouraging a false age, and do not save their answers.

Before inviting younger participants:

- Complete a children's privacy/data protection impact assessment covering account-required results, inferred archetypes, optional information, provider sharing, tracking, retention and foreseeable harm. Identify the lawful basis for each purpose. The UK age-13 rule concerns a child's consent for an online service when consent is the lawful basis; it is not blanket permission for all processing or purchases. Capacity and understanding still matter. See [ICO children's DPIAs](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/2-data-protection-impact-assessments/) and [lawful basis and age of consent](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/annex-c-lawful-basis-for-processing/).
- Review questions/readings with age-appropriate expertise and actual target-age testers. Adult wording, examples, thresholds and paid recommendations must not be assumed suitable for teenagers. Describe patterns as provisional reflections, avoid fixed negative identity labels or clinical claims, and retain uncertain/mixed outcomes. Analyse teen and adult pilot feedback separately.
- Provide a short explanation understandable to younger users: why an account is requested, what is saved, what Sam/the developer can see, who receives information, how to delete it, and how to report a concern. Decide if a required email gate is justified for each intended purpose, rather than treating growth/conversion as the sole reason.
- Use high-privacy defaults. Proposed pilot position: no replay on questionnaire/account/result pages, no result categories sent to advertising/analytics providers, no public child-result sharing, no automated marketing/coaching follow-up to minors, and minimal necessary provider disclosures. Distinguish essential questionnaire profiling from marketing profiling; assess the compelling justification and protections for the former, and keep the latter off. See [ICO profiling standard](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/12-profiling/).
- Set purchase eligibility and any guardian involvement before offering checkout to minors. Recommended simplest pilot scope: the free account/reading journey for 13–17-year-olds, adult purchases only initially; this is a proposal, not yet chosen. If guardian purchases are introduced, distinguish payer from report owner and do not automatically disclose a young person's answers to the payer.
- Define whether coaching/contact is available to minors, who handles safeguarding/support concerns and what escalation route is appropriate. Apply the same decisions to emails, AI chat, Calendly links and notifications, not just the questionnaire page.
- Explain price and account requirements in advance. Avoid countdowns, pressure to reveal personal information, or using a worrying result to push a purchase. Keep marketing optional and separate from account access. See [ICO nudge-technique guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/13-nudge-techniques/).

**Preparation before application changes**

| Service/work | What to inspect or prepare | Owner |
| --- | --- | --- |
| Repository | Review the current diff, identify generated files/secrets, and prepare a clean checkpoint/branch containing the work to preserve. No blind add-all or automatic push of unrelated changes. | Assistant |
| Vercel | Identify existing team/project, Git production branch, current hosting plan, production versus preview variables and existing domain. Confirm the production database points to the intended Neon branch without exposing credentials. | User/account owner; assistant checks available configuration |
| Neon | Identify project/branch/region/provider and whether Auth exists, including legacy Stack Auth. Confirm managed-auth eligibility before enabling anything. Review backups and establish test data/environment. | User/account owner; assistant supports |
| Neon Auth | Local integration and initialization/build checks are prepared against Next.js 16 (now 16.4.3) with cacheComponents. Test the isolated branch before configuring production application name, passwordless email-code method and trusted origins. Use custom production email delivery. | Assistant implementation; account owner/provider settings |
| Resend | Reuse an existing account if one exists. Choose sender name/address and reply mailbox; verify a sending subdomain of the current domain using provider DNS records. Configure SPF/DKIM and an appropriate DMARC policy while preserving existing mail delivery. | User/domain owner; assistant supplies exact settings |
| Email credentials | Store scoped credentials in the appropriate local/provider/Vercel settings. Put public origins and non-secret configuration IDs in notes; keep keys, passwords, connection strings and login codes out of chat/repository. | Account owner and assistant |
| Test environment | Separate database/auth state, provider credentials and trusted origins. Use synthetic/test accounts; disable or restrict notifications so tests do not email customers. Treat database clones as potentially containing personal data. | Assistant |
| Stripe, later | Confirm merchant/business owner, support contact, product description, price/currency, purchase scope and refund/access rules. Start in test mode; complete required business checks before live selling. | Merchant owner; assistant integrates |
| Budget | Confirm hosting, database, sending and payment costs, quotas, alerts and who approves upgrades. No automatic paid-plan changes in this planning task. | User and Sam |

Neon's current managed Auth is available for AWS regions, and its documentation excludes projects using IP Allow or Private Networking. Verify the actual project rather than weakening protection to fit the proposed provider. Its current SDK documentation includes beta-version packages; check compatibility in the test integration before choosing a production version. See [Neon managed-auth availability and SDK](https://neon.com/docs/auth/about).

Neon documents trusted production domains, a custom email provider, application branding and email-verification configuration as production setup tasks. Its email OTP integration supports passwordless sign-in. See [Neon production checklist](https://neon.com/docs/auth/production-checklist) and [email OTP](https://neon.com/docs/auth/guides/plugins/email-otp).

Vercel Hobby is limited to personal, non-commercial use. Check the existing plan: a site promoting a coaching business needs a commercially permitted hosting arrangement even before questionnaire payments start. Earlier estimates of free incremental email/auth costs were not a confirmation that hosting the whole business costs nothing. See [Vercel Hobby restrictions](https://vercel.com/docs/plans/hobby).

Resend currently offers 3,000 emails/month and 100/day free, or a $20/month Pro tier with 50,000 emails and no daily cap. Count login codes, resends, customer notifications and admin notifications together. Set a clear quota-exhaustion message/recovery process. See [Resend pricing](https://resend.com/pricing).

**Implementation order after preparation**

| Stage | Work and dependency | Completion evidence |
| --- | --- | --- |
| 1. Test email and sign-in | Enable/configure authentication on the intended test environment, connect sending, implement email-code sign-in/sign-out and server-side session verification. | New/returning test users sign in; invalid/expired/reused codes fail appropriately; resend/abuse limits work; receiving mailbox is verified. |
| 2. Bind a result to its owner | Add a permanent local user identity mapped to the auth provider. Link the current attempt after verification using a secure, expiring claim bound to the originating browser/session. Make submission/claim retries safe. Retain questionnaire/content versions. | Refresh/retry does not duplicate a completion or transfer ownership; a different account cannot claim/read an owned result. |
| 3. Result history | Add My results and owned result views. Keep server-side authorization at every private read/write. Handle no results, mixed outcomes, older versions, signed-out state and returning on another device. | User A sees only A's history; user B cannot fetch A's result through URLs/API requests; private responses cannot leak through shared caches. |
| 4. Account/privacy operations | Add preference/withdrawal records, deletion and retention handling, result email delivery/retry state, local-progress expiry and minimal pilot measurements. Keep customer login separate from administrator access. | Withdrawal stops the intended messages; deletion/retention follow the policy; replay/log/analytics inspection shows no private answers, tokens or contact details leaking. |
| 5. Free pilot | Integrate approved free content, complete the age-13+ privacy/content/access review, and test the full journey using real devices and synthetic records first. Conduct observed sessions with suitable arrangements for teenage participants and fix blockers. | Clear free/account expectations, readable/accessible screens, reliable saved results, age-appropriate protections and usable support process. No active unsupported payment offer. |
| 6. Paid access in test mode | Build server-created Checkout, durable purchase/access records tied to account + response + report version, signed payment notifications, duplicate-event handling, pending/failure/refund/revocation and access email. | Paying unlocks only the intended report; a redirect alone cannot unlock it; delayed/duplicate payment events and closing the browser after payment are handled. |
| 7. Release | Review migrations/configuration, backup/restore, provider quotas, policy/content approval and rollback. Deploy the agreed release, verify live sign-in/email, then perform the agreed real-purchase/refund check before wider sales. | Recorded acceptance checks and clear responsibility for support, failed delivery and payment/access issues. |

Do not mark a result paid merely from a user-supplied email, client flag or checkout return URL. Keep the public/free sharing mechanism separate from account ownership and paid access. A stable account ID, rather than an email string, anchors purchases and history. Changes of email must not reassign another account's old results.

For existing bearer result links, choose a deliberate policy: what remains a public/free preview, what now requires login, how existing owners recover access, and which links are revoked. Preserving an old URL during a domain move does not require preserving unrestricted access to personal or purchased content.

**What needs testing**

- Signup, returning login, sign-out, expired/wrong/reused code, resend limits, missing email, provider errors and quota exhaustion.
- Starting anonymously, signing in mid-flow, refreshing, interrupted submission, retrying, resuming and taking a deliberate retake.
- Claim ownership conflicts and old unverified records; no history attachment based solely on matching email text.
- Two distinct users, cross-user URLs/API requests, caching, expired sessions and protected paid content absent from public HTML/bundles.
- First/mobile/desktop/keyboard journeys, long/mixed results and reduced-motion settings.
- Different questionnaire versions rendering their original readings and purchases without overwriting earlier outputs.
- Age boundaries: under 13, 13–15, 16–17 and 18+; younger-user notices/defaults, blocked ineligible checkout/contact, no unwanted disclosures, and the transition to adult settings.
- Preferences/withdrawal, deletion/retention, restricted admin/export access, delivery failure/retry and backup recovery.
- For payments: success, cancellation, declined payment, pending confirmation, repeated checkout, repeated notifications, refund and return visit.
- Existing public website pages, admin functions and consent controls still behave as intended. Run meaningful integration/access tests, type checking, linting and production build appropriate to the implementation.

**Future domain move**

Keep current and future origins, email sender, reply address and payment-return base URLs configurable. When the chosen Perception47 domain is owned: add it to the existing Vercel project, configure DNS/certificates, allow it in authentication, verify its sending domain, update canonical URLs/sitemap/email copy/payment settings and redirect old public URLs with paths/query parameters preserved. Keep old domain control and verify old result links. Sessions may require a new sign-in on the new domain; account IDs/history/purchases remain in the same database.

**Smallest useful first milestone**

One person completes the questionnaire, verifies their email, opens My results on a second browser/device, and sees the correct saved reading. Another account cannot access that reading. This milestone proves the foundation before payment work and does not depend on buying the future domain or completing every paid archetype guide.

**Decision and setup tracker**

Continuation implementation and the sender/reply-address to-do list requested by
the user are recorded in [lens-check-auth-email-setup.md](lens-check-auth-email-setup.md).
Auth stage 1 is prepared locally and remains disabled in normal environments.
The isolated schema-only branch and its local test launcher are ready. Live
invalid-code rejection, development-code delivery and verified sign-in have
passed; refresh/sign-out were reported working by the user. Saved-result
ownership and history are now implemented locally and tested on the isolated
branch. See [lens-check-saved-results.md](lens-check-saved-results.md) for the
claim design, test evidence and remaining human/release checks. Production
delivery remains deferred with Resend, DNS and payments.

- [x] Account timing chosen: sign in after questions to see the full free reading.
- [x] Paid scope chosen: one guide per saved questionnaire result; price/other terms remain open.
- [x] Audience chosen: ages 13–17 alongside adults; under-13s excluded.
- [ ] Complete age-appropriate privacy/content/age-assurance review and decide under-18 purchase/contact rules before recruitment.
- [ ] Optional demographic/context questions chosen.
- [ ] Paid content, price, retakes, retention/access duration and refund rules settled before payment implementation.
- [x] Vercel account/project/plan and Neon project/production connection verified in the live read-only audit; Vercel Hobby and Neon Free confirmed.
- [x] Managed-auth availability/current provider state inspected; SDK initialization/build tests and basic live development-email/sign-in test pass. Broader session/abuse tests and production delivery remain pending.
- [ ] Current-domain DNS access, sender/reply address and Resend account ready.
- [ ] Business/data responsibility and provider-bill ownership recorded.
- [x] Existing work retained in the workspace; isolated test configuration and account migration ready. No production migration, commit or deployment was made.
- [x] Ownership/migration and proposed legacy-link policy recorded and implemented for local testing. Production rollout/legacy recovery remain subject to release review.
- [ ] Acceptance checks and release/rollback responsibilities agreed.

The next practical check is the user browser journey from questionnaire through
verified sign-in to a saved reading and My results, followed by a return visit
and retake. Production email, privacy/age/retention review and release checks
remain separate. No replacement database or hosting project is needed.

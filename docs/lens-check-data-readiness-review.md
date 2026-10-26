# Mindset Test data and pilot readiness review

Prepared 25 October 2026 from the local launch plan, questionnaire content, application code and current ICO guidance. This is a review of the implementation, not a live database or deployment audit. No customer records were inspected. The available business document is the proposed free-questionnaire/paid-guide launch plan, rather than a complete financial business plan.

The strongest preparation is to define the decisions the data will support: improving completion, checking whether questions are understood, improving the usefulness of readings, and measuring paid-guide/coaching demand. Collect each field for an explicit purpose. Adding optional fields later is possible; missing historical timing, version and permission evidence usually cannot be reconstructed.

**What is already implemented**

| Information | Current implementation |
| --- | --- |
| Completion date/time | Database-generated `created_at`, stored as a timestamp with time zone. It records when a finished response is inserted, not when the questionnaire began. |
| Email-step date/time | `claimed_at`; contact records also have creation/update timestamps. |
| Answers | Individual core/follow-up answers and separate reasons for skipped/not-applicable answers. |
| Version and scoring | Questionnaire version, full scoring output, outcome category and candidate/primary/secondary archetypes. Older content versions remain registered. |
| Recruitment source | Article slug and UTM fields, supplied by the browser at submission. |
| Contact | Email and optional first name at the result-unlock step. No age field. |
| Follow-up permission | Boolean, consent timestamp and wording version for one personal note from Sam in about a week. |
| Feedback | One useful/somewhat/not-really response, with no separate feedback timestamp or version. |
| Progress | Answers saved in the browser; no expiry in the saved structure. Unfinished answers are not saved to the response table. |
| Analytics | Consent-gated GA4 start/progress/completion/email/feedback events. These cover consenting visitors, not every participant. |

Relevant files: `lib/lens-check/db/schema.ts`, `repository.ts`, `types.ts`, `components/lens-check/LensCheckFlow.tsx`, `EmailGate.tsx`, `HelpfulRating.tsx`, and `lib/lens-check/insights.ts`.

**Recommended fields and questions**

| Field or question | Recommendation and purpose |
| --- | --- |
| Date and time | Keep automatic server timestamps in UTC and display in Europe/London. Export ISO timestamps with offsets, not just local minute-resolution dates. Never ask respondents to enter these. |
| Start and completion | Record an attempt start, completion and outcome. A server-issued attempt ID can support retries and operational state. Document the basis for any extra tracking; do not introduce analytics tracking under an essential-service label. |
| Duration | Keep elapsed duration and, if useful, an approximate active duration excluding hidden/idle periods. Label browser-derived timing as approximate. Do not infer dishonest responding solely from speed. |
| First name | Keep optional at the email step; no need for full name or mandatory identity collection at the beginning. |
| Age | If it supports audience analysis, ask optional bands: 18–24, 25–34, 35–44, 45–54, 55–64, 65+, prefer not to say. Store the band with the response, so later profile edits do not rewrite historical demographics. Do not collect date of birth without a distinct need. |
| Adult eligibility | Decide whether the first pilot is adults-only. If so, state this before starting and establish a proportionate approach to eligibility. A self-declared 18+ answer is not verified age and is not a universal compliance solution. |
| Main purpose | Optional: “Where would you most like this reflection to be useful?” Use a short fixed list including work/study, relationships, personal direction, everyday decisions, curiosity and prefer not to say. Keep it outside scoring unless deliberately designed and tested otherwise. |
| First attempt or retake | Optional self-report or verified returning-user linkage when justified. One email can have several responses; one browser can have several people. Report completions separately from known distinct participants. |
| Recruitment cohort | Record approved campaign codes and pilot/public cohort. Keep developer/synthetic flags under server control, rather than relying on public UTM strings. Treat browser attribution as unverified. |
| Notice and version evidence | Preserve the questionnaire, scoring, report, interface/experiment and privacy-notice versions relevant to an attempt. One immutable release manifest can cover these; separate version columns are not essential. Archive the actual wording/configuration. |
| Feedback | Separate perceived fit, usefulness and question clarity. Example: “How closely did this describe your experience?” and “Was anything difficult to understand?” Offer optional question IDs/reason categories before adding unrestricted text. Record when feedback was given and which reading it refers to. |
| Email operations | Track queued/sent/failed/bounced delivery, provider reference and retry state. Sent does not prove delivered or read. Verify email ownership before treating a contact as an account owner or using identity-based returning access. |
| Consent history | Record purpose/channel, grant/withdrawal, time, source and wording version. A single boolean is insufficient for a changing relationship. Avoid collecting IP addresses just as consent evidence; the ICO allows other identifiers. |
| Purchases, later | Separate order/payment/refund status, amount, currency, provider IDs, report entitlement and versions. Confirm purchase events on the server. Keep card information with the payment provider. |

Do not add phone number, postal address, precise location, employer, diagnosis, medication, ethnicity or other sensitive details without a defined need and appropriate assessment. Do not add gender solely because questionnaires commonly ask for it. An optional country field is only worthwhile if there is an actual localisation/market decision to support.

These recommendations follow the ICO requirement to keep information sufficient for the stated purpose and limited to what is necessary: [data minimisation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/). Proportionate age assurance depends on the service and risks: [ICO age-appropriate application](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/3-age-appropriate-application/).

**Findings to address before recruiting pilot participants**

1. **Make the privacy explanation match identifiable data.** Responses can be joined to contact records. Separating tables is useful, but linked records are not anonymous. Deleting a contact link also does not automatically anonymise a response if a retained private link, precise timestamp, export or email can reconnect it. Treat the information as personal data until the remaining identification risk has been assessed. See [ICO introduction to anonymisation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/introduction-to-anonymisation/).

2. **Implement the retention promises.** The privacy page promises 12 months after last activity for email details and 24 months for answers. I found no scheduled enforcement or dedicated last-activity definition/field. Define which activity resets the clock, delete/anonymise on schedule, and handle email providers, exports, logs and backup expiry. Keep purchase retention separate. Distinguish deleting contact details, withdrawing marketing permission, and erasing questionnaire data.

3. **Separate one-off follow-up, marketing and pilot contact.** The current checkbox requests one note in a week; it does not establish ongoing newsletter, promotional or future research permission. Returning submissions preserve an old true permission using an OR operation. That can outlast the promised single note. Add a usable withdrawal/suppression process and record a one-off follow-up's fulfilment. An unchecked box need not always mean withdrawal, but the interface must provide an explicit way to withdraw. Preserve permission evidence and the actual text shown. See [ICO recording and managing consent](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/how-should-we-obtain-record-and-manage-consent/).

4. **Review the result email's promotional content.** It currently promotes a coaching call even without the one-off follow-up permission. My assessment is that this needs review as marketing, rather than assuming the whole email is a purely administrative delivery message. A simple first-release approach is an email limited to the requested result/access information, with promotional messages governed separately. The ICO explains that promotional additions can make a service email direct marketing: [electronic mail key concepts](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/key-concepts-for-direct-marketing-using-electronic-mail/).

5. **Verify contact ownership and limit private-link exposure.** The current claim route accepts an email and immediately links the response; it does not prove ownership. Do not let an unverified submission amend a verified person's preferences or establish an authenticated purchase owner. Result links act as bearer access: anyone holding the link can view it. The result page constructs Calendly URLs with stored name/email/result, and admin notifications include personal details and a reading link. Review those disclosures, explain who can access answers, and favour an authenticated admin notification with minimal details. Avoid personal data and result categories in third-party URL parameters where possible.

6. **Review all tracking paths, not just explicit events.** Manual GA page views strip the result token, and result content has a Clarity mask. Those are useful but do not establish that automatic collection, custom events, replay URLs, outbound links or hosting logs are safe. The completion event explicitly sends the archetype ID. Prefer aggregate operational events without answers/archetypes; keep response analysis in the controlled database. Exclude questionnaire/private/admin pages from replay for the pilot, verify tracking in a browser network inspection, and provide a visible way to change analytics permission. CookieConsent currently presents its choice only while no stored decision exists.

7. **Give browser progress an expiry and a clear reset.** Unfinished answers currently remain in localStorage without a saved-at/expiry field. Protect people using shared devices: make resume deliberate, offer discard, expire old progress and explain local storage. Do not begin saving unfinished answers on the server simply to obtain abandonment statistics; aggregate stage counts may be enough.

8. **Make final submission safe to retry.** Each accepted final POST inserts a new response/token. If the save succeeds but the response is lost, a retry can count the same completion twice. Use a scoped idempotency key per attempt and ensure repeats return the same completed record. Preserve deliberate retakes as separate attempts.

9. **Improve analysis exports before they become the working dataset.** The answers export numbers rows R0001 onward on each download, rounds scores and omits an explicit questionnaire-version column and UTM breakdown. Add a stable analysis ID, version, machine-readable answer codes, timestamps, missing reasons and documented fields. Keep access tokens/contact details out of research exports. Coarsen timestamps/source categories and suppress tiny groups before sharing; removing names alone is not a guarantee of anonymity. Dashboard/export queries currently select the active content version only, so older data needs an explicit version-selection workflow.

10. **Record purposes and responsibility.** Decide who controls the customer data and handles access/deletion requests, how Sam and the developer access it, which providers receive it, the lawful basis for each purpose, and what happens if the collaboration ends. Add a concise notice before submission with a link to the full privacy information. A generic “I agree to the privacy policy” checkbox is not a replacement for this work. Review whether any intended health inference triggers special-category requirements; confidence and personal-direction questions are not automatically health data. See [ICO special-category data and inferences](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/).

**Questionnaire and pilot design**

The handoff JSON already contains three unused context questions: intended use, recent pressure, and constraints on freedom to act. C01 (intended use) is a useful candidate. C02/C03 need a separate decision about benefit, sensitivity and burden; do not enable all three automatically.

The active v0.3 framing is “these days”; v0.2 used “the past four weeks”. These do not define the same observation period. Choose the intended framing before the pilot and version subsequent changes. Rewording can also change what an item measures even if its ID stays the same. Recheck scoring mappings after semantic edits, including the four rewritten items documented in the content source.

Read Q07 aloud with testers (“I keep over planning and thinking…”), and check how they understand terms such as “personally important step” and “my own direction”. Q16 and Q41 concern how other people seek their help; check that the interpretation does not confuse an interpersonal strength with a problem. Ask participants to explain their interpretation before revealing the result, so the description does not supply the answer.

Keep skipped, not applicable, neutral and not asked distinct. Preserve mixed/unclear/insufficient outcomes. Do not force a sellable archetype when evidence is weak. The scorer explicitly declares unvalidated engineering defaults; software tests, simulations and an AI blind sort do not establish psychological validity. Perceived fit and usefulness are valuable feedback but are not evidence that the archetypes diagnose people or that coaching caused improvement.

Start with approximately 5–10 observed adult usability sessions as a practical first round, including people outside the immediate friendship group and people using phones/accessibility features. Recruit further pilot participants after fixing comprehension and flow problems. This number is for finding usability issues, not validating fourteen archetypes or demographic comparisons. Optional age bands will help describe the sample, but small group differences are exploratory.

Keep demographic questions optional and preferably after the main questions. Ask an eligibility question at the beginning only if needed for the chosen pilot scope. Preview email/payment expectations before people invest time. An email gate filters who provides feedback; obtain an optional short clarity/fit rating before that gate where possible, and count responses that never unlock.

The recommendations on pretesting, response burden and sampling limitations align with [AAPOR survey research best practices](https://aapor.org/standards-and-ethics/best-practices/).

**Business measurement**

Use a small funnel: eligible attempts started → completed → free result viewed → email verified → checkout started → confirmed paid guide → actual coaching booking. Define each denominator and observation window. Separate all completed-response counts from consented analytics estimates. A booking-link click is not a booking; an Amazon click is not a book sale. Do not treat missing analytics consent as failure to complete.

Keep attribution modest: approved source/campaign codes, unknown when unavailable, and an optional “how did you hear about this?” question if needed. Current UTM collection happens at final submission, so a resumed questionnaire can lose its initial source. Decide whether first-source capture is justified before implementing it. Do not store raw arbitrary referrer URLs or put email addresses in campaigns.

Before charging, calculate net contribution after provider fees, refunds, support and email/hosting costs; settle what one purchase unlocks and how long access lasts. Purchase records must support that promise independently of the contact/answer retention rules. Do not promise lifetime access by default.

**Suggested implementation order**

- [ ] Decide the pilot audience, intended questions, purposes and free/email/paid boundaries.
- [ ] Correct privacy language, retention handling, consent/withdrawal and private-result/contact ownership behaviour.
- [ ] Review email/Calendly disclosures; exclude private flows from replay and verify analytics leakage.
- [ ] Add attempt identity, retry protection, start/completion timing and version evidence.
- [ ] Add optional age band/main goal only where their use is clear; add practical feedback and export fields.
- [ ] Give saved browser answers expiry/reset controls; segregate test/synthetic records.
- [ ] Exercise submission, resumption, failed delivery, withdrawal, access/export/deletion and restore procedures using test records.
- [ ] Run observed sessions; fix issues and freeze a documented pilot version before broader recruitment.

Payments and authenticated purchased-guide access can follow the free pilot, provided participants are told clearly what is available and no unsupported purchase is offered.

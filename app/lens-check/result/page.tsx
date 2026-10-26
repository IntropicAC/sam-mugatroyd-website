import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EmailGate from "@/components/lens-check/EmailGate";
import HelpfulRating from "@/components/lens-check/HelpfulRating";
import { RevealSequence, RevealStage, StageLogo } from "@/components/lens-check/ArchetypeReveal";
import { Icon } from "@/components/lens-check/visuals";
import FadeInView from "@/components/ui/FadeInView";
import { articleEntries } from "@/lib/journal";
import { buildLensCheckCalendlyUrl } from "@/lib/lens-check/calendly";
import { getQuestionnaire } from "@/lib/lens-check/content";
import { emphasisRuns, splitDescription } from "@/lib/lens-check/description";
import { getResponseByToken, RESULT_TOKEN_PATTERN } from "@/lib/lens-check/repository";
import { evidenceFor, getArchetype, resultArchetypes } from "@/lib/lens-check/scoring";
import type { Answers, Archetype, QuestionnaireContent } from "@/lib/lens-check/types";
import { accountsEnabled } from "@/lib/lens-check/account-policy";
import { verifiedPrincipal } from "@/lib/lens-check/accounts";
import AccountResultGate from "@/components/lens-check/AccountResultGate";

export const metadata: Metadata = {
  title: "Your Mindset Test reading | Perception 47",
  robots: { index: false, follow: false },
  // The private result link must not leak to other sites through the Referer header.
  referrer: "no-referrer",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six"];

function Paragraph({ text, className }: { text: string; className?: string }) {
  return (
    <p className={className}>
      {emphasisRuns(text).map((run, i) => (run.em ? <em key={i}>{run.text}</em> : <span key={i}>{run.text}</span>))}
    </p>
  );
}

function ArchetypeReading({
  content,
  archetype,
  answers,
  showTitle,
}: {
  content: QuestionnaireContent;
  archetype: Archetype;
  answers: Answers;
  showTitle: boolean;
}) {
  const { body } = splitDescription(archetype.descriptionMarkdown);
  const evidence = evidenceFor(content, answers, archetype);
  return (
    <>
      <FadeInView>
        <section className="lc-r-section lc-description">
          {showTitle ? <h2>{archetype.title}</h2> : <p className="eyebrow">Your reading</p>}
          {body.map((paragraph, i) => (
            <Paragraph key={i} text={paragraph} />
          ))}
        </section>
      </FadeInView>
      {evidence.length > 0 && (
        <FadeInView>
          <section className="lc-r-section">
            <p className="eyebrow">{showTitle ? `What pointed to ${archetype.title}` : "What we noticed in your answers"}</p>
            <ul className="lc-quotes">
              {evidence.map((item) => (
                <li key={item.questionId}>
                  &ldquo;{item.text}&rdquo; <span className="ans">{item.answerLabel}</span>
                </li>
              ))}
            </ul>
          </section>
        </FadeInView>
      )}
    </>
  );
}

// The saved result behind the link.
async function loadResult({ t }: Awaited<Props["searchParams"]>) {
  const token = typeof t === "string" ? t : "";
  if (!RESULT_TOKEN_PATTERN.test(token)) return null;
  const row = await getResponseByToken(token).catch(() => null);
  if (!row) return null;
  const { response, lead } = row;
  return {
    token,
    version: response.questionnaireVersion,
    status: response.resultKind,
    primaryId: response.archetypeId,
    candidateIds: response.scoring?.candidateIds ?? [],
    secondaryId: response.secondaryArchetypeId,
    answers: response.answers,
    helpfulRating: response.helpfulRating,
    lead,
    accountRequired: response.accountRequired,
    access: row.access,
  };
}

async function Reading({ searchParams }: Props) {
  const params = await searchParams;
  const result = await loadResult(params);
  if (!result) {
    if (accountsEnabled() && !(await verifiedPrincipal())) return <div className="space-y-5">
      <h1 className="font-heading text-3xl">Sign in to view your saved reading</h1>
      <p>Use the account that saved it. Unclaimed readings can only be saved from the browser that completed them, within 24 hours.</p>
      <Link className="btn" href={`/lens-check/account?returnTo=${encodeURIComponent(`/lens-check/result?t=${typeof params.t === "string" ? params.t : ""}`)}`}>Sign in</Link>
    </div>;
    notFound();
  }
  const content = getQuestionnaire(result.version);
  if (!content) notFound();

  const { token, status, lead } = result;
  // The stored result decides the pattern, so the page always matches the email.
  const archetypes = resultArchetypes(content, { status, primaryId: result.primaryId, candidateIds: result.candidateIds });
  const secondary = status === "matched" ? getArchetype(content, result.secondaryId) : null;
  const claimed = result.accountRequired ? result.access === "owner" : !accountsEnabled() && Boolean(lead);
  const principal = result.accountRequired && !claimed ? await verifiedPrincipal() : null;
  const copy = content.outcomeCopy;

  const title =
    status === "matched" && archetypes[0]
      ? archetypes[0].title
      : status === "mixed" && archetypes.length > 1
        ? copy.mixed.title.replace("{count}", NUMBER_WORDS[archetypes.length] ?? String(archetypes.length))
        : status === "insufficient_data"
          ? copy.insufficient.title
          : copy.unclear.title;
  const lede =
    status === "matched" && archetypes[0]
      ? splitDescription(archetypes[0].descriptionMarkdown).oneLiner
      : status === "mixed" && archetypes.length > 1
        ? copy.mixed.intro
        : status === "insufficient_data"
          ? copy.insufficient.body
          : copy.unclear.body;

  const bookingUrl = buildLensCheckCalendlyUrl({
    name: lead?.firstName,
    email: lead?.email,
    archetypeTitle: archetypes.map((archetype) => archetype.title).join(" / ") || null,
    archetypeId: archetypes.map((archetype) => archetype.id).join("+") || null,
  });

  const categories = [...new Set(archetypes.flatMap((archetype) => archetype.articleCategories))];
  const readNext: typeof articleEntries = [];
  for (const category of categories) {
    const article = articleEntries.find((entry) => entry.category === category && !readNext.includes(entry));
    if (article) readNext.push(article);
    if (readNext.length >= 2) break;
  }

  return (
    <>
      {result.accountRequired && <nav className="lc-reading-toolbar" aria-label="Reading navigation"><Link href="/lens-check/my-results"><span aria-hidden="true">←</span> My results</Link><span>The Mindset Test · Your personal reading</span></nav>}
      <RevealSequence instant={archetypes.length === 0}>
        <div className="lc-reveal">
          <RevealStage ids={archetypes.map((archetype) => archetype.id)} />
          <div className="lc-reveal-copy">
            <div className="lc-reveal-title">
              <p className="eyebrow">Your lens</p>
              <h1 className="lc-arch-title">{title}</h1>
              <span className="lc-flourish" aria-hidden="true" />
            </div>
            <p className="lc-one-liner">{lede}</p>
            {status === "mixed" && archetypes.length > 1 && (
              <ul className="lc-candidates">
                {archetypes.map((archetype) => (
                  <li key={archetype.id}>
                    <b>{archetype.title}</b>
                    <span>{splitDescription(archetype.descriptionMarkdown).oneLiner}</span>
                  </li>
                ))}
              </ul>
            )}
            {archetypes.length > 0 && (
              <p className="lc-caveat">
                {archetypes.length > 1 ? "The closest patterns in your answers" : "The closest pattern in your answers"}, not
                a verdict.
              </p>
            )}
          </div>
        </div>

        {result.accountRequired && !claimed && <AccountResultGate token={token} signedIn={Boolean(principal)} />}
        {!result.accountRequired && !claimed && (accountsEnabled()
          ? <p className="lc-unlock">This older link isn&apos;t linked to an account. Take a new Mindset Test to save a reading to My results. Matching an old email address does not establish ownership.</p>
          : archetypes.length > 0 && <EmailGate token={token} bookingUrl={bookingUrl} />)}
        {result.accountRequired && claimed && <div className="lc-saved-note"><span aria-hidden="true">✓</span><div><p>Your free reading is saved to your account.</p><Link href="/lens-check/my-results">Find it anytime in My results</Link></div></div>}

        {archetypes.length === 0 && (
          <div className="lc-unlock">
            <Link className="btn full" href="/lens-check">
              Take the Mindset Test again
            </Link>
            {!result.accountRequired && <a className="text-btn" href={bookingUrl} target="_blank" rel="noopener noreferrer" data-source="lens-check">
              Or book a free call with Sam
            </a>}
          </div>
        )}

        {archetypes.length > 0 && claimed && (
          <div className="lc-reading">
            {archetypes.map((archetype) => (
              <ArchetypeReading
                key={archetype.id}
                content={content}
                archetype={archetype}
                answers={result.answers}
                showTitle={archetypes.length > 1}
              />
            ))}

            {secondary && (
              <FadeInView>
                <section className="lc-r-section">
                  <p className="lc-also">
                    <span className="eyebrow">Also in your picture</span>
                    Your answers also showed something of {secondary.title}:{" "}
                    <em>{splitDescription(secondary.descriptionMarkdown).oneLiner.replace(/^You are/, "you are")}</em>
                  </p>
                </section>
              </FadeInView>
            )}

            {!result.accountRequired && <FadeInView>
              <section className="lc-cta">
                <svg viewBox="0 0 340 54" aria-hidden="true" fill="none">
                  <path d="M0 46 C70 40 120 44 190 36 C250 29 300 30 340 28" stroke="var(--lc-on-dark-faint)" strokeWidth="1" />
                  <circle cx="292" cy="22" r="9" fill="var(--lc-gold)" opacity=".7" />
                  <path d="M18 54 C40 46 70 48 92 42 C120 34 150 40 176 36" stroke="var(--lc-sage)" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <p className="eyebrow">Talk it through</p>
                <h2>Bring this to a free 20-minute call.</h2>
                <p>
                  Sam will help you see what sits behind {archetypes.length > 1 ? "these patterns" : "this pattern"}, and what
                  you might want to do with it.
                </p>
                <a className="btn full" href={bookingUrl} target="_blank" rel="noopener noreferrer" data-source="lens-check">
                  Book your free 20-minute call
                  <Icon name="arrow" />
                </a>
                <small>No pressure and no performance. A clear conversation about where you are.</small>
              </section>
            </FadeInView>}

            {readNext.length > 0 && (
              <FadeInView>
                <section className="lc-r-section">
                  <p className="eyebrow">Read next</p>
                  <div>
                    {readNext.map((article) => (
                      <Link key={article.slug} className="lc-article-link" href={`/articles/${article.slug}`}>
                        <span className="eyebrow">{article.category}</span>
                        <b>{article.title}</b>
                      </Link>
                    ))}
                  </div>
                </section>
              </FadeInView>
            )}

            <FadeInView>
              <HelpfulRating token={token} initial={result.helpfulRating} />
            </FadeInView>
          </div>
        )}

        <div className="lc-result-foot">
          <p>
            The Mindset Test is a reflection, not a clinical assessment. If you&apos;re struggling, you can call Samaritans free on 116 123 or contact NHS 111.
          </p>
          <Link className="btn ghost" href="/lens-check">
            Retake the Mindset Test
          </Link>
        </div>
      </RevealSequence>
    </>
  );
}

export default function LensCheckResultPage({ searchParams }: Props) {
  return (
    <section className="lc min-h-dvh px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
      <div className="lc-result" data-clarity-mask="true">
        <Suspense
          fallback={
            // The logo the quiz painted while saving, in the same place, so the
            // hand-off to the result is seamless.
            <div className="lc-reveal" aria-label="Loading your reading">
              <StageLogo />
            </div>
          }
        >
          <Reading searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

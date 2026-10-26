'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trackLensCheck } from "@/lib/lens-check/analytics";
import { highlightRuns } from "@/lib/lens-check/highlight";
import { LOGO_RECT, mascotsFor, mascotSrc, stagePlacement } from "@/lib/lens-check/mascots";
import { BEGIN_HASH, readSaved, writeSaved } from "@/lib/lens-check/progress";
import { useJourneyReporting } from "./useJourneyReporting";
import type {
  Answers,
  MissingReason,
  MissingReasons,
  PublicQuestionnaire,
  Question,
  ResponseValue,
  ResultPreview,
} from "@/lib/lens-check/types";
import { GlyphIcon, Icon, JourneyRail, LandscapeStrip, LogoMap, LogoPaint } from "./visuals";

const CLARITY = [0.1, 0.26, 0.42, 0.58, 0.74, 0.9];
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
// Long enough for the logo to finish painting on (see .lc-logo-paint in
// lens-check.css) before the result page takes it from there.
const MIN_FOCUS_MS = 1850;
// The chosen circle fills, then the card is thrown off while the next one
// rises from the deck in the same moment. Keep CARD_MOVE_MS and
// PART_EXIT_MS in sync with the .lc-card animations in lens-check.css.
const ANSWER_FEEDBACK_MS = 140;
const CARD_MOVE_MS = 320;
const PART_EXIT_MS = 300;
// Even without motion, a double tap mustn't answer the next statement unseen.
const DOUBLE_TAP_MS = 200;

type View =
  | { kind: "map"; part: number }
  | { kind: "question" }
  | { kind: "followup-intro" }
  | { kind: "focusing" };

const noSubscribe = () => () => {};
const arrivedToBegin = () => window.location.hash === BEGIN_HASH;

function readSource() {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  return { from: params.get("from") ?? undefined, utm };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Shows the intro, then runs the quiz in the same page once someone begins.
// The six parts walk the core statements; if two patterns end up close, the
// server returns a few follow-up statements, asked as a short seventh leg.
export default function LensCheckFlow({ questionnaire, accountFlow = false }: { questionnaire: PublicQuestionnaire; accountFlow?: boolean }) {
  const router = useRouter();
  const { parts, version } = questionnaire;
  const coreQuestions = useMemo(() => parts.flatMap((part) => part.questions), [parts]);
  const coreTotal = coreQuestions.length;

  const [followups, setFollowups] = useState<Question[]>([]);
  const questions = useMemo(() => [...coreQuestions, ...followups], [coreQuestions, followups]);
  const total = questions.length;
  // Question indexes for each part; follow-ups form a last, map-less part.
  const partIndexes = useMemo(() => {
    let offset = 0;
    const lists = parts.map((part) => part.questions.map(() => offset++));
    if (followups.length > 0) lists.push(followups.map(() => offset++));
    return lists;
  }, [parts, followups]);
  const partOf = useCallback((index: number) => partIndexes.findIndex((list) => list.includes(index)), [partIndexes]);
  const isFollowup = useCallback((index: number) => index >= coreTotal, [coreTotal]);

  // Arriving through a "Take the Mindset Test" button (BEGIN_HASH) skips the
  // intro. Read on the client only, so the server-rendered intro still hydrates.
  const beginOnArrival = useSyncExternalStore(noSubscribe, arrivedToBegin, () => false);
  const [chosenOpen, setOpen] = useState<boolean | null>(null);
  const open = chosenOpen ?? beginOnArrival;
  const [view, setView] = useState<View>({ kind: "map", part: 0 });
  const [answers, setAnswers] = useState<Answers>({});
  const [missing, setMissing] = useState<MissingReasons>({});
  const [qi, setQi] = useState(0);
  const [shownQi, setShownQi] = useState(0);
  const [justAnswered, setJustAnswered] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState<{ answers: Answers; missing: MissingReasons; withFollowups: boolean } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const submissionId = useRef("");
  const [ageBand, setAgeBand] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [reportingConsent, setReportingConsent] = useState(false);
  const processed = Object.keys(answers).filter(id => questions.some(q => q.id === id));
  const journey = useJourneyReporting(reportingConsent, open && (!accountFlow || ageConfirmed), submissionId.current, {
    version, stage: error ? "error" : view.kind, questionId: view.kind === "question" ? questions[shownQi]?.id ?? null : null,
    questionNumber: view.kind === "question" ? shownQi + 1 : 0, totalQuestions: total,
    processedCount: processed.length, answeredCount: processed.filter(id => answers[id] !== null).length,
    skippedCount: processed.filter(id => answers[id] === null && missing[id] === "skipped").length,
    notApplicableCount: processed.filter(id => answers[id] === null && missing[id] !== "skipped").length,
  });
  const progressChoice = <label className="lc-progress-choice"><input type="checkbox" checked={reportingConsent} onChange={event => setReportingConsent(event.target.checked)} /><span>Help improve the test (optional): share question numbers reached, approximate active time, device category and save errors. No unfinished answers are shared. You can turn this off here; progress measurements are kept for up to 90 days. <Link href="/privacy">Privacy</Link></span></label>;

  // Restore saved progress after mount (localStorage isn't available on the server).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readSaved(version);
      const resumed = Boolean(saved && Object.keys(saved.answers).length > 0);
      submissionId.current = saved?.submissionId || crypto.randomUUID();
      setReportingConsent(saved?.reportingConsent === true);
      if (saved?.ageBand && ["13-15", "16-17", "18+"].includes(saved.ageBand)) {
        setAgeBand(saved.ageBand);
        setAgeConfirmed(true);
      }
      if (saved && resumed) {
        setAnswers(saved.answers);
        setMissing(saved.missing ?? {});
        setFollowups(saved.followups ?? []);
        const resume = Math.min(saved.qi, coreTotal + (saved.followups?.length ?? 0) - 1);
        setQi(resume);
        setShownQi(resume);
        setHasProgress(true);
      }
      if (arrivedToBegin()) {
        // As begin() would. Open first, then drop the hash, so a refresh
        // later shows the intro as usual.
        setOpen(true);
        if (resumed) setView({ kind: "question" });
        else trackLensCheck("lens_check_start");
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [version, coreTotal]);

  // Each step starts at the top of the page, just under the site header.
  useEffect(() => {
    if (open) window.scrollTo({ top: 0 });
  }, [open, view]);

  useEffect(() => {
    if (open) headingRef.current?.focus({ preventScroll: true });
  }, [open, view, shownQi]);

  const persist = useCallback(
    (nextAnswers: Answers, nextMissing: MissingReasons, nextQi: number, nextFollowups: Question[] = followups) =>
      writeSaved({ version, answers: nextAnswers, missing: nextMissing, qi: nextQi, followups: nextFollowups, submissionId: submissionId.current, ageBand, reportingConsent }),
    [version, followups, ageBand, reportingConsent],
  );

  const begin = () => {
    setOpen(true);
    setError(null);
    if (Object.keys(answers).length === 0) {
      setView({ kind: "map", part: 0 });
      trackLensCheck("lens_check_start");
    } else {
      setView({ kind: "question" });
    }
  };

  const startAgain = () => {
    submissionId.current = crypto.randomUUID();
    setAgeBand("");
    setAgeConfirmed(false);
    writeSaved(null);
    setAnswers({});
    setMissing({});
    setFollowups([]);
    setQi(0);
    setShownQi(0);
    setHasProgress(false);
    setView({ kind: "map", part: 0 });
    setOpen(true);
    trackLensCheck("lens_check_start");
  };

  // withFollowups: false sends the core answers only, so the server decides
  // afresh whether follow-ups are needed (answers may have changed since).
  const submit = async (allAnswers: Answers, allMissing: MissingReasons, withFollowups: boolean) => {
    const coreIds = new Set(coreQuestions.map((question) => question.id));
    const keep = (id: string) => withFollowups || coreIds.has(id);
    const sentAnswers = Object.fromEntries(Object.entries(allAnswers).filter(([id]) => keep(id)));
    const sentMissing = Object.fromEntries(Object.entries(allMissing).filter(([id]) => keep(id)));

    setView({ kind: "focusing" });
    setError(null);
    setRetry(null);
    const started = Date.now();
    try {
      await journey.flush();
      if (accountFlow) {
        const attempt = await fetch("/api/lens-check/attempt", { method: "POST" });
        if (!attempt.ok) throw new Error("We couldn't start a secure attempt. Please try again.");
      }
      const response = await fetch("/api/lens-check/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, answers: sentAnswers, missing: sentMissing, source: readSource(), submissionId: submissionId.current, ageBand, journeySecret: reportingConsent ? submissionId.current : undefined }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        token?: string;
        preview?: ResultPreview;
        followups?: Question[];
        error?: string;
      };
      if (response.ok && data.followups && data.followups.length > 0) {
        setFollowups(data.followups);
        persist(allAnswers, allMissing, coreTotal, data.followups);
        setView({ kind: "followup-intro" });
        trackLensCheck("lens_check_followups", { count: data.followups.length });
        return;
      }
      if (!response.ok || !data.token) throw new Error(data.error || "We couldn't save your answers. Please try again.");
      // Fetch the result's character and the reveal code while the logo paints.
      for (const mascot of mascotsFor(data.preview?.archetypes.map((archetype) => archetype.id) ?? [])) {
        new window.Image().src = mascotSrc(mascot);
      }
      void import("./reveal-engine");
      const primary = data.preview?.status === "matched" ? data.preview.archetypes[0] : undefined;
      trackLensCheck("lens_check_complete", { result: data.preview?.status ?? "unknown", ...(primary ? { archetype_id: primary.id } : {}) });
      const minimumFocus = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : MIN_FOCUS_MS;
      await wait(Math.max(0, minimumFocus - (Date.now() - started)));
      writeSaved(null);
      // A retake is a new completion even if Next preserves this page's state
      // in its navigation cache when the visitor comes back.
      submissionId.current = crypto.randomUUID();
      setAnswers({}); setMissing({}); setFollowups([]);
      setQi(0); setShownQi(0); setHasProgress(false);
      setAgeBand(""); setAgeConfirmed(false); setOpen(false);
      setView({ kind: "map", part: 0 });
      router.push(`/lens-check/result?t=${data.token}`);
    } catch (submitError) {
      journey.error();
      setRetry({ answers: allAnswers, missing: allMissing, withFollowups });
      setError(submitError instanceof Error ? submitError.message : "We couldn't save your answers. Please try again.");
    }
  };

  const advance = (from: number, nextAnswers: Answers, nextMissing: MissingReasons) => {
    setBusy(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const part = partOf(from);
    const lastInPart = partIndexes[part][partIndexes[part].length - 1] === from;
    const lastOverall = from === total - 1;
    persist(nextAnswers, nextMissing, Math.min(from + 1, total - 1));
    const quarter = [1, 2, 3].find((k) => from + 1 === Math.round((coreTotal * k) / 4));
    if (quarter) trackLensCheck("lens_check_progress", { question: from + 1 });

    window.setTimeout(() => {
      setJustAnswered(from);
      setQi(from + 1);
      if (lastInPart || lastOverall) {
        // The deck is empty: throw the last card, then go to the checkpoint.
        setLeaving(true);
        window.setTimeout(() => {
          setLeaving(false);
          setBusy(false);
          setJustAnswered(null);
          if (isFollowup(from) && lastOverall) void submit(nextAnswers, nextMissing, true);
          else setView({ kind: "map", part: part + 1 });
        }, reducedMotion ? 0 : PART_EXIT_MS);
        return;
      }
      setShownQi(from + 1);
      // Held until the next card has settled, so a quick second tap can't
      // land on a statement nobody has read yet.
      window.setTimeout(() => {
        setBusy(false);
        setJustAnswered(null);
      }, reducedMotion ? DOUBLE_TAP_MS : CARD_MOVE_MS);
    }, reducedMotion ? 0 : ANSWER_FEEDBACK_MS);
  };

  const record = (value: ResponseValue | null, reason: MissingReason | null, autoAdvance: boolean) => {
    if (busy) return;
    const question = questions[shownQi];
    const nextAnswers = { ...answers, [question.id]: value };
    const nextMissing = { ...missing };
    if (reason) nextMissing[question.id] = reason;
    else delete nextMissing[question.id];
    setAnswers(nextAnswers);
    setMissing(nextMissing);
    if (autoAdvance) advance(shownQi, nextAnswers, nextMissing);
    else persist(nextAnswers, nextMissing, shownQi);
  };

  const skipFollowups = () => {
    const nextAnswers = { ...answers };
    const nextMissing = { ...missing };
    for (const question of followups) {
      nextAnswers[question.id] = null;
      nextMissing[question.id] = "skipped";
    }
    setAnswers(nextAnswers);
    setMissing(nextMissing);
    void submit(nextAnswers, nextMissing, true);
  };

  const goToQuestion = (index: number) => {
    setQi(index);
    setShownQi(index);
    setView({ kind: "question" });
  };

  const goBack = () => {
    if (busy) return;
    if (view.kind === "map") {
      if (view.part === 0) return;
      const previous = partIndexes[view.part - 1];
      goToQuestion(previous[previous.length - 1]);
      return;
    }
    if (view.kind === "followup-intro") {
      setView({ kind: "map", part: parts.length });
      return;
    }
    if (view.kind !== "question") return;
    if (shownQi === coreTotal) {
      setView({ kind: "followup-intro" });
      return;
    }
    const part = partOf(shownQi);
    if (partIndexes[part][0] === shownQi) {
      setView({ kind: "map", part });
      return;
    }
    goToQuestion(shownQi - 1);
  };

  const continueFromMap = (part: number) => {
    if (part >= parts.length) {
      void submit(answers, missing, false);
      return;
    }
    goToQuestion(partIndexes[part][0]);
  };

  const answeredCount = coreQuestions.filter((question) => Object.hasOwn(answers, question.id)).length;
  const backDisabled = view.kind === "focusing" || (view.kind === "map" && view.part === 0);
  const currentPart = view.kind === "map" ? view.part : view.kind === "question" ? partOf(shownQi) : parts.length;
  const clarity = view.kind === "focusing" ? 1 : (CLARITY[currentPart] ?? 0.95);

  if (!open) {
    return (
      <section className="lc-intro-stage">
        <div className="lc-intro">
          <div className="lc-intro-copy">
            <p className="eyebrow">The Mindset Test</p>
            <h1>Find your lens</h1>
            <div className="lc-rule" aria-hidden="true" />
          </div>
          <div className="lc-intro-lens" aria-hidden="true">
            <div className="glass g-back" />
            <div className="glass g-ring" />
            <div className="glass g-photo">
              <Image
                src="/images/lens-check/intro-path.png"
                alt=""
                fill
                sizes="(min-width: 960px) 520px, 230px"
                priority
              />
            </div>
          </div>
          <p className="lc-lede">
            A reflection on how things are for you these days: short statements about how you start things,
            choose your direction, look after others, speak up and see yourself.
          </p>
          <ul className="lc-benefits">
            <li>
              <Icon name="path" />
              <div>
                <b>{coreTotal} short statements</b>
                <span>How true each is of you these days.</span>
              </div>
            </li>
            <li>
              <Icon name="lens" />
              <div>
                <b>Your lens, drawn from your answers</b>
                <span>The pattern you fit most closely, or an honest blend.</span>
              </div>
            </li>
            <li>
              <Icon name="compass" />
              <div>
                <b>A reading written by Sam</b>
                <span>What your pattern gives you, and what it may cost.</span>
              </div>
            </li>
          </ul>
          <div className="lc-begin">
            <button type="button" className="btn full" onClick={begin}>
              {hasProgress ? "Continue your reflection" : "Begin your reflection"}
              <Icon name="arrow" />
            </button>
            <span className="meta">{coreTotal} statements · free · pick up where you left off</span>
            {hasProgress && (
              <button type="button" className="text-btn" onClick={startAgain}>
                Start again from the beginning
              </button>
            )}
          </div>
          {accountFlow ? <p className="lc-small-print">
            For ages 13 and over. After the questions, verify your email to see your full free reading and save it to My results.
            Your answers and reading will be linked to your account. Marketing is not part of sign-in. Progress on this device expires after 24 hours.
            The Mindset Test is a reflection, not a diagnosis. <a href="/privacy" className="underline">Read about your privacy</a>.
            {" "}<a href="/lens-check/my-results" className="underline">Already have an account? My results</a>
          </p> : <p className="lc-small-print">
            Your full reading is sent to you by email. The Mindset Test is new and still being refined. It is a
            reflection, not a diagnosis, and is for adults aged 18 and over. Your answers are stored without your name
            to help improve the questions; see the privacy policy for details.
          </p>}
          <div className="lc-signoff">
            <span className="sig">Sam Murgatroyd</span>
            <span className="eyebrow">Perception 47 Coaching</span>
          </div>
          {progressChoice}
        </div>
      </section>
    );
  }

  if (accountFlow && !ageConfirmed) return (
    <section className="lc-stage" aria-label="Before you begin">
      <div className="mx-auto max-w-lg px-6 py-24 space-y-5">
        <p className="eyebrow">Before you begin</p><h1 className="font-heading text-3xl">Your age group</h1>
        <p>The Mindset Test is for ages 13 and over. You will verify your email after the questions to see and save your full free reading.</p>
        <fieldset className="space-y-3"><legend>Which age group are you in?</legend>
          {[["under13", "Under 13"], ["13-15", "13–15"], ["16-17", "16–17"], ["18+", "18 or over"]].map(([value, label]) =>
            <label key={value} className="flex gap-3"><input type="radio" name="age-band" value={value} checked={ageBand === value} onChange={() => setAgeBand(value)} />{label}</label>)}
        </fieldset>
        {ageBand === "under13" ? <>
            <p>The Mindset Test isn&apos;t available for your age group. We won&apos;t collect questionnaire answers.</p>
            <Link className="btn" href="/">Return to the homepage</Link>
        </> : <button className="btn" disabled={!ageBand} onClick={() => setAgeConfirmed(true)}>Continue to the questions</button>}
        <p className="text-sm">Your age group is used for eligibility, not scoring. <a href="/privacy" className="underline">Privacy information</a></p>
        {ageBand !== "under13" && progressChoice}
      </div>
    </section>
  );

  const question = questions[shownQi];
  const part = partOf(shownQi);

  return (
    <section className="lc-stage" aria-label="The Mindset Test" data-view={view.kind === "focusing" && error ? "focusing-error" : view.kind} data-clarity-mask="true">
      <div className="lc-stage-inner">
        <div className="lc-controls">
          <button type="button" className="lc-control" onClick={goBack} disabled={backDisabled}>
            <Icon name="back" />
            Back
          </button>
          <button type="button" className="lc-control" onClick={() => setOpen(false)}>
            Leave for now
            <Icon name="close" />
          </button>
        </div>
        <details className="lc-progress-settings"><summary>Progress privacy</summary>{progressChoice}</details>
        <div className="lc-body">
          <LandscapeStrip clarity={clarity} />
          <div className="lc-step">
            <div className="lc-column">
              {view.kind === "map" && (
                <PartMap
                  key={`map-${view.part}`}
                  part={view.part}
                  questionnaire={questionnaire}
                  answeredCount={answeredCount}
                  coreTotal={coreTotal}
                  headingRef={headingRef}
                  onContinue={() => continueFromMap(view.part)}
                />
              )}

              {view.kind === "followup-intro" && (
                <div className="lc-map enter">
                  <p className="eyebrow">One more step</p>
                  <div className="lc-map-copy">
                    <h2 ref={headingRef} tabIndex={-1}>
                      {followups.length === 2 ? "Two more statements" : `${followups.length} more statements`}
                    </h2>
                    <p className="line">
                      Your answers sit close to more than one pattern. A few more statements will help tell them apart.
                      They&apos;re optional.
                    </p>
                  </div>
                  <button type="button" className="btn full" onClick={() => goToQuestion(coreTotal)}>
                    Continue
                    <Icon name="arrow" />
                  </button>
                  <button type="button" className="text-btn" onClick={skipFollowups}>
                    Skip these and see my result
                  </button>
                </div>
              )}

              {view.kind === "question" && question && (
                <div className="lc-qs">
                  <JourneyRail
                    groups={partIndexes}
                    answered={questions.map((q) => Object.hasOwn(answers, q.id))}
                    qi={qi}
                    justAnswered={justAnswered}
                    total={total}
                    partLabel={isFollowup(shownQi) ? "One more step" : parts[part].label}
                    partGlyph={isFollowup(shownQi) ? "lens" : parts[part].glyph}
                  />
                  <StatementDeck
                    card={{
                      key: shownQi,
                      text: question.text,
                      highlights: question.highlights,
                      remaining: partIndexes[part][partIndexes[part].length - 1] - shownQi,
                      lastPart: part === partIndexes.length - 1,
                    }}
                    stem={questionnaire.questionStem}
                    leaving={leaving}
                    headingRef={headingRef}
                  />
                  <AnswerScale
                    scale={questionnaire.responseScale}
                    value={answers[question.id]}
                    locked={busy}
                    onAnswer={(value) => record(value, null, true)}
                  />
                  <QuestionFoot
                    value={answers[question.id]}
                    reason={missing[question.id]}
                    locked={busy}
                    onMissing={(reason) => record(null, reason, true)}
                    onNext={() => {
                      if (!busy && answers[question.id] !== undefined) advance(shownQi, answers, missing);
                    }}
                  />
                </div>
              )}

              {view.kind === "focusing" && (
                <div className="lc-focusing">
                  <div className="lc-art" aria-hidden="true">
                    <LogoPaint style={stagePlacement(LOGO_RECT)} />
                  </div>
                  <h2 ref={headingRef} tabIndex={-1}>
                    {error ? "Something went wrong" : "Bringing your lens into focus"}
                  </h2>
                  {error ? (
                    <>
                      <p className="error" role="alert">
                        {error}
                      </p>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => retry && void submit(retry.answers, retry.missing, retry.withFollowups)}
                      >
                        Try again
                      </button>
                    </>
                  ) : (
                    <p>Reading your answers</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PartMap({
  part,
  questionnaire,
  answeredCount,
  coreTotal,
  headingRef,
  onContinue,
}: {
  part: number;
  questionnaire: PublicQuestionnaire;
  answeredCount: number;
  coreTotal: number;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onContinue: () => void;
}) {
  const { parts } = questionnaire;
  const totalParts = parts.length;
  const finished = part >= totalParts;
  const current = parts[Math.min(part, totalParts - 1)];
  const answeredSoFar = parts.slice(0, part).reduce((n, p) => n + p.questions.length, 0);
  const word = NUMBER_WORDS[totalParts] ?? String(totalParts);
  const half = Math.ceil(totalParts / 2);

  const legendRow = (p: (typeof parts)[number], i: number) => {
    const state = i < part ? "done" : i === part ? "current" : "upcoming";
    return (
      <li key={p.id} className={`lc-lg ${state}`}>
        <span className="badge">
          <GlyphIcon id={p.glyph} className="" />
        </span>
        <span>{p.label}</span>
        {state === "done" && (
          <svg className="tick" viewBox="0 0 12 12" aria-label="complete">
            <path d="M2.5 6.3 5 8.6 9.6 3.6" />
          </svg>
        )}
      </li>
    );
  };

  return (
    <div className="lc-map enter">
      {!finished && (
        <p className="eyebrow">
          Part {part + 1} of {totalParts}
        </p>
      )}
      <LogoMap parts={parts} completedParts={part} />
      <div className="lc-legend" aria-hidden="true">
        <ol>{parts.slice(0, half).map((p, i) => legendRow(p, i))}</ol>
        <ol>{parts.slice(half).map((p, i) => legendRow(p, i + half))}</ol>
      </div>
      <div className="lc-map-copy">
        {finished ? (
          <>
            <p className="eyebrow">All {word} parts complete</p>
            <h2 ref={headingRef} tabIndex={-1}>
              One connected picture
            </h2>
            <p className="line">
              {`${word.charAt(0).toUpperCase() + word.slice(1)} parts, drawn together. Now let's bring your lens into focus.`}
            </p>
            <p className="meta">
              {answeredCount} of {coreTotal} statements answered
            </p>
          </>
        ) : (
          <>
            <h2 ref={headingRef} tabIndex={-1}>
              {current.title}
            </h2>
            <p className="line">{current.interstitial}</p>
            <p className="meta">
              {current.questions.length} statements
              {answeredSoFar ? ` · ${answeredSoFar} of ${coreTotal} done so far` : ""}
            </p>
          </>
        )}
      </div>
      <button type="button" className="btn full" onClick={onContinue}>
        {finished ? "Bring my lens into focus" : part === 0 ? "Begin" : "Continue"}
        <Icon name="arrow" />
      </button>
    </div>
  );
}

// Statements longer than this get a slightly smaller heading so they still
// sit comfortably on the card on small screens.
const LONG_STATEMENT = 80;
// Cards left in a part show as edges under the current one (parts hold 8-9).
const MAX_STACK = 8;

type DeckCard = { key: number; text: string; highlights?: string[]; remaining: number; lastPart: boolean };
type DeckMotion = "deal" | "forward" | "back";

// Each part is a small deck of statement cards. Answering throws the top card
// off to the left while the next rises from the deck, and the edges of the
// cards still to come shrink by one each time.
function StatementDeck({
  card,
  stem,
  leaving,
  headingRef,
}: {
  card: DeckCard;
  stem: string;
  leaving: boolean;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const [current, setCurrent] = useState(card);
  const [motion, setMotion] = useState<DeckMotion>("deal");
  const [exiting, setExiting] = useState<{ card: DeckCard; motion: DeckMotion } | null>(null);
  // A new card: keep the old one on screen just long enough to animate away.
  if (card.key !== current.key) {
    const next = card.key > current.key ? "forward" : "back";
    setExiting({ card: current, motion: next });
    setMotion(next);
    setCurrent(card);
  }
  const stack = Math.min(card.remaining, MAX_STACK);

  return (
    <div className="lc-deck-area">
      <div className="lc-deck" data-motion={motion}>
        {/* Keyed by statement, so each edge slides up a place as the deck advances. */}
        {Array.from({ length: stack }, (_, i) => (
          <span key={card.key + i + 1} className="lc-sliver" style={{ ["--k" as string]: i + 1 }} aria-hidden="true" />
        ))}
        {exiting && (
          <div
            key={`out-${exiting.card.key}`}
            className={`lc-card exit-${exiting.motion}`}
            aria-hidden="true"
            inert
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) setExiting(null);
            }}
          >
            <CardFace card={exiting.card} stem={stem} />
          </div>
        )}
        <div key={card.key} className={`lc-card ${leaving ? "exit-forward" : `enter-${motion}`}`}>
          <CardFace card={card} stem={stem} headingRef={headingRef} />
        </div>
      </div>
    </div>
  );
}

function CardFace({
  card,
  stem,
  headingRef,
}: {
  card: DeckCard;
  stem: string;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
}) {
  const left =
    card.remaining > 0 ? `${card.remaining} more in this part` : card.lastPart ? "Last statement" : "Last in this part";
  return (
    <div className="lc-card-face" data-length={card.text.length > LONG_STATEMENT ? "long" : "short"}>
      <p className="eyebrow">{stem}</p>
      <div className="lc-card-body">
        <h2 ref={headingRef} tabIndex={headingRef ? -1 : undefined} id={headingRef ? "lc-question" : undefined}>
          {highlightRuns(card.text, card.highlights).map((run, i) =>
            run.key ? (
              <span key={i} className="key">
                {run.text}
              </span>
            ) : (
              run.text
            ),
          )}
        </h2>
      </div>
      <p className={`lc-card-left${card.remaining === 0 ? " last" : ""}`}>{left}</p>
    </div>
  );
}

// "Mostly true of me" -> "Mostly": the scale's caption carries "true of me".
const amountWord = (label: string) => label.replace(/ true of me$/, "");

// Five circles that fill from empty to full, in the same place for every
// statement, so the hand learns where each answer is. Keys 1-5 answer too.
function AnswerScale({
  scale,
  value,
  locked,
  onAnswer,
}: {
  scale: PublicQuestionnaire["responseScale"];
  value: ResponseValue | null | undefined;
  locked: boolean;
  onAnswer: (value: ResponseValue) => void;
}) {
  const [pulse, setPulse] = useState<{ index: number; n: number } | null>(null);
  const choose = useRef<(index: number) => void>(() => {});
  useEffect(() => {
    choose.current = (index: number) => {
      if (locked) return;
      setPulse((previous) => ({ index, n: (previous?.n ?? 0) + 1 }));
      onAnswer(scale[index].value);
    };
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if ((event.target as HTMLElement | null)?.closest("input, textarea, select, [contenteditable]")) return;
      const index = Number(event.key) - 1;
      if (!Number.isInteger(index) || index < 0 || index >= scale.length) return;
      event.preventDefault();
      choose.current(index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scale.length]);

  return (
    <div className="lc-scale" role="group" aria-labelledby="lc-question lc-scale-cap">
      <p className="lc-scale-cap" id="lc-scale-cap">
        How true is this of you?
      </p>
      <div className="lc-scale-row">
        {scale.map((step, i) => (
          <button
            key={step.value}
            type="button"
            className="lc-pick"
            data-answer={i}
            aria-pressed={value === step.value}
            aria-label={step.label}
            onClick={() => choose.current(i)}
            style={{ ["--level" as string]: i / Math.max(1, scale.length - 1) }}
          >
            <span className="ball" aria-hidden="true">
              {/* Stays green while the next card arrives, then fades. */}
              {pulse?.index === i && <span key={pulse.n} className="flash" />}
            </span>
            <span className="word" aria-hidden="true">
              {amountWord(step.label)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionFoot({
  value,
  reason,
  locked,
  onMissing,
  onNext,
}: {
  value: ResponseValue | null | undefined;
  reason: MissingReason | undefined;
  locked: boolean;
  onMissing: (reason: MissingReason) => void;
  onNext: () => void;
}) {
  const notApplicable = value === null && reason !== "skipped";
  const skipped = value === null && reason === "skipped";
  return (
    <div className="lc-q-foot">
      <span className="lc-q-missing">
        <button type="button" className={`text-btn${notApplicable ? " chosen" : ""}`} aria-pressed={notApplicable} onClick={() => onMissing("not_applicable")}>
          Not applicable
        </button>
        <button type="button" className={`text-btn${skipped ? " chosen" : ""}`} aria-pressed={skipped} onClick={() => onMissing("skipped")}>
          Skip
        </button>
      </span>
      {/* Only for a statement answered earlier (after going back), not while an answer moves on. */}
      {value !== undefined && !locked ? (
        <button type="button" className="btn lc-next" onClick={onNext}>
          Next
          <Icon name="arrow" />
        </button>
      ) : (
        <span className="lc-keys" aria-hidden="true">
          Press <kbd>1</kbd>–<kbd>5</kbd> to answer
        </span>
      )}
    </div>
  );
}

import Link from "next/link";
import {
  formatLondonDate,
  HELPFUL_LABELS,
  type InsightRow,
  type InsightsSummary,
} from "@/lib/lens-check/insights";
import { NOT_APPLICABLE_LABEL, SKIPPED_LABEL } from "@/lib/lens-check/scale";

// Ordinal greens validated against the cream surface (one hue, light to dark).
const RAMP_FIVE = ["#96b39d", "#77937d", "#59745f", "#3c5642", "#203927"];
const NOT_APPLICABLE_FILL = "#E6DFD5";
const SKIPPED_FILL = "#D8D0C6";
const BAR_FILL = "#3D5948";
const MUTED_FILL = "#B9B1A6";

const eyebrow = "font-body text-[10px] uppercase tracking-[0.24em] text-charcoal-muted";

function pct(value: number | null) {
  return value === null ? "–" : `${Math.round(value * 100)}%`;
}

function StatTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="border border-border-light bg-cream px-5 py-4">
      <p className="font-body text-sm text-charcoal-mid">{label}</p>
      <p className="mt-1 font-body text-3xl font-medium text-charcoal">{value}</p>
      <p className="mt-1 font-body text-xs text-charcoal-muted">{note}</p>
    </div>
  );
}

function BarList({ items, total }: { items: { label: string; count: number; muted?: boolean }[]; total: number }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="grid grid-cols-[minmax(0,10rem)_1fr] items-center gap-3 sm:grid-cols-[minmax(0,13rem)_1fr]">
          <span className="truncate font-body text-sm text-charcoal-mid" title={item.label}>
            {item.label}
          </span>
          <span className="flex min-w-0 items-center gap-2" title={`${item.label}: ${item.count} (${pct(item.count / Math.max(total, 1))})`}>
            <span
              className="block h-3 rounded-r-[4px]"
              style={{ width: `${(item.count / max) * 82}%`, minWidth: item.count > 0 ? 3 : 0, backgroundColor: item.muted ? MUTED_FILL : BAR_FILL }}
            />
            <span className="shrink-0 font-body text-xs tabular-nums text-charcoal">
              {item.count} <span className="text-charcoal-muted">· {pct(item.count / Math.max(total, 1))}</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function StackedBar({ segments, label }: { segments: { label: string; count: number; color: string }[]; label: string }) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  if (total === 0) return <span className="block h-3 bg-border-light" aria-label={`${label}: no answers yet`} />;
  return (
    <span className="flex h-3 w-full gap-[2px]" role="img" aria-label={`${label}: ${segments.map((s) => `${s.label} ${s.count}`).join(", ")}`}>
      {segments
        .filter((segment) => segment.count > 0)
        .map((segment) => (
          <span
            key={segment.label}
            className="block h-full first:rounded-l-[4px] last:rounded-r-[4px]"
            style={{ flexGrow: segment.count, flexBasis: 0, backgroundColor: segment.color }}
            title={`${segment.label}: ${segment.count} (${pct(segment.count / total)})`}
          />
        ))}
    </span>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 font-body text-xs text-charcoal-mid">
          <span className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-6">
      <h2 className="font-heading text-2xl text-charcoal">{title}</h2>
      {note && <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-charcoal-mid">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

const FLAG_TEXT = {
  "mostly-same": "Most people give the same answer",
  "often-missing": "Often not answered",
} as const;

export default function InsightsDashboard({
  summary,
  people,
  version,
  consentOnly,
  rowLimitReached,
  sourceLabel,
  scaleLabels,
  resultLabel,
  exportQuery = "",
  allowContactExport = true,
}: {
  summary: InsightsSummary;
  people: InsightRow[];
  version: string;
  consentOnly: boolean;
  rowLimitReached: boolean;
  sourceLabel: (slug: string) => string;
  scaleLabels: string[];
  resultLabel: (row: InsightRow) => string;
  exportQuery?: string;
  allowContactExport?: boolean;
}) {
  const shownPeople = (consentOnly ? people.filter((row) => row.followUpConsent) : people).slice(0, 200);
  const answerLegend = [
    ...scaleLabels.map((label, index) => ({ label, color: RAMP_FIVE[index] })),
    { label: NOT_APPLICABLE_LABEL, color: NOT_APPLICABLE_FILL },
    { label: SKIPPED_LABEL, color: SKIPPED_FILL },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={eyebrow}>The Mindset Test</p>
          <h1 className="mt-3 font-heading text-[2.5rem] leading-tight text-charcoal md:text-5xl">Results</h1>
          <p className="mt-2 font-body text-sm text-charcoal-mid">
            Answers to questionnaire version <span className="text-charcoal">{version}</span>, newest included.
            {rowLimitReached && " Showing the most recent 20,000 responses."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {allowContactExport && <a
            href={`/api/lens-check/admin/export?type=leads&${exportQuery}`}
            className="inline-flex items-center justify-center bg-green px-5 py-3 font-body text-sm font-medium text-cream transition-colors duration-300 hover:bg-green-hover"
          >
            Download people (Excel)
          </a>}
          <a
            href={`/api/lens-check/admin/export?type=answers&${exportQuery}`}
            className="inline-flex items-center justify-center border border-border px-5 py-3 font-body text-sm font-medium text-charcoal transition-colors duration-300 hover:border-charcoal"
          >
            Download answers (no contact details)
          </a>
        </div>
      </header>

      {summary.completed === 0 ? (
        <section className="border border-border bg-cream-deep px-6 py-10 text-center">
          <h2 className="font-heading text-2xl text-charcoal">No completed Mindset Tests yet</h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm leading-relaxed text-charcoal-mid">
            When someone finishes the questions, their result appears here: overall patterns, how each question is
            being answered, and everyone who unlocked their reading. Take the Mindset Test yourself to see your own
            response arrive.
          </p>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Completed" value={String(summary.completed)} note={`${summary.last7Days} in the last 7 days · ${summary.last30Days} in 30`} />
            <StatTile label="Readings saved / unlocked" value={String(summary.unlocked)} note={`${pct(summary.unlockRate)} of completions`} />
            <StatTile label="Happy to hear from Sam" value={String(summary.followUpPeople)} note="People who ticked the follow-up box" />
            <StatTile
              label="Found it useful"
              value={pct(summary.helpful.usefulShare)}
              note={summary.helpful.rated ? `Yes or somewhat, from ${summary.helpful.rated} ratings` : "No ratings yet"}
            />
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <Panel
              title="Results"
              note="A clear pattern needs strong answers on that pattern's key statements and a clear lead over every other pattern. Otherwise people see a blend of close patterns, or no single pattern."
            >
              <BarList
                total={summary.completed}
                items={summary.outcomes.map((outcome) => ({
                  label: outcome.label,
                  count: outcome.count,
                  muted: outcome.status === "unclear" || outcome.status === "insufficient_data",
                }))}
              />
              <p className="mt-4 font-body text-xs text-charcoal-muted">
                {summary.askedFollowups} {summary.askedFollowups === 1 ? "person was" : "people were"} asked follow-up
                statements to separate two close patterns.
              </p>
            </Panel>

            <Panel title="Patterns" note="How often each pattern was the clear result. Blends and secondary leanings are in the table.">
              <BarList
                total={summary.completed}
                items={summary.patterns.map((pattern) => ({ label: pattern.title, count: pattern.matched }))}
              />
              <details className="mt-5">
                <summary className="cursor-pointer font-body text-xs text-charcoal-mid underline underline-offset-2">Show as a table</summary>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full font-body text-xs tabular-nums text-charcoal-mid">
                    <thead>
                      <tr className="text-left text-charcoal-muted">
                        <th className="py-1 pr-3 font-normal">Pattern</th>
                        <th className="py-1 pr-3 font-normal">Clear result</th>
                        <th className="py-1 pr-3 font-normal">In a blend</th>
                        <th className="py-1 font-normal">Also some</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.patterns.map((pattern) => (
                        <tr key={pattern.id} className="border-t border-border-light">
                          <td className="py-1.5 pr-3 text-charcoal">{pattern.title}</td>
                          <td className="py-1.5 pr-3">{pattern.matched}</td>
                          <td className="py-1.5 pr-3">{pattern.between}</td>
                          <td className="py-1.5">{pattern.secondary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </Panel>
          </div>

          <Panel
            title="How each question is answered"
            note="Use this to improve the statements. If nearly everyone gives the same answer, or many people mark it not applicable or skip it, the statement isn't telling you much and may need rewording. Follow-ups are only shown to people with two close patterns."
          >
            <Legend items={answerLegend} />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] font-body text-sm">
                <thead>
                  <tr className="text-left text-xs text-charcoal-muted">
                    <th className="py-2 pr-4 font-normal">Question</th>
                    <th className="w-40 py-2 pr-4 font-normal">Answers</th>
                    <th className="py-2 pr-4 font-normal">Most common</th>
                    <th className="py-2 pr-4 font-normal">Not answered</th>
                    <th className="py-2 font-normal">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.questions.map((question) => (
                    <tr key={question.id} className="border-t border-border-light align-top">
                      <td className="py-3 pr-4">
                        <span className="block text-charcoal">{question.text}</span>
                        <span className="text-xs text-charcoal-muted">
                          {question.id}
                          {question.isFollowup ? ` · follow-up, shown to ${question.shown}` : ""}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <StackedBar
                          label={question.text}
                          segments={[
                            ...question.options.map((option, index) => ({ label: option.label, count: option.count, color: RAMP_FIVE[index] })),
                            { label: NOT_APPLICABLE_LABEL, count: question.notApplicable, color: NOT_APPLICABLE_FILL },
                            { label: SKIPPED_LABEL, count: question.skipped, color: SKIPPED_FILL },
                          ]}
                        />
                      </td>
                      <td className="py-3 pr-4 text-charcoal-mid">
                        {question.topLabel ? (
                          <>
                            {question.topLabel} <span className="tabular-nums text-charcoal-muted">{pct(question.topShare)}</span>
                          </>
                        ) : (
                          "–"
                        )}
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-charcoal-mid">{pct(question.shown ? question.missingShare : null)}</td>
                      <td className="py-3">
                        {question.flags.length ? (
                          <span className="flex flex-col gap-1">
                            {question.flags.map((flag) => (
                              <span key={flag} className="inline-flex w-fit items-center gap-1.5 border border-charcoal-muted px-2 py-0.5 text-xs text-charcoal">
                                <span aria-hidden="true">!</span>
                                {FLAG_TEXT[flag]}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="text-xs text-charcoal-muted">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="grid gap-10 lg:grid-cols-2">
            <Panel title="Where people started" note="The article someone was reading when they began, if any.">
              <BarList total={summary.completed} items={summary.sources} />
            </Panel>
            <Panel title="Was the reading useful?">
              {summary.helpful.rated ? (
                <BarList
                  total={summary.helpful.rated}
                  items={[
                    { label: HELPFUL_LABELS.yes, count: summary.helpful.yes },
                    { label: HELPFUL_LABELS.somewhat, count: summary.helpful.somewhat },
                    { label: HELPFUL_LABELS.no, count: summary.helpful.no },
                  ]}
                />
              ) : (
                <p className="font-body text-sm text-charcoal-mid">No one has rated their reading yet.</p>
              )}
            </Panel>
          </div>
        </>
      )}

      <Panel
        title="Legacy follow-up contacts"
        note="Contacts from the older email-unlock flow. Account sign-ins are not marketing permission and are not listed here. Only contact people marked “Yes” for their agreed follow-up."
      >
        <div className="mb-4 flex flex-wrap gap-2 font-body text-sm">
          <Link
            href={`/lens-check/admin?${exportQuery}`}
            className={`border px-3 py-1.5 ${consentOnly ? "border-border text-charcoal-mid" : "border-charcoal bg-charcoal text-cream"}`}
          >
            Everyone ({people.length})
          </Link>
          <Link
            href={`/lens-check/admin?${exportQuery}&consent=1`}
            className={`border px-3 py-1.5 ${consentOnly ? "border-charcoal bg-charcoal text-cream" : "border-border text-charcoal-mid"}`}
          >
            Happy to hear from Sam ({people.filter((row) => row.followUpConsent).length})
          </Link>
        </div>
        {shownPeople.length === 0 ? (
          <p className="font-body text-sm text-charcoal-mid">
            {consentOnly ? "No one has ticked the follow-up box yet." : "No one has unlocked a reading yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] font-body text-sm">
              <thead>
                <tr className="text-left text-xs text-charcoal-muted">
                  <th className="py-2 pr-4 font-normal">Unlocked</th>
                  <th className="py-2 pr-4 font-normal">Name</th>
                  <th className="py-2 pr-4 font-normal">Email</th>
                  <th className="py-2 pr-4 font-normal">Result</th>
                  <th className="py-2 pr-4 font-normal">Follow-up</th>
                  <th className="py-2 pr-4 font-normal">Useful?</th>
                  <th className="py-2 pr-4 font-normal">Came from</th>
                  <th className="py-2 font-normal">Reading</th>
                </tr>
              </thead>
              <tbody>
                {shownPeople.map((row) => (
                  <tr key={row.token} className="border-t border-border-light">
                    <td className="py-2.5 pr-4 tabular-nums text-charcoal-mid">{formatLondonDate(row.claimedAt)}</td>
                    <td className="py-2.5 pr-4 text-charcoal">{row.firstName ?? "–"}</td>
                    <td className="py-2.5 pr-4 text-charcoal-mid">{row.email}</td>
                    <td className="py-2.5 pr-4 text-charcoal-mid">
                      {resultLabel(row)}
                    </td>
                    <td className="py-2.5 pr-4">
                      {row.followUpConsent ? (
                        <span className="inline-flex items-center gap-1 text-green">
                          <span aria-hidden="true">✓</span> Yes
                        </span>
                      ) : (
                        <span className="text-charcoal-muted">No</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-charcoal-mid">{row.helpfulRating ? HELPFUL_LABELS[row.helpfulRating] : "–"}</td>
                    <td className="py-2.5 pr-4 text-charcoal-mid">{row.source?.from ? sourceLabel(row.source.from) : "Direct or other"}</td>
                    <td className="py-2.5">
                      <Link href={`/lens-check/result?t=${row.token}`} className="text-green underline underline-offset-2 hover:text-green-hover">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {people.length > shownPeople.length && !consentOnly && (
              <p className="mt-3 font-body text-xs text-charcoal-muted">Showing the newest 200. Download for the full list.</p>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

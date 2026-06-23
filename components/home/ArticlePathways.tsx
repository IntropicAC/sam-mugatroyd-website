import Link from "next/link";
import { journalEntries } from "@/lib/journal";
import { CALENDLY_URL } from "@/lib/site";

const featuredSlugs = [
  "how-to-stop-overthinking",
  "why-do-i-feel-lost-in-life",
  "how-do-i-stop-people-pleasing",
  "how-to-recover-from-burnout",
  "why-do-i-feel-like-a-fraud",
  "why-do-i-feel-exhausted-by-people",
];

const featuredArticles = featuredSlugs
  .map((slug) => journalEntries.find((entry) => entry.slug === slug))
  .filter((entry): entry is (typeof journalEntries)[number] => Boolean(entry));

export default function ArticlePathways() {
  return (
    <section
      className="bg-cream-deep px-5 pb-16 pt-8 md:px-8 md:pb-24 md:pt-10 lg:px-12"
      aria-label="Article pathways"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="font-body text-xs uppercase tracking-[0.18em] text-charcoal-muted">
              Start with what feels familiar
            </p>
            <h2 className="mt-4 max-w-2xl font-heading text-3xl leading-tight text-charcoal md:text-4xl">
              Read the question that already sounds like yours.
            </h2>
          </div>
          <div className="md:col-span-5 md:text-right">
            <p className="font-body text-sm leading-relaxed text-charcoal-mid md:ml-auto md:max-w-sm">
              These articles are the strongest route from search into Sam&apos;s work:
              clear questions, direct answers, and an easy next step when something
              lands.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group flex min-h-[15rem] flex-col border border-border bg-cream p-5 transition-colors duration-300 hover:border-charcoal-muted/50 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
            >
              <p className="font-body text-[10px] uppercase tracking-[0.22em] text-green">
                {article.category}
              </p>
              <h3 className="mt-4 font-heading text-2xl leading-tight text-charcoal transition-colors duration-300 group-hover:text-green">
                {article.title}
              </h3>
              <p className="mt-4 line-clamp-4 font-body text-sm leading-relaxed text-charcoal-mid">
                {article.teaser}
              </p>
              <span className="mt-auto pt-6 font-body text-sm font-medium text-charcoal transition-colors duration-300 group-hover:text-green">
                Read article <span aria-hidden="true">-&gt;</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/articles"
            className="inline-flex min-h-11 items-center justify-center border border-border px-6 py-3 font-body text-sm font-medium tracking-wide text-charcoal transition-colors duration-300 hover:border-charcoal hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
          >
            Browse all articles
          </Link>
          <Link
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center bg-green px-6 py-3 font-body text-sm font-medium tracking-wide text-cream transition-colors duration-300 hover:bg-green-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
          >
            Book a free 20-minute call
          </Link>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { articleEntries, CALENDLY_URL } from "@/lib/journal";
import JournalCard from "@/components/journal/JournalCard";
import {
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_SOCIAL_IMAGE_ALT,
  DEFAULT_SOCIAL_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_IMAGE_WIDTH,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Articles | Perception 47 - Sam Murgatroyd",
  description:
    "Articles by Sam Murgatroyd on overthinking, people pleasing, burnout, confidence and self-trust, written to help you understand what is underneath.",
  alternates: {
    canonical: "/articles",
  },
  openGraph: {
    title: "Articles | Perception 47 - Sam Murgatroyd",
    description:
      "Question-led articles on overthinking, people pleasing, burnout, confidence and the patterns underneath honest change.",
    type: "website",
    url: "/articles",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: DEFAULT_SOCIAL_IMAGE_WIDTH,
        height: DEFAULT_SOCIAL_IMAGE_HEIGHT,
        alt: DEFAULT_SOCIAL_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles | Perception 47 - Sam Murgatroyd",
    description:
      "Question-led articles on overthinking, people pleasing, burnout, confidence and the patterns underneath honest change.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

const categoryStats = Array.from(
  articleEntries.reduce((categories, entry) => {
    categories.set(entry.category, (categories.get(entry.category) ?? 0) + 1);
    return categories;
  }, new Map<string, number>())
);

export default function ArticlesPage() {
  const [featuredArticle, ...supportingArticles] = articleEntries;

  return (
    <>
      <section
        className="relative overflow-hidden bg-cream-deep pt-24 pb-14 md:pt-32 md:pb-20"
        aria-label="Articles"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(42,39,34,0.045) 0 1px, transparent 1px 100%), linear-gradient(180deg, rgba(42,39,34,0.035) 0 1px, transparent 1px 100%)",
            backgroundSize: "88px 88px",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 top-16 hidden text-[18rem] font-heading leading-none text-charcoal/[0.035] md:block"
          aria-hidden="true"
        >
          47
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
          <div className="grid gap-10 md:grid-cols-12 md:items-end md:gap-12 lg:gap-16">
            <div className="md:col-span-7">
              <p className="font-body text-[10px] text-charcoal-muted tracking-[0.2em] uppercase">
                Articles / Perception 47
              </p>
              <h1 className="mt-5 max-w-3xl font-heading text-[2.35rem] font-normal leading-[1.05] text-charcoal sm:text-5xl md:text-[4.2rem] lg:text-[5rem]">
                The questions that keep coming back.
              </h1>
              <p className="mt-6 max-w-xl font-body text-sm leading-relaxed text-charcoal-mid md:text-base">
                Sam writes about the patterns underneath overthinking, people pleasing,
                burnout, disconnection, and self-trust. Each article starts with a
                real question and follows it down to the pattern underneath.
              </p>

              <div className="mt-8 grid max-w-xl grid-cols-3 border-y border-border">
                <div className="py-4 pr-4">
                  <p className="font-heading text-3xl leading-none text-charcoal">
                    {articleEntries.length}
                  </p>
                  <p className="mt-1 font-body text-[10px] uppercase tracking-[0.18em] text-charcoal-muted">
                    Articles
                  </p>
                </div>
                <div className="border-x border-border px-4 py-4">
                  <p className="font-heading text-3xl leading-none text-charcoal">
                    {categoryStats.length}
                  </p>
                  <p className="mt-1 font-body text-[10px] uppercase tracking-[0.18em] text-charcoal-muted">
                    Themes
                  </p>
                </div>
                <div className="py-4 pl-4">
                  <p className="font-heading text-3xl leading-none text-charcoal">
                    1
                  </p>
                  <p className="mt-1 font-body text-[10px] uppercase tracking-[0.18em] text-charcoal-muted">
                    Next step
                  </p>
                </div>
              </div>
            </div>

            <aside className="relative md:col-span-5" aria-label="About the articles">
              <div className="relative ml-auto max-w-sm border border-border bg-cream p-5 md:p-6">
                <div className="absolute -left-4 -top-4 h-20 w-20 border-l border-t border-green/45" />
                <div className="grid grid-cols-[5.5rem_1fr] gap-5">
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                    <Image
                      src="/images/sam-headshot.jpg"
                      alt="Sam Murgatroyd"
                      fill
                      className="object-cover"
                      sizes="88px"
                      priority
                    />
                  </div>
                  <div className="self-center">
                    <p className="font-body text-[10px] uppercase tracking-[0.22em] text-green">
                      Written by
                    </p>
                    <p className="mt-2 font-heading text-2xl leading-tight text-charcoal">
                      Sam Murgatroyd
                    </p>
                    <p className="mt-2 font-body text-xs leading-relaxed text-charcoal-muted">
                      Life coach and author writing about honesty, identity, and the
                      patterns that keep people stuck.
                    </p>
                  </div>
                </div>
                <div className="mt-6 border-t border-border pt-5">
                  <p className="font-heading text-lg italic leading-snug text-charcoal">
                    Not advice to collect. A clearer lens to act from.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {featuredArticle && (
        <section className="bg-charcoal px-5 py-12 text-cream md:px-8 md:py-16 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-12 md:items-end md:gap-12">
            <div className="md:col-span-8">
              <p className="font-body text-[10px] uppercase tracking-[0.26em] text-cream/45">
                Start here
              </p>
              <h2 className="mt-4 max-w-3xl font-heading text-3xl leading-tight md:text-5xl">
                {featuredArticle.title}
              </h2>
              <p className="mt-5 max-w-2xl font-body text-sm leading-relaxed text-cream/65 md:text-base">
                {featuredArticle.teaser}
              </p>
            </div>
            <div className="md:col-span-4">
              <div className="border-t border-cream/15 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <p className="font-body text-xs uppercase tracking-[0.2em] text-green-hover">
                  The route in
                </p>
                <ol className="mt-4 space-y-3 font-body text-sm leading-relaxed text-cream/62">
                  <li>Notice the pattern.</li>
                  <li>Read the article that names it.</li>
                  <li>Book a conversation if it feels close.</li>
                </ol>
                <Link
                  href={`/articles/${featuredArticle.slug}`}
                  className="mt-6 inline-flex items-center gap-2 bg-green px-6 py-3 font-body text-sm font-medium tracking-wide text-cream transition-colors duration-300 hover:bg-green-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
                >
                  Read this article
                  <span aria-hidden="true">{"->"}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        id="article-list"
        className="px-5 py-12 md:px-8 md:py-20 lg:px-12"
        aria-label="Article list"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-6">
              <p className="font-body text-xs uppercase tracking-[0.18em] text-charcoal-muted">
                Browse the questions
              </p>
              <h2 className="mt-3 font-heading text-3xl leading-tight text-charcoal md:text-4xl">
                Find the article that sounds uncomfortably familiar.
              </h2>
            </div>
            <div className="md:col-span-6">
              <div className="flex flex-wrap gap-2 md:justify-end">
                {categoryStats.map(([category, count]) => (
                  <span
                    key={category}
                    className="border border-border bg-cream-deep px-3 py-2 font-body text-[10px] uppercase tracking-[0.18em] text-charcoal-muted"
                  >
                    {category} / {count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {supportingArticles.map((entry, i) => (
              <JournalCard
                key={entry.slug}
                entry={entry}
                delay={i * 0.05}
                index={i + 2}
              />
            ))}
          </div>

          <div className="mt-16 grid gap-6 border-t border-border pt-10 md:mt-20 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <p className="font-body text-[10px] uppercase tracking-[0.24em] text-green">
                When something lands
              </p>
              <p className="mt-3 max-w-xl font-heading text-2xl leading-tight text-charcoal md:text-3xl">
                These questions often lead to a conversation.
              </p>
            </div>
            <div className="md:col-span-5 md:text-right">
              <Link
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green px-7 py-3.5 font-body text-sm font-medium tracking-wide text-cream transition-colors duration-300 hover:bg-green-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
              >
                Book a free 20-minute call
                <span aria-hidden="true">{"->"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

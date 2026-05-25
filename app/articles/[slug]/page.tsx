import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import {
  articleEntries,
  CALENDLY_URL,
  getArticle,
  getArticleBook,
  getRelatedArticles,
} from "@/lib/journal";
import {
  AUTHOR_NAME,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_SOCIAL_IMAGE_ALT,
  DEFAULT_SOCIAL_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_IMAGE_WIDTH,
  LOGO_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

const PUBLISHED_DATE = "2026-05-18";
const MODIFIED_DATE = "2026-05-21";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return articleEntries.map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getArticle(slug);

  if (!entry) {
    return {
      title: "Article not found | Perception 47",
    };
  }

  return {
    title: `${entry.metaTitle} | Perception 47`,
    description: entry.metaDescription,
    alternates: {
      canonical: `/articles/${entry.slug}`,
    },
    authors: [{ name: AUTHOR_NAME }],
    openGraph: {
      title: entry.metaTitle,
      description: entry.metaDescription,
      type: "article",
      url: `/articles/${entry.slug}`,
      publishedTime: PUBLISHED_DATE,
      modifiedTime: MODIFIED_DATE,
      authors: [AUTHOR_NAME],
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
      title: entry.metaTitle,
      description: entry.metaDescription,
      images: [DEFAULT_SOCIAL_IMAGE],
    },
  };
}

function MidArticleCta() {
  return (
    <aside className="my-10 border-y border-border py-6" aria-label="Article call to action">
      <p className="font-body text-[10px] uppercase tracking-[0.24em] text-charcoal-muted mb-3">
        If this feels familiar
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-heading text-xl text-charcoal leading-snug max-w-md">
          You do not have to work it all out before speaking to someone.
        </p>
        <Link
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 self-start border border-green px-5 py-3 font-body text-sm font-medium text-green transition-colors duration-300 hover:bg-green hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
        >
          Book a free call
          <span aria-hidden="true">{"->"}</span>
        </Link>
      </div>
    </aside>
  );
}

function jsonLdFor(entry: NonNullable<ReturnType<typeof getArticle>>) {
  const articleUrl = `${SITE_URL}/articles/${entry.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#article`,
        mainEntityOfPage: articleUrl,
        headline: entry.title,
        description: entry.metaDescription,
        image: [DEFAULT_SOCIAL_IMAGE],
        datePublished: PUBLISHED_DATE,
        dateModified: MODIFIED_DATE,
        author: {
          "@type": "Person",
          name: AUTHOR_NAME,
          url: SITE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: LOGO_IMAGE,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleUrl}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Articles",
            item: `${SITE_URL}/articles`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: entry.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const entry = getArticle(slug);

  if (!entry) {
    notFound();
  }

  const related = getRelatedArticles(entry.slug, 3);
  const book = getArticleBook(entry);
  const jsonLd = jsonLdFor(entry);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <article className="px-5 pb-16 pt-24 md:px-8 md:pb-24 md:pt-32 lg:px-12">
        <header className="mx-auto max-w-5xl border-b border-border pb-10 md:pb-14">
          <Link
            href="/articles"
            className="mb-8 inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-charcoal-muted transition-colors duration-300 hover:text-charcoal"
          >
            <span aria-hidden="true">{"<-"}</span>
            Articles
          </Link>

          <div className="grid gap-8 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-8">
              <p className="mb-4 font-body text-[10px] uppercase tracking-[0.24em] text-green">
                {entry.category}
              </p>
              <h1 className="font-heading text-[2.15rem] leading-[1.08] text-charcoal sm:text-5xl md:text-[3.5rem]">
                {entry.title}
              </h1>
              <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-charcoal-mid md:text-lg">
                {entry.teaser}
              </p>
            </div>

            <aside className="md:col-span-4 md:border-l md:border-border md:pl-8">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface">
                  <Image
                    src="/images/sam-headshot.jpg"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                    priority
                  />
                </div>
                <div>
                  <p className="font-heading text-lg leading-tight text-charcoal">
                    {AUTHOR_NAME}
                  </p>
                  <p className="font-body text-xs text-charcoal-muted">
                    Life Coach and Author
                  </p>
                </div>
              </div>
              <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-5 md:grid-cols-1">
                <div>
                  <dt className="font-body text-[10px] uppercase tracking-[0.2em] text-charcoal-muted">
                    Published
                  </dt>
                  <dd className="mt-1 font-body text-sm text-charcoal-mid">
                    18 May 2026
                  </dd>
                </div>
                <div>
                  <dt className="font-body text-[10px] uppercase tracking-[0.2em] text-charcoal-muted">
                    Focus
                  </dt>
                  <dd className="mt-1 font-body text-sm text-charcoal-mid">
                    {entry.category}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </header>

        <div className="mx-auto grid max-w-5xl gap-12 pt-10 md:grid-cols-12 md:pt-14">
          <div className="md:col-span-8">
            <div className="space-y-6 font-body text-[1rem] leading-[1.85] text-charcoal-mid md:text-[1.05rem]">
              {entry.paragraphs.map((paragraph, index) => (
                <Fragment key={`${entry.slug}-${index}`}>
                  <p>{paragraph}</p>
                  {index + 1 === entry.midCtaAfter && <MidArticleCta />}
                </Fragment>
              ))}
            </div>

            <section className="mt-14 bg-charcoal px-6 py-8 text-cream md:px-8 md:py-10">
              <p className="mb-4 font-body text-[10px] uppercase tracking-[0.24em] text-cream/45">
                Coaching first
              </p>
              <h2 className="font-heading text-2xl leading-tight md:text-3xl">
                If the question is already here, the work has probably started.
              </h2>
              <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-cream/65 md:text-base">
                A free twenty minute conversation is the simplest next step. No
                pressure, no performance - just a clear conversation about where you
                are and whether this work fits.
              </p>
              <Link
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-3 bg-green px-6 py-3 font-body text-sm font-medium tracking-wide text-cream transition-colors duration-300 hover:bg-green-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
              >
                Book your free 20-minute call
                <span aria-hidden="true">{"->"}</span>
              </Link>
            </section>
          </div>

          <aside className="md:col-span-4">
            <div className="sticky top-28 space-y-8">
              {book && (
                <section className="border border-border bg-cream-deep p-5" aria-label="Related book">
                  <p className="mb-4 font-body text-[10px] uppercase tracking-[0.24em] text-charcoal-muted">
                    Further reading
                  </p>
                  <div className="flex gap-4">
                    <div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden bg-surface">
                      <Image
                        src={book.coverImage}
                        alt={book.coverAlt}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl leading-tight text-charcoal">
                        {book.title}
                      </h2>
                      <p className="mt-2 font-body text-xs leading-relaxed text-charcoal-mid">
                        {book.shortDescription}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={book.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 font-body text-sm text-green transition-colors duration-300 hover:text-green-hover"
                  >
                    View on Amazon
                    <span aria-hidden="true">{"->"}</span>
                  </Link>
                </section>
              )}

              <section className="border-t border-border pt-6" aria-label="Related articles">
                <p className="mb-4 font-body text-[10px] uppercase tracking-[0.24em] text-charcoal-muted">
                  Related articles
                </p>
                <div className="space-y-4">
                  {related.map((relatedEntry) => (
                    <Link
                      key={relatedEntry.slug}
                      href={`/articles/${relatedEntry.slug}`}
                      className="group block border-b border-border pb-4"
                    >
                      <p className="font-body text-[10px] uppercase tracking-[0.18em] text-charcoal-muted">
                        {relatedEntry.category}
                      </p>
                      <h2 className="mt-2 font-heading text-lg leading-snug text-charcoal transition-colors duration-300 group-hover:text-green">
                        {relatedEntry.title}
                      </h2>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

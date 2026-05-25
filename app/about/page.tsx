import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AUTHOR_NAME,
  CALENDLY_URL,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_SOCIAL_IMAGE_ALT,
  DEFAULT_SOCIAL_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_IMAGE_WIDTH,
  PERSON_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "About Sam Murgatroyd | Perception 47 Coaching",
  description:
    "Meet Sam Murgatroyd, life coach and author behind Perception 47 Coaching, and learn how lived experience shapes his work with identity and change.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Sam Murgatroyd | Perception 47 Coaching",
    description:
      "The story behind Sam's coaching, books and work around identity, honesty, belonging and self-trust.",
    type: "profile",
    url: "/about",
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
    title: "About Sam Murgatroyd | Perception 47 Coaching",
    description:
      "The story behind Sam's coaching, books and work around identity, honesty, belonging and self-trust.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/about#profile`,
  name: `About ${AUTHOR_NAME}`,
  url: `${SITE_URL}/about`,
  mainEntity: {
    "@type": "Person",
    "@id": `${SITE_URL}/#sam-murgatroyd`,
    name: AUTHOR_NAME,
    url: SITE_URL,
    image: PERSON_IMAGE,
    jobTitle: "Life Coach and Author",
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  },
};

const experience = [
  "Psychiatric hospitals",
  "Probation services",
  "Children's care homes",
  "SEN schools",
  "Drug and alcohol rehabilitation",
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="bg-cream-deep px-5 pb-14 pt-28 md:px-8 md:pb-20 md:pt-36 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-charcoal-muted">
              About Sam
            </p>
            <h1 className="mt-5 max-w-3xl font-heading text-[2.5rem] font-normal leading-tight text-charcoal md:text-6xl">
              The work started with a question Sam could not put down.
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="max-w-xl font-body text-base leading-relaxed text-charcoal-mid">
              Sam Murgatroyd is a life coach and author. His work is rooted in
              identity, honesty, belonging, and the gap between who people have
              learned to be and who they actually are.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-12">
          <aside className="md:col-span-4">
            <div className="sticky top-28">
              <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                <Image
                  src="/images/sam-headshot.jpg"
                  alt="Sam Murgatroyd - Life Coach and Author"
                  fill
                  priority
                  className="object-cover object-top grayscale-[15%]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="mt-5 border-t border-border pt-5">
                <p className="font-heading text-2xl text-charcoal">
                  {AUTHOR_NAME}
                </p>
                <p className="mt-1 font-body text-sm text-charcoal-muted">
                  Life Coach and Author
                </p>
              </div>
            </div>
          </aside>

          <div className="md:col-span-8">
            <div className="max-w-3xl space-y-6 font-body text-base leading-relaxed text-charcoal-mid">
              <p>
                Sam grew up feeling like he never quite fit in. He saw the world
                differently to the people around him and spent years wondering if
                that was something to fix.
              </p>
              <p>
                He started writing at twelve years old, not because he had a
                polished plan to become a writer, but because he could not keep
                what he was thinking bottled up any longer. Writing became the
                place where the world made more sense.
              </p>
              <p>
                That curiosity eventually led him into work alongside people at
                some of the hardest points in their lives. Across those
                environments, Sam kept seeing the same pattern: people who had
                spent so long becoming who they thought they had to be that they
                had lost sight of who they actually were.
              </p>
              <p>
                The books came from that place. The coaching came from that
                place. All of it is rooted in something lived, not something
                lifted from a course or a textbook.
              </p>
            </div>

            <div className="mt-12 border-y border-border py-8">
              <h2 className="font-heading text-3xl leading-tight text-charcoal">
                Experience behind the work
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {experience.map((item) => (
                  <li
                    key={item}
                    className="border border-border bg-cream-deep px-4 py-3 font-body text-sm text-charcoal-mid"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/coaching"
                className="inline-flex items-center justify-center bg-green px-7 py-3.5 font-body text-sm font-medium text-cream transition-colors duration-300 hover:bg-green-hover"
              >
                Explore coaching
              </Link>
              <Link
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-border px-7 py-3.5 font-body text-sm font-medium text-charcoal-mid transition-colors duration-300 hover:border-charcoal hover:text-charcoal"
              >
                Book a free call
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

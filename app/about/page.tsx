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
    "Meet Sam Murgatroyd, mindset coach and author behind Perception 47 Coaching, and learn how lived experience shapes his work with identity and change.",
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
  "@graph": [
    {
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
        jobTitle: "Mindset Coach and Author",
        worksFor: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
    },
  ],
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
              Sam Murgatroyd is a mindset coach and author. His work is rooted in
              identity, honesty, belonging, and the gap between who people have
              learned to be and who they actually are.
            </p>
          </div>
        </div>
      </section>


      <section className="px-5 py-14 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-12">
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="sticky top-28">
              <div className="relative mx-auto aspect-[4/5] max-w-[220px] overflow-hidden bg-surface md:mx-0 md:max-w-[260px]">
                <Image
                  src="/images/sam-headshot.jpg"
                  alt="Sam Murgatroyd - Mindset Coach and Author"
                  fill
                  className="object-cover object-top grayscale-[15%]"
                  sizes="(max-width: 768px) 220px, 260px"
                />
              </div>
              <div className="mt-5 max-w-[260px] mx-auto md:mx-0 border-t border-border pt-5">
                <p className="font-heading text-xl text-charcoal">
                  {AUTHOR_NAME}
                </p>
                <p className="mt-1 font-body text-sm text-charcoal-muted">
                  Mindset Coach and Author
                </p>
                <p className="mt-1.5 font-body text-xs text-green">
                  Amazon Bestselling Author
                </p>
              </div>
            </div>
          </aside>

          <div className="md:col-span-8 lg:col-span-9">
            <div className="max-w-3xl space-y-6 font-body text-base leading-relaxed text-charcoal-mid">
              <p>
                Sam grew up feeling like he never quite fit in. He saw the world
                differently to the people around him and spent years wondering
                if that was something to fix. He was what he describes as a
                &ldquo;why&rdquo; kid &mdash; someone who could never simply
                accept the way things were because that was how they had always
                been. That feeling of being slightly outside of everything, of
                observing the world rather than just living in it, was
                uncomfortable for a long time.
              </p>
              <p>
                He started writing at twelve years old, not because he had
                ambitions to be a writer but because he could not keep what he
                was thinking bottled up any longer. Writing was the only place
                it made sense.
              </p>
              <p>
                That curiosity eventually led him into work that most people
                would find difficult. Psychiatric hospitals, probation
                services, children&rsquo;s care homes, SEN schools, drug and
                alcohol rehabilitation. Years spent working alongside people
                across almost all of those environments at their lowest points
                and darkest times. What he saw across the board was the same
                thing &mdash; people who had spent so long becoming who they
                thought they had to be that they had completely lost sight of
                who they actually were.
              </p>
              <p>
                At some point Sam recognised that story in himself too. The
                performing, the adapting, the slow drift away from his own
                instincts in favour of what seemed more acceptable. That drift
                took a real toll. Losing touch with who he actually was left
                him feeling low, lost and disconnected from everything that
                had once felt natural and his own. It was one of the hardest
                periods of his life.
              </p>
              <p>
                But it was also the most important. Because understanding why
                it had happened, really understanding it at a level that went
                beyond surface realisation, changed everything. That shift in
                perspective was so fundamental and so permanent that it could
                not be unfelt. And the moment it landed, two things became
                clear. He needed to keep writing. And he needed to help other
                people find the same thing.
              </p>
            </div>

            <div className="mt-10 border-t border-border pt-8">
              <p className="font-heading italic text-lg leading-snug text-charcoal md:text-xl">
                The books came from that place. The coaching came from that
                place. All of it is rooted in something real, something lived,
                not something learned from a course or lifted from a textbook.
                That is why it works the way it does.
              </p>
            </div>

            <div className="mt-12 border-y border-border py-8">
              <h2 className="font-heading text-3xl leading-tight text-charcoal">
                Experience behind the work
              </h2>
              <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-charcoal-mid">
                Years of frontline work shaped how Sam sees people and
                problems. The thread running through it: change is rarely
                about adding more &mdash; it is about helping someone see
                clearly.
              </p>
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

            <div className="mt-12 border-b border-border pb-8">
              <h2 className="font-heading text-3xl leading-tight text-charcoal">
                How Sam works
              </h2>
              <div className="mt-5 space-y-5 font-body text-base leading-relaxed text-charcoal-mid">
                <p>
                  Sam does not deep-dive issue by issue the way a therapist
                  might. He takes a wider view. Instead of unpicking each
                  problem in isolation, he works at the level of perception
                  &mdash; the lens you are looking through &mdash; because
                  almost everything else downstream of that is a symptom.
                </p>
                <p>
                  The work tends to suit people who feel quietly stuck despite
                  a life that looks right on paper. The numbness, the burnout,
                  the sense that something does not sit right &mdash; those
                  are the signals that the lens is no longer your own.
                </p>
                <p>
                  Coaching is one-to-one, honest, and direct. Sessions move at
                  the pace of the person in front of him. Nothing scripted,
                  nothing recycled.
                </p>
              </div>
            </div>

            <div className="mt-12 border-b border-border pb-8">
              <h2 className="font-heading text-3xl leading-tight text-charcoal">
                Beyond the coaching
              </h2>
              <div className="mt-5 space-y-5 font-body text-base leading-relaxed text-charcoal-mid">
                <p>
                  Sam is the author of three books &mdash; <em>Alienated</em>,{" "}
                  <em>Robin&rsquo;s Bench</em> and <em>The Policy</em>{" "}
                  &mdash; all Amazon bestsellers. The fiction sits next to the
                  coaching for a reason: the same questions about identity,
                  belonging and self-trust run through both.
                </p>
                <p>
                  He also writes regularly &mdash; long-form essays,
                  reflections and breakdowns of the patterns he sees in his
                  work &mdash; published in the journal on this site and on
                  Substack.
                </p>
              </div>
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

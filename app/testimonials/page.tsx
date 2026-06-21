import type { Metadata } from "next";
import Link from "next/link";
import { testimonials } from "@/lib/testimonials";
import {
  CALENDLY_URL,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_SOCIAL_IMAGE_ALT,
  DEFAULT_SOCIAL_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_IMAGE_WIDTH,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Client Testimonials | Sam Murgatroyd Coaching",
  description:
    "Read coaching testimonials from people who worked with Sam Murgatroyd and Perception 47 Coaching to build clarity, confidence and self-trust.",
  alternates: {
    canonical: "/testimonials",
  },
  openGraph: {
    title: "Testimonials | Perception 47 Coaching",
    description:
      "Coaching testimonials from people who worked with Sam Murgatroyd to build clarity, confidence and self-trust.",
    type: "website",
    url: "/testimonials",
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
    title: "Testimonials | Perception 47 Coaching",
    description:
      "Coaching testimonials from people who worked with Sam Murgatroyd to build clarity, confidence and self-trust.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

const testimonialsJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/testimonials#webpage`,
  name: "Perception 47 Coaching testimonials",
  url: `${SITE_URL}/testimonials`,
  description:
    "Testimonials from people who have worked with Sam Murgatroyd and Perception 47 Coaching.",
};

export default function TestimonialsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(testimonialsJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="bg-cream-deep px-5 pb-14 pt-28 md:px-8 md:pb-20 md:pt-36 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-charcoal-muted">
            Testimonials
          </p>
          <h1 className="mt-5 max-w-4xl font-heading text-[2.5rem] font-normal leading-tight text-charcoal md:text-6xl">
            The difference a shift in perspective can make.
          </h1>
          <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-charcoal-mid">
            A calm space to understand yourself more clearly, make braver
            decisions, and move forward with more trust in your own judgement.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="border border-border bg-cream-deep px-6 py-8"
            >
              <blockquote className="flex h-full flex-col">
                <p className="font-heading text-xl italic leading-relaxed text-charcoal">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <footer className="mt-auto border-t border-border pt-6">
                  <p className="font-body text-sm font-medium tracking-wide text-charcoal">
                    {testimonial.name}
                  </p>
                  <p className="mt-1 font-body text-xs text-charcoal-muted">
                    {testimonial.context}
                  </p>
                </footer>
              </blockquote>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-6xl border-t border-border pt-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <p className="max-w-xl font-heading text-2xl leading-tight text-charcoal">
              If this sounds like the kind of work you need, start with a
              conversation.
            </p>
            <Link
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-green px-7 py-3.5 font-body text-sm font-medium text-cream transition-colors duration-300 hover:bg-green-hover"
            >
              Book a free 20-minute call
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

'use client';

import BookCard from "./BookCard";
import FadeInView from "@/components/ui/FadeInView";
import CTAButton from "@/components/ui/CTAButton";
import { OnceMotion } from "@/components/ui/OnceMotion";
import { BOOKS } from "@/lib/books";

const books = [
  {
    title: "The Policy",
    description:
      "Most people are performing a version of themselves without realising it. This book follows one man's moment of reckoning and the conversation that changes the way he sees everything.",
    coverImage: "/images/the-policy-new-cover.jpg",
    href: BOOKS.thePolicy.amazonUrl,
  },
  {
    title: "Robin's Bench",
    description:
      "For anyone who has ever felt like they do not quite belong anywhere. This book explores what it means to belong not to other people but to yourself.",
    coverImage: "/images/robins-bench-new-cover.jpg",
    href: BOOKS.robinsBench.amazonUrl,
  },
  {
    title: "Alienated",
    description:
      "For the people who see the world differently and have spent years wondering if that is a problem. It is not.",
    coverImage: "/images/alienated-new-cover.png",
    href: BOOKS.alienated.amazonUrl,
  },
];

export default function BooksSection() {
  return (
    <section
      className="py-12 md:py-16 px-5 md:px-8 lg:px-12 bg-cream-deep"
      aria-label="Books"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 md:mb-10">
          <div>
            <FadeInView>
              <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-4">
                The work behind the work
              </p>
            </FadeInView>
            <FadeInView delay={0.1}>
              <h2 className="font-heading text-2xl md:text-3xl text-charcoal max-w-sm">
                Books that sit behind the work
              </h2>
            </FadeInView>
          </div>
          <FadeInView delay={0.2} className="md:text-right">
            <p className="font-body text-sm text-charcoal-mid max-w-sm leading-relaxed">
              Sam is the published author of three books exploring identity, belonging,
              honesty, performance, and what it means to live truthfully.
            </p>
          </FadeInView>
        </div>

        {/* Book grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8 mb-8">
          {books.map((book, i) => (
            <OnceMotion.div
              key={book.title}
              seenId={`home-book-${book.title}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <BookCard {...book} />
            </OnceMotion.div>
          ))}
        </div>

        {/* Signed copies note + CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pt-6 border-t border-border">
          <FadeInView>
            <p className="font-body text-xs text-charcoal-muted italic">
              Signed copies are included in selected coaching packages.
            </p>
          </FadeInView>
          <FadeInView delay={0.1}>
            <CTAButton href="/books" variant="ghost">
              Explore the books
            </CTAButton>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}

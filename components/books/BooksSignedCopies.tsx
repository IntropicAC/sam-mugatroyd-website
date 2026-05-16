import Image from "next/image";
import Link from "next/link";
import FadeInView from "@/components/ui/FadeInView";

const signedBooks = [
  {
    title: "The Policy",
    image: "/images/the-policy-new-cover.jpg",
  },
  {
    title: "Robin's Bench",
    image: "/images/robins-bench-new-cover.jpg",
  },
  {
    title: "Alienated",
    image: "/images/alienated-new-cover.png",
  },
];

export default function BooksSignedCopies() {
  return (
    <section
      className="relative overflow-hidden py-20 md:py-28 px-5 md:px-8 lg:px-12 bg-cream-deep border-t border-b border-border"
      aria-label="Signed copies and coaching connection"
    >
      <div
        className="pointer-events-none absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/4 rounded-full border border-green/20"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr] lg:items-center">
          <FadeInView>
            <div className="relative mx-auto w-full max-w-[430px] lg:mx-0">
              <div className="grid grid-cols-3 gap-3">
                {signedBooks.map((book, index) => (
                  <div
                    key={book.title}
                    className={`relative overflow-hidden border border-charcoal/10 bg-cream shadow-[7px_13px_28px_rgba(42,39,34,0.14)] before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-[8px] before:bg-[linear-gradient(to_right,rgba(26,24,20,0.34),rgba(255,255,255,0.13),transparent)] after:absolute after:inset-y-3 after:right-0 after:z-10 after:w-[4px] after:bg-cream/35 ${
                      index === 1 ? "-translate-y-3" : ""
                    }`}
                  >
                    <div className="relative aspect-[2/3]">
                      <Image
                        src={book.image}
                        alt={`${book.title} book cover`}
                        fill
                        className="object-cover"
                        sizes="158px"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="mt-4 h-3 border-y border-charcoal/10 bg-charcoal/[0.045]"
                aria-hidden="true"
              />
              <div className="mt-5 border border-border bg-cream/70 px-4 py-3">
                <p className="font-body text-[10px] text-charcoal-muted tracking-[0.18em] uppercase">
                  Signed copy bundle
                </p>
              </div>
            </div>
          </FadeInView>

          <div className="max-w-xl">
            <FadeInView>
              <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-6">
                Coaching Connection
              </p>
            </FadeInView>

            <FadeInView delay={0.1}>
              <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-6 leading-tight">
                Signed copies are included in selected coaching packages
              </h2>
            </FadeInView>

            <FadeInView delay={0.18}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed mb-8">
                The books and the coaching are connected. Someone may arrive
                through a book and end up booking a call. Someone may begin
                coaching and leave with signed copies that deepen the work between
                sessions.
              </p>
            </FadeInView>

            <FadeInView delay={0.26}>
              <div className="space-y-3 mb-10 pl-5 border-l-2 border-green/30">
                <p className="font-body text-sm text-charcoal-mid">
                  Block booking includes three signed copies of Sam&apos;s books.
                </p>
                <p className="font-body text-sm text-charcoal-mid">
                  Pay as you go includes one signed book gifted after the third session.
                </p>
              </div>
            </FadeInView>

            <FadeInView delay={0.34}>
              <Link
                href="/coaching"
                className="inline-flex items-center gap-3 bg-green text-cream px-7 py-3.5 font-body text-sm font-medium tracking-wide hover:bg-green-hover transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
              >
                View coaching packages
                <span
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  {"\u2192"}
                </span>
              </Link>
            </FadeInView>
          </div>
        </div>
      </div>
    </section>
  );
}

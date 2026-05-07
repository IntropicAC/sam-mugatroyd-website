import Link from "next/link";
import FadeInView from "@/components/ui/FadeInView";

export default function BooksSignedCopies() {
  return (
    <section
      className="py-20 md:py-28 px-5 md:px-8 lg:px-12 bg-cream-deep border-t border-b border-border"
      aria-label="Signed copies and coaching connection"
    >
      <div className="max-w-7xl mx-auto">
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
                →
              </span>
            </Link>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}

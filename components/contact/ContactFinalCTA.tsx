import Link from "next/link";
import FadeInView from "@/components/ui/FadeInView";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

export default function ContactFinalCTA() {
  return (
    <section
      className="py-24 md:py-36 px-5 md:px-8 lg:px-12 bg-cream-deep border-t border-border"
      aria-label="Book a discovery call"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-xl">

          <FadeInView blur>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal leading-tight mb-5">
              No pressure. No pitch. Just a conversation.
            </h2>
          </FadeInView>

          <FadeInView delay={0.2}>
            <p className="font-body text-base text-charcoal-mid mb-10 leading-relaxed">
              The discovery call is twenty minutes to talk honestly about where
              you are and whether this work feels right.
            </p>
          </FadeInView>

          <FadeInView delay={0.35}>
            <Link
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green text-cream px-8 py-4 md:px-10 md:py-5 font-body text-sm font-medium tracking-wide hover:bg-green-hover transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
            >
              Book your free 20-minute call
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

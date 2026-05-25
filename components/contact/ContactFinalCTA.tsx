import Link from "next/link";
import FadeInView from "@/components/ui/FadeInView";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

export default function ContactFinalCTA() {
  return (
    <section
      className="relative py-24 md:py-36 px-5 md:px-8 lg:px-12 bg-charcoal overflow-hidden text-center"
      aria-label="Book a discovery call"
    >
      {/* Lens rings — subtle background texture */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 600 600" className="w-full h-full max-w-2xl" fill="none">
          <circle cx="300" cy="300" r="280" stroke="#F5F0EA" strokeWidth="1" />
          <circle cx="300" cy="300" r="220" stroke="#F5F0EA" strokeWidth="0.6" />
          <circle cx="300" cy="300" r="160" stroke="#F5F0EA" strokeWidth="0.6" />
          <circle cx="300" cy="300" r="100" stroke="#F5F0EA" strokeWidth="0.6" />
          <circle cx="300" cy="300" r="50" stroke="#F5F0EA" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <FadeInView blur>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-cream leading-tight mb-5">
            No pressure. No pitch.
            <br />
            <em className="not-italic text-green-hover">Just a conversation.</em>
          </h2>
        </FadeInView>

        <FadeInView delay={0.2}>
          <p className="font-body text-sm md:text-base text-cream/55 mb-10 leading-relaxed max-w-md mx-auto">
            The discovery call is twenty minutes to talk honestly about where
            you are and whether this work feels right.
          </p>
        </FadeInView>

        <FadeInView delay={0.35}>
          <Link
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-cream text-charcoal px-8 py-4 md:px-10 md:py-5 font-body text-sm font-medium tracking-wide hover:bg-cream-deep transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream group"
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
    </section>
  );
}

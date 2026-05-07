import FadeInView from "@/components/ui/FadeInView";

export default function BooksIntro() {
  return (
    <section
      className="py-16 md:py-24 px-5 md:px-8 lg:px-12"
      aria-label="About the books"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <FadeInView>
            <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-6">
              The Work
            </p>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl text-charcoal mb-7 leading-tight">
              Books that shift the way you see
            </h2>
          </FadeInView>

          <FadeInView delay={0.18}>
            <p className="font-body text-base text-charcoal-mid leading-relaxed mb-5">
              Each book explores a different part of the same territory: the
              cost of performance, the ache of not belonging, and the quiet
              freedom that comes from seeing yourself clearly.
            </p>
          </FadeInView>

          <FadeInView delay={0.26}>
            <p className="font-body text-base text-charcoal-mid leading-relaxed">
              They are not traditional self-help books. There are no steps,
              systems, or slogans. They are written to provoke thought, pull you
              from what you think you know, and offer a way of looking at things
              that once seen, stays seen.
            </p>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}

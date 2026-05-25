import FadeInView from "@/components/ui/FadeInView";

const links = [
  {
    label: "Substack",
    display: "Sam's writing",
    href: "https://substack.com/@sammurgatroyd",
  },
  {
    label: "Facebook",
    display: "Perception 47 Coaching",
    href: "https://www.facebook.com/Perception47Coaching",
  },
];

export default function ContactFindSam() {
  return (
    <section
      className="py-12 md:py-16 px-5 md:px-8 lg:px-12 border-t border-border"
      aria-label="Find Sam elsewhere"
    >
      <div className="max-w-7xl mx-auto">

        <FadeInView>
          <h2 className="font-heading text-xl md:text-2xl text-charcoal mb-8">
            Find Sam elsewhere
          </h2>
        </FadeInView>

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 md:gap-16">
          {links.map((link, i) => (
            <FadeInView key={link.href} delay={i * 0.07}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col"
              >
                <span className="font-body text-[10px] text-charcoal-muted tracking-[0.18em] uppercase mb-1.5">
                  {link.label}
                </span>
                <span className="font-body text-sm text-charcoal-mid group-hover:text-charcoal underline underline-offset-4 decoration-border group-hover:decoration-charcoal-mid transition-colors duration-300">
                  {link.display}
                </span>
              </a>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}

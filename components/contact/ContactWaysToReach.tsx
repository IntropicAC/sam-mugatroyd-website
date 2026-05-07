'use client';

import Link from "next/link";
import FadeInView from "@/components/ui/FadeInView";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

const contactMethods = [
  {
    id: "call",
    label: "Discovery call",
    description: "Free 20-minute discovery call",
    linkText: "Book a call",
    href: CALENDLY_URL,
    external: true,
    primary: true,
  },
  {
    id: "email",
    label: "Email",
    description: "samuel.a.murg@gmail.com",
    linkText: "Email Sam",
    href: "mailto:samuel.a.murg@gmail.com",
    external: false,
    primary: false,
  },
  {
    id: "phone",
    label: "Phone",
    description: "07804 743 725",
    linkText: "Call Sam",
    href: "tel:07804743725",
    external: false,
    primary: false,
  },
  {
    id: "substack",
    label: "Substack",
    description: "Sam's writing on Substack",
    linkText: "Read on Substack",
    href: "https://substack.com/@sammurgatroyd",
    external: true,
    primary: false,
  },
  {
    id: "facebook",
    label: "Facebook",
    description: "Perception 47 Coaching on Facebook",
    linkText: "Visit Facebook",
    href: "https://www.facebook.com/Perception47Coaching",
    external: true,
    primary: false,
  },
];

export default function ContactWaysToReach() {
  return (
    <section
      className="py-16 md:py-24 px-5 md:px-8 lg:px-12"
      aria-label="Ways to reach Sam"
    >
      <div className="max-w-7xl mx-auto">

        <FadeInView>
          <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-10 md:mb-14">
            Ways to reach Sam
          </h2>
        </FadeInView>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactMethods.map((method, i) => {
            const linkProps = method.external
              ? { target: "_blank" as const, rel: "noopener noreferrer" }
              : {};

            return (
              <FadeInView key={method.id} delay={i * 0.08}>
                <div
                  className={`group flex flex-col justify-between p-6 border h-full transition-colors duration-300 ${
                    method.primary
                      ? "border-green/40 bg-green/[0.04] hover:bg-green/[0.07]"
                      : "border-border bg-cream hover:border-charcoal-muted/40 hover:bg-cream-deep"
                  }`}
                >
                  <div className="mb-6">
                    <p
                      className={`font-body text-[10px] tracking-[0.2em] uppercase mb-2 ${
                        method.primary ? "text-green" : "text-charcoal-muted"
                      }`}
                    >
                      {method.label}
                    </p>
                    <p className="font-heading text-lg text-charcoal leading-snug">
                      {method.description}
                    </p>
                  </div>

                  <Link
                    href={method.href}
                    className={`inline-flex items-center gap-2 font-body text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green ${
                      method.primary
                        ? "text-green hover:text-green-hover"
                        : "text-charcoal-mid hover:text-charcoal"
                    }`}
                    {...linkProps}
                  >
                    {method.linkText}
                    <span
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </FadeInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}

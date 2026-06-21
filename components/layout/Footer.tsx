import Link from "next/link";
import Image from "next/image";
import CurrentYear from "@/components/layout/CurrentYear";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Coaching", href: "/coaching" },
  { label: "Articles", href: "/articles" },
  { label: "Books", href: "/books" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
];

function SubstackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-cream-deep border-t border-border">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Brand block */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 relative flex-shrink-0">
                <Image
                  src="/images/perception-47-logo.png"
                  alt="Perception 47 logo"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
              <span className="font-body text-sm font-medium text-charcoal tracking-wide">
                Perception 47 Coaching
              </span>
            </div>

            <p className="font-heading text-sm italic text-charcoal-mid mb-1">
              Sam Murgatroyd
            </p>
            <p className="font-body text-xs text-charcoal-muted mb-6">
              Mindset Coach and Author
            </p>

            <div className="space-y-1.5">
              <a
                href="mailto:samuel.a.murg@gmail.com"
                className="flex min-h-6 items-center font-body text-xs text-charcoal-mid hover:text-green transition-colors duration-300"
              >
                samuel.a.murg@gmail.com
              </a>
              <a
                href="tel:07804743725"
                className="flex min-h-6 items-center font-body text-xs text-charcoal-mid hover:text-green transition-colors duration-300"
              >
                07804 743 725
              </a>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://substack.com/@sammurgatroyd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-charcoal-muted hover:text-green transition-colors duration-300"
                aria-label="Sam Murgatroyd on Substack"
              >
                <SubstackIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/Perception47Coaching"
                target="_blank"
                rel="noopener noreferrer"
                className="text-charcoal-muted hover:text-green transition-colors duration-300"
                aria-label="Perception 47 Coaching on Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation — two columns on mobile */}
          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-xs text-charcoal-mid hover:text-charcoal transition-colors duration-300 py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="font-body text-xs text-charcoal-muted">
            &copy; <CurrentYear /> Perception 47 Coaching. All rights reserved.
          </p>
          <p className="font-body text-xs text-charcoal-muted">
            Authenticity is not a destination. It is a direction.
          </p>
        </div>
      </div>
    </footer>
  );
}

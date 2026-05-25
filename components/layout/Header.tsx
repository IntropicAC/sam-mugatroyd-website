'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./MobileMenu";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Coaching", href: "/coaching" },
  { label: "Articles", href: "/articles" },
  { label: "Books", href: "/books" },
  { label: "Contact", href: "/contact" },
];

const DARK_HERO_PATHS = ["/coaching"];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const hasDarkHero = DARK_HERO_PATHS.includes(pathname);
  const light = hasDarkHero && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${
          scrolled
            ? "bg-cream/95 backdrop-blur-sm border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
        data-light={light ? "true" : undefined}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo + Brand */}
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
              aria-label="Perception 47 Coaching — Home"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 relative flex-shrink-0">
                <Image
                  src="/images/perception-47-logo.png"
                  alt="Perception 47 logo"
                  fill
                  className={`object-contain transition-all duration-500 ${light ? "brightness-0 invert" : ""}`}
                  sizes="36px"
                  priority
                />
              </div>
              <span className={`font-body text-sm font-medium tracking-wide hidden sm:block transition-colors duration-500 ${light ? "text-cream/80 group-hover:text-cream" : "text-charcoal group-hover:text-green"}`}>
                Perception 47 Coaching
              </span>
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden md:flex items-center gap-6 lg:gap-8"
              aria-label="Primary navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-body text-sm tracking-wide transition-colors duration-500 ${light ? "text-cream/65 hover:text-cream" : "text-charcoal-mid hover:text-charcoal"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA + Mobile controls */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {/* Desktop CTA */}
              <Link
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center bg-green text-cream px-5 py-2.5 font-body text-sm font-medium tracking-wide hover:bg-green-hover transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
              >
                Book a call
              </Link>

              {/* Mobile: Book a call (small) */}
              <Link
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-9 shrink-0 items-center whitespace-nowrap px-2.5 font-body text-xs font-medium transition-colors duration-500 sm:px-3 md:hidden ${light ? "text-cream/75 border border-cream/40 hover:bg-cream/15" : "text-green border border-green hover:bg-green hover:text-cream"}`}
                aria-label="Book a free discovery call"
              >
                Book a call
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setMenuOpen(true)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center transition-colors duration-500 md:hidden ${light ? "text-cream/75 hover:text-cream" : "text-charcoal hover:text-green"}`}
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="2" y1="6" x2="20" y2="6" />
                  <line x1="2" y1="11" x2="20" y2="11" />
                  <line x1="2" y1="16" x2="20" y2="16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

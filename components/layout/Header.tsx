'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MindsetIcon from "@/components/ui/MindsetIcon";
import { lensCheckHref } from "@/lib/lens-check/progress";
import MobileMenu from "./MobileMenu";
import AccountNavigation from "./AccountNavigation";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Coaching", href: "/coaching" },
  { label: "Articles", href: "/articles" },
  { label: "Books", href: "/books" },
  { label: "Contact", href: "/contact" },
];

const DARK_HERO_PATHS = ["/coaching"];

export default function Header({ authEnabled = false }: { authEnabled?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const hasDarkHero = DARK_HERO_PATHS.includes(pathname);
  const light = hasDarkHero && !scrolled;
  const onLensCheck = pathname.startsWith("/lens-check");

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
          {/* Below md the bar and its contents grow a little with the screen (--header-* in globals.css). */}
          <div className="flex items-center justify-between h-[var(--header-h)] md:h-20">
            {/* Logo + Brand */}
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
              aria-label="Perception 47 Coaching — Home"
            >
              <div className="relative size-[var(--header-logo)] flex-shrink-0 md:size-9">
                <Image
                  src="/images/perception-47-logo.png"
                  alt="Perception 47 logo"
                  fill
                  className={`object-contain transition-all duration-500 ${light ? "brightness-0 invert" : ""}`}
                  sizes="44px"
                />
              </div>
              <span className={`font-body text-[length:var(--header-btn-text)] font-medium tracking-wide hidden sm:block md:hidden ${authEnabled ? "xl:block" : "lg:block"} lg:text-sm transition-colors duration-500 ${light ? "text-cream/80 group-hover:text-cream" : "text-charcoal group-hover:text-green"}`}>
                Perception 47 Coaching
              </span>
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden md:flex items-center gap-4 lg:gap-5"
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
              {/* The Mindset Test: the site's first step, so it leads */}
              <Link
                href={lensCheckHref()}
                aria-current={onLensCheck ? "page" : undefined}
                className="inline-flex h-[var(--header-btn-h)] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm border border-green bg-green px-[var(--header-btn-pad)] font-body text-[length:var(--header-btn-text)] font-medium text-cream transition-colors duration-300 hover:border-green-hover hover:bg-green-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green max-[359px]:px-2 max-[359px]:text-xs md:h-10 md:gap-2 md:px-4 md:text-sm md:tracking-wide"
              >
                <MindsetIcon className="size-[calc(var(--header-btn-text)+3px)] shrink-0 max-[359px]:hidden md:size-4" />
                Mindset Test
              </Link>

              {authEnabled ? <AccountNavigation light={light} /> : <>
              {/* Desktop: Book a call */}
              <Link
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden md:inline-flex items-center border px-5 py-2.5 font-body text-sm font-medium tracking-wide transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green ${light ? "border-cream/40 text-cream/80 hover:bg-cream/15 hover:text-cream" : "border-green text-green hover:bg-green hover:text-cream"}`}
              >
                Book a call
              </Link>

              {/* Mobile: Book a call (small) */}
              <Link
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-[var(--header-btn-h)] shrink-0 items-center whitespace-nowrap px-[var(--header-btn-pad)] font-body text-[length:var(--header-btn-text)] font-medium transition-colors duration-500 max-[359px]:px-2 max-[359px]:text-xs md:hidden ${light ? "text-cream/75 border border-cream/40 hover:bg-cream/15" : "text-green border border-green hover:bg-green hover:text-cream"}`}
                aria-label="Book a call - free discovery call"
              >
                Book a call
              </Link>
              </>}

              {/* Hamburger */}
              <button
                onClick={() => setMenuOpen(true)}
                className={`-mr-1.5 flex size-[calc(var(--header-icon)+20px)] shrink-0 items-center justify-center transition-colors duration-500 md:hidden ${light ? "text-cream/75 hover:text-cream" : "text-charcoal hover:text-green"}`}
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
              >
                <svg className="size-[var(--header-icon)]" width="24" height="24" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="2" y1="6" x2="20" y2="6" />
                  <line x1="2" y1="11" x2="20" y2="11" />
                  <line x1="2" y1="16" x2="20" y2="16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} authEnabled={authEnabled} />
    </>
  );
}

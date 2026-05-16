'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";

interface Book {
  index: number;
  title: string;
  theme: string;
  description: string;
  connectionLine: string;
  image: string;
  amazonUrl: string;
}

interface BooksCarouselProps {
  books: Book[];
}

function getBookMood(index: number) {
  if (index === 1) {
    return {
      rule: "bg-charcoal",
      wash: "rgba(42,39,34,0.07)",
    };
  }
  if (index === 2) {
    return {
      rule: "bg-green",
      wash: "rgba(61,89,72,0.10)",
    };
  }
  return {
    rule: "bg-charcoal-mid",
    wash: "rgba(81,77,73,0.085)",
  };
}

const SWIPE_DISTANCE = 55;
const SWIPE_VELOCITY = 400;

const pageVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 90 : -90,
    rotateY: dir > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: { x: 0, rotateY: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -90 : 90,
    rotateY: dir > 0 ? -20 : 20,
    opacity: 0,
  }),
};

export default function BooksCarousel({ books }: BooksCarouselProps) {
  const [[active, direction], setActive] = useState<[number, number]>([0, 0]);
  const book = books[active];
  const mood = getBookMood(book.index);

  const paginate = (delta: number) => {
    const next = (active + delta + books.length) % books.length;
    setActive([next, delta]);
  };

  const onDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) {
      paginate(1);
    } else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) {
      paginate(-1);
    }
  };

  const counter = `${String(active + 1).padStart(2, "0")} — ${String(books.length).padStart(2, "0")}`;

  return (
    <section
      className="md:hidden relative h-[145svh] bg-cream border-t border-border/40"
      aria-label="The Books"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.033]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 71px, #2A2722 71px, #2A2722 72px)",
          }}
          aria-hidden="true"
        />

        <motion.div
          key={`wash-${active}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="pointer-events-none absolute -right-28 top-1/4 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: mood.wash }}
          aria-hidden="true"
        />
        <motion.div
          key={`wash2-${active}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.3, delay: 0.1, ease: "easeOut" }}
          className="pointer-events-none absolute -left-24 bottom-1/4 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: mood.wash }}
          aria-hidden="true"
        />

        <div className="pointer-events-none absolute inset-4 border border-charcoal/10" aria-hidden="true" />

        <div className="relative z-10 flex h-full flex-col px-7 pt-7 pb-6">
          <header className="flex shrink-0 items-center justify-between">
            <p className="font-body text-[10px] tracking-[0.28em] uppercase text-charcoal-muted">
              The Collection
            </p>
            <motion.p
              key={`counter-${active}`}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-body text-[10px] tracking-[0.28em] tabular-nums text-charcoal-muted"
            >
              {counter}
            </motion.p>
          </header>

          <div
            className="relative min-h-0 flex-1"
            style={{ perspective: "1400px" }}
          >
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.article
                key={book.title}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                  rotateY: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.32 },
                }}
                drag="x"
                dragElastic={0.18}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={onDragEnd}
                className="absolute inset-0 flex touch-pan-y select-none flex-col items-center justify-center will-change-transform"
                style={{
                  transformOrigin: direction > 0 ? "left center" : "right center",
                }}
              >
                <div
                  className="relative mb-7 shrink-0"
                  style={{ height: "min(34svh, 280px)", aspectRatio: "2 / 3" }}
                >
                  <div
                    className="absolute left-4 right-2 bottom-[-12px] h-3 border-y border-charcoal/10 bg-charcoal/[0.045]"
                    aria-hidden="true"
                  />
                  <div className="relative h-full overflow-hidden border border-charcoal/10 bg-cream shadow-[14px_22px_50px_rgba(42,39,34,0.22)] before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-[10px] before:bg-[linear-gradient(to_right,rgba(26,24,20,0.42),rgba(255,255,255,0.14),transparent)] after:absolute after:inset-y-4 after:right-0 after:z-10 after:w-[5px] after:bg-cream/35">
                    <Image
                      src={book.image}
                      alt={`${book.title} book cover`}
                      fill
                      className="pointer-events-none object-cover"
                      sizes="(max-width: 768px) 220px, 0px"
                      draggable={false}
                      priority={active === 0}
                    />
                  </div>
                </div>

                <p className="font-body text-[10px] tracking-[0.22em] uppercase text-charcoal-muted mb-2.5">
                  {book.theme}
                </p>

                <h2 className="font-heading text-[28px] leading-[1.08] text-charcoal text-center mb-4">
                  {book.title}
                </h2>

                <div
                  className={`mb-5 h-px w-9 ${mood.rule} opacity-45`}
                  aria-hidden="true"
                />

                <p className="font-heading italic text-[15.5px] leading-snug text-charcoal/85 text-center mb-6 max-w-[300px] px-2">
                  {book.connectionLine}
                </p>

                <Link
                  href={book.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 border border-green bg-transparent px-6 py-3 font-body text-[13px] font-medium tracking-wide text-green transition-colors duration-300 hover:bg-green hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
                >
                  Buy on Amazon
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    {"→"}
                  </span>
                </Link>
              </motion.article>
            </AnimatePresence>
          </div>

          <footer className="shrink-0">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => paginate(-1)}
                aria-label="Previous book"
                className="group flex h-10 w-10 items-center justify-center border border-border bg-cream/55 text-charcoal-mid transition-colors duration-200 hover:border-charcoal/40 hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
              >
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover:-translate-x-0.5"
                >
                  {"←"}
                </span>
              </button>

              <div
                className="flex items-center gap-2.5"
                role="tablist"
                aria-label="Select a book"
              >
                {books.map((b, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={b.title}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Show ${b.title}`}
                      onClick={() => setActive([i, i > active ? 1 : -1])}
                      className="group flex h-6 items-center"
                    >
                      <span
                        className={`block h-px transition-all duration-500 ${
                          isActive
                            ? "w-9 bg-charcoal"
                            : "w-4 bg-charcoal/25 group-hover:bg-charcoal/50"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => paginate(1)}
                aria-label="Next book"
                className="group flex h-10 w-10 items-center justify-center border border-border bg-cream/55 text-charcoal-mid transition-colors duration-200 hover:border-charcoal/40 hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
              >
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  {"→"}
                </span>
              </button>
            </div>

            <p className="mt-4 text-center font-body text-[9.5px] tracking-[0.28em] uppercase text-charcoal-muted/75">
              Swipe to turn the page
            </p>
          </footer>
        </div>
      </div>
    </section>
  );
}

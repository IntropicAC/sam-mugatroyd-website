import type { Metadata } from "next";
import BooksHero from "@/components/books/BooksHero";
import BookFeature from "@/components/books/BookFeature";
import BooksThread from "@/components/books/BooksThread";
import BooksClosingCTA from "@/components/books/BooksClosingCTA";
import { BOOKS } from "@/lib/books";

export const metadata: Metadata = {
  title: "Books | Perception 47 — Sam Murgatroyd",
  description:
    "Three books by Sam Murgatroyd exploring identity, honesty, belonging, and what becomes possible when you stop living as the version of yourself the world taught you to be.",
  openGraph: {
    title: "Books | Perception 47 — Sam Murgatroyd",
    description:
      "Three books exploring identity, honesty, and belonging — the work behind the coaching.",
    type: "website",
  },
};

const books = [
  {
    title: "The Policy",
    themes: ["Honesty", "Performance", "Reckoning"],
    forWhom:
      "For anyone living quietly out of step with themselves.",
    paragraphs: [
      "Most people are performing a version of themselves without realising it. The Policy follows one man's moment of reckoning and the single conversation that changes the way he sees everything.",
      "It is a book about honesty — the quiet, expensive kind of dishonesty that runs underneath an ordinary life. The kind nobody can see from the outside, including the person living it.",
    ],
    pullQuote:
      "You can spend a whole life inside a version of yourself that was never really you.",
    coverImage: "/images/the-policy-new-cover.jpg",
    coverAlt: "The Policy by Sam Murgatroyd — book cover",
    seenIdPrefix: "book-feature-policy",
    reversed: false,
    amazonUrl: BOOKS.thePolicy.amazonUrl,
  },
  {
    title: "Robin's Bench",
    themes: ["Belonging", "Grief", "Self-acceptance"],
    forWhom:
      "For anyone who has spent years looking for belonging in the wrong rooms.",
    paragraphs: [
      "Robin's Bench is for anyone who has ever felt like they do not quite belong anywhere. It is about belonging — not to a place, not to a group, not to other people — but to yourself.",
      "It is the slow argument that healing only begins the moment you stop running from who you actually are, and stop looking for permission to be that person in rooms that were never going to give it.",
    ],
    pullQuote:
      "Belonging is not where you are loved. It is where you stop performing to be loved.",
    coverImage: "/images/robins-bench-new-cover.jpg",
    coverAlt: "Robin's Bench by Sam Murgatroyd — book cover",
    seenIdPrefix: "book-feature-robins-bench",
    reversed: true,
    amazonUrl: BOOKS.robinsBench.amazonUrl,
  },
  {
    title: "Alienated",
    themes: ["Identity", "Difference", "Permission"],
    forWhom:
      "For the quiet outsiders who learned to hide a part of themselves to be acceptable.",
    paragraphs: [
      "Alienated is for the people who see the world differently and have spent years wondering if that is a problem. It is not.",
      "This is the book that argues, gently and steadily, that the difference was never the problem. The problem was the room you were measured in. The work is not in becoming someone more acceptable — it is in finding the place where the way you already are stops being a thing you have to apologise for.",
    ],
    pullQuote:
      "You were not built wrong. You were just measured against the wrong room.",
    coverImage: "/images/alienated-new-cover.png",
    coverAlt: "Alienated by Sam Murgatroyd — book cover",
    seenIdPrefix: "book-feature-alienated",
    reversed: false,
    amazonUrl: BOOKS.alienated.amazonUrl,
  },
];

export default function BooksPage() {
  return (
    <>
      <BooksHero />

      {/* The three books — each its own editorial spread */}
      {books.map((book, i) => (
        <div key={book.title}>
          <BookFeature {...book} />
          {/* Hairline divider between books, except after the last */}
          {i < books.length - 1 && (
            <div className="px-5 md:px-8 lg:px-12">
              <div className="mx-auto max-w-5xl border-t border-border" />
            </div>
          )}
        </div>
      ))}

      <BooksThread />
      <BooksClosingCTA />
    </>
  );
}

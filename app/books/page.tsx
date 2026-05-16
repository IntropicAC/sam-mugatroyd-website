import type { Metadata } from "next";
import BooksHero from "@/components/books/BooksHero";
import BooksIntro from "@/components/books/BooksIntro";
import BookFeature from "@/components/books/BookFeature";
import BooksCarousel from "@/components/books/BooksCarousel";
import BooksSignedCopies from "@/components/books/BooksSignedCopies";
import BooksFinalCTA from "@/components/books/BooksFinalCTA";

export const metadata: Metadata = {
  title: "Books | Perception 47 — Sam Murgatroyd",
  description:
    "Three books by Sam Murgatroyd exploring identity, honesty, belonging, and what becomes possible when we stop living as the version of ourselves the world taught us to be.",
  openGraph: {
    title: "Books | Perception 47 — Sam Murgatroyd",
    description:
      "Three books exploring identity, honesty, and belonging. The books sit behind the coaching. They are where much of it began.",
    type: "website",
  },
};

const books = [
  {
    index: 1,
    title: "The Policy",
    theme: "Honesty · Performance · Reckoning",
    description:
      "Most people are performing a version of themselves without realising it. This book follows one man's moment of reckoning and the conversation that changes the way he sees everything. It is about honesty, the quiet cost of living dishonestly, and what becomes possible when you stop.",
    connectionLine:
      "For anyone who has ever felt the distance between who they are and who they pretend to be.",
    image: "/images/the-policy-new-cover.jpg",
    // TODO: Replace with real Amazon link when available
    amazonUrl: "https://amazon.co.uk",
    reversed: false,
  },
  {
    index: 2,
    title: "Robin's Bench",
    theme: "Belonging · Grief · Self-acceptance",
    description:
      "For anyone who has ever felt like they do not quite belong anywhere. This book explores what it means to belong not to other people but to yourself, and why healing can only begin the moment you stop running from who you actually are.",
    connectionLine:
      "For anyone who has spent years looking for belonging in places that could never give it.",
    image: "/images/robins-bench-new-cover.jpg",
    // TODO: Replace with real Amazon link when available
    amazonUrl: "https://amazon.co.uk",
    reversed: true,
  },
  {
    index: 3,
    title: "Alienated",
    theme: "Identity · Difference · Freedom",
    description:
      "For the people who see the world differently and have spent years wondering if that is a problem. It is not. This book is about breaking free from the version of yourself the world tried to build for you and finding out who you actually are when nobody is telling you.",
    connectionLine:
      "For anyone who has mistaken being different for being wrong.",
    image: "/images/alienated-new-cover.png",
    // TODO: Replace with real Amazon link when available
    amazonUrl: "https://amazon.co.uk",
    reversed: false,
  },
];

export default function BooksPage() {
  return (
    <>
      <BooksHero />
      <BooksIntro />
      <BooksCarousel books={books} />
      <div className="hidden md:block">
        {books.map((book) => (
          <BookFeature key={book.title} {...book} />
        ))}
      </div>
      <BooksSignedCopies />
      <BooksFinalCTA />
    </>
  );
}

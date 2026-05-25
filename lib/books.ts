export const BOOKS = {
  thePolicy: {
    id: "the-policy",
    title: "The Policy",
    coverImage: "/images/the-policy-new-cover.jpg",
    coverAlt: "The Policy by Sam Murgatroyd book cover",
    amazonUrl:
      "https://www.amazon.co.uk/Policy-Sam-Murgatroyd-ebook/dp/B0FLZZ96WL/",
    matchPattern: /\bThe Policy\b/i,
    shortDescription:
      "A short philosophical fiction story about honesty, performance, and the quiet cost of living as a version of yourself.",
  },
  robinsBench: {
    id: "robins-bench",
    title: "Robin's Bench",
    coverImage: "/images/robins-bench-new-cover.jpg",
    coverAlt: "Robin's Bench by Sam Murgatroyd book cover",
    amazonUrl: "https://www.amazon.co.uk/Robins-Bench-Sam-Murgatroyd/dp/B0FFGY7JP5/",
    matchPattern: /\bRobin'?s Bench\b/i,
    shortDescription:
      "A gentle novel about belonging to yourself, healing, and what changes when you stop running from who you are.",
  },
  alienated: {
    id: "alienated",
    title: "Alienated",
    coverImage: "/images/alienated-new-cover.png",
    coverAlt: "Alienated by Sam Murgatroyd book cover",
    amazonUrl: "https://www.amazon.co.uk/Alienated-Sam-Murgatroyd/dp/B0CVF4BCDR/",
    matchPattern: /\bAlienated\b/i,
    shortDescription:
      "A perspective-shifting book for anyone who has felt different, out of place, or measured against the wrong room.",
  },
} as const;

export type BookId = keyof typeof BOOKS;
export type Book = (typeof BOOKS)[BookId];

export const bookList: Book[] = [
  BOOKS.thePolicy,
  BOOKS.robinsBench,
  BOOKS.alienated,
];

export function getBook(bookId: BookId): Book {
  return BOOKS[bookId];
}

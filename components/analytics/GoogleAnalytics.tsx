'use client';

import { useEffect } from "react";
import Script from "next/script";
import { bookList } from "@/lib/books";
import { GA_MEASUREMENT_ID } from "@/lib/site";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const trackedBooks = bookList.map((book) => ({
  id: book.id,
  title: book.title,
  amazonUrl: normalizeUrl(book.amazonUrl),
}));

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.pathname = parsed.pathname.replace(/\/$/, "");
    return parsed.toString();
  } catch {
    return url.replace(/\/$/, "");
  }
}

function findTrackedBook(url: string) {
  const normalizedUrl = normalizeUrl(url);
  return trackedBooks.find((book) => book.amazonUrl === normalizedUrl);
}

export default function GoogleAnalytics() {
  // Keep click tracking centralized so links added in articles, cards, chat,
  // or future book sections are tracked consistently after analytics consent.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");

      if (!anchor || typeof window.gtag !== "function") {
        return;
      }

      if (anchor.href.includes("calendly.com")) {
        window.gtag("event", "book_discovery_call", {
          link_url: anchor.href,
        });
      }

      const trackedBook = findTrackedBook(anchor.href);
      if (trackedBook) {
        window.gtag("event", "book_amazon_click", {
          book_id: trackedBook.id,
          book_title: trackedBook.title,
          link_url: anchor.href,
          source_path: window.location.pathname,
          outbound: true,
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}

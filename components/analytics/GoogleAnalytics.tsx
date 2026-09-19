'use client';

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { bookList } from "@/lib/books";
import { GA_MEASUREMENT_ID } from "@/lib/site";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    __p47GaInitialized?: boolean;
    __p47LastPageView?: string;
    __p47PreviousPageLocation?: string;
  }
}

const ANALYTICS_DEBUG_STORAGE_KEY = "p47-analytics-debug";

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

function isAnalyticsDebugEnabled() {
  try {
    return (
      localStorage.getItem(ANALYTICS_DEBUG_STORAGE_KEY) === "1" ||
      new URLSearchParams(window.location.search).get("analytics_debug") === "1"
    );
  } catch {
    return false;
  }
}

function withDebugMode(params: Record<string, unknown>) {
  if (!isAnalyticsDebugEnabled()) {
    return params;
  }

  return {
    ...params,
    debug_mode: true,
  };
}

function logAnalyticsDebug(eventName: string, params: Record<string, unknown>) {
  if (!isAnalyticsDebugEnabled()) {
    return;
  }

  console.info("[analytics]", eventName, params);
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };

  if (window.__p47GaInitialized) {
    return;
  }

  window.gtag("js", new Date());
  window.gtag(
    "config",
    GA_MEASUREMENT_ID,
    withDebugMode({
      send_page_view: false,
    }),
  );
  window.__p47GaInitialized = true;
}

function trackPageView(pathname: string, search: string) {
  ensureGtag();

  const pagePath = search ? `${pathname}?${search}` : pathname;
  const pageLocation = `${window.location.origin}${pagePath}`;

  if (window.__p47LastPageView === pageLocation) {
    return;
  }

  const params = withDebugMode({
    page_title: document.title,
    page_location: pageLocation,
    page_path: pagePath,
    page_referrer: window.__p47PreviousPageLocation || document.referrer,
  });

  window.gtag("event", "page_view", params);
  logAnalyticsDebug("page_view", params);

  window.__p47LastPageView = pageLocation;
  window.__p47PreviousPageLocation = pageLocation;
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    trackPageView(pathname, search);
  }, [pathname, search]);

  // Keep click tracking centralized so links added in articles, cards, chat,
  // or future book sections are tracked consistently after analytics consent.
  useEffect(() => {
    ensureGtag();

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
        const params = withDebugMode({
          link_url: anchor.href,
        });
        window.gtag("event", "book_discovery_call", params);
        logAnalyticsDebug("book_discovery_call", params);
      }

      const trackedBook = findTrackedBook(anchor.href);
      if (trackedBook) {
        const params = withDebugMode({
          book_id: trackedBook.id,
          book_title: trackedBook.title,
          link_url: anchor.href,
          source_path: window.location.pathname,
          outbound: true,
        });
        window.gtag("event", "book_amazon_click", params);
        logAnalyticsDebug("book_amazon_click", params);
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
    </>
  );
}

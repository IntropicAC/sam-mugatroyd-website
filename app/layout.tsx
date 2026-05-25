import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyMobileCTA from "@/components/layout/StickyMobileCTA";
import PageAnimationProvider from "@/components/layout/PageAnimationProvider";
import ChatWidget from "@/components/chat/ChatWidget";
import {
  AUTHOR_NAME,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_SOCIAL_IMAGE_ALT,
  DEFAULT_SOCIAL_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_IMAGE_WIDTH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: "Perception 47 Coaching | Sam Murgatroyd",
  description:
    "Life coaching with Sam Murgatroyd for overthinking, people pleasing and burnout. Understand the patterns behind how you feel, decide and live.",
  authors: [{ name: AUTHOR_NAME }],
  creator: AUTHOR_NAME,
  publisher: SITE_NAME,
  openGraph: {
    title: "Perception 47 Coaching | Sam Murgatroyd",
    description:
      "Understand the patterns you have been living inside and start moving through life with more honesty, confidence and self-trust.",
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_GB",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: DEFAULT_SOCIAL_IMAGE_WIDTH,
        height: DEFAULT_SOCIAL_IMAGE_HEIGHT,
        alt: DEFAULT_SOCIAL_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Perception 47 Coaching | Sam Murgatroyd",
    description:
      "Understand the patterns you have been living inside and start moving through life with more honesty, confidence and self-trust.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  appleWebApp: {
    title: SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${dmSans.variable} antialiased`}
    >
      <body className="bg-cream text-charcoal min-h-dvh flex flex-col">
        <Script id="replay-animations-on-refresh" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var entries = performance.getEntriesByType && performance.getEntriesByType("navigation");
                var navType = entries && entries[0] && entries[0].type;

                if (navType !== "reload" || location.hash) {
                  return;
                }

                var previousScrollRestoration = history.scrollRestoration;

                if ("scrollRestoration" in history) {
                  history.scrollRestoration = "manual";
                }

                var resetScroll = function () {
                  window.scrollTo(0, 0);
                };

                resetScroll();
                requestAnimationFrame(resetScroll);
                window.addEventListener("load", function () {
                  requestAnimationFrame(function () {
                    resetScroll();

                    if ("scrollRestoration" in history) {
                      history.scrollRestoration = previousScrollRestoration || "auto";
                    }
                  });
                }, { once: true });
              } catch (_) {}
            })();
          `}
        </Script>
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
          <PageAnimationProvider>{children}</PageAnimationProvider>
        </main>
        <Footer />
        <StickyMobileCTA />
        <ChatWidget />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyMobileCTA from "@/components/layout/StickyMobileCTA";
import PageAnimationProvider from "@/components/layout/PageAnimationProvider";
import ChatWidget from "@/components/chat/ChatWidget";
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from "@/lib/site";

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
    "Sam Murgatroyd is a Life Coach and Author helping people understand the patterns they have been living inside. Book a free 20-minute discovery call.",
  authors: [{ name: AUTHOR_NAME }],
  creator: AUTHOR_NAME,
  publisher: SITE_NAME,
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

'use client';

import Image from "next/image";
import { useState, useId } from "react";

interface VideoEmbedProps {
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  posterPosition?: "top" | "center" | "bottom";
  className?: string;
}

export default function VideoEmbed({
  youtubeId,
  title,
  thumbnailUrl,
  posterPosition = "center",
  className = "",
}: VideoEmbedProps) {
  const [activated, setActivated] = useState(false);
  const [warm, setWarm] = useState(false);
  const labelId = useId();

  const embedSrc = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  const objectPosition =
    posterPosition === "top"
      ? "object-top"
      : posterPosition === "bottom"
        ? "object-bottom"
        : "object-center";

  return (
    <div
      className={`relative w-full aspect-video overflow-hidden bg-charcoal ${className}`}
    >
      {/* Preconnect once the user hovers or focuses so the iframe loads faster on click */}
      {warm && !activated && (
        <>
          <link rel="preconnect" href="https://www.youtube-nocookie.com" />
          <link rel="preconnect" href="https://www.google.com" />
        </>
      )}

      {!activated ? (
        <button
          type="button"
          onClick={() => setActivated(true)}
          onMouseEnter={() => setWarm(true)}
          onFocus={() => setWarm(true)}
          onTouchStart={() => setWarm(true)}
          aria-labelledby={labelId}
          className="group absolute inset-0 block cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
        >
          <span id={labelId} className="sr-only">
            Play video: {title}
          </span>

          {/* Local poster stays cacheable and responsive before the iframe is requested. */}
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 768px) calc(100vw - 40px), 896px"
            className={`absolute inset-0 h-full w-full object-cover ${objectPosition} transition-transform duration-700 group-hover:scale-[1.02]`}
          />

          {/* Subtle dark overlay for legibility of the play button */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-charcoal/10 transition-colors duration-300 group-hover:bg-charcoal/20"
          />

          {/* Play button */}
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream/95 shadow-[0_8px_28px_-8px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-cream md:h-20 md:w-20">
              <svg
                width="22"
                height="26"
                viewBox="0 0 22 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1"
              >
                <path
                  d="M2 2L20 13L2 24V2Z"
                  fill="#3D5948"
                  stroke="#3D5948"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>

          {/* Caption strip on hover (desktop) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 right-0 hidden bg-gradient-to-t from-charcoal/70 to-transparent px-5 py-4 font-body text-xs uppercase tracking-[0.18em] text-cream/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
          >
            Watch — 2:46
          </span>
        </button>
      ) : (
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
    </div>
  );
}

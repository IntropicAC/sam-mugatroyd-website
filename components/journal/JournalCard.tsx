import Link from "next/link";
import FadeInView from "@/components/ui/FadeInView";
import type { JournalEntry } from "@/lib/journal";

interface JournalCardProps {
  entry: JournalEntry;
  delay?: number;
  index?: number;
}

export default function JournalCard({
  entry,
  delay = 0,
  index,
}: JournalCardProps) {
  return (
    <FadeInView delay={delay}>
      <Link
        href={`/articles/${entry.slug}`}
        className="group flex min-h-[18rem] h-full flex-col justify-between border border-border bg-cream p-6 transition-colors duration-300 hover:border-charcoal-muted/40 hover:bg-cream-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
      >
        <div>
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-border/70 pb-4">
            <p className="font-body text-[10px] uppercase tracking-[0.18em] text-charcoal-muted">
              {entry.category}
            </p>
            {index && (
              <span className="font-heading text-lg leading-none text-charcoal/25">
                {String(index).padStart(2, "0")}
              </span>
            )}
          </div>
          <h3 className="mb-4 font-heading text-[1.25rem] leading-snug text-charcoal transition-colors duration-300 group-hover:text-green md:text-[1.35rem]">
            {entry.title}
          </h3>
          <p className="line-clamp-3 font-body text-sm leading-relaxed text-charcoal-mid">
            {entry.teaser}
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2 font-body text-sm text-charcoal-mid transition-colors duration-300 group-hover:text-charcoal">
          Read
          <span
            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          >
            {"->"}
          </span>
        </div>
      </Link>
    </FadeInView>
  );
}

import Image from "next/image";
import Link from "next/link";

interface BookCardProps {
  title: string;
  description: string;
  coverImage: string;
  href?: string;
}

export default function BookCard({ title, description, coverImage, href }: BookCardProps) {
  const cardContent = (
    <div className="group flex flex-col h-full">
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden mb-4 bg-surface">
        <Image
          src={coverImage}
          alt={`${title} book cover`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col flex-1">
        <h3 className="font-heading text-base md:text-lg text-charcoal mb-2 leading-snug group-hover:text-green transition-colors duration-300">
          {title}
        </h3>
        <p className="font-body text-xs text-charcoal-mid leading-relaxed flex-1">
          {description}
        </p>
        {href && (
          <span className="mt-4 inline-flex items-center gap-2 font-body text-xs text-green tracking-wide">
            View book
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
      >
        {cardContent}
      </Link>
    );
  }

  return <div>{cardContent}</div>;
}

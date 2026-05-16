import Link from "next/link";

interface PackageCardProps {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  ctaHref: string;
  featured?: boolean;
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="flex-shrink-0 mt-0.5"
      aria-hidden="true"
    >
      <path
        d="M2 7L5.5 10.5L12 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PackageCard({
  title,
  price,
  subtitle,
  features,
  ctaHref,
  featured = false,
}: PackageCardProps) {
  return (
    <div
      className={`flex w-full flex-col h-full border p-7 md:p-8 transition-shadow duration-300 hover:shadow-sm ${
        featured
          ? "border-green bg-green/5"
          : "border-border bg-cream"
      }`}
    >
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-heading text-xl text-charcoal">{title}</h3>
          {featured && (
            <span className="font-body text-xs text-green border border-green px-2 py-0.5 tracking-wide flex-shrink-0">
              Popular
            </span>
          )}
        </div>

        <div className="mb-2">
          <span className="font-heading text-3xl md:text-4xl text-charcoal">{price}</span>
        </div>
        <p className="font-body text-xs text-charcoal-muted leading-snug">{subtitle}</p>
      </div>

      <ul className="space-y-3 flex-1 mb-8" aria-label={`${title} features`}>
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-charcoal-mid">
            <CheckIcon />
            <span className="font-body text-sm leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full text-center py-3.5 font-body text-sm font-medium tracking-wide transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green ${
          featured
            ? "bg-green text-cream hover:bg-green-hover"
            : "border border-border text-charcoal hover:border-charcoal hover:bg-cream-deep"
        }`}
      >
        Book a free call first
      </Link>
    </div>
  );
}

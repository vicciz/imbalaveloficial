import Link from "next/link";

interface Props {
  badge?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
}

export default function BannerContent({
  badge,
  title,
  subtitle,
  buttonText,
  buttonHref,
}: Props) {
  return (
    <div className="absolute inset-0 z-20">
      <div className="mx-auto flex h-full max-w-7xl items-center px-8 lg:px-12">
        <div className="max-w-[520px]">
          {badge && (
            <span className="inline-flex rounded-full border border-white/70 px-5 py-2 text-xs font-semibold tracking-[.18em] text-white">
              {badge}
            </span>
          )}

          <h1 className="mt-6 text-5xl font-bold leading-tight text-white">
            {title}
          </h1>

          <p className="mt-6 text-xl leading-9 text-white/90">
            {subtitle}
          </p>

          <Link
            href={buttonHref}
            className="mt-10 inline-flex rounded-full bg-white px-10 py-4 font-semibold text-[#6D11F5] transition hover:scale-105"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";

interface ATPWellnessHeroProps {
  videoSrc?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export default function ATPWellnessHero({
  videoSrc,
  imageSrc = "/atp-products-hero.png",
  imageAlt,
}: ATPWellnessHeroProps) {
  const t = useTranslations("hero");

  return (
    <section className="relative isolate overflow-hidden bg-[#080808] text-white" aria-label={t("heroAriaLabel")}>
      {/* Copy stays in normal flow so long translations never overlap products. */}
      <div className="relative z-10 mx-auto max-w-4xl px-5 pb-4 pt-10 text-center sm:px-8 sm:pt-14 lg:pt-16">
        <p className="mb-3 text-sm font-medium tracking-wide text-[#e8cd88] sm:text-base">
          {t("authenticThaiWellness")}
        </p>
        <h1 className="text-balance font-display text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-6xl">
          {t("welcomeToATP")}
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-pretty text-base leading-7 text-[#ededed] sm:text-lg sm:leading-8">
          {t("heroSubtitle")}
        </p>
        <div className="mx-auto mt-6 flex max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
          <Link href="/search" className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#e8cd88] px-7 py-3 text-base font-semibold text-black transition-colors hover:bg-[#f5dfaa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            {t("shopNow")}
          </Link>
          <Link href="/atp-membership" className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#e8cd88] px-7 py-3 text-base font-medium text-[#f5dfaa] transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            {t("exploreAtpMembership")}
          </Link>
        </div>
      </div>
      {/* Trim only the empty upper backdrop; keep all products visible at every width. */}
      <div className="relative mx-auto aspect-[1672/700] w-full max-w-[1100px]">
        {videoSrc ? (
          <video muted loop playsInline controls poster={imageSrc} className="block h-auto w-full" aria-label={imageAlt || t("heroImageAlt")}>
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <Image src={imageSrc} alt={imageAlt || t("heroImageAlt")} fill priority sizes="(min-width: 1100px) 1100px, 100vw" quality={85} className="object-cover object-bottom" />
        )}
      </div>
    </section>
  );
}

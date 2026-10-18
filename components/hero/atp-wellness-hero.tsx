import Image from "next/image";
import { ArrowRight, Droplets, Sparkles, Crown } from "lucide-react";
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
        <nav aria-label={t("browseSections")} className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-3">
          {[
            { href: "/collections/amazing-thai-products", label: "supplementsAndCosmetics", icon: Sparkles },
            { href: "/collections/water-soil-technology-solutions", label: "waterAndSoilSolutions", icon: Droplets },
            { href: "/atp-membership", label: "atpMembership", icon: Crown },
          ].map(({ href, label, icon: Icon }, index) => (
            <Link
              key={href}
              href={href}
              className={`group flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 py-4 text-start text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-5 sm:text-lg ${index === 0 ? "border-[#e8cd88] bg-[#e8cd88] text-black hover:bg-[#f5dfaa]" : "border-[#e8cd88]/50 bg-white/5 text-white hover:bg-white/10"}`}
            >
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span className="min-w-0 flex-1 leading-snug">{t(label)}</span>
              <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 rtl:rotate-180" />
            </Link>
          ))}
        </nav>
      </div>
      {/* Trim only the empty upper backdrop; keep all products visible at every width. */}
      <div className="relative mx-auto aspect-[1672/700] w-full max-w-[1100px]">
        {videoSrc ? (
          <video muted loop playsInline controls poster={imageSrc} className="block h-auto w-full" aria-label={imageAlt || t("heroImageAlt")}>
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <Image src={imageSrc} alt={imageAlt || t("heroImageAlt")} fill preload fetchPriority="high" sizes="(min-width: 1100px) 1100px, 100vw" quality={75} className="object-cover object-bottom" />
        )}
      </div>
    </section>
  );
}

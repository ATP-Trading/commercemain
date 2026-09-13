"use client";

import { m, useScroll, useTransform, useInView, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import React from "react";
import Image from "next/image";
import { ChevronDown, Users, Award, Sparkles, Shield } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GradientText } from "@/components/ui/gradient-text";
import { FloatingElement } from "@/components/ui/floating-element";
import { heroContainerVariants, fadeUpVariants, easing } from "@/lib/animations/variants";

interface ATPWellnessHeroProps {
  /** Optional video source for background */
  videoSrc?: string;
  /** Fallback image source */
  imageSrc?: string;
  /** Image alt text for accessibility */
  imageAlt?: string;
}

export default function ATPWellnessHero({
  videoSrc,
  imageSrc = "/ATPBG.PNG",
  imageAlt = "ATP Trading - Luxury Wellness",
}: ATPWellnessHeroProps) {
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(contentRef, { once: true, amount: 0.3 });
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for mobile and reduced motion
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    checkMobile();
    setPrefersReducedMotion(mediaQuery.matches);

    window.addEventListener("resize", checkMobile);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => {
      window.removeEventListener("resize", checkMobile);
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  // Scroll-linked animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], ["0%", "20%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.9]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Smooth spring for scroll indicator bounce
  const scrollIndicatorY = useSpring(0, { stiffness: 300, damping: 20 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      scrollIndicatorY.set(10);
      setTimeout(() => scrollIndicatorY.set(0), 300);
    }, 2000);

    return () => clearInterval(interval);
  }, [scrollIndicatorY, prefersReducedMotion]);

  // Word array for staggered reveal
  const titleWords = t("welcomeToATP").split(" ");
  const subtitleWords = t("authenticThaiWellness").split(" ");


  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label={t("heroAriaLabel") || "ATP Wellness Hero Section"}
    >
      {/* === BACKGROUND LAYER === */}
      <m.div
        className="absolute inset-0 z-0"
        style={{ y: prefersReducedMotion ? 0 : backgroundY }}
      >
        {/* Video Background (Desktop only) */}
        {videoSrc && !isMobile && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster={imageSrc}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}

        {/* Fallback gradient if no media */}
        {!videoSrc && !imageSrc && (
          <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />
        )}

        {/* Image Background - Optimized with Next.js Image */}
        {(!videoSrc || isMobile) && imageSrc && (
          <div className="absolute inset-0">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover object-center md:object-top"
              style={{
                objectPosition: isMobile ? 'center 20%' : 'center top',
              }}
            />
          </div>
        )}

        {/* Gradient Mesh Overlay */}
        <div className="absolute inset-0 gradient-mesh-hero" />

        {/* Dark Overlay with scroll-linked opacity */}
        <m.div
          className="absolute inset-0 bg-black"
          style={{ opacity: prefersReducedMotion ? 0.7 : overlayOpacity }}
        />

        {/* Noise Texture for premium feel */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Gold Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--atp-gold)_0%,_transparent_70%)] opacity-[0.08]" />
      </m.div>

      {/* === FLOATING DECORATIVE ELEMENTS === */}
      {!isMobile && !prefersReducedMotion && (
        <>
          <FloatingElement
            range={20}
            duration={8}
            delay={0}
            className="absolute top-[15%] left-[10%] z-10"
          >
            <div className="w-2 h-2 rounded-full bg-[var(--atp-gold)] opacity-40" />
          </FloatingElement>
          <FloatingElement
            range={15}
            duration={6}
            delay={1}
            className="absolute top-[25%] right-[15%] z-10"
          >
            <div className="w-3 h-3 rounded-full bg-[var(--atp-gold)] opacity-30" />
          </FloatingElement>
          <FloatingElement
            range={25}
            duration={10}
            delay={2}
            className="absolute bottom-[30%] left-[20%] z-10"
          >
            <Sparkles className="w-4 h-4 text-[var(--atp-gold)] opacity-40" />
          </FloatingElement>
          <FloatingElement
            range={18}
            duration={7}
            delay={0.5}
            className="absolute bottom-[20%] right-[10%] z-10"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--atp-gold)] opacity-50" />
          </FloatingElement>
        </>
      )}

      {/* === MAIN CONTENT === */}
      <m.div
        ref={contentRef}
        className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{
          opacity: prefersReducedMotion ? 1 : contentOpacity,
          y: prefersReducedMotion ? 0 : contentY,
        }}
        variants={heroContainerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* === HERO TITLE === */}
        <m.div className="mb-6 sm:mb-8">
          {/* Main Title - Word by Word Reveal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-semibold leading-[1.1] tracking-tight">
            <span className="sr-only">{t("welcomeToATP")}</span>
            <span aria-hidden="true" className="flex flex-wrap justify-center gap-x-3 sm:gap-x-4 md:gap-x-5">
              {titleWords.map((word, index) => (
                <m.span
                  key={index}
                  className="inline-block"
                  initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                  animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.2 + index * 0.1,
                    ease: easing.expoOut,
                  }}
                >
                  <GradientText gradient="gold" animate={!prefersReducedMotion}>
                    {word}
                  </GradientText>
                </m.span>
              ))}
            </span>
          </h1>

          {/* Subtitle - Staggered Reveal */}
          <m.p
            className="mt-4 sm:mt-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/80 font-light tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.6, ease: easing.smooth }}
          >
            {t("authenticThaiWellness")}
          </m.p>
        </m.div>

        {/* === HERO DESCRIPTION === */}
        <m.div
          className="max-w-3xl mx-auto mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8, ease: easing.smooth }}
        >
          <p className="text-base sm:text-lg md:text-xl text-white/60 leading-relaxed">
            {t("heroSubtitle")}
          </p>
        </m.div>

        {/* === CTA BUTTONS === */}
        <m.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.1, ease: easing.smooth }}
        >
          <Link href="/atp-membership" className="w-full sm:w-auto">
            <MagneticButton
              variant="gold-hero"
              size="lg"
              strength={0.15}
              className="w-full sm:w-auto min-w-[200px]"
              as="div"
            >
              {t("exploreAtpMembership")}
            </MagneticButton>
          </Link>

          <Link href="/about" className="w-full sm:w-auto">
            <MagneticButton
              variant="outline-gold"
              size="lg"
              strength={0.1}
              className="w-full sm:w-auto min-w-[200px]"
              as="div"
            >
              {t("learnOurStory")}
            </MagneticButton>
          </Link>
        </m.div>

        {/* === CATEGORIES TICKER === */}
        <m.div
          className="mt-12 sm:mt-16 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <div className="relative">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-black to-transparent z-10" />

            <m.div
              className="flex gap-8 sm:gap-12 text-white/50 text-sm sm:text-base whitespace-nowrap"
              animate={prefersReducedMotion ? {} : { x: [0, "-50%"] }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...Array(2)].map((_, setIndex) => (
                <React.Fragment key={setIndex}>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--atp-gold)]" />
                    {t("membershipBenefit1")}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--atp-gold)]" />
                    {t("membershipBenefit2")}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--atp-gold)]" />
                    {t("membershipBenefit3")}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--atp-gold)]" />
                    {t("membershipBenefit4")}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--atp-gold)]" />
                    {t("membershipBenefit5")}
                  </span>
                </React.Fragment>
              ))}
            </m.div>
          </div>
        </m.div>
      </m.div>

      {/* === SCROLL INDICATOR === */}
      <m.div
        className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-20"
        style={{
          opacity: prefersReducedMotion ? 0.7 : scrollIndicatorOpacity,
          y: prefersReducedMotion ? 0 : scrollIndicatorY,
        }}
      >
        <m.div
          className="flex flex-col items-center gap-2 cursor-pointer group"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.5 }}
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: "smooth",
            });
          }}
          role="button"
          aria-label={t("scrollToExplore") || "Scroll to explore"}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
            }
          }}
        >
          <span className="text-xs sm:text-sm text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">
            {t("scrollToExplore") || "Scroll"}
          </span>
          <m.div
            className="p-2 rounded-full border border-[var(--atp-gold)]/30 group-hover:border-[var(--atp-gold)]/60 transition-colors"
            animate={prefersReducedMotion ? {} : { y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--atp-gold)]" />
          </m.div>
        </m.div>
      </m.div>
    </section>
  );
}

"use client";

import { m, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import {
  Leaf,
  Heart,
  Dumbbell,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Timer,
  TrendingUp,
  Users,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { TabsWithIndicator, Tab } from "@/components/ui/tab-indicator";
import { ComparisonSlider } from "@/components/ui/comparison-slider";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { RevealText } from "@/components/ui/reveal-text";
import { useParallaxHero } from "@/lib/hooks/use-parallax-layer";
import {
  containerVariants,
  itemVariants,
  cardVariants,
  fadeUpVariants,
  scrollFadeVariants,
  viewportOptions,
  transitions,
} from "@/lib/animations/variants";

interface ServiceHighlight {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  image: string;
  link: string;
  gradient: string;
  badge?: string;
  stats: {
    duration: string;
    sessions: string;
    rating: number;
  };
  testimonial?: {
    text: string;
    author: string;
    role: string;
  };
  // For EMS section
  hasComparison?: boolean;
  beforeImage?: string;
  afterImage?: string;
}

export default function ServiceHighlights() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [activeService, setActiveService] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("services");
  const locale = useLocale();

  // Parallax for hero images
  const parallax = useParallaxHero();

  const serviceHighlights: ServiceHighlight[] = [
    {
      id: "supplements",
      icon: Leaf,
      title: t("supplements.title"),
      subtitle: t("supplements.subtitle"),
      description: t("supplements.description"),
      benefits: [
        t("supplements.benefit1"),
        t("supplements.benefit2"),
        t("supplements.benefit3"),
        t("supplements.benefit4"),
        t("supplements.benefit5"),
      ],
      image: "/supplements-thai.jpg",
      link: "/collections/amazing-thai-products",
      gradient: "from-emerald-400 via-green-500 to-teal-600",
      badge: t("supplements.badge"),
      stats: {
        duration: t("supplements.duration"),
        sessions: t("supplements.sessions"),
        rating: 4.9,
      },
      testimonial: {
        text: t("supplements.testimonialText"),
        author: t("supplements.testimonialAuthor"),
        role: t("supplements.testimonialRole"),
      },
    },
    {
      id: "beauty",
      icon: Heart,
      title: t("beauty.title"),
      subtitle: t("beauty.subtitle"),
      description: t("beauty.description"),
      benefits: [
        t("beauty.benefit1"),
        t("beauty.benefit2"),
        t("beauty.benefit3"),
        t("beauty.benefit4"),
        t("beauty.benefit5"),
      ],
      image: "/supplements-thai.jpg",
      link: "/collections/amazing-thai-products",
      gradient: "from-rose-400 via-pink-500 to-purple-600",
      badge: t("beauty.badge"),
      stats: {
        duration: t("beauty.duration"),
        sessions: t("beauty.sessions"),
        rating: 4.8,
      },
      testimonial: {
        text: t("beauty.testimonialText"),
        author: t("beauty.testimonialAuthor"),
        role: t("beauty.testimonialRole"),
      },
    },


  ];

  // Create tabs for TabsWithIndicator
  const serviceTabs: Tab[] = serviceHighlights.map((service) => ({
    id: service.id,
    label: service.title.split(" ")[0] || service.title, // Short label
    icon: <service.icon className="w-5 h-5" />,
  }));

  const currentService = serviceHighlights[activeService];

  if (!currentService) {
    return null;
  }

  const handleTabChange = (tabId: string) => {
    const index = serviceHighlights.findIndex((s) => s.id === tabId);
    if (index !== -1) {
      setActiveService(index);
    }
  };

  return (
    <section
      ref={ref}
      className="py-32 bg-gradient-to-b from-atp-charcoal via-atp-black to-atp-charcoal relative overflow-hidden"
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <m.div
          className="absolute top-0 left-1/3 w-96 h-96 bg-atp-gold/5 rounded-full blur-3xl"
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <m.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"
          animate={shouldReduceMotion ? {} : {
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <m.div
          className="absolute top-2/3 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header with RevealText */}
        <m.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }}
        >
          <m.div
            className="inline-flex items-center gap-2 glass-gold rounded-full px-8 py-4 mb-8"
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
          >
            <Star className="w-5 h-5 text-atp-gold" />
            <span className="text-atp-gold font-semibold">
              {t("premiumServices")}
            </span>
            <Star className="w-5 h-5 text-atp-gold" />
          </m.div>

          <h2 className="text-5xl md:text-7xl font-light text-white mb-8 leading-tight">
            <RevealText mode="words" delay={0.2}>
              {t("yourComplete")}
            </RevealText>
            <br />
            <span className="bg-gradient-to-r from-atp-gold via-yellow-400 to-orange-500 bg-clip-text text-transparent">
              <RevealText mode="words" delay={0.4}>
                {t("wellnessJourney")}
              </RevealText>
            </span>
          </h2>

          <p className="text-xl text-atp-white/70 max-w-4xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </m.div>

        {/* Service navigation with TabsWithIndicator */}
        <m.div
          className="flex justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
        >
          <TabsWithIndicator
            tabs={serviceTabs}
            activeTab={currentService.id}
            onTabChange={handleTabChange}
            layoutId="service-tabs"
            className="glass border border-white/10"
          />
        </m.div>

        {/* Active service showcase */}
        <m.div
          key={activeService}
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Service content */}
            <div className="space-y-8">
              <div>
                {currentService.badge && (
                  <Badge
                    className={`bg-gradient-to-r ${currentService.gradient} text-white mb-4 border-0`}
                  >
                    {currentService.badge}
                  </Badge>
                )}

                <h3 className="text-4xl md:text-5xl font-light text-white mb-4">
                  {currentService.title}
                </h3>

                <p className="text-xl text-atp-gold font-medium mb-6">
                  {currentService.subtitle}
                </p>

                <p className="text-atp-white/80 text-lg leading-relaxed mb-8">
                  {currentService.description}
                </p>
              </div>

              {/* Benefits list with stagger animation */}
              <m.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <h4 className="text-xl font-semibold text-white mb-4">
                  {t("whatYouGet")}
                </h4>
                {currentService.benefits.map((benefit, index) => (
                  <m.div
                    key={index}
                    className="flex items-center gap-3"
                    variants={itemVariants}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-atp-white/80">{benefit}</span>
                  </m.div>
                ))}
              </m.div>

              {/* CTA */}
              <Link href={`/${locale}${currentService.link}`}>
                <Button
                  size="lg"
                  className={`bg-gradient-to-r ${currentService.gradient} text-white hover:shadow-lg hover:shadow-current/25 transition-all duration-300 group border-0`}
                >
                  {t("explore")} {currentService.title}
                  <ArrowRight className="w-5 h-5 ms-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Service image and testimonial */}
            <div className="space-y-8">
              {/* Image with parallax or comparison slider */}
              {currentService.hasComparison && currentService.beforeImage && currentService.afterImage ? (
                <ComparisonSlider
                  beforeImage={currentService.beforeImage}
                  afterImage={currentService.afterImage}
                  beforeAlt="Before EMS training"
                  afterAlt="After EMS training"
                  className="rounded-3xl shadow-2xl"
                />
              ) : (
                <m.div
                  className="relative h-96 rounded-3xl overflow-hidden shadow-2xl"
                  style={parallax.style}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  transition={transitions.normal}
                >
                  <Image
                    src={currentService.image}
                    alt={currentService.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${currentService.gradient} opacity-20`}
                  />
                </m.div>
              )}


            </div>
          </div>
        </m.div>


      </div>
    </section>
  );
}

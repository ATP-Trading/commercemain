"use client";

import * as m from "framer-motion/m";
import { useTranslations } from "next-intl";
import { useRTL } from "@/hooks/use-rtl";
import {
  containerSlowVariants,
  fadeUpVariants,
  scaleVariants,
  transitions,
  easing
} from "@/lib/animations/variants";

interface Milestone {
  year: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
}

const milestones: Milestone[] = [
  {
    year: "2010",
    title: "Founded in Dubai",
    titleAr: "تأسست في دبي",
    description: "ATP Trading was established with a vision to bring premium wellness solutions to the UAE market.",
    descriptionAr: "تأسست ATP Trading برؤية لجلب حلول العافية المتميزة إلى سوق الإمارات.",
  },
  {
    year: "2013",
    title: "Thai Wellness Partnership",
    titleAr: "شراكة العافية التايلاندية",
    description: "Partnered with Thailand's finest natural cosmetics and supplement manufacturers for authentic products.",
    descriptionAr: "شراكة مع أفضل مصنعي مستحضرات التجميل والمكملات الطبيعية في تايلاند.",
  },
  {
    year: "2016",
    title: "EMS Germany Launch",
    titleAr: "إطلاق EMS ألمانيا",
    description: "Introduced German-engineered EMS training technology, revolutionizing fitness in the region.",
    descriptionAr: "قدمنا تقنية تدريب EMS الألمانية، مما أحدث ثورة في اللياقة البدنية في المنطقة.",
  },
  {
    year: "2019",
    title: "UAE Flagship Store",
    titleAr: "المتجر الرئيسي في الإمارات",
    description: "Opened our premium flagship wellness center in Dubai Business Bay.",
    descriptionAr: "افتتحنا مركز العافية الرئيسي المتميز في خليج الأعمال بدبي.",
  },
  {
    year: "2022",
    title: "ATP Membership Program",
    titleAr: "برنامج عضوية ATP",
    description: "Launched exclusive ATP Membership with premium benefits, discounts, and personalized wellness journeys.",
    descriptionAr: "أطلقنا عضوية ATP الحصرية مع مزايا متميزة وخصومات ورحلات عافية مخصصة.",
  },
  {
    year: "2024",
    title: "Digital Transformation",
    titleAr: "التحول الرقمي",
    description: "Expanded online presence with award-winning e-commerce platform and AI-powered wellness recommendations.",
    descriptionAr: "توسعنا في الحضور عبر الإنترنت مع منصة تجارة إلكترونية حائزة على جوائز.",
  },
];

export function AboutTimeline() {
  const t = useTranslations("common");
  const { isRTL } = useRTL();

  const timelineVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const milestoneVariants = {
    hidden: {
      opacity: 0,
      x: 50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: easing.smooth,
      },
    },
  };

  const milestoneVariantsAlt = {
    hidden: {
      opacity: 0,
      x: -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: easing.smooth,
      },
    },
  };

  return (
    <section className="section-padding bg-atp-white overflow-hidden">
      <div className="container-premium">
        {/* Section Header */}
        <m.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariants}
        >
          <h2
            className={`text-4xl md:text-5xl font-serif text-atp-black mb-4 ${isRTL ? "font-arabic" : ""
              }`}
          >
            {isRTL ? "رحلتنا" : "Our Journey"}
          </h2>
          <p
            className={`text-lg text-atp-charcoal max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""
              }`}
          >
            {isRTL
              ? "من رؤية متواضعة إلى علامة العافية الرائدة في الإمارات"
              : "From a humble vision to the UAE's leading wellness brand"}
          </p>
        </m.div>

        {/* Timeline */}
        <m.div
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={timelineVariants}
        >
          {/* Vertical Line */}
          <div
            className={`absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-atp-gold via-atp-gold to-transparent hidden lg:block ${isRTL ? "right-1/2 translate-x-1/2" : "left-1/2 -translate-x-1/2"
              }`}
          />

          {/* Milestones */}
          <div className="space-y-12 lg:space-y-0">
            {milestones.map((milestone, index) => {
              const isEven = index % 2 === 0;
              // In RTL, we flip the alternation
              const showOnLeft = isRTL ? !isEven : isEven;

              return (
                <m.div
                  key={milestone.year}
                  className={`relative lg:flex lg:items-center ${index !== milestones.length - 1 ? "lg:mb-16" : ""
                    }`}
                  variants={showOnLeft ? milestoneVariantsAlt : milestoneVariants}
                >
                  {/* Desktop Layout */}
                  <div className="hidden lg:flex w-full items-center">
                    {/* Left Side */}
                    <div className={`w-1/2 ${showOnLeft ? "pr-12" : ""}`}>
                      {showOnLeft && (
                        <div className={`${isRTL ? "text-left" : "text-right"}`}>
                          <MilestoneCard milestone={milestone} isRTL={isRTL} />
                        </div>
                      )}
                    </div>

                    {/* Center Dot */}
                    <div className="absolute left-1/2 -translate-x-1/2 z-10">
                      <m.div
                        className="w-5 h-5 rounded-full bg-atp-gold border-4 border-atp-white shadow-lg"
                        whileHover={{ scale: 1.3 }}
                        transition={transitions.fast}
                      />
                    </div>

                    {/* Right Side */}
                    <div className={`w-1/2 ${!showOnLeft ? "pl-12" : ""}`}>
                      {!showOnLeft && (
                        <div className={`${isRTL ? "text-right" : "text-left"}`}>
                          <MilestoneCard milestone={milestone} isRTL={isRTL} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="lg:hidden">
                    <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                      {/* Dot */}
                      <div className="flex-shrink-0 mt-2">
                        <div className="w-4 h-4 rounded-full bg-atp-gold border-2 border-atp-white shadow-md" />
                      </div>
                      {/* Card */}
                      <div className="flex-1">
                        <MilestoneCard milestone={milestone} isRTL={isRTL} />
                      </div>
                    </div>
                  </div>
                </m.div>
              );
            })}
          </div>
        </m.div>
      </div>
    </section>
  );
}

function MilestoneCard({ milestone, isRTL }: { milestone: Milestone; isRTL: boolean }) {
  return (
    <m.div
      className="bg-gradient-to-br from-atp-white to-atp-off-white p-6 rounded-2xl shadow-xl border border-atp-light-gray"
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(179, 145, 85, 0.15)" }}
      transition={transitions.normal}
    >
      {/* Year Badge */}
      <div
        className={`inline-flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""
          }`}
      >
        <span className="text-2xl font-serif font-bold text-atp-gold">
          {milestone.year}
        </span>
        <div className="h-px w-8 bg-atp-gold" />
      </div>

      {/* Title */}
      <h3
        className={`text-xl font-serif text-atp-black mb-2 ${isRTL ? "font-arabic text-right" : ""
          }`}
      >
        {isRTL ? milestone.titleAr : milestone.title}
      </h3>

      {/* Description */}
      <p
        className={`text-atp-charcoal leading-relaxed ${isRTL ? "font-arabic text-right" : ""
          }`}
      >
        {isRTL ? milestone.descriptionAr : milestone.description}
      </p>
    </m.div>
  );
}

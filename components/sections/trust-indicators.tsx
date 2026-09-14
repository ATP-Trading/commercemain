"use client";

import { m } from "framer-motion";
import { type Locale } from "@/lib/i18n/config";
import { DirhamSymbol } from "@/components/icons/dirham-symbol";

interface TrustIndicatorsProps {
  locale: Locale;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

export default function TrustIndicators({ locale }: TrustIndicatorsProps) {
  // Lab testing statement confirmed by the store owner, who holds supporting evidence.
  const trustFeatures = [
    {
      icon: "M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 006 21h12a1.7 1.7 0 001.5-2.5L14 9V3M8 14h8",
      title: locale === "ar" ? "مفحوصة مخبريًا" : "Lab Tested",
      description: "",
      showSymbol: false,
    },
    {
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
      title: locale === "ar" ? "شحن مجاني" : "Free shipping",
      description: locale === "ar" ? "من 250.00 داخل الإمارات" : "From 250.00 within the UAE",
      showSymbol: true,
    },
    {
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      title: locale === "ar" ? "دعم العملاء" : "Customer Support",
      description:
        locale === "ar" ? "نحب خدمة عملائنا" : "We Love To Serve Our Customers",
      showSymbol: false,
    },
    {
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 003 3z",
      title: locale === "ar" ? "دفع آمن" : "Secure payment",
      description: locale === "ar" ? "الدفع عبر Shopify" : "Checkout powered by Shopify",
      showSymbol: false,
    },
  ];

  return (
    <m.section
      className="section-padding bg-atp-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
    >
      <div className="container-premium">
        <m.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12"
          variants={staggerContainer}
        >
          {trustFeatures.map((feature, index) => (
            <m.div key={index} className="text-center" variants={fadeInUp}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-atp-gold/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 flex-shrink-0">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-atp-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={feature.icon}
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-atp-black mb-2 text-base sm:text-lg">
                {feature.title}
              </h3>
              {feature.showSymbol ? (
                <p className="text-atp-charcoal/70 flex flex-wrap items-center gap-1 justify-center text-sm sm:text-base">
                  {locale === "ar" ? (
                    <>
                      من <DirhamSymbol size={16} /> 250 داخل الإمارات
                    </>
                  ) : (
                    <>
                      From <DirhamSymbol size={16} /> 250 within the UAE
                    </>
                  )}
                </p>
              ) : feature.description ? (
                <p className="text-atp-charcoal/70 text-sm sm:text-base">{feature.description}</p>
              ) : null}
            </m.div>
          ))}
        </m.div>
      </div>
    </m.section>
  );
}

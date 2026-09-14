"use client";

import * as m from "framer-motion/m";
import { useTranslations } from "next-intl";
import { useRTL } from "@/hooks/use-rtl";

export function AboutCTA() {
    const t = useTranslations("common");
    const { isRTL } = useRTL();

    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" as const },
        },
    };

    return (
        <section className="section-padding bg-atp-light-gray">
            <div className="container-premium">
                <m.div
                    className="text-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeInUp}
                >
                    <h2
                        className={`text-4xl md:text-5xl font-serif text-atp-black mb-8 ${isRTL ? "font-arabic" : ""
                            }`}
                    >
                        {isRTL ? "تصفح منتجات ATP Trading" : "Explore ATP Trading products"}
                    </h2>
                    <p
                        className={`text-xl text-atp-charcoal mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""
                            }`}
                    >
                        {isRTL ? "تواصل معنا للاستفسار عن منتجاتنا المتاحة داخل الإمارات." : "Contact us about our products available within the UAE."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <m.a
                            href={isRTL ? "/ar/atp-membership" : "/en/atp-membership"}
                            className="btn-atp-gold text-lg px-8 py-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isRTL ? "استكشف عضوية ATP" : "Explore ATP Membership"}
                        </m.a>
                        <m.a
                            href={isRTL ? "/ar/contact" : "/en/contact"}
                            className="btn-premium-outline text-atp-black border-atp-black hover:bg-atp-black hover:text-atp-white text-lg px-8 py-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isRTL ? "تواصل معنا" : "Contact us"}
                        </m.a>
                    </div>
                </m.div>
            </div>
        </section>
    );
}

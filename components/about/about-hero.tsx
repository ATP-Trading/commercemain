"use client";

import * as m from "framer-motion/m";
import { useTranslations } from "next-intl";
import { useRTL } from "@/hooks/use-rtl";

export function AboutHero() {
    const t = useTranslations("common"); // Adjust namespace if needed
    const { isRTL } = useRTL();

    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" as const },
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

    return (
        <section className="relative bg-gradient-to-br from-atp-black via-atp-charcoal to-atp-black py-24 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <div className="relative z-10 container-premium">
                <m.div
                    className="text-center"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <m.h1
                        className={`text-5xl md:text-6xl lg:text-7xl font-serif text-atp-white mb-6 tracking-tight ${isRTL ? "font-arabic" : ""
                            }`}
                        variants={fadeInUp}
                    >
                        {isRTL ? "عن ATP Trading" : "About ATP Trading"}
                    </m.h1>
                    <m.p
                        className={`text-xl md:text-2xl text-atp-off-white max-w-4xl mx-auto leading-relaxed ${isRTL ? "font-arabic" : ""
                            }`}
                        variants={fadeInUp}
                    >
                        {isRTL ? "منتجات العناية بالبشرة والمكملات وتقنيات المياه والتربة داخل الإمارات." : "Skincare, supplements, and water and soil technology products within the UAE."}
                    </m.p>
                </m.div>
            </div>
        </section>
    );
}

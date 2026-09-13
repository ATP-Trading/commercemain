"use client";

import { m, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Leaf,
  Heart,
  Dumbbell,
  Zap,
  Users,
  Award,
  Sparkles,
  Globe,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/src/i18n/navigation";
import Image from "next/image";

interface WellnessService {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  image: string;
  link: string;
  gradient: string;
  stats?: {
    value: string;
    label: string;
  };
}

export default function WellnessFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const wellnessServices: WellnessService[] = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Natural Supplements",
      description:
        "Premium Thai wellness formulations crafted with ancient wisdom and modern science",
      features: [
        "Organic herbal extracts",
        "Traditional Thai formulas",
        "Laboratory tested purity",
        "Sustainable sourcing",
      ],
      image: "/supplements-thai.jpg",
      link: "/skincare-supplements",
      gradient: "from-emerald-500 to-green-600",
      stats: { value: "500+", label: "Natural Ingredients" },
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Advanced Beauty Care",
      description:
        "Revolutionary skincare solutions combining Thai botanicals with German precision",
      features: [
        "Anti-aging serums",
        "Natural moisturizers",
        "UV protection formulas",
        "Personalized treatments",
      ],
      image: "/anti-aging-serum.png",
      link: "/skincare-supplements",
      gradient: "from-rose-500 to-pink-600",
      stats: { value: "95%", label: "Customer Satisfaction" },
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "EMS Training Sessions",
      description:
        "Revolutionary Electrical Muscle Stimulation training - German precision technology for maximum fitness efficiency in minimal time",
      features: [
        "20-minute full-body workout sessions",
        "Professional certified trainer supervision",
        "Customized intensity levels for all fitness levels",
        "Achieve 3x faster muscle development results",
      ],
      image: "/ems-training-facility.png",
      link: "/ems",
      gradient: "from-orange-500 to-red-600",
      stats: { value: "300%", label: "Faster Results" },
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.42, 0, 0.58, 1] as const, // easeOut bezier curve
      },
    },
  };

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-b from-atp-black via-atp-charcoal to-atp-black relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-atp-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <m.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <m.div
            className="inline-flex items-center space-x-2 bg-atp-gold/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-5 h-5 text-atp-gold" />
            <span className="text-atp-gold font-medium">
              Premium Wellness Services
            </span>
          </m.div>

          <h2 className="text-4xl md:text-6xl font-light text-white mb-6">
            Where{" "}
            <span className="bg-gradient-to-r from-atp-gold to-yellow-400 bg-clip-text text-transparent">
              Thai Tradition
            </span>
            <br />
            Meets{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              German Innovation
            </span>
          </h2>

          <p className="text-xl text-atp-white/70 max-w-3xl mx-auto leading-relaxed">
            Experience the perfect fusion of ancient Thai wellness wisdom and
            cutting-edge German fitness technology, designed to transform your
            health and lifestyle journey.
          </p>
        </m.div>

        {/* Services grid */}
        <m.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {wellnessServices.map((service, index) => (
            <m.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden h-full hover:border-atp-gold/50 transition-all duration-500">
                <CardContent className="p-0">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-atp-black/80 via-transparent to-transparent" />

                    {/* Service icon */}
                    <div className="absolute top-6 left-6">
                      <div
                        className={`p-3 rounded-full bg-gradient-to-r ${service.gradient} shadow-lg`}
                      >
                        {service.icon}
                      </div>
                    </div>

                    {/* Stats badge */}
                    {service.stats && (
                      <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                        <div className="text-atp-gold font-bold text-lg">
                          {service.stats.value}
                        </div>
                        <div className="text-white/70 text-xs">
                          {service.stats.label}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-atp-gold transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-atp-white/70 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, featureIndex) => (
                        <m.li
                          key={featureIndex}
                          className="flex items-center space-x-3 text-atp-white/80"
                          initial={{ opacity: 0, x: -20 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 0.1 * featureIndex }}
                        >
                          <div
                            className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.gradient}`}
                          />
                          <span className="text-sm">{feature}</span>
                        </m.li>
                      ))}
                    </ul>

                    <Link href={service.link}>
                      <Button
                        className={`w-full bg-gradient-to-r ${service.gradient} text-white hover:shadow-lg hover:shadow-current/25 transition-all duration-300`}
                        size="lg"
                      >
                        Explore {service.title}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          ))}
        </m.div>

        {/* Trust indicators */}
        <m.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            {
              icon: <Shield className="w-8 h-8" />,
              title: "Certified Quality",
              subtitle: "ISO Standards",
            },
            {
              icon: <Award className="w-8 h-8" />,
              title: "Award Winning",
              subtitle: "Excellence in Wellness",
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "10,000+",
              subtitle: "Happy Members",
            },
            {
              icon: <Globe className="w-8 h-8" />,
              title: "Global Reach",
              subtitle: "Worldwide Shipping",
            },
          ].map((indicator, index) => (
            <m.div
              key={index}
              className="group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-atp-gold/50 transition-all duration-300">
                <div className="text-atp-gold mb-4 flex justify-center group-hover:scale-110 transition-transform">
                  {indicator.icon}
                </div>
                <h4 className="text-white font-semibold mb-2">
                  {indicator.title}
                </h4>
                <p className="text-atp-white/60 text-sm">
                  {indicator.subtitle}
                </p>
              </div>
            </m.div>
          ))}
        </m.div>

        {/* CTA section */}
        <m.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-atp-gold/10 via-purple-500/10 to-atp-gold/10 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Clock className="w-6 h-6 text-atp-gold" />
              <span className="text-atp-gold font-medium">
                Limited Time Offer
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-light text-white mb-4">
              Start Your Wellness Journey Today
            </h3>

            <p className="text-atp-white/70 mb-8 max-w-2xl mx-auto">
              Join ATP Trading and unlock exclusive access to premium
              wellness solutions with special member pricing and benefits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/atp-membership">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-atp-gold to-yellow-500 text-atp-black hover:from-yellow-500 hover:to-atp-gold font-semibold px-8 py-6 rounded-full shadow-2xl hover:shadow-atp-gold/25 transition-all duration-300"
                >
                  Get ATP Membership
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-atp-gold text-atp-gold hover:bg-atp-gold hover:text-atp-black font-semibold px-8 py-6 rounded-full backdrop-blur-sm transition-all duration-300"
                >
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}

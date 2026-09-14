import { AboutHero } from "@/components/about/about-hero";
import { AboutMission } from "@/components/about/about-mission";
import { AboutValues } from "@/components/about/about-values";
import { AboutCTA } from "@/components/about/about-cta";
import { StructuredData } from "@/components/structured-data";

export default function AboutPage() {
  return (
    <div className="bg-atp-white">
      {/* Organization Schema for About page */}
      <StructuredData
        type="Organization"
        data={{
          description: "Learn about ATP Trading - premium wellness and technology solutions including Skincare, Supplements, and Water Technology with exclusive ATP membership benefits in UAE.",
        }}
      />

      {/* Hero Section - Brand introduction */}
      <AboutHero />

      {/* Stats Section - Social proof with animated counters */}

      {/* Mission Section - Our purpose and values */}
      <AboutMission />

      {/* Timeline Section - Brand story and milestones */}

      {/* Values Section - What we stand for */}
      <AboutValues />

      {/* Call to Action - Convert interest to action */}
      <AboutCTA />
    </div>
  );
}

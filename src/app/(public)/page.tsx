import { HeroSection } from "@/components/public/hero-section";
import { AgenticAiSpotlight } from "@/components/public/agentic-ai-spotlight";
import { ClientStrip } from "@/components/public/client-strip";
import { ServicesOverview } from "@/components/public/services-overview";
import { SolutionsOverview } from "@/components/public/solutions-overview";
import { UepHighlight } from "@/components/public/uep-highlight";
import { SaasTkitHighlight } from "@/components/public/saas-toolkit-highlight";
import { IndustriesSection } from "@/components/public/industries-section";
import { ProcessSection } from "@/components/public/process-section";
import { WhyChooseSection } from "@/components/public/why-choose-section";
import { TestimonialsSection } from "@/components/public/testimonials-section";
import { CtaSection } from "@/components/public/cta-section";
import { ContactPreview } from "@/components/public/contact-preview";

export const metadata = {
  title: "Agentic AI Automation & Custom Software Development India | Doomple",
  description:
    "Doomple Technologies builds agentic AI automation, custom software, mobile apps and technology platforms for Indian startups, MSMEs and enterprises.",
  alternates: {
    canonical: "https://doomple.com",
  },
  openGraph: {
    title: "Agentic AI Automation & Custom Software Development | Doomple Technologies India",
    description:
      "Agentic AI automation, custom software development, AI solutions and technology consulting for startups, MSMEs and enterprises. Based in Gurgaon, India.",
    url: "https://doomple.com",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Client trust strip */}
      <ClientStrip />

      {/* Agentic AI Spotlight */}
      <AgenticAiSpotlight />

      {/* Services Overview */}
      <ServicesOverview />

      {/* Solutions Overview */}
      <SolutionsOverview />

      {/* UEP Highlight */}
      <UepHighlight />

      {/* SaaS Toolkit Highlight */}
      <SaasTkitHighlight />

      {/* Industries We Serve */}
      <IndustriesSection />

      {/* How Doomple Works */}
      <ProcessSection />

      {/* Why Choose Doomple */}
      <WhyChooseSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Main CTA */}
      <CtaSection />

      {/* Contact Preview */}
      <ContactPreview />
    </>
  );
}

import { HeroSection } from "@/components/public/hero-section";
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
  title: "Custom Software Development & Technology Consulting India | Doomple",
  description:
    "Doomple Technologies — India's trusted software development and consulting company based in Gurgaon. Custom software, AI solutions, mobile apps and expert technology consulting for startups, MSMEs and enterprises.",
  alternates: {
    canonical: "https://doomple.com",
  },
  openGraph: {
    title: "Custom Software Development & Technology Consulting | Doomple Technologies India",
    description:
      "Custom software development, AI solutions, mobile apps and technology consulting for startups, MSMEs and enterprises. Based in Gurgaon, India — delivering globally.",
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

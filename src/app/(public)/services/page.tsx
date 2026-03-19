import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { services } from "@/data/services";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import * as Icons from "lucide-react";

export const metadata: Metadata = {
  title: "Software Development & IT Consulting Services India | Doomple Technologies",
  description:
    "Explore Doomple's full range of services: custom software development, mobile apps, AI & data analytics, cloud DevOps, legacy modernisation and technology consulting for startups, MSMEs and enterprises across India.",
  alternates: { canonical: "https://doomple.com/services" },
  openGraph: {
    title: "Software Development & IT Consulting Services | Doomple Technologies India",
    description:
      "Custom software, mobile apps, AI solutions, DevOps, data analytics and technology consulting — all under one roof. Serving startups, MSMEs and enterprises.",
    url: "https://doomple.com/services",
    type: "website",
  },
};

const categoryConfig: Record<string, { slugs: string[]; color: string }> = {
  "Custom Development": {
    slugs: ["custom-software-development", "mobile-app-development", "ecommerce-development", "cms-web-platforms", "erp-development"],
    color: "#1ABFAD",
  },
  "AI & Data": {
    slugs: ["ai-chatbots-agents", "data-analytics", "data-engineering", "ai-model-training", "ai-consulting", "ai-data-training"],
    color: "#3BB2F6",
  },
  "Infrastructure & Operations": {
    slugs: ["devops-cloud-infrastructure", "infrastructure-support"],
    color: "#1ABFAD",
  },
  "Consulting & Advisory": {
    slugs: ["technology-consulting", "software-audit", "process-platform-audit", "legacy-modernization"],
    color: "#3BB2F6",
  },
};

function groupServicesByCategory(allServices: typeof services) {
  const result: Array<{ category: string; color: string; items: typeof services }> = [];

  for (const [category, config] of Object.entries(categoryConfig)) {
    const items = config.slugs
      .map((slug) => allServices.find((s) => s.slug === slug))
      .filter(Boolean) as typeof services;
    if (items.length > 0) result.push({ category, color: config.color, items });
  }

  // Any remaining non-marketing services
  const allMapped = Object.values(categoryConfig).flatMap((c) => c.slugs);
  const remaining = allServices.filter(
    (s) => !allMapped.includes(s.slug) && !s.isMarketingOnly
  );
  if (remaining.length > 0) {
    result.push({ category: "Specialised Solutions", color: "#1ABFAD", items: remaining });
  }

  return result;
}

const iconMap: Record<string, any> = {
  Code: Icons.Code, Brain: Icons.Brain, Smartphone: Icons.Smartphone,
  BarChart3: Icons.BarChart3, BarChart2: Icons.BarChart2, ShoppingCart: Icons.ShoppingCart,
  FileText: Icons.FileText, Cloud: Icons.Cloud, Wrench: Icons.Wrench,
  Users: Icons.Users, Megaphone: Icons.Megaphone, Share2: Icons.Share2,
  Zap: Icons.Zap, Rocket: Icons.Rocket, CheckSquare: Icons.CheckSquare,
  TrendingUp: Icons.TrendingUp, Database: Icons.Database, Cpu: Icons.Cpu,
  Lightbulb: Icons.Lightbulb, GraduationCap: Icons.GraduationCap, Briefcase: Icons.Briefcase,
  SearchCode: Icons.SearchCode, ClipboardCheck: Icons.ClipboardCheck, RefreshCw: Icons.RefreshCw,
};

function getIcon(iconName: string) {
  return iconMap[iconName] || Icons.Code;
}

export default function ServicesPage() {
  const grouped = groupServicesByCategory(services);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 sm:py-28" style={{ backgroundColor: "#042042" }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at bottom left, rgba(59,178,246,0.07) 0%, transparent 65%)" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="eyebrow mb-4">What We Do</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
                Software Development &
                <span className="block mt-1" style={{ background: "linear-gradient(135deg, #1ABFAD, #3BB2F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Technology Consulting
                </span>
              </h1>
              <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
                Enterprise-grade software development, AI solutions, cloud infrastructure and
                technology consulting delivered by a senior team in Gurgaon, India, serving
                clients globally.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                  style={{ backgroundColor: "#1ABFAD" }}>
                  Talk to Our Team <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{ border: "1.5px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.8)" }}>
                  View Pricing
                </Link>
              </div>
            </div>

            <div>
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
                <Image
                  src="/images/people/services-consultation.jpg"
                  alt="Two professionals in a live consultation meeting"
                  width={1600}
                  height={2400}
                  className="h-[560px] w-full object-cover object-center"
                />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  "Custom build and product execution",
                  "AI, data, and operational systems",
                  "Infrastructure and advisory support",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border px-4 py-4 text-sm leading-6"
                    style={{ backgroundColor: "rgba(255,239,225,0.12)", borderColor: "rgba(255,216,181,0.18)", color: "rgba(255,255,255,0.76)" }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Sections ── */}
      {grouped.map(({ category, color, items }, catIdx) => (
        <section
          key={category}
          className="py-16 sm:py-20"
          style={{ backgroundColor: catIdx % 2 === 0 ? "#FFFFFF" : "#FFF8F1", borderTop: "1px solid #EADACB" }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Category header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-0.5 w-6 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
                    {category}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#042042]">{category}</h2>
              </div>
              {category === "AI & Data" && (
                <Link href="/ai-data"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors shrink-0"
                  style={{ color: "#1ABFAD" }}>
                  View AI & Data hub <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Service cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((service) => {
                const Icon = getIcon(service.icon);
                return (
                  <Link key={service.slug} href={`/services/${service.slug}`} className="group">
                    <div
                      className="h-full bg-white rounded-[22px] p-6 transition-all duration-200 hover:shadow-[0_18px_40px_rgba(4,32,66,0.10)] hover:-translate-y-0.5 flex flex-col"
                      style={{ border: "1px solid #EADACB" }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <h3 className="text-base font-semibold text-[#042042] mb-2 leading-snug group-hover:text-[#1ABFAD] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed flex-1 mb-4">
                        {service.shortDescription}
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors" style={{ color }}>
                        Learn more <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* ── CTA ── */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #042042 0%, #0A2C54 52%, #0D4B68 100%)" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Let's Build Together</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Not Sure Which Service You Need?
          </h2>
          <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            Tell us your challenge — we'll map the right solution, tech stack and engagement model for your specific situation.
          </p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
            style={{ backgroundColor: "#1ABFAD" }}>
            Schedule a Free Consultation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

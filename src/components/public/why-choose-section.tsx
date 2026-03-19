import Link from "next/link";
import { SectionWrapper } from "@/components/layouts";
import {
  Shield,
  Layers,
  TrendingUp,
  Users,
  Headphones,
  BadgeIndianRupee,
} from "lucide-react";

export function WhyChooseSection() {
  const reasons = [
    {
      icon: Shield,
      title: "Truly Independent Advice",
      description: "No vendor partnerships, no commissions — just what's right for your business.",
    },
    {
      icon: Layers,
      title: "Builders, Not Just Consultants",
      description: "We've shipped production software across 8+ industries. Real experience, not theory.",
    },
    {
      icon: TrendingUp,
      title: "End-to-End Ownership",
      description: "Strategy through DevOps, under one roof — continuity from day one to post-launch.",
    },
    {
      icon: Users,
      title: "Right-Sized for Every Stage",
      description: "From 5-person startups to 5,000-person enterprises — scoped to your pace and budget.",
    },
    {
      icon: BadgeIndianRupee,
      title: "Transparent, Predictable Pricing",
      description: "Fixed-price, milestone or retainer — clear costs, zero hidden fees.",
    },
    {
      icon: Headphones,
      title: "Partnership Beyond Launch",
      description: "Ongoing support and feature development after go-live — we grow with you.",
    },
  ];

  const stats = [
    { value: "100+", label: "Projects delivered" },
    { value: "50+", label: "Clients in 6 countries" },
    { value: "8+", label: "Industry verticals" },
    { value: "< 24 hrs", label: "Initial response time" },
  ];

  return (
    <SectionWrapper id="why-choose" background="gray" padding="lg">
      {/* Section header */}
      <div className="mb-10">
        <p className="eyebrow mb-3">Why Doomple</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] max-w-xl leading-tight">
            Why Businesses Choose Doomple
          </h2>
          <Link
            href="/consulting"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1ABFAD] hover:text-[#15a89a] transition-colors shrink-0"
          >
            Book a free discovery call →
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {reasons.map((reason, idx) => {
          const Icon = reason.icon;
          return (
            <div
              key={idx}
              className="group bg-white rounded-xl p-6 transition-all duration-200 hover:shadow-md"
              style={{
                border: "1px solid #E5E7EB",
                borderLeft: "4px solid #1ABFAD",
              }}
            >
              <div className="mb-3 w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                <Icon className="w-5 h-5" style={{ color: "#1ABFAD" }} />
              </div>
              <h3 className="text-sm font-semibold text-[#042042] mb-1.5 leading-snug">
                {reason.title}
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {reason.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-xl overflow-hidden" style={{ backgroundColor: "#042042" }}>
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="py-7 px-6 text-center"
            style={{ borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : undefined }}
          >
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

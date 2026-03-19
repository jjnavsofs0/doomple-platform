import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Calendar, Users, Headphones, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Engagement Models & Pricing | Doomple Technologies India",
  description:
    "Flexible, transparent engagement models for every business size — fixed-price, milestone-based, dedicated team, monthly retainer and startup packages. No hidden fees. Based in Gurgaon, India.",
  alternates: { canonical: "https://doomple.com/pricing" },
  openGraph: {
    title: "Transparent Engagement Models & Pricing | Doomple Technologies",
    description:
      "Fixed-price, dedicated team, retainer and startup packages — choose the engagement model that fits your project and budget.",
    url: "https://doomple.com/pricing",
    type: "website",
  },
};

const primaryModels = [
  {
    name: "Project-Based",
    icon: Zap,
    description: "Fixed scope with defined deliverables, timeline and price agreed upfront.",
    idealFor: "Well-defined projects with clear requirements",
    benefits: ["Predictable costs — no surprises", "Fixed timeline with milestones", "Clear deliverables & handover", "Minimal ongoing coordination"],
    approach: "Detailed requirements gathering → fixed-price quote → milestone-based delivery",
    highlight: false,
  },
  {
    name: "Dedicated Team",
    icon: Users,
    description: "A full-time senior team integrated into your organisation — long-term partnership.",
    idealFor: "Product development, scaling efforts, and ongoing digital transformation",
    benefits: ["Deep product knowledge over time", "Consistent, predictable delivery", "Full engineering ownership", "Strategic technology partnership"],
    approach: "Team assembly → onboarding → sprint-based ongoing delivery",
    highlight: true,
  },
  {
    name: "Monthly Retainer",
    icon: Calendar,
    description: "Fixed monthly fee for committed capacity — ongoing development and support.",
    idealFor: "Continuous product enhancement and feature development",
    benefits: ["Predictable monthly cost", "Dedicated, committed capacity", "Priority support SLA", "Flexible sprint priorities"],
    approach: "Committed team capacity → sprint-based planning → monthly review",
    highlight: false,
  },
];

const additionalModels = [
  {
    name: "Milestone-Based",
    desc: "Payments tied to achievement of defined milestones. Ideal for large phased projects.",
    idealFor: "Large multi-phase projects",
  },
  {
    name: "Fixed Scope",
    desc: "Dedicated budget for specific features or modules within a larger product.",
    idealFor: "Building specific features",
  },
  {
    name: "DevOps Retainer",
    desc: "Ongoing infrastructure management, monitoring, security and optimisation.",
    idealFor: "Production infrastructure",
  },
  {
    name: "Startup Package",
    desc: "Comprehensive MVP development at a startup-friendly budget and timeline.",
    idealFor: "First-time product builders",
  },
  {
    name: "UEP Package",
    desc: "Unified Education Platform implementation — deploy in weeks, not months.",
    idealFor: "Educational institutions",
  },
  {
    name: "Consultation",
    desc: "Expert technology strategy sessions, architecture reviews and technology roadmaps.",
    idealFor: "Decision-making & planning",
  },
];

const workSteps = [
  { step: "01", title: "Discovery", desc: "Understand your requirements, goals, and constraints through structured discovery workshops." },
  { step: "02", title: "Proposal", desc: "Present a tailored engagement model with timeline, deliverables and investment breakdown." },
  { step: "03", title: "Kickoff", desc: "Assemble the right team, align on processes and begin execution with full transparency." },
  { step: "04", title: "Delivery", desc: "Sprint-based delivery with regular demos, milestones and continuous communication." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 sm:py-28" style={{ backgroundColor: "#042042" }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 65%)" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Flexible Engagements</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
            Engagement Models
            <span className="block mt-1 text-3xl sm:text-4xl font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
              Built Around Your Project
            </span>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
            Not a fixed price list — because every project is unique. We offer transparent, flexible engagement models that fit your requirements, timeline and budget.
          </p>
        </div>
      </section>

      {/* ── Trust signals ── */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: Clock, label: "24-hr initial response" },
              { icon: Shield, label: "No hidden fees, ever" },
              { icon: Users, label: "Senior engineers only" },
              { icon: Headphones, label: "Dedicated point of contact" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: "#1ABFAD" }} />
                <span className="text-sm font-medium text-[#374151]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Primary Models ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="eyebrow mb-3">Most Popular</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#042042]">Primary Engagement Models</h2>
            <p className="mt-3 text-[#6B7280] max-w-2xl">
              Three core engagement models that cover the vast majority of client needs — choose the structure that best fits your project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {primaryModels.map((model) => {
              const Icon = model.icon;
              return (
                <div key={model.name}
                  className="relative flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
                  style={model.highlight
                    ? { backgroundColor: "#042042", border: "1px solid rgba(26,191,173,0.3)" }
                    : { backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB" }
                  }>
                  {model.highlight && (
                    <div className="h-1" style={{ background: "linear-gradient(90deg, #1ABFAD, #3BB2F6)" }} />
                  )}
                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: model.highlight ? "rgba(26,191,173,0.15)" : "rgba(26,191,173,0.1)" }}>
                        <Icon className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                      </div>
                      {model.highlight && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(26,191,173,0.15)", color: "#1ABFAD" }}>
                          Most Popular
                        </span>
                      )}
                    </div>

                    <h3 className={`text-xl font-bold mb-2 ${model.highlight ? "text-white" : "text-[#042042]"}`}>
                      {model.name}
                    </h3>
                    <p className={`text-sm leading-relaxed mb-4 ${model.highlight ? "text-white/60" : "text-[#6B7280]"}`}>
                      {model.description}
                    </p>

                    <div className="rounded-lg px-4 py-3 mb-5"
                      style={model.highlight
                        ? { backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }
                        : { backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }
                      }>
                      <p className={`text-xs font-semibold mb-0.5 ${model.highlight ? "text-white/40" : "text-[#6B7280]"}`}>
                        IDEAL FOR
                      </p>
                      <p className={`text-sm ${model.highlight ? "text-white/70" : "text-[#374151]"}`}>
                        {model.idealFor}
                      </p>
                    </div>

                    <ul className="space-y-2 mb-6 flex-1">
                      {model.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1ABFAD" }} />
                          <span className={`text-sm ${model.highlight ? "text-white/70" : "text-[#374151]"}`}>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={`text-xs leading-relaxed pt-4 ${model.highlight ? "text-white/35 border-white/10" : "text-[#9CA3AF] border-[#E5E7EB]"}`}
                      style={{ borderTop: "1px solid" }}>
                      {model.approach}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Additional Models ── */}
      <section className="py-16 sm:py-20 bg-white" style={{ borderTop: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="eyebrow mb-3">All Options</p>
            <h2 className="text-3xl font-bold text-[#042042]">Specialised Engagement Models</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {additionalModels.map((model) => (
              <div key={model.name}
                className="bg-white rounded-xl p-6 hover:shadow-sm transition-all duration-200"
                style={{ border: "1px solid #E5E7EB" }}>
                <h3 className="text-base font-bold text-[#042042] mb-2">{model.name}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-3">{model.desc}</p>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(26,191,173,0.1)", color: "#1ABFAD" }}>
                  {model.idealFor}
                </div>
              </div>
            ))}
          </div>

          {/* Custom CTA */}
          <div className="mt-10 rounded-xl p-8 text-center" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
            <h3 className="text-xl font-bold text-[#042042] mb-2">Not Seeing the Right Model?</h3>
            <p className="text-[#6B7280] text-sm mb-5 max-w-xl mx-auto">
              We're flexible. If none of the above exactly fit your situation, we'll work with you to design a custom engagement model that does.
            </p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{ backgroundColor: "#042042" }}>
              Discuss Your Project <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How We Work ── */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Our Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#042042]">How We Work</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workSteps.map((step, idx) => (
              <div key={step.step} className="relative">
                {idx < workSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px z-0"
                    style={{ background: "linear-gradient(90deg, #E5E7EB, transparent)" }} />
                )}
                <div className="relative z-10 bg-white rounded-xl p-6" style={{ border: "1px solid #E5E7EB" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 text-sm font-bold text-white"
                    style={{ backgroundColor: "#042042" }}>
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold text-[#042042] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ backgroundColor: "#042042" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Get Started</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            Let's discuss which engagement model works best for your project — no commitment required for the initial call.
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

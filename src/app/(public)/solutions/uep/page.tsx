import { Metadata } from "next";
import Link from "next/link";
import { solutions } from "@/data/solutions";
import { uepModules } from "@/data/uep-modules";
import { ArrowRight, CheckCircle2, Zap, Users, ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";

export const metadata: Metadata = {
  title: "Unified Education Platform (UEP) | Doomple Technologies",
  description:
    "Transform education with Doomple's Unified Education Platform — 14 integrated modules for digital learning, assessment, student information and collaboration. Deployed in 3–6 months.",
  alternates: { canonical: "https://doomple.com/solutions/uep" },
  openGraph: {
    title: "Unified Education Platform (UEP) | Doomple Technologies",
    description:
      "Comprehensive platform for educational institutions with LMS, assessments, SIS and collaboration tools — deployed 40% faster than a custom build.",
    url: "https://doomple.com/solutions/uep",
    type: "website",
  },
};

function getModuleIcon(iconName: string) {
  const iconMap: Record<string, any> = {
    BookOpen: Icons.BookOpen,
    FileCheck: Icons.FileCheck,
    Users: Icons.Users,
    Brain: Icons.Brain,
    Database: Icons.Database,
    Code: Icons.Code,
    Share2: Icons.Share2,
    Image: Icons.Image,
    BookPlus: Icons.BookPlus,
    Trophy: Icons.Trophy,
    BarChart3: Icons.BarChart3,
    Video: Icons.Video,
    Shield: Icons.Shield,
    CheckCircle: Icons.CheckCircle,
  };
  return iconMap[iconName] || Icons.Code;
}

const stats = [
  { value: "14", label: "Integrated Modules" },
  { value: "100+", label: "Features & Capabilities" },
  { value: "3–6 mo", label: "Full Implementation" },
  { value: "40%", label: "Faster Than Custom Build" },
];

const benefits = [
  {
    title: "Unified System of Record",
    body: "Single source of truth for all educational data — no more silos or manual reconciliation.",
  },
  {
    title: "Exceptional Student Experience",
    body: "Intuitive interfaces make it easy for students to access courses, submit work, and engage.",
  },
  {
    title: "Educator Empowerment",
    body: "Powerful tools for content delivery, assessment, and analytics to teach more effectively.",
  },
  {
    title: "Data-Driven Decisions",
    body: "Comprehensive analytics reveal learning patterns and identify at-risk students early.",
  },
  {
    title: "Flexible Pedagogies",
    body: "Support for traditional, online, blended, and competency-based learning models.",
  },
  {
    title: "Built-In Integrity",
    body: "Advanced proctoring and anti-cheating measures ensure assessment validity.",
  },
];

const timeline = [
  { phase: "Weeks 1–4", label: "Discovery & Setup" },
  { phase: "Weeks 5–12", label: "Configuration & Customisation" },
  { phase: "Weeks 13–16", label: "Training & Pilot" },
  { phase: "Weeks 17–26", label: "Rollout & Optimisation" },
];

export default function UepPage() {
  const uepSolution = solutions.find((s) => s.slug === "uep");
  if (!uepSolution) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ backgroundColor: "#042042" }}
      >
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, rgba(59,178,246,0.07) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-sm mb-8"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/solutions" className="hover:text-white transition-colors">Solutions</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: "#1ABFAD" }}>UEP</span>
          </div>

          <div className="max-w-3xl">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{
                backgroundColor: "rgba(26,191,173,0.15)",
                color: "#1ABFAD",
                border: "1px solid rgba(26,191,173,0.3)",
              }}
            >
              Flagship Solution — Education
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
              Unified Education
              <span
                className="block mt-1"
                style={{
                  background: "linear-gradient(135deg, #1ABFAD, #3BB2F6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Platform
              </span>
            </h1>
            <p
              className="text-base sm:text-lg leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              A complete digital transformation platform unifying learning management,
              assessments, student information, and collaboration — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact?solution=uep"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                style={{ backgroundColor: "#1ABFAD" }}
              >
                Schedule a Demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  border: "1.5px solid rgba(255,255,255,0.22)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-white" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="py-8 px-6 text-center"
                style={{
                  borderRight:
                    i < stats.length - 1 ? "1px solid #E5E7EB" : undefined,
                }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#042042" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-[#6B7280]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
        {/* ── Who It's For ── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow mb-2">Target Audience</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#042042]">
              Who UEP Is For
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {uepSolution.targetCustomers.map((customer, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 flex items-start gap-4"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(26,191,173,0.1)" }}
                >
                  <Users className="w-4 h-4" style={{ color: "#1ABFAD" }} />
                </div>
                <p className="text-sm font-semibold text-[#042042] leading-snug mt-0.5">
                  {customer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Modules ── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow mb-2">Platform Capabilities</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#042042] mb-2">
              14 Integrated Modules
            </h2>
            <p className="text-[#6B7280] text-sm sm:text-base max-w-2xl">
              Every module is designed to work seamlessly with others, creating a
              unified ecosystem for education.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {uepModules.map((module, idx) => {
              const Icon = getModuleIcon(module.icon);
              const color = idx % 2 === 0 ? "#1ABFAD" : "#3BB2F6";
              return (
                <div
                  key={module.id}
                  className="bg-white rounded-xl p-6 transition-all duration-200 hover:shadow-sm"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#042042] leading-snug">
                        {module.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                    {module.shortDescription}
                  </p>
                  <div
                    className="rounded-lg p-4"
                    style={{ backgroundColor: "#F9FAFB" }}
                  >
                    <p className="text-xs font-semibold text-[#042042] mb-2 uppercase tracking-wide">
                      Key Features
                    </p>
                    <ul className="space-y-1.5">
                      {module.features.slice(0, 3).map((feature, fidx) => (
                        <li
                          key={fidx}
                          className="flex gap-2 text-xs text-[#6B7280]"
                        >
                          <span
                            className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Benefits ── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow mb-2">Why UEP</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#042042]">
              Key Benefits
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6"
                style={{
                  border: "1px solid #E5E7EB",
                  borderLeft: "4px solid #1ABFAD",
                }}
              >
                <h3 className="text-base font-bold text-[#042042] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {benefit.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Implementation ── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow mb-2">Delivery</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#042042]">
              Implementation Approach
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6" style={{ border: "1px solid #E5E7EB" }}>
            <p className="text-[#6B7280] leading-relaxed mb-8 text-sm sm:text-base">
              {uepSolution.implementationModel}
            </p>
            <div
              className="pt-6"
              style={{ borderTop: "1px solid #E5E7EB" }}
            >
              <h3 className="font-bold text-[#042042] mb-5 text-sm uppercase tracking-wide">
                Typical Implementation Timeline
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {timeline.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
                  >
                    <p
                      className="text-xs font-bold mb-1"
                      style={{ color: "#1ABFAD" }}
                    >
                      {step.phase}
                    </p>
                    <p className="text-sm text-[#374151] font-medium">
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Customisation ── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow mb-2">Flexibility</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#042042]">
              Customisation & Flexibility
            </h2>
            <p className="text-[#6B7280] text-sm sm:text-base mt-2 max-w-2xl">
              While UEP comes pre-built with best practices, we customise extensively to
              match your institution's needs.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {uepSolution.customizationOptions.map((option, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: "rgba(26,191,173,0.15)" }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#1ABFAD" }}
                  />
                </div>
                <p className="text-sm text-[#374151]">{option}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Speed Advantage ── */}
        <section>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#042042" }}
          >
            <div
              className="h-1 w-full"
              style={{ background: "linear-gradient(90deg, #1ABFAD, #3BB2F6)" }}
            />
            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(26,191,173,0.2)" }}
                >
                  <Zap className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Speed-to-Value Advantage
                </h3>
              </div>
              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {uepSolution.speedAdvantage}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── CTA ── */}
      <section className="py-20" style={{ backgroundColor: "#042042" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Transform Education</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Modernise Your Institution?
          </h2>
          <p
            className="text-base leading-relaxed mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Schedule a personalised demo to see how UEP can revolutionise teaching,
            learning and administration at your institution.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact?solution=uep"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{ backgroundColor: "#1ABFAD" }}
            >
              Schedule a Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact?solution=uep"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                border: "1.5px solid rgba(255,255,255,0.22)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Request Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

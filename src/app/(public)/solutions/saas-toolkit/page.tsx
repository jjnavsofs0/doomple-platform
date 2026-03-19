import { Metadata } from "next";
import Link from "next/link";
import { solutions } from "@/data/solutions";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Clock,
  DollarSign,
  Shield,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SaaS Backend Toolkit | Doomple Technologies",
  description:
    "Launch your SaaS platform 6 months faster with Doomple's pre-built backend toolkit — authentication, billing, multi-tenancy, API gateway and more, all production-ready.",
  alternates: { canonical: "https://doomple.com/solutions/saas-toolkit" },
  openGraph: {
    title: "SaaS Backend Toolkit | Doomple Technologies",
    description:
      "Complete backend infrastructure framework for rapid SaaS platform development — 14 modules, pre-built and tested.",
    url: "https://doomple.com/solutions/saas-toolkit",
    type: "website",
  },
};

const moduleDescriptions: Record<string, string> = {
  "User Management and Authentication": "SSO, MFA, OAuth, secure session management",
  "Multi-Tenant Architecture": "Data isolation, per-customer configuration",
  "Subscription and Billing Management": "Recurring billing, multiple pricing tiers",
  "Payment Processing Integration": "Stripe, PayPal, Razorpay integration",
  "Role-Based Access Control": "Granular permission management",
  "Audit Logging and Compliance": "GDPR, SOC 2 compliance ready",
  "Email and Communications": "Transactional email, templates",
  "File Management and Storage": "S3, cloud storage integration",
  "Analytics and Event Tracking": "Usage analytics, event streaming",
  "Webhook Management": "Event-driven integrations",
  "API Gateway and Rate Limiting": "API management, throttling",
  "Task Scheduling and Background Jobs": "Async processing, cron jobs",
  "Monitoring and Error Tracking": "Production observability",
  "Database and Cache Infrastructure": "PostgreSQL, Redis, optimized configs",
};

const engagementModels = [
  {
    name: "MVP Build",
    description: "Launch your SaaS MVP quickly with the core modules that matter most.",
    includes: [
      "User authentication",
      "Basic subscription model",
      "Simple multi-tenancy",
      "REST APIs",
    ],
    timeline: "4–8 weeks",
    color: "#1ABFAD",
  },
  {
    name: "Full Platform",
    description: "Complete SaaS platform with all features and integrations enabled.",
    includes: [
      "Everything in MVP",
      "Advanced billing models",
      "Complete admin panel",
      "Analytics & reporting",
      "Third-party integrations",
    ],
    timeline: "12–16 weeks",
    color: "#3BB2F6",
    featured: true,
  },
  {
    name: "Module-by-Module",
    description: "Start with an MVP and add modules incrementally as your needs evolve.",
    includes: [
      "Phased implementation",
      "Flexible timeline",
      "Evolve with business needs",
      "No unnecessary features",
    ],
    timeline: "Custom",
    color: "#1ABFAD",
  },
];

const advantages = [
  {
    icon: Clock,
    value: "6 Months Saved",
    body: "Launch to market significantly faster than a custom build.",
    color: "#1ABFAD",
  },
  {
    icon: DollarSign,
    value: "40–60% Cost Reduction",
    body: "Eliminate months of infrastructure development cost.",
    color: "#3BB2F6",
  },
  {
    icon: Shield,
    value: "De-Risked Launch",
    body: "Proven architecture reduces technical and market risk.",
    color: "#1ABFAD",
  },
];

const techAdvantages = [
  {
    heading: "Architecture",
    color: "#1ABFAD",
    items: [
      "Microservices-ready containerized design",
      "Infrastructure-as-code with Terraform",
      "Kubernetes-ready deployment",
      "Auto-scaling configuration included",
    ],
  },
  {
    heading: "Security & Operations",
    color: "#3BB2F6",
    items: [
      "HTTPS, encryption at rest and in transit",
      "Comprehensive audit logging",
      "Automated backups and disaster recovery",
      "99.9% uptime SLA configuration",
    ],
  },
];

export default function SaaSToolkit() {
  const solution = solutions.find((s) => s.slug === "saas-toolkit");
  if (!solution) return null;

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
              "radial-gradient(ellipse at top right, rgba(59,178,246,0.1) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, rgba(26,191,173,0.07) 0%, transparent 65%)",
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
            <span style={{ color: "#3BB2F6" }}>SaaS Backend Toolkit</span>
          </div>

          <div className="max-w-3xl">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{
                backgroundColor: "rgba(59,178,246,0.15)",
                color: "#3BB2F6",
                border: "1px solid rgba(59,178,246,0.3)",
              }}
            >
              Flagship Solution — SaaS
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
              SaaS Backend
              <span
                className="block mt-1"
                style={{
                  background: "linear-gradient(135deg, #3BB2F6, #1ABFAD)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Toolkit
              </span>
            </h1>
            <p
              className="text-base sm:text-lg leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Complete backend infrastructure pre-built, tested and ready for your unique
              business logic — launch your SaaS 6 months faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact?solution=saas-toolkit"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                style={{ backgroundColor: "#1ABFAD" }}
              >
                Schedule a Technical Demo <ArrowRight className="w-4 h-4" />
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

      {/* ── Problem Statement ── */}
      <section className="bg-white" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-bold text-[#042042] text-center mb-8">
            The SaaS Startup Challenge
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                stat: "6 Months",
                label: "Building Infrastructure",
                body: "Teams typically spend half their runway building auth, billing, multi-tenancy and other infrastructure before touching their unique business logic.",
                color: "#EF4444",
              },
              {
                stat: "$200K+",
                label: "Wasted Development",
                body: "Building the same infrastructure repeatedly across projects adds significant cost without any product differentiation.",
                color: "#EF4444",
              },
              {
                stat: "High Risk",
                label: "Security & Compliance",
                body: "Rebuilding infrastructure from scratch increases the risk of security vulnerabilities and compliance oversights.",
                color: "#EF4444",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl p-6"
                style={{
                  backgroundColor: "rgba(239,68,68,0.04)",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <p
                  className="text-2xl font-bold mb-1"
                  style={{ color: "#EF4444" }}
                >
                  {item.stat}
                </p>
                <p className="text-sm font-semibold text-[#042042] mb-2">{item.label}</p>
                <p className="text-sm text-[#6B7280] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
        {/* ── Modules ── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow mb-2">What's Included</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#042042] mb-2">
              {solution.includedModules.length} Essential Modules
            </h2>
            <p className="text-[#6B7280] text-sm sm:text-base max-w-2xl">
              Everything you need to focus on your unique business logic — not generic
              infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {solution.includedModules.map((module, idx) => {
              const color = idx % 2 === 0 ? "#1ABFAD" : "#3BB2F6";
              return (
                <div
                  key={idx}
                  className="flex gap-4 items-start bg-white rounded-xl p-5"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <CheckCircle2 className="w-4 h-4" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#042042]">{module}</p>
                    {moduleDescriptions[module] && (
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        {moduleDescriptions[module]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Technical Advantages ── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow mb-2">Engineering Quality</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#042042]">
              Technical Advantages
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {techAdvantages.map((group, gidx) => (
              <div
                key={gidx}
                className="bg-white rounded-2xl p-6 sm:p-8"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="flex items-center gap-2.5 mb-6">
                  <div
                    className="h-5 w-1 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <h3 className="text-base font-bold text-[#042042]">{group.heading}</h3>
                </div>
                <ul className="space-y-3">
                  {group.items.map((item, iidx) => (
                    <li key={iidx} className="flex gap-3">
                      <CheckCircle2
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: group.color }}
                      />
                      <span className="text-sm text-[#374151]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Engagement Models ── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow mb-2">How We Engage</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#042042]">
              Engagement Models
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {engagementModels.map((model, idx) => (
              <div
                key={idx}
                className={`rounded-2xl overflow-hidden transition-all duration-200${model.featured ? "" : ""}`}
                style={{
                  backgroundColor: model.featured ? "#042042" : "#FFFFFF",
                  border: model.featured ? "none" : "1px solid #E5E7EB",
                }}
              >
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${model.color}, ${idx % 2 === 0 ? "#3BB2F6" : "#1ABFAD"})`,
                  }}
                />
                <div className="p-6">
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ color: model.featured ? "#FFFFFF" : "#042042" }}
                  >
                    {model.name}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{
                      color: model.featured
                        ? "rgba(255,255,255,0.65)"
                        : "#6B7280",
                    }}
                  >
                    {model.description}
                  </p>
                  <ul className="space-y-2 mb-5">
                    {model.includes.map((item, iidx) => (
                      <li key={iidx} className="flex gap-2 text-sm">
                        <span
                          className="mt-2 w-1 h-1 rounded-full flex-shrink-0"
                          style={{ backgroundColor: model.color }}
                        />
                        <span
                          style={{
                            color: model.featured
                              ? "rgba(255,255,255,0.75)"
                              : "#6B7280",
                          }}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div
                    className="pt-4"
                    style={{
                      borderTop: model.featured
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid #F3F4F6",
                    }}
                  >
                    <span
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: model.color }}
                    >
                      Timeline: {model.timeline}
                    </span>
                  </div>
                </div>
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
              style={{ background: "linear-gradient(90deg, #3BB2F6, #1ABFAD)" }}
            />
            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(59,178,246,0.2)" }}
                >
                  <Zap className="w-5 h-5" style={{ color: "#3BB2F6" }} />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Speed-to-Market Advantage
                </h2>
              </div>
              <p
                className="text-sm sm:text-base leading-relaxed mb-10"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {solution.speedAdvantage}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {advantages.map((adv, idx) => {
                  const AdvIcon = adv.icon;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl p-5"
                      style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${adv.color}20` }}
                      >
                        <AdvIcon className="w-5 h-5" style={{ color: adv.color }} />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">{adv.value}</p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                      >
                        {adv.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Implementation ── */}
        <section>
          <div className="mb-6">
            <p className="eyebrow mb-2">Delivery</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#042042]">
              Implementation Model
            </h2>
          </div>
          <div
            className="bg-white rounded-2xl p-6 sm:p-8"
            style={{ border: "1px solid #E5E7EB" }}
          >
            <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
              {solution.implementationModel}
            </p>
          </div>
        </section>
      </div>

      {/* ── CTA ── */}
      <section className="py-20" style={{ backgroundColor: "#042042" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Accelerate Your Launch</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Ship 6 Months Faster?
          </h2>
          <p
            className="text-base leading-relaxed mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Let's walk through how the SaaS Backend Toolkit maps to your product — and
            show you exactly how much time and cost you'd save.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact?solution=saas-toolkit"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{ backgroundColor: "#1ABFAD" }}
            >
              Schedule a Technical Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/solutions"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                border: "1.5px solid rgba(255,255,255,0.22)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              View All Solutions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Lightbulb, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Software Development Case Studies & Client Success Stories | Doomple Technologies",
  description:
    "Real results from real projects — explore Doomple's software development and consulting case studies across e-commerce, EdTech, SaaS, logistics and enterprise digital transformation.",
  alternates: { canonical: "https://doomple.com/case-studies" },
  openGraph: {
    title: "Software Development Case Studies | Doomple Technologies India",
    description:
      "E-commerce platforms, EdTech systems, SaaS accelerations and supply chain solutions — see how Doomple delivers measurable business outcomes.",
    url: "https://doomple.com/case-studies",
    type: "website",
  },
};

const caseStudies = [
  {
    title: "E-Commerce Platform Transformation",
    clientType: "Retail & E-Commerce",
    challenge:
      "Traditional retail company with offline-only presence needed to launch e-commerce platform to reach online customers. Legacy systems couldn't support online operations, and custom build would take 8+ months.",
    solution:
      "Implemented our E-Commerce Foundation platform with custom branding and integrations. Platform included product catalog, cart, checkout, inventory management, and order fulfillment workflows.",
    results:
      "Launched fully-functional e-commerce platform in 4 months. First 6 months achieved $2.3M in online revenue. Platform handles 1000+ daily transactions with 99.9% uptime.",
    metrics: ["4 months to launch", "$2.3M online revenue", "99.9% uptime"],
    techStack: ["React", "Node.js", "PostgreSQL", "AWS", "Stripe"],
    color: "#1ABFAD",
  },
  {
    title: "Educational Institution Digital Transformation",
    clientType: "Higher Education",
    challenge:
      "University with 15,000+ students across 5 schools struggled with fragmented systems for learning, assessment, and student records. Manual processes created operational inefficiencies and poor student experience.",
    solution:
      "Deployed Unified Education Platform (UEP) with full customization for university's multi-school structure. Integrated with existing SIS and implemented phased rollout across schools.",
    results:
      "Completed implementation in 6 months. Student satisfaction increased 42%. Instructor productivity improved 35%. Automated assessment reduced grading time by 25 hours/week per faculty.",
    metrics: ["6 months deployment", "+42% student satisfaction", "35% productivity gain"],
    techStack: ["UEP", "Integration APIs", "AWS", "Single Sign-On"],
    color: "#3BB2F6",
  },
  {
    title: "SaaS Platform Acceleration",
    clientType: "B2B SaaS Startup",
    challenge:
      "Startup needed to launch SaaS platform for project management but faced 8-month development timeline for infrastructure. Funding constraints limited runway.",
    solution:
      "Deployed SaaS Backend Toolkit with custom frontend development. Used pre-built authentication, multi-tenancy, subscription billing, and payment integration. Team focused solely on unique product features.",
    results:
      "Launched MVP in 10 weeks instead of planned 8 months. Raised Series A funding 6 months earlier. Now serves 200+ enterprise customers with $2M ARR.",
    metrics: ["10 weeks to MVP", "Series A raised", "$2M ARR achieved"],
    techStack: ["SaaS Toolkit", "React", "Node.js", "Stripe", "AWS"],
    color: "#1ABFAD",
  },
  {
    title: "Supply Chain Visibility Platform",
    clientType: "Logistics & Distribution",
    challenge:
      "Mid-size logistics company had no real-time visibility into fleet operations, driver performance, or customer shipments. Manual dispatch and tracking created inefficiencies and customer dissatisfaction.",
    solution:
      "Developed custom logistics platform with real-time GPS tracking, driver mobile app, intelligent route optimization, and customer portal. Integrated with existing fleet management and billing systems.",
    results:
      "Reduced average delivery time by 18%. Improved driver utilization by 22%. Customer on-time delivery increased from 89% to 96%. Saved $150K annually in fuel costs through optimization.",
    metrics: ["-18% delivery time", "+22% driver utilization", "$150K annual savings"],
    techStack: ["React", "React Native", "Node.js", "PostgreSQL", "Google Maps", "AWS"],
    color: "#3BB2F6",
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ backgroundColor: "#042042" }}
      >
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Client Success</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
            Case Studies &
            <span
              className="block mt-1"
              style={{
                background: "linear-gradient(135deg, #1ABFAD, #3BB2F6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Portfolio
            </span>
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Real projects, real results. See how we've helped businesses across India
            and globally transform with custom technology solutions.
          </p>
        </div>
      </section>

      {/* ── Case Studies ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {caseStudies.map((study, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${study.color}, ${idx % 2 === 0 ? "#3BB2F6" : "#1ABFAD"})`,
                  }}
                />
                <div className="p-6 sm:p-8">
                  {/* Title row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#042042] mb-1">
                        {study.title}
                      </h2>
                      <span
                        className="inline-block text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: `${study.color}15`,
                          color: study.color,
                        }}
                      >
                        {study.clientType}
                      </span>
                    </div>
                    <div
                      className="hidden sm:flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: "#1ABFAD" }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Success Story
                    </div>
                  </div>

                  {/* Metric pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {study.metrics.map((metric, midx) => (
                      <span
                        key={midx}
                        className="px-3 py-1.5 text-sm font-semibold rounded-lg"
                        style={{
                          backgroundColor: "#042042",
                          color: "#FFFFFF",
                        }}
                      >
                        {metric}
                      </span>
                    ))}
                  </div>

                  {/* Three columns */}
                  <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
                        >
                          <Lightbulb className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
                        </div>
                        <h3 className="text-xs font-bold text-[#042042] uppercase tracking-widest">
                          Challenge
                        </h3>
                      </div>
                      <p className="text-sm text-[#6B7280] leading-relaxed">
                        {study.challenge}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: "rgba(59,178,246,0.1)" }}
                        >
                          <Wrench className="w-3.5 h-3.5" style={{ color: "#3BB2F6" }} />
                        </div>
                        <h3 className="text-xs font-bold text-[#042042] uppercase tracking-widest">
                          Solution
                        </h3>
                      </div>
                      <p className="text-sm text-[#6B7280] leading-relaxed">
                        {study.solution}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4 sm:p-5"
                      style={{ backgroundColor: "rgba(26,191,173,0.05)", border: "1px solid rgba(26,191,173,0.15)" }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: "rgba(26,191,173,0.15)" }}
                        >
                          <TrendingUp className="w-3.5 h-3.5" style={{ color: "#1ABFAD" }} />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1ABFAD" }}>
                          Results
                        </h3>
                      </div>
                      <p className="text-sm text-[#374151] leading-relaxed">
                        {study.results}
                      </p>
                    </div>
                  </div>

                  {/* Tech stack */}
                  <div
                    className="pt-4"
                    style={{ borderTop: "1px solid #F3F4F6" }}
                  >
                    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">
                      Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {study.techStack.map((tech, tidx) => (
                        <span
                          key={tidx}
                          className="px-2.5 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: "#F3F4F6",
                            color: "#6B7280",
                            border: "1px solid #E5E7EB",
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ backgroundColor: "#042042" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Start Your Project</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p
            className="text-base leading-relaxed mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Let's discuss how we can help your business achieve similar results —
            whether it's a custom build, platform deployment or digital transformation.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
            style={{ backgroundColor: "#1ABFAD" }}
          >
            Start a Project <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

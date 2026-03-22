import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { solutions } from "@/data/solutions";
import { ArrowRight, BookOpen, CheckCircle2, Server, Settings2, Shield, Zap } from "lucide-react";
import { getLucideIcon } from "@/lib/lucide-icon-map";

export const metadata: Metadata = {
  title: "Ready-to-Deploy Software Solutions — EdTech, SaaS, E-Commerce & More | Doomple",
  description:
    "Doomple's pre-built, customisable software solutions — deploy in weeks, not months. Includes Unified Education Platform (UEP), SaaS Backend Toolkit, E-Commerce Foundation, Service Marketplace, Logistics Platform and more.",
  alternates: { canonical: "https://doomple.com/solutions" },
  openGraph: {
    title: "Ready-to-Deploy Software Solutions — EdTech, SaaS & E-Commerce | Doomple Technologies",
    description:
      "Launch faster with Doomple's pre-built platforms. UEP for education, SaaS toolkit for product teams, e-commerce foundation for retailers, and more.",
    url: "https://doomple.com/solutions",
    type: "website",
  },
};

function getIcon(iconName: string) {
  return getLucideIcon(iconName, Server);
}

const whyChoose = [
  { icon: Zap, title: "40–60% Faster to Market", desc: "Pre-built modules and proven architectures reduce development time from months to weeks — with no trade-off on quality." },
  { icon: Shield, title: "Best Practices Built In", desc: "Years of domain expertise and lessons from real implementations are embedded in every solution — reducing your project risk." },
  { icon: Settings2, title: "Fully Customisable", desc: "While pre-built, every solution adapts to your unique requirements, branding and workflows without losing its core advantages." },
];

export default function SolutionsPage() {
  const uep = solutions.find((s) => s.slug === "uep");
  const saas = solutions.find((s) => s.slug === "saas-toolkit");
  const others = solutions.filter((s) => s.slug !== "uep" && s.slug !== "saas-toolkit");

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 sm:py-28" style={{ backgroundColor: "#042042" }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at bottom left, rgba(59,178,246,0.07) 0%, transparent 65%)" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="text-center lg:text-left">
              <p className="eyebrow mb-4">Pre-Built Platforms</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
                Deploy in Weeks,
                <span className="block mt-1" style={{ background: "linear-gradient(135deg, #1ABFAD, #3BB2F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Not Months
                </span>
              </h1>
              <p className="text-base sm:text-lg leading-relaxed max-w-2xl mb-8 mx-auto lg:mx-0" style={{ color: "rgba(255,255,255,0.65)" }}>
                Complete platform solutions designed for specific industries and business models
                pre-built with best practices and fully customisable to your needs.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                  style={{ backgroundColor: "#1ABFAD" }}>
                  Request a Demo <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/services"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{ border: "1.5px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.8)" }}>
                  Explore Services
                </Link>
              </div>
            </div>

            <div>
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
                <Image
                  src="/images/people/solutions-presentation.jpg"
                  alt="A live team presentation for a business audience"
                  width={1800}
                  height={1013}
                  className="h-[520px] w-full object-cover object-center"
                />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  "Ready modules for education, SaaS, and commerce",
                  "Faster delivery without losing customization",
                  "Safer launch path with proven architecture",
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

      {/* ── Flagship Solutions ── */}
      <section className="py-16 sm:py-20 bg-[linear-gradient(180deg,#FFF8F1_0%,#FFFFFF_100%)]" style={{ borderBottom: "1px solid #EADACB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="eyebrow mb-3">Flagship Platforms</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#042042]">Our Signature Solutions</h2>
            <p className="mt-3 text-[#6B7280] max-w-2xl">
              Two flagship platforms — battle-tested, enterprise-grade, and deployed across dozens of organisations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* UEP */}
            {uep && (
              <Link href="/solutions/uep" className="group">
                <div className="h-full bg-white rounded-[22px] overflow-hidden transition-all duration-200 hover:shadow-[0_18px_40px_rgba(4,32,66,0.10)]" style={{ border: "1px solid #EADACB" }}>
                  <div className="h-1.5" style={{ background: "linear-gradient(90deg, #1ABFAD, #3BB2F6)" }} />
                  <div className="p-8">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(26,191,173,0.12)" }}>
                        <BookOpen className="w-6 h-6" style={{ color: "#1ABFAD" }} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block"
                          style={{ backgroundColor: "rgba(26,191,173,0.1)", color: "#1ABFAD" }}>
                          FLAGSHIP SOLUTION
                        </span>
                        <h3 className="text-xl font-bold text-[#042042] group-hover:text-[#1ABFAD] transition-colors">
                          Unified Education Platform
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-[#374151] leading-relaxed mb-6">
                      {uep.description.substring(0, 220)}…
                    </p>
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-[#042042] mb-3">Includes 14 Integrated Modules</p>
                      <div className="flex flex-wrap gap-2">
                        {uep.includedModules.slice(0, 5).map((module, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs text-[#374151] rounded-full"
                            style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                            {module.split("(")[0].trim()}
                          </span>
                        ))}
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full"
                          style={{ backgroundColor: "rgba(26,191,173,0.1)", color: "#1ABFAD", border: "1px solid rgba(26,191,173,0.2)" }}>
                          +9 more
                        </span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#1ABFAD" }}>
                      Explore UEP <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* SaaS Toolkit */}
            {saas && (
              <Link href="/solutions/saas-toolkit" className="group">
                <div className="h-full bg-white rounded-[22px] overflow-hidden transition-all duration-200 hover:shadow-[0_18px_40px_rgba(4,32,66,0.10)]" style={{ border: "1px solid #EADACB" }}>
                  <div className="h-1.5" style={{ background: "linear-gradient(90deg, #3BB2F6, #1ABFAD)" }} />
                  <div className="p-8">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(59,178,246,0.12)" }}>
                        <Server className="w-6 h-6" style={{ color: "#3BB2F6" }} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block"
                          style={{ backgroundColor: "rgba(59,178,246,0.1)", color: "#3BB2F6" }}>
                          PRODUCT PLATFORM
                        </span>
                        <h3 className="text-xl font-bold text-[#042042] group-hover:text-[#3BB2F6] transition-colors">
                          SaaS Backend Toolkit
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-[#374151] leading-relaxed mb-6">
                      {saas.description.substring(0, 220)}…
                    </p>
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-[#042042] mb-3">14 Core Modules for SaaS</p>
                      <div className="flex flex-wrap gap-2">
                        {saas.includedModules.slice(0, 4).map((module, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs text-[#374151] rounded-full"
                            style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                            {module}
                          </span>
                        ))}
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full"
                          style={{ backgroundColor: "rgba(59,178,246,0.1)", color: "#3BB2F6", border: "1px solid rgba(59,178,246,0.2)" }}>
                          +10 more
                        </span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#3BB2F6" }}>
                      Explore Toolkit <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Other Solutions ── */}
      {others.length > 0 && (
        <section className="py-16 sm:py-20" style={{ borderBottom: "1px solid #EADACB", backgroundColor: "#FFFFFF" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="eyebrow mb-3">More Platforms</p>
              <h2 className="text-3xl font-bold text-[#042042]">Other Solutions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {others.map((solution) => {
                const Icon = getIcon(solution.icon);
                return (
                  <Link key={solution.slug} href={`/solutions/${solution.slug}`} className="group">
                    <div className="h-full bg-white rounded-[22px] p-7 transition-all duration-200 hover:shadow-[0_18px_40px_rgba(4,32,66,0.10)] flex flex-col"
                      style={{ border: "1px solid #EADACB" }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                        <Icon className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                      </div>
                      <h3 className="text-base font-bold text-[#042042] mb-2 group-hover:text-[#1ABFAD] transition-colors">
                        {solution.title}
                      </h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed flex-1 mb-4">
                        {solution.shortDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#9CA3AF]">{solution.includedModules.length} modules included</span>
                        <div className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#1ABFAD" }}>
                          Learn more <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Choose ── */}
      <section className="py-16 sm:py-20 bg-[linear-gradient(180deg,#FFF8F1_0%,#FFFFFF_100%)]" style={{ borderBottom: "1px solid #EADACB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">The Doomple Advantage</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#042042]">Why Choose Our Solutions?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyChoose.map((w) => {
              const Icon = w.icon;
              return (
                <div key={w.title} className="bg-white rounded-[22px] p-8 hover:shadow-[0_18px_40px_rgba(4,32,66,0.08)] transition-all duration-200"
                  style={{ border: "1px solid #EADACB" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                    style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                    <Icon className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                  </div>
                  <h3 className="text-lg font-bold text-[#042042] mb-3">{w.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{w.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #042042 0%, #0A2C54 52%, #0D4B68 100%)" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Get Started</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Find the Right Solution for Your Business</h2>
          <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            Our solutions are designed to accelerate your growth. Let's discuss which platform fits your industry, team size and timeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{ backgroundColor: "#1ABFAD" }}>
              Request a Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/services"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ border: "1.5px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.8)" }}>
              Browse All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

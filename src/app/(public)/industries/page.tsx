import { Metadata } from "next";
import Link from "next/link";
import { industries } from "@/data/industries";
import { ArrowRight, AlertCircle, CheckCircle2, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Industries We Serve | Doomple Technologies",
  description:
    "Doomple delivers technology solutions across EdTech, FinTech, healthcare, logistics, retail and more. Vertical-specific expertise for startups, MSMEs and enterprises across India.",
  alternates: { canonical: "https://doomple.com/industries" },
  openGraph: {
    title: "Industries We Serve | Doomple Technologies India",
    description:
      "Deep domain expertise across EdTech, FinTech, healthcare, manufacturing, logistics and retail — tailored software and consulting for every sector.",
    url: "https://doomple.com/industries",
    type: "website",
  },
};

export default function IndustriesPage() {
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
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, rgba(59,178,246,0.07) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">Sectors We Serve</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
              Industry Expertise
              <span
                className="block mt-1"
                style={{
                  background: "linear-gradient(135deg, #1ABFAD, #3BB2F6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Across Every Vertical
              </span>
            </h1>
            <p
              className="text-base sm:text-lg leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              From EdTech to FinTech, healthcare to manufacturing — we bring
              vertical-specific knowledge and proven delivery to every engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                style={{ backgroundColor: "#1ABFAD" }}
              >
                Discuss Your Industry <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  border: "1.5px solid rgba(255,255,255,0.22)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                View All Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Industries ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {industries.map((industry, idx) => (
              <div
                key={industry.slug}
                id={industry.slug}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: "1px solid #E5E7EB" }}
              >
                {/* Accent bar */}
                <div
                  className="h-1 w-full"
                  style={{
                    background:
                      idx % 2 === 0
                        ? "linear-gradient(90deg, #1ABFAD, #3BB2F6)"
                        : "linear-gradient(90deg, #3BB2F6, #1ABFAD)",
                  }}
                />
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#042042] mb-3">
                    {industry.name}
                  </h2>
                  <p className="text-[#6B7280] text-sm sm:text-base leading-relaxed mb-8">
                    {industry.description}
                  </p>

                  <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                    {/* Challenges */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
                        >
                          <AlertCircle
                            className="w-4 h-4"
                            style={{ color: "#EF4444" }}
                          />
                        </div>
                        <h3 className="text-sm font-bold text-[#042042] uppercase tracking-wide">
                          Key Challenges
                        </h3>
                      </div>
                      <ul className="space-y-2.5">
                        {industry.challenges.map((challenge, cidx) => (
                          <li key={cidx} className="flex gap-2.5 text-sm text-[#6B7280]">
                            <span
                              className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: "#EF4444" }}
                            />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Our Approach */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "rgba(26,191,173,0.1)" }}
                        >
                          <CheckCircle2
                            className="w-4 h-4"
                            style={{ color: "#1ABFAD" }}
                          />
                        </div>
                        <h3 className="text-sm font-bold text-[#042042] uppercase tracking-wide">
                          Our Approach
                        </h3>
                      </div>
                      <ul className="space-y-2.5">
                        {industry.howWeHelp.map((help, hidx) => (
                          <li key={hidx} className="flex gap-2.5 text-sm text-[#6B7280]">
                            <CheckCircle2
                              className="w-4 h-4 mt-0.5 flex-shrink-0"
                              style={{ color: "#1ABFAD" }}
                            />
                            {help}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Solutions */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "rgba(59,178,246,0.1)" }}
                        >
                          <Target
                            className="w-4 h-4"
                            style={{ color: "#3BB2F6" }}
                          />
                        </div>
                        <h3 className="text-sm font-bold text-[#042042] uppercase tracking-wide">
                          Solutions
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {industry.relevantServices
                          .slice(0, 3)
                          .concat(industry.relevantSolutions.slice(0, 1))
                          .map((item, iidx) => (
                            <span
                              key={iidx}
                              className="px-2.5 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: "rgba(59,178,246,0.08)",
                                color: "#3BB2F6",
                                border: "1px solid rgba(59,178,246,0.2)",
                              }}
                            >
                              {item.replace(/-/g, " ")}
                            </span>
                          ))}
                      </div>
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
          <p className="eyebrow mb-4">Don't See Your Industry?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            We Work Across Many Verticals
          </h2>
          <p
            className="text-base leading-relaxed mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Our team has delivered projects across dozens of sectors. Tell us
            about your industry and challenges — we'll share relevant experience
            and a tailored approach.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
            style={{ backgroundColor: "#1ABFAD" }}
          >
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

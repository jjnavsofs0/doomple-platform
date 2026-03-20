import Link from "next/link";
import { SectionWrapper } from "@/components/layouts/section-wrapper";
import { Search, Hammer, Rocket, ArrowRight } from "lucide-react";

export function ProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Discover",
      tagline: "Brief · Workshops · Spec",
      description: "We map your goals, constraints and technical landscape — then define a clear scope and delivery plan.",
      icon: Search,
      color: "#1ABFAD",
      bgColor: "rgba(26,191,173,0.1)",
    },
    {
      number: "02",
      title: "Build",
      tagline: "Design · Dev · QA",
      description: "Iterative sprints with regular demos. You see progress every week — no black boxes, no surprises.",
      icon: Hammer,
      color: "#3BB2F6",
      bgColor: "rgba(59,178,246,0.1)",
    },
    {
      number: "03",
      title: "Launch & Scale",
      tagline: "Deploy · Support · Grow",
      description: "We go live with full handover, training, and ongoing support as your product evolves.",
      icon: Rocket,
      color: "#1ABFAD",
      bgColor: "rgba(26,191,173,0.1)",
    },
  ];

  return (
    <SectionWrapper id="process" background="gray" padding="lg">
      <div className="mb-10">
        <p className="eyebrow mb-3">Our Process</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] max-w-xl leading-tight">
            How We Deliver Results
          </h2>
          <span className="text-sm text-[#6B7280]">Proven across 100+ projects</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative bg-white rounded-2xl p-7 transition-all duration-200 hover:shadow-md"
              style={{ border: "1px solid #E5E7EB" }}
            >
              {/* Connector arrow — desktop */}
              {idx < steps.length - 1 && (
                <div
                  className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
                >
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                </div>
              )}

              {/* Icon + step number */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: step.bgColor }}
                >
                  <Icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: step.color }}
                >
                  Step {step.number}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#042042] mb-1">{step.title}</h3>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9CA3AF" }}>
                {step.tagline}
              </p>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA nudge */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-xl px-8 py-6"
        style={{ backgroundColor: "#042042" }}
      >
        <div>
          <p className="text-base font-semibold text-white">Ready to start your project?</p>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
            Let&apos;s begin with a free 30-minute discovery call.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 whitespace-nowrap shrink-0"
          style={{ backgroundColor: "#1ABFAD" }}
        >
          Schedule a Consultation <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </SectionWrapper>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Users, BarChart3, Layers, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Workforce & Productivity Solutions | Doomple Technologies",
  description:
    "Custom-built workforce management systems tailored to your organisation's structure — employee management, task coordination, performance tracking and KRA management.",
  alternates: { canonical: "https://doomple.com/solutions/workforce" },
  openGraph: {
    title: "Workforce & Productivity Solutions | Doomple Technologies",
    description:
      "Custom workforce management solutions including employee management, task management, performance tracking and team collaboration — built specifically for your organisation.",
    url: "https://doomple.com/solutions/workforce",
    type: "website",
  },
};

const features = [
  "Employee Management & Onboarding",
  "Task Management & Work Coordination",
  "Productivity Suite & Time Tracking",
  "Performance Tracking & KPI Management",
  "KRA (Key Result Areas) Management",
  "Team Collaboration Tools",
  "Analytics & Reporting",
  "Custom Integrations",
];

const implementationOptions = [
  {
    title: "Custom Implementation",
    description:
      "We design and build a complete workforce management system tailored to your specific requirements and processes.",
    bullets: [
      "Requirements analysis and design",
      "Custom development from scratch",
      "Full integration with your systems",
      "Training and change management",
    ],
    timeline: "4–8 months",
    color: "#1ABFAD",
  },
  {
    title: "Phased Rollout",
    description:
      "Start with core modules and expand incrementally as adoption grows and needs evolve.",
    bullets: [
      "MVP launch in weeks",
      "Gather user feedback",
      "Add features iteratively",
      "Reduce deployment risk",
    ],
    timeline: "2–4 months for MVP",
    color: "#3BB2F6",
  },
  {
    title: "Managed Service",
    description:
      "Beyond development, we provide ongoing optimisation and enhancements as your needs change.",
    bullets: [
      "Continuous improvements",
      "User training and support",
      "Performance optimisation",
      "Feature enhancements",
    ],
    timeline: "Ongoing retainer",
    color: "#1ABFAD",
  },
];

const outcomes = [
  {
    heading: "Operational Benefits",
    icon: BarChart3,
    color: "#1ABFAD",
    items: [
      { highlight: "30–40% improvement", rest: "in team productivity through better visibility and coordination" },
      { highlight: "Reduced administrative overhead", rest: "through automation of routine tasks" },
      { highlight: "Better resource allocation", rest: "with real-time visibility into team capacity" },
    ],
  },
  {
    heading: "Organisational Benefits",
    icon: Users,
    color: "#3BB2F6",
    items: [
      { highlight: "Improved employee engagement", rest: "through clear goals and transparent performance tracking" },
      { highlight: "Data-driven decisions", rest: "on hiring, retention, and development" },
      { highlight: "Scalable processes", rest: "that grow with your organisation" },
    ],
  },
];

export default function WorkforcePage() {
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
          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-sm mb-8"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/solutions" className="hover:text-white transition-colors">Solutions</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: "#1ABFAD" }}>Workforce</span>
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
              Custom Solution — Enterprise
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
              Workforce &
              <span
                className="block mt-1"
                style={{
                  background: "linear-gradient(135deg, #3BB2F6, #1ABFAD)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Productivity Solutions
              </span>
            </h1>
            <p
              className="text-base sm:text-lg leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Custom-built solutions for employee management and productivity — designed
              to align perfectly with your organisational structure, processes and culture.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact?solution=workforce"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                style={{ backgroundColor: "#1ABFAD" }}
              >
                Discuss Your Requirements <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services/custom-software-development"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  border: "1.5px solid rgba(255,255,255,0.22)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Custom Development
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
        {/* ── Overview ── */}
        <section>
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Feature list */}
            <div>
              <div className="mb-6">
                <p className="eyebrow mb-2">What We Build</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#042042]">
                  A Custom Solution Approach
                </h2>
                <p className="text-[#6B7280] text-sm sm:text-base mt-3">
                  Rather than a pre-built platform, we design and build workforce management
                  systems specifically tailored to your organisational needs.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: "#1ABFAD" }}
                    />
                    <span className="text-sm text-[#374151] font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Custom panel */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "#042042" }}
            >
              <div
                className="h-1 w-full"
                style={{ background: "linear-gradient(90deg, #3BB2F6, #1ABFAD)" }}
              />
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(59,178,246,0.2)" }}
                  >
                    <Layers className="w-5 h-5" style={{ color: "#3BB2F6" }} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Why Custom?</h3>
                </div>
                <ul className="space-y-5">
                  {[
                    {
                      title: "Perfect Alignment",
                      body: "Built exactly for your processes — not forcing you to change how you work.",
                    },
                    {
                      title: "Scalable Design",
                      body: "Architectured to grow as your organisation expands and needs evolve.",
                    },
                    {
                      title: "Complete Integration",
                      body: "Seamlessly connects with your existing systems, tools and workflows.",
                    },
                  ].map((point, idx) => (
                    <li key={idx} className="flex gap-3">
                      <CheckCircle2
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: "#1ABFAD" }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{point.title}</p>
                        <p
                          className="text-sm mt-0.5"
                          style={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          {point.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Implementation Options ── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow mb-2">Delivery Models</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#042042]">
              Implementation Options
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {implementationOptions.map((option, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${option.color}, ${idx % 2 === 0 ? "#3BB2F6" : "#1ABFAD"})`,
                  }}
                />
                <div className="p-6">
                  <h3 className="text-base font-bold text-[#042042] mb-3">
                    {option.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                    {option.description}
                  </p>
                  <ul className="space-y-2 mb-5">
                    {option.bullets.map((bullet, bidx) => (
                      <li key={bidx} className="flex gap-2 text-sm text-[#6B7280]">
                        <span
                          className="mt-2 w-1 h-1 rounded-full flex-shrink-0"
                          style={{ backgroundColor: option.color }}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="pt-4"
                    style={{ borderTop: "1px solid #F3F4F6" }}
                  >
                    <span
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: option.color }}
                    >
                      Timeline: {option.timeline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Outcomes ── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow mb-2">Expected Value</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#042042]">
              Expected Outcomes
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {outcomes.map((group, gidx) => {
              const GroupIcon = group.icon;
              return (
                <div
                  key={gidx}
                  className="bg-white rounded-2xl p-6 sm:p-8"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${group.color}15` }}
                    >
                      <GroupIcon className="w-5 h-5" style={{ color: group.color }} />
                    </div>
                    <h3 className="text-base font-bold text-[#042042]">
                      {group.heading}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {group.items.map((item, iidx) => (
                      <li key={iidx} className="flex gap-3">
                        <CheckCircle2
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          style={{ color: group.color }}
                        />
                        <span className="text-sm text-[#374151] leading-relaxed">
                          <strong>{item.highlight}</strong> {item.rest}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── CTA ── */}
      <section className="py-20" style={{ backgroundColor: "#042042" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Let's Build Together</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Let's Design Your Solution
          </h2>
          <p
            className="text-base leading-relaxed mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Ready to build a workforce management system designed specifically for your
            organisation? Let's start with a discovery call.
          </p>
          <Link
            href="/contact?solution=workforce"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
            style={{ backgroundColor: "#1ABFAD" }}
          >
            Discuss Your Requirements <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

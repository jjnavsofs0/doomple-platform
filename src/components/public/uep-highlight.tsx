import Link from "next/link";
import { SectionWrapper } from "@/components/layouts/section-wrapper";
import { BookOpen, GraduationCap, ClipboardList, Users, BrainCircuit, ArrowRight, CheckCircle2 } from "lucide-react";

export function UepHighlight() {
  const capabilities = [
    {
      icon: BookOpen,
      title: "Learning Management System",
      description: "Complete course delivery, student engagement, and progress tracking.",
    },
    {
      icon: ClipboardList,
      title: "Online Testing & Exams",
      description: "Secure exam platform with proctoring and anti-cheating controls.",
    },
    {
      icon: Users,
      title: "Student Information System",
      description: "Unified student data management and academic records.",
    },
    {
      icon: BrainCircuit,
      title: "AI Interview & Assessment",
      description: "Intelligent candidate evaluation and skill-gap assessments.",
    },
  ];

  const stats = [
    { value: "14+", label: "Core Modules" },
    { value: "99%", label: "Uptime SLA" },
    { value: "60%", label: "Faster Deployment" },
  ];

  return (
    <SectionWrapper id="uep" background="white" padding="lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left — Content */}
        <div>
          <p className="eyebrow mb-3">Featured Solution</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] leading-tight mb-4">
            Unified Education Platform
          </h2>
          <p className="text-base text-[#6B7280] leading-relaxed mb-8 max-w-lg">
            A complete ecosystem for educational institutions — from course delivery to exams, student records, and AI-powered assessments. One platform, every touchpoint.
          </p>

          {/* Capabilities */}
          <div className="space-y-3 mb-8">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl transition-all duration-200 hover:shadow-sm"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(26,191,173,0.1)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "#1ABFAD" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#042042] mb-0.5">{cap.title}</p>
                    <p className="text-xs text-[#6B7280] leading-relaxed">{cap.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/solutions/uep"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200"
            style={{ backgroundColor: "#1ABFAD" }}
          >
            Explore UEP Solution <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right — Visual Panel */}
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#042042" }}
          >
            {/* Top accent bar */}
            <div
              className="h-1 w-full"
              style={{ background: "linear-gradient(90deg, #1ABFAD, #3BB2F6)" }}
            />

            <div className="p-8 sm:p-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(26,191,173,0.15)", border: "1px solid rgba(26,191,173,0.25)" }}
                >
                  <GraduationCap className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">UEP · Unified Education Platform</p>
                  <p className="text-white/40 text-xs">By Doomple Technologies</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="text-center rounded-xl py-4 px-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <p className="text-2xl font-bold text-white mb-0.5">{s.value}</p>
                    <p className="text-xs text-white/45">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Feature highlights */}
              <div className="space-y-2.5">
                {[
                  "Multi-institution & multi-campus support",
                  "Real-time analytics & reporting dashboards",
                  "Third-party integrations (Zoom, Google, Microsoft)",
                  "WCAG 2.1 accessible & mobile-first",
                  "GDPR & FERPA compliant data handling",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#1ABFAD" }} />
                    <span className="text-sm text-white/70">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div
                className="mt-8 pt-6 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-xs text-white/40">Trusted by 50+ institutions globally</p>
                <Link
                  href="/solutions/uep"
                  className="text-xs font-semibold flex items-center gap-1 transition-colors"
                  style={{ color: "#1ABFAD" }}
                >
                  Learn more <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

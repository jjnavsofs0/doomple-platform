import Link from "next/link";
import { SectionWrapper } from "@/components/layouts/section-wrapper";
import {
  Server, ArrowRight, CheckCircle2,
  ShieldCheck, Users, CreditCard, Bell, BarChart3, Lock,
} from "lucide-react";

export function SaasTkitHighlight() {
  const modules = [
    { icon: Users,      label: "User Management & Auth" },
    { icon: Server,     label: "Multi-Tenant Architecture" },
    { icon: CreditCard, label: "Subscription & Billing" },
    { icon: Lock,       label: "Role-Based Access Control" },
    { icon: ShieldCheck,label: "Audit Logging & Compliance" },
    { icon: Bell,       label: "Email & Communications" },
    { icon: BarChart3,  label: "Analytics & Event Tracking" },
    { icon: CreditCard, label: "Payment Processing" },
  ];

  const benefits = [
    "Reduce development time by 40–60%",
    "Production-ready security & compliance",
    "Scales from startup to enterprise",
  ];

  return (
    <SectionWrapper id="saas-toolkit" background="gray" padding="lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left — Visual Panel */}
        <div className="relative order-2 lg:order-1">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#042042" }}
          >
            {/* Top accent bar */}
            <div
              className="h-1 w-full"
              style={{ background: "linear-gradient(90deg, #3BB2F6, #1ABFAD)" }}
            />

            <div className="p-8 sm:p-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(59,178,246,0.15)", border: "1px solid rgba(59,178,246,0.25)" }}
                >
                  <Server className="w-5 h-5" style={{ color: "#3BB2F6" }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">SaaS Backend Toolkit</p>
                  <p className="text-white/40 text-xs">Production-ready infrastructure modules</p>
                </div>
              </div>

              {/* Modules grid */}
              <div className="grid grid-cols-2 gap-2 mb-8">
                {modules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.label}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#3BB2F6" }} />
                      <span className="text-xs text-white/70 leading-tight">{mod.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div
                className="grid grid-cols-2 gap-3 pt-6"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="text-center rounded-xl py-4"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <p className="text-2xl font-bold text-white">14+</p>
                  <p className="text-xs text-white/40 mt-0.5">Core Services</p>
                </div>
                <div
                  className="text-center rounded-xl py-4"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-xs text-white/40 mt-0.5">Customisable</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Content */}
        <div className="order-1 lg:order-2">
          <p className="eyebrow mb-3">Featured Solution</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] leading-tight mb-4">
            SaaS Backend Toolkit
          </h2>
          <p className="text-base text-[#6B7280] leading-relaxed mb-8 max-w-lg">
            Stop rebuilding the same infrastructure for every SaaS product. The SaaS Backend Toolkit delivers battle-tested, pre-built modules — so your team ships unique business logic, not boilerplate.
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#1ABFAD" }} />
                <span className="text-sm font-medium text-[#374151]">{b}</span>
              </div>
            ))}
          </div>

          {/* Proof strip */}
          <div
            className="rounded-xl px-5 py-4 mb-8 flex items-center gap-4"
            style={{ backgroundColor: "rgba(26,191,173,0.07)", border: "1px solid rgba(26,191,173,0.2)" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(26,191,173,0.12)" }}
            >
              <ShieldCheck className="w-5 h-5" style={{ color: "#1ABFAD" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#042042]">Enterprise-Grade Security Baked In</p>
              <p className="text-xs text-[#6B7280] mt-0.5">SOC 2 ready, GDPR compliant, with full audit trails and role-based access</p>
            </div>
          </div>

          <Link
            href="/solutions/saas-toolkit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{ backgroundColor: "#042042", color: "#FFFFFF" }}
          >
            Explore the Toolkit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}

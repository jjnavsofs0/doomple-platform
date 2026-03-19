"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, TrendingUp, Clock, Users, Code } from "lucide-react";

export function HeroSection() {
  const stats = [
    { value: "100+", label: "Projects Delivered" },
    { value: "50+", label: "Clients Globally" },
    { value: "8+", label: "Industry Verticals" },
    { value: "< 24 hrs", label: "Response Guarantee" },
  ];

  // Simulated active projects for the dashboard mockup
  const mockProjects = [
    { name: "E-Commerce Platform", progress: 82, color: "#1ABFAD" },
    { name: "EdTech SaaS Backend", progress: 100, color: "#3BB2F6" },
    { name: "AI Analytics Suite", progress: 55, color: "#1ABFAD" },
  ];

  const recentDeliveries = [
    { label: "Mobile App Launch", note: "2 days ahead of schedule" },
    { label: "API Integration", note: "Delivered on time" },
    { label: "Legacy Migration", note: "Zero downtime" },
  ];

  return (
    <section
      className="relative w-full overflow-hidden pt-20"
      style={{ backgroundColor: "#042042" }}
    >
      {/* Subtle dot-grid texture */}
      <div className="absolute inset-0 bg-dot-pattern pointer-events-none" />

      {/* Teal glow accent — top right */}
      <div
        className="absolute top-0 right-0 w-[480px] h-[480px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.12) 0%, transparent 65%)",
        }}
      />
      {/* Blue glow accent — bottom left */}
      <div
        className="absolute bottom-0 left-0 w-[380px] h-[380px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at bottom left, rgba(59,178,246,0.08) 0%, transparent 65%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ─── Left: Text ─── */}
          <div>
            {/* Location badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-sm font-medium"
              style={{ backgroundColor: "rgba(26,191,173,0.12)", border: "1px solid rgba(26,191,173,0.25)", color: "#1ABFAD" }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#1ABFAD" }} />
              Gurgaon, India · Delivering Globally
            </div>

            {/* SEO H1 */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-bold text-white leading-tight tracking-tight mb-5">
              Custom Software &{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #1ABFAD 0%, #3BB2F6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Technology Consulting
              </span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-[42px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                for India's Growing Businesses
              </span>
            </h1>

            {/* Subheadline — short */}
            <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
              We build custom software, deploy AI, and provide expert technology consulting — helping startups, MSMEs and enterprises move faster with less risk.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                style={{ backgroundColor: "#1ABFAD" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#15a89a";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#1ABFAD";
                }}
              >
                Start Your Project <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/consulting"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Book a Consultation
              </Link>
            </div>

            {/* Stats bar */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-0 rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="py-4 px-3 text-center"
                  style={{
                    borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : undefined,
                  }}
                >
                  <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                  <div className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right: Dashboard Mockup ─── */}
          <div className="hidden lg:block">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#1ABFAD", opacity: 0.8 }} />
                <span className="ml-3 text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                  doomple.com/dashboard
                </span>
              </div>

              <div className="p-6">
                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-white font-semibold text-sm">Project Overview</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Q1 2025 · 12 active engagements</p>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "rgba(26,191,173,0.15)", color: "#1ABFAD" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#1ABFAD" }} />
                    On Track
                  </div>
                </div>

                {/* Metric tiles */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  {[
                    { icon: TrendingUp, value: "94%", label: "On-time rate", color: "#1ABFAD" },
                    { icon: Users, value: "50+", label: "Active clients", color: "#3BB2F6" },
                    { icon: Code, value: "100+", label: "Shipped", color: "#1ABFAD" },
                  ].map((tile) => {
                    const TileIcon = tile.icon;
                    return (
                      <div
                        key={tile.label}
                        className="rounded-xl p-3 text-center"
                        style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                      >
                        <TileIcon className="w-4 h-4 mx-auto mb-1.5" style={{ color: tile.color }} />
                        <p className="text-lg font-bold text-white leading-none mb-0.5">{tile.value}</p>
                        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{tile.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Active projects */}
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Active Projects
                  </p>
                  <div className="space-y-3">
                    {mockProjects.map((project) => (
                      <div key={project.name}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-white/80">{project.name}</span>
                          <span className="text-xs font-semibold" style={{ color: project.color }}>{project.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${project.progress}%`, backgroundColor: project.color, opacity: 0.8 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent deliveries */}
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "rgba(26,191,173,0.06)", border: "1px solid rgba(26,191,173,0.12)" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(26,191,173,0.7)" }}>
                    Recent Deliveries
                  </p>
                  <div className="space-y-2.5">
                    {recentDeliveries.map((item) => (
                      <div key={item.label} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1ABFAD" }} />
                        <div>
                          <span className="text-xs font-medium text-white/80">{item.label}</span>
                          <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>— {item.note}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fade into page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #F9FAFB)" }}
      />
    </section>
  );
}

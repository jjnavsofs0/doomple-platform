import Link from "next/link";
import { ArrowRight, Calendar, Clock, Package, Headphones } from "lucide-react";

export function CtaSection() {
  const proofPoints = [
    { icon: Clock, value: "24 hrs", label: "Initial Response" },
    { icon: Calendar, value: "3–6 mo", label: "Typical Deployment" },
    { icon: Package, value: "100%", label: "Custom Solutions" },
    { icon: Headphones, value: "24/7", label: "Support Available" },
  ];

  return (
    <section className="relative overflow-hidden py-24 sm:py-28" style={{ backgroundColor: "#042042" }}>
      {/* Subtle glow */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 60%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at bottom left, rgba(59,178,246,0.08) 0%, transparent 60%)" }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="eyebrow mb-5">Get Started Today</p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
          Ready to Build Something<br />
          <span style={{ background: "linear-gradient(135deg, #1ABFAD, #3BB2F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            That Matters?
          </span>
        </h2>

        <p className="text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          Tell us what you need — we&apos;ll respond within 24 hours with a clear plan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
            style={{ backgroundColor: "#1ABFAD" }}
          >
            Start Your Journey <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/solutions"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{ border: "1.5px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)" }}
          >
            Explore Solutions
          </Link>
        </div>

        {/* Proof points */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 max-w-2xl mx-auto rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)" }}>
          {proofPoints.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.label}
                className="py-6 px-4 text-center"
                style={{ borderRight: i < proofPoints.length - 1 ? "1px solid rgba(255,255,255,0.08)" : undefined }}
              >
                <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: "#1ABFAD" }} />
                <div className="text-xl font-bold text-white">{p.value}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{p.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

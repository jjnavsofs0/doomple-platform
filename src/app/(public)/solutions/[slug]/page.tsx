import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { solutions } from "@/data/solutions";
import { ArrowRight, CheckCircle2, Zap, ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";

// Pages with dedicated routes — skip dynamic rendering for these
const DEDICATED_PAGES = ["uep", "saas-toolkit", "workforce"];

export async function generateStaticParams() {
  return solutions
    .filter((s) => !DEDICATED_PAGES.includes(s.slug))
    .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const solution = solutions.find((s) => s.slug === params.slug);
  if (!solution) return { title: "Solution Not Found" };

  return {
    title: `${solution.title} | Doomple Technologies`,
    description: solution.shortDescription,
    openGraph: {
      title: solution.title,
      description: solution.shortDescription,
      type: "website",
    },
  };
}

function getIcon(iconName: string) {
  const iconMap: Record<string, any> = {
    BookOpen: Icons.BookOpen,
    Server: Icons.Server,
    ShoppingCart: Icons.ShoppingCart,
    Briefcase: Icons.Briefcase,
    Truck: Icons.Truck,
    Zap: Icons.Zap,
    Users: Icons.Users,
    TrendingUp: Icons.TrendingUp,
    Layers: Icons.Layers,
  };
  return iconMap[iconName] || Icons.Layers;
}

export default function SolutionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  if (DEDICATED_PAGES.includes(params.slug)) {
    notFound();
  }

  const solution = solutions.find((s) => s.slug === params.slug);
  if (!solution) notFound();

  const Icon = getIcon(solution.icon);
  const relatedSolutions = solutions
    .filter((s) => s.slug !== solution.slug && !DEDICATED_PAGES.includes(s.slug))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-16 sm:py-24"
        style={{ backgroundColor: "#042042" }}
      >
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(26,191,173,0.08) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/solutions" className="hover:text-white transition-colors">Solutions</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: "#1ABFAD" }}>{solution.title}</span>
          </div>

          <div className="flex items-start gap-5 max-w-3xl">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
              style={{
                backgroundColor: "rgba(26,191,173,0.15)",
                border: "1px solid rgba(26,191,173,0.25)",
              }}
            >
              <Icon className="w-7 h-7" style={{ color: "#1ABFAD" }} />
            </div>
            <div>
              <p className="eyebrow mb-2">Pre-built Solution</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
                {solution.title}
              </h1>
              <p
                className="text-base sm:text-lg leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {solution.shortDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content + Sidebar ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <div
              className="bg-white rounded-2xl p-6 sm:p-8"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <h2 className="text-xl font-bold text-[#042042] mb-4">Overview</h2>
              <div
                className="text-[#6B7280] leading-relaxed whitespace-pre-line text-sm sm:text-base"
              >
                {solution.description}
              </div>
            </div>

            {/* Included Modules */}
            <div
              className="bg-white rounded-2xl p-6 sm:p-8"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <h2 className="text-xl font-bold text-[#042042] mb-6">
                Included Modules{" "}
                <span
                  className="text-sm font-semibold ml-1 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(26,191,173,0.1)", color: "#1ABFAD" }}
                >
                  {solution.includedModules.length}
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {solution.includedModules.map((module, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <CheckCircle2
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: "#1ABFAD" }}
                    />
                    <span className="text-sm text-[#374151]">{module}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What You'll Receive */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "#042042" }}
            >
              <div
                className="h-1 w-full"
                style={{ background: "linear-gradient(90deg, #1ABFAD, #3BB2F6)" }}
              />
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white mb-6">Ideal For</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {solution.targetCustomers.map((customer, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <CheckCircle2
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: "#1ABFAD" }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        {customer}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customization */}
            <div
              className="bg-white rounded-2xl p-6 sm:p-8"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <h2 className="text-xl font-bold text-[#042042] mb-6">
                Customization Options
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {solution.customizationOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 items-start p-3.5 rounded-xl"
                    style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: "#1ABFAD" }}
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-[#374151] font-medium">{option}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Speed Advantage */}
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                backgroundColor: "rgba(26,191,173,0.05)",
                border: "1px solid rgba(26,191,173,0.2)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(26,191,173,0.15)" }}
                >
                  <Zap className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                </div>
                <h2 className="text-xl font-bold text-[#042042]">
                  Speed-to-Market Advantage
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
                {solution.speedAdvantage}
              </p>
            </div>

            {/* Implementation */}
            <div
              className="bg-white rounded-2xl p-6 sm:p-8"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <h2 className="text-xl font-bold text-[#042042] mb-4">
                Implementation Model
              </h2>
              <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
                {solution.implementationModel}
              </p>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* CTA Panel */}
            <div
              className="rounded-2xl overflow-hidden sticky top-24"
              style={{ backgroundColor: "#042042" }}
            >
              <div
                className="h-1 w-full"
                style={{ background: "linear-gradient(90deg, #1ABFAD, #3BB2F6)" }}
              />
              <div className="p-6 sm:p-8">
                <h3 className="text-lg font-bold text-white mb-2">
                  Ready to Get Started?
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Let's discuss how {solution.title} can accelerate your business and
                  reduce time-to-market.
                </p>
                <Link
                  href={`/contact?solution=${solution.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 mb-3"
                  style={{ backgroundColor: "#1ABFAD" }}
                >
                  Schedule a Demo <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  View Pricing
                </Link>
              </div>
            </div>

            {/* Related Solutions */}
            {relatedSolutions.length > 0 && (
              <div
                className="bg-white rounded-2xl p-6"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <h3 className="text-base font-bold text-[#042042] mb-4">
                  Other Solutions
                </h3>
                <div className="space-y-3">
                  {relatedSolutions.map((related) => {
                    const RelatedIcon = getIcon(related.icon);
                    return (
                      <Link
                        key={related.slug}
                        href={`/solutions/${related.slug}`}
                        className="group flex gap-3 p-3.5 rounded-xl transition-all duration-200 hover:border-[#1ABFAD]"
                        style={{ border: "1px solid #E5E7EB" }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "rgba(26,191,173,0.1)" }}
                        >
                          <RelatedIcon className="w-4 h-4" style={{ color: "#1ABFAD" }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#042042] group-hover:text-[#1ABFAD] transition-colors leading-snug">
                            {related.title}
                          </p>
                          <p className="text-xs text-[#9CA3AF] line-clamp-1 mt-0.5">
                            {related.shortDescription}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CTA Footer ── */}
      <section className="py-20" style={{ backgroundColor: "#042042" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Get Started</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Let's Build Your Solution
          </h2>
          <p
            className="text-base leading-relaxed mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Contact us to discuss how we can deploy and customize {solution.title} for
            your business — with enterprise-grade quality and fast delivery.
          </p>
          <Link
            href={`/contact?solution=${solution.slug}`}
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

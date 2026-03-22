import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "@/data/services";
import { ArrowRight, CheckCircle2, ArrowLeft, ChevronRight } from "lucide-react";
import { getLucideIcon } from "@/lib/lucide-icon-map";

export async function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) return { title: "Service Not Found" };

  const canonicalUrl = `https://doomple.com/services/${service.slug}`;
  return {
    title: `${service.title} Services India | Doomple Technologies`,
    description: service.shortDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${service.title} | Doomple Technologies India`,
      description: service.shortDescription,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title} | Doomple Technologies`,
      description: service.shortDescription,
    },
  };
}

function getIcon(iconName: string) {
  return getLucideIcon(iconName);
}

function getRelatedServices(currentSlug: string) {
  return services.filter((s) => s.slug !== currentSlug && !s.isMarketingOnly).slice(0, 3);
}

export default function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) notFound();

  const Icon = getIcon(service.icon);
  const relatedServices = getRelatedServices(service.slug);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20" style={{ backgroundColor: "#042042" }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 65%)" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 mb-8 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/services" className="hover:text-white/70 transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: "rgba(255,255,255,0.7)" }}>{service.title}</span>
          </nav>

          <div className="flex items-start gap-5 mb-5">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(26,191,173,0.15)", border: "1px solid rgba(26,191,173,0.25)" }}
            >
              <Icon className="w-7 h-7" style={{ color: "#1ABFAD" }} />
            </div>
            <div>
              <p className="eyebrow mb-2">Doomple Service</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                {service.title}
              </h1>
            </div>
          </div>

          <p className="text-base sm:text-lg leading-relaxed max-w-3xl" style={{ color: "rgba(255,255,255,0.65)" }}>
            {service.shortDescription}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{ backgroundColor: "#1ABFAD" }}>
              Get a Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)" }}>
              <ArrowLeft className="w-4 h-4" /> All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Content */}
          <div className="lg:col-span-2 space-y-8">

            <div className="bg-white rounded-xl p-8" style={{ border: "1px solid #E5E7EB" }}>
              <h2 className="text-xl font-bold text-[#042042] mb-4">Overview</h2>
              <div className="text-[#374151] text-sm leading-relaxed space-y-4 whitespace-pre-line">
                {service.description}
              </div>
            </div>

            <div className="bg-white rounded-xl p-8" style={{ border: "1px solid #E5E7EB" }}>
              <h2 className="text-xl font-bold text-[#042042] mb-6">Challenges We Solve</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {service.problemsSolved.map((problem: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#1ABFAD" }} />
                    <p className="text-sm text-[#374151]">{problem}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-8" style={{ border: "1px solid #E5E7EB" }}>
              <h2 className="text-xl font-bold text-[#042042] mb-6">Ideal For</h2>
              <ul className="space-y-3">
                {service.idealClients.map((client: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: "rgba(26,191,173,0.12)" }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#1ABFAD" }} />
                    </div>
                    <span className="text-sm text-[#374151]">{client}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl p-8 overflow-hidden" style={{ backgroundColor: "#042042" }}>
              <div className="h-0.5 w-12 rounded-full mb-5" style={{ backgroundColor: "#1ABFAD" }} />
              <h2 className="text-xl font-bold text-white mb-6">What You'll Receive</h2>
              <ul className="space-y-3">
                {service.deliverables.map((deliverable: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#1ABFAD" }} />
                    <span className="text-sm text-white/75 font-medium">{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8" style={{ border: "1px solid #E5E7EB" }}>
              <h2 className="text-xl font-bold text-[#042042] mb-6">How We Work Together</h2>
              <div className="space-y-4">
                {service.engagementOptions.map((option: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-lg"
                    style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                      style={{ backgroundColor: "#042042" }}>
                      {idx + 1}
                    </div>
                    <p className="text-sm text-[#374151] leading-relaxed">{option}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">

            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#042042" }}>
              <div className="h-1" style={{ background: "linear-gradient(90deg, #1ABFAD, #3BB2F6)" }} />
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">Ready to Get Started?</h3>
                <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Let&apos;s discuss how {service.title} can benefit your business. Response within 24 hours.
                </p>
                <Link href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 mb-3"
                  style={{ backgroundColor: "#1ABFAD" }}>
                  Get a Quote <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/pricing"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>
                  View Pricing Plans
                </Link>

                <div className="mt-5 pt-5 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Response within 24 hours", "Senior engineers, no juniors", "Fixed-price options available"].map((pt) => (
                    <div key={pt} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1ABFAD" }} />
                      <span className="text-xs text-white/55">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {relatedServices.length > 0 && (
              <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E5E7EB" }}>
                <h3 className="text-sm font-semibold text-[#042042] mb-4">Related Services</h3>
                <div className="space-y-3">
                  {relatedServices.map((related: any) => {
                    const RelIcon = getIcon(related.icon);
                    return (
                      <Link key={related.slug} href={`/services/${related.slug}`}
                        className="group flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-[#F9FAFB]"
                        style={{ border: "1px solid #E5E7EB" }}>
                        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                          <RelIcon className="w-3.5 h-3.5" style={{ color: "#1ABFAD" }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#042042] group-hover:text-[#1ABFAD] transition-colors mb-0.5">
                            {related.title}
                          </p>
                          <p className="text-xs text-[#6B7280] line-clamp-2">{related.shortDescription}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link href="/services"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  style={{ color: "#1ABFAD" }}>
                  All services <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <section className="py-20" style={{ backgroundColor: "#042042" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Next Steps</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Let&apos;s Transform Your Business
          </h2>
          <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            Contact us today to discuss how {service.title} can help you achieve your goals — with enterprise-grade quality and transparent pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{ backgroundColor: "#1ABFAD" }}>
              Schedule a Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/services"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ border: "1.5px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.8)" }}>
              <ArrowLeft className="w-4 h-4" /> All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

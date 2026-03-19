import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, CheckCircle2,
  Building2, Rocket, Store,
  SearchCode, ClipboardCheck, RefreshCw, Briefcase, Lightbulb, Shield, TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Technology Consulting India — IT Strategy, Software Audit & AI Advisory | Doomple",
  description:
    "Expert technology consulting for startups, MSMEs and enterprises in India. Services include technology strategy consulting, software & code audit, process & platform audit, legacy software modernisation and AI strategy advisory.",
  alternates: { canonical: "https://doomple.com/consulting" },
  openGraph: {
    title: "Technology Consulting India — Strategy, Audit & AI Advisory | Doomple Technologies",
    description:
      "Independent technology consulting for growing Indian businesses. Strategy, software audits, legacy modernisation and AI consulting grounded in real delivery experience.",
    url: "https://doomple.com/consulting",
    type: "website",
  },
};

const consultingServices = [
  {
    icon: Briefcase,
    title: "Technology Strategy & Consulting",
    description: "Strategic roadmaps, build-vs-buy decisions, team structure advice, and technology governance — aligned to your business objectives.",
    href: "/services/technology-consulting",
    color: "#1ABFAD",
  },
  {
    icon: SearchCode,
    title: "Software & Code Audit",
    description: "Independent expert review of your codebase, architecture, security posture, and engineering practices — with a clear prioritised remediation plan.",
    href: "/services/software-audit",
    color: "#3BB2F6",
  },
  {
    icon: ClipboardCheck,
    title: "Process & Platform Audit",
    description: "Map your business workflows against your technology platforms, identify misalignments, quantify the cost of inefficiency, and get a concrete improvement roadmap.",
    href: "/services/process-platform-audit",
    color: "#1ABFAD",
  },
  {
    icon: RefreshCw,
    title: "Legacy Software Audit & Modernisation",
    description: "Systematic assessment and de-risked migration of legacy systems — from documenting what you have to executing a phased modernisation without disrupting operations.",
    href: "/services/legacy-modernization",
    color: "#3BB2F6",
  },
  {
    icon: Lightbulb,
    title: "AI Strategy & Consulting",
    description: "Identify high-value AI opportunities, build a realistic adoption roadmap, and get expert guidance on architecture, vendors, and responsible AI governance.",
    href: "/services/ai-consulting",
    color: "#1ABFAD",
  },
];

const segments = [
  {
    icon: Rocket,
    label: "Startups",
    tagline: "Move fast without breaking things",
    description: "Startups can't afford to make expensive technology mistakes. We act as your fractional CTO — helping you choose the right stack, audit inherited codebases before investment rounds, avoid over-engineering, and build the technology foundation that scales with your growth.",
    challenges: [
      "Choosing the right tech stack for your product",
      "Auditing code before an investment round or acquisition",
      "Avoiding costly over-engineering in early stages",
      "Building governance before scaling the team",
    ],
  },
  {
    icon: Store,
    label: "MSMEs",
    tagline: "Grow with confidence, not complexity",
    description: "MSMEs often reach a point where the tools and processes that worked at 10 employees are breaking at 100. We help you audit your current technology landscape, identify the bottlenecks, consolidate your platforms, and build a technology plan that supports the next phase of growth.",
    challenges: [
      "Technology platforms that no longer match how the business works",
      "Manual processes masking gaps in your systems",
      "Over-paying for platforms with features you never use",
      "No internal technology leadership to drive improvement",
    ],
  },
  {
    icon: Building2,
    label: "Enterprise",
    tagline: "Transform at scale without disruption",
    description: "Enterprises face the challenge of modernising mission-critical systems while keeping the business running. We bring independent expertise to your most complex decisions — legacy system migrations, technology rationalisation after mergers, and large-scale digital transformation.",
    challenges: [
      "Legacy systems that are too risky to touch but too expensive to keep",
      "Post-merger technology rationalisation and integration",
      "Coordinating large-scale technology change across business units",
      "Independent validation of technology decisions for the board",
    ],
  },
];

const whyDoomple = [
  { icon: Shield,     title: "Truly Independent",           description: "We have no vendor relationships or commissions. Our only obligation is to give you the right advice — even if that means recommending a simpler or cheaper solution." },
  { icon: CheckCircle2, title: "Builders, Not Just Advisors", description: "Our consultants have hands-on experience building production systems. Our advice is grounded in what actually works — not textbook frameworks." },
  { icon: TrendingUp, title: "Business-Outcome Focused",    description: "Every recommendation we make is tied to a business outcome. We measure success by what changes in your business, not by the number of slides we deliver." },
  { icon: Briefcase,  title: "Right-Sized for You",         description: "Whether you're a 10-person startup or a 10,000-person enterprise, we scope our engagement to your context, budget, and pace — not a one-size-fits-all model." },
];

const faqs = [
  {
    q: "What is technology consulting for businesses in India?",
    a: "Technology consulting means getting expert, independent advice on your technology decisions — from choosing the right tech stack and platforms, to auditing your codebase, modernising legacy systems and building an AI adoption roadmap. Doomple provides all these services for startups, MSMEs and enterprises.",
  },
  {
    q: "How much does a software audit cost in India?",
    a: "Costs vary based on the size and complexity of the codebase. We scope each audit individually after a discovery call — most small-to-medium codebase audits are completed within 2–4 weeks at a fixed, agreed price. Contact us for a no-obligation scoping conversation.",
  },
  {
    q: "What is legacy software modernisation?",
    a: "Legacy modernisation is the process of upgrading outdated systems to modern, maintainable architectures — without disrupting operations. It involves documenting what you have, identifying risks, choosing the right migration strategy and executing in phased stages to minimise downtime.",
  },
  {
    q: "Do you offer technology consulting for startups in India?",
    a: "Yes. We offer fractional CTO and technology strategy consulting specifically for startups. We help founders choose the right tech stack, audit inherited code before funding rounds, set up engineering governance, and make smart build-vs-buy decisions — all scoped to startup budgets.",
  },
  {
    q: "What is the difference between a process audit and a software audit?",
    a: "A software audit reviews your codebase, architecture and security. A process and platform audit maps your business workflows against your technology platforms — identifying where manual work, inefficiencies and misalignments are costing you time and money.",
  },
  {
    q: "How long does a consulting engagement take?",
    a: "A discovery call takes 45–60 minutes. A focused software or process audit typically runs 2–4 weeks. A full technology strategy or legacy modernisation programme may take 4–12 weeks depending on scope. We provide a fixed timeline and price before starting.",
  },
];

export default function ConsultingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 sm:py-28" style={{ backgroundColor: "#042042" }}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at bottom left, rgba(59,178,246,0.07) 0%, transparent 65%)" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Consulting & Advisory</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
            Technology Consulting
            <span className="block mt-1" style={{ background: "linear-gradient(135deg, #1ABFAD, #3BB2F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              for Every Stage of Growth
            </span>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
            Startups, MSMEs, and enterprises trust Doomple to help them make better technology decisions — through honest advice, independent audits, and practical roadmaps grounded in real-world delivery experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact?type=consulting"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{ backgroundColor: "#1ABFAD" }}>
              Book a Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#services"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ border: "1.5px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.8)" }}>
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Who We Serve ── */}
      <section className="py-16 sm:py-20 bg-white" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Who We Help</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] mb-3">Built for Every Business Scale</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              We tailor our consulting approach to your size, budget, and pace — not a one-size-fits-all model.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {segments.map((seg) => {
              const Icon = seg.icon;
              return (
                <div key={seg.label} className="bg-white rounded-xl p-8 hover:shadow-md transition-all duration-200"
                  style={{ border: "1px solid #E5E7EB", borderLeft: "4px solid #1ABFAD" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                    <Icon className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-1">{seg.label}</p>
                  <h3 className="text-lg font-bold text-[#042042] mb-3">{seg.tagline}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed mb-5">{seg.description}</p>
                  <ul className="space-y-2">
                    {seg.challenges.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#1ABFAD" }} />
                        <span className="text-sm text-[#374151]">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Consulting Services ── */}
      <section id="services" className="py-16 sm:py-20" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Our Services</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] mb-3">Consulting Services</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              From high-level strategy through hands-on audits to full modernisation programmes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {consultingServices.map((svc) => {
              const Icon = svc.icon;
              return (
                <Link key={svc.href} href={svc.href} className="group">
                  <div className="h-full bg-white rounded-xl p-7 transition-all duration-200 hover:shadow-md flex flex-col"
                    style={{ border: "1px solid #E5E7EB" }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${svc.color}18` }}>
                      <Icon className="w-5 h-5" style={{ color: svc.color }} />
                    </div>
                    <h3 className="text-base font-bold text-[#042042] mb-2 group-hover:text-[#1ABFAD] transition-colors leading-snug">
                      {svc.title}
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed flex-1 mb-4">{svc.description}</p>
                    <div className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#1ABFAD" }}>
                      Learn more <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How an Engagement Works ── */}
      <section className="py-16 sm:py-20 bg-white" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Our Process</p>
            <h2 className="text-3xl font-bold text-[#042042]">How an Engagement Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Discovery Call", desc: "We understand your context, challenges, and what a successful outcome looks like." },
              { step: "02", title: "Scoping", desc: "We define the audit or engagement scope, timeline, and commercial terms." },
              { step: "03", title: "Assessment", desc: "Deep-dive into your systems, processes, code, or strategy — depending on the engagement." },
              { step: "04", title: "Report & Roadmap", desc: "We deliver findings, recommendations, and a prioritised action plan to your team." },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6" style={{ border: "1px solid #E5E7EB" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 text-sm font-bold text-white"
                  style={{ backgroundColor: "#042042" }}>
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-[#042042] mb-2">{item.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Doomple ── */}
      <section className="py-16 sm:py-20" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Why Us</p>
            <h2 className="text-3xl font-bold text-[#042042]">Why Choose Doomple for Consulting?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyDoomple.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white rounded-xl p-6 text-center" style={{ border: "1px solid #E5E7EB" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                    <Icon className="w-6 h-6" style={{ color: "#1ABFAD" }} />
                  </div>
                  <h3 className="text-base font-bold text-[#042042] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20 bg-white" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Common Questions</p>
            <h2 className="text-3xl font-bold text-[#042042] mb-3">Frequently Asked Questions</h2>
            <p className="text-[#6B7280]">Common questions about technology consulting for businesses in India.</p>
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
              }),
            }}
          />
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <details key={i} className="group bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer font-semibold text-[#042042] text-sm list-none">
                  <span>{q}</span>
                  <span className="text-lg font-light group-open:rotate-45 transition-transform flex-shrink-0" style={{ color: "#1ABFAD" }}>+</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-[#374151] leading-relaxed" style={{ borderTop: "1px solid #F3F4F6" }}>
                  <div className="pt-4">{a}</div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ backgroundColor: "#042042" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Get Expert Advice</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Get Expert Advice?</h2>
          <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            Whether you need a quick strategy call or a full audit programme, we'll scope it to your needs and budget. No obligation, no jargon.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact?type=consulting"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{ backgroundColor: "#1ABFAD" }}>
              Book a Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/services"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ border: "1.5px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.8)" }}>
              All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

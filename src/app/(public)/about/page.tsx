import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Target, Eye, Lightbulb, Users,
  MapPin, Phone, Mail, CheckCircle2, Award,
  Globe, Code, Brain, ShieldCheck, Rocket,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Doomple Technologies — Software Development Company in Gurgaon, India",
  description:
    "Doomple Technologies is a software development and technology consulting company based in Gurgaon, India. We serve startups, MSMEs and enterprises with custom software, AI solutions and strategic technology consulting.",
  alternates: { canonical: "https://doomple.com/about" },
  openGraph: {
    title: "About Doomple Technologies — Software Company in Gurgaon, India",
    description:
      "Custom software development and technology consulting company in Gurgaon, India. Serving startups, MSMEs and enterprises with software, AI and consulting.",
    url: "https://doomple.com/about",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Doomple Technologies",
  image: "https://doomple.com/logo.png",
  description: "Custom software development and technology consulting company in Gurgaon, Haryana, India",
  url: "https://doomple.com",
  telephone: "+91-9211698507",
  email: "sneha@doomple.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "H. No.113 Gali No.1, VIKAS NAGAR, Basai Road",
    addressLocality: "Gurgaon",
    addressRegion: "Haryana",
    postalCode: "122001",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "28.4595",
    longitude: "77.0266",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
  areaServed: [
    { "@type": "Country", name: "India" },
    { "@type": "Country", name: "United Kingdom" },
    { "@type": "Country", name: "United States" },
    { "@type": "Country", name: "Australia" },
    { "@type": "Country", name: "Singapore" },
    { "@type": "Country", name: "United Arab Emirates" },
  ],
};

const stats = [
  { value: "100+", label: "Projects Delivered" },
  { value: "50+", label: "Clients Across 6 Countries" },
  { value: "8+", label: "Industry Verticals" },
  { value: "24 hrs", label: "Response Guarantee" },
];

const capabilities = [
  {
    icon: Code,
    title: "Custom Software Development",
    desc: "End-to-end software development — web platforms, mobile apps, e-commerce, SaaS and enterprise systems.",
    items: ["Custom software & web platforms", "iOS & Android mobile apps", "E-commerce & marketplace builds", "ERP & enterprise systems", "DevOps & cloud infrastructure"],
    color: "#1ABFAD",
  },
  {
    icon: Brain,
    title: "AI & Data Solutions",
    desc: "Data engineering, analytics, AI model training and chatbot development — practical AI that creates measurable value.",
    items: ["Data analytics & BI dashboards", "Data pipelines & engineering", "AI chatbots & intelligent agents", "Custom AI model training", "AI strategy & readiness consulting"],
    color: "#3BB2F6",
  },
  {
    icon: Award,
    title: "Technology Consulting",
    desc: "Independent advisory on technology decisions — strategy, software audits, process reviews and legacy modernisation.",
    items: ["Technology strategy & CTO advisory", "Software & code audit", "Process & platform audit", "Legacy system modernisation", "AI strategy consulting"],
    color: "#1ABFAD",
  },
];

const philosophy = [
  {
    icon: Lightbulb,
    title: "Consulting-First",
    desc: "We don't start building until we understand your business. Every engagement begins with discovery — so the software we deliver solves the right problem, not just the stated one.",
  },
  {
    icon: Users,
    title: "Transparent & Collaborative",
    desc: "No black boxes. We maintain clear communication, provide regular progress visibility and involve your team in decisions — working as an extension of your organisation, not a distant vendor.",
  },
  {
    icon: Target,
    title: "Outcome-Driven",
    desc: "We measure success by what changes in your business — not by lines of code or slides delivered. Every deliverable is tied to a business outcome you can point to.",
  },
];

const clientTypes = [
  {
    title: "Startups",
    desc: "Limited budget, rapid iteration, and technology decisions that will define your trajectory. We act as your fractional CTO — helping you choose the right stack, build the right MVP, and avoid mistakes that slow down scaling.",
    items: ["MVP development and rapid prototyping", "Scalable architecture from day one", "Code audit before investment rounds", "Flexible engagement aligned with funding"],
  },
  {
    title: "MSMEs & SMEs",
    desc: "Tools and processes that worked at 10 employees are breaking at 100. We audit your technology landscape, identify bottlenecks and build a plan that supports the next phase of growth without enterprise-level budgets.",
    items: ["Business process automation", "Integrated operational platforms", "Software & process audits", "Implementation with minimal IT burden"],
  },
  {
    title: "Enterprises & Institutions",
    desc: "Mission-critical systems, regulatory compliance and large-scale digital transformation. We bring independent expertise to your most complex decisions — focused on de-risking change and delivering measurable outcomes.",
    items: ["Legacy system migration & modernisation", "Post-merger technology integration", "Enterprise platform solutions", "Ongoing managed services"],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 sm:py-28" style={{ backgroundColor: "#042042" }}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at bottom left, rgba(59,178,246,0.07) 0%, transparent 65%)" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-5 text-sm" style={{ color: "#1ABFAD" }}>
            <MapPin className="w-4 h-4" />
            <span>Gurgaon (Gurugram), Haryana, India · Serving clients globally</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
            About Doomple Technologies
          </h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-3xl mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
            A software development and technology consulting company based in Gurgaon, India — helping startups, MSMEs and enterprises build, automate and transform with technology.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Code, label: "Custom Software Development" },
              { icon: Brain, label: "AI & Data Solutions" },
              { icon: Globe, label: "Technology Consulting" },
              { icon: Award, label: "Legacy Modernisation" },
            ].map(({ icon: Icon, label }) => (
              <span key={label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }}>
                <Icon className="w-4 h-4" style={{ color: "#1ABFAD" }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: "#042042" }}>{s.value}</div>
                <div className="text-sm text-[#6B7280]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Who We Are ── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="eyebrow mb-3">Our Story</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] mb-5 leading-tight">Who We Are</h2>
              <p className="text-[#374151] leading-relaxed mb-4">
                Doomple Technologies is a <strong>Gurgaon-based custom software development and technology consulting company</strong>. We work with startups, MSMEs and enterprises across India and globally — helping them build scalable software, harness AI and data, and make better technology decisions.
              </p>
              <p className="text-[#374151] leading-relaxed mb-4">
                Unlike large IT services firms that treat every engagement as a resource-billing exercise, we operate as a focused, senior-led team. Our consultants and engineers have hands-on experience building production systems — which means our advice is grounded in what actually works, not textbook frameworks.
              </p>
              <p className="text-[#374151] leading-relaxed">
                From <strong>custom software development and mobile apps</strong> to <strong>AI consulting, data engineering and legacy modernisation</strong> — we cover the full technology lifecycle, so you never have to stitch together multiple agencies.
              </p>
            </div>

            {/* Contact Info Panel */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#042042" }}>
              <div className="h-1" style={{ background: "linear-gradient(90deg, #1ABFAD, #3BB2F6)" }} />
              <div className="p-8">
                <p className="text-white font-semibold mb-6">Our Location & Contact</p>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#1ABFAD" }} />
                    <div>
                      <p className="text-sm font-medium text-white mb-1">Registered Office</p>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                        H. No.113 Gali No.1, VIKAS NAGAR, Basai Road<br />
                        Gurgaon–122001, Haryana, India
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#1ABFAD" }} />
                    <div>
                      <p className="text-sm font-medium text-white mb-1">Sneha Sharma — Business Development</p>
                      <a href="tel:+919211698507" className="text-sm transition-colors" style={{ color: "#1ABFAD" }}>+91-9211698507</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#1ABFAD" }} />
                    <div>
                      <p className="text-sm font-medium text-white mb-1">Email</p>
                      <a href="mailto:sneha@doomple.com" className="text-sm transition-colors" style={{ color: "#1ABFAD" }}>sneha@doomple.com</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Globe className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#1ABFAD" }} />
                    <div>
                      <p className="text-sm font-medium text-white mb-1">Clients in</p>
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>India, UK, USA, Australia, Singapore, UAE</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <Link href="/contact"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                    style={{ backgroundColor: "#1ABFAD" }}>
                    Get in Touch <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-8" style={{ border: "1px solid #E5E7EB", borderTop: "3px solid #1ABFAD" }}>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6" style={{ color: "#1ABFAD" }} />
                <h3 className="text-xl font-bold text-[#042042]">Our Mission</h3>
              </div>
              <p className="text-[#374151] leading-relaxed">
                <strong>Empower every business with technology that scales.</strong> We believe that every business — regardless of size, stage or sector — deserves access to world-class software and expert technology advice. Our mission is to translate business challenges into practical technical solutions that deliver measurable, lasting impact.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8" style={{ border: "1px solid #E5E7EB", borderTop: "3px solid #3BB2F6" }}>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6" style={{ color: "#3BB2F6" }} />
                <h3 className="text-xl font-bold text-[#042042]">Our Vision</h3>
              </div>
              <p className="text-[#374151] leading-relaxed">
                <strong>Be the most trusted technology partner for India's growing businesses.</strong> We aspire to be the company that founders, operators and technology leaders call first — not because we're the cheapest option, but because they know we'll give them honest advice and excellent execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Do ── */}
      <section className="py-16 sm:py-20 bg-white" style={{ borderTop: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] mb-3">What We Do</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              Three interconnected capability areas — so you can work with us at whatever stage you're at.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="bg-white rounded-xl p-8 transition-all duration-200 hover:shadow-md"
                  style={{ border: "1px solid #E5E7EB" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${cap.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: cap.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-[#042042] mb-3">{cap.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed mb-5">{cap.desc}</p>
                  <ul className="space-y-2">
                    {cap.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1ABFAD" }} />
                        <span className="text-xs text-[#374151]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Delivery Philosophy ── */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">How We Work</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#042042]">Our Delivery Philosophy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {philosophy.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-white rounded-xl p-8"
                  style={{ border: "1px solid #E5E7EB", borderLeft: "4px solid #1ABFAD" }}>
                  <Icon className="w-8 h-8 mb-4" style={{ color: "#1ABFAD" }} />
                  <h3 className="text-lg font-bold text-[#042042] mb-3">{p.title}</h3>
                  <p className="text-sm text-[#374151] leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Who We Serve ── */}
      <section className="py-16 sm:py-20 bg-white" style={{ borderTop: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Our Clients</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] mb-3">Who We Work With</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              We right-size every engagement to your business stage, budget and pace.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clientTypes.map((ct) => (
              <div key={ct.title} className="bg-white rounded-xl p-8 hover:shadow-md transition-all duration-200"
                style={{ border: "1px solid #E5E7EB" }}>
                <h3 className="text-lg font-bold text-[#042042] mb-3">{ct.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-5">{ct.desc}</p>
                <ul className="space-y-2">
                  {ct.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#1ABFAD" }} />
                      <span className="text-xs text-[#374151]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ backgroundColor: "#042042" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Next Steps</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Work Together?</h2>
          <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            Whether you need a quick consultation or a full development partnership, we'd love to understand your context and see how we can help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{ backgroundColor: "#1ABFAD" }}>
              Get in Touch <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/consulting"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ border: "1.5px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.8)" }}>
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

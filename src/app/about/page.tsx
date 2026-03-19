import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/layouts";
import {
  ArrowRight,
  Award,
  Brain,
  Code,
  Globe,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Target,
  Users,
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
  description:
    "Custom software development and technology consulting company in Gurgaon, Haryana, India",
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
};

const stats = [
  { value: "100+", label: "Projects Delivered" },
  { value: "50+", label: "Clients Across 6 Countries" },
  { value: "8+", label: "Industry Verticals" },
  { value: "24 hrs", label: "Response Guarantee" },
];

const pillars = [
  {
    icon: Code,
    title: "Custom Software Delivery",
    text: "We build production-ready web platforms, mobile apps, enterprise systems, and integrations with clear execution ownership.",
  },
  {
    icon: Brain,
    title: "AI and Data Capability",
    text: "From analytics and data engineering to practical AI rollouts, we focus on solutions that create usable business advantage.",
  },
  {
    icon: Award,
    title: "Technology Consulting",
    text: "We help teams make better architecture, platform, and transformation decisions before money gets wasted in the wrong direction.",
  },
];

const principles = [
  {
    icon: Lightbulb,
    title: "Consulting First",
    text: "We start with context, constraints, and outcomes so we solve the actual business problem instead of just shipping code.",
  },
  {
    icon: Users,
    title: "Transparent Collaboration",
    text: "Clients get visibility into decisions, tradeoffs, and delivery progress. We work like a close operating partner, not a black-box vendor.",
  },
  {
    icon: Target,
    title: "Outcome Driven",
    text: "Success is measured in clarity, speed, adoption, and business movement, not in activity for activity’s sake.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-[#F9FAFB]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />

        <section
          className="relative overflow-hidden py-20 sm:py-28"
          style={{ backgroundColor: "#042042" }}
        >
          <div
            className="absolute top-0 right-0 h-[600px] w-[600px] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 h-[400px] w-[400px] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at bottom left, rgba(59,178,246,0.07) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8">
            <div>
              <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: "#1ABFAD" }}>
                <MapPin className="h-4 w-4" />
                <span>Gurgaon (Gurugram), Haryana, India · Serving clients globally</span>
              </div>
              <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                About Doomple Technologies
              </h1>
              <p
                className="mb-8 max-w-3xl text-base leading-relaxed sm:text-lg"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                We are a software development and technology consulting company helping startups,
                MSMEs, and enterprises build better digital systems, modernise operations, and move
                faster with more confidence.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  "Custom software development",
                  "AI and data solutions",
                  "Technology consulting",
                  "Legacy modernisation",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex rounded-full px-4 py-2 text-sm"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
                <Image
                  src="/images/people/about-portrait.jpg"
                  alt="Portrait of a confident business professional"
                  width={1600}
                  height={900}
                  className="h-[460px] w-full object-cover object-center"
                />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Senior-Led Thinking",
                    text: "Strategy, architecture, and delivery stay close together from discovery through execution.",
                  },
                  {
                    title: "Built for Real Teams",
                    text: "Our engagement style fits startups, growing MSMEs, and larger organizations that need sharp technical partnership.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 px-5 py-4"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p
                      className="mt-2 text-sm leading-6"
                      style={{ color: "rgba(255,255,255,0.62)" }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="border-b border-[#EADACB] bg-[linear-gradient(180deg,#FFF8F1_0%,#FFFFFF_100%)]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-center sm:grid-cols-4 sm:px-6 lg:px-8">
            {stats.map((item) => (
              <div key={item.label}>
                <p className="text-3xl font-bold text-[#042042]">{item.value}</p>
                <p className="mt-1 text-sm text-[#6B7280]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <p className="eyebrow mb-3">Who We Are</p>
                <h2 className="text-3xl font-bold text-[#042042] sm:text-4xl">
                  A focused software and consulting partner for growing organisations
                </h2>
                <div className="mt-6 space-y-4 text-[#374151] leading-8">
                  <p>
                    Doomple works at the intersection of strategy and delivery. We help teams
                    define the right systems to build, then we design and execute those systems
                    with a bias toward practicality, speed, and maintainability.
                  </p>
                  <p>
                    Our work spans product development, internal operations, AI enablement,
                    platform improvement, and modernization. Instead of splitting thinking across
                    multiple vendors, we keep consulting and implementation connected.
                  </p>
                  <p>
                    That lets our clients move from ambiguity to action faster, with fewer handoff
                    gaps and better decision quality along the way.
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#042042] p-8 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1ABFAD]">
                  Location and Contact
                </p>
                <div className="mt-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <MapPin className="mt-1 h-5 w-5 text-[#1ABFAD]" />
                    <div>
                      <p className="font-semibold">Registered Office</p>
                      <p className="mt-1 text-sm leading-6 text-white/65">
                        H. No.113 Gali No.1, VIKAS NAGAR, Basai Road
                        <br />
                        Gurgaon-122001, Haryana, India
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="mt-1 h-5 w-5 text-[#1ABFAD]" />
                    <div>
                      <p className="font-semibold">Business Development</p>
                      <a href="tel:+919211698507" className="mt-1 block text-sm text-[#7CE6DA]">
                        +91-9211698507
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="mt-1 h-5 w-5 text-[#1ABFAD]" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <a href="mailto:sneha@doomple.com" className="mt-1 block text-sm text-[#7CE6DA]">
                        sneha@doomple.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Globe className="mt-1 h-5 w-5 text-[#1ABFAD]" />
                    <div>
                      <p className="font-semibold">Active Markets</p>
                      <p className="mt-1 text-sm text-white/65">
                        India, UK, USA, Australia, Singapore, UAE
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: "#1ABFAD" }}
                >
                  Get in Touch <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#EADACB] bg-[linear-gradient(180deg,#FFF8F1_0%,#F9FAFB_100%)] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="eyebrow mb-3">What We Bring</p>
              <h2 className="text-3xl font-bold text-[#042042] sm:text-4xl">
                Core capability areas
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {pillars.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[26px] border border-[#E5E7EB] bg-white p-8 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F5]">
                    <item.icon className="h-5 w-5 text-[#1ABFAD]" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-[#042042]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6B7280]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="eyebrow mb-3">How We Work</p>
              <h2 className="text-3xl font-bold text-[#042042] sm:text-4xl">
                Operating principles behind our delivery
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {principles.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[26px] border border-[#E5E7EB] bg-[#F9FAFB] p-8"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <item.icon className="h-5 w-5 text-[#1ABFAD]" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-[#042042]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6B7280]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#042042] py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="eyebrow mb-4">Let&apos;s Build Together</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Need a delivery partner that can think and execute?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/65">
              We help teams turn technical ambiguity into clear delivery momentum across software,
              data, AI, and platform change.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-white"
                style={{ backgroundColor: "#1ABFAD" }}
              >
                Start a Conversation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-white/85"
                style={{ border: "1.5px solid rgba(255,255,255,0.18)" }}
              >
                Explore Services <ShieldCheck className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

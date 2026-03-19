"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Youtube } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import { DoompleLogo } from "@/components/ui/doomple-logo";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      heading: "Services",
      links: [
        { label: "Custom Software", href: "/services/custom-software-development" },
        { label: "Mobile App Development", href: "/services/mobile-app-development" },
        { label: "E-Commerce Development", href: "/services/ecommerce-development" },
        { label: "ERP Development", href: "/services/erp-development" },
        { label: "DevOps & Cloud", href: "/services/devops-cloud-infrastructure" },
        { label: "Remote Dev Teams", href: "/services/remote-dedicated-teams" },
      ],
    },
    {
      heading: "AI & Data",
      links: [
        { label: "Data Analytics & BI", href: "/services/data-analytics" },
        { label: "Data Engineering", href: "/services/data-engineering" },
        { label: "AI Model Training", href: "/services/ai-model-training" },
        { label: "AI Chatbots & Agents", href: "/services/ai-chatbots-agents" },
        { label: "AI Strategy", href: "/services/ai-consulting" },
        { label: "AI Training", href: "/services/ai-data-training" },
      ],
    },
    {
      heading: "Consulting",
      links: [
        { label: "Technology Strategy", href: "/services/technology-consulting" },
        { label: "Software & Code Audit", href: "/services/software-audit" },
        { label: "Process & Platform Audit", href: "/services/process-platform-audit" },
        { label: "Legacy Modernisation", href: "/services/legacy-modernization" },
        { label: "All Consulting", href: "/consulting" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Case Studies", href: "/case-studies" },
        { label: "Blog", href: "/blog" },
        { label: "Pricing", href: "/pricing" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ];

  const legal = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Refund Policy", href: "/refund-policy" },
  ];

  return (
    <footer style={{ backgroundColor: "#042042" }}>

      {/* Main footer body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10 mb-12">

          {/* Brand column — spans 2 cols */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="inline-block mb-5">
              <DoompleLogo size={40} theme="dark" variant="full" />
            </Link>

            <p className="text-sm leading-relaxed text-white/55 mb-6 max-w-xs">
              Custom software development, AI solutions and technology consulting for startups, MSMEs and enterprises. Gurgaon, India — delivering globally.
            </p>

            {/* Contact details */}
            <div className="space-y-3 mb-6">
              <a href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-3 text-sm text-white/55 hover:text-[#1ABFAD] transition-colors group">
                <Mail className="w-4 h-4 text-[#1ABFAD] flex-shrink-0" />
                {COMPANY_INFO.email}
              </a>
              <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center gap-3 text-sm text-white/55 hover:text-[#1ABFAD] transition-colors">
                <Phone className="w-4 h-4 text-[#1ABFAD] flex-shrink-0" />
                {COMPANY_INFO.phone}
              </a>
              <div className="flex items-start gap-3 text-sm text-white/55">
                <MapPin className="w-4 h-4 text-[#1ABFAD] flex-shrink-0 mt-0.5" />
                <span>{COMPANY_INFO.address}, {COMPANY_INFO.state} {COMPANY_INFO.zipCode}, India</span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Linkedin, href: "https://linkedin.com/company/doomple", label: "LinkedIn" },
                { icon: Twitter, href: "https://twitter.com/doomple", label: "Twitter" },
                { icon: Github, href: "https://github.com/doomple", label: "GitHub" },
                { icon: Youtube, href: "https://youtube.com/@doomple", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-white/15 flex items-center justify-center text-white/50 hover:text-[#1ABFAD] hover:border-[#1ABFAD]/40 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/60 hover:text-[#1ABFAD] transition-colors duration-150">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter strip */}
        <div className="rounded-xl border border-white/10 p-6 mb-10" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Stay ahead in technology</p>
              <p className="text-xs text-white/50 mt-0.5">Insights on AI, software, and digital transformation. No spam.</p>
            </div>
            <form className="flex gap-2 w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 sm:w-56 px-4 py-2.5 rounded-lg text-sm bg-white/8 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-[#1ABFAD] focus:ring-1 transition-colors"
                style={{ "--tw-ring-color": "#1ABFAD" } as React.CSSProperties}
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 whitespace-nowrap"
                style={{ backgroundColor: "#1ABFAD" }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/35">
            © {currentYear} Doomple Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {legal.map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-white/35 hover:text-white/60 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

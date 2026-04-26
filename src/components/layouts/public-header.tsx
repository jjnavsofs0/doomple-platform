"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DoompleLogo } from "@/components/ui/doomple-logo";

interface PublicHeaderProps {
  className?: string;
}

export function PublicHeader({ className }: PublicHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMenuOpen]);

  const servicesDropdown = [
    { label: "Custom Software Development", href: "/services/custom-software-development" },
    { label: "Mobile App Development", href: "/services/mobile-app-development" },
    { label: "E-Commerce Development", href: "/services/ecommerce-development" },
    { label: "ERP Development", href: "/services/erp-development" },
    { label: "CMS & Web Platforms", href: "/services/cms-web-platforms" },
    { label: "DevOps & Cloud", href: "/services/devops-cloud-infrastructure" },
    { label: "Remote Dev Teams", href: "/services/remote-dedicated-teams" },
  ];

  const aiDataDropdown = [
    { label: "Agentic AI Automation", href: "/agentic-ai" },
    { label: "Data Analytics & BI", href: "/services/data-analytics" },
    { label: "Data Engineering", href: "/services/data-engineering" },
    { label: "AI Model Training", href: "/services/ai-model-training" },
    { label: "AI Chatbots & Agents", href: "/services/ai-chatbots-agents" },
    { label: "AI Strategy & Consulting", href: "/services/ai-consulting" },
    { label: "AI & Data Training", href: "/services/ai-data-training" },
  ];

  const consultingDropdown = [
    { label: "Technology Strategy", href: "/services/technology-consulting" },
    { label: "Software & Code Audit", href: "/services/software-audit" },
    { label: "Process & Platform Audit", href: "/services/process-platform-audit" },
    { label: "Legacy Modernisation", href: "/services/legacy-modernization" },
    { label: "AI Strategy & Consulting", href: "/services/ai-consulting" },
  ];

  const solutionsDropdown = [
    { label: "Unified Education Platform", href: "/solutions/uep" },
    { label: "SaaS Toolkit", href: "/solutions/saas-toolkit" },
    { label: "Workforce Suite", href: "/solutions/workforce" },
  ];

  type DropdownItem = { label: string; href: string };
  const dropdowns: Record<string, { items: DropdownItem[]; viewAllHref: string }> = {
    Services:    { items: servicesDropdown,    viewAllHref: "/services" },
    "AI & Data": { items: aiDataDropdown,      viewAllHref: "/ai-data" },
    Consulting:  { items: consultingDropdown,  viewAllHref: "/consulting" },
    Solutions:   { items: solutionsDropdown,   viewAllHref: "/solutions" },
  };

  const simpleLinks = [
    { label: "About", href: "/about" },
    { label: "Industries", href: "/industries" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 border-b border-white/10",
        className
      )}
      style={{ backgroundColor: "#042042" }}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <DoompleLogo size={40} theme="dark" variant="full" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {/* Dropdown nav items */}
            {Object.entries(dropdowns).map(([label, { items, viewAllHref }]) => (
              <div
                key={label}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-white/75 hover:text-white transition-colors duration-150 rounded-md hover:bg-white/8">
                  {label}
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-transform duration-150 group-hover:rotate-180" />
                </button>

                {/* Dropdown panel */}
                <div
                  className={cn(
                    "absolute left-0 top-full pt-1 transition-all duration-150",
                    openDropdown === label ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                  )}
                >
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[220px]">
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:text-[#042042] hover:bg-gray-50 transition-colors duration-100 group/item"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <span className="w-0.5 h-4 rounded-full bg-[#1ABFAD] mr-3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-100" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Link
                        href={viewAllHref}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#1ABFAD] hover:text-[#15a89a] transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        View all {label} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Simple links */}
            {simpleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-white/75 hover:text-white transition-colors duration-150 rounded-md hover:bg-white/8"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg border border-white/20 hover:border-white/40 transition-all duration-150"
            >
              Client Login
            </Link>
            <Link
              href="/get-started"
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:shadow-lg"
              style={{ backgroundColor: "#1ABFAD" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#15a89a"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#1ABFAD"; }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4 space-y-1">
            {/* Dropdown sections */}
            {Object.entries(dropdowns).map(([label, { items }]) => (
              <div key={label}>
                <button
                  onClick={() => setMobileSection(mobileSection === label ? null : label)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
                >
                  {label}
                  <ChevronDown className={cn("w-4 h-4 transition-transform", mobileSection === label ? "rotate-180" : "")} />
                </button>
                {mobileSection === label && (
                  <div className="pl-4 mt-1 space-y-0.5 border-l-2 ml-3 mb-1" style={{ borderColor: "#1ABFAD" }}>
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-3 py-2 text-sm text-white/65 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Simple links */}
            {simpleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile CTAs */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white/80 border border-white/20 rounded-lg hover:bg-white/8 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Client Login
              </Link>
              <Link
                href="/get-started"
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors"
                style={{ backgroundColor: "#1ABFAD" }}
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

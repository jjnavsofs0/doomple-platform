"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  MessageCircle,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export function HeroSection() {
  const agentFlow = [
    { icon: MessageCircle, label: "WhatsApp", note: "Lead captured" },
    { icon: FileSearch, label: "Documents", note: "Data extracted" },
    { icon: ClipboardCheck, label: "Approval", note: "Human confirms" },
    { icon: Workflow, label: "System", note: "CRM updated" },
  ];

  const proofItems = [
    "Custom software and AI agents from one senior-led team",
    "Workflow automation with approvals, logs and measurable ROI",
    "Built for startups, MSMEs and enterprise teams in India",
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#042042]">
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
      <div
        className="absolute right-0 top-0 h-[520px] w-[520px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.16) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1ABFAD]/30 bg-[#1ABFAD]/10 px-4 py-1.5 text-sm font-semibold text-[#7CE6DA]">
              <Bot className="h-4 w-4" />
              Agentic AI is now a core Doomple service
            </div>

            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-[60px]">
              Build software and AI agents that move your business faster
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              Doomple helps Indian startups, SMEs and enterprises ship custom software,
              automate workflows and deploy practical agentic AI with senior engineering support.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/agentic-ai"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200"
                style={{ backgroundColor: "#1ABFAD" }}
              >
                Explore Agentic AI <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-[#042042] transition-all duration-200"
              >
                Start Your Project
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {proofItems.map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-[#0A2C54] p-4">
                  <CheckCircle2 className="mb-3 h-4 w-4 text-[#1ABFAD]" />
                  <p className="text-sm leading-6 text-white/75">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative pb-8">
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0A2C54] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
              <Image
                src="/images/people/home-hero.jpg"
                alt="A Doomple team collaborating on software and AI automation strategy"
                width={1800}
                height={1013}
                priority
                className="h-[320px] w-full object-cover object-center sm:h-[380px]"
              />

              <div className="border-t border-white/10 bg-[#042042] p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7CE6DA]">
                      Agent workflow
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      From message to approved action
                    </p>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-[#1ABFAD]" />
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  {agentFlow.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.label} className="rounded-lg bg-white p-4">
                        <Icon className="mb-3 h-5 w-5 text-[#1ABFAD]" />
                        <p className="text-sm font-semibold text-[#042042]">{step.label}</p>
                        <p className="mt-1 text-xs leading-5 text-[#6B7280]">{step.note}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 left-6 right-6 rounded-lg bg-white p-5 shadow-[0_20px_50px_rgba(4,32,66,0.22)]">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: "2-4", label: "week pilots" },
                  { value: "24h", label: "response" },
                  { value: "100+", label: "projects" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xl font-bold text-[#042042]">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #F9FAFB)" }}
      />
    </section>
  );
}

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  FileSearch,
  Gavel,
  LineChart,
  Megaphone,
  MessageCircle,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Agentic AI Automation for Indian SMEs | Doomple Technologies",
  description:
    "Agentic AI automation services for CAs, lawyers, traders, advertisers, SEO agencies, event planners and SMEs. Build WhatsApp agents, workflow agents and AI operations copilots with Doomple.",
  alternates: { canonical: "https://doomple.com/agentic-ai" },
  openGraph: {
    title: "Agentic AI Automation for Indian SMEs | Doomple Technologies",
    description:
      "Deploy practical AI agents that qualify leads, reconcile documents, draft proposals, monitor changes and execute business workflows with human approval.",
    url: "https://doomple.com/agentic-ai",
    type: "website",
  },
};

const audienceUseCases = [
  {
    icon: Scale,
    title: "CAs & Tax Professionals",
    items: ["GST return prep copilots", "Notice response drafts", "Invoice and 26AS classification"],
  },
  {
    icon: Gavel,
    title: "Lawyers & Legal Teams",
    items: ["Contract review against playbooks", "Client intake and conflict checks", "Legal research memos with citations"],
  },
  {
    icon: LineChart,
    title: "Traders & Distributors",
    items: ["Vendor quote comparison", "GSTR-2B reconciliation", "Market and competitor signal briefs"],
  },
  {
    icon: Megaphone,
    title: "Advertisers",
    items: ["Creative variant pipelines", "Campaign reporting agents", "Lead nurture and follow-up workflows"],
  },
  {
    icon: Search,
    title: "SEO Agencies",
    items: ["Keyword to content pipelines", "Technical SEO monitoring", "Content decay and refresh alerts"],
  },
  {
    icon: CalendarClock,
    title: "Event Planners",
    items: ["Vendor RFP and bid comparison", "Live timeline updates", "VIP and attendee personalization"],
  },
];

const quickAgents = [
  {
    icon: MessageCircle,
    title: "WhatsApp Lead Agent",
    description:
      "Qualifies inbound leads, answers common questions, collects documents, books calls and writes clean summaries into your CRM.",
  },
  {
    icon: FileSearch,
    title: "Document Ops Agent",
    description:
      "Reads invoices, statements, forms, contracts and emails, then classifies, extracts and prepares work for team review.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Proposal Agent",
    description:
      "Turns a requirement note into a polished proposal using past wins, service libraries, pricing logic and approval rules.",
  },
  {
    icon: Target,
    title: "Weekly Change Agent",
    description:
      "Tracks regulatory, competitor, market or search changes and prepares a practical weekly brief for clients or leadership.",
  },
];

const packages = [
  {
    title: "Agentic AI Audit",
    timeline: "1 week",
    description:
      "We map your workflows, data, tools and manual bottlenecks, then rank the best agent opportunities by ROI and risk.",
    deliverables: ["Use-case shortlist", "Automation roadmap", "Build-vs-buy recommendation"],
  },
  {
    title: "2-Week Workflow Agent Pilot",
    timeline: "2 weeks",
    description:
      "A narrow, production-minded pilot for one painful workflow with human approval, logs and clear success metrics.",
    deliverables: ["Working agent prototype", "Tool integrations", "Pilot dashboard"],
  },
  {
    title: "WhatsApp Business Agent",
    timeline: "2-4 weeks",
    description:
      "A multilingual customer or lead agent for WhatsApp, connected to your CRM, sheets, payment links or support flow.",
    deliverables: ["Conversation flows", "Knowledge base setup", "Human handoff"],
  },
  {
    title: "Custom Multi-Step Agent",
    timeline: "4+ weeks",
    description:
      "A secure agent that plans, reasons and executes across your internal tools while keeping approvals where they matter.",
    deliverables: ["Agent architecture", "System integrations", "Monitoring and governance"],
  },
];

const proofPoints = [
  "Gartner reports that only a minority of organizations have deployed AI agents today, while more than 60% expect to deploy them within two years.",
  "McKinsey highlights integration complexity, limited internal expertise and agent security as the biggest blockers to scaling agentic AI.",
  "Deloitte frames agentic AI as a workflow redesign and build-vs-buy decision, not just another software purchase.",
];

export default function AgenticAiPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <section className="relative overflow-hidden bg-[#042042] py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div
          className="absolute right-0 top-0 h-[520px] w-[520px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.16) 0%, transparent 65%)" }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1ABFAD]/30 bg-[#1ABFAD]/10 px-4 py-1.5 text-sm font-semibold text-[#7CE6DA]">
                <Bot className="h-4 w-4" />
                Agentic AI Automation
              </div>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                AI agents for WhatsApp, documents, sales, and operations
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                Build secure agents that qualify leads, read documents, draft proposals, monitor changes
                and complete repeatable workflows with human approval where it matters.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200"
                  style={{ backgroundColor: "#1ABFAD" }}
                >
                  Book an Agentic AI Call <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#use-cases"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-[#042042] transition-all duration-200"
                >
                  See Use Cases
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {[
                  "Start with one painful workflow instead of an open-ended AI transformation.",
                  "Keep audit logs, approval checkpoints and role-based access from day one.",
                ].map((item) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-[#0A2C54] p-4 text-sm leading-6 text-white/80">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0A2C54] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
                <Image
                  src="/images/people/services-overview.jpg"
                  alt="A business team planning AI automation workflows in a workshop"
                  width={1600}
                  height={1067}
                  priority
                  className="h-[340px] w-full object-cover object-center opacity-95 sm:h-[410px]"
                />
                <div className="grid gap-0 border-t border-white/10 bg-[#042042] sm:grid-cols-2">
                  {[
                    { label: "Business inputs", value: "WhatsApp, email, docs" },
                    { label: "Agent actions", value: "Draft, classify, update" },
                    { label: "Control layer", value: "Approval and audit logs" },
                    { label: "Outcome", value: "Saved hours every week" },
                  ].map((item) => (
                    <div key={item.label} className="border-b border-white/10 px-5 py-4 sm:border-r">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7CE6DA]">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { value: "1", label: "workflow selected" },
                  { value: "2-4", label: "week pilot" },
                  { value: "Human", label: "approval first" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-white px-4 py-4 shadow-[0_12px_35px_rgba(4,32,66,0.16)]">
                    <p className="text-2xl font-bold text-[#042042]">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="eyebrow mb-3">Why Now</p>
            <h2 className="text-3xl font-bold leading-tight text-[#042042] sm:text-4xl">
              The opportunity is real, but the winners will be practical
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {proofPoints.map((point) => (
              <div key={point} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                <ShieldCheck className="mb-4 h-5 w-5 text-[#1ABFAD]" />
                <p className="text-sm leading-6 text-[#374151]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="eyebrow mb-3">Use Cases by Profession</p>
            <h2 className="text-3xl font-bold leading-tight text-[#042042] sm:text-4xl">
              Built for the workflows already inside your business
            </h2>
            <p className="mt-4 text-base leading-7 text-[#6B7280]">
              We start with a workflow you already understand, then add planning, tool-use,
              memory, approvals and reporting so the agent can safely take work off your plate.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {audienceUseCases.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <div key={useCase.title} className="rounded-lg border border-[#E5E7EB] bg-white p-6">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#E8F8F6]">
                    <Icon className="h-5 w-5 text-[#1ABFAD]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#042042]">{useCase.title}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {useCase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1ABFAD]" />
                        <span className="text-sm leading-6 text-[#374151]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" style={{ borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="eyebrow mb-3">Deploy This Month</p>
              <h2 className="text-3xl font-bold leading-tight text-[#042042] sm:text-4xl">
                Pick one painful workflow. Make it measurable.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#6B7280]">
                The best first agent is not the flashiest. It is the one that saves hours every week,
                reduces follow-up friction or removes document chaos without creating operational risk.
              </p>
              <div className="mt-8 rounded-lg bg-[#042042] p-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#1ABFAD]" />
                  <p className="text-sm font-semibold text-white">Good first-agent rule</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/68">
                  Start where the input is repetitive, the output is reviewable, and the approval decision still belongs to a person.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {quickAgents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <div key={agent.title} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-6">
                    <Icon className="mb-5 h-6 w-6 text-[#1ABFAD]" />
                    <h3 className="text-base font-semibold text-[#042042]">{agent.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">{agent.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-3">Productized Offers</p>
              <h2 className="text-3xl font-bold leading-tight text-[#042042] sm:text-4xl">
                Start small, then scale what works
              </h2>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1ABFAD]">
              Discuss a package <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg) => (
              <div key={pkg.title} className="flex flex-col rounded-lg border border-[#E5E7EB] bg-white p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <Workflow className="h-5 w-5 text-[#1ABFAD]" />
                  <span className="rounded-md bg-[#E8F8F6] px-2.5 py-1 text-xs font-semibold text-[#0F766E]">
                    {pkg.timeline}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#042042]">{pkg.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#6B7280]">{pkg.description}</p>
                <ul className="mt-5 space-y-2">
                  {pkg.deliverables.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs font-medium text-[#374151]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#1ABFAD]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#042042] py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:items-center lg:px-8">
          <div>
            <p className="eyebrow mb-4">Doomple Agent Build System</p>
            <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">
              Secure agents need more than prompts
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
              We design the full operating layer: data access, tool permissions, retrieval, audit logs,
              approval checkpoints, fallback paths, monitoring and continuous improvement.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              { icon: Bot, text: "Agent design, model selection and prompt/tool architecture" },
              { icon: BadgeIndianRupee, text: "ROI model around saved hours, faster conversion and lower rework" },
              { icon: ShieldCheck, text: "Human-in-the-loop approvals for finance, legal and customer commitments" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-start gap-4 border border-white/10 bg-white/5 p-5">
                  <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1ABFAD]" />
                  <p className="text-sm leading-6 text-white/75">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="eyebrow mb-4">Get Started</p>
          <h2 className="text-3xl font-bold leading-tight text-[#042042] sm:text-4xl">
            Tell us the workflow you hate repeating
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6B7280]">
            We will help you choose one practical agent, define the success metric and build a pilot your team can actually use.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-white"
              style={{ backgroundColor: "#1ABFAD" }}
            >
              Book an Agentic AI Call <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ai-data"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D1D5DB] px-8 py-3.5 text-sm font-semibold text-[#042042]"
            >
              Explore AI & Data Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { SectionWrapper } from "@/components/layouts/section-wrapper";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

export function AgenticAiSpotlight() {
  const agents = [
    {
      icon: MessageCircle,
      title: "WhatsApp Lead Agent",
      description: "Qualifies inquiries, collects details, books calls and updates CRM without losing context.",
    },
    {
      icon: FileSearch,
      title: "Document Ops Agent",
      description: "Reads invoices, forms, statements and contracts, then extracts structured work for review.",
    },
    {
      icon: Target,
      title: "Proposal Agent",
      description: "Turns notes into polished proposals using approved pricing, service copy and past wins.",
    },
    {
      icon: Sparkles,
      title: "Weekly Change Agent",
      description: "Tracks regulations, competitors, market updates or SEO shifts and prepares client-ready briefs.",
    },
  ];

  const guardrails = [
    "Human approval before sensitive actions",
    "Tool permissions and action logs",
    "Measurable pilot before scaling",
  ];

  return (
    <SectionWrapper id="agentic-ai" background="white" padding="lg">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="eyebrow mb-3">Featured Service</p>
          <h2 className="max-w-xl text-3xl font-bold leading-tight text-[#042042] sm:text-4xl">
            Agentic AI automation for the work your team repeats every week
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#6B7280]">
            Start with one workflow: WhatsApp leads, document checks, proposal drafting,
            campaign reports, vendor comparison or client briefings. Doomple designs the agent,
            connects the tools and keeps approvals clear.
          </p>

          <div className="mt-7 rounded-lg bg-[#042042] p-6">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#1ABFAD]" />
              <p className="text-sm font-semibold text-white">Designed for safe execution</p>
            </div>
            <div className="space-y-3">
              {guardrails.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1ABFAD]" />
                  <span className="text-sm leading-6 text-white/75">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/agentic-ai"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: "#1ABFAD" }}
            >
              Explore Agentic AI <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services/agentic-ai-automation"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D1D5DB] px-6 py-3 text-sm font-semibold text-[#042042]"
            >
              Service Details
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.title} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-6">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#E8F8F6]">
                  <Icon className="h-5 w-5 text-[#1ABFAD]" />
                </div>
                <h3 className="text-base font-semibold text-[#042042]">{agent.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{agent.description}</p>
              </div>
            );
          })}

          <div className="rounded-lg border border-[#1ABFAD]/25 bg-[#E8F8F6] p-6 sm:col-span-2">
            <div className="flex items-start gap-4">
              <Workflow className="mt-1 h-6 w-6 flex-shrink-0 text-[#0F766E]" />
              <div>
                <p className="text-base font-semibold text-[#042042]">First pilot recommendation</p>
                <p className="mt-2 text-sm leading-6 text-[#374151]">
                  Choose a workflow with repetitive inputs, reviewable outputs and a clear metric:
                  hours saved, faster response time, fewer missed follow-ups or lower rework.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

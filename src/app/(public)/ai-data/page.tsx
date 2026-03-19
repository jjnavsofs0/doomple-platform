import { Metadata } from "next";
import Link from "next/link";
import {
  Brain, BarChart3, Database, Bot, Lightbulb, GraduationCap,
  ArrowRight, CheckCircle2, Cpu, TrendingUp, ShieldCheck, Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI & Data Services India | Machine Learning, Analytics & AI Consulting | Doomple",
  description:
    "Enterprise AI and data services from Doomple — data analytics & BI, data engineering, AI model training, AI chatbots & agents, AI strategy consulting, and AI/data training programs. Gurgaon, India.",
  alternates: { canonical: "https://doomple.com/ai-data" },
  openGraph: {
    title: "AI & Data Services | Doomple Technologies India",
    description:
      "From data pipelines to AI agents — Doomple delivers end-to-end AI and data capabilities for startups, MSMEs and enterprises across India.",
    url: "https://doomple.com/ai-data",
    type: "website",
  },
};

const aiServices = [
  {
    slug: "data-analytics",
    icon: BarChart3,
    title: "Data Analytics & Business Intelligence",
    description:
      "Transform raw data into clear, actionable insights. We design BI dashboards, reporting pipelines and analytical models that give your leadership real-time visibility into KPIs, trends and opportunities.",
    highlights: ["Custom dashboards (Power BI, Looker, Metabase)", "KPI framework design", "Self-serve analytics layers"],
    color: "#1ABFAD",
  },
  {
    slug: "data-engineering",
    icon: Database,
    title: "Data Engineering & Pipelines",
    description:
      "Reliable, scalable data infrastructure built for modern workloads. We architect data lakes, warehouses, streaming pipelines and ETL/ELT processes that ensure your data is clean, available and trusted.",
    highlights: ["Cloud data warehouses (BigQuery, Snowflake, Redshift)", "Real-time streaming (Kafka, Flink)", "Data quality & observability"],
    color: "#3BB2F6",
  },
  {
    slug: "ai-model-training",
    icon: Brain,
    title: "AI Model Training & Fine-Tuning",
    description:
      "Custom AI models trained on your domain data. We handle data preparation, model selection, training infrastructure, evaluation and productionisation — from classical ML to large-scale deep learning.",
    highlights: ["Fine-tuning foundation models (LLMs, Vision)", "MLOps & model deployment", "Continuous learning pipelines"],
    color: "#1ABFAD",
  },
  {
    slug: "ai-chatbots-agents",
    icon: Bot,
    title: "AI Chatbots & Intelligent Agents",
    description:
      "Production-grade AI agents that understand context, handle multi-turn conversations and integrate with your business systems. From customer support bots to autonomous workflow agents.",
    highlights: ["RAG-based knowledge assistants", "Multi-platform deployment (Web, WhatsApp, Slack)", "Human-in-the-loop escalation"],
    color: "#3BB2F6",
  },
  {
    slug: "ai-consulting",
    icon: Lightbulb,
    title: "AI Strategy & Consulting",
    description:
      "Practical AI roadmaps tailored to your business model. We evaluate your data maturity, identify high-ROI AI use cases, build business cases and guide phased implementation — without the hype.",
    highlights: ["AI readiness assessment", "Use-case prioritisation & ROI modelling", "Vendor & toolchain selection"],
    color: "#1ABFAD",
  },
  {
    slug: "ai-data-training",
    icon: GraduationCap,
    title: "AI & Data Training Programs",
    description:
      "Upskill your teams with hands-on AI and data training. We design bespoke workshops, bootcamps and learning paths for business leaders, analysts and developers — from AI fundamentals to advanced MLOps.",
    highlights: ["Executive AI literacy programs", "Data analyst bootcamps", "Developer ML & LLM workshops"],
    color: "#3BB2F6",
  },
];

const capabilities = [
  { icon: Cpu,        label: "LLM & GenAI",          desc: "GPT-4, Claude, Gemini, Mistral — fine-tuned for your domain" },
  { icon: Database,   label: "Data Infrastructure",   desc: "Cloud-native warehouses, lakes and real-time pipelines" },
  { icon: TrendingUp, label: "Predictive Analytics",  desc: "Forecasting, churn, pricing, anomaly detection models" },
  { icon: Bot,        label: "Agentic AI",             desc: "Autonomous agents, RAG systems and tool-use frameworks" },
  { icon: ShieldCheck,label: "Responsible AI",         desc: "Bias audits, explainability and compliance-ready deployments" },
  { icon: Zap,        label: "MLOps & Scale",          desc: "CI/CD for ML, model monitoring and automated retraining" },
];

export default function AiDataPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 sm:py-28" style={{ backgroundColor: "#042042" }}>
        {/* Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(26,191,173,0.12) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at bottom left, rgba(59,178,246,0.08) 0%, transparent 65%)" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">AI & Data Services</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              Enterprise AI & Data
              <span className="block mt-1" style={{ background: "linear-gradient(135deg, #1ABFAD, #3BB2F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Built for the Real World
              </span>
            </h1>
            <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
              From raw data to production AI — Doomple delivers end-to-end AI and data capabilities that create measurable business outcomes. No hype, no vendor lock-in. Just practical, scalable AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                style={{ backgroundColor: "#1ABFAD" }}
              >
                Discuss Your AI Project <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services/ai-consulting"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{ border: "1.5px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.8)" }}
              >
                AI Strategy Consulting
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Capability Strip ── */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.label} className="text-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: "rgba(26,191,173,0.1)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                  </div>
                  <p className="text-xs font-semibold text-[#042042] mb-1">{cap.label}</p>
                  <p className="text-xs text-[#6B7280] leading-snug">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="eyebrow mb-3">Our AI & Data Services</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] leading-tight">
              Six Ways We Deliver AI Value
            </h2>
            <p className="mt-3 text-[#6B7280] text-base max-w-2xl">
              Each service is a standalone capability or part of a broader AI transformation engagement — designed to integrate with your existing stack and team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiServices.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.slug}
                  className="group flex flex-col bg-white rounded-xl p-6 transition-all duration-200 hover:shadow-md"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${svc.color}18` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: svc.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-base font-semibold text-[#042042] mb-2 leading-snug group-hover:text-[#1ABFAD] transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed mb-5 flex-1">
                    {svc.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-1.5 mb-5">
                    {svc.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1ABFAD" }} />
                        <span className="text-xs text-[#374151]">{h}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Link */}
                  <Link
                    href={`/services/${svc.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                    style={{ color: "#1ABFAD" }}
                  >
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why Doomple for AI ── */}
      <section className="bg-white py-16 sm:py-20" style={{ borderTop: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="eyebrow mb-3">Why Doomple</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] leading-tight mb-4">
                Practical AI That Ships to Production
              </h2>
              <p className="text-[#6B7280] leading-relaxed mb-8">
                Many AI projects fail at the integration or productionisation stage. Doomple's end-to-end AI practice bridges the gap between experimentation and production — so your AI investments deliver actual business value.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Domain-First Approach", desc: "We start with your business problem, not a technology — ensuring AI is applied where it creates measurable ROI." },
                  { title: "End-to-End Ownership", desc: "From data strategy to deployed model, our team handles every layer — reducing handoff risk and integration delays." },
                  { title: "No Vendor Lock-In", desc: "We design architecture to be portable. Cloud-agnostic, open-source-friendly stacks give you lasting control." },
                  { title: "Transparent & Explainable", desc: "Every model comes with evaluation metrics, monitoring dashboards and documentation your team can trust." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ backgroundColor: "rgba(26,191,173,0.15)" }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#1ABFAD" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#042042] mb-0.5">{item.title}</p>
                      <p className="text-sm text-[#6B7280]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats panel */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#042042" }}>
              <div className="h-1" style={{ background: "linear-gradient(90deg, #1ABFAD, #3BB2F6)" }} />
              <div className="p-8 sm:p-10">
                <p className="text-white/60 text-sm mb-6">AI & Data at Doomple</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { value: "50+", label: "AI & Data Projects" },
                    { value: "3×", label: "Faster Time-to-Insight" },
                    { value: "40%", label: "Avg. Cost Reduction" },
                    { value: "10+", label: "Industry Verticals" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center rounded-xl py-5" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-white/45 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {[
                    "LLM, ML, NLP & Computer Vision expertise",
                    "AWS, GCP and Azure certified engineers",
                    "From prototype to enterprise scale",
                    "Ongoing model monitoring & maintenance",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#1ABFAD" }} />
                      <span className="text-sm text-white/70">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ backgroundColor: "#042042" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Get Started</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Put Your Data to Work?
          </h2>
          <p className="text-[#6B7280] mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            Let's discuss your AI & data challenges. Our team will map the highest-ROI path from where you are today to where you want to be.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{ backgroundColor: "#1ABFAD" }}
            >
              Schedule an AI Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services/ai-consulting"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ border: "1.5px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.8)" }}
            >
              AI Strategy Consulting
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

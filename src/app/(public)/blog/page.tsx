import { Metadata } from "next";
import { ArrowRight, Calendar, User, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Technology Blog — Software Development, AI & Consulting Insights | Doomple",
  description:
    "Practical insights from Doomple's engineers and consultants on software development, AI implementation, data analytics, technology consulting and digital transformation for Indian businesses.",
  alternates: { canonical: "https://doomple.com/blog" },
  openGraph: {
    title: "Technology Blog — Software, AI & Consulting Insights | Doomple Technologies",
    description:
      "Expert insights on software development, AI, data engineering, legacy modernisation and technology strategy from the Doomple team.",
    url: "https://doomple.com/blog",
    type: "website",
  },
};

const blogPosts = [
  {
    title: "The SaaS Checklist: 10 Essential Features Every Platform Needs",
    excerpt:
      "Building a SaaS platform? Here are the 10 essential features every platform needs to succeed, plus how our SaaS Backend Toolkit helps you build them faster.",
    author: "Sneha Sharma",
    date: "March 15, 2026",
    category: "SaaS Development",
    color: "#1ABFAD",
  },
  {
    title: "Digital Learning Trends 2026: What Educational Institutions Should Know",
    excerpt:
      "As education continues to evolve, institutions must adapt. We explore the top trends shaping education in 2026 and how platforms like UEP support them.",
    author: "Technology Team",
    date: "March 8, 2026",
    category: "Education Tech",
    color: "#3BB2F6",
  },
  {
    title: "Moving from Spreadsheets to Software: A Practical Guide for SMEs",
    excerpt:
      "Tired of managing everything in spreadsheets? Learn how to transition your small business to proper software systems without disruption to operations.",
    author: "Sneha Sharma",
    date: "February 28, 2026",
    category: "Business Efficiency",
    color: "#1ABFAD",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ backgroundColor: "#042042" }}
      >
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(26,191,173,0.1) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Insights & Ideas</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
            Technology
            <span
              className="block mt-1"
              style={{
                background: "linear-gradient(135deg, #1ABFAD, #3BB2F6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Blog
            </span>
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Practical insights on software development, AI, digital transformation
            and technology strategy from the Doomple team.
          </p>
        </div>
      </section>

      {/* ── Blog Posts ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {blogPosts.map((post, idx) => (
              <article
                key={idx}
                className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${post.color}, ${idx % 2 === 0 ? "#3BB2F6" : "#1ABFAD"})`,
                  }}
                />
                <div className="p-6 sm:p-8">
                  <div className="mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor: `${post.color}15`,
                        color: post.color,
                        border: `1px solid ${post.color}30`,
                      }}
                    >
                      <Tag className="w-3 h-3" />
                      {post.category}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[#042042] mb-3 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-[#6B7280] text-sm sm:text-base leading-relaxed mb-6">
                    {post.excerpt}
                  </p>

                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: "1px solid #F3F4F6" }}
                  >
                    <div className="flex flex-wrap gap-4 text-sm text-[#6B7280]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" style={{ color: "#1ABFAD" }} />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" style={{ color: "#1ABFAD" }} />
                        {post.author}
                      </div>
                    </div>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                      style={{ color: "#1ABFAD" }}
                    >
                      Read More <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#6B7280] text-sm mb-2">More articles coming soon.</p>
            <p className="text-xs text-[#9CA3AF]">
              Subscribe to our newsletter to get updates when we publish new insights.
            </p>
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <section className="py-20" style={{ backgroundColor: "#042042" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow mb-4">Stay Updated</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Get Insights Delivered
          </h2>
          <p
            className="text-base leading-relaxed mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Software development best practices, AI trends and digital transformation
            strategies — delivered to your inbox.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto rounded-xl overflow-hidden p-1"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-lg text-sm text-white placeholder-white/40 bg-transparent focus:outline-none"
            />
            <button
              className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200"
              style={{ backgroundColor: "#1ABFAD" }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

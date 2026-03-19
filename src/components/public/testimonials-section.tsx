import Link from "next/link";
import { SectionWrapper } from "@/components/layouts";
import { Star, ArrowRight } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Doomple transformed our education platform. Their attention to detail and commitment to quality exceeded our expectations.",
      author: "Dr. Rajesh Kumar",
      company: "Global Education Institute",
      role: "Chief Technology Officer",
      metric: "+42% student satisfaction",
      rating: 5,
      initials: "RK",
    },
    {
      quote: "The SaaS Backend Toolkit saved us 6 months of development time. We could focus on our unique product instead of rebuilding infrastructure.",
      author: "Priya Desai",
      company: "TechStart Innovations",
      role: "Co-Founder & CEO",
      metric: "Launched in 10 weeks",
      rating: 5,
      initials: "PD",
    },
    {
      quote: "Seamless communication, clear milestones, and delivered on time. The team genuinely understood our business — not just the tech.",
      author: "Arjun Singh",
      company: "E-Commerce Solutions Ltd",
      role: "Operations Director",
      metric: "$2.3M revenue in 6 months",
      rating: 5,
      initials: "AS",
    },
  ];

  return (
    <SectionWrapper id="testimonials" background="gray" padding="lg">
      <div className="mb-10">
        <p className="eyebrow mb-3">Client Stories</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] max-w-xl leading-tight">
            What Our Clients Say
          </h2>
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1ABFAD] hover:text-[#15a89a] transition-colors shrink-0"
          >
            Explore case studies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
            style={{ border: "1px solid #E5E7EB" }}
          >
            {/* Metric highlight bar */}
            <div
              className="px-6 py-3 flex items-center gap-2"
              style={{
                backgroundColor: idx === 1 ? "rgba(59,178,246,0.06)" : "rgba(26,191,173,0.06)",
                borderBottom: "1px solid #F3F4F6",
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: idx === 1 ? "#3BB2F6" : "#1ABFAD" }}
              >
                {t.metric}
              </span>
            </div>

            <div className="flex flex-col flex-1 p-6">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-[#374151] leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid #F3F4F6" }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: "#042042" }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#042042]">{t.author}</p>
                  <p className="text-xs text-[#6B7280]">{t.role}</p>
                  <p className="text-xs font-medium" style={{ color: "#1ABFAD" }}>{t.company}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

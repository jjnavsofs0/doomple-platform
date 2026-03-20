import Link from "next/link";
import { SectionWrapper } from "@/components/layouts/section-wrapper";
import { industries } from "@/data/industries";
import { ArrowRight } from "lucide-react";

export function IndustriesSection() {
  const featuredIndustries = industries.slice(0, 8);

  return (
    <SectionWrapper id="industries" background="white" padding="lg">
      <div className="mb-10">
        <p className="eyebrow mb-3">Sectors We Serve</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] max-w-xl leading-tight">
            Deep Domain Expertise Across Industries
          </h2>
          <Link
            href="/industries"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1ABFAD] hover:text-[#15a89a] transition-colors shrink-0"
          >
            View all industries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {featuredIndustries.map((industry, idx) => (
          <Link
            key={industry.slug}
            href={`/industries#${industry.slug}`}
            className="group flex items-center justify-between bg-white rounded-xl px-5 py-4 transition-all duration-200 hover:shadow-md hover:border-[#1ABFAD]"
            style={{ border: "1px solid #E5E7EB" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: idx % 2 === 0 ? "#1ABFAD" : "#3BB2F6" }}
              />
              <h3 className="text-sm font-semibold text-[#042042] group-hover:text-[#1ABFAD] transition-colors leading-snug">
                {industry.name}
              </h3>
            </div>
            <ArrowRight
              className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "#1ABFAD" }}
            />
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}

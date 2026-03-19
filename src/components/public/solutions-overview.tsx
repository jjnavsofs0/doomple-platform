import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { SectionWrapper } from "@/components/layouts";
import { solutions } from "@/data/solutions";
import * as Icons from "lucide-react";
import { ArrowRight, Check } from "lucide-react";

export function SolutionsOverview() {
  const featuredSolutions = solutions.slice(0, 3);

  return (
    <SectionWrapper id="solutions" background="white" padding="lg">
      <div className="mb-10">
        <p className="eyebrow mb-3">Ready-to-Deploy Platforms</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] max-w-xl leading-tight">
            Strategic Solutions That Ship Fast
          </h2>
          <Link
            href="/solutions"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1ABFAD] hover:text-[#15a89a] transition-colors shrink-0"
          >
            View all solutions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredSolutions.map((solution) => {
          const IconComponent = (
            Icons[solution.icon as keyof typeof Icons] || Icons.Server
          ) as ComponentType<SVGProps<SVGSVGElement>>;

          return (
            <div
              key={solution.slug}
              className="group flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <div className="px-6 py-5" style={{ backgroundColor: "#042042" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: "rgba(26,191,173,0.2)" }}>
                  <IconComponent className="w-5 h-5" style={{ color: "#1ABFAD" }} />
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">{solution.title}</h3>
              </div>

              <div className="flex flex-col flex-1 px-6 py-5">
                <p className="text-sm text-[#6B7280] leading-relaxed mb-5">{solution.shortDescription}</p>
                <h4 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(4,32,66,0.4)" }}>Key Modules</h4>
                <ul className="space-y-2 mb-6 flex-1">
                  {solution.includedModules.slice(0, 3).map((module, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#1ABFAD" }} />
                      {module}
                    </li>
                  ))}
                  {solution.includedModules.length > 3 && (
                    <li className="text-xs font-medium pl-6" style={{ color: "#1ABFAD" }}>
                      +{solution.includedModules.length - 3} more modules
                    </li>
                  )}
                </ul>
                <Link
                  href={`/solutions/${solution.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1ABFAD] hover:text-[#15a89a] transition-colors mt-auto"
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

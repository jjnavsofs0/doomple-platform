import Image from "next/image";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { Server } from "lucide-react";
import { SectionWrapper } from "@/components/layouts/section-wrapper";
import { solutions } from "@/data/solutions";
import { ArrowRight, Check } from "lucide-react";
import { getLucideIcon } from "@/lib/lucide-icon-map";

export function SolutionsOverview() {
  const featuredSolutions = solutions.slice(0, 3);

  return (
    <SectionWrapper id="solutions" background="white" padding="lg">
      <div className="mb-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="overflow-hidden rounded-[28px] border border-[#DDE8F2] bg-[#042042] shadow-[0_24px_70px_rgba(4,32,66,0.18)]">
          <Image
            src="/images/people/solutions-overview.jpg"
            alt="Business professionals attending a product presentation"
            width={1600}
            height={900}
            className="h-[360px] w-full object-cover object-center"
          />
        </div>

        <div>
          <p className="eyebrow mb-3">Ready-to-Deploy Platforms</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-xl text-3xl font-bold leading-tight text-[#042042] sm:text-4xl">
              Strategic Solutions That Ship Fast
            </h2>
            <Link
              href="/solutions"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1ABFAD] transition-colors hover:text-[#15a89a] shrink-0"
            >
              View all solutions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6B7280] sm:text-base">
            Our flagship platforms come with proven architecture, integrated modules, and enough
            flexibility to fit the way your organisation already operates.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              "Launch in weeks instead of rebuilding from zero",
              "Adapt branding, workflows, and business logic to your team",
              "Keep enterprise-grade foundations without enterprise drag",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#F1D8C2] bg-[#FFF5EB] px-4 py-4 text-sm leading-6 text-[#5A4A42]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredSolutions.map((solution) => {
          const IconComponent = getLucideIcon(solution.icon, Server) as ComponentType<
            SVGProps<SVGSVGElement>
          >;

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

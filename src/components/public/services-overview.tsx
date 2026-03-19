import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { SectionWrapper } from "@/components/layouts";
import { services } from "@/data/services";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";

export function ServicesOverview() {
  const featuredServices = services.slice(0, 8);

  return (
    <SectionWrapper
      id="services"
      background="white"
      padding="lg"
    >
      {/* Section header */}
      <div className="mb-10">
        <p className="eyebrow mb-3">What We Do</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#042042] max-w-xl leading-tight">
            End-to-End Technology Services
          </h2>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1ABFAD] hover:text-[#15a89a] transition-colors shrink-0"
          >
            View all services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featuredServices.map((service) => {
          const IconComponent = (
            Icons[service.icon as keyof typeof Icons] || Icons.Code
          ) as ComponentType<SVGProps<SVGSVGElement>>;

          return (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group block bg-white rounded-xl p-6 border transition-all duration-200 hover:border-[#1ABFAD] hover:shadow-md"
              style={{ borderColor: "#E5E7EB" }}
            >
              {/* Icon */}
              <div className="mb-4 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                <IconComponent className="w-5 h-5" style={{ color: "#1ABFAD" }} />
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-[#042042] mb-2 group-hover:text-[#1ABFAD] transition-colors leading-snug">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3">
                {service.shortDescription}
              </p>

              {/* Learn more */}
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#1ABFAD] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Learn more <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

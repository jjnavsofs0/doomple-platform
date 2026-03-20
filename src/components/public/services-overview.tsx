import Image from "next/image";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { SectionWrapper } from "@/components/layouts/section-wrapper";
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
      <div className="mb-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="eyebrow mb-3">What We Do</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-xl text-3xl font-bold leading-tight text-[#042042] sm:text-4xl">
              End-to-End Technology Services
            </h2>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1ABFAD] transition-colors hover:text-[#15a89a] shrink-0"
            >
              View all services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6B7280] sm:text-base">
            From product strategy and custom software to AI, DevOps, and enterprise modernisation,
            we design delivery lanes that reduce risk and keep execution moving.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              "Senior-led consulting and build execution",
              "Custom stacks for startups, MSMEs, and enterprise teams",
              "Delivery structured around measurable business outcomes",
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

        <div className="overflow-hidden rounded-[28px] border border-[#DDE8F2] bg-[#042042] shadow-[0_24px_70px_rgba(4,32,66,0.18)]">
          <Image
            src="/images/people/services-overview.jpg"
            alt="A real team collaborating during a product and consulting workshop"
            width={1600}
            height={1067}
            className="h-[360px] w-full object-cover object-center"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featuredServices.map((service) => {
          const IconComponent = (
            Icons[service.icon as keyof typeof Icons] || Icons.Code
          ) as ComponentType<SVGProps<SVGSVGElement>>;

          return (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group block rounded-[22px] border bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#1ABFAD] hover:shadow-[0_18px_40px_rgba(4,32,66,0.10)]"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(26,191,173,0.1)" }}>
                <IconComponent className="w-5 h-5" style={{ color: "#1ABFAD" }} />
              </div>

              <h3 className="text-sm font-semibold text-[#042042] mb-2 group-hover:text-[#1ABFAD] transition-colors leading-snug">
                {service.title}
              </h3>

              <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3">
                {service.shortDescription}
              </p>

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

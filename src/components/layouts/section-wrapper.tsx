import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  background?: "white" | "gray" | "dark" | "navy";
  padding?: "sm" | "md" | "lg";
  id?: string;
}

export function SectionWrapper({
  children,
  className,
  title,
  subtitle,
  background = "white",
  padding = "lg",
  id,
}: SectionWrapperProps) {
  const bgStyles: Record<string, string> = {
    white: "bg-white",
    gray: "bg-[#F9FAFB]",
    dark: "bg-[#1F2937]",
    navy: "bg-[#042042]",
  };

  const textStyles: Record<string, { heading: string; sub: string }> = {
    white: { heading: "text-[#042042]", sub: "text-[#6B7280]" },
    gray:  { heading: "text-[#042042]", sub: "text-[#6B7280]" },
    dark:  { heading: "text-white",     sub: "text-white/60"  },
    navy:  { heading: "text-white",     sub: "text-white/60"  },
  };

  const paddingClasses = {
    sm: "py-8 sm:py-12",
    md: "py-12 sm:py-16",
    lg: "py-16 sm:py-24",
  };

  const colors = textStyles[background] ?? textStyles.white;

  return (
    <section
      id={id}
      className={cn(bgStyles[background], paddingClasses[padding], "transition-colors")}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header — centred, for sections that still pass title/subtitle */}
        {(title || subtitle) && (
          <div className="mb-12 text-center sm:mb-16">
            {title && (
              <h2 className={cn("text-3xl sm:text-4xl font-bold tracking-tight", colors.heading)}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn("mt-4 text-base sm:text-lg", colors.sub)}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={className}>{children}</div>
      </div>
    </section>
  );
}

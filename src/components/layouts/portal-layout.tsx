import { PortalHeader } from "./portal-header";
import { cn } from "@/lib/utils";

interface PortalLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PortalLayout({
  children,
  className,
}: PortalLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PortalHeader />
      <main className={cn("flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8", className)}>
        {children}
      </main>
    </div>
  );
}

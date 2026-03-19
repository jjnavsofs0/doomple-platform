"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}

export function AdminLayout({
  children,
  breadcrumb,
  className,
}: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#F8FBFF_0%,#F4F7FB_100%)]">
      {/* Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 left-0"
          >
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader
          onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          breadcrumb={breadcrumb}
        />

        <main
          className={cn(
            "flex-1 overflow-auto",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

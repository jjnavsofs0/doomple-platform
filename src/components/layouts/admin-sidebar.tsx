"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  Receipt,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DoompleLogo } from "@/components/ui/doomple-logo";
import { signOut, useSession } from "next-auth/react";

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { label: "Dashboard",   href: "/admin/dashboard",   icon: LayoutDashboard },
    { label: "CRM (Leads)", href: "/admin/leads",        icon: Users },
    { label: "Clients",     href: "/admin/clients",      icon: Building2 },
    { label: "Projects",    href: "/admin/projects",     icon: Briefcase },
    { label: "Quotations",  href: "/admin/quotations",   icon: FileText },
    { label: "Invoices",    href: "/admin/invoices",     icon: Receipt },
    { label: "Payments",    href: "/admin/payments",     icon: CreditCard },
    { label: "Users",       href: "/admin/users",        icon: Users },
    { label: "Settings",    href: "/admin/settings",     icon: Settings },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  return (
    <aside
      className={cn(
        "flex flex-col h-screen transition-all duration-300 flex-shrink-0",
        isCollapsed ? "w-[72px]" : "w-64",
        className
      )}
      style={{ backgroundColor: "#042042" }}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-[72px] px-4 flex-shrink-0",
          isCollapsed ? "justify-center" : "justify-start"
        )}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Link href="/admin/dashboard">
          {isCollapsed ? (
            <DoompleLogo variant="mark" size={30} />
          ) : (
            <DoompleLogo variant="full" theme="dark" size={36} />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                active
                  ? "text-white"
                  : "text-white/55 hover:text-white hover:bg-white/5"
              )}
              style={active ? { backgroundColor: "rgba(26,191,173,0.15)" } : {}}
            >
              <Icon
                className="w-[18px] h-[18px] flex-shrink-0 transition-colors"
                style={active ? { color: "#1ABFAD" } : {}}
              />
              {!isCollapsed && (
                <span style={active ? { color: "#1ABFAD" } : {}}>{item.label}</span>
              )}
              {active && !isCollapsed && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#1ABFAD" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} className="p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User footer */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: "#1ABFAD" }}
            >
              {initials}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-white/35 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ backgroundColor: "#1ABFAD" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {session?.user?.name || "Admin"}
              </p>
              <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                {session?.user?.email || "admin@doomple.com"}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-white/35 hover:text-red-400 transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

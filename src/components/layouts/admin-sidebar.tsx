"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageSquareMore,
  Receipt,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { DoompleLogo } from "@/components/ui/doomple-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentSession } from "@/hooks/use-current-session";
import { ADMIN_GLOBAL_CHANNEL } from "@/lib/realtime";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";

interface AdminSidebarProps {
  className?: string;
}

const navGroups = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        roles: ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER", "FINANCE"],
      },
    ],
  },
  {
    label: "Revenue Ops",
    items: [
      {
        label: "CRM (Leads)",
        href: "/admin/leads",
        icon: Users,
        roles: ["SUPER_ADMIN", "ADMIN", "SALES"],
      },
      {
        label: "Clients",
        href: "/admin/clients",
        icon: Building2,
        roles: ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER", "FINANCE"],
      },
      {
        label: "Quotations",
        href: "/admin/quotations",
        icon: FileText,
        roles: ["SUPER_ADMIN", "ADMIN", "SALES", "FINANCE"],
      },
      {
        label: "Invoices",
        href: "/admin/invoices",
        icon: Receipt,
        roles: ["SUPER_ADMIN", "ADMIN", "FINANCE", "PROJECT_MANAGER"],
      },
      {
        label: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
        roles: ["SUPER_ADMIN", "ADMIN", "FINANCE"],
      },
    ],
  },
  {
    label: "Delivery",
    items: [
      {
        label: "Projects",
        href: "/admin/projects",
        icon: Briefcase,
        roles: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SALES"],
      },
      {
        label: "Tickets",
        href: "/admin/tickets",
        icon: LifeBuoy,
        roles: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SALES"],
      },
      {
        label: "Conversations",
        href: "/admin/conversations",
        icon: MessageSquareMore,
        roles: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SALES"],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Errors",
        href: "/admin/errors",
        icon: AlertTriangle,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Chatbot",
        href: "/admin/chatbot",
        icon: Bot,
        roles: ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER"],
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Shield,
        roles: ["SUPER_ADMIN"],
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
] as const;

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES: "Sales",
  PROJECT_MANAGER: "Project Manager",
  FINANCE: "Finance",
};

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openErrorCount, setOpenErrorCount] = useState(0);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [overdueInvoicesCount, setOverdueInvoicesCount] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const pathname = usePathname();
  const { data: session } = useCurrentSession();
  const navRef = useRef<HTMLElement | null>(null);

  const role = (session?.user as { role?: string })?.role || "";
  const canViewErrors = role === "SUPER_ADMIN" || role === "ADMIN";

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !role || item.roles.includes(role as never)),
    }))
    .filter((group) => group.items.length > 0);

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin" || pathname === "/admin/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const fetchSidebarCounts = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch("/api/admin/badge-counts", { cache: "no-store" });
      if (!response.ok) return;
      const result = await response.json();
      setOpenErrorCount(Number(result.openErrors || 0));
      setNewLeadsCount(Number(result.newLeads || 0));
      setOverdueInvoicesCount(Number(result.overdueInvoices || 0));
    } catch {
      // keep shell resilient
    }
  }, [session?.user?.id]);

  const handleSignOut = useCallback(() => {
    void signOut({ callbackUrl: "/login" }).catch((error) => {
      console.error("Admin sign out failed:", error);
    });
  }, []);

  useEffect(() => {
    void fetchSidebarCounts();
  }, [fetchSidebarCounts]);

  useRealtimeSubscription({
    channelName: session?.user?.id ? ADMIN_GLOBAL_CHANNEL : null,
    topics: ["errors", "notifications", "dashboard", "payments", "leads", "invoices"],
    onEvent: () => { void fetchSidebarCounts(); },
  });

  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) {
      return;
    }

    const updateScrollState = () => {
      const nextCanScrollUp = navElement.scrollTop > 12;
      const nextCanScrollDown =
        navElement.scrollTop + navElement.clientHeight < navElement.scrollHeight - 12;

      setCanScrollUp(nextCanScrollUp);
      setCanScrollDown(nextCanScrollDown);
    };

    updateScrollState();
    navElement.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      navElement.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [filteredGroups.length, isCollapsed]);

  function scrollMenu(direction: "up" | "down") {
    navRef.current?.scrollBy({
      top: direction === "up" ? -220 : 220,
      behavior: "smooth",
    });
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col overflow-hidden transition-all duration-300",
        isCollapsed ? "w-[84px]" : "w-[280px]",
        className
      )}
      style={{ backgroundColor: "#07223F" }}
    >
      <div
        className={cn(
          "flex items-center px-5 py-5",
          isCollapsed ? "justify-center" : "justify-between"
        )}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Link href="/admin" className="flex items-center">
          {isCollapsed ? (
            <DoompleLogo variant="mark" size={34} />
          ) : (
            <DoompleLogo variant="full" theme="dark" size={36} />
          )}
        </Link>

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative min-h-0 flex-1 px-3">
        <nav ref={navRef} className="scrollbar-hidden h-full min-h-0 overflow-y-auto py-5">
          <div className="space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.label} className="space-y-3">
                {!isCollapsed && (
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                    {group.label}
                  </p>
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const badgeCount =
                      item.href === "/admin/errors" ? openErrorCount :
                      item.href === "/admin/leads" ? newLeadsCount :
                      item.href === "/admin/invoices" ? overdueInvoicesCount :
                      0;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                          isCollapsed ? "justify-center" : "",
                          active
                            ? "bg-[#0F335C] text-white"
                            : "text-slate-200 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {active && !isCollapsed && (
                          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#34D3C3]" />
                        )}
                        <Icon
                          className="h-[18px] w-[18px] flex-shrink-0"
                          style={active ? { color: "#6DEADB" } : { color: "rgba(226,232,240,0.88)" }}
                        />
                        {!isCollapsed && (
                          <>
                            <span className={cn("tracking-[0.01em]", active ? "text-white" : "text-inherit")}>
                              {item.label}
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                              {badgeCount > 0 ? (
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                    active
                                      ? "bg-[#34D3C3]/20 text-[#9AF6EA]"
                                      : "bg-white/10 text-white/90"
                                  )}
                                >
                                  {badgeCount > 99 ? "99+" : badgeCount}
                                </span>
                              ) : null}
                              {active && (
                                <span className="h-2 w-2 rounded-full bg-[#34D3C3]" />
                              )}
                            </div>
                          </>
                        )}
                        {isCollapsed && badgeCount > 0 ? (
                          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#34D3C3]" />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {canScrollUp ? (
          <div className="pointer-events-none absolute inset-x-3 top-0 flex justify-center bg-gradient-to-b from-[#07223F] via-[#07223F]/95 to-transparent pt-2">
            <button
              type="button"
              onClick={() => scrollMenu("up")}
              className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
              aria-label="Scroll admin menu up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {canScrollDown ? (
          <div className="pointer-events-none absolute inset-x-3 bottom-0 flex justify-center bg-gradient-to-t from-[#07223F] via-[#07223F]/95 to-transparent pb-2 pt-8">
            <button
              type="button"
              onClick={() => scrollMenu("down")}
              className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
              aria-label="Scroll admin menu down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-white/8 px-3 py-3">
        {isCollapsed ? (
          <div className="space-y-2">
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white/70 transition-colors hover:bg-red-500/10 hover:text-red-300"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3 px-1">
            <div className="flex items-center gap-3">
              <Avatar size="md" className="h-10 w-10 rounded-2xl border border-white/10 bg-[#1ABFAD]">
                {session?.user?.image ? (
                  <AvatarImage src={session.user.image} alt={session?.user?.name || "Admin"} />
                ) : null}
                <AvatarFallback className="rounded-2xl bg-[#1ABFAD] text-sm font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="truncate text-xs text-white/60">
                  {roleLabels[role] || role || "Operations"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/profile"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

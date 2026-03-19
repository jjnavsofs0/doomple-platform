"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationInbox } from "@/components/notifications/notification-inbox";

interface AdminHeaderProps {
  onMenuClick?: () => void;
  className?: string;
  breadcrumb?: { label: string; href?: string }[];
}

const pageTitleMap: Array<{ match: RegExp; title: string; kicker: string }> = [
  { match: /^\/admin$/, title: "Dashboard", kicker: "Overview" },
  { match: /^\/admin\/dashboard$/, title: "Dashboard", kicker: "Overview" },
  { match: /^\/admin\/leads/, title: "Lead Workspace", kicker: "CRM" },
  { match: /^\/admin\/clients/, title: "Client Workspace", kicker: "Accounts" },
  { match: /^\/admin\/projects/, title: "Projects", kicker: "Delivery" },
  { match: /^\/admin\/quotations/, title: "Quotations", kicker: "Commercials" },
  { match: /^\/admin\/invoices/, title: "Invoices", kicker: "Billing" },
  { match: /^\/admin\/payments/, title: "Payments", kicker: "Collections" },
  { match: /^\/admin\/users/, title: "Users", kicker: "Access" },
  { match: /^\/admin\/settings/, title: "Settings", kicker: "System" },
  { match: /^\/admin\/profile/, title: "Profile", kicker: "Account" },
];

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES: "Sales",
  PROJECT_MANAGER: "Project Manager",
  FINANCE: "Finance",
};

export function AdminHeader({
  onMenuClick,
  className,
  breadcrumb,
}: AdminHeaderProps) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const pageMeta = useMemo(() => {
    return (
      pageTitleMap.find((entry) => entry.match.test(pathname)) || {
        title: "Admin",
        kicker: "Workspace",
      }
    );
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur",
        className
      )}
    >
      <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="rounded-2xl border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-50 md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1ABFAD]">
                {pageMeta.kicker}
              </p>
              {session?.user?.role && (
                <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  {roleLabels[session.user.role] || session.user.role}
                </span>
              )}
            </div>
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
              {pageMeta.title}
            </h1>
            {breadcrumb && breadcrumb.length > 0 ? (
              <nav className="hidden items-center gap-1.5 pt-1 text-xs text-slate-500 sm:flex">
                {breadcrumb.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                    {index > 0 && <span className="text-slate-300">/</span>}
                    {item.href ? (
                      <Link href={item.href} className="transition-colors hover:text-slate-900">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-700">{item.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            ) : (
              <p className="hidden pt-1 text-xs text-slate-500 sm:block">
                Stay on top of activity, ownership, and next actions from this workspace.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationInbox />

          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 transition-colors hover:bg-slate-50"
            >
              <Avatar size="md" className="h-9 w-9 rounded-2xl border border-slate-200 bg-[#042042]">
                {session?.user?.image ? (
                  <AvatarImage src={session.user.image} alt={session?.user?.name || "Admin"} />
                ) : null}
                <AvatarFallback className="rounded-2xl bg-[#042042] text-xs font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="max-w-[160px] truncate text-xs font-semibold text-slate-900">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="max-w-[180px] truncate text-xs text-slate-500">
                  {session?.user?.email || "admin@doomple.com"}
                </p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>

            {isUserDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {session?.user?.name || "Admin"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {session?.user?.email || "admin@doomple.com"}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[#1ABFAD]">
                      {roleLabels[session?.user?.role || ""] || session?.user?.role || "Operations"}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/admin/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <User className="h-4 w-4 text-slate-500" />
                      Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Settings className="h-4 w-4 text-slate-500" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

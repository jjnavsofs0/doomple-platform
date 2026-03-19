"use client";

import { useState } from "react";
import { Menu, Bell, Settings, User, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

interface AdminHeaderProps {
  onMenuClick?: () => void;
  className?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export function AdminHeader({
  onMenuClick,
  className,
  breadcrumb,
}: AdminHeaderProps) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { data: session } = useSession();

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-white",
        className
      )}
      style={{ borderBottom: "1px solid #E5E7EB" }}
    >
      <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile menu + Breadcrumb */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg transition-colors hover:bg-gray-100"
              aria-label="Toggle menu"
              style={{ color: "#042042" }}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="hidden sm:flex items-center gap-1.5">
              {breadcrumb.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <span className="text-xs" style={{ color: "#D1D5DB" }}>/</span>
                  )}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-sm transition-colors hover:text-[#1ABFAD]"
                      style={{ color: "#6B7280" }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold" style={{ color: "#042042" }}>
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-lg transition-colors hover:bg-gray-50"
            aria-label="Notifications"
            style={{ color: "#6B7280" }}
          >
            <Bell className="w-5 h-5" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: "#1ABFAD" }}
            />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-gray-50"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: "#1ABFAD" }}
              >
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-tight" style={{ color: "#042042" }}>
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-xs leading-tight" style={{ color: "#6B7280" }}>
                  {session?.user?.email || "admin@doomple.com"}
                </p>
              </div>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9CA3AF" }} />
            </button>

            {isUserDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserDropdownOpen(false)}
                />
                {/* Dropdown */}
                <div
                  className="absolute right-0 mt-1.5 w-52 rounded-xl shadow-lg z-50 py-1 overflow-hidden"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB" }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <p className="text-sm font-semibold" style={{ color: "#042042" }}>
                      {session?.user?.name || "Admin"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                      {session?.user?.email || "admin@doomple.com"}
                    </p>
                  </div>
                  <nav className="py-1">
                    <Link
                      href="/admin/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                      style={{ color: "#374151" }}
                    >
                      <User className="w-4 h-4" style={{ color: "#6B7280" }} />
                      Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                      style={{ color: "#374151" }}
                    >
                      <Settings className="w-4 h-4" style={{ color: "#6B7280" }} />
                      Settings
                    </Link>
                    <div style={{ borderTop: "1px solid #F3F4F6" }} className="my-1" />
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-red-50"
                      style={{ color: "#EF4444" }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

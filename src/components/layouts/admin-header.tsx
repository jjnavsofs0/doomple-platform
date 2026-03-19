"use client";

import { useState } from "react";
import { Menu, Bell, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [hasNotifications] = useState(true);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-card border-b border-border",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section: Menu Toggle & Breadcrumb */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="hidden sm:flex items-center gap-2">
              {breadcrumb.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-muted-foreground text-xs">/</span>
                  )}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Right Section: Search, Notifications, User */}
        <div className="flex items-center gap-4">
          {/* Search Placeholder */}
          <div className="hidden md:block">
            <input
              type="search"
              placeholder="Search..."
              className="px-4 py-2 rounded-lg bg-muted border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled
            />
          </div>

          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">A</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-foreground">Admin</p>
                <p className="text-xs text-muted-foreground">Admin User</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@doomple.com</p>
                </div>
                <nav className="py-2">
                  <a
                    href="/admin/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </a>
                  <a
                    href="/admin/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </a>
                  <button
                    onClick={() => {
                      // TODO: Implement logout
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

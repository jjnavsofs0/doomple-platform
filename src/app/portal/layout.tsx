'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  BriefcaseBusiness,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle2,
  X,
} from 'lucide-react';
import { useCurrentSession } from '@/hooks/use-current-session';
import { NotificationInbox } from '@/components/notifications/notification-inbox';

const navItems = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/projects', label: 'Projects', icon: FolderKanban },
  { href: '/portal/invoices', label: 'Invoices', icon: FileText },
  { href: '/portal/payments', label: 'Payments', icon: CreditCard },
  { href: '/portal/documents', label: 'Documents', icon: BriefcaseBusiness },
  { href: '/portal/profile', label: 'Profile', icon: UserCircle2 },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useCurrentSession();
  const [profile, setProfile] = useState<{
    companyName: string;
    contactPerson: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/portal/profile');
        if (!response.ok) {
          return;
        }
        const result = await response.json();
        setProfile(result);
      } catch (error) {
        console.error('Portal shell profile fetch failed:', error);
      }
    };

    fetchProfile();
  }, []);

  const displayName = profile?.contactPerson || session?.user?.name || 'Client';
  const displayEmail = profile?.email || session?.user?.email || '';
  const displayCompany = profile?.companyName || 'Client Workspace';
  const initials = useMemo(
    () =>
      displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [displayName]
  );

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActiveRoute = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#EDF5FF_0%,#F8FBFF_100%)]">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden border-r border-white/10 bg-[#042042] text-white transition-all duration-300 md:flex md:flex-col`}
      >
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1ABFAD] to-[#3BB2F6] text-white font-bold shadow-lg shadow-cyan-900/30">
              D
            </div>
            {sidebarOpen && (
              <div>
                <div className="font-bold text-white">Doomple</div>
                <p className="text-xs text-white/60">Client Portal</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
                  isActiveRoute(item.href)
                    ? 'bg-white/12 text-white shadow-inner'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </div>
            </Link>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="mx-4 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7CE6DA]">Workspace</p>
            <p className="mt-3 text-sm font-semibold text-white">{displayCompany}</p>
            <p className="mt-1 text-xs leading-5 text-white/60">
              Projects, invoices, files, and payment visibility in one place.
            </p>
          </div>
        )}

        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center justify-center rounded-xl p-2 text-white/70 transition-colors hover:bg-white/8 hover:text-white"
          >
            {sidebarOpen ? '«' : '»'}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-[#DDE8F2] bg-white/80 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 hover:bg-gray-100 md:hidden"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1ABFAD] to-[#3BB2F6] text-sm font-bold text-white">
                D
              </div>
              <div>
                <div className="text-xl font-bold text-[#042042]">Client Portal</div>
                <p className="text-xs text-[#6B7280]">Projects, billing, and shared documents</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationInbox />
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-medium text-[#042042]">{displayName}</p>
              <p className="text-xs text-[#6B7280]">{displayCompany}</p>
            </div>
            <div className="hidden h-10 rounded-2xl border border-[#DDE8F2] bg-[#F8FBFF] px-4 py-2 text-right sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
                Account
              </p>
              <p className="text-xs text-[#64748B]">{displayEmail}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DFF7F3] font-semibold text-[#0D6C62]">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <nav className="space-y-2 border-b border-[#DDE8F2] bg-white px-4 py-3 md:hidden">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                    isActiveRoute(item.href)
                      ? 'bg-[#EAF7F5] text-[#042042]'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        )}

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

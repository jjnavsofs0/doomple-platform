import { AdminLayout } from "@/components/layouts/admin-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Doomple Technologies",
  description: "Admin dashboard for Doomple Technologies",
};

interface AdminRootLayoutProps {
  children: React.ReactNode;
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}

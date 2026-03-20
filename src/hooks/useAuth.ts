"use client";

import { useMemo } from "react";
import { useCurrentSession } from "@/hooks/use-current-session";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | null;
  hasPermission: (requiredRoles: string[]) => boolean;
}

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER", "FINANCE"];
const CLIENT_ROLES = ["CLIENT"];

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useCurrentSession();

  const user = useMemo(() => {
    if (!session?.user) return null;

    return {
      id: (session.user as any).id || "",
      email: session.user.email || "",
      name: session.user.name || "",
      image: session.user.image || undefined,
    };
  }, [session?.user]);

  const role = useMemo(() => {
    return (session?.user as any)?.role || null;
  }, [session?.user]);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!user;

  const hasPermission = (requiredRoles: string[]): boolean => {
    if (!isAuthenticated || !role) return false;
    return requiredRoles.includes(role);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    role,
    hasPermission,
  };
}

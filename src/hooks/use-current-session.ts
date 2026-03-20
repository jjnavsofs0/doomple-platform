"use client";

import * as React from "react";

export type CurrentSessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string;
  emailVerificationStatus?: string;
};

export type CurrentSession = {
  expires?: string;
  user?: CurrentSessionUser;
} | null;

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionUpdater =
  | CurrentSession
  | ((current: CurrentSession) => CurrentSession);

export function useCurrentSession() {
  const [data, setData] = React.useState<CurrentSession>(null);
  const [status, setStatus] = React.useState<SessionStatus>("loading");

  const refreshSession = React.useCallback(async () => {
    try {
      setStatus("loading");

      const response = await fetch("/api/auth/session", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch session");
      }

      const nextSession = (await response.json()) as CurrentSession;
      setData(nextSession);
      setStatus(nextSession?.user?.id ? "authenticated" : "unauthenticated");
      return nextSession;
    } catch {
      setData(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  const setSessionData = React.useCallback((nextValue: SessionUpdater) => {
    setData((current) => {
      const resolved =
        typeof nextValue === "function"
          ? (nextValue as (current: CurrentSession) => CurrentSession)(current)
          : nextValue;

      setStatus(resolved?.user?.id ? "authenticated" : "unauthenticated");
      return resolved;
    });
  }, []);

  React.useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  return {
    data,
    status,
    refreshSession,
    setSessionData,
  };
}

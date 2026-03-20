"use client";

import * as React from "react";
import { useCurrentSession } from "@/hooks/use-current-session";
import { ADMIN_GLOBAL_CHANNEL, getUserPrivateChannel } from "@/lib/realtime";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";

export function useAdminLiveRefetch(topics: string[], refetch: () => void | Promise<void>) {
  const stableRefetch = React.useCallback(() => {
    void refetch();
  }, [refetch]);

  useRealtimeSubscription({
    channelName: ADMIN_GLOBAL_CHANNEL,
    topics,
    onEvent: stableRefetch,
  });
}

export function useUserLiveRefetch(topics: string[], refetch: () => void | Promise<void>) {
  const { data: session } = useCurrentSession();
  const stableRefetch = React.useCallback(() => {
    void refetch();
  }, [refetch]);

  useRealtimeSubscription({
    channelName: session?.user?.id ? getUserPrivateChannel(session.user.id) : null,
    topics,
    onEvent: stableRefetch,
  });
}

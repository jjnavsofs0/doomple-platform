"use client";

import * as React from "react";
import { getPusherClient } from "@/lib/pusher-client";
import {
  getClientErrorMessage,
  reportClientError,
  serializeClientErrorReason,
} from "@/lib/client-error-reporting";

type RealtimeSubscriptionParams = {
  channelName?: string | null;
  eventName?: string;
  topics?: string[];
  onEvent: (payload: Record<string, unknown>) => void;
};

export function useRealtimeSubscription({
  channelName,
  eventName = "entity.changed",
  topics,
  onEvent,
}: RealtimeSubscriptionParams) {
  const onEventRef = React.useRef(onEvent);
  onEventRef.current = onEvent;
  const topicsKey = topics?.join("|") || "";

  React.useEffect(() => {
    if (!channelName) {
      return;
    }

    const client = getPusherClient();
    if (!client) {
      return;
    }

    const channel = client.subscribe(channelName);
    const allowedTopics = topics || [];
    const handleSubscriptionError = (error: unknown) => {
      const message = getClientErrorMessage(error, "Realtime subscription failed");
      // "Existing subscription" fires on React StrictMode double-mount — not a real error
      if (message.toLowerCase().includes("existing subscription")) {
        return;
      }
      void reportClientError({
        title: "Realtime subscription failed",
        message,
        severity: "ERROR",
        source: "CLIENT",
        route: window.location.pathname,
        area: "realtime.subscription",
        metadata: {
          channelName,
          eventName,
          topics: allowedTopics,
          error: serializeClientErrorReason(error),
          userAgent: navigator.userAgent,
        },
      });
    };
    const handler = (payload: Record<string, unknown>) => {
      const eventTopics = Array.isArray(payload?.topics) ? payload.topics.map(String) : [];
      if (
        allowedTopics.length > 0 &&
        !allowedTopics.some((topic) => eventTopics.includes(topic))
      ) {
        return;
      }

      onEventRef.current(payload);
    };

    channel.bind(eventName, handler);
    channel.bind("pusher:subscription_error", handleSubscriptionError);

    return () => {
      channel.unbind(eventName, handler);
      channel.unbind("pusher:subscription_error", handleSubscriptionError);
    };
  }, [channelName, eventName, topicsKey]);
}

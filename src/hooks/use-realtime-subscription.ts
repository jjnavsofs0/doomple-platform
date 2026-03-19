"use client";

import * as React from "react";
import { getPusherClient } from "@/lib/pusher-client";

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

    return () => {
      channel.unbind(eventName, handler);
    };
  }, [channelName, eventName, topicsKey]);
}

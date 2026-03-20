"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { useCurrentSession } from "@/hooks/use-current-session";
import { getUserPrivateChannel } from "@/lib/realtime";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
};

export function NotificationInbox() {
  const { data: session } = useCurrentSession();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications?limit=12", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const result = await response.json();
      setItems(result.data || []);
      setUnreadCount(Number(result.unreadCount || 0));
    } catch (error) {
      console.error("Notification inbox fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [fetchNotifications, session?.user?.id]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!containerRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useRealtimeSubscription({
    channelName: session?.user?.id ? getUserPrivateChannel(session.user.id) : null,
    eventName: "notification.created",
    onEvent: () => {
      void fetchNotifications();
    },
  });

  const markRead = async (id: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => undefined);
    setUnreadCount((current) => Math.max(0, current - 1));
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    }).catch(() => undefined);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-2xl border border-slate-200 p-2.5 text-slate-600 transition-colors hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#1ABFAD] px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div className="absolute right-0 z-50 mt-2 w-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <p className="mt-1 text-xs text-slate-500">
                  Live updates from billing, CRM, delivery, and portal activity.
                </p>
              </div>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="text-xs font-medium text-[#0B6E99] transition hover:text-[#084c72]"
                >
                  Mark all read
                </button>
              ) : null}
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="px-5 py-6 text-sm text-slate-500">Loading notifications...</div>
              ) : items.length === 0 ? (
                <div className="px-5 py-6 text-sm text-slate-500">No notifications yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const content = (
                      <div
                        className={`px-5 py-4 transition-colors ${
                          item.isRead ? "bg-white" : "bg-[#F4FCFA]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <p className="text-sm leading-6 text-slate-600">{item.message}</p>
                            <p className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {!item.isRead ? (
                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#1ABFAD]" />
                          ) : null}
                        </div>
                      </div>
                    );

                    if (item.link) {
                      return (
                        <Link
                          key={item.id}
                          href={item.link}
                          onClick={() => {
                            setOpen(false);
                            void markRead(item.id);
                          }}
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="block w-full text-left"
                        onClick={() => void markRead(item.id)}
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

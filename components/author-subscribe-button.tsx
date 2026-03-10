"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { normalizeAuthorHandle } from "@/lib/authors";

const STORAGE_KEY = "v50_subscribed_authors";

interface AuthorSubscribeButtonProps {
  authorHandle: string;
  subscribeLabel: string;
  subscribedLabel: string;
}

function readSubscriptions(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item));
  } catch {
    return [];
  }
}

export function AuthorSubscribeButton({
  authorHandle,
  subscribeLabel,
  subscribedLabel
}: AuthorSubscribeButtonProps) {
  const [subscribed, setSubscribed] = useState(false);
  const key = useMemo(() => normalizeAuthorHandle(authorHandle), [authorHandle]);

  useEffect(() => {
    const list = readSubscriptions();
    setSubscribed(list.includes(key));
  }, [key]);

  function toggle() {
    const list = readSubscriptions();
    const next = list.includes(key) ? list.filter((entry) => entry !== key) : [...list, key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSubscribed(next.includes(key));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-muted"
    >
      {subscribed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {subscribed ? subscribedLabel : subscribeLabel}
    </button>
  );
}

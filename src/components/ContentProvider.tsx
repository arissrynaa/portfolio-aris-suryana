"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { profile, type Profile } from "@/data/profile";

/**
 * Runtime content override: fetches /api/content (CMS-managed data) and
 * deep-merges it over the build-time default profile. If the fetch fails
 * (backend down, non-owner network, etc.) the static build-time profile
 * is used as-is, so the site never breaks.
 */

type ContentStatus = "loading" | "ready" | "failed";

const ContentContext = createContext<{ profile: Profile; status: ContentStatus }>({
  profile,
  status: "loading",
});

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...base };
    for (const [k, v] of Object.entries(override)) out[k] = deepMerge((base as Record<string, unknown>)[k], v);
    return out as T;
  }
  // Arrays and primitives replace wholesale (authoritative CMS content)
  return override as T;
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [cms, setCms] = useState<Partial<Profile> | null>(null);
  const [status, setStatus] = useState<ContentStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content", {
      credentials: "same-origin",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (cancelled) return;
        const sections = (data && data.sections) || {};
        const merged: Partial<Profile> = {};
        // hero/about/skills/projects/contact are flattened into one profile shape
        for (const value of Object.values(sections)) {
          if (isPlainObject(value)) Object.assign(merged, value);
        }
        setCms(merged);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    return {
      profile: cms && Object.keys(cms).length > 0 ? deepMerge(profile, cms) : profile,
      status,
    };
  }, [cms, status]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useProfile(): Profile {
  return useContext(ContentContext).profile;
}

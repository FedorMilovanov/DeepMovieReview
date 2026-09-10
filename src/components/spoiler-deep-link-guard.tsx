"use client";

import { useEffect } from "react";
import type { SpoilerLevel } from "@/lib/spoilers";

function currentHashId(): string | null {
  const raw = window.location.hash.slice(1);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * A hash can survive a spoiler-level navigation even when its target is projected
 * out of the DOM. Remove that stale fragment so the URL never advertises a hidden
 * section that the current spoiler contract forbids rendering.
 */
export function SpoilerDeepLinkGuard({ spoilerLevel }: { spoilerLevel: SpoilerLevel }) {
  useEffect(() => {
    function clearStaleHash() {
      const targetId = currentHashId();
      if (!targetId || document.getElementById(targetId)) return;

      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }

    clearStaleHash();
    window.addEventListener("hashchange", clearStaleHash);
    return () => window.removeEventListener("hashchange", clearStaleHash);
  }, [spoilerLevel]);

  return null;
}

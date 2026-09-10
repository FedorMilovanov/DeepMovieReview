"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  downgradeTier,
  frameBudgetForTier,
  lowerOfTier,
  selectInitialTier,
  type ExperienceCapabilities,
  type ExperienceQualityState,
  type GraphicsBackend,
} from "@/lib/experience-quality";

type ExperienceQualityContextValue = ExperienceQualityState & {
  reportFrameSample: (frameMs: number) => void;
};

const INITIAL_STATE: ExperienceQualityState = {
  backend: "unknown",
  tier: "MEDIUM",
  dpr: 1,
  viewportWidth: 1024,
  hardwareConcurrency: undefined,
  reducedMotion: false,
  forcedColors: false,
  documentVisible: true,
};

const ExperienceQualityContext = createContext<ExperienceQualityContextValue | null>(null);

function detectBackend(): GraphicsBackend {
  const maybeWebGpuNavigator = navigator as Navigator & { gpu?: unknown };
  if (maybeWebGpuNavigator.gpu) return "webgpu";

  const canvas = document.createElement("canvas");
  const webgl2 = canvas.getContext("webgl2", { powerPreference: "high-performance" });
  return webgl2 ? "webgl2" : "none";
}

function readCapabilities(): ExperienceCapabilities {
  return {
    backend: detectBackend(),
    dpr: Math.min(window.devicePixelRatio || 1, 4),
    viewportWidth: window.innerWidth,
    hardwareConcurrency: navigator.hardwareConcurrency,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    forcedColors: window.matchMedia("(forced-colors: active)").matches,
  };
}

export function ExperienceQualityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExperienceQualityState>(INITIAL_STATE);
  const slowFramesRef = useRef(0);
  const lastDowngradeRef = useRef(0);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColorsQuery = window.matchMedia("(forced-colors: active)");

    const updateCapabilities = () => {
      const capabilities = readCapabilities();
      const allowedTier = selectInitialTier(capabilities);
      setState((current) => ({
        ...current,
        ...capabilities,
        tier:
          current.backend === "unknown"
            ? allowedTier
            : lowerOfTier(current.tier, allowedTier),
        downgradeReason:
          current.backend !== "unknown" && lowerOfTier(current.tier, allowedTier) !== current.tier
            ? "Capability or accessibility constraint lowered the allowed quality tier"
            : current.downgradeReason,
        documentVisible: document.visibilityState !== "hidden",
      }));
    };

    const updateVisibility = () => {
      setState((current) => ({
        ...current,
        documentVisible: document.visibilityState !== "hidden",
      }));
    };

    updateCapabilities();
    window.addEventListener("resize", updateCapabilities, { passive: true });
    document.addEventListener("visibilitychange", updateVisibility);
    reducedMotionQuery.addEventListener("change", updateCapabilities);
    forcedColorsQuery.addEventListener("change", updateCapabilities);

    return () => {
      window.removeEventListener("resize", updateCapabilities);
      document.removeEventListener("visibilitychange", updateVisibility);
      reducedMotionQuery.removeEventListener("change", updateCapabilities);
      forcedColorsQuery.removeEventListener("change", updateCapabilities);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.graphicsBackend = state.backend;
    root.dataset.qualityTier = state.tier.toLowerCase();
    root.dataset.reducedMotion = String(state.reducedMotion);
    root.dataset.documentVisible = String(state.documentVisible);
  }, [state.backend, state.documentVisible, state.reducedMotion, state.tier]);

  const reportFrameSample = useCallback((frameMs: number) => {
    if (!Number.isFinite(frameMs) || frameMs <= 0) return;

    setState((current) => {
      if (current.tier === "LITE") return current;

      const budget = frameBudgetForTier(current.tier);
      if (frameMs > budget) {
        slowFramesRef.current += 1;
      } else {
        slowFramesRef.current = Math.max(0, slowFramesRef.current - 1);
      }

      const now = performance.now();
      const cooldownPassed = now - lastDowngradeRef.current > 5000;
      if (slowFramesRef.current < 12 || !cooldownPassed) return current;

      slowFramesRef.current = 0;
      lastDowngradeRef.current = now;
      return {
        ...current,
        tier: downgradeTier(current.tier),
        downgradeReason: `Sustained frame time above ${budget}ms budget`,
      };
    });
  }, []);

  const value = useMemo<ExperienceQualityContextValue>(
    () => ({ ...state, reportFrameSample }),
    [reportFrameSample, state],
  );

  return (
    <ExperienceQualityContext.Provider value={value}>
      {children}
    </ExperienceQualityContext.Provider>
  );
}

export function useExperienceQuality() {
  const value = useContext(ExperienceQualityContext);
  if (!value) throw new Error("useExperienceQuality must be used inside ExperienceQualityProvider");
  return value;
}

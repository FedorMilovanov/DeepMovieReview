"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
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

export type ExperienceMode = "auto" | "lite";
export type MotionPreference = "system" | "reduced";

type ExperienceQualityContextValue = ExperienceQualityState & {
  experienceMode: ExperienceMode;
  motionPreference: MotionPreference;
  reportFrameSample: (frameMs: number) => void;
  setExperienceMode: (mode: ExperienceMode) => void;
  setMotionPreference: (preference: MotionPreference) => void;
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

const STORAGE_EXPERIENCE_MODE = "dmr:experience-mode";
const STORAGE_MOTION_PREFERENCE = "dmr:motion-preference";
const PREFERENCE_CHANGE_EVENT = "dmr:experience-preference-change";

let volatileExperienceMode: ExperienceMode = "auto";
let volatileMotionPreference: MotionPreference = "system";

const ExperienceQualityContext = createContext<ExperienceQualityContextValue | null>(null);

function detectBackend(): GraphicsBackend {
  const maybeWebGpuNavigator = navigator as Navigator & { gpu?: unknown };
  if (maybeWebGpuNavigator.gpu) return "webgpu";

  const canvas = document.createElement("canvas");
  const webgl2 = canvas.getContext("webgl2", { powerPreference: "high-performance" });
  return webgl2 ? "webgl2" : "none";
}

function readCapabilities(forceReducedMotion = false): ExperienceCapabilities {
  const systemReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    backend: detectBackend(),
    dpr: Math.min(window.devicePixelRatio || 1, 4),
    viewportWidth: window.innerWidth,
    hardwareConcurrency: navigator.hardwareConcurrency,
    reducedMotion: systemReducedMotion || forceReducedMotion,
    forcedColors: window.matchMedia("(forced-colors: active)").matches,
  };
}

function readPreference(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storePreference(key: string, value: string) {
  if (key === STORAGE_EXPERIENCE_MODE) {
    volatileExperienceMode = value === "lite" ? "lite" : "auto";
  } else if (key === STORAGE_MOTION_PREFERENCE) {
    volatileMotionPreference = value === "reduced" ? "reduced" : "system";
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preferences remain usable for the current page even when persistence is unavailable.
  }
}

function readStoredExperienceMode(): ExperienceMode {
  const stored = readPreference(STORAGE_EXPERIENCE_MODE);
  if (stored === "lite") return "lite";
  if (stored === "auto") return "auto";
  return volatileExperienceMode;
}

function readStoredMotionPreference(): MotionPreference {
  const stored = readPreference(STORAGE_MOTION_PREFERENCE);
  if (stored === "reduced") return "reduced";
  if (stored === "system") return "system";
  return volatileMotionPreference;
}

function subscribePreferenceStore(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleChange = () => callback();
  window.addEventListener("storage", handleChange);
  window.addEventListener(PREFERENCE_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(PREFERENCE_CHANGE_EVENT, handleChange);
  };
}

function publishPreferenceChange() {
  window.dispatchEvent(new Event(PREFERENCE_CHANGE_EVENT));
}

export function ExperienceQualityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExperienceQualityState>(INITIAL_STATE);
  const experienceMode = useSyncExternalStore(
    subscribePreferenceStore,
    readStoredExperienceMode,
    () => "auto" as ExperienceMode,
  );
  const motionPreference = useSyncExternalStore(
    subscribePreferenceStore,
    readStoredMotionPreference,
    () => "system" as MotionPreference,
  );
  const slowFramesRef = useRef(0);
  const lastDowngradeRef = useRef(0);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColorsQuery = window.matchMedia("(forced-colors: active)");

    const updateCapabilities = () => {
      const capabilities = readCapabilities(motionPreference === "reduced");
      const capabilityTier = selectInitialTier(capabilities);
      const allowedTier = experienceMode === "lite" ? "LITE" : capabilityTier;

      setState((current) => {
        const nextTier =
          current.backend === "unknown"
            ? allowedTier
            : lowerOfTier(current.tier, allowedTier);

        return {
          ...current,
          ...capabilities,
          tier: nextTier,
          downgradeReason:
            nextTier !== current.tier
              ? experienceMode === "lite"
                ? "User selected Lite experience"
                : "Capability or accessibility constraint lowered the allowed quality tier"
              : current.downgradeReason,
          documentVisible: document.visibilityState !== "hidden",
        };
      });
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
  }, [experienceMode, motionPreference]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.graphicsBackend = state.backend;
    root.dataset.qualityTier = state.tier.toLowerCase();
    root.dataset.reducedMotion = String(state.reducedMotion);
    root.dataset.documentVisible = String(state.documentVisible);
    root.dataset.experienceMode = experienceMode;
    root.dataset.motionPreference = motionPreference;
  }, [experienceMode, motionPreference, state.backend, state.documentVisible, state.reducedMotion, state.tier]);

  const setExperienceMode = useCallback((mode: ExperienceMode) => {
    storePreference(STORAGE_EXPERIENCE_MODE, mode);
    publishPreferenceChange();
    slowFramesRef.current = 0;
    lastDowngradeRef.current = 0;

    if (mode === "auto") {
      const capabilities = readCapabilities(motionPreference === "reduced");
      setState((current) => ({
        ...current,
        ...capabilities,
        tier: selectInitialTier(capabilities),
        downgradeReason: undefined,
      }));
    } else {
      setState((current) => ({
        ...current,
        tier: "LITE",
        downgradeReason: "User selected Lite experience",
      }));
    }
  }, [motionPreference]);

  const setMotionPreference = useCallback((preference: MotionPreference) => {
    storePreference(STORAGE_MOTION_PREFERENCE, preference);
    publishPreferenceChange();
    const capabilities = readCapabilities(preference === "reduced");
    setState((current) => ({
      ...current,
      ...capabilities,
      tier: experienceMode === "lite" ? "LITE" : lowerOfTier(current.tier, selectInitialTier(capabilities)),
    }));
  }, [experienceMode]);

  const reportFrameSample = useCallback((frameMs: number) => {
    if (!Number.isFinite(frameMs) || frameMs <= 0) return;

    setState((current) => {
      if (current.tier === "LITE" || experienceMode === "lite") return current;

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
  }, [experienceMode]);

  const value = useMemo<ExperienceQualityContextValue>(
    () => ({
      ...state,
      experienceMode,
      motionPreference,
      reportFrameSample,
      setExperienceMode,
      setMotionPreference,
    }),
    [experienceMode, motionPreference, reportFrameSample, setExperienceMode, setMotionPreference, state],
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

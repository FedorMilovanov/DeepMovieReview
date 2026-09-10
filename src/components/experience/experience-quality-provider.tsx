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

type RuntimeBackend = Exclude<GraphicsBackend, "unknown">;

type ExperienceQualityContextValue = ExperienceQualityState & {
  experienceMode: ExperienceMode;
  motionPreference: MotionPreference;
  reportFrameSample: (frameMs: number) => void;
  reportRendererBackend: (backend: Exclude<RuntimeBackend, "none">) => void;
  reportRendererFailure: (reason: string) => void;
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

function detectBackendOnce(): RuntimeBackend {
  const maybeWebGpuNavigator = navigator as Navigator & { gpu?: unknown };
  if (maybeWebGpuNavigator.gpu) return "webgpu";

  const canvas = document.createElement("canvas");
  const webgl2 = canvas.getContext("webgl2", { powerPreference: "high-performance" });
  return webgl2 ? "webgl2" : "none";
}

function readCapabilities(
  backend: GraphicsBackend,
  forceReducedMotion = false,
): ExperienceCapabilities {
  const systemReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    backend,
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
    // Current-page preference still works when persistence is unavailable.
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
  const detectedBackendRef = useRef<RuntimeBackend | null>(null);
  const rendererBackendRef = useRef<RuntimeBackend | null>(null);
  const slowFramesRef = useRef(0);
  const lastDowngradeRef = useRef(0);
  const resizeFrameRef = useRef<number | null>(null);

  const getEffectiveBackend = useCallback((): RuntimeBackend => {
    if (rendererBackendRef.current) return rendererBackendRef.current;
    if (!detectedBackendRef.current) detectedBackendRef.current = detectBackendOnce();
    return detectedBackendRef.current;
  }, []);

  const measureCapabilities = useCallback(
    () => readCapabilities(getEffectiveBackend(), motionPreference === "reduced"),
    [getEffectiveBackend, motionPreference],
  );

  const applyCapabilities = useCallback((allowUpgrade: boolean) => {
    const capabilities = measureCapabilities();
    const capabilityTier = selectInitialTier(capabilities);
    const allowedTier = experienceMode === "lite" ? "LITE" : capabilityTier;

    setState((current) => {
      const nextTier = allowUpgrade
        ? allowedTier
        : current.backend === "unknown"
          ? allowedTier
          : lowerOfTier(current.tier, allowedTier);

      const constraintLoweredTier = nextTier !== current.tier && !allowUpgrade;

      return {
        ...current,
        ...capabilities,
        tier: nextTier,
        downgradeReason:
          experienceMode === "lite"
            ? "User selected Lite experience"
            : constraintLoweredTier
              ? "Capability or accessibility constraint lowered the allowed quality tier"
              : allowUpgrade
                ? undefined
                : current.downgradeReason,
        documentVisible: document.visibilityState !== "hidden",
      };
    });
  }, [experienceMode, measureCapabilities]);

  useEffect(() => {
    if (!detectedBackendRef.current) detectedBackendRef.current = detectBackendOnce();

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColorsQuery = window.matchMedia("(forced-colors: active)");

    const updateForResize = () => {
      if (resizeFrameRef.current !== null) return;
      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        applyCapabilities(false);
      });
    };

    const updateForAccessibilityChange = () => applyCapabilities(true);
    const updateVisibility = () => {
      setState((current) => ({
        ...current,
        documentVisible: document.visibilityState !== "hidden",
      }));
    };

    applyCapabilities(true);
    window.addEventListener("resize", updateForResize, { passive: true });
    document.addEventListener("visibilitychange", updateVisibility);
    reducedMotionQuery.addEventListener("change", updateForAccessibilityChange);
    forcedColorsQuery.addEventListener("change", updateForAccessibilityChange);

    return () => {
      window.removeEventListener("resize", updateForResize);
      document.removeEventListener("visibilitychange", updateVisibility);
      reducedMotionQuery.removeEventListener("change", updateForAccessibilityChange);
      forcedColorsQuery.removeEventListener("change", updateForAccessibilityChange);
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
    };
  }, [applyCapabilities]);

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
  }, []);

  const setMotionPreference = useCallback((preference: MotionPreference) => {
    storePreference(STORAGE_MOTION_PREFERENCE, preference);
    publishPreferenceChange();
    slowFramesRef.current = 0;
    lastDowngradeRef.current = 0;
  }, []);

  const reportRendererBackend = useCallback((backend: Exclude<RuntimeBackend, "none">) => {
    const previousDetected = detectedBackendRef.current;
    rendererBackendRef.current = backend;
    const capabilities = readCapabilities(backend, motionPreference === "reduced");
    const allowedTier = experienceMode === "lite" ? "LITE" : selectInitialTier(capabilities);

    setState((current) => ({
      ...current,
      ...capabilities,
      tier: lowerOfTier(current.tier, allowedTier),
      downgradeReason:
        previousDetected && previousDetected !== backend
          ? `Renderer initialized with ${backend.toUpperCase()} fallback`
          : current.downgradeReason,
    }));
  }, [experienceMode, motionPreference]);

  const reportRendererFailure = useCallback((reason: string) => {
    rendererBackendRef.current = "none";
    slowFramesRef.current = 0;
    setState((current) => ({
      ...current,
      backend: "none",
      tier: "LITE",
      downgradeReason: reason,
    }));
  }, []);

  const reportFrameSample = useCallback((frameMs: number) => {
    if (!Number.isFinite(frameMs) || frameMs <= 0) return;

    setState((current) => {
      if (!current.documentVisible || current.tier === "LITE" || experienceMode === "lite") {
        return current;
      }

      const budget = frameBudgetForTier(current.tier);
      if (frameMs > budget) {
        slowFramesRef.current += 1;
      } else {
        slowFramesRef.current = Math.max(0, slowFramesRef.current - 1);
      }

      const now = performance.now();
      const cooldownPassed = now - lastDowngradeRef.current > 5000;
      if (slowFramesRef.current < 6 || !cooldownPassed) return current;

      slowFramesRef.current = 0;
      lastDowngradeRef.current = now;
      return {
        ...current,
        tier: downgradeTier(current.tier),
        downgradeReason: `Sustained p90 frame time above ${budget}ms budget`,
      };
    });
  }, [experienceMode]);

  const value = useMemo<ExperienceQualityContextValue>(
    () => ({
      ...state,
      experienceMode,
      motionPreference,
      reportFrameSample,
      reportRendererBackend,
      reportRendererFailure,
      setExperienceMode,
      setMotionPreference,
    }),
    [
      experienceMode,
      motionPreference,
      reportFrameSample,
      reportRendererBackend,
      reportRendererFailure,
      setExperienceMode,
      setMotionPreference,
      state,
    ],
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

export type GraphicsBackend = "unknown" | "webgpu" | "webgl2" | "none";
export type ExperienceTier = "ULTRA" | "HIGH" | "MEDIUM" | "LITE";

export type ExperienceCapabilities = {
  backend: GraphicsBackend;
  dpr: number;
  viewportWidth: number;
  hardwareConcurrency?: number;
  reducedMotion: boolean;
  forcedColors: boolean;
};

export type ExperienceQualityState = ExperienceCapabilities & {
  tier: ExperienceTier;
  downgradeReason?: string;
  documentVisible: boolean;
};

const TIER_ORDER: ExperienceTier[] = ["LITE", "MEDIUM", "HIGH", "ULTRA"];

export function selectInitialTier(capabilities: ExperienceCapabilities): ExperienceTier {
  if (capabilities.backend === "none") return "LITE";
  if (capabilities.forcedColors) return "LITE";

  if (capabilities.backend === "webgl2") {
    return capabilities.viewportWidth < 760 || capabilities.dpr > 2.5 ? "LITE" : "MEDIUM";
  }

  if (capabilities.backend === "webgpu") {
    const cores = capabilities.hardwareConcurrency ?? 4;
    if (capabilities.viewportWidth < 760 || capabilities.dpr > 2.75) return "MEDIUM";
    if (cores >= 8 && capabilities.dpr <= 2.25 && !capabilities.reducedMotion) return "ULTRA";
    return "HIGH";
  }

  return "MEDIUM";
}

export function lowerOfTier(current: ExperienceTier, allowed: ExperienceTier): ExperienceTier {
  return TIER_ORDER.indexOf(current) <= TIER_ORDER.indexOf(allowed) ? current : allowed;
}

export function downgradeTier(tier: ExperienceTier): ExperienceTier {
  const index = TIER_ORDER.indexOf(tier);
  return TIER_ORDER[Math.max(0, index - 1)];
}

export function frameBudgetForTier(tier: ExperienceTier): number {
  switch (tier) {
    case "ULTRA":
      return 22;
    case "HIGH":
      return 26;
    case "MEDIUM":
      return 34;
    case "LITE":
      return Number.POSITIVE_INFINITY;
  }
}

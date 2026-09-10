"use client";

import { useExperienceQuality } from "@/components/experience/experience-quality-provider";

export function ExperienceControls() {
  const {
    experienceMode,
    motionPreference,
    tier,
    backend,
    setExperienceMode,
    setMotionPreference,
  } = useExperienceQuality();

  return (
    <details className="experienceControls">
      <summary>
        Experience
        <span>{experienceMode === "lite" ? "Lite" : `${tier} / ${backend}`}</span>
      </summary>
      <div className="experienceControlsPanel">
        <fieldset>
          <legend>Visual quality</legend>
          <label>
            <input
              type="radio"
              name="experience-mode"
              value="auto"
              checked={experienceMode === "auto"}
              onChange={() => setExperienceMode("auto")}
            />
            <span><strong>Auto</strong><small>Adapt to device and measured runtime performance.</small></span>
          </label>
          <label>
            <input
              type="radio"
              name="experience-mode"
              value="lite"
              checked={experienceMode === "lite"}
              onChange={() => setExperienceMode("lite")}
            />
            <span><strong>Lite</strong><small>Prefer premium static/CSS presentation and skip expensive GPU enhancements.</small></span>
          </label>
        </fieldset>

        <fieldset>
          <legend>Motion</legend>
          <label>
            <input
              type="radio"
              name="motion-preference"
              value="system"
              checked={motionPreference === "system"}
              onChange={() => setMotionPreference("system")}
            />
            <span><strong>System</strong><small>Follow the operating system reduced-motion preference.</small></span>
          </label>
          <label>
            <input
              type="radio"
              name="motion-preference"
              value="reduced"
              checked={motionPreference === "reduced"}
              onChange={() => setMotionPreference("reduced")}
            />
            <span><strong>Reduced</strong><small>Reduce cinematic movement while preserving readable visual quality.</small></span>
          </label>
        </fieldset>
      </div>
    </details>
  );
}

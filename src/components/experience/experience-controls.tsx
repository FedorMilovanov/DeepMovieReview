"use client";

import { useExperienceQuality } from "@/components/experience/experience-quality-provider";

export function ExperienceControls() {
  const {
    experienceMode,
    motionPreference,
    setExperienceMode,
    setMotionPreference,
  } = useExperienceQuality();

  return (
    <details className="experienceControls">
      <summary>
        <svg className="experienceControlIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/></svg>
        <span className="experienceControlLabel">Качество</span>
        <span className="experienceControlMode">{experienceMode === "lite" ? "Lite" : "Авто"}</span>
      </summary>
      <div className="experienceControlsPanel">
        <fieldset>
          <legend>Визуальное качество</legend>
          <label>
            <input
              type="radio"
              name="experience-mode"
              value="auto"
              checked={experienceMode === "auto"}
              onChange={() => setExperienceMode("auto")}
            />
            <span><strong>Авто</strong><small>Подстраиваться под устройство и измеренную производительность.</small></span>
          </label>
          <label>
            <input
              type="radio"
              name="experience-mode"
              value="lite"
              checked={experienceMode === "lite"}
              onChange={() => setExperienceMode("lite")}
            />
            <span><strong>Lite</strong><small>Статичная подача без дорогих GPU-эффектов — без потери смысла.</small></span>
          </label>
        </fieldset>

        <fieldset>
          <legend>Движение</legend>
          <label>
            <input
              type="radio"
              name="motion-preference"
              value="system"
              checked={motionPreference === "system"}
              onChange={() => setMotionPreference("system")}
            />
            <span><strong>Системное</strong><small>Следовать настройке «уменьшенное движение» в операционной системе.</small></span>
          </label>
          <label>
            <input
              type="radio"
              name="motion-preference"
              value="reduced"
              checked={motionPreference === "reduced"}
              onChange={() => setMotionPreference("reduced")}
            />
            <span><strong>Уменьшенное</strong><small>Сократить кинематографичное движение, сохранив читаемость.</small></span>
          </label>
        </fieldset>
      </div>
    </details>
  );
}

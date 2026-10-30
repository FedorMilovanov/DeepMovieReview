/**
 * Presentation-only timecode formatting.
 *
 * The gate against drifting claims lives in the integrity layer: every
 * timestamp in an article timeline must equal the evidence record's number. This
 * module only decides how a number looks on screen, so it deliberately knows
 * nothing about the film, the edition or the master.
 */
export function formatTimecode(seconds: number | undefined): string {
  if (seconds === undefined || !Number.isFinite(seconds)) return "таймкод не указан";
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

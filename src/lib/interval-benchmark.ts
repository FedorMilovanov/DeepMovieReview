// A scheduled frame can be very slow, especially on software renderers. Do not
// discard long positive intervals: that would make the result look faster.
export function validInterval(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function intervalP95(values: readonly number[]): number | null {
  const sorted = values.filter(validInterval).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * 0.95) - 1));
  return Number(sorted[index].toFixed(2));
}

// Aim for 1.2 seconds, but permit a slow renderer a bounded extra window to
// deliver at least one interval. Absence of samples remains "not measured".
export function continueIntervalBenchmark(elapsedMs: number, samples: number): boolean {
  return elapsedMs < 1200 || (samples === 0 && elapsedMs < 5000);
}

/**
 * Russian cardinal pluralization: one / few / many.
 *
 * - one: 1, 21, 31, 101, … (but never 11, 111, …);
 * - few: 2–4, 22–24, 32–34, … (but never 12–14, 112–114, …);
 * - many: everything else, including 0, 5–20 and the 11–14 exception band.
 *
 * Counts in this codebase always come from array lengths, so the input is a
 * non-negative integer by construction.
 */
export function pluralRu(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export type LensKey =
  | "story"
  | "people"
  | "relationships"
  | "ideas"
  | "moral-world"
  | "craft";

export type NarrativePermissionState =
  | "CONDEMNED"
  | "COSTLY"
  | "QUESTIONED"
  | "UNCHALLENGED"
  | "NORMALIZED"
  | "REWARDED"
  | "CELEBRATED"
  | "AMBIGUOUS";

export type ShellFilm = {
  slug: string;
  title: string;
  originalTitle?: string;
  year: number;
  director: string;
  runtime: string;
  genre: string[];
  premise: string;
  thesisQuestion: string;
  status: "fixture" | "draft" | "published";
};

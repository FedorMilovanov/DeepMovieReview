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

export type HomepageFixture = {
  featuredFilm: ShellFilm;
  lenses: Array<{ key: LensKey; label: string; prompt: string }>;
  storyBeats: Array<{ label: string; summary: string; spoilerSafe: boolean }>;
  characters: Array<{
    id: string;
    name: string;
    wants: string;
    fears: string;
    contradiction: string;
  }>;
  relationship: {
    id: string;
    label: string;
    people: [string, string];
    summary: string;
    events: Array<{
      id: string;
      label: string;
      change: string;
      tone: "trust" | "fracture" | "pressure" | "repair";
    }>;
  };
  familyYouth: Array<{ label: string; observation: string }>;
  meaning: {
    theme: string;
    question: string;
    apparentClaim: string;
    counterevidence: string;
    confidence: "HIGH" | "MEDIUM" | "LOW";
  };
  permissions: Array<{
    subject: string;
    state: NarrativePermissionState;
    rationale: string;
  }>;
  craft: Array<{ device: string; effect: string }>;
  sceneAutopsy: {
    label: string;
    act: string;
    motive: string;
    knowledge: string;
    pressure: string;
    consequence: string;
  };
  decision: {
    question: string;
    knownThen: string[];
    revealedLater: string[];
  };
  biblicalSynthesis: {
    observation: string;
    principle: string;
    application: string;
    qualification: string;
  };
};

export const homepageFixture: HomepageFixture = {
  featuredFilm: {
    slug: "pilot-film",
    title: "Pilot Film",
    year: 2026,
    director: "Editorial fixture",
    runtime: "—",
    genre: ["Drama"],
    premise:
      "A temporary fixture used to prove the platform shell before a real film analysis is selected.",
    thesisQuestion: "What does a story teach through the people and relationships it rewards?",
    status: "fixture",
  },
  lenses: [
    { key: "story", label: "Story", prompt: "What happens, and why does each turn matter?" },
    { key: "people", label: "People", prompt: "What do the characters want, fear, believe and become?" },
    { key: "relationships", label: "Relationships", prompt: "How do trust, power, loyalty and repair change?" },
    { key: "ideas", label: "Ideas", prompt: "What questions about life does the film appear to answer?" },
    { key: "moral-world", label: "Moral world", prompt: "What is condemned, normalized, rewarded or left unchallenged?" },
    { key: "craft", label: "Craft", prompt: "How do camera, music, editing and performance shape sympathy?" },
  ],
  storyBeats: [
    { label: "Premise", summary: "A stable world establishes expectations.", spoilerSafe: true },
    { label: "Disruption", summary: "A conflict forces the central characters to reveal priorities.", spoilerSafe: true },
    { label: "Turning point", summary: "A choice changes the relationship between desire and duty.", spoilerSafe: true },
  ],
  characters: [
    { id: "character-a", name: "Character A", wants: "Control", fears: "Loss", contradiction: "Protects others by refusing to trust them." },
    { id: "character-b", name: "Character B", wants: "Truth", fears: "Abandonment", contradiction: "Demands honesty while hiding vulnerability." },
  ],
  relationship: {
    id: "relationship-a-b",
    label: "Character A ↔ Character B",
    people: ["Character A", "Character B"],
    summary: "A compact relationship trace proving the interaction model without pretending to be a finished review.",
    events: [
      { id: "rel-1", label: "Trust", change: "Mutual dependence creates initial trust.", tone: "trust" },
      { id: "rel-2", label: "Concealment", change: "Information is withheld to preserve control.", tone: "fracture" },
      { id: "rel-3", label: "Confrontation", change: "Power imbalance becomes explicit.", tone: "pressure" },
      { id: "rel-4", label: "Repair?", change: "The story tests whether truth can restore reciprocity.", tone: "repair" },
    ],
  },
  familyYouth: [
    { label: "Adults", observation: "Authority is evaluated by responsibility, example and willingness to repair harm." },
    { label: "Youth", observation: "Autonomy is distinguished from rebellion; consequences and formation matter." },
  ],
  meaning: {
    theme: "Trust and control",
    question: "Can love survive when protection becomes possession?",
    apparentClaim: "Care without truth eventually deforms into control.",
    counterevidence: "Some protective concealment is portrayed as understandable rather than simply malicious.",
    confidence: "MEDIUM",
  },
  permissions: [
    { subject: "Deception", state: "COSTLY", rationale: "The story shows relational damage without reducing every concealment to the same motive." },
    { subject: "Control", state: "QUESTIONED", rationale: "The narrative increasingly exposes the cost of treating care as ownership." },
    { subject: "Sacrificial honesty", state: "REWARDED", rationale: "Truth becomes a condition for meaningful repair." },
  ],
  craft: [
    { device: "Camera proximity", effect: "Keeps the audience emotionally close to a morally compromised character." },
    { device: "Music restraint", effect: "Avoids telling the viewer too quickly how to judge the conflict." },
  ],
  sceneAutopsy: {
    label: "Scene / fixture",
    act: "Concealment",
    motive: "Protection mixed with control",
    knowledge: "Substantial",
    pressure: "Moderate",
    consequence: "Trust fractures",
  },
  decision: {
    question: "Should the character reveal a truth that may cause immediate harm?",
    knownThen: ["The truth is material", "Disclosure may cause immediate conflict"],
    revealedLater: ["Concealment produces a larger relational cost"],
  },
  biblicalSynthesis: {
    observation: "The conflict turns on whether care can be separated from truth and responsibility.",
    principle: "Love and truth must not be treated as enemies.",
    application: "The eventual moral evaluation must be argued from the real film evidence, not generated from this fixture.",
    qualification: "Fixture copy is structural only and carries no published editorial authority.",
  },
};

export const films: ShellFilm[] = [homepageFixture.featuredFilm];

export function getFilmBySlug(slug: string) {
  return films.find((film) => film.slug === slug);
}

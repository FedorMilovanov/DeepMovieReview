import type { FilmPackage } from "@/lib/film-package";

/**
 * Film 001 research package.
 *
 * This package is intentionally `draft`: the target edition is selected for ingest,
 * but the exact editorial master and scene timestamps are not locked yet. Do not add
 * authoritative scene observations or publishable interpretive claims until they have
 * been checked against that exact master.
 */
export const theTrumanShowDraftPackage: FilmPackage = {
  schemaVersion: 1,
  film: {
    slug: "the-truman-show",
    title: "The Truman Show",
    year: 1998,
    director: "Peter Weir",
    runtime: "103–104 min (editorial master lock pending)",
    genre: ["Comedy", "Drama"],
    premise:
      "Truman Burbank lives in the apparently idyllic town of Seahaven without knowing that his life is being produced as a television show inside a constructed world.",
    thesisQuestion:
      "What happens to freedom, trust and human dignity when a person's world is built on systematic deception and paternalized control?",
    status: "draft",
  },
  ingest: {
    edition: {
      state: "TARGET_ONLY",
      sourceId: "truman-target-edition",
      note:
        "Target release selected, but exact disc/region or archival file identity, measured runtime and timestamp origin are not locked.",
    },
  },
  modules: [
    {
      id: "film-001-sources",
      kind: "sources-method",
      heading: "Film 001 sources and edition lock",
      eyebrow: "SOURCES / RESEARCH STATUS",
      spoilerLevel: "NONE",
      methodologyVersion: "film-001-research-v0",
      editorialRevision: "draft-0",
      analyzedEdition:
        "Target: Paramount 25th Anniversary 4K UHD (2023), 1.85:1 theatrical presentation; exact editorial master/region and timestamps not yet locked.",
      lastReviewedAt: "2026-09-11",
      sources: [
        {
          id: "truman-target-edition",
          label: "Target editorial master — Paramount 25th Anniversary 4K UHD (2023)",
          kind: "film-edition",
          locator:
            "Target only. Exact disc/region or file identity, playback duration and timestamp zero point must be locked before this source can support canonical scene evidence.",
        },
        {
          id: "truman-4k-release-metadata",
          label: "Blu-ray.com — Paramount 25th Anniversary 4K release metadata",
          kind: "reference",
          locator:
            "Secondary edition metadata: 1998 film, 103 min listing, native 4K, original/presented aspect ratio 1.85:1. Not a substitute for the editorial viewing master.",
          href: "https://www.blu-ray.com/movies/The-Truman-Show-4K-Blu-ray/337202/",
        },
        {
          id: "truman-paramount-official",
          label: "Paramount Pictures — The Truman Show",
          kind: "reference",
          locator:
            "Official production metadata and synopsis; lists 1998, Peter Weir, Andrew Niccol, Comedy/Drama and 104 min.",
          href: "https://www.paramountpictures.com/movies/the-truman-show",
        },
        {
          id: "truman-asc-cinematography",
          label: "American Society of Cinematographers — Inside the Cinematography of The Truman Show",
          kind: "reference",
          locator:
            "Peter Weir / Peter Biziou discussion of artificial light, surveillance framing, commercials/TV grammar and Seahaven visual design.",
          href: "https://theasc.com/article/the-truman-show-cinematography/",
        },
        {
          id: "truman-bfi-catalog",
          label: "BFI — The Truman Show catalogue record",
          kind: "reference",
          locator:
            "Secondary catalogue metadata; currently lists the 1998 film at 102 min. Used to document metadata variance, not to define the editorial master runtime.",
          href: "https://www.bfi.org.uk/film/7678fd69-38bd-5728-b5f7-01ad5f6d8849/the-truman-show",
        },
        {
          id: "truman-bfi-development",
          label: "BFI — How we made The Truman Show",
          kind: "reference",
          locator:
            "Andrew Niccol production-history interview; useful for draft-history context and for avoiding silent substitution of earlier screenplay material for the finished film.",
          href: "https://www.bfi.org.uk/interviews/how-we-made-truman-show-20th-anniversary",
        },
        {
          id: "truman-script-research",
          label: "Andrew Niccol — The Truman Show shooting script research copy",
          kind: "reference",
          locator:
            "Secondary/corroborative research only. The locked finished film remains authoritative for scenes, dialogue, framing and timestamps.",
          href: "https://assets.scriptslug.com/live/pdf/scripts/the-truman-show-1998.pdf",
        },
        {
          id: "truman-editorial-edition-note",
          label: "Film 001 editorial edition-lock note",
          kind: "editorial-note",
          locator:
            "Do not author canonical timestamps or publishable film observations until the exact editorial master is acquired, identified and measured.",
        },
      ],
    },
  ],
};

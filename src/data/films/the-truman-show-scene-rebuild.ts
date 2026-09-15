import type { TrumanMasterChapter } from "./the-truman-show-master-segmentation";

export type TrumanLegacySceneRebuildDisposition =
  | "CONTIGUOUS_REVIEW"
  | "NONCONTIGUOUS_SPLIT_REQUIRED";

export type TrumanLegacySceneRebuildPlan = {
  legacySceneId: string;
  evidenceIds: string[];
  targetChapterIds: TrumanMasterChapter["id"][];
  disposition: TrumanLegacySceneRebuildDisposition;
  directSceneConsumerIds: string[];
  note: string;
};

/**
 * Migration contract for the 15 research-era DRAFT scene IDs.
 *
 * targetChapterIds are objective master-segmentation containment candidates,
 * not replacement FilmSceneRecord IDs. Even CONTIGUOUS_REVIEW entries still
 * require manual editorial scene review before any canonical scene is created.
 */
export const trumanLegacySceneRebuildPlan: TrumanLegacySceneRebuildPlan[] = [
  {
    legacySceneId: "truman-sc-morning",
    evidenceIds: [
      "truman-ev-daycount",
      "truman-ev-greeting",
      "truman-ev-routine",
      "truman-ev-kaiser",
      "truman-ev-interviews",
    ],
    targetChapterIds: ["truman-ch-01", "truman-ch-02"],
    disposition: "CONTIGUOUS_REVIEW",
    directSceneConsumerIds: [],
    note: "Opening interview material and the morning/day-count block occupy adjacent master segments but must not be assumed to be one dramatic scene.",
  },
  {
    legacySceneId: "truman-sc-light",
    evidenceIds: ["truman-ev-light"],
    targetChapterIds: ["truman-ch-02"],
    disposition: "CONTIGUOUS_REVIEW",
    directSceneConsumerIds: [],
    note: "Single-segment containment; exact editorial scene boundaries still require picture review.",
  },
  {
    legacySceneId: "truman-sc-radio",
    evidenceIds: ["truman-ev-radio", "truman-ev-raincloud"],
    targetChapterIds: ["truman-ch-08"],
    disposition: "CONTIGUOUS_REVIEW",
    directSceneConsumerIds: [],
    note: "Both research records fall within the Paranoia master segment; internal scene boundaries remain editorial.",
  },
  {
    legacySceneId: "truman-sc-school",
    evidenceIds: ["truman-ev-quota", "truman-ev-drowning"],
    targetChapterIds: ["truman-ch-03", "truman-ch-06"],
    disposition: "NONCONTIGUOUS_SPLIT_REQUIRED",
    directSceneConsumerIds: [],
    note: "The research scene merges office/ferry-era material with later childhood-memory material across non-adjacent master segments.",
  },
  {
    legacySceneId: "truman-sc-sylvia",
    evidenceIds: ["truman-ev-sylvia", "truman-ev-fiji"],
    targetChapterIds: ["truman-ch-07"],
    disposition: "CONTIGUOUS_REVIEW",
    directSceneConsumerIds: [],
    note: "Disclosure and Fiji material live in the long Sylvia segment; exact dramatic sub-scenes still need manual review.",
  },
  {
    legacySceneId: "truman-sc-ferry",
    evidenceIds: ["truman-ev-ferry"],
    targetChapterIds: ["truman-ch-03"],
    disposition: "CONTIGUOUS_REVIEW",
    directSceneConsumerIds: [],
    note: "Single-segment containment; physical fear/retreat boundaries require picture review.",
  },
  {
    legacySceneId: "truman-sc-father",
    evidenceIds: ["truman-ev-ghost", "truman-ev-album", "truman-ev-europe"],
    targetChapterIds: ["truman-ch-06", "truman-ch-09"],
    disposition: "NONCONTIGUOUS_SPLIT_REQUIRED",
    directSceneConsumerIds: [],
    note: "Father reappearance/newspaper material and the later family-album sequence occupy non-adjacent master segments.",
  },
  {
    legacySceneId: "truman-sc-elevator",
    evidenceIds: ["truman-ev-elevator"],
    targetChapterIds: ["truman-ch-08"],
    disposition: "CONTIGUOUS_REVIEW",
    directSceneConsumerIds: [],
    note: "Single-segment containment; the exact backstage-reveal sequence must be visually re-observed.",
  },
  {
    legacySceneId: "truman-sc-travel",
    evidenceIds: ["truman-ev-poster", "truman-ev-mococoa", "truman-ev-beer"],
    targetChapterIds: ["truman-ch-05", "truman-ch-10", "truman-ch-14"],
    disposition: "NONCONTIGUOUS_SPLIT_REQUIRED",
    directSceneConsumerIds: [],
    note: "Beer, travel-agency and Mococoa events are widely separated in the measured master and cannot remain one canonical scene.",
  },
  {
    legacySceneId: "truman-sc-bridge",
    evidenceIds: ["truman-ev-bridge", "truman-ev-plant"],
    targetChapterIds: ["truman-ch-12", "truman-ch-13"],
    disposition: "CONTIGUOUS_REVIEW",
    directSceneConsumerIds: [],
    note: "Bridge crossing and the roadblock follow across adjacent master segments; editorial cut points still need review.",
  },
  {
    legacySceneId: "truman-sc-meryl",
    evidenceIds: ["truman-ev-knife", "truman-ev-fingers"],
    targetChapterIds: ["truman-ch-09", "truman-ch-14"],
    disposition: "NONCONTIGUOUS_SPLIT_REQUIRED",
    directSceneConsumerIds: [],
    note: "Wedding-photo evidence and the later kitchen confrontation are non-adjacent and require separate canonical scenes.",
  },
  {
    legacySceneId: "truman-sc-reunion",
    evidenceIds: [
      "truman-ev-marlon",
      "truman-ev-reunion",
      "truman-ev-trutalk",
      "truman-ev-sleep",
      "truman-ev-conception",
    ],
    targetChapterIds: ["truman-ch-15", "truman-ch-16", "truman-ch-17"],
    disposition: "CONTIGUOUS_REVIEW",
    directSceneConsumerIds: [],
    note: "The research bucket spans several adjacent sequences; continuity does not imply a single dramatic scene.",
  },
  {
    legacySceneId: "truman-sc-escape",
    evidenceIds: ["truman-ev-escape", "truman-ev-cuesun"],
    targetChapterIds: ["truman-ch-18"],
    disposition: "CONTIGUOUS_REVIEW",
    directSceneConsumerIds: [],
    note: "Single master segment; internal escape/search sequence still needs editorial scene verification.",
  },
  {
    legacySceneId: "truman-sc-storm",
    evidenceIds: ["truman-ev-boat", "truman-ev-storm", "truman-ev-born-live"],
    targetChapterIds: ["truman-ch-19", "truman-ch-20"],
    disposition: "CONTIGUOUS_REVIEW",
    directSceneConsumerIds: [],
    note: "Setting sail and storm escalation occupy adjacent segments but may resolve into multiple editorial scenes.",
  },
  {
    legacySceneId: "truman-sc-door",
    evidenceIds: [
      "truman-ev-wall",
      "truman-ev-dialog",
      "truman-ev-nocamera",
      "truman-ev-exit",
      "truman-ev-guards",
    ],
    targetChapterIds: ["truman-ch-21", "truman-ch-22", "truman-ch-23"],
    disposition: "CONTIGUOUS_REVIEW",
    directSceneConsumerIds: ["truman-mod-autopsy"],
    note: "The research bucket and current Scene Autopsy span wall collision, creator dialogue and exit/epilogue across adjacent chapters; do not force chapter boundaries into scene grammar.",
  },
];

# Film 001 — Editorial scene rebuild plan

> State: **MASTER_IDENTIFIED + SECONDARY_SOURCES**
> Structural provenance: 24 exact master segments
> Research scene registry: 15 DRAFT scene IDs
> Canonical editorial scenes: **not yet authored**

## Purpose

The 15 current `FilmPackage.scenes` are research-era buckets with approximate bounds. Now that the exact viewing master and its structural segmentation are known, this contract proves which research buckets are merely broad/approximate and which are structurally impossible as one canonical scene.

Machine-readable plan:

`src/data/films/the-truman-show-scene-rebuild.ts`

## Classification

The plan has two dispositions:

- **CONTIGUOUS_REVIEW** — all currently associated evidence falls inside one master segment or a run of adjacent master segments. This does **not** mean the legacy bucket should survive as one canonical scene; it only means measured structure does not prove a gap.
- **NONCONTIGUOUS_SPLIT_REQUIRED** — the legacy bucket combines evidence from non-adjacent master segments. It cannot become one canonical continuous scene.

Current result:

- **11 CONTIGUOUS_REVIEW**
- **4 NONCONTIGUOUS_SPLIT_REQUIRED**

The four structurally invalid aggregates are:

1. `truman-sc-school` → ch03 + ch06
2. `truman-sc-father` → ch06 + ch09
3. `truman-sc-travel` → ch05 + ch10 + ch14
4. `truman-sc-meryl` → ch09 + ch14

## Coverage contract

The rebuild plan must cover:

- all 15 current research scene IDs exactly once;
- all 39 current research evidence IDs exactly once under their current legacy scene;
- every target chapter through the exact master-segmentation source;
- direct scene consumers that are not ordinary evidence references.

At present the explicit direct scene consumer is:

`truman-mod-autopsy → truman-sc-door`

That dependency is tracked because a future scene rebuild must not silently orphan the Scene Autopsy.

## Important boundary

The 24 embedded chapters are **not** replacement scene IDs.

They provide objective containment evidence only. Future editorial scenes must be established by actual master review and can:

- occupy part of one chapter;
- align with a chapter;
- span adjacent chapters;
- be split more finely for analytical use.

## Implementation order

1. complete picture-level verification for the evidence needed to establish actual scene transitions;
2. define candidate editorial scene ranges from the master;
3. migrate evidence/replacement evidence to those candidate scenes;
4. migrate direct scene consumers such as Scene Autopsy;
5. validate no consumer still references a retiring legacy scene;
6. only then remove the 15 research-era scene IDs;
7. transition to `LOCKED` only when the complete canonical evidence/scene graph validates.

No scene is promoted to VERIFIED by this planning document.

# Atomic canonical FilmPackage promotion

> Scope: generic real-film integrity transition
> Status: infrastructure only; **does not promote Film 001**

## Problem

The integrity model correctly treats these as different worlds:

- pre-lock research: `MASTER_IDENTIFIED + SECONDARY_SOURCES`;
- canonical authoring: `LOCKED`, no research tier, VERIFIED editorial scenes, locked-edition evidence.

Without an atomic transition helper, an editor could be tempted to mutate the live package in several steps:

1. flip edition state;
2. remove research;
3. replace scenes;
4. replace evidence;
5. rewire modules.

Every intermediate state is invalid and can accidentally leak into a branch or review.

## API

`prepareLockedFilmPromotion(sourcePackage, input)`

The function accepts only a valid `MASTER_IDENTIFIED` source package plus a complete candidate set:

- `verifiedAt`;
- canonical scene registry;
- canonical evidence ledger;
- canonical modules / Sources & Method.

It then:

1. validates the source research package first;
2. preserves the measured master identity, source ID, runtime, timestamp convention, optional frame/audio/subtitle/digest fields and master segmentation;
3. removes `research` **only in a cloned candidate**;
4. changes only the candidate edition to `LOCKED`;
5. replaces scenes/evidence/modules as one candidate graph;
6. runs the existing full `validateFilmPackage`;
7. returns `ok: true` only when that graph has zero integrity errors.

There is no partial-success mode.

## What it deliberately does not do

- it does not invent or repair scene ranges;
- it does not convert DRAFT scenes to VERIFIED;
- it does not replace secondary sources automatically;
- it does not rewrite ClaimSupport;
- it does not mutate the source package;
- it does not publish a film;
- it does not infer `verifiedAt`;
- it does not let TARGET_ONLY or already-LOCKED packages enter the transition.

For Film 001 this becomes the final transaction boundary **after** picture review, VERIFIED editorial-scene construction and evidence rewiring are complete.

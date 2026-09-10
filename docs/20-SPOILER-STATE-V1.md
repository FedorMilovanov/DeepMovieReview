# DeepMovieReview — Spoiler State v1

> Status: platform foundation  
> Scope: spoiler visibility before real film packages are loaded.

## 1. Principle

Spoilers are a **data visibility concern**, not a blur effect.

A reader who has not allowed a spoiler level should not receive that analytical content in the rendered document.

Do not solve spoilers with:

- CSS blur over already-rendered text;
- opacity/visibility tricks;
- client-only hiding after hydration;
- a single boolean `hasSpoilers` field.

## 2. Canonical levels

Ordered levels:

1. `NONE`
2. `MINOR`
3. `MAJOR`
4. `ENDING`
5. `FULL`

Each spoiler-bearing entity should declare the minimum level required to reveal it.

Examples:

- premise / high-level themes → often `NONE`;
- small setup detail → `MINOR`;
- decisive turn / betrayal → `MAJOR`;
- resolution / final fate → `ENDING`;
- unrestricted scene/evidence package → `FULL`.

The rubric should remain editorially calibrated; these labels are visibility boundaries, not moral categories.

## 3. URL state

Current v1 URL form:

```text
/films/example?spoilers=major
```

`NONE` is represented by the clean URL without a query parameter.

Benefits:

- shareable state;
- inspectable state;
- no JavaScript required to switch levels;
- server can filter before render;
- later cookie/account preference can use the same canonical type.

## 4. Server filtering

`src/lib/spoilers.ts` owns:

- canonical levels;
- parsing/normalization;
- rank comparison;
- generic `filterBySpoilerLevel`;
- URL generation.

Pages/components should consume a parsed `SpoilerLevel` rather than compare arbitrary strings.

## 5. Search / metadata

Default public metadata must remain spoiler-safe.

Do not dynamically inject ending/full analytical text into:

- page description;
- Open Graph copy;
- JSON-LD summaries;
- search indexing payloads;
- static navigation labels.

Future search indexing should either:

- index spoiler-bearing records with an explicit spoiler level and filter at retrieval/presentation time; or
- keep spoiler-free discovery documents separate from unrestricted internal analysis indexes.

## 6. Deep links

Future deep-link policy:

- every analytical section/entity has a stable ID;
- a deep link to content above the current allowed level must not reveal it silently;
- route should show an accessible interstitial/reveal action explaining the required level;
- user can explicitly raise spoiler permission and continue to the same anchor.

Do not auto-escalate spoiler permission merely because a URL targets a hidden section.

## 7. Session / account evolution

v1 uses explicit URL state.

Future priority resolution can become:

1. explicit URL override;
2. session/cookie preference;
3. authenticated account preference;
4. default `NONE`.

All sources must resolve to the same `SpoilerLevel` type.

## 8. Component contract

Reusable analytical modules should receive already-filtered data whenever practical.

Prefer:

```text
server projection
  → spoiler filter
  → module props
  → render
```

over:

```text
full analysis payload
  → client component
  → hide forbidden items
```

This reduces accidental leakage and client payload size.

## 9. Accessibility

Spoiler level controls must:

- work as ordinary links/buttons;
- expose current state to assistive technology;
- not depend on hover;
- remain usable on touch;
- avoid sudden forced scroll changes.

The current URL-based control uses `aria-current` for the selected level.

## 10. Privacy / safety

Spoiler preference is ordinary product preference. It must not be used to infer unrelated sensitive traits.

## 11. Exit criteria before real films

Before Film 001 is published:

- all spoiler-bearing ontology entities have a spoiler-level field or documented projection rule;
- film renderer filters before module render;
- ending/full deep links are guarded;
- metadata remains spoiler-safe;
- mobile/touch controls are verified;
- adding an account preference does not require changing analytical records.

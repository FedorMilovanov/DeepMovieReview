# Film 001 — Evidence Migration Wave 3

> State: **MASTER_IDENTIFIED + SECONDARY_SOURCES**
> Scope: three high-fan-out compound evidence records / 33 current downstream references

Wave 3 is intentionally last among the compound-record planning passes because its three retiring IDs are deeply embedded in Story, Characters, Relationships, Teaching, Permission, Craft, Decision, Moral, Scene Autopsy and Final Synthesis.

## Migration set

| Retiring ID | Current refs | Atomic direction |
| --- | ---: | --- |
| `truman-ev-knife` | 8 | confrontation / call-for-help / Marlon intervention |
| `truman-ev-storm` | 11 | escalation / Truman defiance / control-room decision |
| `truman-ev-exit` | 14 | final greeting / physical exit / audience reaction |

Total guarded downstream references: **33**.

## Direct-reference hazard

`truman-ev-exit` is not referenced only through normal `evidenceIds` arrays. Scene Autopsy contains the direct anchor:

`truman-anchor-bow → truman-ev-exit`

The migration contract therefore records an explicit direct rewire:

`truman-anchor-bow → truman-ev-final-exit`

A future implementation must update that direct consumer in the same bounded change that retires the old ID.

## Semantic rewiring rules

### Knife

- weapon/confrontation claims → confrontation evidence;
- performance-break / appeal-to-crew claims → call-for-help evidence;
- third-party intervention claims → Marlon intervention;
- do not preserve actor/character interpretation inside raw observation.

### Storm

- autonomy/decision claims → Truman defiance;
- Christof/system-control wrongdoing → storm escalation + control decision;
- Craft/music claims require the verified sequence and their own craft provenance, not a generic moralized storm umbrella.

### Exit

- spoken farewell → final greeting;
- act of leaving / Scene Autopsy bow-door anchor → physical exit;
- viewer-response claims → audience-reaction montage;
- Craft ending may additionally use the existing separate guards evidence.

## Fail-closed rule

This PR only freezes the replacement graph. It does not mutate FilmPackage or mark any visual replacement timestamp as known.

Wave 3 implementation must not begin until visual timestamps for confrontation/storm-control/physical-exit/audience-reaction events are actually verified.

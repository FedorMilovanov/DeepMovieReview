# Ownership, editorial responsibility and source rights

**Project/repository maintainer:** [FedorMilovanov](https://github.com/FedorMilovanov).

DeepMovieReview is a source-traceable film-analysis platform. Its application code, editorial decisions, evidence model and operating contracts are maintained under human direction with AI-assisted engineering and research tools. **Repository ownership is not evidence that every line, asset or finding was independently authored or personally verified by the maintainer.**

## Attribution and intellectual-property boundaries

- **Films and their materials** — motion pictures, dialogue, soundtracks, studios' stills and externally published transcripts belong to their respective rights holders. A measured local viewing master and its SHA-256 are *identification/provenance*, **not a license to redistribute the film**.
- **Editorial film analysis** — is a distinct authored interpretation which should cite evidence and record the basis, uncertainty and spoiler level of a claim; analysis is not a claim of studio affiliation or endorsement.
- **Third-party sources** — interviews, reviews, databases and film scholarship retain their own authors and licensing restrictions. Records may cite them but cannot silently promote a secondary report to directly observed film evidence.
- **Generated original illustrations** — are not frame captures or evidence that an actual scene looks exactly like the depiction. The project has a registered illustration boundary and a build check against film stills in its image registry.
- **Reader/community opinions** — where a community layer is introduced, must stay distinct from editorial claims; popularity cannot become an authority for moral or biblical statements.

## Verification ownership

| Boundary | Primary source |
|---|---|
| Current product status and architectural contract | [README.md](README.md), [AGENTS.md](AGENTS.md) |
| Canonical published film package and its review basis | [src/data/films/the-truman-show-canonical.ts](src/data/films/the-truman-show-canonical.ts) |
| Film-package integrity and linked evidence | [src/lib/film-package-integrity.ts](src/lib/film-package-integrity.ts) |
| Spoiler-safe projection | [src/lib/film-module-projection.ts](src/lib/film-module-projection.ts) |
| Current registered read surface | [src/data/film-registry.ts](src/data/film-registry.ts) |
| Sensitive findings and disclosure | [SECURITY.md](SECURITY.md) |
| Public engineering case with explicit limits | [CASE_STUDY.md](CASE_STUDY.md) |

This file changes no license or historical-source authority. No unverified audience, revenue, box-office or visitor metrics are attributed to the maintainer, and no external film-use rights are granted here.

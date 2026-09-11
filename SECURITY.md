# Security Policy

## Supported version

DeepMovieReview is under active development. Security fixes are applied to the current `main` branch. Older commits, preview snapshots, and development fixtures are not maintained as supported release lines.

## Reporting a vulnerability

Please use GitHub's **Private vulnerability reporting** for this repository so potentially exploitable details are not disclosed before a fix is available.

Do not open a public issue for suspected vulnerabilities that could expose secrets, bypass preview/publication boundaries, alter protected editorial data, or otherwise create a security impact.

When reporting, include the smallest reproducible description you can provide:

- affected route, workflow, dependency, or component;
- reproduction steps or proof of concept;
- expected versus observed behavior;
- likely impact;
- relevant environment details.

Please avoid accessing data you do not own, degrading service, or expanding testing beyond what is necessary to demonstrate the issue.

## Security boundaries

The repository intentionally treats these as security-sensitive boundaries:

- preview/draft film content must not leak into the public production surface;
- site indexing must fail closed until publication gates are satisfied;
- GitHub Actions dependencies must remain pinned to immutable commit SHAs;
- protected branches require both application CI and CodeQL to pass before merge;
- secrets must never be committed to the repository.

Security reports about these boundaries are welcome through private vulnerability reporting.

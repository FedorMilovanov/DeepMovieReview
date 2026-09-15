# Native Vercel Git deployment contract

> Verified configuration baseline: 2026-09-15.
>
> This document records the production deployment path for the DeepMovieReview preview project. It is an operational contract, not a replacement for protected GitHub CI.

## Canonical linkage

- Vercel project: `deepmoviereview-preview`
- Git provider: GitHub
- Repository: `FedorMilovanov/DeepMovieReview`
- Production branch: `main`
- GitHub Login Connection: the Vercel account is linked to GitHub as `FedorMilovanov`
- Vercel GitHub App: installed and authorized for the repository
- GitHub `main`: protected; changes reach production through reviewed/green merges, not direct force-pushes

The Vercel project must not be linked to a neighboring repository. In particular, `FedorMilovanov/gb-is-my-strength` is a different project and must never be used as the Git source for `deepmoviereview-preview`.

## Expected production flow

1. Work is proposed through a pull request.
2. Required GitHub checks pass on the exact PR head.
3. The PR is merged into protected `main`.
4. Vercel observes the new `main` commit through the native Git integration.
5. Vercel creates the production deployment for that exact resulting-main SHA.
6. The canonical production alias is smoke-tested after the deployment reaches `READY`.

A deployment is not considered verified merely because the application builds locally or because a manual deployment succeeds. The proof is the Git-triggered deployment associated with the exact resulting-main commit.

## Manual deploy policy

`vercel deploy --prod` is an incident-recovery mechanism, not the normal delivery path.

Do not add a long-lived Vercel token, custom webhook, or duplicate GitHub Actions deployment workflow merely to compensate for a broken native Git connection. If native auto-deploy stops working:

1. verify the project's connected Git repository;
2. verify the Vercel GitHub Login Connection;
3. verify the Vercel GitHub App installation/repository access;
4. verify the production branch is `main`;
5. repair that integration before introducing any alternate delivery mechanism.

## Verification after integration changes

After changing Vercel/GitHub linkage, perform one harmless repository change through the normal protected PR path and verify:

- the resulting `main` SHA is known;
- Vercel starts a deployment without a manual deploy command;
- the deployment metadata/commit link resolves to that exact SHA;
- the production alias serves the resulting deployment;
- lightweight live smoke passes on `/`, `/films`, `/methodology`, one canonical film route, `/robots.txt`, and `/sitemap.xml`;
- prelaunch indexing policy remains unchanged unless a separate launch decision explicitly changes it.

## Prelaunch invariants

Restoring native Git deployment must not silently change editorial or launch policy.

Until launch is explicitly approved:

- preview content remains enabled according to the project environment;
- public indexing remains disabled;
- `robots.txt` continues to disallow crawling;
- the sitemap remains intentionally empty;
- Film 001 evidence/timestamp claims remain constrained by the canonical-master ingest contract.

## Failure handling

If a Vercel deployment fails after a green protected merge:

- preserve the failed deployment and build logs for diagnosis;
- do not rewrite history or force-push `main`;
- fix the root cause in a new PR;
- use a manual production deployment only when an incident requires immediate restoration and record why it was necessary.

The desired steady state is simple: **protected GitHub `main` is the production source of truth, and Vercel deploys it natively.**

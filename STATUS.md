# Status — difergent-theme

Updated: 2026-09-08
Status: Active
State: IN_PROGRESS
Review-Risk: R0
Independent-Review: PENDING
Primary-Worker: UNSET
Independent-Reviewer: UNSET
Independent-Review-Head: UNSET

## Delivery state machine

Allowed forward path:

`PLANNED -> READY -> IMPLEMENTING -> VERIFYING -> REVIEWING -> INTEGRATING -> PRODUCTION_READY -> AWAITING_DEPLOY_APPROVAL -> DEPLOYED -> SMOKE_TESTING -> VERIFIED`

Use `BLOCKED` only as an interruption state. Record the blocker and exact state to resume. Do not skip verification/review/integration states. `production-gate` proves the transition from `INTEGRATING` to `PRODUCTION_READY`; it never deploys.

`RELEASE.md` owns release-specific truth: release ID, base, declared risk, rollback reference/command, backup proof, and readiness status. `Review-Risk` is the highest semantic risk found during review. `production-gate` computes effective release risk as max(`RELEASE.md` Declared-Risk, deterministic `diff-risk`, `Review-Risk`). R3/R4 require `Independent-Review: PASS`, a reviewer distinct from `Primary-Worker`, and `Independent-Review-Head` bound to the reviewed release content. Only review-attestation files may change after that commit.

`OBSERVABILITY.md` owns post-deploy verification probes. After deployment, transition to `SMOKE_TESTING` and run `release-check`. Every configured observability probe must pass before transition to `VERIFIED`.

## Current state

Repository-local development contract initialized. No implementation claim is recorded until verified against the repository.

Bootstrap evidence: native generator: none. Selected stack: `Existing repository (detected by project-check)`.
Database `none`, authentication `none`, and deployment target
`none` are decisions only until their future tasks pass executable checks.

## Active work

No active implementation task is recorded.

## Blockers

None recorded.

## Verification evidence

None recorded.

## Next verified action

Inspect the repository, accept requirements, create bounded tasks, then transition `State` to `READY` before implementation begins.

## 2026-09-08

34 of 35 tasks complete with recorded evidence. One is partial:

| Task | State | What is missing |
|---|---|---|
| T25 in-app browser | PARTIAL | 7 of 7 invariants proven under webview emulation against a real store; the confirmation on a physical phone inside two host applications remains, and no emulator substitutes for it |

T16 is now closed: verified against Shopify's public Hydrogen demo store, where
changing the configured market changed both the rendered price and the
structured data (AU/AUD, JP/JPY with no decimals, DE/EUR).

A second pass over the completed tasks found three defects that the first pass
had accepted on the wrong evidence: invalid configuration did not fail the
build, a marketing tag loaded without consent, and the consent gate never
reacted when consent was granted. All three are fixed and verified.

All four blockers reduce to one missing input: a Shopify Storefront API token.
No Storefront API token was available locally, so verification ran against
mock.shop through an env file kept outside the repository.

Nothing has been committed or pushed. Nothing has been deployed.

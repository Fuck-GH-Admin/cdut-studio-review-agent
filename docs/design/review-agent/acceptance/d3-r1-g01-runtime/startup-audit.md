# D3-R1 startup audit — pre-implementation

- Fixed D3-R0 parent: `4b191c729f3d5f8135c73b87c17642023f6c3986` (GitHub release/d3-r0-20261011 verified at this exact SHA).
- Agent A PR #81 fixed head `e3321add7322fba29169f0faeac9bc66571067e0` (read-only).
- Agent C PR #82 fixed head `3018efc4aa6ae043eddaff63fef590b53134b92a` (read-only).
- C workflow #38988460944: completed/success at C head, but **not R1 evidence**.
- Source G01-I historical SHA `8989941b6fb5651564e32d11c4215b6a6d5a5209`; no Gold or B private fixtures used.
- Local environment: GitHub DNS resolution unavailable, Bun not installed; R1-branch GitHub Actions must provide actual runtime evidence.

## R0 source-verified blockers

1. `D2TargetKind` only campus-card/archive-item/archive-operation; `validateTargets` rejects student targets.
2. `compileD2RuntimePlan` binds scenario templates to one campus card; checks without objectKey become case-level, not per changed field.
3. `caseFields` do not contribute to the D2 plan fingerprint. Applicant assertions cannot serve as trusted school registry facts.
4. `advanced.*` non-empty triggers `D2_UNMAPPED_ADVANCED`. Existing `EvidenceLink` already models one document-to-many separately confirmed links, with exact subject+document-version checks in D2 gates, but lacks field/issuer-specific G01 contract.
5. `review-d2-execution-gates.ts` treats absent evidence as unknown, keeps authority-owned materials pending, and rejects unverified alternative evidence; preserve these constraints.

## Allowed minimal source boundary

- `packages/shared/src/types/review-d2.ts`, `packages/shared/src/types/review-authoring-v1.ts` only as needed for additive typed contracts.
- `apps/electron/src/main/lib/review/review-d2-runtime.ts`, `review-d2-execution-gates.ts`, `review-authoring-v1.ts` and focused tests. Existing D1/D3 portable store, Pi services and case persistence remain authoritative.
- No changes to R0 release, PR #81/#82, B Gold, official student data, global policy authority, or README/AGENTS without separate document approval.

## Reproduction

`bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-r1-student.test.ts`

Current R0 implementation is expected to reject the typed field-target positive test; workflow `.github/workflows/review-d3-r1-student.yml` captures the red state on this branch before any implementation patch. This is a technical synthetic test, not a school audit.

## Follow-up evidence (immutable R0 startup snapshot retained above)

- Fixed base verified by `compare_commits(R0, R1)`: R1 branch exactly ahead of R0 (no behind), no edits to old A/C/B paths.
- Subsequent R1 scoped CI green `38999185257` at `0add1895261b612cafceee424e8779915664c69d`: 13 new + 104 inherited pass, Bun install, typecheck, boundaries, D3 R0 locks. Head is a Draft PR, not a release.

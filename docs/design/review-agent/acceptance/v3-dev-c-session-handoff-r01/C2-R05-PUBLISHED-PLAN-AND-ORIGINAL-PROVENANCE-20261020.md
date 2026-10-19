# Dev-C C2-R05 | Published Plan physical provenance and Case original admission

> C-owned engineering evidence. **This document is C-session-specific**, not a required cross-line protocol. The only A/B/I binding decision/authority stays in the shared #145 `ABCI-UNIFIED-COORDINATION-AND-STATUS.md` `DECISIONS:C` region. No scope or product Gate may be inferred from this technical document.

## Source and Gate O baselines

- Dev-C #144 R04 exact green `b51e5f299ffa68284fc1d187607b658405c8643f`: PR CI `39306309483` job `118244194354` **4099 pass/5 skip/0 fail, 4104 cases/472 files**; Baseline `39306309415`, Batch `39306309433`, D1 `39306309447`, D2 `39306309399` all SUCCESS. New C Main trusted execution assembly is **non-live**.
- Signed Integrator-I I3 `C-I3-ANCHOR-003` is explicitly locked to **older C2-R03 `e87f75e044becc35c28292cc835a2c2ec41df48a`**, not R04/R05. I must not float import R05.
- Real B #142 B1 `review-template-plan-adapter-v3-b1.ts` produces `ImmutablePlanDescriptorB1.publicationAllowed=false`, and frozen author vault status `candidate-held`; **B has not yet provided a school-authorized published Plan registry or artifact trust root**. No C module may silently change those flags.
- A #143 R14 exact `56f450f3...` only attests a bounded SDK HTTP/SSE application-level technical witness, not Host physical receipts.

## Actual C-only production source, Draft #144

1. `review-v3-main-plan-provenance.ts` (first production commit `14398968cd24ecfc6018e3a3c167e7db88805874`; extended in `a30b9c8f0cd6b4b521a55724b556092bd0502a0f`): new conservative **Main-only consumer**, not a publisher. Requires independent trusted publisher status/issuer/source SHA via `C2MainPublishedPlanSource`, exact publication status `published`, physical artifact bytes from Main-pinned absolute directory, exact SHA256 of raw on-disk artifact, artifact schema `review-v3-published-plan-artifact/1`, immutable publication ID and structural CanonicalPlan equality. It revalidates on *every* bind/Run check; no memory cache and no journal/DTO shortcut. Any missing, candidate, revoked, symlinked, moved, changed or oversized Plan file is denied. Only privileged Main may inject issuer attestation (no test-style no-op in real deployment).
2. `plan-binding-v3.ts` at `bd5f72135ebfd64aabe81bb51bc2adee72823be3`: extends the existing published-Plan verifier signature to also receive the exact CaseAggregate supplied by existing `submitCommand` at CAS commit, preserving backwards-compatible one-argument verifiers. This is **not** a new shadow plan store or an IPC writer.
3. `C2MainPublishedPlanProvenance.assertPublishedPlanForCase`: rehashes Case-registered original physical bytes for every Plan source binding under the same C1 bind/upgrade CAS. `assertPublishedPlan(aggregate,run)` independently rechecks publisher, exact check/source sets and actual originals at each C2 Run boundary. This does NOT assert real B publisher exists.
4. `review-v3-main-plan-provenance.test.ts` initial commit `0dcf0f8172e150e84ee7dcf97f308d0b1f5b5260`, final extra negative `0f7a0de92d199772c55db77ddb49e64c12635636`: actual fixture files and C1 aggregate CAS / Receipt, 8 tests: valid physical publisher+Case bind/Run, rejected candidate/revoked/missing policy, independent publisher authorization deny, symlink/tamper/disappeared plan, modified physical original blocks CAS without receipt, post-bind revoked/tampered source and wrong Run check, invalid publisher deps/root, plus forged B1 frozen candidate with repinned raw file digest never passes.

**Current engineering SHA** `0f7a0de92d199772c55db77ddb49e64c12635636` (Draft #144, unmerged). GitHub PR CI `39308572991`, Baseline `39308572781`, Batch `39308572882`, D1 `39308572804`, D2 `39308572893` triggered; **new exact-SHA Gate O = NOT_ATTESTED until all required workflows pass**. Old parent SHA PR jobs may cancel when a new push is made; cancellation must not be counted as source failure nor as PASS.

## Contract boundaries and missing production sources

- Physical publication artifact file format here is a future C *consumer contract*; it does not turn B1 `candidate-held` into `published`. The trusted `getCurrentPublication/assertAuthorizedPublication` MUST be backed by an independently authoritative and reviewable B publisher / operator approval trust root. The test fixture's mock `published` and issuer callback proves rejection semantics only, **not** real issuer authentication or Gold correctness. A bare Git source SHA is **not** publisher authorization or signature.
- Case original bytes are C registered physical originals, not transient B2 staging bytes. Current per-operation read/hash is not a complete adversarial cross-PID locking mechanism; C-Tx OS process/atomic durability work and real Gate E remain separate.
- No change to A/B/I production sources, ordinary user Pi session/proxy, Main IPC/Preload/shared, policy data/Gold, SchoolPort, any Run/Decision/Outbox writer. Existing C2 Main trust assembly still **requires explicit future wiring** to this newly developed consumer. Nothing automatically activates it at present.
- No credentials, real Provider fetch, x-request-id promotion to Host read/check/terminal, auto-Check Decision, school approval or release.

## Next execution gate

1. Verify exact `0f7a0de...` all five GitHub Actions including actual Bun 8 new test lines and pre-existing Plan CAS regression, TypeScript, boundaries, skin, and Main/Preload/Renderer build; on failure preserve job/first failing line, make C-only repair, run all new-SHA gates.
2. If all pass, formally sign only `C2-R05_GATE_O=PASS_EXACT_SHA_OFFLINE_PUBLISHED_PLAN_CONSUMER` and update this C-only report and shared STATUS:C. Do not grant I extra C source scope by signing this.
3. Next C plan: finalize independently authorized B publication evidence entrypoint and C-owned Main trusted execution assembly hookup **only after source proof exists**; focus next on C-Tx cross-PID OS process and crash-safe single-aggregate CAS/Receipt, avoiding pretend production Gate E.

**Current Gate E: NOT_RUN; Gate L: BLOCKED_NO_AUTH; Gate P: NOT_RUN; Release: NO_GO.**

# Dev-B R20 | C Main read-only dependency bundle — actual B1 vault + B2 original + B19 provenance

> **Owner Dev-B; C→B fixed task `B-PREREQ-R20-CMAIN-READ-SOURCE-CONTRACT-R01`.**
> Governance: #145 `DECISIONS:C`, `B-CR-003=APPROVED_SCOPED_C_OWNED_OFFLINE_READ_CONTRACT_ONLY / B_FOLLOWUP_REQUIRED`.
> **Engineering only, candidate-held, no C Main ownership / School publication / Business writer delegation.**
> Source baseline **R19** `77e6df0511098e084b045a711d16c48cad93c758` (PR 39324901639, D2 39324901546, Baseline 39324901534 completed/success; Bun 4200 PASS / 5 OS SKIP / 0 FAIL).
> Live R20 Gate O result belongs to **the exact final B PR head after this document commit**. The source lock below has real Git *blob IDs*, not a claim that any later B revision was authorized for I or C.

## 1. Actual B-only API / trusted dependency contract

`apps/electron/src/main/lib/review/review-v3-b1-b2-main-read-bundle-v3-b.ts` exports:

- `readB20CurrentCandidateBundle(expected:B20ReadAuthorExpectation, dependencies:B20ReadOnlyDependencies, previous?:B19CandidateSnapshot):B20CurrentCandidateRead`.
- `B20ReadAuthorExpectation={templateId,revision,revisionDigest,frozenFingerprint}`: a pin against currently persisted B1 author revision and immutable candidate. This is an *expectation*, not a user identity or authorization token.
- `B20ReadOnlyDependencies.authority?:B20CurrentMainReadAuthority` is **REQUIRED** at run time (otherwise `B_R20_MAIN_TRUST_DEPENDENCY_NOT_INSTALLED`). It has `currentScope()`, `currentSelections(scope,expectation)`, `nativeArchiveKey(scope,archiveId)`.
- `B20MainReadScope` requires current Main-derived `principalId/sessionId/senderId/frameId/ownerId/ownerGeneration/caseCandidateId/authorityEpoch`. **B never authenticates these**; C must derive them from actual current Main Principal/window+frame/Owner grant, independent of renderer claims, and enforce permission before using this service.
- `sources?:{staging,parser,vault,ledger}` are **existing B-owned live B2 objects**. No other vault, no shadow ledger, no automatic regeneration/republication. Missing dependencies fail closed.
- Selections must come from a C-owned authenticated current registry, **not renderer supplied raw SourceIdentity or file name**. For each ZIP archive, `nativeArchiveKey` must be independently sourced from a current native picker record; it is never returned from bundle to Renderer. Empty genuine registry yields UNKNOWN, absent registry is an error.
- `B20CurrentCandidateRead` contains exact current `authorRevision/authorRevisionDigest/frozenFingerprint/frozenAuthorDigest/frozenDescriptor` plus `candidateProvenance`. All flags are `candidateOnly=true/publicationAllowed=false/businessWriteAllowed=false/schoolPolicyVerified=false/authorityInstalledByB=false`, never a Check PASS or school-authorized publication.

**B1 full-chain**: `readB1AuthorRevision(templateId)` verifies every parent revision and digest, not just the latest JSON. `readB1FrozenCandidate(templateId,fingerprint)` verifies the original immutable frozen descriptor against the persisted source revision/Plan fingerprint; the facade additionally checks it equals **current** revision. After the B2 read it **re-reads** both durable B1 artifacts, then checks new `currentScope()` identity epoch and B2 active grant. A changed author revision, scope, missing parent, malformed frozen, mismatched digest, link/hardlink or unreadable file stops the bundle. It never freezes or saves on behalf of an unsaved editor.

**B2 and B19**: calls existing `buildB19CandidateSourceBindings` with current B2 parser/staging/archive/ledger/receipt; per-check selection rereads exact original and parser-registered block, current role/Subject and Owner generation, not similar filename/text/raw digest. Candidate original and archive CRC/decoder profile, immutable InputLedger /2 receipt, parseRevision and SourceIdentity originate in B2 registries. Result retains per `Check×target×object×Subject×source` UNKNOWN/stale/needs-human-confirmation and `invalidatedPriorEvidence`. Previous snapshot is audited/diff-only, **not authority**. Missing or old confirmation never permits candidate linked; linked itself does not indicate normative Check compliance.

**C boundary**: the new facade is a *synchronous B-owned core*, not a C-owned IPC handler. Any actual async C auth/NativePicker/SourcePort operation and IPC serialization needs **C Main validation of Principal/window/mainFrame/current Owner/epoch before and after every await**, independently confirmed current author/template ACL, plus current source capability installation. Unit fake `authority` in B tests shows interface compatibility, **not production Main proof**. No default `canRead=true`, imaginary `local-reviewer` teacher, mock school Publisher, automatic C official Plan admission or new C Reader installation. Main must not expose private native picker keys, trusted scope, or synthetic SourceIdentity as Renderer input. B implementation creates no Case/SourceLedger/Run/Decision/Outbox/Business Receipt/UpgradePlan writes.

## 2. Precise import graph, fixed B source blobs

All paths below are prefixed `apps/electron/src/main/lib/review/`.

| Module (exact filename) | Frozen source Git blob SHA | Source baseline | Actual dependency / purpose |
| --- | --- | --- | --- |
| `review-v3-b1-b2-main-read-bundle-v3-b.ts` | `2ff051fc5d18a2c0ef9465188a3611a71a0989ee` | R20 candidate, independent final CI required | only new production facade, reads below |
| `review-v3-b1-b2-main-read-bundle-v3-b.test.ts` | `65fc1149b6bd73b2e51f0e0e960541204055128d` | R20 candidate, independent final CI required | real B1 revision archive + ZIP/parser/ledger integration test |
| `review-template-author-store-v3-b1.ts` | `065251ca843c51e68e225dc688bb7a8caab2fea7` | R19 frozen source HEAD | `readB1AuthorRevision`, `readB1FrozenCandidate`; fs no-follow + strict history |
| `review-template-plan-adapter-v3-b1.ts` | `974f0b0d127301ed71ad10df5ae64623ce378882` | R19 frozen source HEAD | `verifyReviewB1Descriptor`, C0 canonical compiler |
| `review-v3-b1-b2-candidate-source-bridge.ts` | `e322df7ddc0910f5065d7a887507218cac7a7713` | R19 `77e6df...` | `buildB19CandidateSourceBindings`; B1 Check×target source proof and conservative transition |
| `review-intake-adapter-v3-b2.ts` | `ebc5f82ca72870839bfa441e6752f81a088c601c` | R19 frozen source HEAD | `ReviewB2StagingService` original bytes and scoped grant |
| `review-source-version-adapter-v3-b2.ts` | `b2101be80e3dce561f6365c3378b2930245dda73` | R18+R19 source HEAD | `ReviewB2SourceVersionAdapter` parseRevision/current physical parser block |
| `review-import-checkpoint-v3-b2.ts` | `35b4d9e757b5b1530c7ca0407c405e8513b5caf7` | R18+R19 source HEAD | `ReviewB2ArchiveVault` original immutable ZIP / decode limits |
| `review-import-ledger-v3-b2.ts` | `273b8ea71ed739f01238c5bcf1f57be7a39a6502` | R19 source HEAD | `ReviewB2InputLedger` true accepted /2 role+Subject+generation receipt chain |
| `review-import-handoff-v3-b2.ts` | `b1a8e05ffb49cf26888b5252700eb508cca4e3b4` | R19 source HEAD | `proposeB2MaterialCandidates` input-only accepted receipts; never ApplyMaterial |

**Actual directed graph:** B20 facade → B1 author-store → B1 plan/compiler; B20 facade → B19 source-bridge → (B2 staging → raw bytes, B2 parser → live block SourceIdentity; B2 archive vault → original ZIP+CRC; B2 InputLedger → append-only confirmation; B2 handoff → verified input-only proposal). This is a **source dependency manifest, not authorization to copy all those files into I**. I/C must independently validate exact source/target blob and make their own contract CR.

## 3. Security / failure semantics

| Condition | Required behavior |
| --- | --- |
| No current Main Principal/session/Owner/frame/epoch, no source registry/native picker installation | `B_R20_*NOT_INSTALLED` and no read bundle |
| Source candidate physically replaced, parser block unknown, parseRevision stale | B19 `stale` / `unknown`, no guessed new SourceIdentity |
| Old generation receipt; changed Role, Subject, unrelated Case | deny or `needs-human-confirmation` |
| Same filename/bytes, different physical native source | changed `DocumentVersion`, no old identity carryover |
| Saved author revised, parent digest corrupt, missing old file, frozen Plan mismatch | `B1_*` or `B_R20_*` exception; never repair history by rewriting |
| Current author revision changes or Main epoch/Owner/frame changes during bundle read | second read/epoch checks reject; C also reauthenticates across each IPC await |
| Previous audit checksum altered or historical Check removed | prior proof never accepted as authority; exact old invalidation retained |
| Render-side publisher/actor/source fields added to a fake test scope | not copied to output; cannot affect publication/authorization flags |

**Not addressed by offline Gate O:** real symlink races during Windows filesystem operations, networked FS/multi-host locks, invalid system clocks/OS group, real Electron native picker / current Main auth epoch, crash/ENOSPC/forced termination, Office71/OCR accuracy, policy Gold, 5-person product UAT. B1 vault fsync/O_NOFOLLOW protected paths and B2 archive integrity checks exist but only actual OS Gate E verifies the full end-to-end installation. Do not misstate Linux test evidence as all-platform hardware evidence.

## 4. Actual regression coverage and first-failure history

R20-specific `review-v3-b1-b2-main-read-bundle-v3-b.test.ts` contains:
R20-01 real B1 append-only save/current frozen and actual ZIP→/2 ledger→parser→B19 3 Check result; R20-02 unsaved vs saved and stale frozen; R20-03 damaged/missing parent; R20-04 frozen tamper/cross-template/missing/wrong digest; R20-05 absent trusted dependencies/selection registry/native key; R20-06 native key tamper/cross archive entry/Subject/role; R20-07 stale revision/missing parser block/UNKNOWN/revoked owner; R20-08 Main epoch/frame/cross Case rebound; R20-09 real ZIP bytes and InputLedger receipt tamper; R20-10 byte-identical filename/physical source distinction; R20-11 previous audit and other Check unaffected; R20-12 renderer fake publisher and invalid frozen expectation.

**Real initial CI fault:** R20 pre-fix SHA `32665c6e432f65ee83adc098336d58a72583f101`, D2 run `39328170737` failed at workspace TypeScript TS18048 (B1 possibly undefined), TS2322 native physical key nullable. Review Baseline `39328170846` SUCCESS; old SHA **not all green**. Fix in B-owned facade with explicit fail-closed `throw`, commit `658fe548fd5d28df86836b99cdae0784d4bd38cf`. No C Main/Preload/shared code touched, no security constraints relaxed. Final exact HEAD CI to be independently read from GitHub, do not reuse these older checks.

## 5. Centralized future verification (separate E/L/P gates)

In one owner-authorized local Agent test batch, attach exact source SHA, OS, native picker, actual C Main scoped Principal/Owner generation/epoch and held artifact hashes, then execute:
1. Real Electron Main window/Preload, picker/drop, active/closed/reopened window and senderFrame: trusted author and selection registry installation vs fail-closed absent.
2. 50-set historical candidates + new 51st author save/dirty IME/current revision/freeze, cross-template, new Check added/removed and Check×target impact. Record every immutable revision hash and original.
3. Actual Office71/PDF/scan/ZIP with real bytes and clear precision, same bytes new physical native handle, /2 receipt Subject/role, old owner reauth, tampered parser block and archived ZIP. No fake C Publisher/SchoolPlan.
4. Cross PID, ENOSPC, injected crash and cold restart, concurrent ZIP/author save, source scope revoke during awaits; no old candidate ID reuse or unverified Case writes.
5. 100 cases/500 files load; windows/macOS/Linux; provenance snapshot comparison and unchanged Check preservation. Collect independent raw logs, exact SHA, screenshot and full recorded user interaction.

**Gate O:** exact SHA PR CI+D2+Review Baseline+full Bun/TS/boundaries/three-end build+raw R20 tests. **Gate E:** NOT_RUN until C authentic runtime adapter/author/picker registry is actually installed. **Gate L:** BLOCKED_NO_AUTH until school publisher/Gold/policy sources independently signed. **Gate P:** NOT_RUN until five independent nondevelopers each complete the real 51st candidate workflow (30 minutes). **Release:** NO_GO. No merge/publish without C/I separate source-lock decisions.

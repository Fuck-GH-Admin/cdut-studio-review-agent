# Dev-B R19 | B2 physically verified input → B1 Check×target candidate provenance

> Owner: Dev-B only. Engineering candidate, **not** C business Case, C SourceLedger, ApplyMaterial,
> ReviewRun, Main IPC writer, school Publisher, policy Gold, or a release.
> Source PR: #142 `feat/v3-dev-b-template-intake-r01`. Baseline: R18
> `263b7f36034cacd4d51a00edd5f39266c37037fa`.
> **CI result must be attested against the exact final source SHA, not this Markdown's changing branch ref.**
> Gate E / L / P are NOT satisfied by Bun tests; Release NO_GO.

## 1. Code and boundaries

- B-owned new module: `apps/electron/src/main/lib/review/review-v3-b1-b2-candidate-source-bridge.ts`.
- B-owned test: adjacent `.test.ts`; real B2 ZIP decoder, fsynced archive, per-file InputLedger and receipt, staging original bytes, TXT parser registered block, real B1 compiler and frozen Plan verification. These are **real service APIs** with deliberately synthetic school semantics.
- `buildB19CandidateSourceBindings(ctx, author, frozen, selections, environment)` requires the **current** Main-derived `B2MainContext` (sender/frame/owner/generation/case), verifies frozen author and re-runs the canonical compiler before mapping Check×target×Source.
- Caller selections identify `checkKey`, `targetKey`, `sourceId`, `candidateId`, `parseRevision`, `blockId`, `requiredRole`, optionally ZIP `archiveId` + `entryIndex`. Selectors are not evidence: `staging.getCandidate`, `parser.candidateReadExtent` and `SourceIdentity` are obtained from original bytes and live parser registry.
- For ZIP, the **trusted native-picked physicalArchiveKey** must re-match the archived checkpoint's key SHA and current owner scope; the candidate physical source key/request ID must match actual archive+entry identity; `proposeB2MaterialCandidates` + `ledger.snapshot` must independently replay the fsynced accepted `/2` receipt with exact role, Subject, raw digest, archive, entry, and **current Owner generation**. Stale-generation receipts cannot re-authorize.
- Author `B1Source.documentVersionId` must equal the Main-staged `B2MaterialCandidate.documentVersionId`; InputLedger `candidateVersionKey` is **not** a C DocumentVersion, and filename/identical bytes/text do not confer identity. Unknown, unconfirmed, skipped/rejected, unsupported read extent, old parseRevision, absent block, wrong Subject/role or physical Source are never a verified binding.
- A receipt-linked source proves only a **single parser block** technical candidate association. It never proves complete document inspection, authorized policy/Gold, a compliant Check, an accepted Case material, or a completed ReviewRun. `publicationAllowed=false`, `businessWriteAllowed=false`, `schoolPolicyVerified=false`, `candidateOnly=true`.
- A direct Main-staged file without independent human Subject/role receipt remains `needs-human-confirmation` even when parser block is verified.
- Caller may pass an earlier audit-only snapshot: its checksum and scope are checked, but it is not a signature/authority. The new snapshot preserves old links as `invalidatedPriorEvidence` by exact Check×target×object×Subject×source, not blanket deletion. Changing old original, DocumentVersion, parseRevision, block, Subject, source receipt or Check mapping never silently carries over validity. Historical vault/ledger/revisions are untouched.
- C owns Main trusted reader/authoritative actor, official Material admission, SourceLedger, Case CAS, Plan upgrades/ACK, Publisher and actual workspace mounting; B has no permission to wire these. Gate O of C's real Main/Preload registration does not install independent real sources.

## 2. R19 reproducible regression coverage

Run:
```bash
bun test apps/electron/src/main/lib/review/review-v3-b1-b2-candidate-source-bridge.test.ts
bun run typecheck
bun run check:package-boundaries
# additionally all mandated GitHub workflows: PR CI, D2 Scoped Pi, Review Baseline
```
(The workflow's own actual command/configuration is authoritative if package scripts differ; do not relabel a skipped command PASS.)

| ID | Actual expected property |
| --- | --- |
| R19-01 | Real two-file ZIP, accepted role/Subject receipts + original parser SourceIdentity link 4 Checks / 5 sources; no publication |
| R19-02 | Absent source selection stays UNKNOWN; independent Check survives |
| R19-03 | Same filename and same SHA, different physical original → distinct DocumentVersion; old evidence stale |
| R19-04 | Update A source → exactly three A Check×target source edges invalidated; B-only Check keeps prior proof |
| R19-05 | Subject/role mismatch, unconfirmed ledger and forged native physical-key denial |
| R19-06 | Cross-ZIP-entry candidate, forged parser block, old parseRevision and duplicate selection refusal |
| R19-07 | Wrong Case, Owner, Owner generation and revoke |
| R19-08 | Actual checkpoint bytes + persisted receipt corruption; original restored after negative test |
| R19-09 | Main-staged real TXT direct source without human receipt remains unconfirmed |
| R19-10 | Frozen author mismatch, checksum-corrupted prior audit, Check removal without old evidence mutation |
| R19-11 | Skipped/rejected ZIP entries retain raw original/terminal ledger status, never linked |
| R19-12 | Old-generation accepted receipt cannot become new Main-generation human confirmation |
| R19-13 | Author conditional UNKNOWN overrides material technical linkage (no false Check PASS) |

## 3. Gate O audit trail and first failure

- Historical R18 baseline: `263b7f36034cacd4d51a00edd5f39266c37037fa`; PR/D2/Baseline completed-success; full Bun 4187 PASS/5 OS SKIP/0 FAIL.
- First R19 code+test SHA: `608eeda825b41eaf0846b1b4d5ddaf29fb8f1eb8`; PR CI `39324339684` and D2 `39324339574` **failed in workspace TypeScript**. Actual errors: `review-v3-b1-b2-candidate-source-bridge.ts(164,21)` TS18048 and `(164,52),(189,55)` TS2345 because nullable ZIP vault/archive scope wasn't narrowed for async-free access. Baseline `39324339557` succeeded. **Do not represent this SHA as green.**
- Fix SHA: `63c6b75889b632eec7753e2072e1ce9c39f7e5d6` scopes verified dependencies to local non-optional references; adds old-owner-generation receipt fail closed. Extra R19-11–13 negative tests added in `143e8c6b3d2dec6607c2bc5cdbdcb6cfc67df53e`.
- Current final Gate O requires **new exact HEAD** PR CI/D2/Baseline run IDs, completed-success, original TypeScript/package boundary/skin/build/full Bun logs and new R19 tests. A green earlier SHA does not attest a newer commit. Final run IDs/results shall be anchored in PR #142 comment and #145 `STATUS:B`, not guessed here.

## 4. Concentrated Gate E (real operating system / Electron) checklist

Prepare one owner-scoped evidence directory named by the exact A/B/C/I source SHAs and OS:
1. Real Electron Main window and real native picker/drop verifies **Main-derived** sender+mainFrame+Principal, Owner generation, archivePhysicalKey and B archive reauthorization; invalid Renderer-supplied actor/frame/path cannot call this adapter.
2. Real Office/PDF/scanned image/TXT/ZIP original; parser block/ref precision vs file-only/partial, exact original byte digest + DocumentVersion; inspect both normal and intentionally ambiguous pages. **Office71 representative corpus** and all three desktop OSes, recording what was actually run and skipped.
3. Drag/drop 100 cases / 500 files with scoped grants, corrupted and duplicate names, ZIP bomb/CRC/path traversal, concurrent quota/ENOSPC, two independent PIDs, killed process in fsync/rename window and cold restart.
4. Human-confirmed Subject/role vs wrong Subject, revoked Owner, resumed new generation, old imported file, changed raw original, stable same-file text/new handle and ledger receipt tamper. Record exact touched Check×target, untouched Checks, prior snapshots, original refs, and history proof.
5. No CurrentCase/SourceLedger/Run/UpgradePlan side effects from the B bridge; use actual C-owned Main reader/writer with C's explicit signed lease only when C authorizes installation. Existing technical C IPC registration alone is insufficient.

Store raw commands, logs, screenshots/recordings, input hashes, application/OS versions and observed failure reasons. No simulation can replace Gate E.

## 5. Gate L / P / release

- School Gate L: **BLOCKED_NO_AUTH**. Independent authentic school policy source, objects/applicability, ACL, publisher signature, independent Gold and high-risk semantics required.
- Product Gate P: **NOT_RUN**. Five non-developer users × 30 minutes independently perform first-time 51st candidate workflow from actual main window with real original/receipt, source update, conflict/backup/IME, recovery and conservative UNKNOWN. Capture individual usability data and recordings.
- Release: **NO_GO** until A/B/C/I source replay formally accepted by C, true Main authorization installed, Gate E/L/P and independent launch decisions are satisfied.

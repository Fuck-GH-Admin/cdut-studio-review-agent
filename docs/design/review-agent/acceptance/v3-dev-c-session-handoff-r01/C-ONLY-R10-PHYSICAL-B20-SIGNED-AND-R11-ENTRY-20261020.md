# Dev-C ONLY — R10 C-physical B20 正式工程验收及 R11 入口（2026-10-20）

> C 独占的工程进展和下个 C 会话继续说明，A/B/I 无须阅读或 ACK。正式权限/决议唯一来源为 #145 共同协议 DECISIONS:C / STATUS:C 和 C 的 #144 签收。本文没有新主进程写权限或学校发布授权。

## 精确已绿检查点

- Repo: Fuck-GH-Admin/cdut-studio-review-agent
- C independent engineering branch: `feat/v3-dev-c-business-r01`; Draft PR #144; 保持 main 未合并。
- **Current C R10 exact signed HEAD:** `2cb8331b8fdff43da70a894ec597820595cb4d2d`.
- **Rollback accepted C R09:** `d7548c3eefedb10f4cc23c12e70712e1e1fd1e3a`.
- C R09→R10 diff: ahead 13/behind 0、**28 paths**：源锁 21 个 C 已批 B R23 pure Git blob（11 生产代码、10 测试）+ 7 个 C-owned files（C Main author/plan IPC、native ZIP registry、Main physical B20 composer、Main current registry、B20 real physical integration test、shared review IPC channel、Preload API）。保留 I5 四个 immutable C readers 原样：独立 GitHub repository tree 逐项比对 `I5-EXACT-SOURCE-LOCK.json` **25/25 exact Git blob**。
- **Full Gate O 5/5 SUCCESS on SAME exact SHA**: PR CI run `39375717913`, **attempt 2**, job `118488530240`, frozen dependencies TypeScript/package boundaries/skin/Main+Preload+Renderer build/full Bun **4273 pass/5 OS skip/0 fail, 4278 tests across 494 files**; Baseline 39375717996, Batch 39375717997, D1 39375717977, D2 39375717988 all SUCCESS.
- Signoff: https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6284933899
- Failures deliberately retained: earlier R10 code integration Bun **4268 pass/5 skip/5 fail** due JSON key insertion order being wrongly used for C Main identity equality; production and test corrected to explicit Principal/Session/Window/Frame/Case/Owner/Generation/Epoch field comparisons, no ACL weakening. **Final SHA attempt1** only GitHub Runner checkout TLS/HTTP2 exit128, source/tests never started. Exact SHA attempt2 reran all successfully. Prior R10 TS strict return typing issues remain in historical CI records.

## What R10 actually implements

1. Registered Electron Main `B20_CANDIDATE_READ_V3` returns display-only/never-published view after independently privileged C Main installs `installCMainV3PhysicalB20Sources`. It consumes actual B1 author revisions/frozen pins + B2 current staging, parser, ZIP original Vault/entry ledger + B19 provenance/bindings + B20 Main read and C double current-check.
2. `CMainB20NumericEpoch` binds B senderId and frame routingId from physical Electron event; numeric authority generation rotates with verified C Main scope and is **never parsed from** string authorityEpoch or accepted from Renderer.
3. `CMainNativeArchiveRegistry` now has `pickForBVault`: actual Electron native ZIP dialog, exact ZIP bytes sha/inode/size/nlink/no symlink, original B Vault sealed physical private key digest, C Main Owner and frame repeated at every read. `B20_NATIVE_REPICK_V3` + `preload.reviewAPI.repickCurrentB20ArchiveV3` accept **only templateId and 40-hex archiveId**, no path/key/Principal/publisher.
4. `CMainB20CurrentRegistry` holds ONLY Main ephemeral current candidate/source selections and B1/B2 identity; validates frozen B1, scoped B2 staging and archive, current C Owner frame/grant, supports revoke and close. Cold PID empty; not a new durable Case/Host/source authority.
5. New `review-v3-main-b20-physical-composition.test.ts` exercises the registered Electron IPC with physical ZIP CRC, true B1/B2/ledger, native private ZIP repick and after-await provenance; rejects fake archive/path, revived owner epoch, changed B1, changed inode despite same bytes, cold restart without physical picker.

## Not complete (do NOT overstate)

- R10 has an actual installed-by-privileged-Main *implementation*, but app startup **does not yet automatically install a real, independently verified C Principal/Owner/Grant/current Case producer**. Old `liveFrame()` currently identifies `local-reviewer` locally; this **is not an official school publisher**. The C Main current Owner host interface must be satisfied using genuine current runtime state, not fixtures or self-issued grants. Default denied until installed.
- Real OS Electron Gate E **NOT_RUN**; no real user navigating the UI/desktop beyond source-based registered IPC test hooks. `readCurrentB20CandidateV3` and `repickCurrentB20ArchiveV3` have Preload interfaces but are not claimed to be a full Renderer workbench.
- A R21 technical SDK execution cannot be counted as C physical Host ACK; C Host/Run real Main assembly remains to implement. C R09 single Case CAS Run-wide durable fence persists, but no false remote school response.
- B latest R29 only B-owned, not approved for C/I source replay; I5 is frozen to B R23. No dynamic 51st school policy publication; G08-T03 RAW missing / G01 scope and unknown SourceRefs remain.
- Gate E NOT_RUN, School L BLOCKED_NO_AUTH, Gate P NOT_RUN, Release NO_GO. No merge or privilege widening.

## Next C dense work package (R11)

1. First re-read #145 latest DECISIONS:C/STATUS:C and #144 HEAD; preserve R10 rollback. Find actual authorized current Main Principal and Owner/grant provider in existing Electron/Review modules. Implement trusted host bootstrap only with real installed identity or fail closed. Do not conflate C local `local-reviewer` with school authorization.
2. Inspect A R21 exact `703e2bf8e20a7b598e1eb923d5faf6f7b17ab3a9` and any newer A-only changes. For A SDK→C Host physical receipt source, first submit exact-source/file-dependency CR to C when necessary; A SDK transport receipt is NOT C physical Run/Host ACK.
3. Concentrate actual C Main→Owner→Pi technical current Source→C Host Read/Check/terminal→Run with R09 durable fence, unknown-Provider recovery/stop/restart, into a single engineering batch. Ensure no authority is minted in C from Renderer, no implicit school publisher/Outbox, no duplicated Case writer.
4. At batch end, full Gate O + scoped negative tests; real Electron Gate E separate; preserve all historical CI failures and exact signed old SHA.

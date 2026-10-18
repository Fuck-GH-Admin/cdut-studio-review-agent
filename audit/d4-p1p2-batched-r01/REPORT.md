# D4 P1-C + P2-A/B/C unified independent acceptance

Acceptance date: 2026-10-18 (Asia/Shanghai)
Overall verdict: **PARTIAL**
Candidate: PR #120, frozen HEAD `026cfe0f4905bf10f46291bdd7451788c60df5f9`
Evidence branch: `audit/d4-p1p2-batched-r01`
Draft evidence PR: [#122](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/122) (open, Draft; base is frozen PR #120 HEAD).

The unified taskbook was executed against the current #120 HEAD in an isolated detached worktree, Electron profile, empty model-config directory, and Xvfb display. The remote branch and `refs/pull/120/head` both still matched the pinned SHA at final verification. The existing #120 PR is Draft. No tracked product code, Gold, business template, approval boundary, or P06 state was changed.

## A_GUI — GUI_FAIL

A real Electron window was driven through its visible UI and the GTK/system file picker. The only selected file was the synthetic 40-byte `公共教学教室借用申请.md` fixture (SHA-256 `57bdcc65f42a3c551601e2d23ddf7e72ae474b1d621192e75496d8b2a951684e`). The native-picker evidence is a direct Xvfb region capture of the chooser path bar; the unrelated host directory listing was excluded from the evidence bundle.

The suggestion showed `g03-t01`. After 20 seconds the template suggestion was adopted, while the UI still showed zero subjects, no filled scene or conditions, unchecked confirmation, and a disabled create action. A physical selection changed the template to `g03-t02`; after 21 seconds it remained selected. Cancel returned the Main IPC case count to zero.

The rapid mouse-double-click path is the blocking failure. With one manually confirmed G03 subject, public-classroom scene, and all eight conditions left `unknown`, the visible button received a two-click CDP input 40 ms apart. The UI showed both a successful case-created toast and a red “新建案卷失败” toast. The Main log records the second `review:create-case` request failing with `D4_INTAKE_TOKEN_INVALID`. Read-only `listCases/getCase/getAggregateV2/listRunsV2` found exactly one matching case, one parsed 40-byte application document, one subject, 52 D2 rules, fingerprint `0092f616f43f29ce9baf6830434e0fb22313c5206a7f2290e3b11183dea4e290`, `publicationAllowed=false`, eight unknown conditions, zero EvidenceLinks, and zero PiRuns. This proves final state is deduplicated, but the second Main create attempt and false failure message violate the acceptance criterion.

The first Enter+click attempt created one case and one file without a false failure toast. A second instrumented round confirms the race inputs rather than inferring them from a single-click screenshot: a trusted Enter keydown on the applicant input, trusted pointerdown/up and click on the create button, and two form-submit events were observed in one unawaited CDP input batch. It produced one successful case, no false failure toast, one file, and a single subject. Main readback shows fingerprint `96a1717789eb7ec8a9b23e24f71f82cf6446efe78491c00e772d0233a178120f`, `publicationAllowed=false`, zero EvidenceLinks and zero PiRuns.

After reload, all three deliberately named synthetic cases retained their case IDs, one document each, D2 fingerprints, and single subjects. Source and all three stored `source-docs/` copies have identical SHA-256 values. The test profile contains three cases because the Enter+click route was repeated once to record both actual event families; the canceled suggestion/manual-override draft created none. No direct create IPC or database write was used.

Shortest repro for the defect: open a D4 new-case dialog, select the synthetic Markdown through the system picker, adopt G03-T01, add one subject, choose `p-public-classroom`, leave all conditions unknown, confirm, fill synthetic title/applicant, and double-click “创建项目” 40 ms apart. The UI then shows a success toast and the false `D4_INTAKE_TOKEN_INVALID` failure toast although Main readback contains one case and one material. See `screenshots/31-mouse-case-ready-doubleclick.png`, `screenshots/32-mouse-doubleclick-result.png`, `logs/mouse-doubleclick-dispatch.json`, `logs/electron-120.log`, and `readback/after-mouse-doubleclick-main-ipc.json`.

Historical PR #111 C01–C09 evidence was not rerun or overwritten. The independent #120 retest does not inherit an old GUI PASS: it is `GUI_FAIL` due to the reproduced C10 toast.

## B_OFFLINE — OFFLINE_P2_PASS

Two isolated fixed worktrees measured the actual `preparePiReviewRunV2.userMessage` for the same frozen synthetic G08-T02 two-subject selection. The comparison returned `PAIRED`, with matching template/version, selection hash `bcfa1700cbdcaa619c9c53267bb0e5ab335131d726559a9cd5f8634ab130274d`, 107 Rule IDs, 107 Check IDs, and requirement hash `72c87042d73c53dc486ce289225fed607bbd32150f87175c57991116e5a4edc4`.

The #112 prompt measured 128,358 characters / 243,080 UTF-8 bytes; #120 measured 100,816 characters / 183,673 UTF-8 bytes. The difference is 27,542 characters (21.46%) and 59,407 bytes. The rule region changed from 104,849 to 79,762 characters; the mapping region from 17,687 to 16,419. #120 used the lossless requirement dictionary and reconstructed 70 full requirement strings from the 107 RuleSpecs; the exact sorted Rule/Check ID sets and hashes are retained in the metric JSON files. These are prompt-structure measurements, not token, cost, or model-quality evidence. `modelInvoked=false` in both runs.

The seven targeted offline test files passed 26 tests / 1,980 assertions with exit code 0. Coverage includes the G08 107-check prompt, 70-entry requirement dictionary, unconfirmed-rule fail-closed behavior, invalid observation and empty reason, invalid/unread source reference, same-run valid repair, and D2 execution-gate regressions. Both frozen-worktree metric runners and the paired comparison completed with exit code 0 using the repository test Electron preload; their raw logs and the earlier failed runner attempts are preserved. A separate fixed-HEAD `review-d4-g08-templates.test.ts` run also passed 12 tests / 320 assertions (exit code 0), covering actual synthetic G08 D2/Pi Main-service runs, unknown applicability, subject-scoped EvidenceLink rejection, and stale document-version rejection.

## C_MODEL — MODEL_NOT_RUN

No online model request was made. The model config directory was empty, and no Provider key, real data, or approval to make an online request was used. Therefore no provider transcript, token usage, rejection rate, completion rate, or model-quality claim is made.

## P06_EXTERNAL_DEPENDENCY — NOT_RUN

P06 was not executed, accessed, or altered. Its provider/background-session state remains a separate acceptance dependency and is not certified by this run.

## RELEASE_GATE

**Do not prepare restricted technical integration yet. Keep the candidate held.** CI and offline P2 checks pass, and the Enter+click instrumented subtest passes, but GUI acceptance fails on the actual rapid mouse double-click path. The minimum next fix is to make duplicate create submission single-flight through the renderer/Main boundary so a duplicate request cannot surface as a failure after the first request succeeds; then rerun the isolated double-click and Enter+click cases with the same read-only Main assertions. Do not modify approval boundaries to make this pass.

## Evidence and provenance

`evidence/environment/` records the fixed source SHA, clean test worktrees, runtime, CI run IDs, and empty model config. `evidence/screenshots/` contains the staged/material, timing, pre-submit, success/failure toast, event-race, and reload captures. `evidence/logs/` retains raw UI dumps, actual dispatch and Electron failure logs, CLI logs, and failed invocation logs. `evidence/readback/` contains read-only Main IPC snapshots and source/copy hashes. `evidence/metrics/` contains both actual prompt measurements plus exact Rule/Check ID sets. `SHA256SUMS` covers every bundled file except the two checksum files themselves; `SHA256SUMS.sha256` records the manifest digest.

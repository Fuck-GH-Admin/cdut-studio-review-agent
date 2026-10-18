# D4 P1-C C10 R03 targeted QA

**Verdict: `C10_R03_BLOCKED_INPUT`.** The required trusted input sequence could not be delivered credibly by the GUI driver: all three mouse40 attempts exceeded the 120 ms event-gap limit, and the second pointer event landed on a page `DIV` after the dialog had transitioned. The Enter+Click attempt produced a trusted Enter and its native button click, but the later mouse event also landed on a `DIV`. These are invalid input attempts under the taskbook. They do not establish a product defect, and no product failure is reported.

## Fixed target and code checks

Execution used PR #126 at fixed HEAD `412e1520b22591818463dff3e6658cfa09fe124d`, based on `fc5100b339d1f097aea4ee60bd2d912276bf8429`. Merge-base matched that base SHA. The detached QA worktree was clean after reverting temporary Main instrumentation; the tested source tree was `5b1c5e6bc081ac6640fa5138ea7c61167661dfe3`. The audit branch is based on the tested HEAD and adds evidence only.

`CODE_CI_PASS`: frozen install, typecheck, boundary check, Main intake-token tests and renderer submit lifecycle tests all passed locally. The seven GitHub Actions runs recorded for the pinned PR head also concluded successfully. Exact commands and concise raw output are in `evidence/logs/`; run IDs are in `evidence/environment/github-ci.json`.

## GUI execution

Electron 43.7.7 ran under Xvfb (`1600×1000×24`) and Openbox with a fresh temporary profile, empty Provider configuration and offline demo mode. The 40-byte synthetic fixture was selected through the native OS picker. No CAS, online model, real user material, or P06 flow was used. Picker screenshots were excluded because they showed unrelated local file listings.

- **A1 — mouse40: `INPUT_GAP_NOT_MET` on all three attempts.** Requested gap was 40 ms; browser-observed trusted pointerdown gaps were 543.3 ms, 475.3 ms and 507.4 ms. Each attempt had one trusted click on the Create button and one trusted form submit. The second trusted pointerdown was on a `DIV`, so it was not a second Create click. Attempts 1–2 used the dev renderer; attempt 3 used a built renderer preview to check whether a renderer build changed input timing. It did not.
- **A2 — persisted state: passed for the observed submits.** Main entry instrumentation recorded one `CREATE_CASE` entry per each of the four cases. Read-only IPC before and after reload confirmed four persisted cases. Each has one 40-byte `application`, one confirmed subject, template `g03-t01`, 52 rules, eight conditions all `unknown`, `publicationAllowed=false`, zero evidence links and zero runs. Each stored copy SHA-256 matches the fixture. This verifies one creation per observed submit; it does not satisfy the missing double-click input.
- **B1 — Enter+Click: `TEST_INPUT_INVALID`.** The original driver preflight placed its button outside the viewport and refused to dispatch. A temporary driver copy changed only the ordering of title focus and button scrolling; the patch is included for review and was not applied to the tested worktree. In that attempt a trusted Enter at the title input triggered a trusted default button click (`detail=0`) and one submit. The subsequent trusted mouse sequence targeted a `DIV` after the UI transition. Main recorded one entry and one case. This demonstrates the Enter path but not the requested effective Enter+Click input sequence.
- **B2 — duplicate protection: code-level tests passed; GUI stimulus not established.** The renderer lifecycle tests include same-turn double submission, Enter+Click callbacks, post-success latch, retry after rejection, and stale result after close/reopen. The GUI input attempts above cannot independently confirm the corresponding physical-input path.
- **C — reproducible environment: passed.** Fixed SHA, clean source tree after instrumentation revert, runtime, isolation, and command/CI results are recorded under `evidence/environment/` and `evidence/logs/`.

No duplicate case, token leak, or failed create was observed. The Main patch records sequence, time, and sender only, with no material contents, and was reverted after execution. Read-only Main snapshots and event logs are retained. Screenshots contain only the synthetic QA UI.

## Scope labels

- `CODE_CI_PASS` — local prescribed code checks and pinned-head CI passed.
- `C10_R03_BLOCKED_INPUT` — GUI acceptance cannot be signed because the required mouse input was not delivered within the timing/target constraints.
- `MODEL_NOT_RUN` — no model was configured or called.
- `P06_NOT_RUN` — no P06 workflow was run.
- Stale Main reply after dialog close/reopen was not exercised in GUI; relevant renderer lifecycle automation passed.

## Evidence map

- `evidence/logs/`: command outputs, trusted input event records, Main entry sequence records, and prescribed command manifest.
- `evidence/readback/`: readonly Main IPC snapshots and source-copy SHA-256 records.
- `evidence/screenshots/`: synthetic-only before/after GUI screenshots; native picker views omitted.
- `evidence/environment/`: fixed target/runtime and CI metadata, temporary instrumentation patch, and the temporary driver ordering patch.
- `evidence/fixture/`: 40-byte synthetic fixture. `SHA256SUMS` covers the full evidence package.

Taskbook: [P1-C-C10-R03 targeted QA task](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/test/d4-p1c-c10-r03-input-token-gates/docs/design/review-agent/acceptance/d4-product-loop-r01/P1-C-C10-R03-TARGETED-QA-TASK-20261019.md).

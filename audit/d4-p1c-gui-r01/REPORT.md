# D4 P1-C independent Electron/Xvfb acceptance

**Verdict: `PARTIAL`.** The staged-material G03 path reached a real new D2 case and copied the original synthetic file into that case. The central Plan/Subject/document checks passed. C-10 exposed a user-visible false-failure report after a rapid duplicate submit, so P1-C is not fully accepted and I do not recommend moving to P2 yet.

## Fixed target and environment

I tested the exact open PR #109 head `4dce31f4792a188e969c0bdbedd844620a82aaf6` in an independent worktree. PR #109 targets the fixed P1-A/B base `feat/d4-p1-real-case-input-r01` at `26a482c0a53813455166d74bd71c728b13a237e0`. The separate audit PR targets the PR #109 branch `feat/d4-p1c-intake-routing-r01` at the tested head. All seven GitHub Actions workflows fetched for the tested SHA concluded successfully; the D4 unified run reports 3,726 passed, 6 skipped, and 0 failed. See [CI evidence](evidence/ci.json).

The app was the real Electron client on Xvfb `:112` at 1600×1000×24, using a new temporary profile and an empty model-config directory. I used the native GTK file picker and CDP mouse/keyboard events on visible controls. No write IPC or database path was used to create cases. Post-create reads were limited to `listCases`, `getCase`, `getAggregateV2`, and `listRunsV2`. No model, Pi run, P06, school credential, signature, or formal approval was used. Runtime details and reproduction commands are in [environment.txt](evidence/environment.txt) and [commands.md](evidence/commands.md).

## Main G03 material-to-case result

I opened **CDUT 专区 → 材料审核 → 新建审核项目**, selected the synthetic `公共教学教室借用申请.md` through Electron’s OS picker, and observed the filename-keyword recommendation `g03-t01`. Waiting past 20 seconds only selected the suggested template: the object list stayed empty, confirmation stayed unchecked, and Create stayed disabled. The UI steps are captured in [the preview/countdown screenshots](evidence/screenshots/11-c07-staged-countdown.png) and [the post-countdown screenshot](evidence/screenshots/12-c07-countdown-auto-selected.png).

I then entered two synthetic classroom subjects, each with primary scenario `p-public-classroom` and all eight conditions left `unknown`, checked the visible D4 confirmation, and clicked Create once. The resulting workspace showed **1 parsed application file** and **2 subjects**. Read-only Main IPC returned case `d4-09e97e60-e08b-4874-b350-ac075b9dcd17`, D2 Plan template `g03-t01`, fingerprint `90dba5aac80e77abff367784a185f2679e66d0b6ea431e3cc816dbc15e706162`, `publicationAllowed=false`, 0 EvidenceLinks, and 0 Runs. Both Subjects and all 16 unknown conditions are recorded in [the Main readback](evidence/readback/c07-main-ipc-readback.json).

The document has role `application`, origin `upload`, parse status `parsed`, and one parsed text block. More decisively, the file stored below the new case’s `source-docs/` directory has the same SHA-256 as the exact file selected in the native picker: `57bdcc65f42a3c551601e2d23ddf7e72ae474b1d621192e75496d8b2a951684e`. The [hash record](evidence/readback/c07-source-and-case-copy.sha256), [created workspace screenshot](evidence/screenshots/16-c07-created.png), and [post-reload readback](evidence/readback/c07-after-reload-readback.json) establish that the original actually entered the new case, not merely its Plan. Ctrl+R preserved the same case ID, fingerprint, two Subjects, and one document.

## C-01 through C-10

| Case | Result | Evidence and observation |
|---|---|---|
| C-01 | PASS | No-stage D4 case created through the UI; one object and explicit confirmation. [Created screenshot](evidence/screenshots/09-c01-created.png) |
| C-02 | PASS | Native picker preview showed the synthetic filename, `g03-t01`, and explanatory filename keywords without path or file body. The raw preview token was not read from the immutable contextBridge; its consumption is proven by C-07. [Preview log](evidence/logs/c07-staged-ui.json) |
| C-03 | PASS | After the full countdown, only the template was selected; object count remained zero and confirmation/Create stayed disabled. [UI readout](evidence/logs/c07-after-countdown-ui.json) |
| C-04 | PASS | Manual template changes persisted beyond the 20-second window. A G08 recommendation was changed to G03; a G03 recommendation was changed by keyboard to G08-T03. Both test dialogs were canceled without creating a case. [G08→G03](evidence/screenshots/22-c04-manual-override-after-wait.png), [G03→G08](evidence/screenshots/46-c04-g08-keyboard-after-wait.png) |
| C-05 | PASS | Native multi-select of the lost-property and classroom materials was rejected as multiple matters; template stayed blank, Create stayed disabled, and cancel added no case. [Rejection screenshot](evidence/screenshots/25-c05-mixed-rejected.png) |
| C-06 | PASS | The synthetic `申请.pdf` required manual template selection and received no automatic suggestion. [Screenshot](evidence/screenshots/28-c06-pdf-manual-required.png) |
| C-07 | PASS | Two-subject G03 D2 Plan plus the original parsed application file; see main result above and [readback](evidence/readback/c07-main-ipc-readback.json). |
| C-08 | PASS, scoped | The same-window rapid duplicate submit retried the one-use token; Main rejected the second request with `D4_INTAKE_TOKEN_INVALID`. Forged, expired, and cross-sender probes were not run. [Main/Renderer log](evidence/logs/electron-retry.log) |
| C-09 | PASS | Empty file, file >50 MiB, and nine-file selection were rejected with `D4_INTAKE_FILE_INVALID` / `D4_INTAKE_TOO_MANY`; case inventory remained unchanged. [Empty](evidence/screenshots/30-c09-empty-rejected.png), [oversize](evidence/screenshots/32-c09-over50-rejected.png), [too many](evidence/screenshots/34-c09-toomany-rejected.png) |
| C-10 | FAIL | Reload preserved the accepted case, but rapid double-click displayed a false “新建案卷失败” toast after the first create and import had succeeded. It created exactly one case and one document, but the UI outcome is misleading. [Failure screenshot](evidence/screenshots/38-c10-after-cdp-double-click.png), [readback](evidence/readback/c10-main-ipc-readback.json) |

## Confirmed defect

`D4-C10-01`: when the Create button is double-clicked quickly, the first request creates the case and imports the staged document. The second request is correctly rejected because the one-use token has already been consumed. The renderer then displays that second rejection as **“新建案卷失败”** even though the first operation succeeded. The short reproduction is: stage the synthetic G03 file, select `g03-t01`, enter one valid object, confirm, and double-click Create. The resulting case contains one application file, while the red error toast claims the case failed. The raw Main/Renderer log is retained in [electron-retry.log](evidence/logs/electron-retry.log). I made no production-code changes.

An earlier attempt to type a CJK filename into GTK’s location entry was mis-encoded and produced `ENOENT`; no file was staged and no case was created. The original error is retained in [the UI log](evidence/logs/c07-picker-path-operator-error-ui.json). The first Electron launch also failed because Xvfb was not attached at startup; the persistent `:112` run succeeded. Neither was a product defect.

## Not executed and next decision

P06, online model calls, Pi, formal approval, and signatures were not executed. Forged/expired and cross-sender token probes were not run; same-window replay was verified through the visible double-click. The raw stage-preview token was not extracted because the exposed bridge is immutable and the acceptance boundary did not permit direct stage/write IPC. No direct D2 store or database mutation was used.

The G03 GUI-to-D2-and-original-import path is real and passed. Keep P1-C in Draft until `D4-C10-01` is corrected so a completed create is not shown as failed; then rerun C-10 on the same fixed head or the fix head before considering P2. This report does not authorize P06 or school-facing approval.

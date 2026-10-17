# C′ independent synthetic runtime: immutable attempt ledger (not B 28)

The frozen R1 and A′ inputs remain unchanged. This document tracks **C′ own** trial commits and red/green evidence. None of the runs execute B r02 original cases or read sealed Gold.

| Attempt | C′ commit | GitHub Actions | New C′ tests | Inherited R1/D2 tests | Typecheck | Interpretation |
|---|---|---|---|---|---|---|
| First | `0366b9e07746f51853c811d1fdeb75a46fb88e14` | [39012098041](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39012098041) | 4 PASS, 1 FAIL | 19 PASS | PASS | Probe fixture used missing `test-only` source; correctly rejected early with `D2_AUTHORING_INVALID` |
| Second | `51f836be4a71244c19a2b33b58796e08c34ecf9a` | [39012247160](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39012247160) | 4 PASS, 1 FAIL | 19 PASS | PASS | Probe used G01 case template ID with `text-review` legacy selection; correctly rejected as `D2_TEMPLATE_MISMATCH` |
| Third | `7721eaa1fc48fea6be2d1bda870614eb21eb1cd6` | [39012346623](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39012346623) | **5 PASS, 0 FAIL (29 assertions)** | **19 PASS, 0 FAIL** | **PASS** | Tested correctly formed independent positive and negative cases; pipeline `success` |

Third green artifact: [`g01-cprime-independent-technical` / ID `12092969711`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39012346623/artifacts/12092969711). Original Actions job stdout establishes direct `bun test` execution, real `createD2TechnicalCase`, document registration, two subject+fact evidence links, and a controlled Pi technical receipt. All submitted Checks remain `awaiting-confirmation`; no official approval.

The third run also documents the continuing fail-closed `D2_UNMAPPED_ADVANCED` behavior and compatibility with a legacy text plan. The two earlier red runs are preserved and **not** reclassified as PASS.

## Frozen original B r02 case denominator (separate from synthetic CI)

- INPUT ZIP SHA256: `33ad9e1fe5104cae91463218293ae58ccd27c934ff091b0687b20c64d699b26c`; 120 members, 28 cases, 59 materials, 28 controlled fixtures, CRC/hash structural preflight PASS.
- Actual B run: **0 / 28**; `NOT_RUN=28`; `GoldComparable=0`; no Gold read.
- Misroutes / false rejections / omission counts: **NOT_MEASURED** (never interpret as observed zero).
- No authorized current campus policy, authenticated university registry, or strong Gold ACL record.
- `TECHNICAL_RUNTIME_ACCEPTED_WITH_SCOPE = NO` for the 28 original B cases.

Next authorized engineering gate: run the private ZIP on an isolated Bun-equipped host without uploading it to this **public** PR. Freeze exact 28 per-case true Case/Run/Check/SourceRefs and artifacts before allowing an independently authorized r02 Gold evaluator to open the Gold ZIP.

**C′ state: `INPUT_PREFLIGHT_PASS / SYNTHETIC_TECHNICAL_CI_PASS / C0_TO_C1_STAGED`.**

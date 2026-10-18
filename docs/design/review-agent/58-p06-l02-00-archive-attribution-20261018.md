# 58｜P06 L02-00 历史 C 案异常归因与可执行证据复核（2026-10-18）

> **本轮结论：历史重复 `execution-failed` 已完成源码级归因及可执行证据核对；正式新版 L02-00 LIVE 验收仍受 U1 安全门禁阻断。** 本文不签署整个 P06，不改写 29 号 LIVE 台账、历史 37/38/44/46 失败、Gold 或生产代码。`P06=PARTIAL`、`P06-S02=NOT ACCEPTED`、`MERGE=NO-GO`，P07/P08 不进入。

## 1. 固定源与新增实测

- 独立工作分支和 Draft [PR #99](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/99)，固定父版本 PR #98 `2d9e93f3a637e8325862769f80fe4b4e884c51a1`。未重基、未合并 PR #21/#72/#98 或修改 main。
- 新增 `scripts/qa/p06-l02-00-archive-attribution.py` 和 `.github/workflows/p06-l02-00-archive-attribution.yml`，只读比较两个真实历史提交中的生产源码、三份历史批次记录、原始 command exit、命令 stdout/stderr SHA-256、公开归档 manifest SHA-256。
- [GitHub Actions #39070327923](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39070327923) 真实运行 **SUCCESS**，核验 **9 条案卷记录和 3 份归档文件哈希**。原始机器证据 [artifact #12114582589](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39070327923/artifacts/12114582589)，包括 `l02-00-ledger.json`、`verdict.log`、`sha256sums.txt`；结论 `HISTORICAL_ATTRIBUTION_DONE_LIVE_BLOCKED`。
- 此次 CI 是**已有真实 Pi/provider 历史证据的只读重验证**，没有重新启动 Electron/provider，更不等于新版的 U1 LIVE PASS。

## 2. 三轮不同的历史真实批次：明确区分实例

原始根目录：`docs/design/review-agent/acceptance/p06-recheck-live-20261014/`。

| 原冻结版 / 文件 | 命令 exit 和归档判词 | A | B | C |
| --- | --- | --- | --- | --- |
| `d24d1c2` / `records/live-final/batch-corrected/batch-real-result.json` | 1 / FAIL | compliant + execution-failed | non-compliant + execution-failed | awaiting-supplement + execution-failed |
| `d24d1c2` / `records/live-final/batch-witness/batch-real-result.json` | 1 / FAIL | compliant + execution-failed | non-compliant + execution-failed | awaiting-supplement + execution-failed |
| `b95b44f` / `records/live-b95-final/batch-real-result.json` | 0 / PASS | compliant | non-compliant | awaiting-supplement |

每条记录有 3 个互异 caseId/runId，三批彼此也不同。三份机器记录实际按字节重算、与已有 `evidence-manifest.json` 一致的 SHA-256：

- corrected：`4a32389840d71edcb3aca64408f4628da12deeaeccb5379060f38b7b1f3fac2a`
- witness：`cbb3fdc36486c593152a3e4d19ae892b6f9e040ba8b694f63d611e1c11d096a3`
- selected：`381bc830150d3399ce241176489c615cfb22c304bd04a56f23b308fbba0cb1d1`

C 的具体标识：

- corrected：`case-1791994275887-55nu8v` / `run-1791994295299-e9ra`，同一 `section-all-budget` 规则同时有带 SourceRef 的 awaiting-supplement 和无 SourceRef 的 execution-failed。
- witness：`case-1791994800754-pfyatf` / `run-1791994820850-usd5`，同一故障再次出现。
- selected：`case-1791995243461-pt58o1` / `run-1791995251761-dgq4`，只有 awaiting-supplement，`sourceRefCount=1`，`decisionCount=0`，未完成正式行政决定。

合成 A/B/C 由 `scripts/qa/review-live-batch.mjs` 分别生成 100 元、120 元、金额缺失的预算文本。它们是队列/审核工具测试用的三个不同实例，**不能冒充旧产品 B、C 阶段所有自动化工作流**。

## 3. 真实根因（源码双 SHA 已比对）

在 `apps/electron/src/main/lib/review/v2-executor-factory.ts`：

- `d24d1c2` 旧分支按 `existingTargets.size > 0` 决定是否生成语义失败 fallback。全案/组级规则即使已提交有效工具结果，也可能没有 `subjectIds`，导致该集合为空，于是错误追加同规则 `execution-failed`。
- `b95b44f` 修复分支改按 `pluginRuleIds.has(rule.id)`。无 subjectIds 的合法 case/group 结果不会再追加失败，完全未提交的语义规则仍 fail-closed。

本轮 Actions 用 `git show SHA:path` 读取上述两个**真实历史 Git 提交**验证分支差异，并检查当前候选代码没有回退。46 号原始测试记载 `1 pass / 2 fail` → `3 pass`，现有 `review-batch-case-fallback.p06.test.ts` 包括已提交 case/group 与未提交 case 的正负例。

可签判词：`HISTORIC_DUPLICATE_FALLBACK=CONFIRMED`、`B95_SELECTED_CASES=NO_DUPLICATE`。但 `C_FULL_BUSINESS_CAUSE=UNDETERMINED`，因为原始 C 的“需补件”不是成功办结，更无法证明补件回流/自动审批/逐案幂等。

## 4. 缺失项与不能越过的证据边界

归档的可公开 JSON 只保存了 caseId、runId、简化检查及 SourceRef 数量；真实 SDK provider witness 是**整批聚合**，无法逐条映射到特定案卷/turn/assignment。私有 profile、完整 provider transcript 原本就不能上传公共仓。

在该档案内不能可信取得：每案 `inputManifest.hash`、`documentVersionId/parseRevision` 和材料文件哈希，逐案原始 Pi 工具调用、真实引用位置及覆盖账本，人工补件/再次审读/受限代批全流程。机器账本将这些标成 `null` / `NOT_RUN`，绝不补造。

PR #98 的同 HEAD [U0/U1 controlled CI #39068176008](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39068176008) 的两个 job 均 success，但 U1 的 Office #71 同名索引碰撞仍被工作流明确列为发布阻断；真实 Main/IPC/Office/严格 Pi/Preview/Owner、新版真实 Electron/provider 安全矩阵未签。U0 fixed-candidate PASS 不等于 U1 E2E PASS。

## 5. 退出条件及 P06 下一批

**本轮已完成**：对 A/B/C 历史故障的源代码原因、两个独立旧 FAIL、一个选定修复版 PASS、文件身份、公开哈希与真实 command exit 建立了机器可重验对应关系。属于 `L02-00 HISTORICAL ATTRIBUTION PASS`。

**仍不可完成正式签收**：`L02-00 LIVE=BLOCKED/NOT_RUN`；需要先补足 U1 实际 Main/IPC/Office/权限/preview 合同，在隔离授权环境按固定新版 SHA 复演真实 Pi 三案，单独记录 C 的 input manifest、run/assignment/工具调用/材料版本、业务结果与真实状态。如果 C 再失败，按 `EXECUTION_FAILURE`、`BUSINESS_INCOMPLETE`、`CORRECT_DENIAL`、`HARNESS_INVALID`、`UNDETERMINED` 分层；没有重现则如实记 `NOT_REPRODUCED`，不能据此宣布整个 C 自动化流程通过。

后续 L02-01 处理 A/B/C 人工确认、补件回流、正向授权自动处理及幂等；L02-02 验证严格原件视觉、长轮次压缩；L02-03 做普通 Agent、双窗、Windows/macOS；L02-04 汇总 Relay/Pocket 和 29 号全部 LIVE 放行。P05 Relay 仍 BLOCKED、Pocket TARGET NOT-RUN；Office #71 按用户约定集中验收之后另开上游 Office 与审核专属修复 PR；P04 永久 tombstone/UUID owner journal 不允许未经证明 GC。

**最终：L02-00 历史证据归因已完成并获得真实 CI；L02-00 新版 LIVE/P06 阶段尚未验收，PR #99 继续 Draft/MERGE NO-GO。**

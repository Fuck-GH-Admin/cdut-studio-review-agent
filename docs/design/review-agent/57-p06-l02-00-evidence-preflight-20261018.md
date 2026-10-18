# 57｜P06 L02-00 历史事实归因与输入冻结预检（2026-10-18）

> **只读历史归因初查，不是 L02-00 正式验收。** 状态 `L02-00 = PRECHECK / NOT ACCEPTED`，`U0 = PASS (固定候选)`，`U1 = CONTROLLED PASS / LIVE BLOCKED`，`P06 = PARTIAL`，`P06-S02 = NOT ACCEPTED`，`P07/P08 = NOT STARTED`，`MERGE = NO-GO`。不得改变 29 号 LIVE-01～08 既有判词。本文件仅归档历史只读证据，不修改任何生产代码、Gold、旧失败或输入。

## 1. 开工基线与真实性边界

- L02-00 预检基于 [PR #98](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/98) 固定源码 `2d9e93f3a637e8325862769f80fe4b4e884c51a1`，tree `2d61f13e1d19bdcde3c11a788a7ee97c83f5d4ca`；本文件的后续 Git commit 不等同其已测 HEAD。
- 同 HEAD [Actions #39068176008](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39068176008)：U0 isolated-candidate **SUCCESS**；U1 controlled SourceRef/Office-repro **SUCCESS**。同 HEAD 的 PR CI / Review Baseline / Scoped Pi 均 SUCCESS。**U1 controlled workflow 的成功不是 U1 LIVE PASS**：Job 显示 `Office #71 observed collision is a U1 release BLOCKER`，且真实 Electron/Main/IPC/Office/Provider/Preview/owner 端到端未签收。
- 原 main `8989941b6fb5651564e32d11c4215b6a6d5a5209` 与固定旧实机 `b95b44f7a06bb1e1ae21a985b5bb4cd9f5581027` 不能互借测试结果。最新上游未纳入该候选的变更也不自动视为已验。
- 权威需求：27 架构、29 LIVE 台账、46 原始实机证据、47 L02 执行合同、49 U0/U1 前置、54/55/56 新版交接。本预检允许历史事实归因和合成输入定位，**不开展未经 U1 安全签收的正式完整业务验收**。

## 2. 逐批次历史记录的独立对账

历史记录来自仓库中不可变的 46 号证据目录（以下每项均为已有工件，不重新运行 provider）：

| 记录 | 源 SHA | A / B / C 观测结果 | 判定范围 |
|---|---|---|---|
| `records/live-final/batch-corrected/batch-real-result.json` (blob `4f6be0bc317b31c522ff0310532dc1441589edb6`) | `d24d1c2d69ae25ff47a080155041cc62620a6bf9` | 三案各有合法语义结果，但同 `section-all-budget` 均额外附着无 SourceRef 的 `execution-failed` | **历史首败**，不能当做合法语义未提交的证据 |
| `records/live-final/batch-witness/batch-real-result.json` (blob `a39cba50cc0d889ba8f46dc058cc1f0643fcad6`) | `d24d1c2d69ae25ff47a080155041cc62620a6bf9` | 再次记录 A=`compliant + execution-failed`、B=`non-compliant + execution-failed`、C=`awaiting-supplement + execution-failed` | 历史错误重复；`overall=FAIL` 原样保留 |
| `records/live-b95-final/batch-real-result.json` (blob `88f5f9c93374522ce5546cb9c1ada8b7b5b52d5d`) | `b95b44f7a06bb1e1ae21a985b5bb4cd9f5581027` | A=`compliant`；B=`non-compliant`；C=`awaiting-supplement`，每案 1 条有 SourceRef 语义 Check；三案 V2 `completed`，队列 `done`，正式决定均为 0 | **仅选定合成批次子集 PASS**；不是完整 A/B/C 工作流 PASS |

以上三份机器记录的特定文件路径均以 `docs/design/review-agent/acceptance/p06-recheck-live-20261014/` 为根。参见 [46](46-p06-recheck-live-local-acceptance-20261014.md) §2、§3，及最终 [E06 selected summary](acceptance/p06-recheck-live-20261014/records/live-b95-final/selected-result-summary.json)。

## 3. 初步错误归因（须在新版复核）

- **历史重复失败：有证据支持原 `v2-executor-factory` 的 case/group fallback 判定错误。** 46 号 §3 已记录按 `pluginRuleIds` 而不是非空 `subjectIds` 判断全案/组语义提交的定向修复，受控回归由 1 PASS/2 FAIL → 3 PASS。旧 `d24` 的三案额外 `execution-failed` 与此机制一致；`b95` 的选定三案最终记录未再出现同规则重复结果。
- **C 案不能因此宣称业务已完成。** 46 正文仍称 C 未完成完整语义工具，`execution-failed` 历史异常必须保留。最终 `b95` 机器记录中的 C `awaiting-supplement` 只能说明**另一项明确标识的选定合成运行**已返回需补件检查；它不是 C 的人工补件→回流→重审、受限代批或完整原 A/B/C 质量验收。
- 因此分离三种结论：`HISTORIC_DUPLICATE_FALLBACK_CONFIRMED`；`NOT_REPRODUCED_IN_SELECTED_B95_BATCH`；`C_FULL_E06_STATUS=UNDETERMINED / PARTIAL`。若未来追溯到的是不同运行、不同输入或不同材料版本，必须按 case/run/assignment/hash 重新归属，不能把两个记录混在一起。

## 4. L02-00 下一步真实执行门禁

1. 固定新版候选 SHA、旧 `b95` 的相关 case/run/assignment、模板/材料版本、`inputManifest.hash`、工具调用、provider 类型/用量、SourceRef、V2 结果、批次 ledger 与人工行为，建立可审计的逐案关联表；缺少原始私有资料时明确 `UNDETERMINED`，不可虚构输入。
2. 将 C 的 `execution-failed` 分为：`EXECUTION_FAILURE`、`BUSINESS_INCOMPLETE`、`CORRECT_DENIAL`、`HARNESS_INVALID`、`UNDETERMINED`。`queue done`、`run completed`、`awaiting-supplement` 都不是行政审核批准。
3. 在 U1 LIVE 安全准入后，以隔离 `PROFER_CONFIG_DIR/PROFER_USER_DATA_DIR`、授权 provider 和合成数据，实际复演原 C 问题；未复现登记 `NOT_REPRODUCED`，保留原首败与模型回执。严格审核五工具、版本与覆盖账本权限不可降低。
4. 只有形成同 SHA 的事实表、复现命令、真实 Main/Pi 工具/权限回执、错误归因及有效日志 SHA256，才可对 L02-00 进行正式签收；**本文件不等于这个验收结果**。
5. 后续 L02-01 现有 A/B/C 人工确认/补件/幂等；L02-02 严格扫描原件与压缩；L02-03 普通 Agent/双窗/平台；L02-04 Relay/Pocket 与 29 总验收。除只读准备和外部协调外，各项正式签署仍以 U1 LIVE 门禁为前置。

## 5. 不得跨越的外部阻断

- Office [#71](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/issues/71) 的同名 stem/index 身份冲突：先真实端到端影响验收，后续轮次分独立上游 Office PR 与审核侧必要修复；不在本归因阶段改通用 Office 源码。
- P05 生产 Relay `BLOCKED`，Pocket 补丁 `PATCH READY / TARGET NOT-RUN`。
- P04 tombstone/owner UUID journal 不允许未经证明的 TTL/GC。
- 历史 37/38/44/46 和 PR #98 U1 首败及受控修复不可覆盖，Gold 不打开、不改写。PR #21/#72/#98 继续 Draft，无用户许可不合并；P06 `PARTIAL`，P07/P08 不进入。

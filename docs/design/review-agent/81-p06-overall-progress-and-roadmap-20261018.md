# 81｜CDUT Studio 审核后台 P06｜总体进度、余留风险与后续路线（2026-10-18）

> **范围**：只记录 P06 后台审核工程的当前可复核进度、并行产品开发关系、后续工作和放行标准；不修改权威 [29 号 LIVE-01～08 台账](29-background-session-preflight-audit.md)，不覆盖冻结历史证据，不提前批准合并。与 [82 号会话交接](82-p06-l02-01-next-session-handoff-20261018.md)、[83 号工程任务书](83-p06-l02-01-next-agent-execution-20261018.md) 配合阅读。
>
> **必须区分**：**一次统一验收活动完成** ≠ **验收所有发布条件均通过**；**可推进离线产品工程** ≠ **正式 L02-01 LIVE 已准入**。

## 1. 一眼看懂的工程进度

| 阶段 | 工程与证据现状 | 当前允许做什么 | 不能宣称什么 |
| --- | --- | --- | --- |
| P01–P03 后台执行/接线 | Main-owned Pi、V2 Run/assignment、Bridge、ACK、Renderer 投影与前置回归已有具体实现和受控/部分真实 Electron 证据 | 在现有接口上做定向演进，维持同一引擎 | 全部 P01–P03 LIVE 已签完 |
| P04 Owner/权限/投影隔离 | 永久 tombstone、UUID journal、普通会话与内部审核 Owner 隔离已有受控/限定真机证据；P02 删除竞态 PR #108 通过专项真实 Electron 复验 | 保持 fail-closed 和普通 Agent 正例，按影响范围差分复核 | 生产所有跨端/双窗入口已穷尽，允许 TTL/GC |
| P05 外部联动 | 六专项 43/43 受控 PASS、局部本机联调；真实中心多 viewer/ticket 阻断，Pocket FIFO 补丁待目标仓运行 | 不依赖外部中心的桌面开发继续 | 生产 Relay/Pocket 的真实安全 E2E 已 PASS |
| P06 U0/U1 | #98 U0 工程基线、#105～#116 多轮修复/专项，#118 79 号**统一本机验收活动结束，判定 SCOPED_PARTIAL**；PR 均维持 Draft | 接受已证明的限界结果，开发新的离线业务能力 | U1_FULL PASS / P06-S02 ACCEPTED / L02-00 LIVE EXIT |
| L02-00 事实归因 | #99 历史 A/B/C 九案独立源归因，C 旧 execution-failed 解释具有代码与源记录支持；缺当次完整 provider/材料/run 证据 | 历史证据只读复核；用新合成案单独验证新代码 | 旧 C 真业务闭环已复跑，新合成案能替换原史 |
| **L02-01 离线工程** | **#121 正在实施；E01 补件幂等已修，固定生产/测试代码 `3b3e52c01e38667d1bbc98f90b6ffa0abda5d722` 四套 CI 成功** | **下一会话继续 E02、E03、E04，先代码/回归后集中验收** | L02-01 真 Provider A/B/C LIVE 已签、业务校方真实审批 |
| L02-02 严格原件/长上下文 | 历史限定工具与图片入口有局部验证 | 离线准备必要回归，正式模型验证后续集中 | 扫描 PDF 原件工具及真正 CompactContext 模型续审均完成 |
| L02-03 普通 Agent/多窗口/跨平台 | 普通 Pi/Preview 有历史/本地限定正例 | 可离线补合同、按平台/模型条件排期 | 完整 Claude/fork/Pocket/Windows/macOS 等价 PASS |
| L02-04 最终对账 | 以 [29 号](29-background-session-preflight-audit.md) LIVE-01～08 与 P05 外部作为唯一放行基准 | 独立外部阻断可以并行协作，最后统一签收 | 当前达到 merge/release |
| P07/P08 | **NOT STARTED** | 只有完成必要 P06 门禁并获授权后启动 | P06 期间的普通 Agent 冒烟等于 P08 完成 |

### 整体判词（截止本文件首版）

`U1_ACCEPTANCE_CAMPAIGN=CLOSED_SCOPED_PARTIAL`，`L02-01_OFFLINE_DEV=IN_PROGRESS`，`L02-01_E01=REMOTE_CONTROLLED_PASS`。

**`P06 PARTIAL / P06-S02 NOT ACCEPTED / U1_FULL NOT ACCEPTED / L02-00 EXIT NOT ACCEPTED / L02-01 LIVE NOT ADMITTED / L02-04 NOT RUN / P07/P08 NOT STARTED / MERGE NO-GO`**。不能借该文档修改 29 号状态。

## 2. 可复查的版本链

| PR | 源/证据类型 | 可确认结论 |
| --- | --- | --- |
| [#99](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/99) | L02-00 历史归因 | 归因与只读档案，不是真实新 Provider 运行 |
| [#105](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/105) | U1 最初实际 Electron 测试 | 删除后迟到会话查询可错误复活 Preview，首次 RED 保留 |
| [#108](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/108) | P02 修复专项实机 | 受控修复加本机范围 PASS；不抹 #105 RED |
| [#110](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/110)、[#113](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/113) | Office #71 同名索引修复/真机 | DOCX/XLSX/PPTX 实机专项范围通过；上游移植因 403 独立 BLOCKED |
| [#114](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/114) | Pi 五工具 Main 受控 | 五工具、绑定/撤权及普通 Agent 正反例受控 PASS，不等于在线 Provider |
| [#115](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/115) | Pi SDK 真本地 | actual Pi SDK 的 active/model-facing 五工具、Main IPC 范围 PASS；Provider BLOCKED_ENV |
| [#116](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/116) | kernel ENOSPC | Linux /dev/full **真实内核返回** ENOSPC 的受控代码 PASS；非真正独立满卷、非跨 PID 故障 E2E |
| **[#118](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/118)** | **U1 集中本地验收历史** | **HEAD `3baf1fc2ccf27607f948923dbf5aff26d984729e`；[79 号](79-p06-l02-u1-unified-local-result-20261018.md) 与一套证据归档；活动 CLOSED_SCOPED_PARTIAL** |
| **[#121](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/121)** | **L02-01 下一阶段工程 Draft** | **父 #118 固定 HEAD；E01 第一处跨事务+批次幂等缺陷已复现/修复/复验，后续在此分支继续离线开发** |

### #121 E01 已核实的最新代码和 CI（不要与新文档提交的 SHA 混用）

- **源码/测试固定提交**：`3b3e52c01e38667d1bbc98f90b6ffa0abda5d722`，tree `261029968f6672b9228e1bd2d06471addd12b15b`（这里是**本次 CI 验证的代码树**；增补交接文档后新 HEAD/tree 需要重新核实）。
- [PR CI #39133427667](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39133427667) **SUCCESS**，**4016 PASS / 5 SKIP / 0 FAIL**，4021 tests / 463 files，类型/架构/主进程/Preload/Renderer 构建完成。
- [Review batch focused #39133427609](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39133427609) **SUCCESS**：**143 PASS / 0 FAIL**，13 文件。
- [Review Baseline #39133427653](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39133427653) **SUCCESS**；[D2 Scoped Pi #39133427593](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39133427593) **SUCCESS**。
- 两条新 `stage-workflow-l02-01-idempotent-batch.p06.test.ts` 回归真实执行 PASS：一条控制补件重放不得把已推进 batch 从 `done` 错误改回 `queued`，另一条检查决定 `requestId` 重放、不同 payload 的冲突和 stale revision。
- **首败必须保留**：初版 `f36bff88` [PR CI #39132697022](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39132697022) 新测试发现重复入队 RED（附带独立 Goal 时序 FAIL，后续固定 CI 已通过）；第二版 `c576fe7a` [Batch CI #39133158848](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39133158848) 两个现有首次入队正例 RED。真正原因：`submitCommand` **只把 `mutate(draft)` 返回值放在成功回执的 `entity`**，原 `resolveSupplementV2` 把 `entity` 错放 handler 外层；修正版在 mutate 中返回实体，旧重放没有实体，外部 requeue 仅新执行触发。不能将首次首败称为已不存在的历史。

## 3. 用户明确确认的工程/验收节奏

**不再“每修一个问题就本地 Agent 跑一次 Electron”**。统一方案：
1. 下一个会话持续开发能离线完成的 L02-01 E02～E04，代码/fixture/受控回归在云端完成。
2. 在工程阶段末锁定 **一个** 候选 HEAD/tree、一次完整 CI；聚合问题清单，必要时差分修复，只在代码触及危险 Main/owner/permission 时扩大 CI。
3. 仅需要真机/真 Provider/独立测试卷/真实窗口的平台子项放到 **同一次可执行的集中本机验收**，减少环境启动、安装与取证开销；S0 正反安全门禁仍需逐项独立 PASS。
4. 缺授权 Provider / 安全独立测试卷 / Relay / Pocket 源码权限时，明确 BLOCKED_ENV/BLOCKED_UPSTREAM，仅暂停依赖它的 lane，不妨碍其他离线业务工程。
5. 每项结果必须属于**精确 HEAD 和证据等级**；`CONTROLLED` 不代替 `ELECTRON_LIVE`，`PI_SDK_REGISTERED` 不代替 `PROVIDER_TOOL_RECEIPT`，`/dev/full` 不代替真满卷/跨 PID。

## 4. 从当前直到最终发布的现实路线

**最近：L02-01**
- E01 补件幂等：**已固定受控 PASS**；后续任何工作流/批次变更必须维护这两组正反例。
- E02 人工决定/授权：对现有 `stage-workflow.ts`、`workspace-business-service-v2.ts`、`decision-readiness-v2.ts` 与持久 receipt 做缺口盘点；通过、否决、任务换阶段、复核身份、人工状态、错误尝试不写决定、批次是否可定稿；不允许 AI 建议替代校方决定。
- E03 补件回流与输入失效：多个补件、insufficient→回应→satisfied、重新入队/恢复的幂等；改变材料版本/运行输入时旧结论不能继续正式批准；先做受控，Provider 后补。
- E04 显式自动化与出站幂等：`batch-automation-service`、`batch-group-action-service`、`batch-store`（含 finalization/reopen/outbox），全局授权×逐批确认×模板允许×当前来源，撤权、重放、版本/预览变化正确拒绝。不可偷偷启用 auto-approve。
- E05 **仅最终集中验收**：完成 E02～E04 离线开发后再制定一份差分矩阵，条件足够再同时验证业务 UI、真 Provider A/B/C、原件与压缩、I/O 真满卷/跨 PID；阻断项如实保留。

**中期：L02-02 / L02-03 / L02-04**
- L02-02：真实扫描 PDF/PNG 严格审核工具、来源和多页视觉、真实压缩上下文连续性、跨版本/跨案拒绝。
- L02-03：真实普通 Pi/Claude、不同窗口/操作系统、删案/模型停用、异步回执/重启正反例。
- L02-04：重新对照 29 号每条 LIVE，协调外部 Relay/Pocket 和 Office #71 上游移植，所有必须门禁关闭后才讨论合并与 P07/P08。

## 5. 安全与产品边界

- **复用** AgentOrchestrator / SessionManager / runAgent / Main-owned Pi /唯一 V2/既有 CaseAggregate & `submitCommand`/Review Bridge；不得新增第二引擎、第二业务事实账本或抢占全局调度器。
- `owner.kind='review-case'` 是内部身份不是授权；`caseId/sessionId/turnId/runId/assignmentId` 必须在每次关键工具操作时验证可信当前绑定。
- 审核 Pi 只能看到四项专属工具加 `CompactContext`；普通 Agent 允许的工具必须保持正常。严格 SourceRef 需要材料版本/解析版本/blockId/quote，普通 Office fileId 和 preview 截图不能替代。
- 提议、技术审核完成、批次 `done` 均**不是**合法的正式人工/校方业务决定；未经明确授权不准自动通过。
- 不改 29 LIVE/隐藏 Gold/冻结 PR #118/旧 RED、真实校方数据、上游主分支；不放宽 P04 永久 tombstone/UUID journal 的保护和失败安全策略。
- 与 D4 PR #117/#119/#120/#122/#123 并行发展，不做无设计的 cherry-pick 或跨分支合并；需另行核对真实父子源码及 ABI/API 变更。

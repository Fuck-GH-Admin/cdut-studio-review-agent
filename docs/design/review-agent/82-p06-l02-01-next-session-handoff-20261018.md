# 82｜P06 L02-01 跨会话正式交接｜2026-10-18

> **本文件供新会话独立接手。必须首先阅读 83 号执行任务，再按本文件恢复具体源码和证据。**
> 本会话已实现并提交实际补件幂等修复及回归，非只有计划。用户已经正式确认：**U1 #118 本次集中验收活动到此结束；下一阶段以代码开发为主，将仅实机可查的问题集中到后续一次验收。**
> [81 号总体进度](81-p06-overall-progress-and-roadmap-20261018.md) 负责项目级全貌；[80 号](80-p06-l02-01-offline-engineering-entry-20261018.md) 负责上一轮 L02-01 首败/修复来历；[83 号](83-p06-l02-01-next-agent-execution-20261018.md) 负责**实际执行步骤与交付**。

## 0. 你是谁、现在应做什么

你是 **CDUT Studio 审核模块 P06 的 L02-01 离线业务闭环工程 Agent**，不是再跑 U1 集中实机的验收员。仓库：
- 本地测试/研发 GitHub：`https://github.com/Fuck-GH-Admin/cdut-studio-review-agent`
- 上游：`https://github.com/Nya-Angle/CDUT-Studio`，**本轮不写入、不合并**。
- 本轮唯一目标 Draft PR **[#121](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/121)**，分支 **`feat/p06-l02-01-offline-business-closure-r01`**；父 PR **[#118](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/118)**，父 HEAD **`3baf1fc2ccf27607f948923dbf5aff26d984729e`**。

**先从远端重新查询 #121 最新 HEAD/tree、PR #118/#121 state、四条实际 CI、Git 工作树和并发 D4 PR；当前文字只给历史固定参考。** 在新任务开始之前冻结真实当前代码版本，不能依靠记忆的 SHA 或拿上一个 CI 的数字冒充新版本。

## 1. 本会话已经完成的实际工作

### 阶段切换 / 历史只读

- 本机 U1 统一集中验收：[79 号](79-p06-l02-u1-unified-local-result-20261018.md) 与 `acceptance/p06-u1-unified-local-r01/`，实际验收工作闭环，且在 #118 PR 评论中完成本轮归档。
- 不是 `U1_FULL PASS`；真实 provider/tool receipts、A/B/C 业务、真独立满卷+跨 PID、Office #71 上游移植仍阻断。
- 本会话从 #118 固定 HEAD 创建**新开发分支**和 Draft #121，未更新 29 号唯一 LIVE 台账，未改 #118、Gold、Office/Pi 五工具/owner/上游、真实校方材料。

### E01：发现—两次 RED—最小修复—真正 CI PASS

**文件**：
- `apps/electron/src/main/lib/review/stage-workflow.ts`（仅改 `resolveSupplementV2` 的事务回执和外部 requeue 守卫）；
- `apps/electron/src/main/lib/review/stage-workflow-l02-01-idempotent-batch.p06.test.ts`（新受控真实 V2+batch 正反例）；
- `docs/design/review-agent/80-p06-l02-01-offline-engineering-entry-20261018.md`（修复与首败历史）。

**事件次序（禁止覆盖）**：
1. `f36bff88b31efd90a48105740b9890552ee549b0` 新增回归， [PR CI #39132697022](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39132697022) ：重复 `ResolveSupplement` 请求把后续已经推进的批次 `done` 错置回 `queued`（目标用例 RED）；同次 `goal-session-service.test.ts` 曾出现预期 failed、实际 active 的 Goal 异步失败，**不属于本次补件修复范围，也不得无证据叫作已确认 flake**。
2. `c576fe7a0d7a38a48e06ffa0aa6c8e5fadfa3deb` 通过 `result.entity` 判断是否首次操作，但 [batch-focused CI #39133158848](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39133158848) 显示两个旧正例 RED：正常首次补件满足竟不能入队（Expected queued / Received done）。根因不是 guard 应删除，而是 **原代码在 handler 顶层填写 entity，而 `submitCommand` 实际把 `mutate(draft)` 的返回值写到 `result.entity`**。
3. `72dad6b00f6d413003f1d2c8e7ed5f546e4a9817` 修复生产返回合同：本轮真正执行的 `mutate` 返回处理后的 SupplementRequest；幂等回执复放没有 entity；只有“新执行且全部补件已结案”允许 `requeueCaseAfterSupplement`。
4. `18b920731a5b4712094fd6b55bc3b4c2548f98f2` 加固测试明确首次 `entity.id/status` 存在、重复旧请求 `entity=undefined`。
5. **已核验的最终工程代码 commit** `3b3e52c01e38667d1bbc98f90b6ffa0abda5d722` / tree `261029968f6672b9228e1bd2d06471addd12b15b`：
   - [PR CI #39133427667](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39133427667) **SUCCESS**，4016 PASS / 5 SKIP / 0 FAIL，4021 tests/463 files；类型、边界和 Main/Preload/Renderer 构建通过。
   - [Review batch focused #39133427609](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39133427609) **SUCCESS**，143/143；旧首次正常 requeue 两条正例恢复 PASS，新重复 replay 负例 PASS。
   - [Review Baseline #39133427653](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39133427653) **SUCCESS**。
   - [D2 Scoped Pi #39133427593](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39133427593) **SUCCESS**。
   - 先前 Goal 异步测试在此最终 PR CI **未再 FAIL**；其历史失败仍保留，在未来单独出现时需定位而不是自称无条件解决。
6. 以上 **PASS 只属于这个含代码的 SHA/tree**。本交接文档会使 #121 HEAD/tree 更新；写文档后应以新 SHA 的 CI 为准核对，不得盗用前述旧成功。

## 2. 为什么现在可以继续做 E02～E04

现有代码并非从零开始，需**盘点缺口后补最少源码**：
- `apps/electron/src/main/lib/review/case-store-v2.ts`：唯一按案串行 command 队列；requestId + payloadHash 重放、冲突 `REQUEST_ID_COLLISION`、expectedRevision `VERSION_CONFLICT`、回执和改动原子同写；
- `stage-workflow.ts`：`ensureInitialTask`、`recordStageDecision`（各阶段角色/模板锁/决策任务/不得 Agent 代教师）、`respondSupplementV2` / `resolveSupplementV2`（不足、再次回复、全部请求结束后任务回流）、`resolveAppealV2` 和最终决定投影；
- `batch-store.ts`：`requeueCaseAfterSupplement`、`assertBatchBusinessReadyForFinalization`、`finalizeBatch` / `reopenBatch`、batch 状态、outbox 与恢复；
- `batch-automation-service.ts` / `batch-group-action-service.ts`：已有全局+模板+逐批授权，候选分组必须人工预览确定、单案事务校验、不可冒用 AI 提议；
- `workspace-business-service-v2.ts`、`decision-readiness-v2.ts`：正式人工决定与不足来源拒止；
- 既有测试 `stage-workflow.test.ts`、`business-workflow.test.ts`、`batch-automation-service.test.ts`、`batch-group-action-service.test.ts`、`batch-store.test.ts`。不得不知道它们已覆盖什么就重复堆大量相同 fixture。

### 下一项真正待执行

**E02**：正式人工决定和授权闭环的差分盘点、缺口修复（若确证）与针对性回归。先看 `recordStageDecision` 与 `workspace-business-service-v2` 的当前业务入口、actor 与授权来源、输入的 review-run/SourceRef 就绪状态，确认**是否存在“模型建议直接变成校方业务决定”或允许 stale 来源回执通过**。用真实 `submitCommand`/持久 V2 做正反例，禁止用随意 mock 掩盖问题。缺口未证实时不改生产码。详见 [83 号](83-p06-l02-01-next-agent-execution-20261018.md)。

**E03**：补件不足→再次回复→满足、多个补件门控、旧 run/材料版本失效、实际批次 requeue/最终人工动作的跨命令一致性；每个独立动作不自动继承旧授权或 V2 source。

**E04**：明确授权的 auto-return/auto-approve 与普通 assist 的隔离、定稿/重开/幂等 outbox、同 operationId 重放、不相容 snapshot 拒绝；继续复用现有事务，不加第二引擎。

**E05**：等离线阶段真实全部收口后再用一份**统一集中本机任务书**组合必要真实 E2E，不在 E02/E03/E04 每完成一项就喊本地 Agent 跑一次。

## 3. 真实待解除阻断（**不因本次交接消失**）

- Provider：#118 的 `PI_PROVIDER_TOOL_RECEIPTS=BLOCKED_ENV`，网络 Provider requests 0、真实 tool-use→Main gate→V2 receipts 无完整链；无授权测试 key 不强行调用，A/B/C `NOT-RUN_GATE`。
- I/O：无法创建可信独立小测试卷，真满卷+故障后不同 PID 的恢复 `BLOCKED_ENV`。早期 Linux `/dev/full` 是受控 kernel failure，不能升级 E2E；不可填满用户宿主磁盘。
- Office #71：测试仓内 scoped 兼容 PASS，但上游 `Nya-Angle/CDUT-Studio` 权限 403，真实 upstream port BLOCKED。
- P05 外部：中心实际多 viewer/ticket `BLOCKED`；Pocket FIFO 补丁待目标仓应用验证 `PATCH READY / TARGET NOT-RUN`。
- L02-00 原始业务：旧 C 的业务原因已有归因，未取得完全等价新 Provider/SourceRef/人工闭环，不允许用新合成案例覆盖旧案记录。
- r12 UI 登录：曾通过授权账户到空列表 UI，但是 checkout tree 与统一最初 tree 不一致、原始认证交互日志缺失；只接受范围 PASS，正式业务/UI E2E 仍缺。
- P04 tombstone / owner UUID journal：长期安全记录禁止未经证明的 TTL、GC、重置。

## 4. 分支与并发态保护

- #121 是**独立 P06 业务开发支线**，基于 #118，不要合并 #118/#121 到 main，不要把它 rebase 到 D4 新 HEAD。
- 2026-10-18 同仓并行：D4 [#119](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/119)、[#120](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/120)、[#122](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/122)、[#123](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/123) 持续修改 D4 P1/P2，和 P06 不共享可直接 merge 的父版本；新会话重查这些 PR 是否有新版本及碰撞。
- 公开仓库每个 PR 的历史 RED/冻结 Gold、29 LIVE 保持只读。禁止替换 #118 原证据、绕开校方授权开真实审批、泄露凭据/个人资料。
- 本轮内允许自主创建最小测试/修复提交并运行 CI；目标是 **代码可执行、测试确实跑、可追溯**，不满足时明确归因；不只写下一份计划。
- 使用 **一个持续工作分支** 做 E02～E04，必要时分提交但不分散成三次 Electron 全量验收。下一新会话将修复缺陷并将 E02～04 的必要日志归档，不能把 E01 的 GREEN 代替新改动的新 SHA。

## 5. 结束/继续标准

**允许继续开发：YES**，下一步是 E02 → E03 → E04。**本次 U1 集中验收活动：CLOSED**。**L02-01_OFFLINE_DEV 当前尚未整体完成；E01 的受控代码修复可签 PASS**。

下一会话不得声称 L02-01 LIVE 通过、P06 正式通过、LIVE-01～08 全部通过；按 [47](47-p06-evidence-driven-followup-plan-20261015.md) 和 [29](29-background-session-preflight-audit.md) 最终放行前仍需补真实 Provider、原件与压缩、真实 I/O 跨 PID、外部多终端和完整业务审批正反证据。

**交接文件自身不是验收**。如新 HEAD 无完整 CI，必须明确 PENDING；本会话的 `3b3e52...` 在补交文档前有已经核实成功的四条流水线，不代表未来提交的新树必然通过。

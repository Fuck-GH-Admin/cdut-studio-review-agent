# 02｜重复业务系统、重复执行与重复状态：根因审计

适用固定 SHA：D4 W1 `f77441cee6771090c0fac05a7643372922975157`；P06 R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`；main `8989941b6fb5651564e32d11c4215b6a6d5a5209`。证据性质：源码静态读查 + 既有测试定义；本轮没有新增实测 PASS。

| 问题 | 读写与入口证据 | 类型 | 成熟性判断 | 裁定 |
|---|---|---|---|---|
| V1 `case.json` ↔ V2 `state.v2.json` | `case-store.ts:123-254`、`case-store-v2.ts:21-165`、`workspace-service-v2.ts:22-218`；普通工作台读写 V1 后反复投影 | **数据双主入口**，单向同步而非安全的完整双写 | V2 有 aggregate、receipt、revision、业务命令；V1 仍有更多实际三栏导入/编辑路径 | ADAPT，选 V2 为将来权威 |
| `case.v2.json` 迁移兼容影子 | `migration.ts:132-186` 创建后直接沿用旧快照；真业务聚合另在 `state.v2.json` | 兼容快照，不应被当第二个业务主库 | 必须保留旧案迁移证据，不能删除其磁盘文件 | RETIRE 写入职责（完成迁移后），KEEP 只读兼容 |
| V1 Mock/AI run ↔ V2 图 Run ↔ 直接 Pi Run | `review-ipc.ts:900-914,635-681`；`run-service.ts:61`、`run-async-service.ts:73,114`、`pi-case-review-service.ts:448,841` | **真实重复 Run 入口/生命周期**，非简单函数重叠 | 直接 Pi 已有 assignment、读原件回执、增量 submit 和继续；图 Run 有节点检查点、离线/模型受控图；两者各有成熟部分 | ADAPT：一个 Run API、两个可选择的执行适配器；不要无迁移直接删一条 |
| P06 Main-owned 隐藏会话 vs 普通 Pi | `review-pi-run-bridge.ts:23-104` 调用共同 `preparePiReviewRunV2`；`agent-session-manager.ts:474-487,636-659` 维护 Owner 墓碑和身份栅栏 | **合理执行适配/信任域隔离**，并非新的业务案卷 | P06 的后台 owner 隔离与停止约束较直接借普通 session 更严；真实 Provider/跨 PID 尚有独立门禁 | KEEP、ADAPT 接统一 Run API |
| D4 文件导入批次 vs P06 多案审核批次 | `review-d4-case-batch.ts:41-252` 与 `batch-store.ts:576-607` | 名称相似但业务不同，不是重复业务 | D4 管一个案卷多原件；P06 管多个案卷的 Run/outbox | KEEP 两种业务，统一基础任务事件和进度协议即可 |
| V2 Case Panel ↔ 三栏现有工作台 | `ContentReviewView.tsx:140,245-261`；`V2CasePanel.tsx:61-180`；`CenterPanel.tsx:80-105` | **重复交互入口与局部状态** | 三栏已支持原件、规则、提交与 D4 计划；V2 独立面板还有管理/正式流程 UI 依赖 | RETIRE 导航；ADAPT V2 功能到同页 |
| 作者态草稿/候选壳 vs 正式 TemplateVersion | `review-authoring-v1.ts:204-286`、`review-d2-runtime.ts:51-82`、`template-store.ts` | 看似两个模板形态，实际是必要的信任边界 | 候选壳限制空字段/无政策/无批准输出，避免技术预审升级成校规 | KEEP 候选身份；ADAPT 实际业务字段声明 |
| V1 原件 vs V2 材料版本 | `document-service.ts` + `case-store.ts` 与 `material-service.ts:86-256`；`workspace-service-v2.ts:66-119` 合并 V1/v2-only versions | **真实材料双登记路径**，但跨来源保留是必要的 | V2 有版本、usage/supersedes、来源引用；V1 原件导入链仍在 D4 生产路径 | ADAPT 无损迁移到统一 DocumentVersion |
| 审核工具重复校验 vs Batch/SchoolPort 二次校验 | `pi-case-review-service.ts:841-970`；`batch-group-action-service.ts:219-248`；`batch-template-lock.ts:4-35`；`batch-store.ts:348-498` | **不同信任边界的二次验证，不是冗余** | 单案验证证据，批次验证归属/快照，学校出口验证授权和幂等 | KEEP |

## 最值得修的重复：状态权威不明确

`workspace-service-v2.ts:22-119` 的 `projectedCase` 把 V1 title/applicant/academicYear、subjects.fields 的 V1 同名值和旧原件元数据投到 V2；它通过 `fixedD2` 保护已冻结 subjects/reviewRules，通过 previous usage/active/supersedes 和 v2OnlyDocuments 保留 V2 专有版本。`166-218` 的同步使用 expectedRevision 冲突重试并使归档 SourceRef 相关 confirmed observation 失效。**这证明有若干安全防覆盖措施，不等于全局已经单写。**

具体风险是：同一标题、普通申报字段、可编辑事项与材料来源仍有两个入口；V2 原生 `createCaseFromTemplate` 建出的案卷未必满足依赖 V1 `getCase` 的旧三栏，且 D4 自身先建 V2、随后补建 V1；中途失败会留下 `D4_CASE_CREATED_INCOMPLETE` 状态（`review-d4-client.ts:88-131`）。现有测试 `workspace-service-v2.test.ts:22-244` 证明已设计过 preserve/reprojection 的局部场景，**未证明断电中断、同进程异步并行、跨版本迁移/回滚全面可靠**。

## 执行重叠的准确范围

`run-async-service.ts:114-200` 自己管理 `activeRuns`、queued 文件、AbortController 和图 Run；`pi-case-review-service.ts:448-523,841-1063` 自己管理同类 Run 的 prepare/finish/retry/SourceRef 校验并通过 assignment 授权。共同落在 `run-store-v2.ts`，共享模板/案卷数据模型，但启动、所有权和失败恢复并未完全共用同一服务函数。`RUN_BATCH_V2` 目前调用的是 **图式 `assembleAndRunReview`**，不等同于后台 Main-owned Pi；不能说 P06 的隐藏会话已统一了批次执行。

建议收敛到：
- `ReviewRunService.start(caseId, mode, source)` 为唯一正式业务入口，生成并锁定一次 Run manifest；子适配器分别调用现有图节点引擎与现有 Pi 实际会话，不重复建业务 Run。
- `PiSessionAdapter` 只负责 Owner、工具权限、send/stop/recovery 与 session ID；所有受理结果回到同一 `ReviewRunV2` 合约。
- `BatchScheduler` 不复制 `ReviewRunService` 的模板解析/材料解析/结论工作，只提供队列、限速、批次 Run binding、失败重试、聚合/分组和出站。

## 当前不得贴上“重复”标签的部分

1. `D3_LOCK_DEPENDENCY_DIGEST` 与 Run `effectiveRuleSetHash`：前者控制模板供应链，后者控制执行时输入快照。
2. `ReviewAgentAssignment`、Main owner 栅栏与模型工具 whitelist：分别保护业务授权、会话归属、模型访问面。
3. Batch 读取 `caseId/runId/inputHash/revision` 的二次验证：预览不是 capability token，提交必须再验证。
4. Outbox actionId + 重启幂等与学校端身份校验：不能并入前端批次按钮的单次点击状态。
5. 老文件保留、墓碑、不可变 receipt 和历史 Run：它们属于兼容与审计证据，不是应删除的重复数据。

## 测试证据层级

- 可读的单元/BDD：`case-store.test.ts:169-239` V1 并发修订；`workspace-service-v2.test.ts:22-244` 投影合并；`review-d2-runtime.test.ts:119-431` 不发布、版本锁、范围和 SourceRef；P06 `batch-store.test.ts`、`batch-group-action-service.test.ts`、`batch-template-lock.test.ts` 安全门禁。
- PR #129 的说明记录 `c0704d11a8bb0ac342e13b565960ddd8a25a1f5f` 工程 CI 3803 pass/6 skip，而 W1 Electron GUI/Provider **NOT-RUN**；该 CI 不能替代此审计自行跑测。
- P06 #132 明确未做 Electron、Provider、SchoolPort、跨进程及 LIVE A/B/C。任何“已全面跑通”断言都不成立。

固定源码链接：`https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/<SHA>/<路径>`。

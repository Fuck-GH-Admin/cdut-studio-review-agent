# 27｜直接案卷审核：复用现有 Pi 的后台会话最小实施规范

> 2026-10-12 缩减版（原提案的过度设计从当前实施基线移除；历史建议仍可通过 Git 历史查看）。
> 代码核对：`main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`。本文件是 **v1 目标与允许改动范围**，不是实现完成声明。
> 开工门槛、遗漏风险与证据状态以 [29 号开工前审计](29-background-session-preflight-audit.md) 为准；现有业务成果以 [28 号交付状态](28-review-stage-delivery-status.md) 为准。

## 1. 要解决的唯一问题

现有直接案卷审核从 `use-review-actions.ts` 创建普通 Agent 会话，把它插入 `agentSessionsAtom`，随后调用 `openSession('agent', ...)` 并通过普通 `SEND_MESSAGE` 启动 Pi。用户被迫进入普通聊天界面，审核会话同时出现在侧栏、搜索、历史和远程会话接口。

**目标**：用户在案卷中点击开始审核，Pi 继续使用既有运行/证据/权限机制，**不创建普通聊天标签和会话入口**。正常审核只显示“审核中”；结束时展示既有结果、依据、需补件或人工决定。未完成时给出简要原因和重试入口。用户无需理解 Pi 技术状态。

**只改变直接案卷审核链路**，不改普通聊天、不改批量审核 A/B/C 的临时 Pi transcript、不实现自动业务审批。

## 2. 优先复用的现有代码（禁止另造同类子系统）

| 需求 | 现有代码 | 规则 |
| --- | --- | --- |
| 创建持久会话 / Pi 上下文 | `agent-session-manager.ts:createAgentSession`、原 Pi transcript | 复用同一索引、目录、上下文；只增加必要的可信归属字段 |
| 发起执行、模型适配、完成回调 | `agent-service.ts:runAgent`、`AgentOrchestrator`、`createAgentRunOutcomeReporter` | 首选原有 `runAgent()`；不新增 Agent 引擎、后台任务数据库或新 EventBus |
| 审核准备与证据写入 | `preparePiReviewRunV2`、`submitPiReviewResultV2`、`finishPiReviewRunV2` | 沿用 `caseId/sessionId/turnId/runId/assignmentId` 和 D2/来源引用/材料版本门禁 |
| 运行状态与历史 | `run-store-v2.ts`、现有工作台结果与待处理项 | V2 运行记录是唯一业务状态来源；前台只做简单状态投影 |
| 停止 | `stopAgentAndWait(sessionId)` | 审核入口必须先校验当前绑定的 run，再真正停止并等待释放 |
| 进程重启 | `markStaleRunsInterrupted`、原 Pi resume | 既有运行标记中断，检查点保留；恢复必须由用户发起，不假装后台持续运行 |
| 审核工具 | `pi-review-ops-tools.ts` 与适配器既有 `toolProfile:'review'` | 先通过 P02 兼容性验证，再让直接审核使用严格的审核工具档案；不得放宽权限 |

**核心决定**：只新增一个很薄的 Main 审核调用适配层，不重新实现 session manager、message store、permission service、run ledger 或 agent scheduler。

## 3. v1 边界：少做什么，也要写清

1. **仅 Pi 执行阶段后台化**。原 `review-actions-controller.ts:runFullReview()` 中的旧 HTML/EML 修复、逐事项识别等**启动前准备**暂时保留现有工作台行为；用户应等这些准备结束、Pi 真正受理后再离开页面。不能把这个版本称为“从点击开始起全链路后台化”。需要跨页面运行准备步骤时另立任务，不暗中扩大本 PR。
2. **不开发中途通用聊天**。原则上只加载受控审核工具；缺材料/需解释的事实写为待补件或待核实，在本轮结束后通过现有业务流程解决。通用 AskUser/高权限请求不能静默自动批准；出现非预期技术交互必须明确拒绝、失败并收口，而非永久悬挂。
3. **不批量迁移历史会话**。新后台入口产生有 owner 的内部会话；旧审核聊天会话继续按原行为展示。已存在的审核结果与运行历史仍可访问。
4. **不改变批量审核、普通 Agent、飞书/目标任务的语义**；会话强制隔离只针对新的内部 owner。
5. **不依赖新的配置面板**。第一版只维持审核专用模型选择与“跟随全局”的既有含义；主进程必须有可靠的真实模型解析来源，不能随意替换默认模型。
6. **不保证应用退出后继续运行**。关闭审核视图不停止已受理的 Pi 运行；整个应用退出后按既有进程退出和重启中断语义处理。

## 4. 最小接线设计

### 4.1 Main 可信创建和归属

`AgentSessionMeta` 增加可选字段：

```ts
owner?: { kind: 'review-case'; caseId: string }
```

普通旧会话缺省无 owner。由 Main 审核专用创建入口完成案卷验证并在初始持久化时原子设置 owner；通用 create/update IPC 不得让 Renderer 或 Pocket 自行伪造、覆盖 owner。owner **不是**业务操作权限凭据，原有效 assignment、用户触发轮次和证据版本检查全部保留。

同一案卷可按现有规则复用符合条件的 session；`restart` 使用新 session；跨案绝不能复用。新内部会话首版不允许普通发送、排队、分叉、协作委派、工作区移动、归档或普通删除等操作。

### 4.2 一个薄 Main bridge，三个业务动作

仅建议新建一个审核特化小模块（例如 `review-pi-run-bridge.ts`），它**委托**已有函数：

- `start(caseId, mode)`：校验本轮模型与已准备案卷；创建/获取 owner 会话；复用 `preparePiReviewRunV2` 与 `runAgent`，以真正绑定的 `onRunOutcome` 调 `finishPiReviewRunV2`。启动被 busy 拒绝或前置失败时要撤销本轮指派、正确收口；不能留下孤儿 running。
- `state(caseId)`：读原有 V2 run 与案卷状态，不新存另一套 run；返回简化的业务状态和所需结果索引。技术日志与 transcript 仍在既有存储里，但不走普通 UI。
- `stop(caseId, runId)`：在无异步空窗的情况下校验它仍对应当前 session/assignment/run，然后调用 `stopAgentAndWait`。旧 run 的迟到取消不得伤害新 run。

Main 发起执行时仍需要现有窗口的 `webContents` 用于运行事件转发，**不等于打开 Agent Tab**；若不满足条件，应 fail closed，不得通过虚构窗口/绕过 SDK 解决。

### 4.3 Renderer 只改必要的调用点

保留 `createReviewActionsController`、`RightPanel`、`RunResultPanel` 与原有案卷数据模型。在既有 `startPiReview` 回调中改用审核专用 start/status/stop IPC，移除普通 `openSession('agent', ...)` 和人工维护正常聊天 `agentSessionsAtom` 的部分。状态只显示“审核中 / 需要处理 / 已结束 / 未完成”，**不展示材料读取阶段、token、工具调用或百分比**。

在真正切离页面后，重新进入案卷应从 Main/V2 store 查询状态，而不是依赖原 Hook 的轮询循环和未保存的 Jotai 内存。

### 4.4 共享代码只允许必要的局部守卫

定义**统一的“普通会话是否允许访问”规则**，但各入口必须真正使用它：

- 主进程普通 `LIST_SESSIONS`、`SEARCH_MESSAGES`、按 ID 的普通读取与变更接口；内部维护/审计所需全量查询保留，不能全局修改底层 `listAgentSessions`。
- Desktop 会话侧栏、归档计数、消息搜索、普通 Tab 创建及持久恢复、`session_projection`、`external_run_started`、`session_updated` 和过期列表快照合并。不能因为一个异步事件重新显示内部会话。
- Pocket 远程会话列表、单会话读取、发送、取消、删除、fork、修改设置、互动答复；**进入远程事件重放日志之前**过滤内部会话。飞书镜像不能自动给内部会话建立普通聊天镜像。
- 原始 transcript 只允许受授权的审核诊断途径读取；首版可以只保留既有本地文件和审计能力，不必新做管理面板。

旧普通 Agent 的事件、权限、缓存合并、恢复和多端交互不得因新增 owner 而改变。

## 5. 实际验证与未验证（不要混淆）

**已通过的局部验证**：P01 复用测试 [`review-background-reuse.probe.test.ts`](../../../apps/electron/src/main/lib/review/review-background-reuse.probe.test.ts) 把真实 `runAgent` 函数体与真实 V2 运行存储/指派连接，使用受控模拟编排器，五种情况均通过：完整提交、部分完成、错误、取消、busy 不误收尾。PR CI 的 [运行 #38164270451](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38164270451) 验证了 3714 pass / 5 skip / 0 fail，并通过类型、边界与 Electron 构建。此结果**不等于真实 Pi/桌面 E2E**。

**仍未完成的门禁**：真实 Pi 模型调用、严格 `toolProfile:'review'` 的直接审核兼容性、视图切离后继续运行、Pocket/桌面所有入口隔离、过期 stop 竞争、重启与删除、正常 Agent 跨路径回归。详见 [29 号 P01–P08](29-background-session-preflight-audit.md)。

## 6. 后续严格按这个顺序执行

1. **验证优先**：先完成 29 号 P02（严格工具与会话恢复）以及启动/切页的真实 Main 最小实验。任一不通过，停下调整接线；不立刻写完整 UI。
2. **Session 归属及 Guard**：先写普通入口的拒绝/可见性负例，再以最小字段增加 owner；不可更改普通 Agent 既有公共行为。
3. **薄 Bridge**：仅接入现有 `runAgent`、`preparePiReviewRunV2`、`finishPiReviewRunV2`、`stopAgentAndWait`。逐个测试成功、失败、取消、竞态、重启、删案。
4. **最少 UI 改动**：仅修改审核触发与业务状态；Pocket、历史 Tab、事件回填与普通聊天逐项回归。
5. **实测验收**：冻结提交 SHA，运行全部测试、类型/边界/构建、合成案卷 Electron 回放与真实 Pi 受控测试；无法执行的标 NOT-RUN。由用户审核结果后决定是否结束 Draft/合并。

**越界停止规则**：任何一步如果要求重写 Pi Adapter、AgentOrchestrator、通用 Session Manager、权限系统或事件总线，必须先给出无法通过局部适配完成的可复验证据，并修订本文件后才继续，不允许边做边扩张。

## 7. PR 边界

仅在 `feat/review-owned-background-sessions` 的 Draft PR #21 开发。预先划清必要的生产改动文件与测试文件；不得夹带 D3 模板编辑器、批量审核或其他通用 Agent 功能的重构。**没有真实 CI 与桌面证据不合并；未经用户验收绝不合并。**

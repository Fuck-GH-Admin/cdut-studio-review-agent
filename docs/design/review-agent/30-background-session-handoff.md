# 30｜后台案卷审核：跨会话接手指南（PR #21）

> 更新基线：2026-10-12，Draft PR #21 HEAD `cbdd0a8c86bafc6bff60781de466b0ba963d27e2`。本文件是**导航/交接快照**，不是替代 27 号规范和 29 号门禁；每次继续开发前重新读取 PR 实际 HEAD、检查 CI 与文档是否过时。不能假设 main 已有这些实现。

## 一分钟读懂

- 仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- 本任务只在分支 `feat/review-owned-background-sessions`、[Draft PR #21](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/21) 上进行；**禁止未经用户批准合并、解除 Draft 或擅自切换到 main 开发**。
- [27｜最小复用实施规范](27-background-review-session-proposal.md) = **做什么与不做什么**；[29｜审计、证据、统一实机验收](29-background-session-preflight-audit.md) = **每小批次的真实证据、缺口和 LIVE-01～08 登记簿**；[31｜新会话接手与小批次提示词](31-background-session-continuation-prompts.md) = **可直接发给新会话的指令**。
- 用户体验目标：直接案卷审核的 Pi 执行不另开普通 Agent 聊天 Tab；界面只露出有业务价值的“审核中／需要处理／审核结束或未完成”，不暴露技术中间状态。
- **只让现有 Renderer 的材料修复/逐事项识别之后的 Pi 阶段后台化**。复用 `runAgent`、Pi Adapter、Session Manager、V2 账本、原有证据/压缩与停止逻辑；禁止重新造执行引擎、任务数据库、事件总线、通用权限框架。普通 Agent 和批量审核 A/B/C 要回归保持原有行为。

## 当前工程状态（不要把局部 PASS 说成整体验收）

| 阶段 | 已有代码／受控证据 | 仍不能声称 |
| --- | --- | --- |
| P01 | 现有 `runAgent` 函数体与真实 V2 账本/指派的受控生命周期测试 5/5 | 真实 provider / Electron E2E |
| P02 | 严格 Pi 档案、Main 自定义工具白名单、案卷版号原件预览、续审和压缩；受控 14/14 | 真实扫描 PDF 的 Electron 渲染、真实 Pi 模型 E2E |
| P03-S01 | Pi `onRunOwned` 与 V2 `running` 的受理语义，受控 2/2 | 已实现业务 ACK IPC、真实跨页 |
| P03-S02 | `review-pi-admission.ts` Main 内受理 Promise/持续执行收尾，受控 6/6 | 已注册真实业务 IPC |
| P03-S03 | 可信 `owner:{kind:'review-case',caseId}` 原子持久化、不可经普通元数据更新伪造，基本桌面/Pocket 守卫，受控 4/4 | 完整桌面、Pocket/Feishu 隐藏 |
| **P04-S01** | 普通桌面主路径搜索/归档/按 ID 读写、Stop/进程与任务、投影/流恢复、Renderer 异步合并防复活，**受控 8/8 PASS** | P04 全面 PASS；历史 Tab、删除后的迟到投影、所有剩余桌面入口 |
| P04-S02+、P05～P08 | **尚需继续按批次** | 可直接合并或对外发布 |

**当前已证实的 P04-S01 基线**：冻结代码 `3096ba6fc60c0d95a149f2279d5437a2dc0c548f`；[PR CI #38184686298](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686298) SUCCESS（P04-S01 8/8、全仓 3748 pass / 5 skip / 0 fail）；[D2 #38184686276](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686276)、[Review Baseline #38184686293](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686293) SUCCESS。后续又做了 PR 文档更新，**最新 HEAD `cbdd0a8c...` 的三个 CI 也已核实 SUCCESS**。任何新提交需重新读取/确认当次 CI，不能沿用历史 PASS 作为新 HEAD 的证据。

**P04-S01 曾发现并修复的回归**：Goal/Stop 旧源码测试夹具没注入新增 owner 守卫，首轮失败；保留生产安全校验、修复旧夹具，并新增普通 Stop 拒绝内部会话负例后重跑通过。不得为迁就测试移除安全校验。

## 下一阶段：从 P04-S02 开始，不要跳过

**推荐先把 P04-S02 作为“历史 Tab 与恢复路径”一个小批次**，而非一口气重写全部入口。

1. 审计当前 PR HEAD 的持久化 Agent/Preview/Browser Tab 储存、窗口恢复/跨窗口重新绑定流程，找出 owner 标识在哪些时刻可用，及老快照/缺失元数据时的 fail-closed 策略。
2. 提供可复验的入口矩阵与负例：历史缓存含内部 sessionId、重新打开/恢复 Tab、切换工作区与跨窗口、常规会话仍可恢复、不应因“只过滤新列表”让旧 Tab 复活。
3. 在已有 Session/Tab 恢复层做**局部最小守卫**并运行回归。避免跨模块的大重构；如发现与现有生命周期不可兼容，记录证据与修改提案后停止。
4. **本批只处理确认可闭合的一块**。删除后的迟到 `session_projection`/stream tombstone、剩余按 ID 桌面 IPC、跨窗口队列等可以在 P04-S03/S04 独立收口；但必须写入 29 号文档，不得遗漏。若源码显示它们与 Tab 恢复不可分割，可在 S02 的同一测试边界合并，理由留证。
5. P04 全部入口、P05 Pocket/Feishu 全量隔离完成**以前，不要开放实际后台审核公共 IPC**。P03-S02 的 Main 内受理层存在不意味着用户入口已经启用。

### 需要重点阅读的当前文件（以 HEAD 为准）

- `packages/shared/src/types/agent.ts`：owner 类型及可见性判定。
- `apps/electron/src/main/lib/agent-session-manager.ts`：可信 owner 创建、普通入口保护、搜索/归档。
- `apps/electron/src/main/ipc.ts`：桌面 IPC 守卫。
- `apps/electron/src/main/lib/agent-session-ui-projection-publisher.ts` 和 `apps/electron/src/main/lib/agent-service.ts`：投影、流直发与重放。
- `apps/electron/src/renderer/lib/agent-session-list.ts`：Renderer 迟到列表/upsert。
- `apps/electron/src/main/lib/remote-service.ts`：P05 之前已存在的基础 Pocket 保护，但**不是全量验收**。
- `apps/electron/src/main/lib/review/review-desktop-isolation.p04.test.ts`、`apps/electron/src/renderer/lib/agent-session-list.test.ts`、`apps/electron/src/main/lib/goal-ipc-routing.test.ts`：P04-S01 现有回归基础。
- 其他历史 Tab / persistence / workspace / window 代码须通过仓库全量搜索来**发现**，不可仅依上列文件推断已覆盖全部入口。

## 最终实机验收绝不能漏

**29 号文档 `LIVE-01～LIVE-08` 是唯一集中登记簿，当前八项全部 NOT-RUN，未获得用户真实证据不可自动打勾。**

范围包括真实 Pi/工具隔离、扫描 PDF Electron 预览、长轮次续审压缩、真实 ACK/前置准备、跨页继续执行、桌面/Pocket 实时与历史隔离、停止/重启/删案竞态、普通 Agent/批量 A/B/C 全回归。

先前用户明确同意把 P02 的真实 provider/Electron 运行试验延后至**完整后台链路 E2E 统一验收**，只是避免重复搭临时入口，**不是豁免**；首次合并/发布前必须全部 PASS。对需要用户机器才能跑的项目，记录 `NOT-RUN`、详细步骤、预期和证据路径，用户最后统一执行。

## 每一小批次的停机/交付规则

- 动手前核对 PR HEAD / 分支、27/29/30 文档、待办阶段、已有实现和测试；先复用，再小范围改动。不要仅依过去聊天做决定。
- 只做用户点名批次；每批：入口/风险核验 → 小改动 → 针对性负例 + 普通路径回归 → GitHub CI（真实 run id 与 SHA）→ 把完成/未运行/阻断写入**29 号**，同时更新 27/30 与 PR 说明。CI 未完成则记 PENDING，不能编 PASS。
- 每项证据标注「代码提交 SHA vs 当前 HEAD」「受控测试 vs 真实 Electron/模型」「通过/失败/未运行」。普通自动测试不能替代 LIVE 真实操作。
- 不关闭 Draft、不合并；若必须重写核心执行内核、 Session Manager、权限框架或事件总线，先报告不可局部修复的具体证据并停止越界。
- 只有本批完成、文档/PR 跟上且测试证据可信，才向用户提议下一批；**不要未经用户指示自动推进**。

## 新会话入口

阅读 [31｜跨会话恢复与单小批次执行提示词](31-background-session-continuation-prompts.md)。新会话应先读取 27、29、30、31 及 PR #21 的最新 SHA，再依据现有代码和 CI 开始 **P04-S02**，而不是重复 P04-S01 或直接进入 P05。

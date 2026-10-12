# 30｜后台案卷审核：跨会话接手指南（PR #21）

> 更新基线：2026-10-12，Draft PR #21 **P04-S04 冻结代码 SHA** `4c458d24bd73dc3221bc1d13333b50f7752d3054`（文档提交将产生更新 HEAD，须再次核验）。本文件是**导航/交接快照**，不是替代 27 号规范和 29 号门禁；每次继续开发前重新读取 PR 实际 HEAD、检查 CI 与文档是否过时。不能假设 main 已有这些实现。

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
| **P04-S02** | 历史 Agent tab 恢复/重新打开、Preview/Browser 运行期再绑定守卫与普通归档正例，新增 **7/7 PASS** | P04 全量 PASS；删除后迟到事件、真正双窗口 Electron 行为 |
| **P04-S03** | 已删 owner ID-only tombstone + Main/远程迟到事件出口与投影防复活，受控 **5/5 PASS** | 全桌面 IPC、已投递 Renderer 队列及真实跨窗口/删除实机 |
| **P04-S04** | 已补桌面按 ID IPC、跨窗 sender、Renderer 迟到队列与正式预览早到，新增 **8/8 PASS** | PATH-01 路径型通用 IPC、真实双窗口 Electron/PDF E2E |
| P05～P08、P04-PATH-01 | **尚需继续按批次** | 可直接合并或对外发布 |

**当前已证实的 P04-S01 基线**：冻结代码 `3096ba6fc60c0d95a149f2279d5437a2dc0c548f`；[PR CI #38184686298](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686298) SUCCESS（P04-S01 8/8、全仓 3748 pass / 5 skip / 0 fail）；[D2 #38184686276](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686276)、[Review Baseline #38184686293](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686293) SUCCESS。后续又做了 PR 文档更新，**最新 HEAD `cbdd0a8c...` 的三个 CI 也已核实 SUCCESS**。任何新提交需重新读取/确认当次 CI，不能沿用历史 PASS 作为新 HEAD 的证据。

**P04-S01 曾发现并修复的回归**：Goal/Stop 旧源码测试夹具没注入新增 owner 守卫，首轮失败；保留生产安全校验、修复旧夹具，并新增普通 Stop 拒绝内部会话负例后重跑通过。不得为迁就测试移除安全校验。

**P04-S02 本批已冻结代码**：`68ef5128025c61b6c737be9baa82f69aefb042fc`。 [PR CI #38186002063](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002063) SUCCESS：新增历史恢复、异步 Main 授权、Preview/Browser 运行时 7/7，**3755 pass / 5 skip / 0 fail**，类型/边界/皮肤契约/Electron 构建均通过；[D2 #38186002055](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002055)、[Review Baseline #38186002095](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002095) SUCCESS。历史 Tab 恢复使用 `settings.tabState` + Main 过滤后的 Session Manager 元数据验证 ID、owner 和工作区；未知 ID 重开先经 Main `GET_SESSION_META` 断言身份；Preview/Browser 运行时只允许已知普通会话。旧归档会话和持久化项目 draft 保持自动化正例。**不等于 Electron 跨窗口、跨页实机通过。**

**P04-S03 冻结代码与证据**：`3ca7a6726bfefc3e5a8496ff873203ea6d0018c0`，[PR CI #38192286740](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38192286740) SUCCESS（**5/5 新增，3760 pass / 5 skip / 0 fail**、类型/边界/构建）、[D2 #38192286741](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38192286741) SUCCESS、[Review Baseline #38192286739](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38192286739) SUCCESS。现有索引 `reviewOwnerDeletionTombstones` 持久保存已删内部审核 ID，不另造数据库；Main event bus、stream 恢复、fallback、终态/title 直发、投影和 remote replay 写入前统一判定。普通会话兼容自动回归通过；**真实 Electron/Pi/跨窗口均 NOT-RUN**。

**上轮兼容性原因已静态确认**：Renderer 会话元数据异步水合前，如果先收到正常 Preview/Browser 事件，S02 `canOpenOrdinaryWorkTab` 因本地 `agentSessionsAtom` 尚未包含普通会话而拒绝；Preview 返回空 ID，Browser 返回 null，正式 PPTX 预览调用方未校验空 ID。**代码级原因确认，真实发生率/具体回执后果未实测**；29 号独立追踪 `P04-S04-COMPAT-01`，不解除 owner 门禁。

**P04-S04 冻结代码与证据**：P04-S04 冻结代码 `4c458d24bd73dc3221bc1d13333b50f7752d3054`：[PR CI #38194874977](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38194874977) **SUCCESS**（S04 新增 **8/8 PASS**、全仓 **3768 pass / 5 skip / 0 fail**，3773 tests / 428 files；Typecheck / boundaries / Electron main/preload/renderer build PASS），[D2 #38194874914](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38194874914)、[Review Baseline #38194874938](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38194874938) 均 **SUCCESS**。 受控 8 项覆盖 pending request、正常 Preview/Browser 早到、删除中撤销、旧快照 merge、孤儿健康列表。Main 其它有 sessionId 的文件/Graph/迁移/权限入口和 Browser state push 补 owner/tombstone/sender 检查；未知 SDK 流事件在 Main 认证前以有界队列顺序暂存，正式 PPTX 打不开 Tab 则回错误。**真实 Electron 双窗口未跑。**

**仍需收口**：29 号 `P04-PATH-01`：泛用文件路径 IPC 不含 sessionId，其现有路径授权尚未在本项目被证明足以防止读取内部 review 沙箱。不能把本次受控 PASS 外推为桌面全攻击面 PASS。S03 的 tombstone 线性查找/安全 GC 另见 `P04-TECHDEBT-01`。LIVE-01～08 全部 NOT-RUN。

## 下一阶段：P05（单独小批次，不在本轮执行）

1. 从 27/29/30/31 和 PR #21 HEAD 恢复基线，按已有小批规划枚举 Pocket/Feishu/WS 的按 ID 读取修改、嵌套 sessionId、实时推送、partial/replay/重连、镜像创建与群消息链接；不重复 S04 的桌面 IPC 改动。
2. 建立普通会话正例与内部 review owner 负例，删除前/后均验证，先做一个小批次，单批更新证据。保持 P04-PATH-01 风险在账，用户最终实机统一核验不提前勾选。
3. 未实现实际后台审核公共 IPC；不得越界做 P06、合并 PR 或解除 Draft。

### 需要重点阅读的当前文件（以 HEAD 为准）

- `packages/shared/src/types/agent.ts`：owner 类型及可见性判定。
- `apps/electron/src/main/lib/agent-session-manager.ts`：可信 owner 创建、普通入口保护、搜索/归档。
- `apps/electron/src/main/ipc.ts`：桌面 IPC 守卫。
- `apps/electron/src/main/lib/agent-session-ui-projection-publisher.ts` 和 `apps/electron/src/main/lib/agent-service.ts`：投影、流直发与重放。
- `apps/electron/src/renderer/lib/agent-session-list.ts`：Renderer 迟到列表/upsert；删除后 tombstone 留待 S03。
- `apps/electron/src/renderer/lib/agent-tab-access.ts`、`agent-tab-access.test.ts`、`renderer/main.tsx`、`hooks/useOpenSession.ts`：P04-S02 历史 Tab/未知 ID 授权和新增受控 7 例。
- `renderer/lib/browser-tab.ts`、`components/diff/preview-opener.ts`：运行期工作 Tab 普通会话过滤。
- `apps/electron/src/main/lib/remote-service.ts`：S03 删除后的 event-log 前置门禁已复用 tombstone；**不是 P05 全量验收**。
- `apps/electron/src/main/lib/agent-ordinary-pending-access.ts`、`review/review-ordinary-ipc-pending.p04.test.ts`、`renderer/lib/agent-tab-access.test.ts`、`renderer/lib/agent-session-list.test.ts`：P04-S04 受控 8 例、Main pending 与 Renderer 早到/撤销门禁。
- `apps/electron/src/main/ipc.ts`、`main/lib/browser-controller.ts`、`main/lib/agent-session-manager.ts`、`renderer/hooks/useGlobalAgentListeners.ts`：P04-S04 Sender/会话/推送/迟到队列定点变更。
- `apps/electron/src/main/lib/review/review-deleted-owner-tombstone.p04.test.ts`、`main/lib/agent-session-manager.ts`、`main/lib/agent-service.ts`、`agent-session-ui-projection-publisher.ts`：P04-S03 的最小删除后持续隔离门禁及 5 例受控测试。
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

阅读 [31｜跨会话恢复与单小批次执行提示词](31-background-session-continuation-prompts.md)。新会话应先读取 27、29、30、31 及 PR #21 的最新 SHA，再依据现有代码和 CI 开始 **P05 第一个受控小批次**，而不是重复 P04-S04 或跳至 P06。

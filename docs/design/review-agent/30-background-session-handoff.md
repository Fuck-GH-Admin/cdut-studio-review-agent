# 30｜后台案卷审核：跨会话接手指南（PR #21）

> 更新基线：2026-10-12，Draft PR #21 **P05-S05 冻结代码 SHA** `88b941337749028ae3c51ff0db117c44ceb4d7aa`（文档提交将产生更新 HEAD，须再次核验）。本文件是**导航/交接快照**，不是替代 27 号规范和 29 号门禁；每次继续开发前重新读取 PR 实际 HEAD、检查 CI 与文档是否过时。不能假设 main 已有这些实现。

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
| **P05-S01** | Pocket requestId/旧版嵌套 ID/重放发送前门禁；新增 **5/5 PASS** | 飞书及完整 WS 远程入口仍需验收 |
| **P05-S02** | 飞书旧绑定/镜像创建、群消息、EventBus 隔离新增 **7/7 PASS** | 真正飞书群/网络及全量 P05 仍未验收 |
| **P05-S03** | Pocket Chat 附件根与普通工作区里 owner 私有文件路径排除，新增 **7/7 PASS** | 其它远程入口、真实 WS/relay/文件时序仍未验收 |
| **P05-S04** | 搜索元数据私有根与队列嵌套 ID 隔离、新增 **8/8 PASS** | 真实 WS/Relay socket/多 viewer/网络仍 NOT-RUN |
| **P05-S05** | 真正本地 LAN WS 双 viewer + 模拟 RelayClient socket 重连 8/8；stateless Relay 文件命令与结构化 owner payload 拒绝 | 生产中心 Relay、真实 Pocket/Feishu、多 viewer 定向路由未做 |
| P05-S06+、P06～P08、P04-PATH-01 | **尚需继续按批次** | 可直接合并或对外发布 |

**当前已证实的 P04-S01 基线**：冻结代码 `3096ba6fc60c0d95a149f2279d5437a2dc0c548f`；[PR CI #38184686298](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686298) SUCCESS（P04-S01 8/8、全仓 3748 pass / 5 skip / 0 fail）；[D2 #38184686276](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686276)、[Review Baseline #38184686293](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686293) SUCCESS。后续又做了 PR 文档更新，**最新 HEAD `cbdd0a8c...` 的三个 CI 也已核实 SUCCESS**。任何新提交需重新读取/确认当次 CI，不能沿用历史 PASS 作为新 HEAD 的证据。

**P04-S01 曾发现并修复的回归**：Goal/Stop 旧源码测试夹具没注入新增 owner 守卫，首轮失败；保留生产安全校验、修复旧夹具，并新增普通 Stop 拒绝内部会话负例后重跑通过。不得为迁就测试移除安全校验。

**P04-S02 本批已冻结代码**：`68ef5128025c61b6c737be9baa82f69aefb042fc`。 [PR CI #38186002063](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002063) SUCCESS：新增历史恢复、异步 Main 授权、Preview/Browser 运行时 7/7，**3755 pass / 5 skip / 0 fail**，类型/边界/皮肤契约/Electron 构建均通过；[D2 #38186002055](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002055)、[Review Baseline #38186002095](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002095) SUCCESS。历史 Tab 恢复使用 `settings.tabState` + Main 过滤后的 Session Manager 元数据验证 ID、owner 和工作区；未知 ID 重开先经 Main `GET_SESSION_META` 断言身份；Preview/Browser 运行时只允许已知普通会话。旧归档会话和持久化项目 draft 保持自动化正例。**不等于 Electron 跨窗口、跨页实机通过。**

**P04-S03 冻结代码与证据**：`3ca7a6726bfefc3e5a8496ff873203ea6d0018c0`，[PR CI #38192286740](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38192286740) SUCCESS（**5/5 新增，3760 pass / 5 skip / 0 fail**、类型/边界/构建）、[D2 #38192286741](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38192286741) SUCCESS、[Review Baseline #38192286739](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38192286739) SUCCESS。现有索引 `reviewOwnerDeletionTombstones` 持久保存已删内部审核 ID，不另造数据库；Main event bus、stream 恢复、fallback、终态/title 直发、投影和 remote replay 写入前统一判定。普通会话兼容自动回归通过；**真实 Electron/Pi/跨窗口均 NOT-RUN**。

**上轮兼容性原因已静态确认**：Renderer 会话元数据异步水合前，如果先收到正常 Preview/Browser 事件，S02 `canOpenOrdinaryWorkTab` 因本地 `agentSessionsAtom` 尚未包含普通会话而拒绝；Preview 返回空 ID，Browser 返回 null，正式 PPTX 预览调用方未校验空 ID。**代码级原因确认，真实发生率/具体回执后果未实测**；29 号独立追踪 `P04-S04-COMPAT-01`，不解除 owner 门禁。

**P04-S04 冻结代码与证据**：P04-S04 冻结代码 `4c458d24bd73dc3221bc1d13333b50f7752d3054`：[PR CI #38194874977](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38194874977) **SUCCESS**（S04 新增 **8/8 PASS**、全仓 **3768 pass / 5 skip / 0 fail**，3773 tests / 428 files；Typecheck / boundaries / Electron main/preload/renderer build PASS），[D2 #38194874914](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38194874914)、[Review Baseline #38194874938](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38194874938) 均 **SUCCESS**。 受控 8 项覆盖 pending request、正常 Preview/Browser 早到、删除中撤销、旧快照 merge、孤儿健康列表。Main 其它有 sessionId 的文件/Graph/迁移/权限入口和 Browser state push 补 owner/tombstone/sender 检查；未知 SDK 流事件在 Main 认证前以有界队列顺序暂存，正式 PPTX 打不开 Tab 则回错误。**真实 Electron 双窗口未跑。**

**仍需收口**：29 号 `P04-PATH-01`：泛用文件路径 IPC 不含 sessionId，其现有路径授权尚未在本项目被证明足以防止读取内部 review 沙箱。不能把本次受控 PASS 外推为桌面全攻击面 PASS。S03 的 tombstone 线性查找/安全 GC 另见 `P04-TECHDEBT-01`。LIVE-01～08 全部 NOT-RUN。

**P05-S01 受控代码与证据**：P05-S01 冻结代码 `2a08e439d19a0d2eea572003b6ad2d71d33ca3c0`：[PR CI #38198346287](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38198346287) **SUCCESS**（本批 **5/5 新增受控 PASS**、全仓 **3773 pass / 5 skip / 0 fail**，3778 tests / 429 files；Typecheck、包边界、Electron build PASS），[D2 #38198346297](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38198346297)、[Review Baseline #38198346361](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38198346361) **SUCCESS**。 Pocket 远程 `get_pending_interactions` 和三条 `respond_*` 的请求归属已核验；`access.sessionId` 与连接上下文文件预览拒绝已删/隐藏 owner；remote replay/queued event 在发给 Pocket 前再判定。**不能视为 P05 全量验收**。29 号已登记 `P05-S02` 飞书旧绑定、镜像群、Agent EventBus、stop/聊天触发及 `P05-REMOTE-PATH-01` 文件型远程入口。用户 A0 首次实机验收计划在 P05 + Main 业务接线后、P06/P07 前，当前仍 **NOT-RUN**。

**P05-S02 受控代码与证据**：P05-S02 冻结代码 `ae8d6398b3f818abd2d648ea14876c6c5800e164`：[PR CI #38200646046](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38200646046) **SUCCESS**（本批 **7/7 新增受控 PASS**、全仓 **3780 pass / 5 skip / 0 fail**，3785 tests / 430 files；Typecheck、边界、Electron main/preload/renderer build 均通过），[D2 #38200646047](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38200646047)、[Review Baseline #38200646059](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38200646059) 均 **SUCCESS**。 7 项合成正反例覆盖旧绑定恢复/删除后隐藏、更新绑定、直接镜像与 manager 双层门禁、群 `/stop`/消息/状态/模型、EventBus 提交及普通会话仍可正常镜像。实际飞书连接/多 Bot 卡片、网络时序 **NOT-RUN**。完整 P05 **PARTIAL**；29 号保留 `P05-REMOTE-PATH-01`、P04-PATH-01、LIVE-06/08 及 A0 首验门槛。

**P05-S03 受控代码与证据**：P05-S03 冻结代码 `fe89861a52a99836d5d458a528f1d8d9e885ff70`：[PR CI #38201737608](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38201737608) **SUCCESS**（本批 **7/7 新增受控 PASS**、全仓 **3787 pass / 5 skip / 0 fail**，3792 tests / 431 files；Typecheck、包边界及 Electron main/preload/renderer build PASS）；[D2 #38201737615](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38201737615)、[Review Baseline #38201737635](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38201737635) **SUCCESS**。 新增 7 项合成文件正反例：Chat 附件根内合法读删，任意 app config/root 外拒绝，Pocket 普通 session/共享 workspace 正常预览，同 workspace review owner、显式 attachedFiles、符号链接、旧 access、删后 tombstone 和 SDK/checkpoint 已知路径受控拒绝。修改 `remote-service.ts` / `remote-file-access.ts`，不修改通用桌面文件 IPC。`P05-REMOTE-PATH-01` 已列举入口有受控关闭证据；`P04-PATH-01` 未解决，P05 整体仍 PARTIAL，全部 LIVE 未运行。

**P05-S04 受控代码与证据**：P05-S04 代码冻结 `fa6a2a250e6fee0d956ab2ad045812bacd5f3c2c`：[PR CI #38232065193](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38232065193) **SUCCESS**（新增 **8/8 受控 PASS**；全仓 **3795 pass / 5 skip / 0 fail**，3800 tests / 432 files；类型检查、边界和 Electron main/preload/renderer build 均通过）；[D2 #38232065271](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38232065271)、[Review Baseline #38232065165](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38232065165) 均 **SUCCESS**。 8 项合成正反例覆盖普通/hidden/deleted Session snapshot、搜索 attached/root/symlink 不泄漏文件与目录名称、消息 queue 嵌套 owner ID 拒绝、已有 EventLog 断线 cursor/过期 snapshot 进程内行为。真实 WS/Relay 多 viewer socket 未连，P05 整体 PARTIAL；桌面 P04-PATH-01 未结，LIVE-01～08 NOT-RUN。下一步 P05-S05 只做协议层真实 socket/loopback 受控证据和 payload 引用清点。

**P05-S05 真实本机 socket 受控冻结证据**：P05-S05 冻结代码 `88b941337749028ae3c51ff0db117c44ceb4d7aa`：[PR CI #38254196437](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38254196437) **SUCCESS**（新增 **8/8 real-loopback/受控 PASS**，全仓 **3803 pass / 5 skip / 0 fail**，3808 tests / 433 files；Typecheck、package boundaries、Electron main/preload/renderer build PASS）；[D2 #38254196484](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38254196484) 与 [Review Baseline #38254196442](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38254196442) 均 **SUCCESS**。 新增 8 项真实 localhost WS / 模拟 Relay server 对接测试，包含双 viewer 独立 replay gate、断线恢复与 ACK、owner/deleted 及 payload 嵌套 ID 拒绝、坏 cursor snapshot、LAN 旧客户端兼容、Relay stateless 显式 ID、RemoteRelayClient 真连接和重连。初次测试样板在 D2 类型校验失败 #38253917752，修补后全部绿。**不能替代生产中心 Relay 多 viewer 定向响应、手机 Pocket、真实飞书、用户实机 LIVE**；P05 整体 PARTIAL，P04-PATH-01、Main 业务 IPC、A0 未解决。

## 下一阶段：P05-S06（中心 Relay 多 viewer 响应隔离与 P05 最终缺口，本轮不执行）

1. 从 PR HEAD 与 27/29/30/31 恢复状态；独立核验中心 Relay 真实/等价协议的多 viewer command_result 路由、requestId/commandId 映射、同账户多端断线重连、事件 payload 深层结构化 ID 来源，不能仅重复本地 WS/RemoteRelayClient socket 测试。
2. 有可执行生产协议测试则给出 fixture、普通会话正例与 hidden/deleted owner 负例；若中心 Relay 契约/服务不可达，要明示 NOT-RUN 或阻断，并决定 P05 是否仍 PARTIAL。P04-PATH-01、A0 与所有 LIVE 维持未验。
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

阅读 [31｜跨会话恢复与单小批次执行提示词](31-background-session-continuation-prompts.md)。新会话应先读取 27、29、30、31 及 PR #21 的最新 SHA，再依据现有代码和 CI 开始 **P05-S06 中心 Relay 多 viewer 定向与剩余 payload 小批次**，而不是重复 P04-S04 或跳至 P06。

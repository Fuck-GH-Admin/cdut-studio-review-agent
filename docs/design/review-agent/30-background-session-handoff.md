# 30｜后台案卷审核：跨会话接手指南（PR #21）

## 最新停点：本地 S02 已验收但不合格，累计风险待返工

用户本轮进一步明确复核 P01～P06-S02，只向公开 `Fuck-GH-Admin/cdut-studio-review-agent` 推送，不写原项目。应用/驱动 `ef9074e367d2e7fda5955d8b0d6d9a4812836a6d`，0.15.157；[37](37-p06-s02-local-acceptance-20261013.md)记录真实双轮 **E01/E02 2/2 PASS**、E05 关页重进旧回复覆盖新 UI **FAIL**、E03 未命中停止重叠/E04 未注入、普通 Pi IPC/provider 局部正例。类型/边界/构建及全仓 **3860 pass / 5 skip / 0 fail**；独立保护反例 **0 pass / 4 fail**。

[38](38-p01-p06-s02-cumulative-risk-audit-20261013.md)登记四项 CONFIRMED/OPEN：索引旧备份恢复丢 owner 后隔离失效、旧 Controller 跨卸载写新页面、Workspace Hook 无屏障写缓存、撤销授权写盘异常越出收尾 Promise。生产逻辑尚未修，本批只补严驱动与归档。**S02 NOT ACCEPTED，P06 PARTIAL，PR Draft/Open/MERGE NO-GO。** 下一批优先修这四项并将保护断言加入正式 CI，再补 E03/E04/完整 E06；不自动进入 P07/P08。

P05 Relay BLOCKED、独立 Pocket PATCH READY/TARGET NOT-RUN 和 P04 永久 ID-only tombstone 不 GC/容量风险保持原状态。以下较早交接为历史，不能再将 E01/E02 全写 NOT-RUN，也不能凭双轮通过关闭 E05 和累计风险。归档后的 HEAD/CI 以实际 PR 为准。

## 最新交接（2026-10-13；优先于下方历史快照）

- 用户已授权进入 P06。先前 Main-only start/read/stop、Renderer 业务状态及 A0 4/4 已完成；现 **P06-S01 3/3 受控 PASS**，P06-S02 真实 Electron 双轮/迟到控制仍 NOT-RUN，P06 整体 PARTIAL；P07/P08 未执行，**先不合并**。
- 冻结应用/验收驱动：`14bc7d6c3625aaa6eec2675aa9ce4dc446475297`（Electron 0.15.156 / shared 0.1.66 / core 0.2.14）；历史 P05 本地报告已补录 [33](33-p05-local-automation-recheck-20261013.md)，本批命令/环境/结果/CI/截图见 [34](34-pre-p06-main-a0-acceptance-20261013.md)。文档归档后 HEAD 会变化，必须查询当次 CI。
- Main 复用可信 owner factory、V2 prepare、既有 admission/runAgent/stopAgentAndWait；使用审核模块选择或持久全局模型，不猜测替代模型，不继承普通聊天工作区。真实 `onRunOwned` 后 ACK，Renderer 卸载只结束显示轮询。
- **本地 A0 可进入 P06 工程验证**：真实 DeepSeek 文本案卷完成、关闭真实审核子页后写入带出处的结果；预检无孤儿；当前轮停止 cancelled；真实 Pi 对本机 HTTP 500 收口 failed。后者是受控 provider 故障，不是生产 DeepSeek 故障。
- P05-RELAY-ROUTE-01 **BLOCKED / NOT-RUN**；P05-POCKET-FIFO-01 **PATCH READY / TARGET NOT-RUN**。P05 整体 PARTIAL、PR #21 Draft/Open/未合并、MERGE NO-GO。P04 永久 ID-only tombstone 不做 TTL/GC，容量增长风险原记录保留。
- 原件预览曾在 dev 被 `ERR_BLOCKED_BY_CLIENT` 阻断；A0 文本回退完成，扫描 PDF/PNG 不能记 PASS。LIVE 表仅追加已实测子集为 PARTIAL，未完成项保留。
- 下一批为 **P06-S02：真实 Electron/Pi 复核同案连续 update/restart、旧 runId stop/旧失败回调、释放后重启和旧 UI 回执隔离**；先前 P06-S01 的 Main bridge 受控三项已 PASS。以 35 号实测清单为准，不重做 Main/A0，不借此解除 P05 跨仓阻断或合并。

> 历史更新基线：2026-10-12，Draft PR #21 **P04-TECHDEBT-01 安全性能补丁冻结代码 SHA** `dccaf6ce96072eac9404c3957742555916bd62f1`（PATH-01 补丁 `7c5e003c` 证据保留）（先前专项 `9eec2311` 的 9 项证据保留）（P05-S05 代码仍保留）（文档提交将产生更新 HEAD，须再次核验）。本文件是**导航/交接快照**，不是替代 27 号规范和 29 号门禁；每次继续开发前重新读取 PR 实际 HEAD、检查 CI 与文档是否过时。不能假设 main 已有这些实现。

**P06-S01 最近进度（2026-10-13，优先于以下历史）**：冻结代码 [`9851998a`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/9851998a1b157c9d5924b9c6387b062838aa4475)；[PR CI #38358640242](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38358640242)、[D2 #38358640258](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38358640258)、[Review Baseline #38358640275](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38358640275)、[Review batch focused #38358640240](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38358640240) **全部 SUCCESS**；新增 **3/3 PASS**，全仓 **3852 pass / 5 skip / 0 fail（3857 tests / 438 files）**，Typecheck、边界、Electron main/preload/renderer build PASS。修复同毫秒指派顺序与执行器释放后旧授权撤销，Main bridge 三项受控真实 V2/可控 Agent 竞态测试通过；**P06-S01 CONTROLLED PASS、P06 整体 PARTIAL**。详细 [35 号](35-p06-s01-consecutive-rounds-acceptance-20261013.md)；下一批 **P06-S02 真实 Electron 双轮/迟到控制**。34 号 Main/A0 四项实机 PASS 保留，P05 生产 Relay/Pocket 阻断及其它 LIVE/合并门禁不变。PR 持续 Draft/Open。

**P06-S02 最新交接（2026-10-13）**：代码冻结 [`5d5e25e5`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/5d5e25e5db20bbe90a5f367481f3ca982b3162ad)；[PR CI #38361717837](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38361717837)、[D2 #38361717930](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38361717930)、[Review Baseline #38361717713](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38361717713)、[focused #38361717452](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38361717452) **全部 SUCCESS**；**3855 pass / 5 skip / 0 fail（3860 tests / 439 files）**，Typecheck、边界、Electron main/preload/renderer 构建通过。新增 **2/2 前台乱序回调测试 PASS + 1/1 真机脚本静态语法合同 PASS**，不是实际 Electron/Pi E2E。新修旧同案 `listRunsV2` / admission 慢返回覆盖新 run 的界面状态，以及旧 stop Promise 的跨案/跨轮迟到提示。新增 P06-S02 2/2 UI 时序测试和 1/1 QA 脚本 `node --check` 合同，**只是受控/静态 PASS，真实 Electron/Pi 双轮仍 NOT-RUN**。驱动 `scripts/qa/review-background-p06.mjs` 及执行合同在 [36 号](36-p06-s02-ui-race-and-electron-validation-20261013.md)；本轮不能凭旧 A0/Electron 4/4 直接结案。下一步在隔离 profile/真实 provider 完成 E01/E02 后归档证据，继续 P06-S02；P07/P08 尚未启动，PR Draft/NO-GO。

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
| **P04-PATH-01** | 已枚举泛用文件 IPC/协议、工作区树、候选搜索私有路径隔离，原 9/9 + 目标路径追加 **5/5 PASS** | 真实 Electron 双窗口、文件预览/操作 LIVE-06/08 NOT-RUN |
| **P05-S06** | 真本地 WS + 合成中心多 viewer 路由 5/5；深层 AgentStreamPayload 3/3，S06 8/8 PASS | **生产中心源码/正式票据 NOT-RUN；Pocket 补丁仅就绪待上游运行** |
| P05 生产路由复核、P06～P08、LIVE-01～08 | **仍待继续分批** | 可直接合并或对外发布 |

**当前已证实的 P04-S01 基线**：冻结代码 `3096ba6fc60c0d95a149f2279d5437a2dc0c548f`；[PR CI #38184686298](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686298) SUCCESS（P04-S01 8/8、全仓 3748 pass / 5 skip / 0 fail）；[D2 #38184686276](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686276)、[Review Baseline #38184686293](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686293) SUCCESS。后续又做了 PR 文档更新，**最新 HEAD `cbdd0a8c...` 的三个 CI 也已核实 SUCCESS**。任何新提交需重新读取/确认当次 CI，不能沿用历史 PASS 作为新 HEAD 的证据。

**P04-S01 曾发现并修复的回归**：Goal/Stop 旧源码测试夹具没注入新增 owner 守卫，首轮失败；保留生产安全校验、修复旧夹具，并新增普通 Stop 拒绝内部会话负例后重跑通过。不得为迁就测试移除安全校验。

**P04-S02 本批已冻结代码**：`68ef5128025c61b6c737be9baa82f69aefb042fc`。 [PR CI #38186002063](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002063) SUCCESS：新增历史恢复、异步 Main 授权、Preview/Browser 运行时 7/7，**3755 pass / 5 skip / 0 fail**，类型/边界/皮肤契约/Electron 构建均通过；[D2 #38186002055](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002055)、[Review Baseline #38186002095](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002095) SUCCESS。历史 Tab 恢复使用 `settings.tabState` + Main 过滤后的 Session Manager 元数据验证 ID、owner 和工作区；未知 ID 重开先经 Main `GET_SESSION_META` 断言身份；Preview/Browser 运行时只允许已知普通会话。旧归档会话和持久化项目 draft 保持自动化正例。**不等于 Electron 跨窗口、跨页实机通过。**

**P04-S03 冻结代码与证据**：`3ca7a6726bfefc3e5a8496ff873203ea6d0018c0`，[PR CI #38192286740](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38192286740) SUCCESS（**5/5 新增，3760 pass / 5 skip / 0 fail**、类型/边界/构建）、[D2 #38192286741](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38192286741) SUCCESS、[Review Baseline #38192286739](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38192286739) SUCCESS。现有索引 `reviewOwnerDeletionTombstones` 持久保存已删内部审核 ID，不另造数据库；Main event bus、stream 恢复、fallback、终态/title 直发、投影和 remote replay 写入前统一判定。普通会话兼容自动回归通过；**真实 Electron/Pi/跨窗口均 NOT-RUN**。

**上轮兼容性原因已静态确认**：Renderer 会话元数据异步水合前，如果先收到正常 Preview/Browser 事件，S02 `canOpenOrdinaryWorkTab` 因本地 `agentSessionsAtom` 尚未包含普通会话而拒绝；Preview 返回空 ID，Browser 返回 null，正式 PPTX 预览调用方未校验空 ID。**代码级原因确认，真实发生率/具体回执后果未实测**；29 号独立追踪 `P04-S04-COMPAT-01`，不解除 owner 门禁。

**P04-S04 冻结代码与证据**：P04-S04 冻结代码 `4c458d24bd73dc3221bc1d13333b50f7752d3054`：[PR CI #38194874977](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38194874977) **SUCCESS**（S04 新增 **8/8 PASS**、全仓 **3768 pass / 5 skip / 0 fail**，3773 tests / 428 files；Typecheck / boundaries / Electron main/preload/renderer build PASS），[D2 #38194874914](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38194874914)、[Review Baseline #38194874938](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38194874938) 均 **SUCCESS**。 受控 8 项覆盖 pending request、正常 Preview/Browser 早到、删除中撤销、旧快照 merge、孤儿健康列表。Main 其它有 sessionId 的文件/Graph/迁移/权限入口和 Browser state push 补 owner/tombstone/sender 检查；未知 SDK 流事件在 Main 认证前以有界队列顺序暂存，正式 PPTX 打不开 Tab 则回错误。**真实 Electron 双窗口未跑。**

**P04-PATH-01 现已代码级受控修补**：低层泛用文件 IPC、候选/工作区搜索、目录 token 经过 owner/tombstone + realpath deny；9 项受控 PASS，证据见 29 号新增专项小节。**仍需实机**真实 Electron/preload 双窗口、预览与普通文件操作兼容性 LIVE-06/08；P04 整体仍 PARTIAL，不能把 CI 当作现场 E2E。S03 tombstone 性能与 GC 另见 `P04-TECHDEBT-01`，LIVE-01～08 均 NOT-RUN。

**P05-S01 受控代码与证据**：P05-S01 冻结代码 `2a08e439d19a0d2eea572003b6ad2d71d33ca3c0`：[PR CI #38198346287](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38198346287) **SUCCESS**（本批 **5/5 新增受控 PASS**、全仓 **3773 pass / 5 skip / 0 fail**，3778 tests / 429 files；Typecheck、包边界、Electron build PASS），[D2 #38198346297](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38198346297)、[Review Baseline #38198346361](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38198346361) **SUCCESS**。 Pocket 远程 `get_pending_interactions` 和三条 `respond_*` 的请求归属已核验；`access.sessionId` 与连接上下文文件预览拒绝已删/隐藏 owner；remote replay/queued event 在发给 Pocket 前再判定。**不能视为 P05 全量验收**。29 号已登记 `P05-S02` 飞书旧绑定、镜像群、Agent EventBus、stop/聊天触发及 `P05-REMOTE-PATH-01` 文件型远程入口。用户 A0 首次实机验收计划在 P05 + Main 业务接线后、P06/P07 前，当前仍 **NOT-RUN**。

**P05-S02 受控代码与证据**：P05-S02 冻结代码 `ae8d6398b3f818abd2d648ea14876c6c5800e164`：[PR CI #38200646046](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38200646046) **SUCCESS**（本批 **7/7 新增受控 PASS**、全仓 **3780 pass / 5 skip / 0 fail**，3785 tests / 430 files；Typecheck、边界、Electron main/preload/renderer build 均通过），[D2 #38200646047](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38200646047)、[Review Baseline #38200646059](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38200646059) 均 **SUCCESS**。 7 项合成正反例覆盖旧绑定恢复/删除后隐藏、更新绑定、直接镜像与 manager 双层门禁、群 `/stop`/消息/状态/模型、EventBus 提交及普通会话仍可正常镜像。实际飞书连接/多 Bot 卡片、网络时序 **NOT-RUN**。完整 P05 **PARTIAL**；29 号保留 `P05-REMOTE-PATH-01`、P04-PATH-01、LIVE-06/08 及 A0 首验门槛。

**P05-S03 受控代码与证据**：P05-S03 冻结代码 `fe89861a52a99836d5d458a528f1d8d9e885ff70`：[PR CI #38201737608](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38201737608) **SUCCESS**（本批 **7/7 新增受控 PASS**、全仓 **3787 pass / 5 skip / 0 fail**，3792 tests / 431 files；Typecheck、包边界及 Electron main/preload/renderer build PASS）；[D2 #38201737615](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38201737615)、[Review Baseline #38201737635](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38201737635) **SUCCESS**。 新增 7 项合成文件正反例：Chat 附件根内合法读删，任意 app config/root 外拒绝，Pocket 普通 session/共享 workspace 正常预览，同 workspace review owner、显式 attachedFiles、符号链接、旧 access、删后 tombstone 和 SDK/checkpoint 已知路径受控拒绝。修改 `remote-service.ts` / `remote-file-access.ts`，不修改通用桌面文件 IPC。`P05-REMOTE-PATH-01` 已列举入口有受控关闭证据；`P04-PATH-01` 未解决，P05 整体仍 PARTIAL，全部 LIVE 未运行。

**P05-S04 受控代码与证据**：P05-S04 代码冻结 `fa6a2a250e6fee0d956ab2ad045812bacd5f3c2c`：[PR CI #38232065193](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38232065193) **SUCCESS**（新增 **8/8 受控 PASS**；全仓 **3795 pass / 5 skip / 0 fail**，3800 tests / 432 files；类型检查、边界和 Electron main/preload/renderer build 均通过）；[D2 #38232065271](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38232065271)、[Review Baseline #38232065165](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38232065165) 均 **SUCCESS**。 8 项合成正反例覆盖普通/hidden/deleted Session snapshot、搜索 attached/root/symlink 不泄漏文件与目录名称、消息 queue 嵌套 owner ID 拒绝、已有 EventLog 断线 cursor/过期 snapshot 进程内行为。真实 WS/Relay 多 viewer socket 未连，P05 整体 PARTIAL；桌面 P04-PATH-01 未结，LIVE-01～08 NOT-RUN。下一步 P05-S05 只做协议层真实 socket/loopback 受控证据和 payload 引用清点。

**P05-S05 真实本机 socket 受控冻结证据**：P05-S05 冻结代码 `88b941337749028ae3c51ff0db117c44ceb4d7aa`：[PR CI #38254196437](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38254196437) **SUCCESS**（新增 **8/8 real-loopback/受控 PASS**，全仓 **3803 pass / 5 skip / 0 fail**，3808 tests / 433 files；Typecheck、package boundaries、Electron main/preload/renderer build PASS）；[D2 #38254196484](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38254196484) 与 [Review Baseline #38254196442](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38254196442) 均 **SUCCESS**。 新增 8 项真实 localhost WS / 模拟 Relay server 对接测试，包含双 viewer 独立 replay gate、断线恢复与 ACK、owner/deleted 及 payload 嵌套 ID 拒绝、坏 cursor snapshot、LAN 旧客户端兼容、Relay stateless 显式 ID、RemoteRelayClient 真连接和重连。初次测试样板在 D2 类型校验失败 #38253917752，修补后全部绿。**不能替代生产中心 Relay 多 viewer 定向响应、手机 Pocket、真实飞书、用户实机 LIVE**；P05 整体 PARTIAL，P04-PATH-01、Main 业务 IPC、A0 未解决。

**P04-PATH-01 专项证据**：P04-PATH-01 冻结代码 `9eec2311b9ed8f5637f8bf6fa281605040899c39`：[PR CI #38260093230](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38260093230) **SUCCESS**（新增 **9/9 受控 PASS**；全仓 **3812 pass / 5 skip / 0 fail**，3817 tests / 434 files；typecheck、边界、Electron main/preload/renderer 构建通过）；[D2 #38260092950](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38260092950) 与 [Review Baseline #38260093231](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38260093231) 均 **SUCCESS**。 直接/嵌套私有路径、符号链接、已删 tombstone、目录列表与递归、候选搜索、cdut-file 目录 token 的测试受控 PASS；原普通文件/外部只读预览正例保留。初次 CI #38259407202 因公共预览引入重型 Electron import 失败，已按需加载 Main owner 判定并在最终 HEAD 修复。**P04 已枚举 PATH 风险受控关闭，整阶段仍 PARTIAL**。P05-S06 原路线不变，P05 仍 PARTIAL。

**P04-PATH-01 新增复核闭环（同日）**：独立审计发现四个 rename/move IPC 没有对实际最终目标路径重新验证；已通过共享真实文件变更函数加 source+destination owner/tombstone 拒绝，补父级 symlink 下的新建目标解析。冻结代码 [`7c5e003c`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/7c5e003c5c1a01dc295e1ff0e4c6ce15e4da42f0)；[PR CI #38269830272](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38269830272)、[D2 #38269830328](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38269830328)、[Review Baseline #38269830273](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38269830273) **全部 SUCCESS**；新增 **5/5**，全仓 **3817 pass / 5 skip / 0 fail（3822 tests / 434 files）**，typecheck/边界/Electron build PASS。旧 9 项 PASS 保留，新增 5 项执行真实临时磁盘变更；但真实 Electron IPC/跨平台与 TOCTOU 仍待 LIVE-06/08，P04 整体 PARTIAL。P05-S06 不变，A0/LIVE-01～08 均 NOT-RUN。

**P04-TECHDEBT-01 索引热路径与容量决策（2026-10-12）**：冻结代码 [`dccaf6ce`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/dccaf6ce96072eac9404c3957742555916bd62f1)；[PR CI #38273510150](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38273510150)、[D2 #38273510227](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38273510227)、[Review Baseline #38273510354](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38273510354) 均 **SUCCESS**；新增 **5/5 PASS**，全仓 **3822 pass / 5 skip / 0 fail（3827 tests / 435 files）**，typecheck、边界、Electron build PASS。持久 tombstone 仍 ID-only 追加保存，缓存 Set 与索引 mtime/size、写入与重载同步重建；重启、外部变更、写失败、旧索引受控 5/5。100k UUID 时索引 4,400,288 bytes、冷读 16.871ms、索引更新 15.547ms、热查询 p50 0.0040ms（旧线性参考 0.8777ms）；无安全依据不做 TTL/GC，永久增长作为已知容量风险继续观察，并可能需要平台方联合设计分段存档。**本批受控 PASS，不宣称容量有界或桌面 LIVE PASS**；P04 PARTIAL，LIVE-01～08 NOT-RUN，下一批 P05-S06 不变。

**P05-S06 受控结果与生产中心阻断（2026-10-13）**：代码冻结 [`aaf1ca89`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/aaf1ca890a37d679a52e3e79cf10d9f588ce25e5)；[PR CI #38282086761](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38282086761)、[D2 #38282086959](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38282086959)、[Review Baseline #38282086722](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38282086722) **SUCCESS**；新增 **6/6 PASS**，全仓 **3828 pass / 5 skip / 0 fail（3833 tests / 436 files）**，Typecheck、边界与 Electron 构建均通过。本地两个 viewer、Relay outbound 桌面适配器、不同 `_cmdId` 与相同业务 ID、重连 snapshot、删后 owner、异常深层 session ID、投影与 replay 均受控通过。中心 `profer.cn/remote/ws` 服务端不在仓库且缺少获授权的多 viewer 接入；实际中心路由 **NOT-RUN**。独立 Pocket `ws-client.ts` 在收到非空不匹配回执 ID 后可能 FIFO 兑错 pending，列 `P05-POCKET-FIFO-01` 待客户端维护者修复/验收。**P05 PARTIAL，所有 LIVE NOT-RUN，PR Draft 保留。** 29 号包含完整测试与处置门槛。P04-TECHDEBT-01 结论与保留策略未改变。

**P05 六批合并验收快照（2026-10-13）**：代码冻结 [`ce992f90`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/ce992f90880ecde1954e925b63585692a085f621)，三套 CI [PR #38284532497](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38284532497)、[D2 #38284532492](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38284532492)、[Baseline #38284532487](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38284532487) 均 SUCCESS；P05 六个文件 **43/43 PASS**（8+7+7+8+8+5），全仓 **3830 pass / 5 skip / 0 fail**（3835 tests，436 files）。S01～S06 专项 43/43 PASS；Pocket [固定上游补丁](patches/P05-POCKET-FIFO-01-Profer-pocket.patch) 准备就绪且 source diff 精确匹配，**未写入/测试独立 Pocket 仓库**；中心 route 强化夹具 2 项新增 socket PASS，**无生产中心部署证据**。完整逐项表、平台限制与用户本地验收详见 [32 号](32-p05-stage-acceptance-and-local-gates.md)。结论 **P05 CONTROLLED PASS / FULL P05 PARTIAL / PR MERGE NO-GO**；P04-TECHDEBT-01 已做性能优化但 tombstone 增长风险必须继续保留。

**P03-MAIN-S01 新一轮后端接线冻结（2026-10-13）**：冻结代码 [`5f786583`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/5f7865837c6321756c3bc779c5aad2fe793e8fd0)；[PR CI #38290676371](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38290676371)、[D2 #38290676419](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38290676419)、[Review Baseline #38290676426](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38290676426)、[Review batch focused #38290676413](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38290676413) **全部 SUCCESS**；新增 **7/7 PASS**，全仓 **3837 pass / 5 skip / 0 fail（3842 tests / 437 files）**，Typecheck / boundaries / Electron main, preload, renderer build PASS。这批只做 `getBackgroundPiReviewStateV2` 的只读 Main IPC/Preload/共享契约和 `onRunOwned` ACK gate；原 P01–P05 受控历史和 P04-TECHDEBT-01 的安全留存不变。真实后台审核 start/stop 与切页仍未实施，下一小批 `P03-MAIN-S02` 前请核对独立本地验收证据是否已同步远程；目前只能看到旧版 32 号 NOT-RUN，**不可擅自把 LIVE 表改 PASS**。继续 Draft/Open、不合并。

## 历史下一小批：P03-MAIN-S02（已由最新 Main/A0 交付完成）

- 在现有 Main 受理器和可信 owner factory 上做最小委托；入参必须验证 caseId、真实用户轮次/assignment、review-operator 预设及 Pi 模型，受控 ACK 前禁止切页；不复制 RunStore、不改通用执行内核。
- 确保 busy、重复启动、同案旧轮次、准备失败与取消只有当前 binding 能收尾；旧普通 Agent 正例不回归。
- 本批仅有**只读状态 IPC**，尚无真正 start/stop 或 Renderer 切换。完成 start 后才进入 stop 与 A0 实机。P05 生产中心 Relay/Pocket 的跨仓阻断仍独立保留。

## 历史未解阻断：P05 跨仓服务端+Pocket 真正应用与项目级 A0 之前的阻断收口（未执行）

1. 从 PR HEAD 与 27/29/30/31 恢复状态；独立核验中心 Relay 真实/等价协议的多 viewer command_result 路由、requestId/commandId 映射、同账户多端断线重连、事件 payload 深层结构化 ID 来源，不能仅重复本地 WS/RemoteRelayClient socket 测试。
2. 有可执行生产协议测试则给出 fixture、普通会话正例与 hidden/deleted owner 负例；若中心 Relay 契约/服务不可达，要明示 NOT-RUN 或阻断，并决定 P05 是否仍 PARTIAL。P04-PATH-01 已受控 PASS 但真实 Electron LIVE-06/08、A0 与所有 LIVE 维持未验。
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

**29 号文档 `LIVE-01～LIVE-08` 是唯一集中登记簿。2026-10-13 A0 的实际子集已记 PARTIAL，完整项目没有任何 LIVE 项获最终 PASS；未执行部分不可自动打勾。**

范围包括真实 Pi/工具隔离、扫描 PDF Electron 预览、长轮次续审压缩、真实 ACK/前置准备、跨页继续执行、桌面/Pocket 实时与历史隔离、停止/重启/删案竞态、普通 Agent/批量 A/B/C 全回归。

先前用户明确同意把 P02 的真实 provider/Electron 运行试验延后至**完整后台链路 E2E 统一验收**，只是避免重复搭临时入口，**不是豁免**；首次合并/发布前必须全部 PASS。对需要用户机器才能跑的项目，记录 `NOT-RUN`、详细步骤、预期和证据路径，用户最后统一执行。

## 每一小批次的停机/交付规则

- 动手前核对 PR HEAD / 分支、27/29/30 文档、待办阶段、已有实现和测试；先复用，再小范围改动。不要仅依过去聊天做决定。
- 只做用户点名批次；每批：入口/风险核验 → 小改动 → 针对性负例 + 普通路径回归 → GitHub CI（真实 run id 与 SHA）→ 把完成/未运行/阻断写入**29 号**，同时更新 27/30 与 PR 说明。CI 未完成则记 PENDING，不能编 PASS。
- 每项证据标注「代码提交 SHA vs 当前 HEAD」「受控测试 vs 真实 Electron/模型」「通过/失败/未运行」。普通自动测试不能替代 LIVE 真实操作。
- 不关闭 Draft、不合并；若必须重写核心执行内核、 Session Manager、权限框架或事件总线，先报告不可局部修复的具体证据并停止越界。
- 只有本批完成、文档/PR 跟上且测试证据可信，才向用户提议下一批；**不要未经用户指示自动推进**。

## 新会话入口

阅读 [31｜跨会话恢复与单小批次执行提示词](31-background-session-continuation-prompts.md)。新会话先核对 PR 最新 HEAD、27/29/30/31 与 [32 号 P05 阶段验收](32-p05-stage-acceptance-and-local-gates.md)，确认 P04-TECHDEBT-01 的容量/安全历史仍保留。**优先由拥有权限的维护者应用 Pocket 补丁并提交其 CI，以及提交真实中心路由的 viewer 碰撞/迟到回执证据**；两者不能以当前 43/43 受控测试代替，未完成前 P05 PARTIAL、PR NO-GO。

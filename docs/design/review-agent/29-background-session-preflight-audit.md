# 29｜审核受控后台会话：开工前依赖审计与阻断门禁

> **新会话/新负责人必读**：[30｜P04-S02 后的工程交接快照](30-background-session-handoff.md)、[31｜接手与每批次提示词](31-background-session-continuation-prompts.md)。下一小批次建议 **P04-S03：删除后迟到事件与 tombstone**（随后 P04-S04 枚举剩余桌面 IPC/跨窗口队列）；遗留 tombstone、剩余 IPC 必须继续入账，不能在本轮交接中消失。

> 2026-10-12；初始源码审计基线 `main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`；后续代码与受控探针仅在 Draft PR #21 分支实施。配套 [27 号实施规范](27-background-review-session-proposal.md)、[28 号阶段交付](28-review-stage-delivery-status.md)。**文档中的 PASS 只对所附冻结提交、测试环境与覆盖范围有效；真实 Pi/Electron/Pocket 验收尚未完成，不得据此合并。**

## 结论

**NO-GO（完整功能开发暂不开始），GO（限定范围的技术预验证与设计契约收口）。** 27 号文档已经缩减为“复用既有 Pi + 薄 Main bridge + 普通入口守卫”的 v1 方案；不是新建后台执行框架。 目前足够判断不需要重构 Pi 内核的基本方向，但不够证明后台审核能在所有普通会话入口、权限、停止和重启路径中正确运行。执行器、事件、权限与会话元数据均为共享基础设施；禁止通过大面积改动这些模块来换取隐藏 UI。

目标：前台只呈现“可开始审核 / 审核中 / 需要你处理 / 审核已结束 / 本次审核未完成”及原有业务结果、依据、人工补件/确认；技术步骤和原始 transcript 仅供授权诊断，不暴露给普通用户。审核分析结束 **不代表业务审批通过**。

## 当前验证证据（2026-10-12）

- `apps/electron/src/main/lib/review/review-background-reuse.probe.test.ts`：真实 `runAgent()` **函数体**与真实 V2 案卷/指派/存储连通；使用受控模拟编排器（非真实 Pi 模型），完整提交、部分完成、错误、取消、busy 五项均 **PASS**。不调用 `openSession`，模拟 WebContents 只是运行事件接收器。
- [PR CI #38164270451](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38164270451)，基线 `1e076ea84889d8f29aaff2deffe1078e1c57c1ff`：3714 pass、5 skip、0 fail；类型检查、架构边界、皮肤契约与 Electron main/preload/renderer 构建成功。
- [D2 Scoped Pi CI #38164270457](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38164270457) 与 [Review Baseline CI #38164270496](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38164270496) 均成功。
- **P01 受控契约 PASS，真实 Pi/Electron NOT-RUN；P02 受控工具/接线探针 14/14 PASS，真实模型与 PDF Electron 视觉 NOT-RUN；P03-S01 2/2、S02 6/6、S03 4/4 受控契约 PASS，真实 Main IPC/桌面切页 NOT-RUN；P04-S01 8/8、P04-S02 7/7 受控 PASS，P04 整体仍 PARTIAL；P05–P07 功能验收 NOT-RUN；P08 仅普通 Agent 现有回归基线 PASS，新功能回归 NOT-RUN。** 后续 HEAD 需重新检查 CI，不能把以上数字冒充不同提交的验证结果。

### P02 验证结论：接口已接通，真实执行仍待验收

- **提交与证据**：在 `42fd57fd5d751cbee2416de6cc16ff03b0493415`，[`review-strict-profile.p02.probe.test.ts`](../../../apps/electron/src/main/lib/review/review-strict-profile.p02.probe.test.ts) **14/14 PASS**；[PR CI #38173768799](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38173768799) **SUCCESS**，全仓 **3728 pass / 5 skip / 0 fail**，typecheck / boundaries / skin / Electron main+preload+renderer 构建均成功；[D2 CI #38173768773](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38173768773) 与 [Review Baseline #38173768777](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38173768777) 均成功。
- **最小生产接线（仅 Draft PR #21）**：
  1. `agent-orchestrator.ts` 仅对 `review-operator + triggeredBy=user + getPiReviewBindingForSession` 的活动案卷轮次传 `toolProfile:'review'`，并调用 `selectDirectReviewStrictTools`。普通 Pi 仍走原有 builtin + MCP 注册路径，**本案不将额外 MCP 传给 Adapter**。
  2. `review-strict-pi-tools.ts` 只允许 `review_read_documents`、`review_inspect_document_image`、`review_submit_result` 和 `review_inspect_original`；`CompactContext` 由 Pi Adapter 自带。缺失或重复审核工具 **fail closed**。`auto` 权限对有效案卷指派只放行上述五个工具，禁止技术弹窗挂起，其余全部拒绝。
  3. 原件视觉工具只收 `documentVersionId`，用 V2 当前激活材料、realpath 及案卷根目录验证后，调用原有 `executeAgentPreviewTool`/渲染服务；异步渲染结束后重新验证 `caseId/sessionId/runId/assignmentId`，才登记 V2 预览回执。无任意文件路径入参、跨案读取或过期指派写入。提示词已改用 `review_inspect_original`。
  4. 原有 V2 正文/PNG 图像读取、部分提交、跨轮续审、检查点摘要与空闲压缩都复用且有独立受控探针。
- **验证范围限制**：探针直接执行真实审核工具/V2 持久化与路径授权，Pi 严格工具装配走已存在函数的受控构造测试；预览使用受控渲染器返回假页面图像。**没有在真实 Electron 隐藏 renderer 中打开扫描 PDF、没有真实 provider/model 的 Pi 完整工具调用，也没有跨视图运行。** 因此本轮只能标记 **P02-SAFE-WIRING PASS / P02-LIVE-E2E NOT-RUN**。不能把全仓 CI 通过等同于这些 E2E 成功。
- **剩余 P02 门禁**：使用隔离 `PROFER_CONFIG_DIR` 和虚构合成案卷，实际启动 Pi，确认模型真的收到且只收到受控工具、完成一次正文及扫描 PDF 原件审查、提交/续审/上下文压缩，并验证真实预览结果与材料覆盖账本；按真实 API 费用、凭据授权和可用测试环境执行。若无法运行就继续保留 **BLOCKED**，不能默认为 PASS。
- **回归守护**：此次接线属于现有直接案卷审核的行为变化；虽只有 Draft 分支，仍需真实桌面回放，确认原先的图像、PDF、预览及完成状态没有因为严控工具而失效。普通 Agent/批量 A/B/C 不受本案逻辑分支影响，仍需在最终验收回归中确认。

## 源码事实与影响边界

| 领域 | 已查证的事实 | 必须考虑的影响 |
| --- | --- | --- |
| 执行入口 | `agent-service.ts` 的 `runAgent()`/ `runAgentHeadless()` 共用 `AgentOrchestrator`；`runAgent()` 通过 `createAgentRunOutcomeReporter` 处理 `onRunOutcome`，Headless 没有对等收口；现有 `ipc.ts` `SEND_MESSAGE` 按有效绑定附加 `finishPiReviewRunV2` 回调 | 新 Main 入口不能直接把 send 改成 headless 后丢失 run 终态；必须检验忙碌拒绝、启动失败、正常结束、已完成提交、部分完成、停止、崩溃各分支 |
| 审核启动前步骤 | `review-actions-controller.ts:842+` 的 `runFullReview()` 除启动 Pi 外，还刷新案卷、重新解析旧 HTML/EML 材料、触发逐事项识别；`use-review-actions.ts` 负责模型选择、会话创建、打开普通 Tab、准备运行与轮询 | **v1 只后台化 Pi 运行阶段**：准备流程仍留在现有 Renderer，清楚区分“准备中”和“Pi 已受理”。切换页面时不能声称预处理仍在后台持续；更大范围的后台预处理另议。 |
| 工具权限 | `review-operator` 预设只关闭部分产品能力组；普通 `AgentOrchestrator` 并未给直接审核传 `toolProfile:'review'`。但 `pi-agent-adapter.ts` 已具备此严格档案（不装通用 read/bash/write），`pi-review-ops-tools.ts` 在有效案卷绑定时只注入读文档、核图页、提交结果三个审核工具 | 必须进行 A/B 工具列表与真实案卷提交试验，确认严格档案与直接审核的压缩、跨轮和视觉能力兼容；不能以“UI 不显示技术弹窗”作为权限豁免 |
| 指派与轮次 | `review-agent-assignment.ts` 绑定 `sessionId/turnId/caseId/activeRunId`，`checkAssignment` 拒绝非用户发起的写操作，工具还验证当前有效指派；`agent-orchestrator.ts` 的直接审核绑定也依赖 `triggeredBy='user'` | UI 点击由可信 Main 转换为用户发起轮次，不允许任意普通/远程发送伪装，不能改变 assignment、D2、材料/模板/证据快照准入 |
| 停止语义 | `stopAgentAndWait(sessionId)` 等待运行真正释放；普通停止以 session 为索引，审核 runId/assignmentId 是另一层标识 | 审核取消先按 `caseId+runId+sessionId` 校验当前 run，再停止；必须保证迟到的旧 run 取消不能停止后来复用 session 的新 run |
| 重启恢复 | `run-store-v2.ts` 的 `markStaleRunsInterrupted` 启动时把 queued/running 置为 failed，已存检查点保留；Pi 还有单独 SDK transcript/resume 机制 | “会话可 resume” != “运行自动恢复”。首版建议重启标记中断，用户明确点击继续/重新审核，按版本/证据门禁重走新任务；不提供自动跨进程继续跑 |
| 会话元数据 | `agent-session-manager.ts` 的索引 v1 支持可选字段且已有 revision/快照；通用 `listAgentSessions`、`getAgentSessionMeta`、`searchAgentSessionMessages` 分离不充分；`isVisibleAgentSession` 只按 draft 判断 | 建议加由 Main 设置的可选业务 owner 判别字段，普通旧会话缺省继续可见；会话完整查询保留维护功能，所有普通展示、搜索与按 ID 操作需额外访问策略 |
| 事件与 UI | `useGlobalAgentListeners.ts` 可以通过 session_projection、external_run_started、session_updated、异步重拉、单条 upsert 反复重新插入会话；Tab 持久化与自动导航另有独立路径 | 不能只过滤 LIST_SESSIONS；必须在 UI 数据入口和导航入口均做限制，维护既有竞态/删除墓碑语义 |
| Pocket / 远程 | `remote-service.ts` 既有列表/按 ID 读取/发送/停止/删除/修改模型/问答等命令，又订阅所有 `agentEventBus` 事件、写入重放日志 | 在写入重放日志**之前**过滤内部审核会话；普通远程 API 按 ID fail closed，不因 sessionId 已知而可访问。未来若有审核专用远程能力，应另行授权与建模 |
| 交互请求 | 通用 `permissionService`、`askUserService` 持有 pending promise；普通通知导航到聊天；审核三工具正常不需要普通聊天审批 | 首版可以选择无中途通用交互：审核预设/严格工具集自动执行受控读取，缺信息按审核结果转待补件/人工核实；若确需非白名单工具则拒绝/安全失败。若产品要求保留 AskUser/计划确认，必须另行完成请求投影和响应端到端验证，不可半做 |
| 工作区/删除 | 旧审核会话使用当前 Agent workspaceId；会话被工作区删除时可能级联清理，`deleteCase` 不负责关闭持久 Pi 会话；用户工作区与案卷生命周期不同 | 新后台审核会话要有独立稳定的工作目录/归属策略，避免用户切工作区导致失联；删除案卷时先阻止并等待运行结束，再安全处理历史和会话，不产生孤儿 |
| 模型设置 | `use-review-actions.ts` 的“跟随全局”依赖 Renderer 的 `agentChannelIdAtom/agentModelIdAtom`；`module-settings-store.ts` 只保存审核模型 ID；审核网关还有独立解析逻辑 | Main 必须能确定一致且合法的渠道/模型，冻结每次运行的选择；不能从无状态的主进程随意选择“第一个可用”替换用户默认 |
| 双审核路径 | `pi-review-agent-client.ts` 是批量/语义节点使用的临时 `toolProfile:'review'` Pi transcript，直接案卷审核是另一种持久 session | PR #21 只改直接审核路径；批量 A/B/C 的模型运行、执行门禁与结果不可顺带重构 |

## 开工前必须冻结的设计决策（建议默认值，不视为已验收）

1. **首版任务类型**：只覆盖用户主动点击的单案“开始 / 更新 / 重审 / 停止”，不改批量队列与普通聊天。
2. **中间交互**：建议 v1 不提供通用 Agent 中途问答/权限审批；使用严格审核工具集，缺材料或不清楚的事实写为待补件、待核实；需交互时在本轮结束后的案卷业务动作中处理。若不接受此裁剪，必须先设计完整的异步业务待办/响应/超时/权限身份契约，再开工。
3. **工具隔离**：`toolProfile:'review'` **自身不会过滤上游 customTools**；本 Draft 已在有效 active binding 下用 `selectDirectReviewStrictTools` 严格筛为三案卷工具 + 案卷版号视觉预览，由 Adapter 加 `CompactContext`；Main 权限只放行这五项，其它 MCP/云/预设/Write/Bash/Read 不传入或被拒绝。扫描 PDF 已有路径授权与受控模拟预览，**真实 Electron 全页视觉回放仍是 P02 必要门禁**。
4. **会话生命周期**：专用 Main coordinator 是单一启动、停止和状态拥有者；新会话用由 Main 设置、不可通过普通 IPC 覆盖的 owner，绑定单一案卷；禁止普通 send、queue、fork、move、archive、delete、权限修改等入口对它操作。
5. **会话隐私**：服务端拥有非公开完整查询；普通 UI / Pocket / 消息搜索 / 会话引用 / 归档与统计 / 通知 / 事件重放均不包含内部会话。原始运行 transcript 仍为审计材料保留，但需受授权诊断接口才可取。
6. **前置输入准备**：v1 保留当前 Renderer 驱动的 HTML/EML 解析修复、事项识别、V2 同步；这些属于“准备阶段”，**不**承诺切换页面后还能继续。仅当准备完成、Pi 被 Main 成功受理后，才进入本 PR 的后台运行保障。禁止将完整点击流程伪称全链路后台化。
7. **停止、退出、重启**：按当前 run token 身份做 stop，未获得执行所有权或过时请求不产生终态；关闭页面不中断，应用退出不保证继续执行，重启时中断需用户显式续审；旧版部分完成原 runId 续交仍保留原校验。
8. **设置快照**：Main 的模型、渠道、review preset、工作目录与工具策略从主进程可验证来源读取并冻结到本轮；与旧 UI 的“跟随全局”设置语义一致。渠道/模型不可用时清晰失败，不猜测替代。
9. **历史处理**：首次只对新创建的后台审核会话生效；不批量自动迁移旧普通审核会话，不删除历史 transcript；历史新旧两类结果共存并可读。
10. **删案与清理**：建立会话/运行/assignment 的失效与清理顺序，删除中的案卷不能继续提交结果；审计要求决定是否保留/单独导出历史，不允许误删普通会话。
11. **回滚机制**：新路径通过开发期开关显式启用，回退必须保留运行与案卷状态一致性；开关不构成对权限、身份或工具审查的绕过。

### P02 真实运行验收的延期决定（2026-10-12）

用户选择将 P02 的真实 provider Pi 与 Electron 扫描型 PDF 回放纳入后续完整 Main 后台链路的端到端验收，减少为临时入口建模后再次测试的重复成本。**这属于调整执行顺序而非豁免质量标准。** 当前 P02 的安全接线已测试通过，P02-LIVE-E2E 仍为 **NOT-RUN / BLOCKED FOR MERGE**；可以先做 P03 的小批次受控测试、Main 接线、会话隔离设计，但在首次合并/交付前必须实测真实 Pi 工具清单/凭据、跨页继续执行、扫描 PDF 原件预览回执及安全降级，全部留证。

### P03-S01 明确的握手/生命周期边界

- Renderer 继续在 `review-actions-controller.ts:842+` 完成旧 HTML/EML 修复、逐事项识别和案卷刷新；预处理状态不得描述为“后台 Pi 已受理”。已有 Controller 回归涵盖这两类准备顺序。
- `preparePiReviewRunV2` 在真正执行前就写入 `running` 和 assignment；不可仅以账本状态/IPC 请求送出作为 ACK。主进程现有 `agent-service.ts:runAgent` 内部收到 `onRunOwned` 时才有真实执行所有权，但是此信号尚未向业务 Main Bridge 公开。下一批次只在最小适配层暴露明确受理/拒绝结果，不新增新事件总线或第二套任务存储。
- ACK 拒绝/并发失败：必须以准确 `caseId/sessionId/runId/assignmentId` 收口本轮，并使临时准备中的 running 不悬挂；`onRunOutcome` 单次收尾仍是权威。**未受理不等于模型失败，不得停止已获得所有权的其他 Run。**
- ACK 成功：Main 保持执行 Promise 持有者，React Hook 卸载只影响显示；再次打开页面时通过 V2 账本恢复状态。整个应用退出则依旧遵守 `markStaleRunsInterrupted`。
- P03-S01 受控探针：复用真实 `runAgent` 函数体、模拟延迟 Orchestrator、真实 V2 账本，验证 sender 生命周期退出后收尾与 `running` 先于 `onRunOwned`。在 `3a34522706289f4f7f36d11f965da43ca1a705e0` 上 [PR CI #38175575480](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38175575480) **PASS（P03-S01 2/2，全仓 3730 pass / 5 skip / 0 fail）**；D2 #38175575468、审核基线 #38175575476 通过。**仅证明 API 契约，不是 Electron/真实模型切页 E2E。**

## 先证伪、再开工：最小技术预验证

以下测试按小批次依次推进，使用隔离 `PROFER_CONFIG_DIR` / `PROFER_USER_DATA_DIR` 和合成材料；**实际完成/NOT-RUN 状态以逐条证据和对应提交 SHA 为准**：

| ID | 预验证 | 阻断条件 |
| --- | --- | --- |
| P01 | **契约探针 PASS（5/5）**：真实 `runAgent()` 函数体、V2 run/assignment 在受控模拟编排器里覆盖完整提交、部分完成、失败、取消、busy；**真实 Pi 和 Electron UI NOT-RUN** | 不能据此认定真实模型已跑通；尚须最小真实 Main/Pi 案卷实验检验无 Tab 启动、工具提交及失败收尾 |
| P02 | **SAFE-WIRING PASS / LIVE-E2E BLOCKED**：严格工具白名单、案卷限定预览委托、后验轮次核验、主进程权限闸门和 V2 续审/压缩探针均已通过。**真实模型调用、真实扫描 PDF Electron 渲染未运行** | 在合成案卷的实际 Pi/桌面测试证明前不能宣称 P02 全部完成，尤其不能据受控 renderer 假图片标记真实视觉能力通过 |
| P03 | **S01 2/2、S02 6/6、S03 4/4 受控测试 PASS**：Main 真实执行权 ACK / V2 收尾仍复用；新 session 的可信 `owner:review-case` 原子落盘，普通更新不可伪造；普通桌面列表/单条元数据/发送及关键修改入口开始阻断，Pocket 列表/按 ID 命令和重放前写日志进行最小隔离。**真正审核 IPC、桌面 Tab/搜索/异步投影全覆盖尚未完成** | 未拥有执行权就回复 ACK，普通/远程入口仍能按 ID 读写内部会话，或被普通 UI/重放重新暴露，不得放行 |
| P04 | **S01 8/8、S02 7/7 受控 PASS，P04 整体 PARTIAL**：Main 侧普通全文/引用搜索、归档计数/自动归档、按 ID 常用读取与修改、普通 Stop/进程/任务入口已加 owner 守卫；普通桌面投影、流事件转发/刷新恢复按 owner 抑制；Renderer 列表合并/迟到投影不会复活已知 owner。**S02 已守住旧 Agent Tab 持久化/未知 ID 重开、Preview/Browser 运行期恢复；删除后迟到投影/tombstone 及其他桌面 IPC/跨窗口事件仍待 P04-S03/S04**，真机 LIVE-06 未运行 | 任一普通入口仍能读取/控制 owner，旧 Tab/异步上报重新出现 owner，或破坏普通会话既有回归与 sender 鉴权 |
| P05 | Pocket 列表、按 ID 读取与变更、WS 实时事件、事件重放与远程搜索完全隔离；普通会话仍可使用 | 任一 API 通过内部 sessionId 读取/控制或记录敏感事件到远程重放 |
| P06 | 同一案卷连续两轮运行，旧运行的迟到停止/失败回调不会改写或中止新的运行 | 任何旧 run 影响新 run |
| P07 | app 重启、进程被杀、删除案卷、工作区切换及模型禁用等异常流程 | 永久 running、伪完成、孤儿权限、跨案 transcript |
| P08 | 普通 Agent 回归（会话、权限、预览、停止、fork、子会话、Pocket、离线桌面回放） | 任何现有公共行为因审核专用分支意外改变 |

### P03-S02 Main 受理 ACK 小批次验收记录（2026-10-12）

- **冻结验证 SHA**：`0180a08742210a47f78cbad2f69eff1c8fe298eb`。[`PR CI #38176324329`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38176324329) **SUCCESS**，P03-S02 **6/6 PASS**；全仓 **3736 pass / 5 skip / 0 fail**，typecheck、package boundary、built-in skin surface contract、Electron main/preload/renderer 构建通过；[`D2 CI #38176324267`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38176324267) 与 [审核基线 #38176324308](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38176324308) 均成功。
- **测试**：`review-background-reuse.probe.test.ts` 注入受控 Orchestrator 并执行**真实 `runAgent()` 函数体**，另接 `review-pi-admission.ts` 与真实 V2 运行/指派。验证（1）仅实际拥有 onRunOwned 才 ACK，ACK 后 Main 异步收尾且窗口消失仍能写入运行终态；（2）busy 拒绝只失败当前准备 run，不伪造前台事件；（3）未获执行权的早退不留 running；（4）同 assignment 重复启动不取消首轮；（5）获得所有权后预检失败最终写 failed；（6）非用户来源/轮次不匹配不能启动。
- **生产改动边界**：`agent-service.ts` 仅增加可选第四参数 `onRunOwned`，普通 IPC、普通会话调用保持原状；新增 `review-pi-admission.ts` 仅为 Main 内部工具，可由未来可信审核 IPC 桥接委托现有 `runAgent`；**未接入实际审核 IPC、未创建 owner session，也未验证真实 Electron 切页和真实 provider。**
- **后续小批次**：先完成 owner 的可信持久化与防漏入口守卫，再接专用审核 IPC/受理回执。避免未隔离 owner 时就暴露内部会话给普通列表/远程消息；实际 Main IPC/交互测验统一列在 `LIVE-04/05`，不能凭此自动化结果代签。

### P03-S03 可信归属与基本访问门禁记录（2026-10-12）

- **冻结证据**：代码提交 `759606afec50eeda4943f8c35b7a560e6668e3e2`，[`PR CI #38182548136`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38182548136) **SUCCESS**：P03-S03 **4/4 PASS**，全仓 **3740 pass / 5 skip / 0 fail**，typecheck、package boundaries、skin contract、Electron main/preload/renderer build 均通过；[`D2 #38182548105`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38182548105) 与 [审核基线 #38182548088](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38182548088) 均成功。
- **最小实现**：共享 `AgentSessionMeta.owner?: {kind:'review-case',caseId}`，`isVisibleAgentSession` 对内部 owner 不展示；`agent-session-manager.ts` 的可信 Main 工厂 `createReviewOwnedAgentSession` 将 owner 与会话元数据**同一次索引写入**，普通创建 IPC 不接受 owner 参数；`updateAgentSessionMeta` 明确拒绝注入/修改 owner，原始低层 `getAgentSessionMeta` / `listAgentSessions` 仍保持内部维护能力。
- **第一层常规入口屏障**：`ipc.ts` 的普通 LIST/GET_SESSION_META/SEND_MESSAGE 及 DELETE/UPDATE_MODEL/MOVE 均拦截已有 owner；`remote-service.ts` 的列表和按 `sessionId` 基础命令拒绝内部 owner，runtime context 过滤；事件在 `remoteAgentEventLog.append` **之前**过滤，避免新内部流进入 Pocket 重放日志。
- **负例证据**：[`review-owned-session.p03.test.ts`](../../../apps/electron/src/main/lib/review/review-owned-session.p03.test.ts) 包含 owner 持久化与普通会话差异、运行时恶意 owner 更新被拒、已知 sessionId 的 Pocket 读取/修改/删除被拒、基础实时/重放预过滤。**这不等于全量 Desktop IPC 或 Pocket/Feishu 入口枚举完成**；目前不会创建/启动真正后台 owner session。
- **不可提前放行**：P04 必须继续覆盖桌面全套单条/检索/引用/归档/历史 Tab/异步 session_projection 与流事件重新插入；P05 必须继续覆盖所有 Pocket 命令别名/嵌套 ID/事件队列和重放/远程搜索/Feishu 等远程入口。**LIVE-06 仍 NOT-RUN**；尤其不能把此轮测试的“基本阻断”宣称为全表面隔离。

### 跨会话交接校验（2026-10-12）

- **当前交接基线**：截至制作 30/31 号文档前，Draft PR #21 HEAD 为 `cbdd0a8c86bafc6bff60781de466b0ba963d27e2`，对应 [PR CI #38184974138](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184974138)、[D2 #38184974152](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184974152)、[Review Baseline #38184974119](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184974119) **三项均 SUCCESS**。此后交接文档提交产生更新的 HEAD；这三条历史 CI **不可冒称覆盖文档更新后的 HEAD**。接手者必须重新查询 PR 最新 HEAD 与当次 CI。
- **阶段状态**：P04-S01 与 S02 均有局部受控验证（下节）；P04 整体 PARTIAL。历史 Tab/工作 Tab 恢复的自动化门禁已补；多窗口实机、已删除 owner 的迟到事件/旧快照/tombstone、残余普通桌面 IPC 需 P04-S03/S04 继续分批覆盖。P05 Pocket/Feishu 未完成；实际后台审核 IPC 未启用。**LIVE-01～08 均 NOT-RUN**。
- **交接工作流**：新会话先读 [30｜交接指南](30-background-session-handoff.md)，复制 [31｜首轮提示词](31-background-session-continuation-prompts.md)；每批必须同步本文件及 27/30/PR，记录 PASS/FAIL/NOT-RUN、冻结 SHA 和 CI run ID，不得仅凭用户上一段聊天或历史 CI 放行。

### P04-S01 桌面主路径隔离与异步回填受控验证（2026-10-12）

- **冻结代码 SHA**：`3096ba6fc60c0d95a149f2279d5437a2dc0c548f`。[`PR CI #38184686298`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686298) **SUCCESS**：P04-S01 **8/8 PASS**（Main 3、Renderer 4、普通 Stop 负例 1），全仓 **3748 pass / 5 skip / 0 fail**。TypeScript、包边界、界面契约、Electron main/preload/renderer build 全通过；[`D2 #38184686276`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686276) 和 [审核基线 #38184686293](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38184686293) 均 SUCCESS。
- **源代码改变**：`agent-session-manager.ts` 的消息全文检索、标题/正文引用、归档计数与过期归档排除 review owner；`ipc.ts` 对 GET_SDK_MESSAGES、普通标题/置顶/归档、fork/rewind、浏览器按 session 访问、Stop/Queue、模型/权限/推理档位、后台任务与进程操作等增加 `assertOrdinaryAgentSession`。敏感 IPC 在发送者校验**之后**执行 owner 守卫，不泄漏内部归属检查结果。
- **异步入口**：`agent-session-ui-projection-publisher.ts` 在投影事件上行前排除 owner；`agent-service.ts` 过滤普通桌面事件总线转发、刷新重放和直发 fallback；`renderer/lib/agent-session-list.ts` 防止混合/陈旧列表、optimistic upsert、revision 迟到投影把**已知**内部 owner 再插回普通侧栏。
- **负例与回归**：[`review-desktop-isolation.p04.test.ts`](../../../apps/electron/src/main/lib/review/review-desktop-isolation.p04.test.ts)、[`agent-session-list.test.ts`](../../../apps/electron/src/renderer/lib/agent-session-list.test.ts) 与 [`goal-ipc-routing.test.ts`](../../../apps/electron/src/main/lib/goal-ipc-routing.test.ts)。首轮 PR CI #38184389961 暴露旧 Goal/Stop 源码测试夹具漏注入新守卫，2 项失败；已保留真实安全守卫、修复夹具并增加普通 Stop 不可控制 review owner 的负例，最终冻结版本回归全部通过。
- **剩余 P04-S03/S04**：删除后迟到 session_projection/tombstone、跨窗口通知（尤其删除后元数据消失）、所有其它按 ID 桌面 IPC/目标消息、已排队的迟到事件/运行完成直发，以及多窗口实际行为，须逐路径审计、负例测试和隔离 Electron 回放。**P04 阶段整体不是 PASS，LIVE-06 仍 NOT-RUN**。
- **执行顺序**：先 P04-S03 的删除后迟到事件/tombstone，再 P04-S04 的跨窗口与剩余入口测试，再 P05 Pocket/Feishu 全入口及重放审计；全部隔离覆盖前仍不注册真正的后台审核公共 IPC、不合并 Draft。

### P04-S02 历史 Agent / Preview / Browser Tab 恢复与重新打开（2026-10-12）

- **冻结代码 SHA**：`68ef5128025c61b6c737be9baa82f69aefb042fc`（本轮补写文档会产生新的 HEAD，不能混为一谈）。[PR CI #38186002063](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002063) **SUCCESS**：**7/7 新增受控测试 PASS**，全仓 **3755 pass / 5 skip / 0 fail（426 文件，3760 项）**；Typecheck、包边界、皮肤契约、Electron main/preload/renderer 构建均通过。[D2 #38186002055](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002055) 和 [Review Baseline #38186002095](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38186002095) **SUCCESS**。CI 是代码自动化，不是 Electron 实机录像。
- **入口链路与修复矩阵**：
  1. `renderer/main.tsx:TabStatePersistenceInitializer` 从 `settings.tabState.tabs` 读取旧 Agent Tab；恢复资格在 `renderer/lib/agent-tab-access.ts:selectRestorableAgentTabs` 统一交叉核对 Main `listAgentSessions(true)`、`owner`、ID 结构和可见工作区。旧 splitLayout/group 继续走既有焦点/组合恢复；历史 Preview/Browser 或伪造 Agent ID 不得冒充可持久化会话。已删除/缺失元数据 fail-closed；普通 archived/项目 draft 保留兼容。
  2. `renderer/hooks/useOpenSession.ts` 过去可以在单条元数据未知时先 `openTab` 再读取 Main；现在未知 ID 必须先 `getAgentSessionMeta`（Main 对 review owner 返回 null）确认身份，才打开普通会话；本地已知 review owner 也拒绝。普通归档会话可经过 Main 授权重新打开，读取时使用当前 tab store 防止覆盖期间新增标签。
  3. `renderer/components/diff/preview-opener.ts`、`renderer/lib/browser-tab.ts` 对运行期打开/手动重绑/浏览器状态推送使用已有 `agentSessionsAtom` 里的普通会话资格判断；未知、已删或隐藏 owner 不得靠工作 Tab 再造 Agent 宿主。Main `ipc.ts:assertBrowserSessionAccess` 已有 `assertMainRenderer` 与 `assertOrdinaryAgentSession`，覆盖前台、状态、布局等受管浏览器 IPC；**此处复用现成鉴权，不把纯函数测试冒称为真实跨窗口测试**。
- **针对性测试**：新增 `renderer/lib/agent-tab-access.test.ts` **7 项**，分别覆盖历史含 review owner/旧快照/伪造工作 Tab、隐藏工作区和 ID 不一致、Preview/Browser 本地归属校验、Main 异步返回内部/删除/错 ID/异常、普通已归档会话重新打开、Preview opener 旧事件、Browser reconcile 旧状态恢复及普通正例。原普通 Agent 相关全仓回归通过；没有修改 Pi Adapter、AgentOrchestrator、公共 Session Manager 或通用 Tab 引擎。
- **本批未闭合的风险，后续必须保留**：
  - **P04-S03**：删除 owner 元数据后迟到 `session_projection` / `external_run_started` / stream / SDK completion、旧列表合并、异步权限与标题事件；需使用持久或进程期 tombstone/等效可信阻断，禁止已删除 owner 因缺失元数据而被当作普通会话，补竞态测试。**本批没有实现 tombstone。**
  - **P04-S04**：逐项复核其余普通桌面按 sessionId IPC（含目标任务/引用/浏览器工具边缘入口）、跨窗口重绑/通知/队列与 stale foreground 状态，补 Sender、错窗口、旧上下文负例。Main 受管浏览器已有基础鉴权不等于完成所有桌面入口审计。
  - **LIVE-06 / LIVE-08 实机 NOT-RUN**：用隔离配置和合成案卷实测重启、旧 settings 快照、两个 Electron 窗口切换、运行期 Preview/Browser 迟到推送、普通会话恢复。运行期工作 Tab 对尚未进入 `agentSessionsAtom` 的正常早到事件也会 fail-closed，其兼容性须实机检验并在后续修复（如需）。
- **阶段结论**：仅 **P04-S02 受控门禁 PASS**，P04 全阶段 **PARTIAL**，P05 未推进、公共后台审核 IPC 未开放，LIVE-01～08 八项仍全部 **NOT-RUN**。本轮在 S02 停止。

## 最终统一实机验收清单（必须保留到合并前，当前均 NOT-RUN）

> 此表是**集中补测登记簿**，不要因为推进新的开发批次删除或自动勾选。全部使用隔离的 `PROFER_CONFIG_DIR` / `PROFER_USER_DATA_DIR`、非真实个人资料的合成案卷，固定测试提交 SHA；如涉及付费模型，使用获授权且受控的模型渠道。执行时在本表逐行填写 **PASS/FAIL/NOT-RUN、操作人、日期、测试数据版本、CI/日志/截图/录像链接、异常工单**。只有自动化测试通过而无对应真实操作证据时，本表仍为 NOT-RUN。

| 统一验收编号 | 原阶段 | 必须进行的实机操作 / 核验点 | 目前状态 |
| --- | --- | --- | --- |
| LIVE-01 | P01/P02 | 使用真实 Pi provider 启动合成案卷，工具名单仅包含 `review_read_documents`、`review_inspect_document_image`、`review_submit_result`、`review_inspect_original`、`CompactContext`；尝试或核验普通 Bash/Write/Read/MCP/AskUser 均不可用。审核提交真实正文与 PNG 证据，V2 结果、引用与回执一致 | **NOT-RUN** |
| LIVE-02 | P02 | 用真实扫描型/解析失败 PDF 验证 Electron 隐藏 renderer 的 `review_inspect_original`：按材料版本 ID 翻页/`scope=all`，检查页数、视觉内容、失败/预算警告、覆盖账本和不可伪造引文；跨案版本、任意路径、符号链接越界需拒绝 | **NOT-RUN** |
| LIVE-03 | P02 | 真实 Pi 长轮次分批提交，触发 `CompactContext` 或空闲压缩，同 runId 续交/重新进入后恢复事实、缺项和证据引用，未读材料不能伪装已读取 | **NOT-RUN** |
| LIVE-04 | P03 | 真实 Electron 中验证 HTML/EML 修复与逐事项识别仍在准备阶段；准备结束但尚未获取 `onRunOwned` 时不得显示“后台已受理”；模型预检/忙碌拒绝时不留下孤儿 running，重复点击不影响原 run | **NOT-RUN** |
| LIVE-05 | P03 | 真正收到 Main ACK 后关闭/切换审核工作台、打开其他页面并返回，Pi 继续运行；刷新案卷从 V2 重取状态，完成/部分完成/失败一致，不靠 React Hook 长轮询保持执行 | **NOT-RUN** |
| LIVE-06 | P04/P05 | 内部 review owner 会话对桌面侧栏/搜索/归档/Tab 恢复/异步事件及 Pocket 按 ID 操作、消息检索、WS 实时与重放日志全不可见；旧普通 Agent 会话照常可用 | **NOT-RUN** |
| LIVE-07 | P06/P07 | 同案更新、从头重审、旧轮次迟到取消与异常回调、停止后立即重启、应用重启/强杀、删除案卷、切换工作区和模型停用；无旧 run 误伤新 run、永久 running、幽灵权限或孤儿会话 | **NOT-RUN** |
| LIVE-08 | P08 | 普通 Pi/Claude Agent 发送、权限、工具、预览、停止、fork、Pocket、原批量 A/B/C 审核保持原行为；冻结版 CI（类型、边界、所有单测与构建）及桌面操作日志均可复验 | **NOT-RUN** |

**统一验收记录模板（每项填写）**：`编号=LIVE-XX；结果=NOT-RUN/PASS/FAIL；执行日期=；操作者=；应用提交 SHA=；虚构案卷数据集版本=；步骤和预期=；实际结果=；日志/截图/录像/CI=；缺陷与复测=。`

**全局放行规则**：任何 LIVE-01～08 未 PASS，不能把 P02/P03/E2E 整体标为通过；尤其不能因当前 S02 的 Main 受理契约自动测试通过而省掉 LIVE-04/05。合并需要完整证明和用户明确验收。

## 正式开工门槛（ALL required）

- [ ] 在本文件 §“设计决策”中逐项确定 v1 选择，删除含混的备选说法。
- [ ] P01 的受控契约与 P02 安全接线已具 CI 证据；**P02 live Pi/扫描 PDF E2E 由用户授权移至最终完整后台链路测试**，必须在合并/发布前运行并通过；P03 允许逐小批次推进并独立取得受控证据。失败先调整接线，不能把 NOT-RUN 宣称 PASS。
- [ ] 完成 P04–P08 的入口枚举与针对性断言/负例；普通 Agent 现有行为先有回归基线。
- [ ] 明确 owner 与 run/assignment 权限是不同层次，普通 IPC/Pocket 不能持有未受限后门。
- [ ] 用冻结 SHA 记录测试、类型检查、边界检查、构建与桌面回放结果；未运行即 NOT-RUN。
- [ ] 用户复核并批准“开工门槛已达标”；PR #21 持续 Draft，未经用户验收不合并。

## 与 27 号方案的关系

27 号已改为轻量 v1 规范；本文件记录其实现之前未闭合的跨模块依赖和预验证。**不得把 §0 对“人工请求可处理”的长远目标自动当成 v1 必做**：如选择“单轮无通用中途交互”，就必须在 27 号和 PR 验收中同步标注具体边界，不许宣称已实现通用 AskUser 转接。旧 27 号在“隐藏状态”“迁移旧会话”“全量管理员诊断”等提法均按本文件的实施顺序分阶段验收。

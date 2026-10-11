# 29｜审核受控后台会话：开工前依赖审计与阻断门禁

> 2026-10-12；审计源码基线为测试仓库 `main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`，配套设计 [27 号方案](27-background-review-session-proposal.md)、[28 号阶段交付](28-review-stage-delivery-status.md)。PR #21 仅设计。**本文件属于静态源码审计；没有克隆后跑通本提案的新链路，没有实测新方案，所有开工门禁均为 NOT-RUN。**

## 结论

**NO-GO（完整功能开发暂不开始），GO（限定范围的技术预验证与设计契约收口）。** 27 号文档已经缩减为“复用既有 Pi + 薄 Main bridge + 普通入口守卫”的 v1 方案；不是新建后台执行框架。 目前足够判断不需要重构 Pi 内核的基本方向，但不够证明后台审核能在所有普通会话入口、权限、停止和重启路径中正确运行。执行器、事件、权限与会话元数据均为共享基础设施；禁止通过大面积改动这些模块来换取隐藏 UI。

目标：前台只呈现“可开始审核 / 审核中 / 需要你处理 / 审核已结束 / 本次审核未完成”及原有业务结果、依据、人工补件/确认；技术步骤和原始 transcript 仅供授权诊断，不暴露给普通用户。审核分析结束 **不代表业务审批通过**。

## 当前验证证据（2026-10-12）

- `apps/electron/src/main/lib/review/review-background-reuse.probe.test.ts`：真实 `runAgent()` **函数体**与真实 V2 案卷/指派/存储连通；使用受控模拟编排器（非真实 Pi 模型），完整提交、部分完成、错误、取消、busy 五项均 **PASS**。不调用 `openSession`，模拟 WebContents 只是运行事件接收器。
- [PR CI #38164270451](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38164270451)，基线 `1e076ea84889d8f29aaff2deffe1078e1c57c1ff`：3714 pass、5 skip、0 fail；类型检查、架构边界、皮肤契约与 Electron main/preload/renderer 构建成功。
- [D2 Scoped Pi CI #38164270457](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38164270457) 与 [Review Baseline CI #38164270496](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38164270496) 均成功。
- **P01 单元契约已验证，真实 Pi / Electron 仍 NOT-RUN；P02 受控工具/接线探针 14/14 PASS，主进程白名单及案卷限定原件预览已在本 Draft 分支接通；但真实 Pi 模型轮次与真实扫描 PDF Electron 渲染未运行，**P02 完整 E2E 门禁仍 BLOCKED**；P03–P07 NOT-RUN；P08 仅现有普通 Agent 回归基线 PASS，新功能回归 NOT-RUN。** 后续 HEAD 需重新检查 CI，不能把以上数字冒充不同提交的验证结果。

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
| P03 | **S01 受控契约探针 PASS（2/2）**：预处理由 Renderer 完成；V2 `running` 不是 Pi 受理确认；真实 `onRunOwned` 是受理边界；Main 运行后切走/销毁窗口仍需写入 V2 终态。S02 之后才改桥接/用户入口 | 未确认真实执行权就给前台成功 ACK；运行在页面卸载后被误停，或忙碌拒绝留下孤儿 running |
| P04 | 内部 session 在桌面侧栏、搜索、归档、最近、Tab 恢复、异步 upsert、引用中均不可见；旧普通会话行为保持 | 任一入口重新出现内部会话、破坏普通会话竞态保护 |
| P05 | Pocket 列表、按 ID 读取与变更、WS 实时事件、事件重放与远程搜索完全隔离；普通会话仍可使用 | 任一 API 通过内部 sessionId 读取/控制或记录敏感事件到远程重放 |
| P06 | 同一案卷连续两轮运行，旧运行的迟到停止/失败回调不会改写或中止新的运行 | 任何旧 run 影响新 run |
| P07 | app 重启、进程被杀、删除案卷、工作区切换及模型禁用等异常流程 | 永久 running、伪完成、孤儿权限、跨案 transcript |
| P08 | 普通 Agent 回归（会话、权限、预览、停止、fork、子会话、Pocket、离线桌面回放） | 任何现有公共行为因审核专用分支意外改变 |

## 正式开工门槛（ALL required）

- [ ] 在本文件 §“设计决策”中逐项确定 v1 选择，删除含混的备选说法。
- [ ] P01 的受控契约与 P02 安全接线已具 CI 证据；**P02 live Pi/扫描 PDF E2E 由用户授权移至最终完整后台链路测试**，必须在合并/发布前运行并通过；P03 允许逐小批次推进并独立取得受控证据。失败先调整接线，不能把 NOT-RUN 宣称 PASS。
- [ ] 完成 P04–P08 的入口枚举与针对性断言/负例；普通 Agent 现有行为先有回归基线。
- [ ] 明确 owner 与 run/assignment 权限是不同层次，普通 IPC/Pocket 不能持有未受限后门。
- [ ] 用冻结 SHA 记录测试、类型检查、边界检查、构建与桌面回放结果；未运行即 NOT-RUN。
- [ ] 用户复核并批准“开工门槛已达标”；PR #21 持续 Draft，未经用户验收不合并。

## 与 27 号方案的关系

27 号已改为轻量 v1 规范；本文件记录其实现之前未闭合的跨模块依赖和预验证。**不得把 §0 对“人工请求可处理”的长远目标自动当成 v1 必做**：如选择“单轮无通用中途交互”，就必须在 27 号和 PR 验收中同步标注具体边界，不许宣称已实现通用 AskUser 转接。旧 27 号在“隐藏状态”“迁移旧会话”“全量管理员诊断”等提法均按本文件的实施顺序分阶段验收。

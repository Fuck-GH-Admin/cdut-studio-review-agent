# 29｜审核受控后台会话：开工前依赖审计与阻断门禁

> 2026-10-12；审计源码基线为测试仓库 `main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`，配套设计 [27 号方案](27-background-review-session-proposal.md)、[28 号阶段交付](28-review-stage-delivery-status.md)。PR #21 仅设计。**本文件属于静态源码审计；没有克隆后跑通本提案的新链路，没有实测新方案，所有开工门禁均为 NOT-RUN。**

## 结论

**NO-GO（完整功能开发暂不开始），GO（限定范围的技术预验证与设计契约收口）。** 27 号文档已经缩减为“复用既有 Pi + 薄 Main bridge + 普通入口守卫”的 v1 方案；不是新建后台执行框架。 目前足够判断不需要重构 Pi 内核的基本方向，但不够证明后台审核能在所有普通会话入口、权限、停止和重启路径中正确运行。执行器、事件、权限与会话元数据均为共享基础设施；禁止通过大面积改动这些模块来换取隐藏 UI。

目标：前台只呈现“可开始审核 / 审核中 / 需要你处理 / 审核已结束 / 本次审核未完成”及原有业务结果、依据、人工补件/确认；技术步骤和原始 transcript 仅供授权诊断，不暴露给普通用户。审核分析结束 **不代表业务审批通过**。

## 当前验证证据（2026-10-12）

- `apps/electron/src/main/lib/review/review-background-reuse.probe.test.ts`：真实 `runAgent()` **函数体**与真实 V2 案卷/指派/存储连通；使用受控模拟编排器（非真实 Pi 模型），完整提交、部分完成、错误、取消、busy 五项均 **PASS**。不调用 `openSession`，模拟 WebContents 只是运行事件接收器。
- [PR CI #38164270451](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38164270451)，基线 `1e076ea84889d8f29aaff2deffe1078e1c57c1ff`：3714 pass、5 skip、0 fail；类型检查、架构边界、皮肤契约与 Electron main/preload/renderer 构建成功。
- [D2 Scoped Pi CI #38164270457](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38164270457) 与 [Review Baseline CI #38164270496](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38164270496) 均成功。
- **P01 单元契约已验证，真实 Pi / Electron 仍 NOT-RUN；P02 兼容性探针已有 7/7 PASS（见下），但主进程白名单和扫描 PDF 视觉兜底未接通，**P02 整体 BLOCKED**；P03–P07 NOT-RUN；P08 仅现有普通 Agent 回归基线 PASS，新功能回归 NOT-RUN。** 后续 HEAD 需重新检查 CI，不能把以上数字冒充不同提交的验证结果。

### P02 的已验证兼容性与必须补齐的缺口

- **P02 受控探针（已通过）**：[`review-strict-profile.p02.probe.test.ts`](../../../apps/electron/src/main/lib/review/review-strict-profile.p02.probe.test.ts) 在提交 `ddb312fc81bce68893b8fc0185e4c463b81ffb9a` 通过 **9/9**。覆盖现有 direct binding 仅提供 `review_read_documents`/`review_inspect_document_image`/`review_submit_result` 三项工具、真实 V2 正文/PNG 视觉读取与回执、提交缺项→部分完成→同 runId 续交、拒绝非用户轮次写入、跨案 documentVersionId 不可读取、过期指派不可提交、持久账本压缩摘要、空闲压缩阈值及严格档案构造。[`PR CI #38171785352`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38171785352) **SUCCESS**，3723 pass / 5 skip / 0 fail；它是受控 Bun 工具/ledger 测试，不是 Pi 模型调用或真实 Electron 视觉预览。
- **P02 两项负例已通过**：禁止跨案 documentVersionId 读取，以及换绑续审后旧 assignment 不得提交，均在上面的最新 PR CI 中取得 PASS；这验证了现有业务工具的案卷与轮次绑定，不表示外部普通会话入口已被隔离。
- **已查明的真实接线缺口（必须阻断放行）**：
  1. 现有直接审核走 `AgentOrchestrator` 的普通 `piCustomTools` 构造路径，**没有**给 `PiAgentAdapter` 传入 `toolProfile:'review'`。
  2. Pi Adapter 的 `toolProfile:'review'` 仅去掉默认文件/命令工具和 Proma 产品核心工具；**上游 `customTools` 全部原样包装注册**，不是安全白名单。直接审核的普通 `buildPiBuiltinTools` 可能继续提供 `inspect_preview`、预设/产品/云工具，另有 `buildPiMcpTools`。须先在可信 Main/编排入口从**已验证的 activeReviewBinding** 选出具体允许的工具名称，再允许 strict profile 消费，且通过“恶意 MCP / 普通写入命令未挂载”的负例。不要通过改变所有普通 Agent 的工具注册规则完成本修复。
  3. 现有审核提示词让扫描 PDF/解析失败材料使用 `inspect_preview`；严格三审核工具没有对**不可解析原件视觉页**的等价查看能力。首选复用现有 `inspect_preview` 的案卷原件范围收缩，不提供任意文件系统路径访问；如果不能安全接入，明确标记此类材料待人工核对而不是伪造“已读取/通过”，并在此处记录业务覆盖降级。
  4. `contextPolicy:{kind:'review',caseId,runId}` 已接账本压缩，`autoCompactWhenIdle` 和 `CompactContext` 已存在；需真实 Pi 续审/压缩试验保证不会把旧摘要当证据、不会重复工具或丢失指派。
- **P02 放行标准**：受控工具列表精确可枚举、危险工具拒绝、业务图像读取+扫描件路径边界明确、真实受控 Pi 运行能提交与续审、压缩不伪造审核终态。任一未证明则只能写 PARTIAL/BLOCKED，不能标为 PASS。

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
3. **工具隔离**：P02 证明三审核工具、账本和压缩可以复用，但 `toolProfile:'review'` **不会过滤上游 customTools**。未来在有效 review binding 存在时仅选三项 direct ops + `CompactContext` 与必要的**案卷范围受限**原件视觉预览；禁止带入其他 MCP、云、预设变更、Write/Bash/Read 或普通 Chat 互动工具。需先验证扫描 PDF 的视觉兜底是否兼容，否则明确人工核验降级并取得产品认可。
4. **会话生命周期**：专用 Main coordinator 是单一启动、停止和状态拥有者；新会话用由 Main 设置、不可通过普通 IPC 覆盖的 owner，绑定单一案卷；禁止普通 send、queue、fork、move、archive、delete、权限修改等入口对它操作。
5. **会话隐私**：服务端拥有非公开完整查询；普通 UI / Pocket / 消息搜索 / 会话引用 / 归档与统计 / 通知 / 事件重放均不包含内部会话。原始运行 transcript 仍为审计材料保留，但需受授权诊断接口才可取。
6. **前置输入准备**：v1 保留当前 Renderer 驱动的 HTML/EML 解析修复、事项识别、V2 同步；这些属于“准备阶段”，**不**承诺切换页面后还能继续。仅当准备完成、Pi 被 Main 成功受理后，才进入本 PR 的后台运行保障。禁止将完整点击流程伪称全链路后台化。
7. **停止、退出、重启**：按当前 run token 身份做 stop，未获得执行所有权或过时请求不产生终态；关闭页面不中断，应用退出不保证继续执行，重启时中断需用户显式续审；旧版部分完成原 runId 续交仍保留原校验。
8. **设置快照**：Main 的模型、渠道、review preset、工作目录与工具策略从主进程可验证来源读取并冻结到本轮；与旧 UI 的“跟随全局”设置语义一致。渠道/模型不可用时清晰失败，不猜测替代。
9. **历史处理**：首次只对新创建的后台审核会话生效；不批量自动迁移旧普通审核会话，不删除历史 transcript；历史新旧两类结果共存并可读。
10. **删案与清理**：建立会话/运行/assignment 的失效与清理顺序，删除中的案卷不能继续提交结果；审计要求决定是否保留/单独导出历史，不允许误删普通会话。
11. **回滚机制**：新路径通过开发期开关显式启用，回退必须保留运行与案卷状态一致性；开关不构成对权限、身份或工具审查的绕过。

## 先证伪、再开工：最小技术预验证

这些是实施前必须用隔离 `PROFER_CONFIG_DIR` / `PROFER_USER_DATA_DIR` 和合成材料完成的受控实验。**本审计未运行以下任何一项**：

| ID | 预验证 | 阻断条件 |
| --- | --- | --- |
| P01 | **契约探针 PASS（5/5）**：真实 `runAgent()` 函数体、V2 run/assignment 在受控模拟编排器里覆盖完整提交、部分完成、失败、取消、busy；**真实 Pi 和 Electron UI NOT-RUN** | 不能据此认定真实模型已跑通；尚须最小真实 Main/Pi 案卷实验检验无 Tab 启动、工具提交及失败收尾 |
| P02 | **PARTIAL/BLOCKED**：已有真实 direct tool/V2 ledger 和严格档案受控探针；**并未**在 Orchestrator 实际接入安全白名单，也没有扫描 PDF 案卷限定预览和真实 Pi E2E | 若 `toolProfile:'review'` 被当成上游 customTools 白名单、原件预览越界或无法读取扫描型材料，就不得放行 |
| P03 | **缩减 v1 范围**：预处理结束且 Pi 已受理后，切页/重新进入案卷不影响 Main 的 Pi 运行；同案重复点击、切案、停止/重启与旧结果不能串案 | Pi 已受理后仍依赖页面挂载；重复建 run、串案或过期结果覆盖 |
| P04 | 内部 session 在桌面侧栏、搜索、归档、最近、Tab 恢复、异步 upsert、引用中均不可见；旧普通会话行为保持 | 任一入口重新出现内部会话、破坏普通会话竞态保护 |
| P05 | Pocket 列表、按 ID 读取与变更、WS 实时事件、事件重放与远程搜索完全隔离；普通会话仍可使用 | 任一 API 通过内部 sessionId 读取/控制或记录敏感事件到远程重放 |
| P06 | 同一案卷连续两轮运行，旧运行的迟到停止/失败回调不会改写或中止新的运行 | 任何旧 run 影响新 run |
| P07 | app 重启、进程被杀、删除案卷、工作区切换及模型禁用等异常流程 | 永久 running、伪完成、孤儿权限、跨案 transcript |
| P08 | 普通 Agent 回归（会话、权限、预览、停止、fork、子会话、Pocket、离线桌面回放） | 任何现有公共行为因审核专用分支意外改变 |

## 正式开工门槛（ALL required）

- [ ] 在本文件 §“设计决策”中逐项确定 v1 选择，删除含混的备选说法。
- [ ] P01 已完成受控契约验证，仍需真实 Pi / Electron 最小实验；P02 严格工具档案与 P03 后台运行阶段必须拿到可复验证据。失败先调整接线，不写完整 UI。
- [ ] 完成 P04–P08 的入口枚举与针对性断言/负例；普通 Agent 现有行为先有回归基线。
- [ ] 明确 owner 与 run/assignment 权限是不同层次，普通 IPC/Pocket 不能持有未受限后门。
- [ ] 用冻结 SHA 记录测试、类型检查、边界检查、构建与桌面回放结果；未运行即 NOT-RUN。
- [ ] 用户复核并批准“开工门槛已达标”；PR #21 持续 Draft，未经用户验收不合并。

## 与 27 号方案的关系

27 号已改为轻量 v1 规范；本文件记录其实现之前未闭合的跨模块依赖和预验证。**不得把 §0 对“人工请求可处理”的长远目标自动当成 v1 必做**：如选择“单轮无通用中途交互”，就必须在 27 号和 PR 验收中同步标注具体边界，不许宣称已实现通用 AskUser 转接。旧 27 号在“隐藏状态”“迁移旧会话”“全量管理员诊断”等提法均按本文件的实施顺序分阶段验收。

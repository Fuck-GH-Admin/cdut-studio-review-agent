# 73｜P06 L02-U1｜真实 Pi SDK / Provider 五工具门禁本机独立执行任务书

> **执行，不是再次写计划。** 先读 72、63、55、59～61、71、AGENTS.md、当前主进程权限代码。固定 PR #114 的**最新完整 HEAD/tree**，从其 SHA 创建新独立 worktree 和 `audit/p06-u1-pi-provider-local-r01`。PR #105/#108/#113 与 29 LIVE 台账为只读历史证据，禁止回写。PR #114 保持 Draft。不要运行旧 fixed-port/profile `review-live-launch.py`，除非先逐行审查并改为新隔离配置。

## A. 本机准备与信任边界

1. 先记录 PR #114 / #113 / #110 / #108 / #105 的 HEAD 和真实 main、父子 SHA、工作树 status、`HEAD^{tree}`；下载同一 HEAD 的 PR CI jobs/日志/受控工件，核对 checkout tree，若 HEAD 漂移重新冻结并执行。
2. 全新 `PROFER_CONFIG_DIR`、`PROFER_USER_DATA_DIR`、`piSessionDir`、独立 Xvfb/GUI/CDP 端口、合成工作区与 V2 测试案卷。不复用真实个人 profile、原来的 A/B/C、密钥或学生资料。只在本机**获用户授权**的测试渠道配置最小预算 provider key；如无测试凭证，仍可完成 SDK/IPC 子集，Provider 列 `BLOCKED_ENV`，**严禁伪造**在线调用。
3. 执行 `bun install --frozen-lockfile`、`bun run typecheck`、`bun run check:boundaries`、`bun run electron:build`，及 `bun test --isolate --timeout 30000 apps/electron/src/main/lib/agent-orchestrator-review-tool-gates.p06.test.ts apps/electron/src/main/lib/agent-orchestrator-permission-wiring.p06.test.ts apps/electron/src/main/lib/review/pi-case-review-service.test.ts`，再执行必要的全仓回归。命令逐个留原始 exit/stdout/stderr/SHA-256；失败不能通过放松 expected 或修改生产源悄悄追绿。
4. 审查真正可用的 Pi SDK 初始化和 Main `runAgent`、`canUseTool`、V2 run/assignment、`review_submit_result` 的生产运行点。诊断插桩**仅在私有测试构建**提供结构化工具名、匿名 ID 关系、事件时序与工具执行 receipt hash；不得把审核隐藏 owner 的 sessionId/assignmentId 暴露给 Renderer、远程 Relay 或公共 transcript。私有证据可存完整技术 ID，但公开仓库只允许脱敏/哈希。禁止把关闭权限检查作为“调试方法”。
5. 保证每个生成的合成 Case/Run/Assignment/Turn 都是**新 ID**，A/B/C 仅在本轮通过 S0 才启动。每一个 S0 的失败先停止业务执行，保存首败，创建最小修复单独分支再重验；不得称 S0 PASS。

## B. S0：真正 Electron + Pi SDK + Provider 安全门禁（须独立判词）

| ID | 实际执行步骤 | 可签 PASS 的最低证据 |
| --- | --- | --- |
| PI-M01 | Electron GUI/Renderer 触发新 V2 案卷真实 Main 开始审核；实际 `onRunOwned` ACK。离开页面后 Main 继续运行，回到页面从业务状态重读 | Renderer 收到 ACK、runId 与真实 Main V2 一致；隐藏 owner session/assignment/path **未**出现在 ACK/sidebar/search/普通元数据；离开页面没有取消运行 |
| PI-T01 | 有效 `review-case` owner + `review-operator` preset + 用户真实 turn + 活动 assignment；查看实际 Pi SDK `createAgentSession` 后**可见 tool names**、custom tool wrap 和 Host canUseTool | SDK 仅五名：`review_read_documents`、`review_inspect_document_image`、`review_submit_result`、`review_inspect_original`、`CompactContext`；需见 Main tool profile/绑定签名，SDK 真正列表（而非 WitnessAdapter 模拟）及工具名哈希 |
| PI-T02 | 在审核运行的真实 Pi turn 中尝试 Read/Write/Bash/Edit/AskUser/MCP/inspect_preview 及未经授权的自定义工具（使用合成路径和零副作用请求） | 未被 SDK 暴露，且即使通过单独 Main 回调请求也全部明确 deny；不存在普通权限弹窗或降级通用 profile。不得只依赖模型没有自主调用工具 |
| PI-T03 | 用当前案卷实际材料版本执行 `review_read_documents`，对确实存在的 image block 执行 `review_inspect_document_image`，对有效原件执行 `review_inspect_original`；由**真实在线 Provider**通过正确的 tool_use/tool_result 触发并收到回复。最后用真实 `review_submit_result` 写一条有效检查 | 真实 Provider request ID、模型提供的工具参数、Pi SDK tool call IDs、Main 当前 assignment/session/run/turn 关系、工具执行错误码或回执哈希、原始 block/version/quote、V2 read receipts、结果状态相互一致。扫描 PDF 若不可读，必须回到 `awaiting-confirmation/supplement`，不得伪造文字证据 |
| PI-T04 | 运行中人为 revoke assignment、错案/旧轮次/旧 run/旧版文档、在 `review_inspect_original` await 中间撤权、stop pending/restart 后使用原工具 handle | revoke 时刻后五工具包括 CompactContext 均 deny；旧异步视觉回执不可入新 run；错误的 SourceRef/跨案原件/过期 binding fail closed，重启不能复活。每个反例有 Main 入参校验/错误码及未写入 V2 的权威快照 |
| PI-T05 | 单独**普通 Agent** 正例：有效 Read、配置的授权 MCP/普通只读预览，以及普通会话的适当批准/拒绝流程 | 不因审核隔离误伤普通 Agent；用真实普通 Pi SDK/Host 证明，不拿审核会话的断言代替 |
| PI-T06 | 同一合法案卷经过 `CompactContext` 触发或足额接近压缩临界，再继续安全工具调用 | 实际 Pi SDK 压缩前后 context/turn/工具名证据，且绑定和引用作用域不变化；失效授权不能因压缩/自动继续恢复。若未触发实际压缩，明确 `NOT-RUN`，不能用压缩策略函数通过代替 |

**分档原则**：真实 Main/IPC 可以签 `PI_MAIN_IPC_PASS_SCOPED`；真实 SDK 构造可签 `PI_SDK_REGISTERED_PASS_SCOPED`；只有真实授权 Provider 的实际 tool_use→Main gate→tool execution→V2 receipt 才签 `PI_PROVIDER_PASS_SCOPED`；任一证据缺失不得用别的等级补。若模型没有自行调用全部工具，必须实际记录为 `NOT-RUN`，不能人工虚构协议 transcript。

## C. S1：只有 S0 中 M01/T01–T05 的关键权限正反例通过，才做新的 A/B/C 业务复演

所有案卷使用新合成文本，冻结模板和完整可用的 `documentVersionId + parseRevision + blockId + quote`，非校方真数据，独立 UUID 和真实 Main run：
- **A（预算 100）**：证据充分，期望检查 `compliant`；即便 AI 语义分析完成，不得自动点击人工批准。
- **B（预算 120）**：证据充分，期望 `non-compliant`；来源引用必须准确。
- **C（金额缺失）**：不得填充不存在的 100/120，期望 `awaiting-supplement` 或按模板 `awaiting-confirmation`，不得 `compliant` 或自动审批。

每案记录 case/run/assignment/turn 的隐私脱敏配对哈希、template 与 material hashes、run store 前后、至少一项真实模型产生的工具输入/输出、SourceRef 定位/quote、V2 coverage/queue/stop/terminal、真实 Provider usage 与执行状态。无法满足 S0 不跑 S1，不允许将旧 2026-10-14 档案的 A/B/C 冒充本轮。

## D. 证据提交与结论

在**新的本地分支和独立 Draft PR** 提交：
- `docs/design/review-agent/acceptance/p06-u1-pi-provider-local-r01/README.md`、`candidate-lock.json`、`environment-redacted.json`、`command-ledger.json`、`pi-s0-matrix.json`、`pi-a-b-c-matrix.json`（如未跑须有 `NOT-RUN`）、`provider-tool-receipt-index.json`、`known-failures.json`、`SHA256SUMS`；
- 新正式结果 `docs/design/review-agent/74-p06-l02-u1-pi-provider-local-result-20261018.md`。仅提交不含凭证的结构化摘要、来源哈希、权限状态、可核验真实 exit 和原始私有文件 SHA；真实 Provider 传入 prompt/SDK transcript/密钥/用户路径原文等存受限本地 `0700` 目录，不上传公开 GitHub。
- 显式区分 `STATIC`、`CONTROLLED`、`MAIN_IPC`、`PI_SDK_REGISTERED`、`PI_PROVIDER`、`IO_RECOVERY`。每个项目 PASS/FAIL/BLOCKED_ENV/NOT-RUN；CI、fixture、Provider 回执无原始证据时不能主动签署。
- 单独列出 Office #71 上游移植仍阻断；不复跑已通过的完整 P02/Office，不覆盖旧 PR #105/#108/#113、29 唯一 LIVE，也不签署 `U1_FULL` 或正式 `L02-00 EXIT`。只有 S0 和新 A/B/C 都有真证据且其他需要的门禁核对后才讨论 L02-01。
- 禁止 PR 合并/发布/P07-P08 启动。总体 `P06 PARTIAL / P06-S02 NOT ACCEPTED / MERGE NO-GO` 保持。

## E. 本地 Agent 可直接使用的启动提示

“接手 `Fuck-GH-Admin/cdut-studio-review-agent` 的 PR #114 U1 Pi/provider 真实独立验收。完整执行 `docs/design/review-agent/73-p06-l02-u1-pi-provider-local-task-20261018.md`，先固定 PR #114 最新 HEAD/tree、读取 72/63/55/71/AGENTS.md、独立 profile/worktree/授权测试 provider。S0 真正 Electron/Main/SDK 五工具正反门禁通过前禁止 A/B/C；每个工具保存真实 Pi SDK 注册与 Provider tool-use/receipt 证据。无凭证严格写 BLOCKED_ENV；不能伪造。保留首败日志/哈希和旧 PR 只读，完成独立本地 Draft PR、74 号结果和脱敏证据目录。不得改 main、Gold 或宣布 P06/U1 PASS。” 

# 72｜P06 L02-U1｜五工具与可信 Pi 绑定：远程受控工程（2026-10-18）

> **本阶段仅限远程 CONTROLLED / STATIC，不授予 PI_PROVIDER LIVE、U1 FULL 或 L02-01 准入。**
> 固定父版：PR #113 `3c9d1b63593816b066a0986dcb2b638d2df673eb`；P02 PR #108 已获得 P02_LOCAL_PASS_SCOPED，Office #71 PR #113 已获得 OFFICE71_LOCAL_REAL_PASS_SCOPED，上游移植仍 BLOCKED_UPSTREAM_ACCESS。
> 本轮分支：`audit/p06-l02-u1-pi-provider-gates-r01`，独立 Draft PR #114；每次追加 commit 必须重新核验最终 HEAD/tree 的 CI，不能借历史父版签 PASS。

## 1. 真实生产授权路径（源码锚点）

1. `review/pi-case-review-service.ts`：`preparePiReviewRunV2` 真实创建 V2 run 和受限 assignment；`getPiReviewBindingForSession` 只对活动且非中断 run 提供 `assignmentId/sessionId/caseId/runId`。
2. `agent-session-manager.ts`：`owner.kind='review-case'` 是隐藏内部会话身份，**身份不自动代表权限**。
3. `agent-orchestrator.ts`：`activePiReviewBinding` 需 runtime=Pi、preset=review-operator、trigger=user 与活动绑定；缺任何项即在调用 Adapter 之前失败，不得降级为普通 customTools/MCP。
4. `review/review-strict-pi-tools.ts`：从 builtin 中精确选择 `review_read_documents`、`review_inspect_document_image`、`review_submit_result` 并绑定 `review_inspect_original`；原件读取校验案卷材料版本、真实路径、异步返回后的当前 binding。Main `canUseTool` 另只允许这四项及 `CompactContext`，每次确认最新 binding。
5. `adapters/pi-agent-adapter.ts`：审核 profile 不注册通用读写 Bash/Web/MCP；SDK 的 `CompactContext` 由 Adapter 追加，而不是 Main customTools；Adapter 自身不负责过滤传入的 customTools，因此 Main 的精确名单和绑定是强制门禁。
6. `review/pi-case-review-service.ts` 的审核结果提交仍由 SourceRef`documentVersionId/blockId/quote`、案卷/run/指派验证保护；普通 Office `fN`、RAG 锚点、仅截图不足以成为正式审核依据。

## 2. 本轮受控工程实测范围

新增 `apps/electron/src/main/lib/agent-orchestrator-review-tool-gates.p06.test.ts`：
- 不是仅构造假的 binding，而是真实写入并关联**合成已发布模板→V2 案卷→审核运行→审核运行 assignment→内部 owner**；测试通过真实 `AgentOrchestrator.sendMessage` 到 `PiAgentQueryOptions` 交接。
- 有效 owner 必须 `toolProfile='review'`、contextPolicy 的 `caseId/runId` 匹配；传给 Pi 的 `customTools` **恰为四项**，禁止把 `CompactContext` 当作重复 customTool；Host `canUseTool` 对第五项仍授权。
- 权限模式即使 `bypassPermissions`，仍拒绝 Read/Write/Bash/Edit/AskUser/MCP/inspect_preview/其他 review 控制类工具；对真实 assignment 执行 revoke 后上述五项同样拒绝，原件工具也错误退出；无授权 owner/非用户轮次在 adapter 前拒绝。
- 普通非 owner 会话作为正例，保留正常 Read 通路和一般工具配置，不受审核五工具白名单误伤。
- **见证 Adapter 只是无 provider 的插桩，不会调用实际 Pi SDK `createAgentSession` 或模型 API**。即使全部 PASS，也只能写 `PI_MAIN_CONTROLLED_PASS`，真实 SDK 注册和 provider 工具回执明确 `NOT-RUN`。

与此前 `agent-orchestrator-permission-wiring.p06.test.ts`、`review-pi-*`、owner/permission/SourceRef 受控测试配合，必须在**最终固定 HEAD**通过 typecheck、Main/Preload/Renderer build、全部回归、无安全门禁意外漂移。测试首败不得覆盖；若生产代码改动，单独给出原因、最小 diff 和新 CI。

## 3. 严格不作为验收凭据的项目

- 不把 WitnessAdapter 的 `options.customTools` 视为真实 Pi SDK 已注册的工具列表；后者必须由本机实际 SDK session creation 探针观测。
- 不把模拟 `canUseTool('review_submit_result')` 允许视为 Provider 已提交；需要真实模型的 `tool_use`、Main 授权决策、工具 execute/receipt 与持久 V2 变更一致。
- 不把 `AgentOrchestrator.sendMessage` 函数级通过视为 Main IPC 点击运行已 ACK 或 Renderer 离开后后台仍继续。
- 不把旧 PR #105 原文件/旧 P02 或 Office 验收结论当作新 Pi 权限证据。
- 缺合法 provider key 或外网时 `BLOCKED_ENV`，禁止以固定响应伪造 live；不允许把 secret 写入测试日志、Git、PR 或 Actions artifact。
- `P06 PARTIAL / P06-S02 NOT ACCEPTED / U1 FULL NOT ACCEPTED / L02-00 NOT ACCEPTED / L02-01 NOT ADMITTED / MERGE NO-GO` 不变。O71 上游移植单独处理，P07/P08 不启动。

**下一步**：在新独立合成 profile 执行 [73 号本地真正 SDK+Provider 任务书](73-p06-l02-u1-pi-provider-local-task-20261018.md)，先 S0 再决定是否运行新 A/B/C；完整真实恢复 I/O 在独立阶段处理。

# Dev-A A4-R10｜锁定 Pi 0.86.1 Provider HTTP 请求与回执证据、受限接线设计、Dev-C CR 提案

> **权限**：Dev-A 自有技术工程说明，随 Draft PR #143 提交；不是 Dev-C 决议，不代表 #145 共同规则已修改。**C 的共享业务裁决优先。**
>
> **日期**：2026-10-19；上一工程输入 `3bcd229c0d9fa5485206dc5e82d05f9ea80f9c5a`；最终工程 SHA 请以 #143 实时 HEAD 为准，所有测试状态只认可同 SHA。

## 1. 不再根据最新版 Pi 文档猜测：精确的 SDK 来源

- 项目 `apps/electron/package.json` 和根 `package.json` 的 `patchedDependencies` / `overrides` 均**精确锁定** `@earendil-works/pi-coding-agent@0.86.1`、`pi-agent-core@0.86.1`、`pi-ai@0.86.1`；工作区同时有 `patches/@earendil-works%2Fpi-coding-agent@0.86.1.patch` 和 `...pi-ai@0.86.1.patch`。
- 上游不可浮动来源：[earendil-works/pi v0.86.1](https://github.com/earendil-works/pi/tree/v0.86.1)，Git tag commit `13cbf77df2396303013a41646bcfa77b4271ae56`。这是该仓库的公开 Git tag，不等于我们已核验安装后 dist 的最终哈希；执行目标机仍必须锁定已安装 `dist`、Bun patch 和真实包版本。
- `packages/coding-agent/src/index.ts` 确实 export `AgentSession`；`core/agent-session.ts` 暴露 `readonly agent:Agent`；`packages/agent/src/agent.ts` **public `streamFunction:StreamFn`**。
- `packages/coding-agent/src/core/sdk.ts` 在创建 Agent 时建立 `streamFn: (model,context,options) => modelRuntime.streamSimple(model,context,buildRequestOptions(...))`。源码 `buildRequestOptions` 包含 `maxRetries` 和 Provider 选项；`packages/agent/src/agent-loop.ts` 的 `streamAssistantResponse` 每次实际调用 `streamFunction`，随后才有 assistant 事件、`turn_end`。
- `packages/ai/src/types.ts` 的 `ProviderRequestOptions` 支持 `fetch`、`signal`、`onResponse`、`maxRetries`。**这些能力本身不提供真实 Provider request receipt**。
- `packages/ai/src/api/openai-completions.ts` 和 `openai-responses.ts` 确实将 `fetch` 注入 OpenAI SDK；SDK 内部 `maxRetries:0`，但外面 `retryProviderRequest(... maxRetries:options.maxRetries)`；`onResponse` 只在拿到一次 HTTP response 时调用，不证明流内容完成。源码中的这层外部 retry 是 R10 限定 `maxRetries:0` 并钉住单次 `fetch` 的原因。
- `packages/ai/src/utils/provider-retry.ts` 的 `retryProviderRequest` 在有配置时会重新调用 Provider request callback，可能造成**新的物理请求**；单纯观察 `assistant.uuid` / `agent_end` / `SDKMessage.result.success` 不能证明其次数。
- 项目实际 `apps/electron/src/main/lib/adapters/pi-agent-adapter.ts` 已在第约 2634 行 `sdk.createAgentSession(...)` 后取得 `session.agent`，第约 2704–2730 行包了一层 `session.agent.streamFunction`，包含 `sanitizeContextForInference`、`runWithPiRequestProxy`；第约 3060 行 `session.prompt`。所以 **R10 的预期技术注入点是真正的 Pi Agent `streamFunction` 而非 Renderer/IPCs / 被动 harness**。集成时不能破坏既有 proxy/payload sanitization，也不能将 V2 全局 agent 硬改成 V3 新逻辑。

## 2. A-owned 实际代码（不是纯文字）

- 新增 `apps/electron/src/main/lib/review/review-v3-pi-http-provider-engine.ts`：`V3APiHttpSingleRequestEngine`，实现 A4-R07 `V3ANativeSingleRequestEngine`，通过 **已经公开的 Pi SDK `AgentSession.agent.streamFunction`** 精确替换新建 review-only SDK Agent 的流函数，完成后恢复原函数并注销事件订阅。仅允许一次 `streamFunction` 调用、一次实际 `fetch`、一个成功 `turn_end`；Main 可发 AbortSignal，贯通 Pi stream/HTTP fetch。
- 支持范围严格限定为 **`openai-completions` 或 `openai-responses` 的 HTTPS + SSE**，不得默认为 Anthropic、Google、Bedrock、Pi Messages、WebSocket、local Ollama 或其他传输已可靠接入。只允许 Main 固定的 HTTPS Origin；fetch 对不同 origin 拒绝，禁透明 redirect/重试保证须在 Gate E 另审。SDK 上游预配置不透明 `options.fetch` 直接拒绝，不允许把可能暗中重试的 wrapper 当一次发包。
- 实际 HTTP `Response.headers['x-request-id']` 由可信 HTTPS Provider 返回时，才建立请求身份；随后必须观察同一 Pi session 的成功 `turn_end` 和 `session.prompt` 结束，才向 A4-R07 witness 报 `requestFinished`。**HTTP request ID 只证明一次响应来自该 HTTPS 通道，不能独立证明完整的物理 Provider 计算。组合证明受限于特定 Provider/SDK 的一请求 SSE 合同。** 一旦缺 header、HTTP 失败、timeout、流错误、两次 fetch、两个 streamFn、受信 origin 不符、Main 取消、Pi session 被复用 → `RECOVERY_REQUIRED`，不写 24-turn 或技术终态。
- Main 可以注入明示审过的 `transportFetch`（仅供确定受信输送或离线测试），实际工程集成优先直接 `globalThis.fetch`；**这不是对任意被注入的复杂 fetch 实现无内部重试的保证**。若运维代理可在 fetch 以下透明 retry，需要物理网络 trace 与 Provider 日志 Gate E。
- A-only 主单轮拼装：`new V3APhysicalSDKTurnPort(new V3APiHttpSingleRequestEngine(factory))` → `new V3ASDKTurnBridge(owners,turns,proposals,port,dispatch)`。A4 durable SDK `claim` 先于 `factory.create/session.prompt`；可信收据只可扣技术 turn ledger，不是 C2 business `Run/Check/Decision` ACK。
- 已新增 `review-v3-pi-http-provider-engine.test.ts` 定向合成 HTTP request/response 测试（含真实已安装 `Agent` export 类型/赋值探针），并在 `review-v3-main-sdk-turn-bridge.test.ts` 添加 `A4-R10-16` A3/A4 24-turn + HTTP request ID 联合负例/正例。**代码提交不等于真实运行**。上游 Pi 0.86.1 实际包和应用运行中的 Pi session 尚未由这一会话执行，不可叫 Gate E PASS。

## 3. 开发/接线阻断与 Dev-C 必须明确的授权请求（未获批）

**CR-A-PI-HTTP-WITNESS-R01：请求 C 决定后续真实生产接线（仅提案，并非批准）**

1. C 明确批准独立 V3 Pi SDK session factory 的 Main 内部注入点，最小函数级 hunk 由 C 或获租约的 I 编写，**不接受 Renderer 提供 principal / run / trustedOrigin / fetch / HTTP response**。factory 应只使用当前 C 授权 Run+Plan+Source、Main owner grant 和 ModelRuntime 拿到 provider URL。
2. 若在 `adapters/pi-agent-adapter.ts` 的 session 创建区复用现有 SDK runtime，必须确认该 session 为 review V3 **新建、独占、一次性**，不得复用已有用户 Agent/后台隐藏会话的私有凭据；且先于 `prompt` 安装 R10 witness。现有第约 2704 行 Pi `runWithPiRequestProxy` 与净化管道必须保留，避免直接替换成 `Models.streamSimple` 而绕过已有策略。
3. **优先让 I 在 I-owned 新 `review-v3-integration-i*-*.ts` 中做胶水**，由 C 对 Main handler / 正式 SDK factory 进行逐 hunk 授权或自有开发；目前 I 的 Main-only 只读 lease 仍 `CONDITIONAL_NOT_ACTIVE`，没有任何正式 Main 写入权。A 仅提供 A-owned adapter API/测试，不能先改共享 Pi adapter 或 C 主线以求表面通路。
4. 正式接线前要求目标机 `Gate O PASS`：冻结最新 #143 SHA、Bun 1.4.0/Node 22、`bun install --frozen-lockfile`、typecheck/boundaries/skin/三端 build、全量 Bun + A R10 专项；验收证据必须包含第一失败、原始堆栈、patch 后 SDK dist 版本、进程/请求 ID 的脱敏对应关系。
5. 实际 `Gate E` 必须有真正 Provider 授权和实际 HTTPS/SSE 请求，在至少一个配置 Provider 上核实请求数=1、`x-request-id` 唯一、SSE 成功/断流/超时、Pi native retry=0、图片降级重新 `query` 被拦、Main Abort 不能重派、C2 技术候选与正式业务 ACK 隔离。**不代表所有厂商都会返回 `x-request-id`**，未证明的 API 继续 `BLOCKED_NATIVE_RECEIPT_API`。
6. 真正业务 `ReadReceipt/Check/Run` durable ACK/Case 事务由 Dev-C 独占；C2-R00 目前仅技术候选账，不允许 A/I 隐性提升为正式 PASS。

## 4. Gate 状态和后续顺序

- `Gate O`：R10 最新 HEAD 的三个 GitHub Actions 运行状态以实时查询为准；当前本工具执行环境无 Bun 和 GitHub DNS clone，**未跑源码 typecheck/test/build**，不可把合成测试数写为 PASS。
- `Gate E=NOT_RUN`；`Gate L=BLOCKED_NO_AUTH`；`Gate P=NOT_RUN`；`C_ACCEPTED_FOR_ENGINEERING=NO`。
- 下一阶段 `A4-R11` 优先验证**本机安装后的 Pi 0.86.1 dist 与 HTTP transport 的真实运行差分**，集中修复 A-owned first failure，若不暴露完整流/回执则关闭本 API 为 `BLOCKED`，不要再叠通用 mock。C/I 有新签 Main 范围才做 Main 业务路由，I1 老 A source-lock 仍不可自动升级。

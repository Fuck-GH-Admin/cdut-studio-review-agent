# Dev-A A4-R12｜Pi 0.86.1 SDK 会话销毁/未知物理 Provider 状态可靠性工程

> Dev-A-only 技术候选文档，和 C/I 共享协议中的 A `STATUS` 配合。**此文档不授权修改 C-owned Main IPC/Preload/Case/Run/Outbox，也不表示真实外部 Provider 已连接。**

## 1. 固定来源与先决工程 Gate O

- 上一工程检查点是 `93f78e4efe0c17501b338c15989b9e419ddb717a`，#143 Draft PR。**其完整 Gate O 已得到同一 40 位 SHA 的 3 个成功 GitHub workflow：PR CI [39291662991](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39291662991)、D2 [39291663560](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39291663560)、Review Baseline [39291663088](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39291663088)。**
- 原 24 TypeScript 首败已经解决；PR CI 完成 typecheck/boundaries/skin/build，全量 Bun **4134 PASS/5 SKIP/0 FAIL**。测试覆盖 471 个文件。
- **R12 是独立新 SHA**，R11 的成功不自动延伸成 R12 Gate O。R12 源码及本文件提交后必须重新锁定最新 #143 SHA 并真实运行所有 CI。

## 2. 实际上游 SDK 的行为证据

锁定的 `@earendil-works/pi-coding-agent 0.86.1` [upstream tag](https://github.com/earendil-works/pi/tree/v0.86.1) commit `13cbf77df2396303013a41646bcfa77b4271ae56`：

- `packages/coding-agent/src/core/agent-session.ts::AgentSession.dispose()`（源码约 917 行）是公开同步方法，实际执行 `abortRetry()` / `abortCompaction()` / `abortBranchSummary()` / `abortBash()` / `agent.abort()`，随后使扩展 context 失效、断开 Agent 订阅、取消 cache warmers、清理 session-scoped 资源。
- `AgentSession.abort()`（约 1759 行）本身会等待 `waitForIdle()`，**不是** `dispose()` 的前提；`dispose()` 是及时撤销/销毁，不能单凭它证明远端 Provider 已终止或服务器未处理超时请求。
- Pi 的 `AgentSession.agent.streamFunction` 是可覆盖方法。R10 仅在成功/失败后恢复流函数+事件订阅，但如果工厂创建的 session 未销毁，仍可能携带 native retry / compaction / cache warming，造成监控窗结束后的 Provider 请求。这与 V3 单物理派发回执边界不相容。

## 3. 本批 A-owned 真实生产代码

- `review-v3-pi-http-provider-engine.ts` 的 `PiSession` 由原 `Pick<AgentSession,'agent'|'prompt'|'subscribe'>` 增为**必需公开 `dispose`**，缺该方法即不接收工厂产物。
- 一次 SDK `prompt` 流结束后，`finally` 必须 `dispose()` 真正停止原 Pi 会话，再注销 R10 witness、恢复原流函数；即使 HTTP Provider 抛错、无 request ID、Main Abort 期间出错，也不能在已见证的单次请求之后留活 Agent。
- HTTP HTTPS Origin 非法、输入 prompt 不合法、Main AbortSignal 在 `factory.create` 期间已取消等**派发前**状态，主动 `dispose` 刚创建的新 SDK session 并拒止，而不是让其积压后台工作。
- 对已运行中或曾被 `WeakSet` 消费的**其他** SDK Session，仅拒绝复用，不主动将其销毁：避免新 attempt 干预仍可能运行的旧请求。Main A4 持久 `in-flight` intent 仍保留，未取得可信 SDK/native 物理回执前不准再派发。
- 范围严格限于 A-owned `review-v3-pi-http-provider-engine.ts` 和其定向测试/技术 A4 bridge 合成 fixture。没有修改 `adapters/pi-agent-adapter.ts`、C `review-ipc.ts` / Preload / shared DTO / 正式业务 ACK。

## 4. 新增回归与下一 Gate

- `review-v3-pi-http-provider-engine.test.ts` 新增 `R12-01` 成功请求后的 dispose、`R12-02` Provider streaming failure 的 dispose、`R12-03` Main Abort 触发的 dispose、`R12-04` HTTPS origin 预检拒绝时主动 dispose、`R12-05` SDK factory 创建过程中取消时的 dispose。既有 R10 用例依旧检查流函数恢复、事件反注册、重试/HTTP request ID fail-closed。
- `review-v3-main-sdk-turn-bridge.test.ts::A4-R10-16` 补充一次 HTTP 请求成功记录到 A4 durable dispatch / A3 24-turn 后 session 已 dispose 的联结证明。
- 以上只是**合成 HTTPS fetch + SDK API 形状测试源码**；尚未声明 R12 的 Bun/类型检查/真实 Pi Session 构造或外部 HTTPS/SSE 请求结果。
- Gate O：对 R12 最终精确 SHA 跑 PR CI + D2 + Baseline，三项全部成功后才可标 `GATE_O_PASS_EXACT_SHA`。任何新的第一首败回到本分支修复，新 SHA 重验。
- Gate E：需 C 明示 `CR-A-PI-HTTP-WITNESS-R01` 及真实 Main factory lease，并在真实授权 Provider/TLS/SSE 下核验 request count、native `x-request-id`、透明 Proxy retry、真实 stream/abort、dispose 后无续发请求和 PID 死亡后 pending intent。**无有效 Provider 能力、政策或 C authorization 时继续 `BLOCKED`；不要伪造网络收据。** Gate L=`BLOCKED_NO_AUTH`，Gate P=`NOT_RUN`。

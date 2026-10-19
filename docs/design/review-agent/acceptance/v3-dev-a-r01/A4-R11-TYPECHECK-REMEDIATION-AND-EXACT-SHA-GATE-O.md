# Dev-A A4-R11｜#143 TypeScript 首败修复与精确 SHA Gate O 证据账

> Dev-A 专属工程日志。当前优先级为 **TypeScript 恢复 + 精确源码 SHA Gate O**，暂停进一步真实 Provider/恢复语义扩展；未获 C 逐 hunk 授权，不得触及 C-owned 正式 Main/Preload/shared/Case/Run/Outbox。此文件不是 C 的批准签署，也不是一份假造的 CI 测试结果。

## 1. 真实失败输入（不可和新代码混算）

- 固定失败源码：#143 `53af44752a16369cbaba3071b2a223321087986c`。
- PR CI workflow **39277833762**，job **118146558559**：`Install dependencies = SUCCESS`，`Typecheck workspace = FAILURE`，后续 boundaries/skin/build/full tests **SKIPPED**。日志中 `@profer/electron` 共 **24 条 TypeScript error**。
- D2 Scoped Pi Review workflow **39277833713**，job **118146557300**：`Typecheck all workspaces = FAILURE`，后续 D2 专项/回归 **SKIPPED**；与 PR CI 同 24 条类型报错。
- Review Baseline workflow **39277833670**，job **118146555484**：`Focused baseline regressions = SUCCESS`。这是历史 SHA 的 **baseline-only** 结果，不等于全量 Gate O，更不证明新 SHA。
- 源日志必须通过 GitHub workflow/job 原始日志核验，不能依赖只显示绿色/红色状态的 PR UI。

## 2. 已按日志修复的 24 条类型问题（代码真实已提交）

| 源码范围 | 首个报错 / 归因 | 修复策略 | 保留的安全约束 |
|---|---|---|---|
| `review-v3-execution-proposal-producer.ts` | TS2339/TS18048 indexed `records[i]` 可 undefined；`terminalCandidate()` 返回值可能 undefined | 先明确 `if(!proposal) return mismatch(...)`；异常 terminal 直接 `return mismatch(...)` | 持久链任何缺页、哈希错或伪 terminal 仍 `RECOVERY_REQUIRED`；没有 `!` 偷放坏记录 |
| `review-v3-execution-proposal-producer.test.ts` | TS2769 candidate[0] indexed optional | 显式 `toBeDefined()` 后对已验证的候选 `candidate[0]!` 作原值对等比较 | 原 EIO 后 replay 只一次、不伪造 ACK 的断言保留 |
| `review-v3-sdk-dispatch-fence.ts` | TS2322 对 last 展开后 `id/grantId` 变 optional | invalid current claim 分支显式 `return reject(...)`，使 `last` 在 settled/late-denied 分支被正确收窄 | 未决 intent/错 grant/错 dispatch 不得 settle，始终 fail closed |
| `review-v3-sdk-physical-turn-port.ts` | TS18048 回调异步赋值的 `result` 不能靠同步控制流自动证明 | 在 `await engine.invoke()` 后使用显式 union 观测变量 + 非空 fail-closed 检查 | 无 native receipt、不匹配/重复、abort 不能写技术 turn |
| `review-v3-pi-http-provider-engine.ts` | TS2741 Bun `typeof fetch` 要求 `preconnect`；TS2322 异步赋值的 response ID | 单独定义 callable-only Main transport；受守卫的 SDK fetch 保持 Bun fetch 完整结构并禁止不受控 preconnect；`observedId` 异步 union 非空拒止 | HTTPS/SSE/一次 fetch/主域固定/无 redirect/真实 response `x-request-id` 不被制造 |
| `review-v3-pi-http-provider-engine.test.ts` | TS2345 test opaque fetch 函数缺 `preconnect`、TS7006 参数隐式 any、工厂类型不满足 | opaque 测试使用实际完整 `globalThis.fetch` 但仍在执行前拒止；对 factory 与 callable-only Main transport 显式定型 | 没有删掉“隐藏 retry fetch 必须拒绝”的负例，也没有放宽静态检查 |
| `review-v3-main-sdk-turn-bridge.test.ts` | TS2322 测试 `transportFetch` 与 Bun augmented `typeof fetch` 不兼容 | 生产端注入类型调整为 Main callable-only HTTP transport，使原联合测试遵循相同合同 | A3 24 turn / A4 durable claim/settle / fake Provider 分层未改变 |

**修复纪律**：没有修改 `packages/shared/**`、`review-ipc.ts`、Preload 或 C2 正式 writer。没有通过注释掉测试、降低 tsconfig strictness、粗暴关闭 `noUncheckedIndexedAccess` 或伪造 Provider receipt 来使 typecheck “看起来通过”。

## 3. 本轮 exact-SHA Gate O 验证定义

当前修复分支：`feat/v3-dev-a-pi-execution-r01`，PR #143，新的真实 `head_sha` 必须在每次完成源码提交后重新锁定。只有**同一个最终 40 位 SHA** 的以下实际结果可以用于签收：

1. `bun install --frozen-lockfile` + `bun run typecheck`（包括 `@profer/electron`）全部 exit 0。
2. package boundaries + skin contract + Main/Preload/Renderer builds 全部真实 PASS。
3. PR CI 的全量 Bun 单元/回归，D2 Pi专项，以及 Baseline 3 套工作流对**同一 SHA**全部完成成功；保存每套 `runId`/`jobId` 和 exact SHA。
4. 单独确认 `review-v3-execution-proposal-producer.test.ts`、`review-v3-sdk-physical-turn-port.test.ts`、`review-v3-sdk-dispatch-crashpid.test.ts`、`review-v3-pi-http-provider-engine.test.ts`、`review-v3-main-sdk-turn-bridge.test.ts` 和既有 Owner 测试真实执行，而非 workflow step 因 TypeScript 失败显示 SKIPPED。
5. 如 Actions 被取消/runner 无法分配：只可记 `GATE_O_NOT_ATTESTED` 或 `BLOCKED_ENV`；若本机独立通过则单独标 `LOCAL_GATE_O_PASS`，不得写 Github CI success。新首败保留原始堆栈/退出码并修在 A-owned 来源，再以新 SHA 重跑。

## 4. Gate E/L/P 与业务边界

- Gate O 是静态编译、构建和合成/系统级回归验收，**不等于** Gate E 真 Electron + Provider/TLS/SSE + SDK physical request 发包验收。
- 真实 Pi SDK 0.86.1 `streamFunction` + Main HTTPS 限定 engine 在 R10 是 A-owned 技术源码，C/I production Main factory CR 仍 `NOT_APPROVED`；不允许从 `assistant/agent_end` 或本地 mock response 凭空生成可信 request receipt。
- C2-R00 只有技术候选账，正式 durable ReviewRun/ReadReceipt/Check ACK 依然属 C；Gate L=`BLOCKED_NO_AUTH`，Gate P=`NOT_RUN`。
- **顺序**：先修此文的第一失败 → 收到同 SHA CI Gate O → 才推进真实 SDK physical receipt / Provider 取消 / 跨 PID worker recovery 的工程及 Gate E，避免再次带着编译失败扩功能。

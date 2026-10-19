# Dev-A A4-R15｜SSE 完整终态帧与 I3 有界技术来源交付

> Dev-A owner-only engineering, 2026-10-20. 不是 C-owned 业务合同，不是 Main/Provider 生产授权，也不是 I3 的合并或 Gate E 签收。

## 1. 本批固定既有绿色输入

- **A R14 exact prior Gate O**: `56f450f3c783299ceb0a6489bf855a1ba8f0a913`; PR CI `39304172035` 4150 PASS/5 SKIP/0 FAIL; D2 `39304172120`, Baseline `39304172175` 同一 SHA SUCCESS。R14 首败 `e6c4bc...` 被保留并在 R14 修复，不继承其失败。
- **C R03 fixed green source**: `e87f75e044becc35c28292cc835a2c2ec41df48a`; C PR #144 五项完整 Gate O SUCCESS，含 C-only inert `review-v3-main-pi-factory.ts` 与 `review-v3-main-host-receipt-registry.ts`。
- **I2 historic signed source**: I2 PR #148 `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57`, old C `3242b22a0825eec347b2748680bb746eb0f55215`, A R12 `c0132ae06de8ae09ab021ac231ffd34756eb5990`, B `bf88320e57b20ebc2023f27665c544ce2ba72ce4`; 不回写旧 source lock。
- **C signed decisions** in #145 `DECISIONS:C`: `C-I3-ANCHOR-003 / APPROVED_SCOPED_REPLAY_C2_R03` and `CR-A-R14-COMPAT-004 / APPROVED_I_ONLY_NON_LIVE_COMPATIBILITY_TEST`. I3 **stage one** must replay the older accepted I2 source against C R03 and pass new exact O + C review **before stage two** adds independently fixed A R14 selected blobs. User批准不能替代各项 Gate C 最终签收。
- `CR-A-PI-HTTP-WITNESS-R01` permits C-only inert engineering; **production Provider/Main attachment still DEFERRED**. A/I do not acquire C Main/Preload/shared/Run/Outbox/SchoolPort writer lease.

## 2. R15 的独立真实安全缺口

R14 初步引入「在 Pi SDK 实际消费的 Response.body 上观察 SSE 终止标记」。但旧 inspect 在遇到完整文本行 `event: response.completed` **即**置 `sseTerminated=true`，不检查配套 `data: {"type":"response.completed",...}` 及 SSE 空白行帧分隔。另对 chat `data: [DONE]` 仅需换行，而未要求独立的空行事件分隔。合成 Pi 生命周期能在 **残缺/伪终止帧** 上自行宣称 settled。这是 R14 尚未排除的真代码漏洞，不是泛型模拟抽象缺口。

R15 的 A-owned `review-v3-pi-http-provider-engine.ts` 改为**有界的 SSE 帧观察状态机**，只在同一个被 Pi SDK 实际消费的流上触发终态：
1. `openai-completions` 要求独立、单 data-line 的 `data: [DONE]` **完成空行分帧**；非空行 / multi-data 并不能构成终态。
2. `openai-responses` 要求 `event: response.completed` + 一条 data JSON 开头具有 top-level first `"type":"response.completed"` 且 **完成空行分帧**，只看到事件名、类型错位或截断帧一律拒止。
3. 同一个 HTTP 响应体多个 terminal frame，或 terminal 之后还出现应用事件，标记 `corrupted` 并保留 A4 durable unresolved intent，不准再次派发。
4. SSE 文本跨 HTTP chunk，兼容 LF/CRLF；每行只保留前 256 字符，避免对巨大模型 JSON 事件在 witness 内存中积累全文。主 SDK 仍负责真正的响应 JSON 解析/终止与错误传播，本层不能独立证明远端 TCP EOF、Provider 处理完结或代理零透明重试。
5. 不修改以前 HTTPS origin/redirect:error、无透明 SDK retry、`x-request-id`、原生 `turn_start→turn_end→agent_end(willRetry:false)→agent_settled`、一次 `dispose()`、A4 dispatch journal、24-turn 计数和 C2 分权。

R15-01..08 的 A 自有测试：仅 event header、错误 response 类型、缺 SSE 空行、chat DONE 截断、重复 DONE、伪 multi-data DONE、Responses 跨 chunk 的 CRLF 正例、完成后又失败。测试依然是离线合成流，**不得标 Gate E**。旧 R10/R12/R13/R14/OS PID/安全负例必须保留。

## 3. I3 技术来源与真实边界

- **I3 已获准候选 A 源只能是 R14** `56f450f3c783299ceb0a6489bf855a1ba8f0a913`，不是本分支继续变化的 R15 HEAD。逐文件实际 Git blob/source SHA 由 I 在其隔离新分支锁定、验证本地导入差分和 Gate O；只按 C 批准范围导入技术片段，**不能 whole branch merge**。
- C R03 factory `C2MainPiAgentSessionFactory.create(input)` 结构 `{session,prompt,trustedOrigin}` 与 A R14 `V3APiHttpSingleRequestFactory` 结构可进行 source-locked 编译/测试；C `createFreshSession` 仍为待可信 Main 实现的注入依赖，不是已连上真实 Pi Provider。只能检验一次 SDK session identity/grant/source/abort 与 A SSE`requestFinished` 在离线网络替身中是否正确隔离。
- C `C2MainPhysicalHostReceiptRegistry` 接收 `read/check/terminal` 且强制独立 privileged Host observer；A HTTP `x-request-id` 与 SSE 标记只供 **模型物理请求技术计数**，绝不可直接写入 C `C2MainHostWitness`，不能由 A proposal 伪造 Host `verified`。
- 非 IPC、非 live Provider、无凭据、无正式 Run seal/ACK、无 business result；I3 阶段一未签收前不开始阶段二。其他 source/ABI/政策是否兼容必须由 I 在同一冻结新代码树的联合回归证实。

## 4. 门禁与剩余风险

- R15 source commits: `d3414327460fd92446d23eb25ed176665e73e8d2` (engine) / `94755ae2e068d5274cd0b184964fb434a909adbc` (eight regressions). **最终 R15 source SHA 以本报告/其他 R15 源更新提交后的 GitHub #143 HEAD 为准**。
- **新 R15 Gate O = NOT_ATTESTED UNTIL exact new SHA** PR CI + D2 Scoped Pi + Baseline 3/3 completed/success. 需要 frozen dependencies、TypeScript、boundaries、skin、Main/Preload/Renderer build、whole Bun、R15-01..08/旧 A4-R10-16 行级验收。任何首败由 A 修复后重新固定 SHA、重新 3/3。
- Gate E=NOT_RUN, Gate L=BLOCKED_NO_AUTH, Gate P=NOT_RUN, Release=NO_GO。没有真实 Electron/Pi SDK/Provider TLS/SSE/代理转发/PID故障 trace、C Main Host 真实 registry/B published Plan 之前不升级。
- 回滚绿色 SHA: R14 `56f450f3c783299ceb0a6489bf855a1ba8f0a913`. 下一个 A work: 真实 Pi 0.86.1 stream/transports 的离线 SDK 运行 probe，进一步验证 SSE parser 与 `onResponse`/retry/Abort 窗口；需要编辑 C-owned Main factory/普通 Pi adapter 时单独请求 C 精确函数级租约。

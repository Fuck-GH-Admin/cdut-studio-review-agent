# Dev-A A4-R14｜SSE 实际流终态见证与 C2-R02 接线窄差分

> A-only engineering evidence / Draft PR #143 / 2026-10-20.
> 本文件不是 C 签署的生产接线授权；所有 Gate 状态按最终 40 位 SHA 的实际 Actions 更新。不得把合成 HTTPS、Pi lifecycle 或 HTTP request ID 写作 Electron/Provider Gate E。

## 固定输入与治理

- 上一 Gate O: A4-R13 `1f1f5d1499cb59c813d590aa407189ba05f65f10`; PR CI `39296623502` 4145 pass/5 skip/0 fail, D2 `39296623298`, Review Baseline `39296623275` 同 SHA SUCCESS。
- C2-R02 Main trust port: Dev-C #144 `34c7ea3bd881504302d2682aad79065c0ef9a24c`, C 5/5 CI PASS，但没有与 A 真 Provider registry 生产接线。
- I2 #148 `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57`, C 已签技术工程接收；其固定 A source pool **仍为 R12** `c0132ae06de8ae09ab021ac231ffd34756eb5990`。
- C 最新在 #145 `DECISIONS:C` 正式裁决 `CR-A-PI-HTTP-WITNESS-R01 / APPROVED_C_ONLY_OFFLINE_FACTORY_DESIGN_AND_IMPLEMENTATION / PRODUCTION_ATTACHMENT_DEFERRED`。仅 C 可写自己的 inert Main factory。A/I 没有 C Main/Preload/shared/业务 writer 生产写入租约；真实 Provider/Host 注册与 C2 durable ACK 仍 DEFERRED。

## R14：源码层实际缺口和修复

R13 `review-v3-pi-http-provider-engine.ts` 原先在有 HTTPS `x-request-id`、单 `fetch`、Pi `turn_start → turn_end → agent_end(willRetry:false) → agent_settled` 和 `session.prompt` 返回时便调用 `witness.requestFinished`。但成功生命周期事件可在未读实际 SSE 终止数据的 synthetic/异常 stream 情形下存在。这把 **HTTP 头见证 + Native lifecycle** 错当作 **完整的响应流应用终态**。

在 A-owned 引擎补：
1. 对 HTTP 2xx 强制 `content-type: text/event-stream` 和非空 response body；其他 API/传输仍 fail closed。
2. 只在 **Pi 实际消费的同一 Response.body** 上加 TransformStream 透传观察，不 clone/tee，不构造独立 HTTP 请求或提前单独排流；解析跨 chunk SSE 行，并限额保存每一行前 128 字符（不采集/存储模型内容）。
3. OpenAI chat SSE 需要实际观察 `data: [DONE]`；Responses SSE 亦允许 `event: response.completed`。缺终态标记时，即使 Headers、stopReason、agent_settled、prompt 均正向，不能发送 `requestFinished`。
4. 保持先前的 Main Abort、HTTPS origin、redirect:error、SDK maxRetries:0、单 streamFunction / fetch、一次性 dispose 和 durable dispatch intent；失败时不虚构 receipt、不允许隐式第二次派发。
5. **范围解释**：SSE 协议应用终止标记被消费 ≠ 已独立见证远端 socket FIN/EOF；OpenAI 流消费可能在协议终止符时停止而不继续等待 TCP EOF。R14 只补 `SSE_TERMINAL_OBSERVED`，不声明 `REMOTE_PROVIDER_PHYSICAL_EOF_VERIFIED`，后者及任何透明代理内重试仍需真实 Gate E 的 Provider/HTTPS trace 证明。HTTP x-request-id 不是密码学回执。

回归：`review-v3-pi-http-provider-engine.test.ts` 新增 `R14-01..05` 检查 200+原生结束而 SSE 截断、错误 MIME、跨物理块标记、Responses 终态事件及 JSON 文本中的伪终止标记；已有 R10/R12/R13、dispatch fence/24-turn/real OS SIGKILL 回归不得删除。合成 Pi session 的 stream 函数现在实际读取被见证的响应体，不再仅凭假终态事件获得成功。

本次改动最初代码提交：`126e17e20ff47d3c3cb3ae4f9b0e06be01ae653d`；测试提交：`3097cc887333541405b546d00650ee757b441dfb`。**最终 R14 Gate O 必须以包含本报告的新完整 SHA 及新 CI 实际结果为准**，不是继承 R13 旧绿。历史回滚点为 R13 `1f1f5d1499cb59c813d590aa407189ba05f65f10`。

## A ↔ C2-R02：真实接口差分与权限边界

| 分层 | A 当前证据 / 接口 | C 现有端口 | 未成立的正式生产条件 |
|---|---|---|---|
| SDK物理请求 | `V3APiHttpSingleRequestEngine` 仅建立 HTTPS/单fetch/x-request-id/SSE终止/native lifecycle 技术 witness | `C2MainTrustedInputs.getPhysicalHostReceipt(id)` | HTTPS Provider request ID **不可**直接转换为 C `V3VerifiedHostReceipt`；没有真实 C Main Host 注册/持久原件/工具回执 |
| Main Owner | `V3ReviewOwnerAdapter.assertAuthorized` 与 A4 frozen dispatch intent，after-await revoke | `getCurrentOwner(run)` 返回 `{run,permissionGrantId,active,ownerGeneration,inputManifestHash}` | 必须 C 从 Main 权限源证明当前代次和 grant；不可由 A 的 C0 local ACK 或 Renderer 传入 |
| Published Plan | A 持有冻结 Run/planFingerprint | `assertPublishedPlan(aggregate,run)` | B 候选 50 模板 `candidate-held` 不等于 published/verified immutable policy |
| Host Event | A `V3AProposalProducer` 产生技术 proposal, 分离 C0 local outbox | C `createC2MainTrustedRunPort().admit/record/seal`; `record` 必须 `getPhysicalHostReceipt(event.hostReceiptId)` | 缺 Main 原始 read/block/source extent/Check×target×object×subject Host 注册证据、Case CAS at-commit 独立验真 |
| 最终业务结果 | A technical completed、24-turn exhausted / needs-resume | C serialized CaseAggregate + immutable Run evidence seal、human review 继续独立 | 不生成自动 Decision、School ACK 或 release GO |

C2-R02 `review-v3-main-trust-port.ts` `getPhysicalHostReceipt` 还核对 Run/grant/event kind，`verifyBase` 每次重哈希本地 Case physical original bytes。任何冷重启丢失 Host registry 必须 fail closed，不得从 journal 文本复原所谓物理 receipt。C 代码尚无 A Provider factory 或 B publisher 真接线。

## 集中验收与真实环境待办

1. R14 同一最终代码 SHA：实际核对 GitHub PR CI、D2 Scoped Pi、Review Baseline 全部 completed/success；PR CI frozen Bun、typecheck、boundaries、skin、Main/Preload/Renderer build、全量 Bun + R14-01..05 行级日志。首败必须记录 job 与日志并修复 A-owned 路径后重跑新 SHA。
2. Gate E **仍 NOT_RUN**：合法 Electron/Main Pi 0.86.1+Provider 真实凭据，固定 origin/provider model/network proxy，记录每 turn 本地 fetch count、SDK retries、Provider 真 request ID、TLS/SSE bytes/terminal/断流/错误、Abort/dispose/迟到、跨 PID 冷恢复，对应脱敏 artifact 与时间线；不能使用 synthetic response 充数。目标 Provider 不提供稳定 x-request-id 时明确 `BLOCKED_NATIVE_RECEIPT_API`。
3. Gate L `BLOCKED_NO_AUTH`，Gate P `NOT_RUN`，Release `NO_GO`。受限活 Provider/Main 注册由 C 新固定 SHA/许可与 I 联合来源重放完成，Dev-A 只提交技术可复验 blob + CI。

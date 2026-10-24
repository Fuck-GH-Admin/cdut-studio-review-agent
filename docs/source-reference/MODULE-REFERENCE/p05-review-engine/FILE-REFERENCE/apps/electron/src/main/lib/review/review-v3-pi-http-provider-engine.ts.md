---
path: apps/electron/src/main/lib/review/review-v3-pi-http-provider-engine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 029419de63dd1974c262f59dc80fc8d9b559004d
sha256: 0feba9659cee7e295ee51adcf722a15886e97b255e8ea0196431332a5e8b8e2b
lines: 341
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-pi-http-provider-engine.ts

## 1. 结论与边界

A4-R10：版本钉死 Pi SDK 0.86.1 的 HTTP Provider **请求见证**引擎。`V3APiHttpSingleRequestEngine.invoke` 绑定一个全新 Main 私有 AgentSession，强制「恰好一次 OpenAI 兼容 HTTPS/SSE fetch + 完整 SDK 生命周期（turn_start→turn_end→agent_end→agent_settled）」，全部旗标满足才向 witness 发 `requestFinished`。文件头 :1-16 明示：不是通用 Pi Provider 回执能力；无 C ReviewRun/IPC/Preload/Renderer 入口；`onResponse` 在 HTTP 响应后、不是 turn 回执。

不做的事：不产生 C 回执/业务结论；不重试（`maxRetries:0`）；不管理会话生命周期之外的 SDK 状态；不 clone/tee 响应体（:208-210）。

## 2. 导出与关键符号

导出 4 条（`export` 逐条核 :28/:30/:41/:64）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `V3AHttpRequestTransport` | type | `:28` | `(...args:Parameters<FetchFunction>)=>ReturnType<FetchFunction>` | 受控 fetch（Bun `.preconnect` 不属之，:26-27 注释） |
| `V3APiHttpRequestSpec` | interface | `:30-39` | `{session, prompt, trustedOrigin, transportFetch?}` | 注入规格 |
| `V3APiHttpSingleRequestFactory` | interface | `:41-43` | `create(input) => Promise<spec>` | 工厂端口 |
| `V3APiHttpSingleRequestEngine` | class | `:64-340` | `invoke(input, witness)` | 主体（`implements V3ANativeSingleRequestEngine`，类型来自 `review-v3-sdk-physical-turn-port` :22） |

内部符号：`PiSession`（:25，`Pick<AgentSession,'agent'|'prompt'|'subscribe'|'dispose'>`）、`consumedPiAgents: WeakSet`（:47，一次性消费）、`fail`（:48-50，抛 `C0ContractError('RECOVERY_REQUIRED')`）、`requestId`（:51-54，x-request-id ≤512 才认）、`getUrl`（:55-58）。

## 3. 内部逻辑与关键流程

`invoke`（:67-340）顺序（全部 fail-closed）：
1. `assertC0RunEvidenceIdentity(input.run)`（:68）；dispatchId 非空 + mode ∈ direct/hidden/graph/batch（:69-72）；abort 预检（:73）。
2. `factory.create(input)` 取 spec（:74）；`rejectNewSession`（:76-79）：dispose 后抛——session 形状/prompt/trustedOrigin 缺失（:80-85）。
3. `trustedOrigin` 必须裸 HTTPS origin：`https:` + 无用户名/密码 + pathname `'/'` + 无 search/hash（:87-92）。
4. abort 复检（:93-95）；`session.agent.state.isStreaming` 拒绝（:96-97）；`consumedPiAgents` 命中拒绝复用（:98-100）；`streamFunction` 须为函数（:101-103）；登记 WeakSet（:104）。
5. 生命周期旗标（:106-124）：`invocations/httpCalls/physicalResponseId/sseTerminated/sseTransportEof/startedTurn/finishedTurn/agentEnded/agentSettled/corrupted`；`mark()` 置 corrupted 并抛（:118-121）。
6. `session.subscribe` 事件状态机（:125-163）：`turn_start` 仅一次且未终；`turn_end` 须 started 未 finish、`invocations===1`、`physicalResponseId` 存在、`message.role==='assistant'`、`stopReason ∈ stop|length|toolUse`；`agent_end` 须 finished 且 `willRetry===false`；`agent_settled` 须 agentEnded。违序 → corrupted。
7. monkey-patch `session.agent.streamFunction`（:165-309）：
   - 计数/状态/abort/model.api ∈ openai-completions/openai-responses、禁 websocket 传输（:167-175，违者 `mark()`）；`options?.fetch` 预置即 `mark()`（:177，防隐藏重试）。
   - `guardedFetch`（:178-295）：`httpCalls` 仅 1 次（:183-184）；URL 必须同 origin + https（:185-189）；下游信号 `AbortSignal.any` 合成（:190-192）；`redirect:'error'`（:195）+ `response.redirected`/换 origin 判违规（:196-201）；`x-request-id` 必有（:203-204）；content-type 必须 `text/event-stream` 且有 body（:205-207）。
   - SSE 观察（:208-287）：`pipeThrough(TransformStream)` 只看 SDK 实际消费的字节（注释 :208-210 禁 clone/tee）；`finishFrame`（:220-243）：completions 终帧=`data:[DONE]` 单行帧；responses 终帧=`event: response.completed` + 单行 data JSON 首键 `"type"` 匹配（正则 :232-233）；DONE 后再有应用事件或畸形完成帧 → corrupted（:222-224/:236-239）；`finishLine`（:244-256）行解析（`\r` 剥离、event:/data: 前缀）；`inspect`（:257-268）256 字符行长上限（:262 防超大 JSON）；`flush`（:270-283）：`sseTransportEof=true` 且残留半帧/未完帧 → corrupted（:275-282）。
   - `preconnect:()=>mark()`（:298，禁 DNS 预连捷径）。
   - 调 `previous(model,context,{...options, signal, transport:'sse', maxRetries:0, fetch:guardedFetch})`（:300-308）。
8. `await session.prompt(spec.prompt)`（:310）；abort 中断 → fail（:311）；**收尾门**（:315-324）：corrupted/invocations!==1/httpCalls!==1/无 observedId/!sseTerminated/!sseTransportEof/生命周期旗标不全 → fail（`Pi HTTP Provider request/stream completion provenance unavailable`）；全过才 `witness.requestFinished({nativeRequestId:observedId, nativeReceiptId:observedId, status:'completed'})`（:325-327）。
9. `finally`（:328-339）：恒 `session.dispose()`（注释 :329-332：dispose 才断 native retry/compaction；仅还原 streamFunction 会留可用会话）→ `unsubscribe()` → 还原 `streamFunction`。

## 4. 调用者与调用链

入向（全冻结树 `*.ts` grep）：
- `apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.ts:21`（装配）。
- `apps/electron/src/main/lib/review/review-v3-a26-native-pi-session-factory.ts:22`（工厂实现侧）。
- **无专属测试**（全树 `*.test.ts` grep `V3APiHttpSingleRequestEngine` 0 命中）。

出向：`@earendil-works/pi-coding-agent`（AgentSession 类型 :18）、`@earendil-works/pi-ai`（FetchFunction 类型 :19）、`@profer/shared`（assertC0RunEvidenceIdentity/C0ContractError :20）、`review-v3-sdk-physical-turn-port`（V3ANativeProviderWitness/V3APhysicalTurnInput/V3ANativeSingleRequestEngine :21-22）。运行时经注入的 `session.agent.streamFunction`/`session.prompt`/`subscribe`/`dispose`。

## 5. 数据 I/O、读写与副作用

- 无磁盘 I/O。副作用：一次真实 HTTPS fetch（经 guardedFetch）、SDK 会话 prompt/subscribe/dispose、monkey-patch 与还原 `session.agent.streamFunction`、witness 回调（requestStarted :294 / requestFinished :325-327）。
- 一次性消费：`consumedPiAgents` WeakSet（:47/:98-100/:104）禁同一 session 复用。
- 幂等：单次 invoke 单请求（invocations/httpCalls 计数强制）；重复调用同一 session 被 WeakSet 拦截。
- 数据流：input.run/dispatchId/mode/signal + factory 产出 prompt/trustedOrigin → HTTP 见证 → witness。

## 6. 分支、失败、取消与恢复

- 全部失败走 `fail`/`mark`（`C0ContractError('RECOVERY_REQUIRED')`）；`rejectNewSession` 先 dispose 再抛（:76-79）。
- 取消：`input.signal` 三处检查（:73/:93-95/:184）+ downstream `AbortSignal.any`（:190-192/:302-303）；prompt 后 abort → fail（:311）。
- 恢复：无自动恢复——corrupted 旗标一旦置位只进 fail；`finally` 保证会话不泄漏（dispose/unsubscribe/还原三连 :328-339）。
- 不可恢复点：SSE 畸形终帧、重定向、二次 fetch、复用 session 均 fail-closed。

## 7. 权限与权威状态

- 无 sender/role 检查（身份在上游 Owner 校验）；权威边界=「Main 注入的全新私有 session + 裸 HTTPS trustedOrigin」（:42/:86-92）。
- 见证语义：`nativeRequestId === nativeReceiptId` 为同一 server 端 `x-request-id`（:291-293 注释明示不是模型 UUID、不是完成证明）；完成证明=旗标全集（:315-324）。

## 8. 修改影响面

- 消费方 `review-v3-a25-c11-local-execution-ports.ts`/`review-v3-a26-native-pi-session-factory.ts`；witness 契约（`V3ANativeProviderWitness`）改动影响 C11 交接包。
- Pi SDK 升级（非 0.86.1）会使 :125-163 生命周期假设失效（版本钉死见 :1-15）。
- 无直接测试需同步（§9）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.ts` grep `V3APiHttpSingleRequestEngine` 0 命中；检索范围：baseline 全仓 `*.test.ts`）。间接（标注「间接」）：`review-v3-a25-c11-local-execution-ports.test.ts`（批外，A25-01/02）经装配层覆盖一次 HTTP turn 路径（未逐行读其断言，属其它批）。mock 边界：批外测试以 transportFetch 注入（本文件 :38 注释「tests only」）。SSE 解析/护栏/生命周期均无直接断言。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；单 fetch/单 streamFunction 调用强制 | 已证实 | :28-64/:167-184 |
| trustedOrigin 裸 HTTPS 校验 | 已证实 | :87-92 |
| redirect:'error' + redirected/换 origin 判违规 | 已证实 | :195-201 |
| SSE 双 API 终帧判定 + 畸形帧 corrupted | 已证实 | :220-243 |
| 不 clone/tee、只观察 SDK 消费字节 | 已证实 | :208-210/:270-284 |
| finally 恒 dispose + 还原 | 已证实 | :328-339 |
| 无专属测试 | 已证实（否定，检索范围见 §9） | 全树 `*.test.ts` grep |
| Pi 0.86.1 生命周期与 upstream 事实（streamFunction 公开等） | 推断（文件头声明，未读 SDK 源） | :1-15 |
| transportFetch 注入是否会被生产误用 | 未知 | :38 注释「tests only」无强制拦截 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `invoke` 全流程 | §3 | :67-340 | covered |
| 生命周期状态机 | §3-6 | :125-163 | covered |
| guardedFetch 护栏 | §3-6 | :178-295 | covered |
| SSE 终帧判定 | §3 | :220-287 | covered |
| 收尾门/finally | §3 | :315-339 | covered |
| `V3AHttpRequestTransport`/`V3APiHttpRequestSpec`/`V3APiHttpSingleRequestFactory` | §2 | :28-43 | covered |
| 测试断言 | §9 | — | unknown（无直接测试） |
| SDK 内部语义 | §10 | — | unknown |

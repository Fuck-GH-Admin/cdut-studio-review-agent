---
path: apps/electron/src/main/lib/review/review-v3-main-pi-factory.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6a5317f99100327208699eb1c819e7741ca0679b
sha256: 61bad7b5b10a39a7ef17dd6b3dd8c60bc5173e84d06ae896049fd36612458a0a
lines: 190
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-pi-factory.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `C2MainPiAgentSessionFactory`（C2-R03）：只在真实案卷磁盘原件 + 已发布 Plan + 活 Owner 复查后构造**一次**惰性专用会话；不 prompt、不流式；candidate-held/无 Owner/预中止零创建；构建期 Owner 轮换/原件篡改/已 streaming 会话一律 fail-closed 并 dispose。

## 2. 用例清单

共 7 个 `test(`（`review-v3-main-pi-factory.test.ts:113-189`，单一 `describe`）。

夹具（`:21-111`）：`PROFER_CONFIG_DIR` 指向 `work/tmp/v3-c2-pi-factory-<Date.now()>`；真实 `createAggregate` 案卷（原件 `original.txt` + `byteHash`、`stage:'reviewing'`）+ `canonicalPlan` + `v3TechnicalExecution`（`run/admittedAtRevision/frozenInputDigest/events:[]`）；`C2MainPiCreatedSession` mock 会话中 `streamFunction`/`prompt` 直接 throw（证明工厂不调用，`:73-79`）；`assertPublishedPlan`/`getCurrentOwner`/`createFreshSession` 可注入失效（`revoke/rotateGrant/candidateHeld/setBuild`）；计数 `createCount/disposeCount`。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | requires trusted constructor dependencies and pinned HTTPS origin（`:114`） | `new …({} as never)`、`http://` origin | `toThrow()`；`toThrow('HTTPS')` |
| 2 | constructs one fresh Pi shape after real Case disk source and Owner checks, without prompting（`:124`） | `create(request)` 两次 | `trustedOrigin==='https://provider.example.test'`；`prompt` 含 `Frozen Main prompt`；`createCount===1`；`disposeCount===0`；第二次 `rejects.toThrow('reused')` 且 `createCount` 仍 1 |
| 3 | trusted long prompt remains intact rather than being constrained like an identifier（`:136`） | 8100 字符 prompt | `spec.prompt` `toBe(fullPrompt)` |
| 4 | candidate-held, missing current owner and pre-aborted construction never open SDK（`:145`） | `candidateHeld()`/`revoke()`/`AbortSignal.abort()` | 三次 `rejects`（`'PUBLISHED'`/`'Owner'`/任意）且 `createCount` 恒 0 |
| 5 | Owner grant rotated during asynchronous build: dispose and refuse（`:160`） | build 内 `rotateGrant()` | `rejects.toThrow()`；`disposeCount>=1` |
| 6 | physical original changed during asynchronous session creation: reject and dispose（`:170`） | build 内改原件字节 | `rejects.toThrow()`；`disposeCount===1` |
| 7 | already-streaming Pi session fails closed and is disposed（`:180`） | build 返回 `isStreaming=true` | `rejects.toThrow('inert')`；`disposeCount===1` |

## 3. 真实断言

- 用例 2：`expect(result.trustedOrigin).toBe('https://provider.example.test')`（`:127`）；`expect(f.createCount).toBe(1)`（`:129`）；`await expect(f.factory.create(f.request)).rejects.toThrow('reused')`（`:131`）。
- 用例 3：`expect(spec.prompt).toBe(fullPrompt)`（`:141`）。
- 用例 4：`rejects.toThrow('PUBLISHED')`（`:148`）；`rejects.toThrow('Owner')`（`:152`）；`expect(h.createCount).toBe(0)`（`:157`）。
- 用例 5-7：`expect(f.disposeCount).toBeGreaterThanOrEqual(1)`（`:167`）、`toBe(1)`（`:177,188`）。

夹具/mock 边界：案卷/原件/plan/`v3TechnicalExecution` 是**真实落盘**（case-store-v2）；`createFreshSession` 返回的 `AgentSession` 是内存 mock（`as unknown as`，`:80`）；无 Electron、无网络、无真实 Pi SDK。

## 4. 未覆盖与脆弱点

- 未覆盖：`dispatchId` 边界（>512/空）、`mode` 非法、`signal` 在 await 后中止、`agent.streamFunction` 缺失分支、`spec.prompt` 超 524288。
- 脆弱点：`toThrow('reused')`/`'PUBLISHED'`/`'Owner'`/`'inert'`/`'HTTPS'` 均为子串匹配，依赖错误文案；`createCount/disposeCount` 依赖实现调用次数。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个用例 | 已证实 | `grep test(`；`:114,124,136,145,160,170,180` |
| 工厂不 prompt/不流式 | 已证实（mock throw + 未触发） | `:73-79,126-133` |
| dispatch 一次性 | 已证实 | `:131-132` |
| 漂移/篡改 fail-closed + dispose | 已证实 | `:160-178` |
| 真实磁盘案卷 | 已证实 | `:21-64` |
| 真实 SDK 行为 | 未知 | 全 mock |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 构造/origin | 1 | 114-122 | covered |
| 正常创建/一次性 | 2 | 124-134 | covered |
| 长 prompt 保留 | 3 | 136-143 | covered |
| 三类零创建 | 4 | 145-158 | covered |
| 构建期轮换 | 5 | 160-168 | covered |
| 原件篡改 | 6 | 170-178 | covered |
| streaming 拒绝 | 7 | 180-189 | covered |
| 入参边界/await 后中止 | 无 | — | unknown |

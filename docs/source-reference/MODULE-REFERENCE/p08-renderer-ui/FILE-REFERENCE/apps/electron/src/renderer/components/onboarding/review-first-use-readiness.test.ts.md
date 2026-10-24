---
path: apps/electron/src/renderer/components/onboarding/review-first-use-readiness.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9ded25405b91dd1179615174f2f8e2a7ce2f17be
sha256: 9b7f00f945045edb23d0e0e87110444b3658b102d75027e900f25825e57a810e
lines: 40
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/review-first-use-readiness.test.ts

## 1. 测试目标

`review-first-use-readiness`（同批深读）的「F01 首次审核准备与模型自检」三性质：白名单过滤（仅兼容且启用的渠道/模型）、严格 JSON 自检回执解读、身份不一致/格式错误时不伪称已验证。框架 `bun:test`；mock 边界=纯函数 + `channel()` fixture 工厂（无网络/无真实模型）。

## 2. 用例清单

用例计数：`test(` **3**（`:14,23,30`），`it(` 0——与源码计数一致。单一 `describe('F01 首次审核准备与模型自检')`（`:13`）。

装置：`channel(id, enabled=true)` 工厂（`:7-11`）——`provider:'openai'`、`baseUrl:'https://example.invalid/v1'`、models `[{id:'m1',enabled:true},{id:'m2',enabled:false}]`。

| # | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 全局渠道存在时仅展示兼容且启用的配置（`:14-21`） | `channel('valid')`、`channel('disabled', false)`、`{...channel('agent-only'), provider:'anthropic'}` | `eligibleReviewChannels`/`isReviewSelectionAvailable`/`selectionKey` | 独立 |
| 2 | 模型回传严格 JSON 时记录真实请求且不猜测能力（`:23-28`） | raw=`{"ready":"CDUT_REVIEW_PROBE"}`、gateway 一致 | `interpretReviewTextProbe` | 独立 |
| 3 | 回执型号不一致或 JSON 错误时不伪称（`:30-39`） | modelId:'other' / raw:'ok' | `interpretReviewTextProbe` 两次 | 独立 |

## 3. 真实断言

（逐条引用 expect 行）

1. `eligibleReviewChannels([...]).map(i=>i.id)` `toEqual(['valid'])`（`:17`）；`isReviewSelectionAvailable([...], {channelId:'valid', modelId:'m2'})` `toBe(false)`（`:18`）；`modelId:'m1'` `toBe(true)`（`:19`）；`selectionKey({channelId:'a', modelId:'bc'})` `.not.toBe` `selectionKey({channelId:'ab', modelId:'c'})`（`:20`）。
2. `interpretReviewTextProbe({raw:'{"ready":"CDUT_REVIEW_PROBE"}', channelName:'已选渠道', modelId:'m1'}, {available:true, protocol:'openai-compatible', channelName:'已选渠道', modelId:'m1'})` `toEqual({status:'passed', channelName:'已选渠道', modelId:'m1', identityConfirmed:true})`（`:24-27`）。
3. modelId:'other' → `toMatchObject({status:'passed', identityConfirmed:false})`（`:31-34`）；raw:'ok' → `toMatchObject({status:'failed'})`（`:35-38`）。

## 4. 未覆盖与脆弱点

- 未覆盖（对照被测源码）：`selection` 空 → `true` 分支（`review-first-use-readiness.ts:14`）、`gateway.available:false`/`gateway.modelId` 空的 identityConfirmed 分支、`ready` 字段非约定值/数组/非对象输入、`selectionKey(undefined)`。
- 脆弱点：fixture 的 `baseUrl:'example.invalid'` 明示不发网络（纯函数无 fetch）；用例 2/3 的 `toMatchObject` 只锁部分字段（`passed` 分支的 channelName/modelId 透传未在用例 3 断言）。
- 无真实模型请求：自检链路的端到端行为（probe 发起/gateway 回执）在 `ReviewFirstUseReadiness.tsx`（域外，未测）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `review-first-use-readiness.test.ts:17-38` |
| mock 边界=纯函数+fixture（无网络） | 已证实 | `:7-11` |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 空选择/gateway 分支行为 | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 白名单过滤+可用性+key | §2/§3 | 14-21 | covered |
| 严格 JSON 通过+身份一致 | §2/§3 | 23-28 | covered |
| 身份不一致/JSON 错误 | §2/§3 | 30-39 | covered |
| 空选择/gateway 分支 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |

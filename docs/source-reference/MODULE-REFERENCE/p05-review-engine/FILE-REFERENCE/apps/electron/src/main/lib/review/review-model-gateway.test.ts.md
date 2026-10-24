---
path: apps/electron/src/main/lib/review/review-model-gateway.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2b13c34cb6bc520148f6240e8f4c3edb6bc5ac90
sha256: 54a5d95e38706704ef76c5fe9577ad336d92e278546f87450f0c0d170ac9ebfa
lines: 125
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-model-gateway.test.ts

## 1. 测试目标

统一模型网关三面（`apps/electron/src/main/lib/review/review-model-gateway.test.ts:1-16`）：①**白名单强制**（`chatCompletion` 对白名单外 provider 在任何网络调用前 throw）；②`extractJson`（经 `review-model-gateway.ts:22` re-export，实际实现为 `review-json.ts`）；③`getReviewModelGatewayStatus` 无渠道 `available:false`。环境：bunfig preload 全局 mock electron，隔离 `PROFER_CONFIG_DIR`（`:7-9`、`:25-34`）。

## 2. 用例清单

3 describe / 6 test。夹具 `buildChannel(provider)`（`:37-49`）。

**模型出口白名单（`:51-82`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 1 | 常量四允许（openai/deepseek/custom/ollama）在内、anthropic/google/openai-responses 不在、**恰好 4 个** | `:52-64` |
| 2 | `chatCompletion(anthropic)` rejects 精确 `REVIEW_MODEL_PROVIDER_REJECTED_NOTICE`（在解密/发请求前）；文案含「白名单」「内容审核专区」 | `:66-75` |
| 3 | `google` 同样被拒 | `:77-81` |

**extractJson（`:84-108`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 4 | 纯 JSON/```` ```json ````围栏/无标记围栏/数组围栏均解析 | `:85-94` |
| 5 | 解说文字包裹取最外层 `{}`（含嵌套对象） | `:96-100` |
| 6 | 非 JSON/空串/花括号残缺 → `undefined`（不伪造结果） | `:102-107` |

**getReviewModelGatewayStatus（`:110-125`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 7 | 空配置目录：`available:false`、`protocol:'none'`、reason 非空含「OpenAI 兼容渠道」「本地模型渠道」、不暴露 `channelName`/`modelId` | `:111-124` |

## 3. 真实断言

- `expect(REVIEW_MODEL_PROVIDERS).toHaveLength(4)`（`:63`）。
- `await expect(chatCompletion(buildChannel('anthropic'), …)).rejects.toThrow(REVIEW_MODEL_PROVIDER_REJECTED_NOTICE)`（`:69-71`）。
- `expect(extractJson('前言 {"a":1} 后语')).toEqual({ a: 1 })`（`:97`）。
- `expect(status.channelName).toBeUndefined()`（`:122`）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实网络调用（白名单内 provider 的请求路径）；多渠道配置；`extractJson` 的裸数组无围栏场景（见 review-json 手册第 3 节）。
- 脆弱点：依赖 bunfig electron mock（`:7-8`）；`REVIEW_MODEL_PROVIDER_REJECTED_NOTICE` 文案断言与共享常量耦合。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 白名单恰 4 且闸门先于网络 | 已证实 | `:63`、`:66-75` 注释与断言 |
| `extractJson` 三条路径 + 失败返回 undefined | 已证实 | `:85-107` |
| 无渠道自检 available:false | 已证实 | `:111-124` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 白名单常量/拒绝 | 1-3 | `:52-81` | covered |
| `extractJson` | 4-6 | `:85-107` | covered |
| 网关自检 | 7 | `:111-124` | covered |

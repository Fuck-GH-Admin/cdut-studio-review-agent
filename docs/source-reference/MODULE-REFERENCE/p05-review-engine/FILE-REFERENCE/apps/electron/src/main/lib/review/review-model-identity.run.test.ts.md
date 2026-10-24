---
path: apps/electron/src/main/lib/review/review-model-identity.run.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5c6d1faa401217a6d1c6cd5027e699bf48d3b0a3
sha256: 8dc1637a45dcd6bc35c17eb164b98c5d816f0b9efcdde334c2a5ec881d25cbc4
lines: 35
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-model-identity.run.test.ts

## 1. 测试目标

MHI-01/03：`pickChannelModelId`（`review-model-identity.ts:9-19`）作为 run 组消费的**唯一**模型解析口径（「不另写解析器」，`apps/electron/src/main/lib/review/review-model-identity.run.test.ts:1`）：显式选择优先、停用模型不静默改选、跨渠道不采纳、缺省与网关同序、空清单如实返回。

## 2. 用例清单

1 describe / 5 test。夹具：`channel` 三模型（`model-a`/`model-b` 启用、`model-off` 停用，`:5-12`）。

| # | 名称 | 动作 | 断言 | 行 |
| --- | --- | --- | --- | --- |
| 1 | 显式选 B 必须返回 B | `pickChannelModelId(channel,{channelId:'ch-1',modelId:'model-b'})` | `'model-b'` | `:15-17` |
| 2 | 显式选停用模型→回落首启用（调用方判不一致） | 选 `model-off` | `'model-a'` | `:19-21` |
| 3 | 选择属其他渠道不采纳 | `channelId:'ch-2'` | `'model-a'` | `:23-25` |
| 4 | 未选择与网关同序 | `null`/`undefined` | 均 `'model-a'` | `:27-30` |
| 5 | 空清单返回 `undefined`（不冒充可用） | `models:[]` | `toBeUndefined()` | `:32-34` |

## 3. 真实断言

- `expect(pickChannelModelId(channel, { channelId: 'ch-1', modelId: 'model-off' })).toBe('model-a')`（`:20`）。
- `expect(pickChannelModelId({ id: 'ch-empty', models: [] }, …)).toBeUndefined()`（`:33`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`waitForRetry`（本文件只测 `pickChannelModelId`）；全部停用模型时的回落（`models[0]` 为停用项的场景）。
- 脆弱点：用例 2 的「回落首启用」与源码 `:17-18` 的 `?? channel.models?.[0]?.id` 两级兜底一致；纯全禁用清单会落到 `models[0].id`（测试未覆盖）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例与源码分支对应 | 已证实 | `:15-34` 对照 `review-model-identity.ts:13-18` |
| 全禁用清单落到 models[0] | 推断 | 源码 `:18` `??` 语义；未被测试 |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 显式命中启用 | 1 | `:15-17` | covered |
| 显式停用回落 | 2 | `:19-21` | covered |
| 跨渠道 | 3 | `:23-25` | covered |
| 缺省同序 | 4 | `:27-30` | covered |
| 空清单 | 5 | `:32-34` | covered |
| `waitForRetry` | — | — | unknown（未覆盖） |

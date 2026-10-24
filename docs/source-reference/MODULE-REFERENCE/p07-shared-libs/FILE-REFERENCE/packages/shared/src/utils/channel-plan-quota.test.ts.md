---
path: packages/shared/src/utils/channel-plan-quota.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 216a88321aefe58b002c690d8d4840fb888c394a
sha256: 3afd8e8e0abb810ef81c36d80efad10bb862d9342ad5d0fdb270cdd69548875c
lines: 12
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/channel-plan-quota.test.ts

## 1. 测试目标

渠道订阅额度能力判定（`packages/shared/src/utils/channel-plan-quota.test.ts:4`）：`supportsProviderPlanQuota` 的 zhipu-coding 支持 / 普通 zhipu 不误认两点。bun:test；被测为同目录 `channel-plan-quota.ts`。无夹具。

## 2. 用例清单

共 **2 个 `test(`**（1 个 `describe`，Given/When/Then）：

| # | 行 | 用例 | 动作 | 断言目标 |
| --- | --- | --- | --- | --- |
| 1 | 5-7 | zhipu-coding 支持 Coding Plan 额度 | `supportsProviderPlanQuota('zhipu-coding')` | toBe true |
| 2 | 9-11 | 普通 zhipu 不误认为 Coding Plan | `supportsProviderPlanQuota('zhipu')` | toBe false |

依赖顺序：无。

## 3. 真实断言

- `:6` `expect(supportsProviderPlanQuota('zhipu-coding')).toBe(true)`。
- `:10` `expect(supportsProviderPlanQuota('zhipu')).toBe(false)`。

## 4. 未覆盖与脆弱点

- 名单另两项 `deepseek`/`kimi-coding`/`minimax`（源 `:5-8`）无断言。
- 非法 provider 字符串（类型外）无用例。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例、zhipu 二分语义 | 已证实 | `:5-11` |
| 其余 provider 无锚 | 已证实（核对用例） | 源 `:5-8` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| zhipu-coding=true | §2/§3 | 1 | covered |
| zhipu=false | §2/§3 | 2 | covered |
| 其它三项 | §4 | — | unknown |

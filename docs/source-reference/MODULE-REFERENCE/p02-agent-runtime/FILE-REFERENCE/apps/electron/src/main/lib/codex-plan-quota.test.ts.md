---
path: apps/electron/src/main/lib/codex-plan-quota.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 96da69425d2745f173344b945ba1f8a66c9fe6d4
sha256: ad132d3c649d685ada4ec23ea75f6e31e705b6287e11fd4d3030c470e02de092
lines: 84
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/codex-plan-quota.test.ts

## 1. 测试目标

`codex-plan-quota.ts` 的 `parseCodexPlanQuotaResponse`（wham usage → 统一 Plan 额度）。被测逻辑见同组手册。

## 2. 用例清单

**5 个 `test()`**（describe `Codex OAuth 订阅额度解析`）：5h+weekly 映射（`:5-31`）、非标准窗口保留 custom（`:33-47`）、4.5 小时/6 天不误标（`:49-61`）、reset_after_seconds 推导（`:63-74`）、损坏响应可展示原因（`:76-83`）。

## 3. 真实断言

- `:22-30` `toMatchObject`：supported/`planName:'ChatGPT Pro (Codex)'`/windows 两元素（type 5h+weekly、used/remaining 42/58 与 5/95、resetAt 秒×1000）。
- `:43-46` 86400s → `{type:'custom', label:'每 1 天', usedPercent:13, remainingPercent:87}`（12.6 取整 13）。
- `:57-60` 16200s/518400s → '每 4.5 小时'/'每 6 天'（均 custom）。
- `:72-73` resetAt 区间断言 `>=before+3_600_000` 且 `<=now+3_600_000`。
- `:77-82` 缺 duration → `supported:false`、windows `[]`、message 固定文案。

## 4. 未覆盖与脆弱点

未覆盖：`formatPlanName` 边缘（非字符串/下划线）；真实 API 形态。断言为 toMatchObject 子集匹配。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言如 §3 | 已证实 | 逐行读 `:1-84` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 标准/非标准窗口映射 | 3 | covered |
| reset 推导/失败路径 | 2 | covered |

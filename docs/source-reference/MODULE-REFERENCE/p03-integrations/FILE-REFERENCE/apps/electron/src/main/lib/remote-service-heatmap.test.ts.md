---
path: apps/electron/src/main/lib/remote-service-heatmap.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 96ce85282a9f0e6cc898b8253c45c184d803f840
sha256: 7468dfe1599f901fcde15ea4962629ffb609e65bc6ec13611b9067e8dbebdb77
lines: 12
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-service-heatmap.test.ts

## 1. 测试目标

`remote-service.ts` 的 `validateWorkspaceHeatmapRequest`（get_workspace_heatmap_daily 请求校验）。被测逻辑见 remote-service 手册。

## 2. 用例清单

**1 个 `test()`**（describe `get_workspace_heatmap_daily 请求校验` `:4`）：仅接受非空字符串 workspaceId（`:5-11`）。

## 3. 真实断言

`:6-10` 合法 `'workspace-1'` → `toBeNull()`；`'  '`/`''`/`undefined`/`42` → `toBe('缺少 workspaceId')`。

## 4. 未覆盖与脆弱点

单函数校验面之外的热力图链路未测。错误文案断言耦合。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例断言如 §3 | 已证实 | 逐行读 `:1-12` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| workspaceId 校验 | 1 | covered |

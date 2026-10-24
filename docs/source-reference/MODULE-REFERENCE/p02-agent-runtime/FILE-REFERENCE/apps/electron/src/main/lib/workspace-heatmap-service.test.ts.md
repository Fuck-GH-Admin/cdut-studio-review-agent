---
path: apps/electron/src/main/lib/workspace-heatmap-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c27afa04b01f2f53c10b51f0bfd39e32387284e9
sha256: f8bea02c442da2f82f02a50992e53e03e1ca6ee1e25797536f665f305247a0e8
lines: 57
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/workspace-heatmap-service.test.ts

## 1. 测试目标

Token 口径/时区/缓存版本/覆盖合并语义。不运行（`NOT_RUN`）。

## 2. 用例清单

7 用例（:5/:14/:19/:27/:31/:39/:52），1 describe（:4）：
1. 四项口径求和（:5-12）：toBe 1_125_845。
2. 缺失按 0（:14-17）：15 与 0。
3. 本机自然日非 UTC（:19-25）：构造期望与 Date 本地分量一致。
4. CACHE_VERSION 钉 7（:27-29）。
5. **已结算覆盖不双计**（:31-37）：10_000 被 128_000 覆盖。
6. 跨多天补算逐日写入（:39-50）：三日升序。
7. 无重复增量（:52-56）：7_000 覆盖 5_000。

## 3. 真实断言

- `:11`：四项求和 toBe 1_125_845（8498+1084160+32000+1187）。
- `:15-16`：缺字段补 0（15 与 {}→0）。
- `:24`：本机时区日期 toBe（与 Date 本地分量构造的期望一致，非 UTC）。
- `:28`：`CACHE_VERSION` toBe 7（钉版本防静默漂移）。
- `:34-36`：覆盖语义 toEqual（10_000 被 128_000 覆盖，不相加）。
- `:45-49`：跨天补算 toEqual 三日升序。
- `:55`：find(2026-08-03).tokens toBe 7_000（覆盖不双计）。

## 4. 未覆盖与脆弱点

未覆盖：getWorkspaceHeatmapDaily 三态主入口、JSONL 解析。mock 边界：纯函数直调。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 口径/时区/版本/合并 | #1-#7 | covered |
| 主入口/JSONL | — | unknown |

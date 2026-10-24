---
path: apps/electron/src/main/lib/review/resource-check.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1b67bedc21082a58d6bf064135d233b8bfd2a5f9
sha256: 86392583ced3240cddd5e815689a65b744be70b673666d072d21d17516d72583
lines: 34
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/resource-check.test.ts

## 1. 测试目标

N7 单测（文件头 `:1-3`）：资源自检诚实标注 + 固定集脚手架。被测：`resourceCheck`、`runGoldenSet`（`resource-check`）。纯内存（探测路径指向不存在目录）。本轮 `NOT_RUN`。

## 2. 用例清单

2 describe、**3 test**：

| # | describe/test 行 | 断言要点 |
| --- | --- | --- |
| 1 | 资源自检（N7）/ `:8-13` | `resourceCheck('/nonexistent-root')`：OCR wasm 项 `status==='deferred'`（业务有降级路径）且 `allRequiredAvailable===true`（必需项解析可用） |
| 2 | 固定集脚手架（04 §5）/ `:23-27` | 三值固定集（in-true / in-false / exists-unknown）3/3 通过，`accuracy===1` |
| 3 | 同上 / `:29-33` | 加一条错误期望（g4：school-2 不在 [national-1] 却期望 true）→ `accuracy===0.75`（如实计入失败，不虚报） |

## 3. 真实断言

- #1 断言缺失标 `deferred` 而非 `missing`/`available`，且必需项不受影响。
- #2 用 `results.every(pass)` + `accuracy===1` 双断言。
- #3 的 0.75 是精确计算值（3/4）——“错误期望如实计入失败”。

## 4. 未覆盖与脆弱点

**未覆盖**：OCR 资源存在时 `available` 分支；`GoldenCase.facts` 缺字段的 `{known:false}` 回退；空集 `accuracy=0`。

**脆弱点**：夹具期望值与 `evaluateCondition` 的 in/exists 语义耦合。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe、3 test | 已证实 | `:7/:16`；`grep -c test(`=3 |
| 缺失 deferred + 必需项可用 | 已证实 | `:8-13` |
| 三值语义逐案比对 | 已证实 | `:17-27` |
| 准确率不虚报 | 已证实 | `:29-33` |
| available/空集分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `resourceCheck` 缺失路径 | #1 | `:8-13` | covered |
| `runGoldenSet` 通过/失败计数 | #2/#3 | `:23-33` | covered |
| available/空集 | — | — | unknown |

---
path: apps/electron/src/main/lib/agent-message-envelope.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0c4f0d20634e431251380f19c4db96dc98cf3b28
sha256: 1cc43b92b3bdc942ac773d91be80de52c8184a0623075610f3cbb215bcadad92
lines: 81
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-message-envelope.test.ts

## 1. 测试目标

Context Sandwich 分域：三块剥离、系统/用户严格隔离、顺序固定、不误剥普通 XML。不运行（`NOT_RUN`）。

## 2. 用例清单

6 用例（:5/:25/:33/:61/:66/:75），2 describe（:4/:32）。
1. 剥离附件/划词保留正文（:5-23）：pureText toBe 正文、contextBlocks 2 条含标签。
2. quoted_file 抽取（:25-29）。
3. 分域严格（:33-59）：SYSTEM_CONTEXT 含三块不含正文（:45-49）、USER_REQUEST 含正文不含块（:51-54）、顺序 metadata<SYSTEM_CONTEXT<USER_REQUEST（:57-58）。
4. 无块不注入 SYSTEM_CONTEXT（:61-64）：envelope toBe 精确串。
5. 仅附件保留空 USER_REQUEST（:66-73）：`<USER_REQUEST>\n\n</USER_REQUEST>`。
6. 普通 XML 不误剥（:75-80）：`<bubble>` 原样。

## 3. 真实断言

`:19-22`/`:27-28`/`:46-58`/`:63`/`:70-72`/`:79`（toBe/toContain/toHaveLength/indexOf 比较 如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：嵌套/畸形标签。mock 边界：纯函数字面量。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 抽取/分域/顺序/空态/XML | #1-#6 | covered |

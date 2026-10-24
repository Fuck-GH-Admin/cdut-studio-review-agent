---
path: apps/electron/src/main/lib/remote-workspace-file-search.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4d09e41b91173f7f4a73fa40b1c49d4b2b954b77
sha256: 6ebaceeafce30ba507c02db079c5206459836b169b8057bcae8ca11c744ffd87
lines: 123
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-workspace-file-search.test.ts

## 1. 测试目标

`remote-workspace-file-search.ts` 的 `searchRemoteWorkspaceFiles`：双组条目、匹配排序、附加路径、容错、配额、根外不泄露。被测逻辑见同组手册。

## 2. 用例清单

**6 个 `test()`**（describe `searchRemoteWorkspaceFiles`）：空 query 双组（`:36-54`）、query 前缀目录优先（`:56-69`）、附加路径绝对路径+忽略目录（`:71-95`）、缺失根容错（`:97-105`）、limit 配额（`:107-111`）、**根外不泄露**（`:113-122`）。beforeEach 真实临时树（`:16-29`）。

## 3. 真实断言

- `:41-53` session 路径相对（`['README.md','index.ts','src','src/app.ts']`）；workspace 3 条、首条 `toMatchObject({name:'工作文件', path:workspaceRoot, type:'dir'})`；total 7。
- `:65-68` 'src' → `['src','src/app.ts']`、首条 type 'dir'、workspace 0。
- `:84-94` node_modules 及其文件不出现；独立文件绝对路径；附加嵌套文件 path/source 断言。
- `:103-104` 缺失根 → entries `[]`、total 0。
- `:109-110` limit 2 → entries ≤2 且两组之和相等。
- `:120` 根外 `secret.ts` 不出现在任何路径。

## 4. 未覆盖与脆弱点

未覆盖：denyPath、BROWSE 总上限 3000、子序列匹配单测。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言如 §3 | 已证实 | 逐行读 `:1-123` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 双组/匹配/附加/容错/配额/泄露 | 6 | covered |
| denyPath/总上限 | — | unknown |

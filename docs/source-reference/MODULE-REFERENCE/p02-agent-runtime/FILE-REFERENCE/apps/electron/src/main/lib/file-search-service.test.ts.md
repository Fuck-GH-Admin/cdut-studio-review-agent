---
path: apps/electron/src/main/lib/file-search-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1c32b0ae0faf9b52a23c2447ca53868aac9a36fb
sha256: 2e0eab46cd3adf93a372f58d40cfdb4d08663c6fa155df7262ed87016d42ab35
lines: 214
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/file-search-service.test.ts

## 1. 测试目标

`searchFileCandidate`：深度逐个返回/多候选/完整路径四态（命中/不存在/根外/symlink 逃逸）/隐藏目录白名单/取消。

## 2. 用例清单

9 用例 / 1 describe（`searchFileCandidate` :6）。真 mkdtemp+真 symlink（:2）；每例 try/finally 清理。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 深度逐个+alreadyFound 跳过 | 8-31 | root→nested 顺序命中 |
| 2 | 深度搜索多候选 | 33-54 | 两嵌套路径（排序比对） |
| 3 | targetPath 命中只返回该路径 | 56-73 | `candidates:[{nested}]`，不搜同名 |
| 4 | targetPath 不存在不回退 | 75-92 | candidate undefined、空数组 |
| 5 | targetPath 根外拒 | 94-110 | 空结果 |
| 6 | 深度查询最多返回该路径 | 127-144 | 仅 first 路径 |
| 7 | symlink 逃逸拒 | 146-165 | 根内链接→根外文件，空结果 |
| 8 | `.claude` 隐藏目录可搜 | 167-184 | 命中 `.claude/settings.json` |
| 9 | 取消不返回候选 | 186-202 | `cancelled:true`+done+无候选 |

## 3. 真实断言

如 §2 表（逐条读自 :8-202）。

## 4. 未覆盖与脆弱点

- 未覆盖：`denyPath` 围栏（生产注入；本文件未带 denyPath 用例）、MAX_ENTRIES/yield 极限。
- 脆弱点：路径比较全用 `toLowerCase()`（win32 兼容口径）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例断言如 §2 | 已证实 | 本文件逐行 |
| realpath/symlink 防逃逸被固定 | 已证实 | 用例 5/7 |
| denyPath 行为 | 未知（未测） | §4 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 同名递归/alreadyFound/多候选 | §2 | covered |
| targetPath 四态 | §2 | covered |
| 隐藏目录/取消 | §2 | covered |
| denyPath/扫描上限 | §4 | unknown（未测） |

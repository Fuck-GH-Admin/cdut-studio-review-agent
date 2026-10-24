---
path: apps/electron/src/main/lib/attached-directory-project-detector.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 72a8c71877616559ed852d5c6226963a77b5b3fa
sha256: 895bb68a0a4dc0a43d74986379ce0fdfa6ece990f494121317d4e962e5ec242b
lines: 91
kind: test
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/attached-directory-project-detector.test.ts

## 1. 测试目标

直接测试 `attached-directory-project-detector.ts` 的 `detectAttachedDirectoryProjects`（1 个 describe `:16`）：四型识别/排除规则/元数据注入。5 个 `test(`。真实临时目录（mkdtemp+rmSync `:7-14`）。

## 2. 用例清单

| # | 行 | Given-When-Then + 真实断言 |
| --- | --- | --- |
| 1 | `:17-31` | 嵌套 Obsidian Vault→`toContainEqual(expect.objectContaining({type:'obsidian-vault', evidence:['.obsidian/'], name:'AAAI学习大师'}))` |
| 2 | `:33-51` | Git/Node/Python 三型→`toEqual(expect.arrayContaining([...三型 rootPath/type]))` |
| 3 | `:53-60` | node_modules 内标志→`toEqual([])`（排除） |
| 4 | `:62-73` | 仅 dependencies 的外层 package.json 不误报→只报嵌套真项目+`toMatchObject({name:'real-project', packageName})` |
| 5 | `:75-90` | git config remote.origin→`gitRemote` 注入+子项目 `repositoryRoot` 注入 |

## 3. 真实断言

`toContainEqual`/`arrayContaining`/`objectContaining`/`toEqual`/`toMatchObject`。真实 fs 临时目录；无 mock。

## 4. 未覆盖

- 2000 预算/深度 3 截断；worktree gitdir 文件；排序稳定性；同目录多标志优先级。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个 `test(`、断言如 §2 | 已证实 | 文件全读（91 行） |
| 误报防护锁定（用例 3/4） | 已证实 | `:53-73` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 四型/排除/注入 | §2 | `:17-90` | covered |
| §4 边缘 | — | — | unknown |

---
path: apps/electron/src/main/lib/browser-controller-local-file-sentinel.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 03d97380557609b4f9a15f8d15bdd10b786cd5e4
sha256: 68a4579c57a986f4dda110053f4400a3fe7ed62532b37e416a497c4935d6a264
lines: 108
kind: test
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-controller-local-file-sentinel.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

viewer 划词哨兵回投的**信任边界**（头注 :8-11）：主进程只放行本地预览标签自己的文件，其余一律忽略——网页不能借哨兵把内容塞进对话。

## 2. 用例清单

6 用例（顶层 test，无 describe）。夹具 `harness()`（:14-56，替身 owner/tab/session+记录 `BROWSER_LOCAL_FILE_SELECTION` 消息）。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 预览标签转投 | 58-68 | `{sessionId,text,filePath,fileName}` 一条 |
| 2 | 空串也转投 | 70-77 | `text:''`（撤引用胶囊） |
| 3 | 非预览标签忽略 | 79-86 | `sent:[]` |
| 4 | 缺路径忽略 | 88-94 | `sent:[]` |
| 5 | 畸形编码忽略 | 96-103 | `sent:[]`+trace 含「畸形」 |
| 6 | 超长截断 | 105-110 | 恰 `BROWSER_LOCAL_FILE_SELECTION_MAX_CHARS` |

## 3. 真实断言

如 §2 表（逐条读自 :58-110）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实 viewer 页回投（哨兵 URL 端到端）。
- 脆弱点：`internals.emit = () => undefined` 注入（注释 :42「状态广播与本用例无关」）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言如 §2 | 已证实 | 本文件逐行 |
| 三道闸被固定 | 已证实 | 用例 3-5 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 转投/空串撤回 | §2 | covered |
| 三道闸忽略 | §2 | covered |
| 截断上限 | §2 | covered |

---
path: apps/electron/src/main/lib/agent-session-deletion.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 30769fabb180c208934e3e3fd8e26d2669781f42
sha256: 5878f58256185f208dc01869cf207f4943050074532df2eed3cd093d31d7c637
lines: 109
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-deletion.test.ts

## 1. 测试目标

`AgentSessionDeletionCoordinator`（`agent-session-deletion.ts:15`）：等待停止后才清理、并发合并、失败零清理、叶子到根级联、跨事务合并。bun:test；deps 记录替身+手动 release 门（`controlledDeps` `:4-12`）。

## 2. 用例清单

共 **6 个 `test(`**：运行中等待后清理（`:15`）；并发删除合并（`:27`）；stopAndWait 失败不清理但释放锁（`:38`）；多级委派叶子到根（`:45`）；子会话停止失败树内零删除（`:68`）；级联中删子会话合并同事务（`:86`）。

## 3. 真实断言

`:21,24` `['begin','stop']`→释放→`['begin','stop','clear','delete','end']`；`:33` `first` `toBe(second)`；`:42` `['begin','stop','end']`；`:58-65` 14 步全序（begin×3→stop×3→clear/delete 逐对叶到根→end×3）；`:83` `['begin:child','begin:parent','stop:child','end:child','end:parent']`；`:104` 合并 `toBe(parentDeletion)`、`:107` `delete:child` 长度 1。

## 4. 未覆盖与脆弱点

getDeletionOrder 空数组防御（源 `:23-24`）无独立断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/时序断言 | 已证实 | 全 109 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 用例 | §2/§3 | 15-108 | covered |

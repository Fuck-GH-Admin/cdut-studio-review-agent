---
path: apps/electron/src/main/lib/pi-harness/goal-controller.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: eaf1ca53eb4bd9f7188ddbeed777bd06e938b519
sha256: 05412d900d589d843c394a5c1a1c75269b1aea68d02eaf1175a1db53cce79475
lines: 45
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/goal-controller.test.ts

## 1. 测试目标

`decideGoalIntake`（`goal-controller.ts:58`）四类判定与 marker 提取保守性。bun:test；graph/node 构造夹具（`:5-11`），无 mock。

## 2. 用例清单

共 **6 个 `test(`**：`/compact`→manual_compact（`:14`）；已有图→existing_graph+focus 继承（`:18`）；多步执行→minimal_root（`:22`）；仅行级 marker 进 root（`:28`）；疑问句→graphless（`:38`）；goalConflict→minimal_root（`:42`）。

## 3. 真实断言

`:15` toMatchObject kind；`:19` `{kind:'existing_graph', focus:{task:{id:'task-1'}}}`；`:24-25` subject 含原文+description 含“最小任务骨架”；`:33-35` 含两 marker、**`not.toContain('自然语言说它应该通过')`**；`:39` graphless；`:43` minimal_root。

## 4. 未覆盖与脆弱点

正则边界（混合语言/超长消息）、marker >240 字符丢弃分支无独立断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/断言 | 已证实 | 全 45 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 用例 | §2/§3 | 14-44 | covered |

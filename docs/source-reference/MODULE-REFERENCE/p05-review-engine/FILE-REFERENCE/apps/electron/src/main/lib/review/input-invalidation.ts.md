---
path: apps/electron/src/main/lib/review/input-invalidation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dce8ba1f9cc88a18d67cde4082cf22e8861c5755
sha256: 3989d36813869f7e663b723e6b7844d0432ec5821126793a884cc29b8558fa6b
lines: 23
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/input-invalidation.ts

## 1. 结论与边界

审核输入变化后的派生产物失效（23 行纯函数）：输入（申报材料/领域包/事项文档）变化时清除 V1 派生产物（items/rulePacks.outline）；已保存运行不删（注释 :9-10：run-service 按输入指纹标过期）。

## 2. 导出与关键符号

导出 2 条（`export` :3/:13）：

| 符号 | 类型 | 行 | 形状/说明 |
| --- | --- | --- | --- |
| `ReviewInputChanges` | interface | `:3-7` | `{applicationMaterialsChanged?, domainPackChanged?, subjectDocumentsChanged?}` |
| `invalidateDerivedReviewInputs` | function | `:13-23` | `(reviewCase, changes) => ReviewCase` |

## 3. 内部逻辑与关键流程

（:14）`itemsChanged` = 三变化任一；条件（:15）：无任一变化且无 domainPack 变化→原对象返回（测试断言 `toBe(baseCase)` 同一引用）。返回（:16-22）：`itemsChanged`→`items: []`；`domainPackChanged`→各 `rulePacks[].outline: []` + `confirmed: false`（outline/confirmed 不受 itemsChanged 影响）。

## 4. 调用者与调用链

入向（全树检索+子agent交叉核）：
- 生产：`apps/electron/src/main/lib/review/case-import.ts:16`（import）→ 调用 `:268`、`:326`；`apps/electron/src/main/lib/review/review-ipc.ts:64`（import）→ 调用 `:287`。
- 测试：批内 `input-invalidation.test.ts:3`（:14/:20/:27）。`ReviewInputChanges` 类型名无外部显式引用（调用处传对象字面量）。
出向：`@profer/shared` 类型（:1）。

## 5. 数据 I/O、读写与副作用

无 I/O；返回新对象或原引用（不可变风格）。

## 6. 分支、失败、取消与恢复

三分支（:15/:17/:19）；无 throw。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支；失效语义权威=「输入变化清派生、历史运行保留」（:9-10 注释）。

## 8. 修改影响面

影响 V1 案卷复用逻辑（items/rulePacks）与批内 3 用例。

## 9. 测试证据

`input-invalidation.test.ts`（批内，3 用例，NOT_RUN）：新增材料清 items 保留 outline（:18-22）、领域包变化清 outline+confirmed（:24-29）、无关变化返回原引用（:31-33）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；三分支语义 | 已证实 | :13-23；测试 :18-33 |
| 生产调用：case-import:268/:326、review-ipc:287 | 已证实 | 见 §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `invalidateDerivedReviewInputs` 三分支 | §3/§9 | :13-23 | covered |
| `ReviewInputChanges` | §2 | :3-7 | covered |
| 生产调用方 | §4 | case-import:268/:326、review-ipc:287 | covered |

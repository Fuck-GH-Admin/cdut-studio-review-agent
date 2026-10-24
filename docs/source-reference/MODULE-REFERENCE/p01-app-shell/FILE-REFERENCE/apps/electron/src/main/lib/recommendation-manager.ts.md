---
path: apps/electron/src/main/lib/recommendation-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: adbe4ba196fcdaab691b5dffbd3dcc7d8244af8c
sha256: 72b45c7b2ecb14c1b37a74de7bb345261ff9f2bd989c6cd14ac2ccab8531c262
lines: 50
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/recommendation-manager.ts

## 1. 结论与边界

建议存储管理（主进程）：recommendations JSON 的增删查改 + 模块级缓存，含 duplicateKey 去重 upsert 与反馈（snooze/dismiss 等）应用（`apps/electron/src/main/lib/recommendation-manager.ts:1-50`）。

边界：不生成建议内容（`recommendation-engine`）；不定义 `Recommendation` 类型（`@profer/shared`）；落盘路径在 `config-paths.getRecommendationsPath()`。

## 2. 导出与关键符号

`export` 逐条核对：5 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `listRecommendations` | 函数（导出） | 21-23 | `(now = Date.now()) => Recommendation[]` | 可见建议：suggested 或 snoozed 到期 |
| `listAllRecommendations` | 函数（导出） | 24 | `() => Recommendation[]` | 全量副本 |
| `upsertRecommendation` | 函数（导出） | 25-40 | `(input: Omit<Recommendation,'id'\|'createdAt'\|'updatedAt'>) => Recommendation` | 按 duplicateKey upsert |
| `applyRecommendationFeedback` | 函数（导出） | 41-49 | `(input: RecommendationFeedbackInput) => Recommendation \| undefined` | 反馈更新 |
| `resetRecommendationCache` | 函数（导出） | 50 | `() => void` | 清缓存（测试用） |

内部符号：`RecommendationIndex`（`:6`，`{version:1, recommendations}`）、模块级 `cache`（`:7`）、`readIndex`（`:9-16`，缓存优先+格式校验）、`writeIndex`（`:17-20`，缓存+原子写）。

## 3. 内部逻辑与关键流程

1. `readIndex`（`:9-16`）：缓存命中直回；否则 `readJsonFileSafe` 读盘，`version!==1` 或非数组 → 重置空索引（`:12-14`）。
2. `upsertRecommendation`（`:25-40`）：按 `duplicateKey` 查现有（`:27`）；存在且状态为 `suggested/snoozed` → `Object.assign` 覆盖+`updatedAt`+落盘（`:29-32`）；存在但 `dismissed` 等其它状态 → **原样返回不覆盖**（`:33`）；不存在 → 新建（`randomUUID` id，`:35-38`）。
3. `applyRecommendationFeedback`（`:41-49`）：按 id 查找；`status=input.status`；仅 snoozed 保留 `snoozedUntil` 否则置 undefined（`:45`）；找不到返回 undefined（`:43`）。
4. `listRecommendations`（`:21-23`）：过滤 `suggested` 或（`snoozed` 且 `snoozedUntil<=now`）。

## 4. 调用者与调用链

入向（全树检索，证实）：

- `upsertRecommendation`/`listAllRecommendations`：`recommendation-engine.ts:2,14,22,38`。
- `listRecommendations`/`applyRecommendationFeedback`：`ipc.ts:274`（import）、`:7257`（LIST handler）、`:7260`（刷新后返回）、`:7264`（FEEDBACK handler）；渲染侧经 `preload/index.ts:1527,3907`。
- `resetRecommendationCache`：**仅测试**（`recommendation-engine.test.ts:4`）；全树无生产调用点。

出向：`./safe-file`（`readJsonFileSafe`/`writeJsonFileAtomic`，`:2`）、`./config-paths` `getRecommendationsPath`（`:3`）、`node:crypto`（`:1`）、`@profer/shared` 类型（`:4`）。

## 5. 数据 I/O、读写与副作用

- 读写：`getRecommendationsPath()` JSON（读 `:11`，写 `writeJsonFileAtomic` `:19`——原子写在 safe-file）。
- 内存：模块级 `cache`（`:7`），`writeIndex` 同步更新（`:18`）。
- 并发/幂等：单进程内 cache 一致；写覆盖式；`upsert` 以 duplicateKey 幂等。多进程并发不设锁（主进程单例使用，推断）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 索引重置 | version≠1/坏结构 | 12-14 |
| upsert 覆盖 | existing 且 suggested/snoozed | 29-32 |
| upsert 不动 | existing 且其它状态（dismissed） | 33 |
| 新建 | 无 existing | 35-38 |
| 反馈未命中 | id 不存在 | 42-43 |
| snoozedUntil 清理 | status≠snoozed | 45 |

`readJsonFileSafe` 的损坏文件行为（安全读）在 `safe-file`（非本批，标未知细节）；无显式异常路径（本文件无 throw）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；建议状态权威=本存储（feedback 只经 IPC 面提交，`:7264`）。

## 8. 修改影响面

- 消费链：`recommendation-engine`（写）+ `ipc.ts:7257-7264`（读/反馈）→ preload → 渲染建议面板。
- `Recommendation`/`RecommendationFeedbackInput` 类型来自 `@profer/shared`，改字段需同步 `:25-49`。
- duplicateKey 约定由 engine 定义（`schedule:<id>:cadence` 等）。
- 需同步的测试：`recommendation-engine.test.ts`（间接触达本文件；无专属测试）。

## 9. 测试证据

直接测试：**无专属测试文件**。间接证据：`recommendation-engine.test.ts`（本批）经 `upsertRecommendation`/`resetRecommendationCache` 触达本文件（用例断言只看 engine 输出条数/kind，不直接断言本文件行为）。

真实断言：无直接断言。未覆盖：dismissed 不覆盖分支、feedback、snooze 到期过滤、坏索引重置。

NOT_RUN：本轮未运行任何测试/typecheck/构建。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出 + 内部符号 | 已证实 | `:1-50` 逐行读 |
| upsert 三态分支 | 已证实 | `:25-40` |
| feedback 语义 | 已证实 | `:41-49` |
| 调用链 | 已证实 | §4 行号 |
| reset 仅测试使用 | 已证实 | 全树检索 |
| 多进程并发安全 | 推断 | 单进程主进程使用 |
| safe-file 原子性细节 | 未知 | 非本批文件 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2 | 见表 | covered |
| readIndex/writeIndex 缓存 | §3.1 | 7-20 | covered |
| upsert 三态 | §3.2, §6 | 25-40 | covered |
| feedback | §3.3, §6 | 41-49 | covered |
| 调用链 | §4 | - | covered |
| 专属测试 | §9 | - | unknown（无） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

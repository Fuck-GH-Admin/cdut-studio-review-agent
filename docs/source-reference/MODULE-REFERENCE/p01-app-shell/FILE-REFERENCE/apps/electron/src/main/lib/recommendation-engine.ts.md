---
path: apps/electron/src/main/lib/recommendation-engine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7cdd979d5b287ddc6fde678465429db0d42ae10c
sha256: 346372a590d9e23d34f448c649515cebbd0044c605321562d8f288f08f181a75
lines: 53
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/recommendation-engine.ts

## 1. 结论与边界

自动化建议生成器（主进程，纯分析）：从现有 Automation 运行历史生成 `Recommendation`——成功重复 3 次建议固化周期任务（schedule）、连续失败 3 次建议检查（maintenance）；不创建、不修改 Automation（文件头 `apps/electron/src/main/lib/recommendation-engine.ts:12`）。

边界：建议的存储/去重/反馈在 `recommendation-manager`；Automation 数据来源由调用方传入；不执行自动化。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `refreshAutomationRecommendations` | 函数（导出） | 13-53 | `(automations: Automation[], now = Date.now()) => Recommendation[]` | 生成/更新建议 |

内部符号：`WINDOW_MS`（`:4`，14 天）、`SUCCESS_THRESHOLD`（`:5`，3）、`FAILURE_THRESHOLD`（`:6`，3）、`recentRuns`（`:8-10`，按 `runAt >= now - WINDOW_MS` 过滤）。

## 3. 内部逻辑与关键流程

对每个 automation（`:16-51`）：

1. `scheduleType==='once'` 或 `!active` 跳过（`:17`）。
2. **schedule 建议**（`:19-33`）：14 天内 success ≥3 且 duplicateKey `schedule:<id>:cadence` 无 dismissed 记录 → `upsertRecommendation`（kind:'schedule'，confidence `min(0.95, 0.65+successes*0.05)`，safetyLevel 'runs_agent'，action edit_automation）。
3. **maintenance 建议**（`:34-50`）：最近 3 次运行（按 runAt 倒序 slice 3）**全部** error 且 `maintenance:<id>:failures` 无 dismissed → upsert（kind:'maintenance'，confidence 0.9，safetyLevel 'read_only'）。
4. `listAllRecommendations()` 一次性读现有建议（`:14`）做 dismissed 去重判断；返回本次 output（含 upsert 后对象）。

注意：dismissed 判断只看调用开始时的快照（`:14`）；upsert 对 `suggested/snoozed` 状态会覆盖更新（manager 语义，见该手册）。

## 4. 调用者与调用链

入向（全树检索，证实）：`ipc.ts:275`（import）、`:7259`（`refreshAutomationRecommendations(listAutomations())`，RECOMMENDATION IPC 链内）。

出向：`./recommendation-manager` 的 `upsertRecommendation`/`listAllRecommendations`（`:2`）；`@profer/shared` 类型（`:1`）。

## 5. 数据 I/O、读写与副作用

- 本文件不直接 I/O；写副作用经 `upsertRecommendation` 落盘（recommendations JSON）。
- 无网络/无 Automation 写操作（依据：全文读 + `:12` 声明）。
- 并发/幂等：同输入重复调用由 duplicateKey+upsert 幂等；dismissed 的建议不再生成（`:21,:37`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 跳过 once/inactive | scheduleType/active | 17 |
| schedule 建议 | success≥3 且未 dismissed | 21-33 |
| maintenance 建议 | 最近 3 次全 error 且未 dismissed | 35-49 |
| 都不满足 | - | 无输出 |

无异常路径（无 throw）；无取消/恢复概念，依据：纯分析一次成型。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；建议是只读产物（safetyLevel 标注 'runs_agent'/'read_only' 供 UI 提示，`:27,:43`）。

## 8. 修改影响面

- `ipc.ts:7259`（建议刷新链）→ preload → 渲染建议面板。
- 阈值/文案改动影响用户可见建议（reason 文案 `:25,:41`）。
- `recommendation-manager` 的 upsert 语义耦合（duplicateKey 约定 `schedule:<id>:cadence`/`maintenance:<id>:failures`）。
- 需同步的测试：`recommendation-engine.test.ts`（2 用例，本批）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/recommendation-engine.test.ts`（本批，2 用例，逐条见该手册）。真实断言：3 次成功→1 条 kind='schedule'（测试 `:20-21`）；3 次连续失败→1 条 kind='maintenance' 且 once 不生成（`:29-30`）。

未覆盖：dismissed 去重、confidence 计算、snoozed 交互、14 天窗口边界。

NOT_RUN：本轮未运行任何测试/typecheck/构建；断言均为静态读取。

间接证据：无其它测试引用。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 阈值常量 | 已证实 | `:4-13` |
| 两类建议分支条件 | 已证实 | `:19-50` |
| dismissed 快照去重 | 已证实 | `:14,21,37` |
| 唯一调用方 | 已证实 | `ipc.ts:275,7259` |
| upsert 覆盖语义细节 | 已证实 | manager 源 `recommendation-manager.ts:25-40`（交叉读） |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `refreshAutomationRecommendations` | §2-3 | 13-53 | covered |
| `recentRuns`/阈值 | §2 | 4-10 | covered |
| schedule/maintenance 分支 | §3, §6 | 19-50 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

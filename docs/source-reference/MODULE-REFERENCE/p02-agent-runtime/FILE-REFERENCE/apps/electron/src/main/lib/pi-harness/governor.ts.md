---
path: apps/electron/src/main/lib/pi-harness/governor.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 07473d6b3ac37958979dcdcf7d2f951836ad045f
sha256: b8d0690f9fd18cfd977dd9d040aa619a2d4ee6f5297751ef01c155680103bd2f
lines: 68
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/governor.ts

## 1. 结论与边界

**Shadow Governor 候选判定**：只决定是否**记录** shadow 候选，从不导入 Adapter/队列/提示链/自主预算写入方——**不能启动工作**（`governor.ts:18-21`）。首版策略纯观察（域外 types 注释同旨）。纯函数，无 I/O。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GovernorCandidate` | 接口 | `:5` | taskId?/action('required_verification'\|'ready_task')/reason/blockedReason('shadow_mode'\|'permission_mode'\|'repeat_failed_verification')/estimatedPromptChars/fingerprint |
| `decideShadowGovernorCandidate` | 函数 | `:22` | `({graph,goal,assurance?,facts,existingFingerprints}): GovernorCandidate\|undefined` |

内部：`latest`（`:14`，按 timestamp 取最新）。

## 3. 内部逻辑与关键流程

（`:22-68`）四级判定：①goal 非 active→undefined（`:29`）；②permissionMode ≠ bypassPermissions→记 `permission:` 指纹候选（blockedReason:'permission_mode'，**:31-35**）；③assurance pending/failed：**失败后无新成功 file_mutation 则不给候选**（阻断无变化重试循环，`:37-41`）；指纹 `verify:<task>:<state>:<lastFailure>` 去重后记 required_verification（estimatedPromptChars:240，`:42-51`）；④`getReadyTasks` 取最旧就绪任务（排除 active）→`ready:` 指纹去重后记 ready_task（`:54-67`）。全程 `existingFingerprints` 去重防重复记录。

## 4. 调用者与调用链

- 入向：`orchestrator-bridge.ts:10`（settle 时 `reconcileAndRecordShadow` 内，`:205-228`）。
- 出向：`@profer/project-core`（TaskGraph/getReadyTasks）、`./types`（域外 194 行背景件）。

## 5. 数据 I/O、读写与副作用

无（纯判定；事件落盘归 bridge）。

## 6. 分支、失败、取消与恢复

四分支（§3）；无抛错；无执行路径（blockedReason 恒为“被阻断原因”）。

## 7. 权限与权威状态

“只记不跑”权威=函数边界（不 import 启动链）；`manual_candidate_continued`（域外 types）记录用户点击，**绝不授予自主执行**（types.ts:128 注释，域外背景互证）。

## 8. 修改影响面

shadow 候选记录/防重复循环；bridge settle 流程；测试 4 断言锁定。

## 9. 测试证据

`NOT_RUN`。直接测试 `governor.test.ts`（40 行/**4 个 `test(`**）：shadow 只记 required_verification 不执行（`:17-20`）；**失败无 mutation 阻断**（`toBeUndefined()`，`:22-25`）；新 mutation 后给 repair 候选且指纹去重（`:27-33`）；ready_task 只报告不消耗 transition（`taskTransitions` `toBe(0)`，`:35-39`）。无 mock（goal/active/ready/failure 夹具 `:6-14`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四级判定/指纹去重/阻断循环 | 已证实 | `:1-68` 全文 + 4 测试互证 |
| getReadyTasks 语义 | 边界 | project-core 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+判定流程 | §2/§3 | 5-68 | covered |
| 测试 4 用例 | §9 | test 文件 | covered（NOT_RUN） |

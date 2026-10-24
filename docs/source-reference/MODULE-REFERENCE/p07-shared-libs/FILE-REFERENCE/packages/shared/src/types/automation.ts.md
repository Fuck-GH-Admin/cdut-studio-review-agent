---
path: packages/shared/src/types/automation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 28cdf1d5a6878b53fe5f8dc1cda14ee541e2e426
sha256: 66cfa8f027c3200c40954bee0ad6db70ac0b7d62bbfda282716f824924725c0c
lines: 265
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/automation.ts

## 1. 结论与边界

自动化任务**类型 + 调度归一化**模块（`packages/shared/src/types/automation.ts`，265 行）：任务定义/计划/通知/运行历史形状，`normalizeTimeOfDay`/`normalizeDayOfWeek`/`normalizeDayOfMonth` 三个输入清洗函数。

## 2. 导出与关键符号

`export` 共 **21 个**，分 5 组：

**A. 运行与计划（`:9-45`）**：`AutomationRun`（`:9-23`）、`AutomationScheduleType`（`interval/daily/weekly/monthly/once`，`:25`）、`AutomationPermissionMode='bypassPermissions'`（`:32`）+ `AUTOMATION_DEFAULT_PERMISSION_MODE`（`:35`）、`AutomationSessionMode`（`daily/reuse`，`:42`）+ `AUTOMATION_DEFAULT_SESSION_MODE='daily'`（`:45`）。

**B. 通知（`:48-63`）**：`AutomationNotificationTrigger`（`always/success/error`，`:48`）、`AutomationFeishuNotificationTarget`（`:51-61`）、`AutomationNotificationTarget`（`:63`）。

**C. 任务定义（`:66-181`）**：`Automation`（`:66-135`，主体）、`AUTOMATION_MAX_HISTORY=20`（`:137`）、`AUTOMATION_MAX_CONSECUTIVE_FAILURES=5`（`:140`）、`normalizeTimeOfDay`（`:150-157`）、`normalizeDayOfWeek`（`:160-167`）、`normalizeDayOfMonth`（`:170-175`）、`DEFAULT_TIME_OF_DAY=['09:00']`（`:177`）、`DEFAULT_DAY_OF_WEEK=[1]`（`:179`）、`DEFAULT_DAY_OF_MONTH=[1]`（`:181`）。

**D. 输入 DTO（`:184-248`）**：`CreateAutomationInput`（`:184-215`）、`UpdateAutomationInput`（`:217-248`）。

**E. IPC（`:250-265`）**：`AUTOMATION_IPC_CHANNELS`。

## 3. 内部逻辑与关键流程

三个归一化函数（`:150-175`）语义一致：单值/数组→数组，`Set` 去重，`filter` 合法值（时间匹配 `TIME_OF_DAY_PATTERN`；星期 0-6；月 1-31），升序排序。**空输入返回空数组**（调用方回落默认表）。

## 4. 调用者与调用链

消费方：自动化服务/调度器/设置 UI。出向：无。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 输入非数组 | `:151` 等 | 包成单元素数组 |
| 非法值（时间/范围） | `:153`、`:163`、`:173` | 过滤 |
| 重复值 | 同上 | 去重 |
| 空输入 | — | `[]`（不回落默认） |

## 7. 权限与权威状态

`AutomationPermissionMode` 仅 `'bypassPermissions'`（`:32`）——自动化按无人值守运行；权威校验在服务侧。

## 8. 修改影响面

- `AUTOMATION_MAX_HISTORY`/`MAX_CONSECUTIVE_FAILURES` 是服务侧清理/熔断阈值。
- 归一化范围（0-6/1-31）与调度实现耦合。

## 9. 测试证据

- 本批无 automation 专属测试文件（`agent-preset-policy.test` 等不含）；全树检索 `normalizeTimeOfDay` 测试命中见 automation 服务测试（不在本批）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 21 个导出、5 组 | 已证实 | `grep -n "^export"` 全表 |
| 归一化三函数语义 | 已证实 | `:150-175` |
| 空输入不回落默认 | 已证实 | 函数体 |
| 调度/服务行为 | 未知 | 不在本批 |

## 11. 覆盖表

| 组 | 行 | 状态 |
| --- | --- | --- |
| A 运行/计划 | `:9-45` | covered |
| B 通知 | `:48-63` | covered |
| C 定义/归一化 | `:66-181` | covered |
| D 输入 DTO | `:184-248` | covered |
| E IPC | `:250-265` | covered |

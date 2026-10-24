---
path: apps/electron/src/renderer/atoms/automation-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5680dbecbc39e032c55b7409e51dc536e988f674
sha256: db5e1bc470fdef0189f4b08b779d1024b66be7d8a392d277220c71bd7b681b5c
lines: 128
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/automation-atoms.ts

## 1. 结论与边界

定时任务状态管理（头注释 :2-6）：任务列表+表单草稿（表单复用中间内容区非弹窗）。

## 2. 导出与关键符号

导出 8 条（`export` :20/:27/:52/:57/:63/:84/:108/:119）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `automationsAtom` | `:20` | 任务列表（初始化器加载+订阅刷新） |
| `AutomationDraft` | `:27-49` | 表单草稿（无 id=创建/有 id=编辑 :22-26） |
| `AutomationFormState` | `:52-55` | 开关+草稿 |
| `automationFormAtom` | `:57-60` | |
| `createEmptyDraft()` | `:63-78` | 空白草稿（interval/10min/09:00/pi/默认权限+会话模式） |
| `automationToDraft(a)` | `:84-105` | **集中映射防漏改**（:82-83 注释）；timeOfDay/dayOfWeek/dayOfMonth 数组兼容归一（:91-93） |
| `AUTOMATION_INTERVAL_OPTIONS`/`AUTOMATION_WEEKDAY_OPTIONS` | `:108-127` | 选项常量（0=周日） |

## 3. 内部逻辑与关键流程

automationToDraft 兼容归一（旧标量→数组）；agentRuntime 必须显式保存防调度器回退 Claude（:39 注释）。

## 4. 调用者与调用链

入向：定时任务视图/表单。出向：`@profer/shared`（AUTOMATION_DEFAULT_* :17）。

## 5-7. 数据/分支/权限

纯状态+映射；兼容归一分支；不适用。

## 8. 修改影响面

- 消费面：定时任务 UI 全链。
- 依赖面：Automation 类型+默认常量。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 8 条；集中映射+兼容归一 | 已证实 | :84-105 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出+映射 | §2/§3 | :20-127 | covered |

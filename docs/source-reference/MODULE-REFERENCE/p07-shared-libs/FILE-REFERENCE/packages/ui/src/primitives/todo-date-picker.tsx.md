---
path: packages/ui/src/primitives/todo-date-picker.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 401c25b13bdb835374071e83f9184c9c7d34cd63
sha256: 2d0dfdf7493268fe6d57be95c55b1ccc5297bdc1b56c3e7ddb27e638bb3c49ef
lines: 155
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/ui/src/primitives/todo-date-picker.tsx

## 1. 结论与边界

面向 Todo 的**滴答清单式日期优先选择器**（组件注释 `packages/ui/src/primitives/todo-date-picker.tsx:81-84`）：默认只选日期；用户主动进「时间」页才写精确时分。含 3 个导出工具函数（日期语义）+ 1 组件。有交互状态（React useState/useEffect），无 I/O/持久化（值经 `onChange` 回传调用方）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `endOfTodoDay` | 导出函数 | 14-18 | `(value = Date.now()): number` | 当天 23:59:59.999 |
| `isTodoDateOnly` | 导出函数 | 21-24 | `(value: number): boolean` | 判 `hours===23 && minutes===59`（启发式，`:20` 注释：日期型以当地当天结束时间存储） |
| `formatTodoDueDate` | 导出函数 | 26-33 | `(value?: number): string` | 今天/明天/`zh-CN` 月日周；带时分时追加 `· HH:mm`；空值返回 `'设置计划日期'` |
| `TodoDatePickerProps` | 导出接口 | 67-79 | `{value?, onChange, label?, className?, disabled?, dateOnly?, allowClear?=true, timeRequired?}` | `:73-78` 注释：dateOnly=全天日程；allowClear=日程不可清除；timeRequired=保留精确时间 |
| `TodoDatePicker` | 导出组件 | 85-155 | `(props): React.ReactElement` | 主组件 |

内部：`startOfDay`（`:8`）、`addDays`（`:35`）、`addMonths`（`:41`，置日 1）、`nextMonday`（`:47`，`(8-getDay())%7||7`）、`setDate`（`:52`，保原时分）、`setTime`（`:59`）、`pad`（`:65`）。依赖 `./button`/`./input`/`./popover`、`../lib/cn`、lucide 图标（`:1-6`）。

## 3. 内部逻辑与关键流程

- 状态（`:87-93`）：open/tab('date'|'time')/draft/month/hasTime/hourText/minuteText；`effectiveValue = dateOnly && value!==undefined ? endOfTodoDay(value) : value`（`:86`）。
- 打开重置 effect（`:95-104`）：draft=有效值或当天末、hasTime 按 dateOnly/timeRequired/`isTodoDateOnly` 推导、tab 回 'date'。
- `enableTime`（`:112-120`）：dateOnly 直接 return；date-only 值默认改 09:00（`:117`）。
- `selectDate`（`:122-124`）：dateOnly 或无时分 → `endOfTodoDay(day)`（当天末），否则保时分换日期。
- `applyTime`（`:126-137`）：小时 0-23/分 0-59 整数校验，非法**静默还原**文本（`:129-134`）；合法置 hasTime 并写入。
- 日历网格（`:139-143`）：周一起始（`(getDay()+6)%7`）、42 格；快捷项 今天/明天/下周一（`:146-150`）+「无日期」（allowClear 时 `setDraft(undefined)`，`:154`）；预设时间 `[9,12,14,18]` 点（`:151`）；自定义时/分 Input 数字过滤 2 位、blur/Enter 提交（`:154`）。
- 提交：「确定」`onChange(draft)`、「清除」`onChange(undefined)`（仅 allowClear）后关弹层（`:154` 整行 JSX）。

## 4. 调用者与调用链

入向：2 个消费文件——`apps/electron/src/renderer/components/planning/CalendarWorkspace.tsx:17`（`TodoDatePicker` + `isTodoDateOnly`）、`apps/electron/src/renderer/components/planning/PlanningView.tsx:25`（`TodoDatePicker` + `formatTodoDueDate`）。出向：`./button`、`./input`、`./popover`、`../lib/cn`、`lucide-react`。

## 5. 数据 I/O、读写与副作用

无磁盘/网络；值语义：日期型=当地当天末时刻（`endOfTodoDay`），时间型=精确时分——存储约定由调用方执行（`isTodoDateOnly` 提供判定）。

## 6. 分支、失败、取消与恢复

- `dateOnly`：隐藏时间页、`effectiveValue` 归一当天末（`:86/:113/:123`）。
- `allowClear=false`：隐藏「无日期」与「清除」（`:154` 条件渲染）。
- `timeRequired`：隐藏「不设置」按钮、提示文案变化（`:154`）。
- 非法时间输入静默还原（`:129-134`）；无抛错路径。

## 7. 权限与权威状态

无权限分支（纯交互组件）；日期语义权威=本文件导出工具（`endOfTodoDay`/`isTodoDateOnly`），CalendarWorkspace 与之共享约定。

## 8. 修改影响面

改日期语义（`endOfTodoDay`/`isTodoDateOnly`）影响 `CalendarWorkspace.tsx:17` 的日程/Todo 存储与显示判定；改 UI 影响计划视图。

## 9. 测试证据

无测试（primitives 无 `*.test.*`）；NOT_RUN。注意 `isTodoDateOnly` 的判定（`hours===23 && minutes===59`）未校验秒/毫秒（`:21-24`）——恰 23:59 但秒非 59 的用户选时值会被误判为日期型（推断-静态边界）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+7 内部函数与分支 | 已证实 | `packages/ui/src/primitives/todo-date-picker.tsx:8-155` |
| 日期型=当天末存储约定 | 已证实 | `:14-24` |
| 09:00 默认/快捷三键/预设四时点 | 已证实 | `:117/:146-151` |
| isTodoDateOnly 边界误判可能 | 推断 | `:21-24` 判定字段组合 |
| 运行/交互表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2 | 14-155 | covered |
| 内部流程（状态/选择/校验/网格） | §3 | 85-154 | covered |
| dateOnly/allowClear/timeRequired | §6 | 86-154 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |

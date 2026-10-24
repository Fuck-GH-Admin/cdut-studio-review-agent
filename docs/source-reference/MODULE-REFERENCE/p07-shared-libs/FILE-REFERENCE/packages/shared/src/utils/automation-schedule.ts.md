---
path: packages/shared/src/utils/automation-schedule.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 732b50916edfea52f38bb1a4f0a6d0d7355e99ac
sha256: 263a767e8727487b104ddd46ad3f1fe5b1f908fd1a971a9bb8b564d8ec3e870c
lines: 219
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/automation-schedule.ts

## 1. 结论与边界

定时任务**触发时间展开**（日历视图展示用，`packages/shared/src/utils/automation-schedule.ts:1-5`）：调度器（`apps/electron/src/main/lib/automation-manager.ts`）持久化 `nextRunAt` 锚点，本模块按调度规则展开可见范围内全部未来触发时间并按天聚合。适配多值调度（timeOfDay/dayOfWeek/dayOfMonth 为数组）：interval 锚点等距、daily 逐天、weekly 7 天窗×多星期、monthly 多日期×短月钳制、once 单点（`:7-14`）。

边界：展开规则须与主进程 `computeNextRunAtMulti` **保持一致**（`:14`，一致性靠人工维持）；不决定触发执行；**本地时区**语义（`:30,47`，与 beijing-time.ts 的北京固化口径不同——两个模块时区口径不同，照实记录）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AutomationScheduleFields` | type | 21-24 | `Pick<Automation,'scheduleType'\|'nextRunAt'> & Partial<Pick<…,intervalMinutes\|timeOfDay\|dayOfWeek\|dayOfMonth\|scheduledAt\|maxRuns\|runCount>>` | |
| `AutomationOccurrenceDay` | interface | 27-34 | `{day:number(本地 0 点); times:number[](升序, ≤4); count:number}` | |
| `AUTOMATION_OCCURRENCE_SAMPLES_PER_DAY` | const | 37 | `4` | 每天保留样本上限，超出以 count 聚合 |
| `getAutomationOccurrencesByDay` | function | 201-219 | `(automation, rangeStart, rangeEnd) => AutomationOccurrenceDay[]` | 按天聚合升序 |

内部：`MAX_ITERATIONS=100_000`（`:39-40`，interval=1min×42 天≈6 万，兜底不失控）、`startOfDayTs`（`:45-49`）、`daysInMonth`（`:51-53`）、`timesOnDate`（`:56-67`，HH:MM 钳制 0-23/0-59，非法回 9:00）、`clampDom`（`:70-72`）、`iterateOccurrences`（`:80-195`，生成器）。

## 3. 内部逻辑与关键流程

`iterateOccurrences`（`:80-195`）顺序：

1. `:85-91` nextRunAt 非有限/≤0 → 空；`remaining = maxRuns - (runCount ?? 0)`（≤0 → 空）。
2. once（`:96-99`）：仅 `nextRunAt∈[rangeStart,rangeEnd]` 单点。
3. interval（`:102-121`）：`intervalMinutes<1` → 空；`ts<rangeStart` 数学快进（`skip=floor((rangeStart-ts)/step)`，`:107-110`）；等距产出至 rangeEnd/remaining/guard。
4. daily（`:129-143`）：从 `startOfDayTs(nextRunAt)` 逐天，每天 `timesOnDate` 升序；**`ts>=nextRunAt` 且在窗内才产出**（`:134`，锚点前不产）。
5. weekly（`:145-170`）：`normalizeDayOfWeek`（空则用 nextRunAt 的星期，`:147`）；从 nextRunAt 所在周的**周一**起（`:149-150`，`getDay()` 本地口径）逐 7 天窗展开；`:165-167` 双 break 护栏。
6. monthly（`:172-194`）：`normalizeDayOfMonth`（空则 [1]）；从锚点月起逐月；`clampDom(dom, lastDay)` 短月钳制（`:180-182`）；月内多日期×多时刻。

`getAutomationOccurrencesByDay`（`:201-219`）：`rangeEnd<rangeStart` → `[]`；Map 按 `startOfDayTs(ts)` 分桶，`times` 仅留前 4、`count` 全量计数；按 day 升序返回。

## 4. 调用者与调用链

出向：`../types/automation`（Automation 类型 + `normalizeTimeOfDay/normalizeDayOfWeek/normalizeDayOfMonth` 运行时归一化，`:17-18`）。入向（检索=符号名+模块名，全冻结树）：`apps/electron/src/renderer/components/planning/CalendarWorkspace.tsx:6,533,720,723`（`getAutomationOccurrencesByDay`+`AUTOMATION_OCCURRENCE_SAMPLES_PER_DAY`，**唯一产品调用**，仅 renderer）；`AutomationScheduleFields`/`AutomationOccurrenceDay` 零外部引用（仅 barrel）。**无任何测试**（`*.test.ts` 全树零命中）。同名碰撞警示：`apps/electron/src/main/lib/automation-scheduler.ts` 是 electron 自有调度器，非本模块。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯生成器+纯函数；不写状态。

## 6. 分支、失败、取消与恢复

无异常路径（非法输入静默空/钳制）；生成器惰性、`MAX_ITERATIONS` 兜底防失控（`:39-40`）；无异步/取消。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。调度权威= `nextRunAt`（`:76`：锚点前的周期不发生）；`maxRuns-runCount` 剩余量语义（`:77,87-90`）。

## 8. 修改影响面

- 展开口径须与 `apps/electron/src/main/lib/automation-manager.ts` 的 `computeNextRunAtMulti` 同步（`:14`）——单侧修改会致日历显示与实际触发漂移。
- `AUTOMATION_OCCURRENCE_SAMPLES_PER_DAY` 影响 UI 逐点展示。
- 时区口径（本地）与 `beijing-time.ts`（北京固化）不同：两个模块勿混用（见 §10）。

## 9. 测试证据

无直接测试文件（本批 18 文件无 automation-schedule 测试；外部覆盖见 UNVERIFIED 补记）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 五型展开 + 锚点语义 + maxRuns 限次 | 已证实 | `:80-195` |
| monthly 短月钳制 | 已证实 | `:180-182` |
| 每日样本 4 上限 + count 全量 | 已证实 | `:215-216` |
| 本地时区口径（Date.setHours/getDay） | 已证实 | `:45-49,56-67,149-150` |
| 与 computeNextRunAtMulti 一致性靠人工维持 | 已证实（注释约定） | `:14` |
| 生产 caller / 测试覆盖 | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | 21-201 | covered |
| once/interval | §3 | 96-121 | covered |
| daily/weekly/monthly | §3 | 129-194 | covered |
| 聚合分桶 | §3 | 201-219 | covered |

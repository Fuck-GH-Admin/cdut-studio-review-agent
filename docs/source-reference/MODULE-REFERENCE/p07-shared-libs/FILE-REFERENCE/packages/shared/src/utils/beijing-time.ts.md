---
path: packages/shared/src/utils/beijing-time.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b0c998dcad99223832cba0ee5d793de39fd84d1b
sha256: fc0f31d51c00d056b0f19132d7e80b3820c7828ada071f2cc18fe83ca57e86d8
lines: 226
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/beijing-time.ts

## 1. 结论与边界

标准北京时间 + CDUT 教学作息 + 实时课程雷达（主/渲染进程**同构纯函数**，`packages/shared/src/utils/beijing-time.ts:1-12`）。文件头记顽固 Bug 根因（`:4-8`）：宿主时区 `getDay/getHours` 在海外/夏令时下把北京晚间误判早课、雷达静态布尔不随时间推进——故以 `Intl.DateTimeFormat('Asia/Shanghai')` 固化北京时间、教学周/节次/24h 滑窗收敛为纯函数（渲染层按分钟重算自动切课）。

边界：不读课表数据源（课程数组由调用方传入）；教学周是**纯启发式**（`:129-132`：秋 9 月/春 3 月首个周一为第 1 周，夹取 [1,25]，不与具体学期硬编码耦合）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `BeijingTimeInfo` | interface | 22-38 | `{year;month;day;dayOfWeek(1=周一…7=周日);hour;minute;second;minutesOfDay;midnightMs;epochMs}` | 全部北京日历数值 |
| `CdutSectionPeriod` | interface | 41-48 | `{startSection;endSection;startMin;endMin}` | |
| `LiveScheduleCourse` | interface | 51-59 | `{dayOfWeek;startSection;endSection;weekList:number[](空=全学期);isOngoing?;isNext?}` | 课表最小结构 |
| `CourseLiveStatus<T>` | interface | 62-69 | `{ongoing:T\|null; next:T\|null; markedCourses:T[]}` | markedCourses 为不改入参的浅拷贝 |
| `CDUT_SECTION_PERIODS` | const | 75-82 | 6 段作息（1-2/3-4/5-6/7-8/9-10/11） | 11 节制契约，**严禁第 12 节**（`:72-74`）；第 11 节 20:50-21:35 单节 |
| `getBeijingTimeInfo` | function | 97-127 | `(now?: Date) => BeijingTimeInfo` | |
| `computeBeijingTeachingWeek` | function | 146-148 | `(now?: Date) => number` | 1-25 |
| `evaluateCourseLiveStatus` | function | 170-226 | `<T extends LiveScheduleCourse>(courses: T[], info?) => CourseLiveStatus<T>` | 实时雷达 |

内部：`DAY_MS/WINDOW_MS/BEIJING_OFFSET_MS`（`:15-19`）、`BEIJING_PARTS_FMT`（`:85-94`，en-GB+h23 纯数字，`:84`）、`teachingWeekFromInfo`（`:133-143`）、`sectionRangeFor`（`:151-161`）。

## 3. 内部逻辑与关键流程

### 3.1 `getBeijingTimeInfo`（`:97-127`）

`formatToParts` 提取 6 个数字字段（缺失/非法 → 0，`:99-103`）；星期用「北京日历日的 UTC 星期反推」（`:111-113`，`Date.UTC(y,m-1,d).getUTCDay()`，0→7）避开宿主时区；`midnightMs = Date.UTC(y,m-1,d) - 8h`（`:124`）。

### 3.2 `teachingWeekFromInfo`（`:133-143`）

秋学期（月≥7 或 ≤1）9 月起点、春学期 3 月起点（`:134-137`，1 月属上一学年）；首个周一 = 当月 1 日 UTC 星期回退（`:138-140`，统一到北京零点尺度防整周偏移）；`week=floor((midnightMs-mondayMs)/7d)+1` 夹取 [1,25]。

### 3.3 `sectionRangeFor`（`:151-161`）

节次区间与 6 段作息求交（重叠即并入），取最早 start/最晚 end（兼容 3 小节连排）；无重叠 → null。

### 3.4 `evaluateCourseLiveStatus`（`:170-226`）

1. `:177-178` `scheduledInWeek`：weekList 空 = 全学期。
2. `:180-191` **isOngoing**：dayOfWeek 相同 + 本周排课 + `minutesOfDay∈[range]`；同段多门全标 ongoing，`ongoingIdx` 取首个。
3. `:193-213` **isNext**（仅当无 ongoing）：逐课算 `dist=(dow差+7)%7`、`weekOffset=floor((dow-1+dist)/7)`（周日夜间跨周 +1，`:202`）；`startMs=midnightMs+dist*86400s+range.start*60s`；`delta=startMs-epochMs` 须 `0<delta≤24h`（`:206-207`，今天已开/已结束的顺延下周后自然出窗）；取最早 startMs。
4. `:215-225` `markedCourses` 浅拷贝重算双标记（不改入参）；返回三元组。

## 4. 调用者与调用链

出向：无 import（Intl/Date 内建）。入向（检索=符号名+模块名，全冻结树，均经 `@profer/shared` barrel `index.ts:278-288`）：

- **main**：`apps/electron/src/main/lib/cdut/cdut-jw-client.ts:32-35,827,834,845,2166`（`CDUT_SECTION_PERIODS` 再导出、`computeBeijingTeachingWeek`、`getBeijingTimeInfo`、`evaluateCourseLiveStatus`）。
- **renderer**：`apps/electron/src/renderer/components/cdut-zone/sheets/ScheduleDomainSheet.tsx:26-27,101,107,244,248,345`（全四函数 + BeijingTimeInfo 类型）。
- 测试：`beijing-time.test.ts`（本批，15 it）；`apps/electron/test/cdut-jw-parsers.test.ts:24,162-169`（24 it，作息表/教学周断言）。
- `CdutSectionPeriod`/`CourseLiveStatus` 类型：仅定义+barrel（零外部引用）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数 + 模块级常量/格式化器；不写状态。

## 6. 分支、失败、取消与恢复

无异常路径（字段提取失败回 0）；无异步。「恢复」语义=渲染层按分钟重算（`:11` 注释约定）。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。作息表 `CDUT_SECTION_PERIODS` 是**契约常量**（11 节制，`:72`），权威来自校方作息声明（非运行时校验）。

## 8. 修改影响面

- 改作息表 → 全部节次判定（雷达/显示）联动；`beijing-time.test.ts` 断言会红。
- 改周次启发式（`:133-143`）→ 雷达排课判定整体偏移（无学期锚，改前须评估）。
- `evaluateCourseLiveStatus` 的 `T extends` 泛型保留入参类型，调用方展示字段（isOngoing/isNext）契约随 `markedCourses` 形状。

## 9. 测试证据

直接测试 `packages/shared/src/utils/beijing-time.test.ts`（本批，143 行；断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| Intl 固化 + UTC 星期反推（无宿主时区依赖） | 已证实 | `:85-113` |
| 11 节制作息契约 | 已证实 | `:72-82` |
| isNext 24h 严格窗口 + 跨周衔接 | 已证实 | `:201-207` |
| 同段多门全标 ongoing | 已证实 | `:188-189` |
| 周次启发式非学期精确 | 已证实（注释自认） | `:129-132` |
| 生产 caller 分布 | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 interface + 1 const + 3 函数 | §2 | 22-226 | covered |
| `getBeijingTimeInfo` | §3.1 | 97-127 | covered |
| 周次启发式 | §3.2 | 133-143 | covered |
| `sectionRangeFor` | §3.3 | 151-161 | covered |
| 雷达双判定 | §3.4 | 170-226 | covered |

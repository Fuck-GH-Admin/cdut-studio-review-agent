---
path: apps/electron/src/renderer/lib/beijing-greeting.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e3a331d61a4047711df56672948eb148dee2dc5e
sha256: 523466dd1f2bd77f4e59910742ca9f3a2100bd4be7cc763af74a853a9616cdb7
lines: 214
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/beijing-greeting.ts

## 1. 结论与边界

**北京时间问候与时钟纯函数模块**（214 行，无 DOM/React 依赖，`beijing-greeting.ts:2`）：问候语、HH:mm(:ss) 文本、表盘角度、锚点连续旋转推导、重锚判定。抽出原因：曾被「zh-CN + hour:'numeric' 返回『17时』」击穿致 17:43 显示「夜深了」（`:4-5`）。边界：一律以 Asia/Shanghai 为准，与宿主时区无关（`:103`）。

## 2. 导出与关键符号

导出 14 条（5 类型 + 9 函数）。类型：`BeijingGreetingParts`（`:9`）、`BeijingTimeNumbers`（`:46`）、`BeijingClockAngles`（`:56`，extends BeijingTimeNumbers）、`BeijingClockAnchor`（`:155`）、`BeijingClockRotations`（`:163`）。函数：`getBeijingHour`（`:89`）、`greetingForBeijingHour`（`:95`）、`getBeijingGreetingParts`（`:104`）、`getBeijingTimeNumbers`（`:117`）、`formatBeijingClock`（`:128`）、`getBeijingClockAngles`（`:139`）、`createBeijingClockAnchor`（`:170`）、`resolveBeijingClockRotations`（`:183`）、`shouldRebaseClockAnchor`（`:207`）。内部符号（均标"内部"）：`BEIJING_HOUR_FMT`（`:19`）、`BEIJING_TIME_FMT`（`:26`）、`BEIJING_HMS_PARTS_FMT`（`:37`）三个模块级 Intl 格式化器；`pad2`（`:70`，内部）、`readNumericPart`（`:75`，内部）。

## 3. 内部逻辑与关键流程

- 小时解析（`beijing-greeting.ts:89-92`）：`Number(BEIJING_HOUR_FMT.format(now))`（en-GB + h23 恒输出 "00"-"23"，`:18`），失败退化 12（`:91`），并 `((p%24)+24)%24` 归一化。
- 问候分段（`:95-101`）：5≤h<12 早上好；12≤h<14 中午好；14≤h<18 下午好；18≤h<24 晚上好；其余（0-4 时）夜深了。
- `getBeijingGreetingParts`（`:104-111`）：组合 greeting+hour+timeText（zh-CN HH:mm，`:26-31`）。
- `getBeijingTimeNumbers`（`:117-125`）：formatToParts 取纯数字（`:118`），hour 失败→12、minute/second 失败→0（`readNumericPart` `:75-81` 缺失/非法返 null）。
- `formatBeijingClock`（`:128-131`）：`pad2` 拼 HH:mm:ss。
- `getBeijingClockAngles`（`:139-152`）：时针 `(h%12)*30 + m*0.5 + s/120 + ms/120000`（`:147`）、分针 `m*6 + s*0.1 + ms*0.0001`（`:148`）、秒针机械跳秒 `s*6`（`:149`），含 clockText（`:150`）。
- 锚点与旋转（`:170-198`）：`createBeijingClockAnchor` 记 atMs+angles（`:170-172`）；`resolveBeijingClockRotations` 从锚点纯推导——时针 `+elapsedSeconds*(360/43200)`、分针 `+elapsedSeconds*0.1`、秒针按整秒 `+elapsedWholeSeconds*6`（`:194-198`），`Math.max(0,...)` 防负向（`:187`、`:190`）。
- 重锚判定（`:207-214`）：`gapMs < 0`（时间回拨）或 `gapMs > maxGapMs`（默认 1500ms，休眠唤醒）→ true。

## 4. 调用者与调用链

- 入向：`apps/electron/src/renderer/components/cdut-zone/sheets/ScheduleDomainSheet.tsx:29` import `formatBeijingClock`（`:107`）；`welcome/BeijingAnalogClock.tsx:14-18` import 4 锚点函数（`:48-56` 调用 getBeijingClockAngles/createBeijingClockAnchor/shouldRebaseClockAnchor/resolveBeijingClockRotations）；`welcome/WelcomeEmptyState.tsx:32` import（`:98` getBeijingGreetingParts、`:99` getBeijingClockAngles）。测试：`apps/electron/test/beijing-greeting.test.ts:11-19` import 全部 9 函数。
- 出向：无运行时 import（仅 Intl 内建）。
- 动态调用：未知；检索方式——冻结树 grep 模块名与 9 个导出函数名（*.ts/*.tsx），无 import()/require()，preload 桥无引用。

## 5. 数据 I/O、读写与副作用

纯函数模块：模块级只读 Intl 实例（避免每秒重建，`:35-36`），无缓存/Map 写入、无 DOM/toast/窗口/事件副作用；入参 Date 不被修改。

## 6. 分支、失败、取消与恢复

解析失败兜底：hour→12（`:91`、`:121`）、minute/second→0（`:122-123`）；小时归一化 `((p%24)+24)%24`（`:91`、`:121`）；`greetingForBeijingHour` 落空区间兜底「夜深了」（`:100`）；旋转推导 `elapsedMs` 负向钳 0（`:187`）、整秒差钳 0（`:190-193`）防父级定时器毫秒抖动污染跳秒（`:189`）。历史 Bug 防线：禁止改回「逐帧比较角度+360° 取模累加」——浮点误差致约 359.999° 整圈跳闪（`:177-179`）；同一 now 多次调用结果一致，免疫 StrictMode 双调用（`:181`）。无 throw、无异步。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威口径：时间权威为 IANA 时区 Asia/Shanghai（`:21`、`:27`、`:39`）。

## 8. 修改影响面

WelcomeEmptyState（问候+时钟文本）、BeijingAnalogClock（指针旋转）、ScheduleDomainSheet（时钟药丸）；en-GB/h23 格式化器被改回 zh-CN numeric 会复现「17时」回归（`:86-88`）。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。间接证据：`apps/electron/test/beijing-greeting.test.ts`（218 行，7 个 describe，BDD-GREETING-01~07），如 `:35` 取 hour、`:37` expect hour=17、`:61-65` 五时段文案、`:81` expect /^17:43:\d{2}$/、`:142-153` 时区隔离、`:165-166` 同 now 幂等、`:210-216` 重锚 true/false。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 格式化器口径/兜底/角度公式 | 已证实 | `beijing-greeting.ts:19-43,89-152` |
| 旋转推导与重锚语义 | 已证实 | `beijing-greeting.ts:183-214` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| getBeijingHour / greetingForBeijingHour | §3/§6 | 89-101 | covered |
| getBeijingGreetingParts / getBeijingTimeNumbers | §3 | 104-125 | covered |
| formatBeijingClock / getBeijingClockAngles | §3 | 128-152 | covered |
| createBeijingClockAnchor / resolveBeijingClockRotations | §3/§6 | 170-198 | covered |
| shouldRebaseClockAnchor | §3/§6 | 207-214 | covered |
| pad2 / readNumericPart（内部） | §2/§3 | 70-81 | covered |

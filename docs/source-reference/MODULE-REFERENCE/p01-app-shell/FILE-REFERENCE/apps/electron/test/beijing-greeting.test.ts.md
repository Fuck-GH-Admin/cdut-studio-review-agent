---
path: apps/electron/test/beijing-greeting.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3a915e8ab4563c274a3e00506725f99558b8cef2
sha256: fe83f2acc51136c7757ef74c0533832c6bf63ef19f5ddaaa652aaa517ff99af5
lines: 218
kind: test
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/test/beijing-greeting.test.ts

## 1. 测试目标
对纯函数模块 `apps/electron/src/renderer/lib/beijing-greeting.ts`（214 行）的北京时间解析/问候/时钟/表盘角度/锚点推导做回归锁定（`beijing-greeting.test.ts:1-7` 注释自述历史 Bug：`zh-CN + hour:'numeric'` 输出「17时」致 `Number()` NaN，17:43 被误判为「夜深了」）。被测 9 个函数（导入 `:10-20`）：`getBeijingHour`/`greetingForBeijingHour`/`getBeijingGreetingParts`/`getBeijingTimeNumbers`/`formatBeijingClock`/`getBeijingClockAngles`/`createBeijingClockAnchor`/`resolveBeijingClockRotations`/`shouldRebaseClockAnchor`（定义分别在 `beijing-greeting.ts:89/:95/:104/:117/:128/:139/:170/:183/:207`）。

## 2. 用例清单
用例计数：`it(` 实测 21 个、`describe(` 7 组、`test(` 0（grep 实测；测试运行器为 bun:test，`beijing-greeting.test.ts:9`）。夹具：`beijingInstant`（`:23-26`）/`beijingInstantHms`（`:29-31`）用 UTC 时刻表达北京时间（+8h），隔离测试机时区。

| # | describe（BDD 编号） | it 行 | 设置/动作 | 断言行 |
| --- | --- | --- | --- | --- |
| 1 | getBeijingHour（BDD-GREETING-01，`:33`） | :34 | 17:43 取小时 | :36-37（有限且=17） |
| 2 | 同上 | :40 | 24 整点逐一取小时 | :42（=h） |
| 3 | 同上 | :46 | 午夜 00:00 | :47（=0 而非 24） |
| 4 | getBeijingGreetingParts（BDD-GREETING-02，`:51`） | :52 | 17:43 生成问候 | :54-57（hour=17、含「下午好」、不含「夜深了」、timeText=17:43） |
| 5 | 同上 | :60 | 6/12/15/20/2 时问候 | :61-65（五时段文案） |
| 6 | 同上 | :68 | 边界 5/11/13/18/23/0/4 | :69-75（区间归属） |
| 7 | formatBeijingClock（BDD-GREETING-03，`:79`） | :80 | 17:43 格式化 | :81（/^17:43:\d{2}$/） |
| 8 | 同上 | :84 | 24 整点格式化 | :87-89（无「时/分」后缀、HH:mm:ss） |
| 9 | getBeijingClockAngles（BDD-GREETING-04，`:94`） | :95 | 10:04:18 | :97-106（时 302.15/分 25.8/秒 108、clockText） |
| 10 | 同上 | :109 | 00:00:00 与 12:00:00 | :112-115（三角度归零） |
| 11 | 同上 | :119 | 23:59:59 | :121-122（时针∈(0,360)） |
| 12 | 同上 | :125 | 全天整点×第 0/59 秒 | :130-132（三角有限∈[0,360)） |
| 13 | 时区隔离（BDD-GREETING-05，`:140`） | :141 | UTC 00:30:45Z | :144-148（数字 8:30:45、秒 270/分 184.5/时 255.375） |
| 14 | 同上 | :152 | UTC 17:00:00Z 跨日 | :155-158（归次日 01:00:00） |
| 15 | resolveBeijingClockRotations（BDD-GREETING-06，`:161`） | :162 | 同 now 解析两次 | :165-167（结果全等） |
| 16 | 同上 | :170 | 锚点+1 秒 | :175-177（秒+6°/分+0.1°/时+1/120°） |
| 17 | 同上 | :180 | 23:59:59→00:00:00 | :184-185（354→360 不回退） |
| 18 | 同上 | :188 | 跨 1 小时 | :193-195（+30°/+360°/+21600°） |
| 19 | 同上 | :197 | 锚点含 500ms | :201-203（毫秒参与时/分角） |
| 20 | shouldRebaseClockAnchor（BDD-GREETING-07，`:206`） | :209 | tick+1s/+1.4s | :211-212（false） |
| 21 | 同上 | :214 | +8h/时间回拨 | :216-217（true） |

## 3. 真实断言
代表性真实断言（bun:test `expect`）：`expect(hour).toBe(17)`（`:37`）；`expect(greeting).not.toContain('夜深了')`（`:56`）；`expect(timeText).toBe('17:43')`（`:57`）；`expect(formatBeijingClock(...)).toMatch(/^17:43:\d{2}$/)`（`:81`）；`expect(angles.hourAngle).toBeCloseTo(302.15, 5)`（`:101`，注释给出公式 10*30+4*0.5+18/120）；`expect(angles.secondAngle).toBe(108)`（`:105`）；`expect(numbers).toEqual({ hour: 8, minute: 30, second: 45 })`（`:144`）；`expect(rotations.secondRotation - anchor.angles.secondAngle).toBe(6)`（`:175`）；`expect(rotations.secondRotation).toBe(360)`（`:185`，锁「绝不回退 0°」）；`expect(angles.minuteAngle).toBeCloseTo(25.85, 10)`（`:202`，毫秒项）；`expect(shouldRebaseClockAnchor(baseMs, new Date(baseMs - 1000))).toBe(true)`（`:217`，时间回拨必须重锚）。其余断言行号见 §2 表。

## 4. 未覆盖与脆弱点
未覆盖（对照被测 214 行实现）：①`getBeijingHour` NaN 兜底 12（`beijing-greeting.ts:91` 退化分支，测试只喂有效日期）；②`getBeijingTimeNumbers` 各 null 兜底 12:00:00（`:120-122`）；③`shouldRebaseClockAnchor` 的 `maxGapMs` 默认 1500（`:210`）边界恰等（gapMs==1500 → false 的临界）未断言；④`resolveBeijingClockRotations` 的 `Math.max(0, …)` 负向 clamp（`:187` 一带）无直接断言（依赖 §4 覆盖的重锚策略旁证）；⑤`readNumericPart`/`pad2` 内部函数（`:70`/`:75`）仅间接覆盖。脆弱点：⑥断言含中文文案字符串（`:55-56`、`:61-75`），改问候文案会连碎多例（有意的回归锁）；⑦角度浮点断言固定小数位（`:101/:103/:202`），实现公式改动会碎。mock 边界：零 mock（无 mock.module/spyOn，grep 0 命中）；纯函数、无 I/O、无 DOM；依赖 `Intl.DateTimeFormat('Asia/Shanghai')`（`beijing-greeting.ts:19/:26/:37`）为运行时标准库真实实现。

## 5. 已证实 / 推断 / 未知
| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 21 用例/7 describe、断言行如 §2/§3 | 已证实 | `beijing-greeting.test.ts:33-217` grep 实测+逐行读 |
| 被测 9 函数签名与行号 | 已证实 | `beijing-greeting.ts:89/:95/:104/:117/:128/:139/:170/:183/:207` |
| 角度公式与断言数值自洽（302.15/25.8/108） | 已证实 | `beijing-greeting.ts:139-148` 公式 + `:101-105` 断言 |
| 时区隔离构造法（UTC 表达北京时间） | 已证实 | `beijing-greeting.test.ts:23-31` |
| 历史 Bug 复现/修复过程 | 推断 | `:1-7` 与 `beijing-greeting.ts:3-5` 注释自述，未复现 |
| 测试运行结果 | 未知 | NOT_RUN：本轮未执行 bun test/typecheck/build/GUI；断言均为静态阅读所得 |
| BDD-GREETING-01..07 规格出处 | 未知 | 编号自述于 describe 头（`:33/:51/:79/:94/:140/:161/:206`），规格文档未检索到 |

## 6. 覆盖表
| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| getBeijingHour | §2 #1-3 | `beijing-greeting.ts:89` | covered（NaN 兜底 partial） |
| greetingForBeijingHour 五分支 | §2 #5-6 | `:95-101` | covered |
| getBeijingGreetingParts | §2 #4 | `:104` | covered |
| getBeijingTimeNumbers | §2 #13 | `:117` | covered（null 兜底 unknown） |
| formatBeijingClock | §2 #7-8 | `:128` | covered |
| getBeijingClockAngles | §2 #9-12/19 | `:139` | covered |
| createBeijingClockAnchor | §2 #15-18 | `:170` | covered |
| resolveBeijingClockRotations | §2 #15-18 | `:183` | covered（负向 clamp partial） |
| shouldRebaseClockAnchor | §2 #20-21 | `:207` | covered（1500 边界 partial） |
| pad2/readNumericPart 内部 | §4 | `:70/:75` | partial（间接） |

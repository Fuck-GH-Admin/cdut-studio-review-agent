---
path: apps/electron/test/cdut-jw-parsers.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 34dc751f99b4290ea209622800653967e23d9629
sha256: 3d83fa5015257d0564695ebbd3f077fe3973da3e20693a60c7623f0dbd78ff61
lines: 568
kind: test
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/test/cdut-jw-parsers.test.ts

## 1. 测试目标
对 CDUT 青果教务 6 大端点通用解析器（`apps/electron/src/main/lib/cdut/cdut-jw-client.ts`，3160 行）做 BDD 行为锁定：周次展开、个人课表、实时课程雷达、双轨 GPA、考场座位、空教室矩阵、楼宇匹配、培养方案、全校班级课表（view-source 快照还原）及防硬编码红线（`cdut-jw-parsers.test.ts:1-5` 注释自述）。被测 15 个导入符号（`:12-27`）：`parseWeekSpecification`（`cdut-jw-client.ts:784`）、`parseScheduleCourses`（`:1014`）、`CDUT_SECTION_PERIODS`（`:827`）、`markOngoingAndNext`（`:844`）、`computeCurrentWeek`（`:833`）、`parseGradeRecords`（`:1476`）、`buildGpaTracks`（`:1548`）、`parseExamSchedule`（`:1856`）、`parseClassroomFreeRooms`（`:2068`）、`buildingMatchesRoom`（`:2246`）、`parseCurriculumPlan`（`:2467`）、`decodeViewSourceSnapshot`（`:1140`）、`parseOtherClassSchedule`（`:1170`）、类型 `GradeRecord`（`:1423`）/`ScheduleCourse`（`:757`）。

## 2. 用例清单
用例计数（grep 实测）：`it(` **24** + `itWithFixtures(` **22** = **46** 用例、`describe(` 11 组、`expect(` 134 处。**夹具门（关键边界）**：`findFixtureDir` 自测试目录向上 6 层找仓库根 `API Record/`（`:31-41`），`const itWithFixtures = FIXTURES ? it : it.skip`（`:44`）——冻结树 05fb **不含 `API Record/`**（目录实测缺失），故干净克隆下 22 个夹具用例自动 `it.skip`（注释自述"干净克隆不含脱敏数据目录" `:45`）。合成 HTML 用例（24 个 `it(`）不受影响。

| # | describe（BDD 编号） | 用例行 | 类型 | 动作/断言摘要（真实断言行） |
| --- | --- | --- | --- | --- |
| 1-6 | parseWeekSpecification（BDD-JW-WEEK-01，`:53`） | :54/:58/:62/:67/:72/:76 | it | 连续/离散/单双/复合"14(周)[01-02节]"/混合/空串展开（`:55/:59/:63-64/:68-69/:73/:77`） |
| 7 | parseScheduleCourses（BDD-JW-SCHEDULE-01，`:83`） | :86 | fixture | 真实课表>5 门、dayOfWeek∈[1,7]、weekList 数组（`:87-92`） |
| 8 | 同上 | :96 | it | 汉字节次表头合成课表：3 门、节次∈[1,11] 无负数（历史 0*2-1=-1 Bug）、高数 1-2/英语 3-4/晚自习 9-11（`:113-120`） |
| 9 | 同上 | :121 | fixture | kbcontent1/kbcontent 双副本无重复键、线性代数周三 3 段、教师非空（`:122-129`） |
| 10 | 同上 | :131 | fixture | title=教师 语义字段非空（`:132-134`） |
| 11 | 同上 | :136 | fixture | 第 7 周严格过滤（`:137-142`） |
| 12 | markOngoingAndNext+computeCurrentWeek（BDD-JW-SCHEDULE-02，`:145`） | :161 | it | 11 节制作息锁定：6 时段 08:10-21:35 全值断言、严禁第 12 节（`:162-169`） |
| 13 | 同上 | :172 | it | 周一 09:00 相交课 isOngoing（`:178-179`） |
| 14 | 同上 | :182 | it | 周单过滤不误判（`:186`） |
| 15 | 同上 | :189 | it | 24h 窗口：周日课 isNext、34h 外周一课排除（`:198-199`） |
| 16 | 同上 | :202 | it | 24h 内无课不产生 isNext（`:207-208`） |
| 17 | 同上 | :211 | it | computeCurrentWeek 秋学期 8 月末=1、10 月中=7、夹取 [1,25]（`:213-216`） |
| 18 | 同上 | :218 | it | 美东时区表达同一绝对时刻仍按北京时间判定（`:224`） |
| 19 | 同上 | :226 | fixture | 真实课表标记 isNext≤1 不抛（`:232`） |
| 20 | parseGradeRecords+buildGpaTracks（BDD-JW-GRADE-01，`:236`） | :239 | fixture | 成绩结构化（学期正则/学分>0/gp 有值，`:243-246`） |
| 21 | 同上 | :248 | fixture | 重复列「课程性质」按列序消歧（`:252`） |
| 22 | 同上 | :255 | fixture | 双轨 GPA：latest/highest 有效、最高轨≥最新轨（`:259-262`） |
| 23 | 同上 | :265 | it | 空数据容错（`:266-269`） |
| 24 | parseExamSchedule（BDD-JW-EXAM-01，`:275`） | :279 | fixture | 空数据页=[]（`:280`） |
| 25 | 同上 | :283 | it | 空白 HTML=[]（`:284`） |
| 26 | 同上 | :287 | it | 合成 #dataList 提取课程/时间/考场/座位/准考证/校区（`:300-308`） |
| 27 | parseClassroomFreeRooms（BDD-JW-ROOM-01，`:313`） | :319 | fixture | 42 列（0102/0304/12/…/091011×7 天）、星期分组（`:320-328`） |
| 28 | 同上 | :330 | fixture | tdvalue=12 午休列 isNoonBreak、严禁计第 12 节（`:334-340`） |
| 29 | 同上 | :342 | fixture | 容量提取、occupied 42 列（`:344-348`） |
| 30 | 同上 | :350 | fixture | 红 J/黑 ◆ 占用、空格空闲、互斥（`:352-359`） |
| 31 | 同上 | :362 | it | 空白 HTML 空矩阵（`:363-366`） |
| 32-34 | buildingMatchesRoom（BDD-JW-ROOM-02，`:369`） | :370/:379/:384 | it | 楼宇指纹命中 5 例（`:372-376`）/不相干 false（`:380-381`）/空输入 false（`:385-386`） |
| 35 | parseCurriculumPlan（BDD-JW-PYFA-01，`:392`） | :395 | fixture | 多模块体系（`:396-401`） |
| 36 | 同上 | :404 | fixture | 「(应修 X / 已修 Y)」提取（`:406-407`） |
| 37 | 同上 | :410 | fixture | completed/pending 区分+成绩提取（`:413-416`） |
| 38 | 同上 | :418 | fixture | rowspan=2 表头幽灵模块/幽灵课程为零（`:421-427`） |
| 39 | 同上 | :429 | it | 底部汇总行（小计/合计/总计/最低修读）不进课程条目（`:446`） |
| 40 | decodeViewSourceSnapshot+parseOtherClassSchedule（BDD-JW-OTHER-01，`:453`） | :461 | fixture | 快照还原含 fontcourse、课程>5（`:463-470`） |
| 41 | 同上 | :472 | fixture | 「师[…] 室[…] (校区)」归一化（`:475-480`） |
| 42 | 同上 | :481 | fixture | 还原器幂等不改变解析结果（`:485-487`） |
| 43-44 | 防硬编码审查（BDD-JW-GUARD-01，`:489`） | :493/:511 | fixture | 从 fixture 提取学号/班级代码（9-12 位 2025/2026 开头）与教师姓名（title=教师/师[…] 两形态），逐一断言解析器源码 `source.includes(x)` 为 false（`:507-509`/`:515-521`） |
| 45 | 五级制/两级制（BDD-JW-GRADE-02，`:525`） | :526 | it | 评级映射 [95,85,75,65,50,65,50]、不通过计入挂科、必修学分=9（`:540-543`） |
| 46 | 同上 | :545 | it | 同分取最新学期（`:565-566`） |

## 3. 真实断言
代表性真实断言（共 134 处 expect）：`expect(parseWeekSpecification('1-16(周)')).toEqual(Array.from({length:16},(_,i)=>i+1))`（`:55`）；`expect(parsed.find((c) => c.name === '晚自习物理')?.endSection).toBe(11)`（`:120`）+ 红线 `expect(c.startSection).toBeGreaterThan(0)`（`:114`，注释自述历史 "-1节--1节" Bug `:113`）；作息全值锁定 `expect(CDUT_SECTION_PERIODS[0]).toEqual({startSection:1,endSection:2,startMin:490,endMin:585})`（`:163`）等 6 行（`:163-168`）；`expect(next[0]!.name).toBe('周日课')`（`:199`）；`expect(tracks.highest.weightedGpa).toBeGreaterThanOrEqual(tracks.latest.weightedGpa)`（`:261`）；`expect(exam.seat).toBe('24')`（`:306` 一带，字段提取断言 `:302-308`）；`expect(periodColumns.length).toBe(42)`（`:320`）；`expect(noonColumn!.isNoonBreak).toBe(true)`（`:335`）+ `expect(flatFree.includes(12)).toBe(false)`（`:339`，红线）；`expect(buildingMatchesRoom('甲教A座', '(宜）甲A101')).toBe(true)`（`:372`）；汇总行红线 `expect(/^(课程体系|小计|合计|总计|最低修读|备注)/.test(name)).toBe(false)`（`:446`）；防硬编码 `expect(source.includes(code)).toBe(false)`（`:509`）/`expect(source.includes(name)).toBe(false)`（`:521`）；评级映射 `expect(parsed.map((r) => r.scoreNumber)).toEqual([95, 85, 75, 65, 50, 65, 50])`（`:540`）。

## 4. 未覆盖与脆弱点
未覆盖（对照被测 3160 行模块）：①模块中网络/会话域函数（`fetchImageAsBase64` `cdut-jw-client.ts:245`、`executeProfileDomain` `:727`、`executeScheduleDomain` `:1238`、`executeGradesDomain` `:1661`、`executeExamDomain` `:1903`、`fetchCampusBuildings` `:2191`、`executeClassroomDomain` `:2294`、`stripStaleRuiShuCookies` `:156`、`extractProfilePhotoUrl` `:495`）本测试文件 0 断言（属端点编排/抓取层，可能由其它测试或人工验证）；②`buildGpaTracks` 的补重/最高轨细节仅两条用例抽样；③`parseWeekSpecification` 未覆盖非法节次串。脆弱点：④**22 个夹具用例在冻结树（无 `API Record/`）下全部 `it.skip`**（`:44` 机制），其断言在本基线不会执行——真实覆盖实为 24 合成用例 + 22 条待数据到位才跑的断言；⑤防硬编码用例的正则（`\b\d{9,12}\b` 过滤 2025/2026 前缀、姓名 2-5 字 `:501`/`:516-517`）可能漏非典型编码；⑥合成 HTML 断言与青果 DOM 结构耦合（表头/类名变动会碎）。mock 边界：零 mock（无 mock.module/spyOn）；`itWithFixtures` 是环境门而非 mock；解析器走真实实现；`node:fs.readFileSync` 读真实 fixture/源码（`:9-10`、`:489-491`）。

## 5. 已证实 / 推断 / 未知
| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 46 用例（24 it + 22 itWithFixtures）/11 describe/134 expect | 已证实 | grep 实测 + 逐行读 `:53-568` |
| 被测 15 导入符号真实存在且行号如 §1 | 已证实 | `cdut-jw-client.ts:757-2467` export 行 grep |
| `API Record/` 不在冻结树 → 22 夹具用例运行时为 skip | 已证实 | `:44` 机制 + `ls API Record` 实测缺失 |
| 作息表 6 时段全值锁定、红线断言如 §3 | 已证实 | `:161-169`、`:113-120`、`:335-339`、`:446` |
| 防硬编码审查读真实源码断言 | 已证实 | `:489-521`（readFileSync 源码 + includes 断言） |
| fixture 在开发机/CI 是否另行提供 | 未知 | 冻结树无该目录；`API Record` 抓取物属脱敏数据，来源未证实 |
| 9 个网络/会话域函数的测试归属 | 未知 | 本文件 0 断言；是否另有测试未逐一检索（全树检索范围见 UNVERIFIED.md） |
| 测试运行结果 | 未知 | NOT_RUN：本轮未执行 bun test/typecheck/build/GUI；断言均为静态阅读所得 |

## 6. 覆盖表
| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| parseWeekSpecification | §2 #1-6 | `cdut-jw-client.ts:784` | covered |
| parseScheduleCourses | §2 #7-11 | `:1014` | covered（fixture 依赖 skip） |
| CDUT_SECTION_PERIODS | §2 #12 | `:827` | covered |
| markOngoingAndNext | §2 #13-16/19 | `:844` | covered |
| computeCurrentWeek | §2 #17-18 | `:833` | covered |
| parseGradeRecords/buildGpaTracks | §2 #20-23/45-46 | `:1476`/`:1548` | covered |
| parseExamSchedule | §2 #24-26 | `:1856` | covered |
| parseClassroomFreeRooms | §2 #27-31 | `:2068` | covered（fixture 依赖 skip） |
| buildingMatchesRoom | §2 #32-34 | `:2246` | covered |
| parseCurriculumPlan | §2 #35-39 | `:2467` | covered（fixture 依赖 skip） |
| decodeViewSourceSnapshot/parseOtherClassSchedule | §2 #40-42 | `:1140`/`:1170` | covered（fixture 依赖 skip） |
| 防硬编码红线 | §2 #43-44 | `:489-521` | covered（fixture 依赖 skip） |
| 9 个网络/会话域函数 | §4 | `:156-2294` | unknown（0 断言） |

---
path: apps/electron/src/main/lib/cdut/cdut-domain-tools.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 247b80d3c09975b93a144bd632d563d6e29e1c39
sha256: 6b16a057fe3050fa14d65acc41234e35de04f0c296c2554f9f26d1ed08ec4bd6
lines: 69
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-domain-tools.test.ts

## 1. 测试目标

BDD 行为驱动测试（文件头 `apps/electron/src/main/lib/cdut/cdut-domain-tools.test.ts:1-3`）：CDUT 专区业务域工具集成、表格网格对齐与知识图谱停用词过滤（后两者在本文件未见断言——照实记录：仅 4 个业务域 it）。被测=`cdutDemoService`（`:6`）+`demo-fixtures` 常量（`:7`）；无 mock。

## 2. 用例清单

1 describe（BDD-CDUT-DOMAIN-01）、4 it：

1. `:10` grades 域→双轨绩点+records 明细。
2. `:25` exams 域→含座位号与考场日程。
3. `:38` classrooms 域→**如实无数据、绝不编造教室/楼宇**。
4. `:54` 个人课表 JSON 契约与真实链路一致（courses/weekList/currentWeek）。

## 3. 真实断言

- `:13-22` isDemo true、含「加权绩点」、records 数组>5、`records[0].courseName==='碳中和技术概论'`、latest.weightedGpa 为 number、**highest≥latest**（`:22`）。
- `:29-35` 含「工程力学Ⅱ」、exams 长度 3、`seatNumber==='24'`、`classroom==='（宜）甲A308'`。
- `:47-51` `buildings` 与 `emptyRooms` **toEqual([])**（不编造红线）、markdown 含 `DEMO_NO_DATA_TEXT`。
- `:60-67` courses 数组>5、currentWeek 为 number、逐条 weekList 数组+startSection>0+dayOfWeek≥1。

## 4. 未覆盖与脆弱点

文件头宣称的「表格网格对齐与知识图谱停用词过滤」在本文件无对应断言（如实记录，疑似标题超前）。未覆盖写操作模拟（在 demo-service.test）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 it 行号与断言文本 | 已证实 | `:9-68` |
| 头注释超范围宣称 | 已证实 | `:2` vs 全文 |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 4 域契约断言 | §3 | covered |
| 头注释宣称项 | §4 | unknown（无断言） |
| 实际运行 | §5 | unknown（NOT_RUN） |

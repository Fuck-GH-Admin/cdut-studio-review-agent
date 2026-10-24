---
path: apps/electron/src/main/lib/cdut/cdut-demo/demo-fixtures.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ef29b3c32c27f7869baf90917ec7636c3ad7114a
sha256: 1c2ce218cb8e006d47935ff351254ef84444f8b4760a39c3037acef2a36937a1
lines: 164
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-demo/demo-fixtures.ts

## 1. 结论与边界

演示账户**8 大教务业务域离线假数据**（纯常量+接口定义）：产品演示预设、完全离线、不对接教务系统、「仅供演示态消费，请勿用于任何真实业务判定」（`apps/electron/src/main/lib/cdut/cdut-demo/demo-fixtures.ts:1-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DEMO_STUDENT_INFO` | 常量 | 9-22 | 学籍档案（profile 域 get_profile） |
| `DEMO_CONTACT_INFO` | 常量 | 25-29 | 联系方式（get_contact_info） |
| `DemoScheduleEntry` | 接口 | 32-42 | 课表条目（weekday 1-7/period/weeks 描述） |
| `DEMO_SCHEDULE_SEMESTER` | 常量 | 45 | `'2026-2027-1'` |
| `DEMO_SCHEDULE` | 常量 | 48-90 | 课表（星期×节次展开，约 40 条） |
| `DemoGradeEntry` | 接口 | 93-99 | 成绩条目 |
| `DEMO_GRADES` | 常量 | 102-116 | 成绩单 13 条 |
| `DEMO_LEVEL_EXAMS` | 常量 | 119-121 | 等级考试（CET-4 600） |
| `DemoOtherClassCourse` | 接口 | 124-133 | 全校班级课表契约（OtherClassCourse 对齐） |
| `DEMO_OTHER_CLASS_COURSES` | 常量 | 135-139 | 3 门课 |
| `DEMO_NO_DATA_TEXT` | 常量 | 142 | `'演示账户暂无此项数据。'` |
| `DEMO_NOTICES` | 常量 | 145-147 | 教务通知 1 条 |
| `DemoExamEntry` | 接口 | 150-157 | 考试条目 |
| `DEMO_EXAMS` | 常量 | 160-164 | 考试日程 3 条 |

## 3. 内部逻辑

纯数据（无函数）；接口字段含义见各注释。

## 4. 调用者与调用链

入向：`cdut-demo/demo-service.ts:20-31`（全部常量）、`cdut-domain-tools.test.ts:7`。出向：无。

## 5. 数据 I/O 与副作用

无。

## 6-7. 分支/权限

不适用；「勿用于真实业务判定」红线（`:5`）。

## 8. 修改影响面

改数据影响演示输出与 demo-service.test/domain-tools.test 断言（如 `records[0].courseName==='碳中和技术概论'`、`exams[0].seatNumber==='24'`）。

## 9. 测试证据

`demo-service.test.ts:91-110`、`cdut-domain-tools.test.ts:10-68`（契约断言）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 导出全清单 | 已证实 | `:1-164` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/数据面 | §2 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |

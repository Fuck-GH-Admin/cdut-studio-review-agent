---
path: apps/electron/src/main/lib/cdut/cdut-demo/demo-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dc8d705d8ef2fc3a0358cf31c1b396e66abe7ccd
sha256: 477b4c007b2064d919b49ade2d13c28347aeaee0d3ddb72e944a0a027c38bff1
lines: 409
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-demo/demo-service.ts

## 1. 结论与边界

CDUT **演示特区账户服务**（运行时代码，单例）：命中演示凭据时旁路真实 CAS 进入离线演示态（仅内存、不保活、不落盘）；为 8 大教务业务域工具提供离线演示数据（Markdown+JSON 双模）；统一演示态判定 `isActive()`（`apps/electron/src/main/lib/cdut/cdut-demo/demo-service.ts:1-10`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `cdutDemoService` | 导出常量 | 409 | `new CdutDemoService()` 单例（类不导出） |

类方法（`:65-407`）：`tryLogin`（`:73-82`，凭据精确命中→置 active+返回演示画像，未命中返 null 交真实 CAS）、`isActive`（`:85-87`）、`reset`（`:90-92`）、`execute(domain, params)`（`:95-121`，8 域分发 switch）。

内部工具：`WEEKDAY_LABELS`（`:42`）、`mdCell/mdTable`（`:45-56`，竖线转义+表格）、`buildResult`（`:59-63`，markdown+```json 代码块、`isDemo:true`）、`simulatedMutation`（`:124-130`，写操作**仅模拟** `mutated:true` 不提交）。

## 3. 内部逻辑与关键流程

8 域 action 分发（每域私有方法）：

- `executeProfile`（`:132-173`）：get_profile/get_contact_info 表格；query_status_changes 空；major_split/minor_signup 无数据；submit_major_preference/apply_minor→simulatedMutation。
- `executeSchedule`（`:175-232`）：query_other_schedule 输出 OtherClassCourse 契约（`:177-194`）；个人课表严格对齐真实链路 JSON（courses/weekList/currentWeek/isOngoing/isNext）——**复用真实 24h 雷达** `markOngoingAndNext`（`:211`）与 `parseWeekSpecification`/`computeCurrentWeek`（来自 `../cdut-jw-client`，`:32-39`）。
- `executeGrades`（`:234-301`）：query_grades 对齐 latest/highest/records 契约（`buildGpaTracks` 双轨加权绩点，`:253`）；level_exams；social/grade_review 无数据+3 个 simulatedMutation。
- `executeExams`（`:304-330`）：考试日程表格；补考/重修/缓考无数据+模拟。
- `executeClassrooms`（`:332-359`）：**演示态绝不编造虚拟教室/楼宇**（真实物理座位资源不可编造，`:341-347` 注释）——如实返回无数据+引导登录。
- `executeCurriculum/executeSelection/executeNotices`（`:361-406`）：培养方案/选课/通知；写操作均 simulatedMutation；selection 非 action 兜底「当前不在选课时间段内」（`:384`）。

## 4. 调用者与调用链

入向：登录入口/工具层（经 `isActive()` 判定，具体挂载点在 cdut 工具注册处非本批）；`cdut-demo/demo-service.test.ts:14`、`cdut-domain-tools.test.ts:6`。出向：`@profer/shared` 类型、`./demo-account`、`./demo-fixtures`、`../cdut-jw-client`（`buildGpaTracks/computeCurrentWeek/markOngoingAndNext/parseWeekSpecification`，`:32-39`——**跨文件依赖登记**）。

## 5. 数据 I/O 与副作用

无 I/O；副作用=`console.log` 登录命中日志（`:80`）；状态=单例 `active` 标志（内存）。

## 6. 分支、失败、取消与恢复

无 throw；`execute` default 兜底 `DEMO_NO_DATA_TEXT`（`:119`）；`reset()` 生命周期复位。

## 7. 权限与权威状态

安全边界：演示态仅内存，登出/退出即失效、绝不写凭据文件（`:9`）；写操作模拟不提交（`:123`）。

## 8. 修改影响面

改 action 分发影响 8 域演示输出与两测试文件断言；改 JSON 契约字段影响前端 normalize 消费口径（domain-tools.test:16 注释）。

## 9. 测试证据

`cdut-demo/demo-service.test.ts`（112 行 6 用例，另篇）+ `cdut-domain-tools.test.ts`（69 行 4 it，另篇）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单例+8 域分发+红线注释 | 已证实 | `:1-409` 逐行 |
| 工具层挂载点 | 未知 | 注册处非本批 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部方法/8 域分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |

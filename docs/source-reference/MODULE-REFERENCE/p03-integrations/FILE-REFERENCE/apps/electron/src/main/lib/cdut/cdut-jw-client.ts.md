---
path: apps/electron/src/main/lib/cdut/cdut-jw-client.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5b7fab6fa116965baf26c6b71214ce2e9b46a815
sha256: bb3369ccb49510cbef3d33a98de7b77d0ad181446b055f3285a3ee1acc7e0bb5
lines: 3160
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-jw-client.ts

## 1. 结论与边界

CDUT **青果教务底层客户端**（运行时代码，jw.cdut.edu.cn/jsxsd）：统一请求器（GET/POST 经专属分区 Session 携 Cookie，`:5`）、Cheerio 解析嵌套表格为「精简 Markdown+结构化 JSON」双模（`:6`）、封装 8 大业务域执行器（`:7`）。范围声明：不持明文密码、不嗅探 Cookie（`:10`）；写操作放行由上游 Pi Tool 二次确认拦截，本模块只忠实执行 POST（`:11-12`）。

## 2. 导出与关键符号（40 项，三段汇总）

请求/解析基础：`stripStaleRuiShuCookies`（`:156` re-export，清瑞数 WAF 陈旧 Cookie）、`fetchImageAsBase64:245`、`extractProfilePhotoUrl:495`（三级兜底证件照）、`decodeViewSourceSnapshot:1140`、`parseTableToGrid:291`（rowspan/colspan 虚拟网格，内部）。
课表链：`ScheduleCourse:757`、`parseWeekSpecification:784`、`CDUT_SECTION_PERIODS:827`（re-export）、`computeCurrentWeek:833`、`markOngoingAndNext:844`（24h 雷达）、`parseScheduleCourses:1014`、`OtherClassCourse:1153`、`parseOtherClassSchedule:1170`、`executeScheduleDomain:1238`（Tool 2）。
成绩/考务/教室：`GradeRecord:1423`、`parseGradeRecords:1476`、`GpaTrackSummary:1524`、`buildGpaTracks:1548`（双轨 latest/highest）、`executeGradesDomain:1661`（Tool 3）、`ExamScheduleItem:1837`、`parseExamSchedule:1856`、`executeExamDomain:1903`（Tool 4）、`ClassroomPeriodColumn:2024`、`ClassroomFreeRoom:2041`、`parseClassroomFreeRooms:2068`、`ClassroomBuilding:2179`、`fetchCampusBuildings:2191`、`buildingMatchesRoom:2246`、`executeClassroomDomain:2294`（Tool 5）。
培养方案/选课/通知：`CurriculumPlanCourse:2434`、`CurriculumPlanModule:2452`、`parseCurriculumPlan:2467`、`executeCurriculumDomain:2591`（Tool 6）、`executeSelectionDomain:2706`（Tool 7）、`executeNoticesDomain:2895`（Tool 8）。
门禁/统一入口：`isCdutMutationAction:3007`+`CDUT_MUTATION_ACTIONS:2995`/`CDUT_MUTATION_LABELS:3012`（写操作登记）、`describeCdutMutation:3029`、`executeDomainTool:3034`（8 域统一分发）、`JwProfileSummary:3063`、`fetchJwProfileSummary:3074`（双端点+顶栏兜底）、`executeProfileDomain:727`（Tool 1）。

## 3. 内部逻辑与关键流程

- 请求封装 `fetchJwPage:162-222`：拼 URL→清瑞数 Cookie（`:177`）→headers（Referer/UA）→POST 表单→`ses.fetch`→expired 判定（CAS 落点/统一身份认证，`:139-148`）。
- 各域执行器按 action 分发至真实端点（如成绩 `/kscj/cjcx_list` 仅 kksj 可变 `:1668`、空表绝不返回在线成功 `:1729`；教室 POST `/kbxx/jsjy_query2` 服务端按 jxlbh 权威筛选 `:2331-2333`；选课/通知/密码修改等 POST 均登记为写操作）。
- 写操作成败启发式 `/失败|错误|不存在/` 正则（`:1794` 等 6 处，措辞已降级「未确认成功」）。
- 画像 `fetchJwProfileSummary:3074-3160`：主端点 `/grxx/xsxx`→备用 `/xsxj/xjxxgl.do`→姓名顶栏兜底（均不抛错仅告警）。

## 4. 调用者与调用链

入向：`cdut-auth-manager.ts:29-34`、`cdut-demo/demo-service.ts:32-39`（buildGpaTracks/computeCurrentWeek/markOngoingAndNext/parseWeekSpecification）、`cdut-auth-manager.test.ts:22`（extractProfilePhotoUrl）。出向：`electron` Session、`cheerio`、`@profer/shared`（类型+北京时区教学周等值）、`./yanhu/yanhu-cookie-utils`。

## 5. 数据 I/O 与副作用

网络 GET/POST 青果教务（经分区 Session）；无磁盘写。

## 6. 分支、失败、取消与恢复

错误分类四族：`buildResult:92`/`errorResult:99`/`expiredResult:104`（登录态失效提示重登）/`networkError:113`；HTTP 非 2xx 显式报状态（`:205-214` 教训注释）；参数缺失/未知 action→errorResult；fetchJwPage 无 try/catch 异常上抛域分发器 catch；**全文件无超时/Abort**（3160 行内无 timeout 实现——照实记录）。

## 7. 权限与权威状态

红线：不持明文密码/不嗅探 Cookie（`:10`）、写操作上游二次拦截（`:11`）、仅暴露全校其他班级课表、坚决屏蔽教师/教室课表入口（`:1244`）、图片魔数嗅探防 HTML 落盘（`:224-238`）、结构行严禁误解析（`:2520-2521`）。

## 8. 修改影响面

8 域执行器与 Pi Tool 层 action 契约耦合；`demo-service` 复用课表/成绩工具函数（双侧同步）；青果端点变更即失效。

## 9. 测试证据

无专属测试（冻结树 glob `**/cdut-jw-client*test*` 零命中）；间接：auth-manager.test 的 extractProfilePhotoUrl 5 用例、demo-service/domain-tools.test 经 demo-service 间接。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 40 导出+8 域链+错误四族 | 已证实 | 三段逐行（1-3160 全读） |
| 疑点照实记录 | 已证实 | UNVERIFIED：kbjcmsid 硬编码 UUID（`:1250`）、注释「课程编号」vs 实现「课程体系」（`:2471/:2476`）、moduleName 过滤只进 JSON（`:2602-2606`）、午休列 sections=[12] 依赖消费端排除、写操作启发式、TODO 零命中 |
| 青果端点实际行为 | 未知 | NOT_RUN（网络） |

## 11. 覆盖表

| 项 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部导出/8 域/解析器 | §2/§3 | 156-3160 | covered |
| 错误分类/红线 | §6/§7 | — | covered |
| 运行验证 | §10 | — | unknown（NOT_RUN） |

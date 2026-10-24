---
path: apps/electron/src/renderer/components/cdut-zone/sheets/ScheduleDomainSheet.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 538c76b4c46fa77482d644fa858be618a476cd7f
sha256: 489178eb2bf81fc92261660ba8f3a4b9ff8f1ea5850545fc00ce1e51e52a7d87
lines: 704
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/sheets/ScheduleDomainSheet.tsx

## 1. 结论与边界

CDUT「今日课表/学期日程」抽屉业务卡片（文件头 `apps/electron/src/renderer/components/cdut-zone/sheets/ScheduleDomainSheet.tsx:1-9`）：Tab 双模式（我的个人课表/全校班级课表）；周次筛选+星期切换；当前周「正在上课/下节课预告」呼吸光晕雷达卡；班级模糊搜索+最近常看快选；真实青果教务与高仿真演示透明回退（环境徽标）。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ScheduleDomainSheet` | 组件（导出） | 241-704 | 主卡片 |
| `RadarBanner` | 内部组件 | 177-239 | 独立顶部横幅雷达（**与周次切换严格正交**，`:172-175`；未来 24h 无课显空闲文案**坚决不展示数天后课程**） |
| `ScheduleCourseItem`/`OtherClassCourseItem` | 内部接口 | 31-55 | 课程形状（`weekList` 空=全学期） |
| `WEEKDAYS`/`RECENT_CLASSES_KEY`/`RECENT_CLASSES_MAX` | 内部常量 | 57-69 | 周标签；localStorage 历史（上限 6，**纯本地快照不入库**） |
| `loadRecentClasses`/`saveRecentClass`/`deleteRecentClass` | 内部 | 71-98 | 历史 CRUD（失败不阻塞，`:86,95`） |
| `useBeijingNow` | 内部 hook | 101-108 | **北京时间秒级时钟（与宿主时区无关，绝对 Asia/Shanghai）** |
| `normalizeCourses`/`normalizeOtherClassCourses` | 内部 | 111-170 | 双式兼容规范化 |

## 3. 内部逻辑与关键流程

- **SWR 缓存**（`:264-305`）：同 Grades——`readDomainCache('schedule')` 秒开（**防御式调用防 TypeError 白屏历史 Bug**，`:264-266`）；成功后原子写缓存。
- **周次默认**（`:243-246`）：按北京时间估教学周（防冷启动显示第 1 周）；`weekTouchedRef` **用户手动切周后绝不覆盖**（`:350-356` 注释）。
- **雷达**（`:342-348`）：`evaluateCourseLiveStatus(courses, beijing.info)` **按分钟重算**（依赖 dayOfWeek+minutesOfDay，秒级仅驱动文案避免每秒克隆；eslint-disable 注释 `:346`）。
- **全学期拉取**（`:307-329`）：不传 week，**周次客户端过滤保证 24h 雷达横跨周界**（`:306`）；周次网格 `weekList 空=全学期`（`:360-363`）。
- 班级查询（`:331-349`）：`query_other_schedule`+入历史；空态明示「**仅支持班级课表查询，教师/教室课表不对学生开放**」（`:656`）。
- 渲染：骨架屏防空白（`:484-496`）；进行中/下节课卡片分色；最近常看 chip 单条删除（`:624-635`）。

## 4. 调用者与调用链

入向：CDUT 专区课表抽屉；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`@profer/shared`（`computeBeijingTeachingWeek`/`evaluateCourseLiveStatus`/`getBeijingTimeInfo`）、`@/lib/beijing-greeting`、`window.electronAPI.cdutZone`（callDomainTool/readDomainCache/writeDomainCache）。

## 5. 数据 I/O、读写与副作用

IPC 域工具（schedule×2）+缓存读写；localStorage 历史；1s interval 时钟；本地状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| API 缺失 | 防御跳过 | 268-269,321-323 |
| 拉取失败 | error 卡 | 324-325,497-501 |
| 历史写失败 | 不阻塞 | 86,95 |
| 用户切周 | 不覆盖 | 350-356 |
| 24h 无课 | 空闲文案 | 187-201 |

## 7. 权限与权威状态

时间权威=北京时间纯函数（`@profer/shared`，与宿主时区无关）；课表权威=青果教务（isDemo 显式）；班级查询范围=班级课表（教师/教室不对学生开放）。

## 8. 修改影响面

改雷达/周次逻辑影响课表实时性；改 SWR 影响秒开。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/真实教务。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 雷达横跨周界/按分钟重算 | 已证实 | `:306,342-348` |
| 用户切周不覆盖 | 已证实 | `:245-246,350-356` |
| 北京时间绝对口径 | 已证实 | `:100-108` |
| 班级查询权限边界 | 已证实 | `:656` |
| 真实教务数据 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| helpers/常量 | §2 | 31-170 | covered |
| 雷达横幅 | §2,§3 | 172-239 | covered |
| 主组件 | §3 | 241-704 | covered |
| 断言 | §9,§10 | — | unknown |

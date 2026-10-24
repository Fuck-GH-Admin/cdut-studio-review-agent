---
path: apps/electron/src/renderer/components/cdut-zone/sheets/ClassroomDomainSheet.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4d29d3fa33f55da21db849b7962f6fb3a1b0168b
sha256: e775376074e6499aed6703ccf97af0f1cf9ac920f303f9d327ca272f1f335b41
lines: 374
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/sheets/ClassroomDomainSheet.tsx

## 1. 结论与边界

CDUT「自习空教室」抽屉业务卡片（文件头 `apps/electron/src/renderer/components/cdut-zone/sheets/ClassroomDomainSheet.tsx:1-10`）：校区选择（成都/宜宾）+教学楼快速标签+节次时段筛选+空闲教室卡片网格（编号/座位/空调/空闲节次）+**实时教务与演示数据无缝回退**。硬契约：**楼宇条目唯一来源=教务实时发现（jsjy_processAjax+jxlbh 代码），严禁硬编码楼名**——虚构楼名属演示假数据会让筛选与真实教务口径不符（`:36-39,176-177`）；节次 11 节制**严禁第 12 节课**（午休 12:00-13:55 不可选，`:45-48`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ClassroomDomainSheet` | 组件（导出） | 121-374 | 主卡片 |
| `ClassroomItem`/`BuildingItem` | 内部接口 | 29-43 | 教室/楼宇形状 |
| `TIME_SLOTS` | 内部常量 | 49-57 | 官方作息节次（01-02 起至 11 节+全天） |
| `normalizeBuildings`/`normalizeClassrooms` | 内部 | 60-119 | 动态楼宇提取（缺字段返回 `[]`）；教室两式兼容（emptyRooms/简易数组字符串回退默认容量 120） |

## 3. 内部逻辑与关键流程

- 查询（`:132-158`）：`callDomainTool({domain:'classrooms',action:'query_empty_classrooms',campus,building,timeSlots})`；失败→`isDemo:true` 错误结果；**动态楼宇非空才更新**（`:146-147`）。
- 校区切换（`:161-165`）：回退「全部」+清动态楼宇（防跨校区残留）。
- 楼宇 chips（`:176-178`）：唯一来源动态清单；空时提示「未获取到真实教学楼列表：请登录特区账户后重试（**不提供任何虚构楼名**）」（`:263-265`）。
- 结果区：`isDemo`→琥珀「仿真演示数据」/否则绿「实时自习雷达」（`:185-195`）；空调过滤前端（`:170-174`）；空态建议换节次/邻近楼。

## 4. 调用者与调用链

入向：CDUT 专区空教室抽屉；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`lucide-react`、`@profer/shared`（`CdutDomainToolResult`）、`window.electronAPI.cdutZone.callDomainTool`。

## 5. 数据 I/O、读写与副作用

IPC 域工具调用；本地筛选状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 查询失败 | isDemo 错误结果 | 148-154 |
| 楼宇清单空 | 明确提示不虚构 | 263-265 |
| 校区切换 | 楼宇清零重查 | 161-165 |
| 结果空 | 建议态 | 315-322 |

## 7. 权限与权威状态

楼宇口径权威=教务实时下发（硬编码禁令）；节次口径=官方作息 11 节制；`isDemo` 显式标识演示数据。

## 8. 修改影响面

改筛选/规范化影响查询准确性；改楼宇来源策略影响真实口径。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/真实教务。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 楼宇唯一来源/禁虚构 | 已证实 | `:36-39,176-177,263-265` |
| 11 节制禁 12 节 | 已证实 | `:45-57` |
| isDemo 回退标识 | 已证实 | `:148-154,185-195` |
| 真实教务数据 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 规范化+常量 | §2 | 29-119 | covered |
| 主组件 | §3 | 121-374 | covered |
| 断言 | §9,§10 | — | unknown |

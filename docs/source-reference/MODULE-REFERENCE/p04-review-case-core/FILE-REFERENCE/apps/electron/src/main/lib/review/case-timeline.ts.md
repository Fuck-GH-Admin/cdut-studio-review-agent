---
path: apps/electron/src/main/lib/review/case-timeline.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ac2a4ab6732f177cbf99c8cae7938b07bc7f4fe3
sha256: c9946091a7f878af3edfbe35508ca7821fbce9da543f7447d9d48393b394c881
lines: 130
kind: source
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/case-timeline.ts

## 1. 结论与边界

案卷时间线（08 设计 §2.3）：由**已持久命令回执 + 运行事件 + 跨模块外部事件**构建倒序投影（`apps/electron/src/main/lib/review/case-timeline.ts:77-117`）。纯只读投影，各模块仍拥有自己的账本（`:30-32`）。

文件头三条原则（`:3-6`）：操作者可辨（local/mock/school→「人工|模拟|校方」，agent→「AI Agent」，缺省→「旧版记录，操作者未记录」）；**不猜身份**（旧记录无 actor 如实标注）；C1 基本形态只做倒序列表。

明确不做的事：

- **不伪造缺失来源**：未提供的模块不产生条目，缺口由 `summarizeTimelineSources` 明确报告（`:31-32`、`:119`）。
- **不猜 runId 归属**：跨模块事件不能证明归属则留空（`:25-26`）。
- **不持久化**：无写入。

## 2. 导出与关键符号

`export` 共 **8 个**（2 函数 + 6 类型/接口）。

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TimelineSource` | 导出 type | `:10-11` | 7 值：`receipt`/`run`/`t07-rating`/`batch-snapshot`/`batch-outbox`/`t09-offline`/`report-handoff` | 来源标签 |
| `TimelineEntry` | 导出 interface | `:13-27` | `{at; action; operatorKind; operatorLabel; detail; source?; runId?}` | 一条时间线 |
| `TimelineExternalEntry` | 导出 interface | `:33-40` | `{id; at; status; detail?; runId?; actor?}` | 跨模块事件输入 |
| `TimelineExtraSources` | 导出 interface | `:42-48` | 5 个可选数组 | 外部账本容器 |
| `buildCaseTimeline` | 导出函数 | `:77-117` | `(aggregate, runs?, filterOperator?, extra?) => TimelineEntry[]` | 构建投影 |
| `summarizeTimelineSources` | 导出函数 | `:120-130` | `(extra?) => Array<{source; provided; count}>` | 覆盖摘要 |

（另 `TimelineEntry['operatorKind']` 为 6 值：`human|agent|mock|school|system|unknown`，`:18`。）

内部：`EXTERNAL_LABELS`（`:50-56`，5 组「key→source→中文动作名」映射）、`operatorOf`（`:58-74`）。

## 3. 内部逻辑与关键流程

### 3.1 `operatorOf`（`:58-74`）——操作者徽标

`actorSource` 分派：`system`→`{system, actorId??'系统'}`；`agent`→`{agent, 'AI Agent（'+actorId 去 `agent-` 前缀取前 8 字符+'）'}`（`:64`）；`mock`→`{mock, actorId??'模拟'}`；`school`→`{school, actorId??'校方'}`；`local`→`{human, actorId??'人工'}`；其余→`{unknown, '旧版记录，操作者未记录'}`（`:72`）。

### 3.2 `buildCaseTimeline`（`:77-117`）

1. **回执**（`:86-89`）：遍历 `aggregate.receiptLog`，条目 `action = summary || type`、`detail = 'revision N'`、`source:'receipt'`。
2. **运行**（`:91-94`）：遍历 `runs`（`initiatedBy` 映射操作者），`action = '发起审核运行 '+id`、`detail='状态 '+status`、`source:'run'`、`runId`。
3. **外部事件**（`:96-113`）：按 `EXTERNAL_LABELS` 遍历 5 个数组；**去重键 `source:id`**（`:98-100`）防同一回执被两模块重复投影；`action = '动作名 '+id`、`detail = status(+`；`+detail)`、`runId` 仅在提供时写入。
4. **排序**（`:115`）：`at` 降序 `localeCompare`，tie-break `source` 升序、`action` 升序。
5. `filterOperator` 存在则按 `operatorKind` 过滤（`:116`）。

### 3.3 `summarizeTimelineSources`（`:120-130`）

`receipt`/`run` 恒 `provided:true`（计数 0）；5 个外部来源 `provided = count>0`、`count = 数组长度 ?? 0`。

## 4. 调用者与调用链

- `buildCaseTimeline`：`review-ipc.ts:691-697`——`CASE_TIMELINE_V2` handler（`review-ipc.ts:688`）：校验 `input.caseId` 非空（`:693`），`getCaseV2Aggregate` 不存在则抛「案卷聚合不存在」，runs 经 `reconcilePiReviewRunsWithReadReceipts(caseId, listRunsV2(caseId))` 后传入（`:696-697`）。**注意**：该 handler 未使用 `extra` 参数——外部事件仅当直接调用者提供时才进入时间线。
- `summarizeTimelineSources`：**无生产调用者**（已证实，全冻结树检索仅本文件定义与 `case-timeline.test.ts` 使用）。
- 测试：`case-timeline.test.ts`（3 用例）。
- 出向：仅 `CaseAggregateV2` 类型（`@profer/shared`）。

## 5. 数据 I/O、读写与副作用

无 I/O、无持久化、无副作用；纯函数（`filterOperator`/排序返回新数组，不改入参——`sort` 作用在内部 `entries` 上）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| `runs` 缺省 | `:91` | 跳过运行条目 |
| `extra` 缺省 | `:97` | 5 类外部条目全部不产生 |
| 同 `source:id` 重复 | `:98-100` | 只投影一次 |
| 无 actor 的旧记录 | `:72` | 标「旧版记录，操作者未记录」 |
| `filterOperator` 命中为空 | `:116` | 返回 `[]` |

无异常分支（不抛错）。

## 7. 权限与权威状态

- 只读投影，无权限判断；「不猜身份」由 `operatorOf` 的 `default` 分支保证（`:71-72`）。
- 操作者标签以 `actorSource` 为准，`actorId` 只作显示。

## 8. 修改影响面

- `EXTERNAL_LABELS` 增删会同时改 `buildCaseTimeline` 的条目源与 `summarizeTimelineSources` 的覆盖行。
- 排序 tie-break 影响测试断言（`entries[0]?.source==='report-handoff'`，`case-timeline.test.ts:30`）。
- IPC handler 只传 3 参，`extra` 生态目前无生产供给者——新增供给方需显式扩 handler。

## 9. 测试证据

- `case-timeline.test.ts`（48 行，1 describe / 3 test）：五类外部来源纳入且保留 Run 归属（`:14-31`）、未提供来源不被伪造且覆盖摘要明确缺口（`:33-39`）、同源同 id 去重（`:41-47`）。
- **NOT_RUN**：本轮未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 个导出 | 已证实 | `:10`、`:13`、`:33`、`:42`、`:77`、`:120` |
| 去重键 `source:id` | 已证实 | `:98-100` |
| agent 显示只取短码 8 字符 | 已证实 | `:64` |
| `summarizeTimelineSources` 无生产调用者 | 已证实 | 全冻结树检索（apps+packages，`*.ts`/`*.tsx`） |
| `CASE_TIMELINE_V2` 不传 `extra` | 已证实 | `review-ipc.ts:697` |
| 测试实际通过 | 未知 | NOT_RUN |
| 生产中外部事件来源是否被其他调用方接入 | 未知 | 未见其它 `buildCaseTimeline` 调用点 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 个导出 | 2 | — | covered |
| `operatorOf` | 3.1 | `:58-74` | covered |
| `buildCaseTimeline` 三源+排序 | 3.2 | `:77-117` | covered |
| `summarizeTimelineSources` | 3.3 | `:120-130` | covered |
| IPC 链与 extra 缺供给 | 4 | `review-ipc.ts:692-697` | covered |
| 失败/边界分支 | 6 | — | covered |
| 测试证据 | 9 | — | covered |

---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/task-list-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8b4b01cbe4688a8b106a8e3d82eccc9bbc32d3bd
sha256: c5312580cec8e08fa17b6005cf410f8b556feb2fe918409279ede57411e93d65
lines: 177
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/task-list-result.tsx

## 1. 结论与边界

TaskList 工具结果渲染器（177 行）：任务状态列表——计数头（"X/Y"）+行（id chip/状态徽章/subject，completed 删除线）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ParsedTaskListItem` | `:15-19` | `{id, subject, status}`（三字段全必填） |
| `parseTaskListResult` | `:75-79` | JSON（顶层数组或 `{tasks:[]}`）→文本（`id [status] subject` 行格式 `:62`）；空→null |
| `TaskListResultRenderer` | `:128-177` | 主渲染（见 §3） |

内部：`parseJsonTaskList:31-55`（id `id ?? taskId ?? task_id` **含 snake** `:44`、status 缺省 'pending'、id+subject 必须都有否则丢弃 `:47`、**不去重**）、`statusMeta:81-126`（内联标签；**default=原始 status 原文** `:121`）。

## 3. 内部逻辑与关键流程

useMemo 解析→**isError/!tasks→Default**（`:131-132`）→`<section>`：头部 ListTodo+"任务状态"+计数 `{completed}/{total}`（tabular-nums）→行列表（`key={task.id}` `:152`、grid 三列、in_progress 图标 `animate-pulse` `:160`、completed `line-through` `:166`）。

## 4. 调用者与调用链

`index.tsx:52-53`（TaskList 分支）；解析被 `apps/electron/src/renderer/components/agent/ContentBlock.tsx:33`（TaskListCollapsedSummary `apps/electron/src/renderer/components/agent/ContentBlock.tsx:313-330`）复用（双重解析同 task-get）。

## 5. 数据 I/O、读写与副作用

纯渲染；无 IO。

## 6. 分支、失败、取消与恢复

错误/解析失败→Default；空列表无专属空态（null→Default 显示原文）；缺 id/subject 项静默丢弃。

## 7. 权限与权威状态

状态元数据表（7 态）；计数为完成度权威显示。

## 8. 修改影响面

解析格式影响 ContentBlock 摘要联动；statusMeta 与 task-get 平行重复（M1）。

## 9. 测试证据

**全树无测试引用本文件**（子agent grep 确认）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全导出/解析/渲染 | 已证实 | 177 行全读（字节核对 `:44`/`:109`/`:121`/`:152`/`:160`/`:166`） |
| **M1** default 未知状态显示原文 vs task-get '未知状态'；**M6** id 键含 snake 与 task-get 不对称 | 已证实 | `:121`/`:44` vs task-get `:135`/`:65` |
| **M7** 不去重+`key={task.id}` 重复 key 风险；**M9** imageAttachments 断链 | 已证实 | `:47`/`:152` |
| `animate-pulse` 无 prefers-reduced-motion 降级 | 已证实 | `:160` |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 3 导出/解析/渲染 | §2/§3 | covered |
| 矛盾/可访问性 | §10 | covered |
| 测试 | §9 | unknown（零测试） |

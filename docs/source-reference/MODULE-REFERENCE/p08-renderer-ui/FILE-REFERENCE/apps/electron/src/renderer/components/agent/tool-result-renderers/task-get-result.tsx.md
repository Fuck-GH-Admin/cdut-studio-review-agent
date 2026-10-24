---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/task-get-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e714ec7bbed1c5f788afcd53fc7347b4980eca5d
sha256: c62fdf9634c608ca36fef48911730253d1f081476f49380b0963b7e5b1cfc7b4
lines: 250
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/task-get-result.tsx

## 1. 结论与边界

TaskGet 工具结果渲染器（250 行）："TaskGet 是只读查询，结果应更像任务详情而不是原始日志"（`:2-3`）：卡片式任务摘要（id chip/标题/描述/状态徽章/关联块）。解析双路（JSON 优先→文本回退）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ParsedTaskGetResult` | `:17-23` | `{id?, subject?, status?, description?, blocks: string[]}`（blocks 必填可空） |
| `parseTaskGetResult` | `:112-116` | JSON 优先（`parseJsonTask:58-74`）→文本（`parseTextTask:76-110`）；空串→null |
| `getTaskGetStatusLabel` | `:118-137` | 7 状态中文标签；default `status\|\|'未知状态'` |
| `TaskGetResultRenderer` | `:186-250` | 主渲染（见 §3） |

内部：`parseBlocks:41-56`（数字→`#n`、空值词 `none\|null\|…\|无\|暂无`→[]、正则抽取、**不去重**）、`statusMeta:139-184`、`normalizeBlockId:35`。

## 3. 内部逻辑与关键流程

useMemo 解析→**isError/解析 null 均回退 `DefaultResultRenderer`**（`:189-190`）→卡片：id chip（`#{task.id}`）+`<h4>` 标题（缺省'任务详情'）+description+状态徽章（图标+文字三重编码）+关联块条（`key={blockId}` `:233`）+双空脚注"没有更多任务详情"。JSON 路径：`task.id ?? task.taskId`（**无 snake task_id** `:65`）、`subject ?? title ?? name`、blocks 三键（`:69`）。

## 4. 调用者与调用链

`index.tsx:50-51`（TaskGet 分支）；解析导出被 `apps/electron/src/renderer/components/agent/ContentBlock.tsx:32`（TaskGetCollapsedSummary `apps/electron/src/renderer/components/agent/ContentBlock.tsx:279-308`）复用——**同文本双重解析**（与 useMemo 并存，照实）。

## 5. 数据 I/O、读写与副作用

纯渲染；无 IO。

## 6. 分支、失败、取消与恢复

错误/解析失败→Default 兜底；字段缺省逐级回退；statusMeta default 兜底'未知状态'。

## 7. 权限与权威状态

状态标签表（7 状态+default）；文案硬编码中文（无 i18n 层，照实）。

## 8. 修改影响面

解析格式变动影响 ContentBlock 折叠摘要联动；statusMeta 与 task-list 平行重复（矛盾 M1）。

## 9. 测试证据

**全树无测试引用本文件**（子agent grep 确认；同目录仅 collapsible-preview/grep-preview 有 test）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全导出/解析双路/渲染分支 | 已证实 | 250 行全读（字节核对 `:65`/`:69`/`:202`/`:233`） |
| **M1** 未知状态标签与 task-list 不一致（'未知状态' vs 原文）+ statusMeta 平行重复 | 已证实 | `:135` vs task-list `:121` |
| **M7** parseBlocks 不去重而 `key={blockId}` 重复 key 风险 | 已证实 | `:42-46`/`:233` |
| **M9** imageAttachments 不达本渲染器（回退 Default 也不带） | 已证实 | `:189-190` vs index `:55` |
| 可访问性零 aria/role、h4 跳级 | 已证实 | 字节级 grep |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 4 导出/解析/渲染 | §2/§3 | covered |
| 3 矛盾+可访问性 | §10 | covered |
| 测试 | §9 | unknown（零测试） |

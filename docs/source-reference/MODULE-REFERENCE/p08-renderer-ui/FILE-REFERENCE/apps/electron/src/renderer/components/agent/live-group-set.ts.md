---
path: apps/electron/src/renderer/components/agent/live-group-set.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f4ecefeafdcffcefa6a021c8a9bbf9e1ab8d0101
sha256: f5c583f58735095ed6810354445e0aacd2eb5c188eec22cc03c607cefd70c100
lines: 42
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/live-group-set.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

live 分组集合（42 行）：**只有流式输出中** `liveMessages` 才代表运行中消息（头注注释 :10-13——流式结束后只是防闪烁桥接数据，不应触发展开态/隐藏操作栏等 live UI）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `buildLiveGroupSet` | fn | 16-42 | 求 live MessageGroup 集合 |

内部：`BuildLiveGroupSetOptions`（:5-9）、`EMPTY_LIVE_GROUPS`（:11）。

## 3. 内部逻辑与关键流程

`!streaming || !liveMessages || 空` → 恒空集；user/system 组按 `liveSet.has(group.message)`；assistant-turn 组因 `mergeAdjacentSameModelTurns` 合并需检查 `assistantMessages` 任一命中（注释 :31-33）。

## 4. 调用者与调用链

入向：`SDKMessageRenderer` 侧（同目录组件族，全树 grep）。出向：类型 `./SDKMessageRenderer`、`@profer/shared`。

## 5. 数据 I/O、读写与副作用

纯函数（Set 构造）。

## 6. 分支、失败、取消与恢复

单函数三分支；不抛。

## 7. 权限与权威状态

- UI 状态语义：live 判定以 `streaming` 为门（防闪烁桥接数据不冒充运行中，:10-13）。无 sender/role 检查（渲染层纯逻辑）。

## 8. 修改影响面

工具行展开态/操作栏显隐。无专属测试文件。

## 9. 测试证据

直接测试：无（全树检索 live-group-set.test = 0）。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出/行号 | 已证实 | 逐行核对 |
| streaming 门语义 | 已证实 | :10-13/:16-18 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildLiveGroupSet` | §3 | 16-42 | covered（未测） |

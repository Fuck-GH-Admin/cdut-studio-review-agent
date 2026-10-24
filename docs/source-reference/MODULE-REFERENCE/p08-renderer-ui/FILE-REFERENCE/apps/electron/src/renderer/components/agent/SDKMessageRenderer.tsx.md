---
path: apps/electron/src/renderer/components/agent/SDKMessageRenderer.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b1763bb427ccbc321f52c7520949d509c95b31ce
sha256: cc0a5e7f766ac6daafec06f02eef6514b45f99f39ff950c461ce854debbc0967
lines: 1856
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/SDKMessageRenderer.tsx

## 1. 结论与边界

**SDKMessage 渲染器**（`apps/electron/src/renderer/components/agent/SDKMessageRenderer.tsx:1-11`，1856 行本批最大）：两模式——单条（实时流式）/Turn 分组（持久化，一个 turn 一个 header）。Turn 规则（`:8-11`）：用户消息间 assistant 组成 turn；`user(tool_result)` 属当前 turn 不中断；system 独立。**Goal 迭代控制 prompt（预算/契约/goal_result 协议）是机器协议，不渲染用户气泡**（`:112-113`）；任务中断记录行低饱和不打断（`:137`）。

## 2. 导出与关键符号

`export` 共 **18 个**（`:83`-`:1838`）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SDKMessageRendererProps` | interface | `:83-111` | 单条渲染 props |
| `CompactingIndicator` | 函数 | `:185-204` | system 压缩指示器（pill+spinner） |
| `extractTurnUsage` | 函数 | `:212-…` | 从 turn 提取 result 耗时/用量 |
| `AssistantTurn` | interface | `:320-…` | assistant turn 结构 |
| `MessageGroup` | type | `:337-…` | 消息分组联合 |
| `groupIntoTurns` | 函数 | `:371-…` | `(messages, sessionModelId?) => MessageGroup[]` |
| `buildHistoricalTaskSubjects` | 函数 | `:575-…` | 历史任务主体 Map |
| `AssistantTurnRendererProps` | interface | `:722-…` | turn 渲染 props |
| `AssistantTurnRenderer` | 函数 | `:753-…` | Turn 分组渲染 |
| `SDKMessageRenderer` | 函数 | `:1064-…` | 单条消息渲染 |
| `AttachedFileRef` | interface | `:1167-…` | 附件引用 |
| `QuotedFileRef` | type | `:1173` | 引用（= `ParsedQuotedSelectionRef`） |
| `parseAttachedFiles` | 函数 | `:1181-…` | 解析附件/引用/文本 |
| `isImageFile` | 函数 | `:1208-…` | 图片文件判定 |
| `MessageGroupRendererProps` | interface | `:1624-…` | 分组渲染 props |
| `getGroupId` | 函数 | `:1664-…` | 分组 ID |
| `getGroupPreview` | 函数 | `:1703-…` | 分组预览（text 空格 join+200 截断） |
| `MessageGroupRenderer` | const | `:1838-…` | `React.memo` 分组渲染 |

## 3. 内部逻辑与关键流程

- Turn 分组（`:8-11`）；quoted_context→引用 chip（**不泄漏 XML 到正文**，test 锁定）；迷你地图预览（text 块空格 join、200 字符截断、保持 join 前导空格语义，test 锁定）。
- system 压缩消息独立成组**阻断前后同模型 turn 合并**；压缩分界后 result 回填压缩前 turn（耗时/token 不丢失）；`/compact` 自身 result 不回填上一轮（test 锁定）。
- Goal 控制 prompt 分隔条（`:112-113`）兼 turn 边界防多轮合并。

## 4. 调用者与调用链

- 消费方：Agent 对话流（实时/持久化）。
- 出向：`ProcessBlockGroup`（过程块折叠）、React。

## 5. 数据 I/O、读写与副作用

纯渲染；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| Goal 控制 prompt | `:112-113` | 分隔条不渲染气泡 |
| 压缩消息 | — | 独立组阻断合并 |
| quoted_context | — | chip 化不泄漏 XML |

## 7. 权限与权威状态

机器协议不伪装用户消息（`:112-113`）；quoted_context 不泄漏 XML 是注入面防御。

## 8. 修改影响面

- Turn 分组/回填规则改动影响消息流（test 多用例锁定）。
- 迷你地图 join/截断语义。

## 9. 测试证据

`SDKMessageRenderer.test.ts`（237 行，4 describe/12+ 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 18 个导出、Turn 分组/Goal 分隔 | 已证实 | `:83-1838` |
| 机器协议不渲染气泡 | 已证实 | `:112-113` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 18 个导出 | `:83-1838` | covered |
| Turn 规则/Goal 分隔 | `:8-137` | covered |
| 分组/预览/用量 | `:212-1838` | covered |

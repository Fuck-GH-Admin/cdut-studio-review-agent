---
path: apps/electron/src/renderer/components/agent/mention-suggestions.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0065677fdbb743527f79889da4af970f68f03ffc
sha256: 460fa8d33631e127bef8f5a0e633629cebc0f96fcc0b3669355edc292d8f10ef
lines: 282
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/mention-suggestions.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

Skill/MCP/会话引用的 TipTap Mention Suggestion 统一配置（282 行，头注 :1-6）：泛型工厂 `createMentionSuggestion` 封装渲染/定位/键盘导航，配置注入差异（触发符/取数/行渲染）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SkillMentionItem`/`createSkillMentionSuggestion` | interface/fn | 161-199 | `/` 触发（调用 skill） |
| `McpMentionItem`/`createMcpMentionSuggestion` | interface/fn | 203-240 | `#` 触发（MCP 服务） |
| `SessionMentionItem`/`createSessionMentionSuggestion` | type/fn | 244-282 | `&` 触发（引用会话） |

内部：`MentionSuggestionConfig<T>`（:17-30）、`createMentionSuggestion`（:32-155）。

## 3. 内部逻辑与关键流程

1. **items 钩子**（:51-61）：`createLatestQueryRunner` 去抖+最新胜出；query 小写；`MAX_MENTION_ITEMS` 截断；**slug 与缓存代际双复核**（变化→返回 [] 防旧工作区数据串入）；异常回 []。
2. **`allowedPrefixes: null`**（:45-48 注释）：允许任意前缀触发（中文 `你好#` 场景）；设 `[' ']` 是回归（块开头空串恒通过校验）。
3. **`/goal` 排除**（:80-84）：Agent 内置命令不弹 Skill 弹窗；仅跳过不走 `allow` 钩子（避免影响带斜杠文本粘贴事务）。
4. **render 生命周期**（:63-154）：onStart 先 `isSuggestionTriggerPresent` 过期防御（:74-78）→ReactRenderer(MentionList)+`createMentionPopup`+`positionPopup`；blur 100ms 后失焦清理；onUpdate 刷 items+重定位；onKeyDown 委托 ref；onExit cleanup（mentionActiveRef/itemCountRef 归零）。
5. **三配置**：Skill 从 `getCachedWorkspaceCapabilities().skills`（enabled+name/slug 过滤）；MCP 同 caps.mcpServers；会话引用 `searchAgentSessionReferences`（excludeSessionId 排除自身、limit 20）——会话配置复用工厂但传 workspaceIdRef（注释 :272-273 需非空 ref 才触发 fetchItems）。

## 4. 调用者与调用链

入向：编辑器 mention 扩展装配（agent 输入框组件，全树 grep）。出向：`./MentionList`、`./mention-popup-utils`、`./mention-query-utils`、`@tiptap/react`/`@tiptap/suggestion`、`window.electronAPI.searchAgentSessionReferences`、`@profer/shared`。

## 5. 数据 I/O、读写与副作用

经 electronAPI 搜索会话引用；DOM 弹窗；无写盘。

## 6. 分支、失败、取消与恢复

fetch 异常→[]；过期 suggestion→跳过建弹窗；blur→100ms 延迟清理；onExit 全清。

## 7. 权限与权威状态

- 竞态防御权威：触发符复核+slug/代际双闸（旧工作区数据不串入）。
- 命令边界：`/goal` 不走 Skill 引用（:80-84）；会话引用排除当前会话（防自引用）。无 sender/role 检查。

## 8. 修改影响面

三类 mention 弹窗行为。无专属测试文件（工厂行为经组件层验证）。

## 9. 测试证据

直接测试：无独立文件（全树检索 mention-suggestions.test = 0）；`mention-query-utils.test.ts` 覆盖其依赖的 runner/缓存层。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 组导出/内部符号/行号 | 已证实 | 逐行核对 |
| 竞态/代际/`/goal` 排除语义 | 已证实（代码） | :45-84/:51-61 |
| TipTap 真实集成行为 | 未知 | 无组件测试、NOT_RUN |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createMentionSuggestion` 工厂 | §3 | 32-155 | covered（未测） |
| Skill/MCP/会话三配置 | §3.5 | 161-282 | covered（未测） |

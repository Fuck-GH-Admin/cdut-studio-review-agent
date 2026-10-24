---
path: apps/electron/src/renderer/components/session-preview/SessionMiniMapPopover.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2c3b3e010a58097b372edab1fbd02a80eb6422af
sha256: 1c4f0635bc3da33a566b49e6ebbe5867b0e6f76c078b564849c3d821e9974277
lines: 576
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/session-preview/SessionMiniMapPopover.tsx

## 1. 结论与边界

**会话悬浮迷你地图**（576 行，`:1-6`）：侧栏会话项 hover/长按预览消息结构；优先 `tabMinimapCacheAtom` 缓存，未打开按需读 JSONL。触屏只允许长按触发（`:61` 注释：轻触合成 mouseenter 会误弹）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SessionMiniMapType/Target` | 类型 | `:34-41` | chat/agent 双型 |
| `useSessionMiniMapHover` | Hook | `:97` | hover+触屏长按状态机（delayMs=600） |
| `SessionMiniMapPopover` | 组件 | `:419` | open 才渲染 Content |

常量：PANEL_WIDTH=318/MAX_RENDERED_ITEMS=80（`:78-83`）、TOUCH_MOVE_TOLERANCE=12（`:64`）、`PREVIEW_MD_COMPONENTS`（`:86-95`，img→null、a→span 去链接）。

## 3. 内部逻辑与关键流程

- hover 机（`:97-273`）：enter 600ms 开/leave 160ms+fade 90ms 关；触屏长按 600ms 开→`armOutsideClose`（延迟一帧挂 window touchstart，面板内 stopPropagation 保护 `:171-190`）→touchEnd 置 suppressClick 拦合成 click（`:237-241`）；位移>12px 判滚动取消（`:223`）。
- 条目构建：`buildChatMinimapItems`（`:283`，220 字符截断）/`buildAgentMinimapItems`（`:295`，**与 AgentMessages 同一套 groupIntoTurns 分组**——tool_result 不单占行，注释 `:296-297`）；`normalizePreviewText` 剥引用标记/attached_files（`:275-281`）。
- 定位 `usePopoverPosition`（`:313-356`）：右放优先、越界翻左、垂直居中钳制；resize/scroll 捕获重算。
- 加载（`:445-483`）：缓存命中直接用；否则 IPC（getConversationMessages/getAgentSessionSDKMessages）→写缓存；失败→"无法加载会话内容"。

## 4. 调用者与调用链

- 入向：侧栏会话列表（Working/置顶/最近/折叠栏，域外）。
- 出向：`@/components/agent/SDKMessageRenderer`（groupIntoTurns/getGroupPreview）、react-markdown、model-logo、`window.electronAPI.getConversationMessages/getAgentSessionSDKMessages`。

## 5. 数据 I/O、读写与副作用

读会话消息（IPC）；写 `tabMinimapCacheAtom`；portal 悬浮层。

## 6. 分支、失败、取消与恢复

四态渲染（loading 骨架/error/空/列表，`:520-570`）；cancelled 防竞态；disabled 态清定时器（`:125-133`）。

## 7. 权限与权威状态

无权限分支，依据：读会话预览（会话归属在列表侧把关）。

## 8. 修改影响面

会话扫读交互；与 SDKMessageRenderer 分组一致性耦合。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| hover/长按状态机/定位/缓存/分组一致性 | 已证实 | `:1-576` 全文（分段） |
| 触屏误弹历史问题 | 推断（注释记录） | `:61` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+Hook+内容组件 | §2/§3 | 34-575 | covered |

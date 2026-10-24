---
path: apps/electron/src/renderer/components/ai-elements/sticky-user-message.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2a20427253f98f9330242d2f304eeb0934e2b3b4
sha256: 87d72703c3840558253939407812943617754a0f08ebc12f2762a7e38b926c23
lines: 192
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/sticky-user-message.tsx

## 1. 结论与边界

会话视口的用户消息悬浮置顶条（React 组件）：当任意 `[data-message-role="user"]` 节点**完全滚出容器视口顶部**时，在顶部显示该消息的精简卡片（头像/用户名/两行文本/附件徽标），点击平滑回滚到原消息（`apps/electron/src/renderer/components/ai-elements/sticky-user-message.tsx:1-11`）。

边界：

- 必须放在 StickToBottom（Conversation）内部——依赖 `useStickToBottomContext()` 的 `scrollRef/stopScroll/state`（`:47`），独立使用不可用。
- 只做 DOM 查询/滚动定位与纯展示；不写盘、不发 IPC、不动消息数据。
- 不处理 assistant 消息；数据列表由调用方过滤好（见 §4）。
- 不是持久化置顶（无收藏/固定功能），仅“滚出即浮现”。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `StickyUserMessage` | 函数（导出） | 46-192 | `({userMessages}: StickyUserMessageProps) => React.ReactElement \| null` | 悬浮条组件本体 |
| `STICKY_REMARK_PLUGINS` | 内部常量 | 24 | `RemarkPluginFn[] = [remarkMentions]` | 悬浮条专用：仅 mention 插件，不保留换行 |
| `stripCodeBlocks` | 内部函数 | 27-29 | `(text: string) => string` | ``/```[\s\S]*?```/g`` → ` [code] ` 占位 |
| `StickyAttachment` | 内部接口 | 31-34 | `{filename: string; isImage: boolean}` | 附件徽标数据 |
| `UserMessageData` | 内部接口 | 36-40 | `{id: string \| null; text: string; attachments: StickyAttachment[]}` | 一条用户消息 |
| `StickyUserMessageProps` | 内部接口 | 42-44 | `{userMessages: UserMessageData[]}` | 组件 props |

## 3. 内部逻辑与关键流程

1. **数据建表**（`apps/electron/src/renderer/components/ai-elements/sticky-user-message.tsx:55-61`）：`messageMap` memo 把 `userMessages` 转成 `id → UserMessageData`（`id` 为 null 的消息不入表），依赖 `[userMessages]`。
2. **检测 effect**（`:63-111`）：
   - 前置短路（`:64-68`）：`scrollRef.current` 为空 / `userMessages.length===0` / `!stickyEnabled` → `setStickyMessage(null)` 并返回。
   - `check()`（`:70-89`）：取容器 rect，`querySelectorAll('[data-message-role="user"]')` **从后往前**找第一个 `nodeRect.bottom < containerRect.top` 的节点（`:76-87`），读 `data-message-id` 在 `messageMap` 查数据（`:81-84`），查不到置 null；`setStickyMessage(found)`。
   - 监听（`:91-104`）：容器 `scroll`（passive）、`ResizeObserver` 观察容器本身与其 `firstElementChild`（流式输出/消息加载的尺寸变化也触发检测，`:98-101`）、`requestAnimationFrame(check)` 延迟一帧初始检查（`:104`）。
   - 清理（`:106-110`）：移除 scroll 监听、`resizeObserver.disconnect()`、`cancelAnimationFrame`。
3. **点击回滚** `scrollToOriginal`（`:114-132`）：在 `[data-message-id]` 节点中找目标（`:118-121`），找不到直接 return；`stopScroll()` 后把 `stickyState.animation/velocity/accumulated` 清零（`:123-126`，中断 StickToBottom 的动画状态），按 `scrollTop + (targetRect.top - containerRect.top) - 24` 平滑 `scrollTo`（下限 0，`:128-131`）。
4. **渲染门**（`:134-140`）：`!stickyEnabled → null`；无内容（text 空且无附件）或未置顶 → null。注释明确要求未置顶时**彻底卸载**（严禁 opacity-0 幽灵节点，否则文本会被原生选区 Ctrl+C 复制走，`:137-138`）。
5. **卡片渲染**（`:142-191`）：外层 absolute top-0 z-20（`:143`），`ml-[46px]` 对齐消息缩进（`:147`）；头部 `UserAvatar`+`userProfile.userName`+`ChevronUp`（`:152-156`）；文本 `line-clamp-2`，经 `MessageResponse` + `STICKY_REMARK_PLUGINS` 渲染 `stripCodeBlocks(text)`（`:159-168`）；附件徽标 `FileImage`/`FileText` 按 `isImage` 选图标（`:171-186`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/agent/AgentMessages.tsx:27`（import）、`AgentMessages.tsx:979`（渲染，且 `allUserMessagesData.length > 0` 才挂载）。数据来源 `AgentMessages.tsx:776-790`：`visibleGroups` 中 `type==='user'` 且非 Goal 迭代分隔条（`isGoalIterationMessage` 过滤），经 `extractUserText` + `sdkParseAttachedFiles` 拆出 `{id: getGroupId(g), text, attachments}`。设置项：`stickyUserMessageEnabledAtom`（`apps/electron/src/renderer/atoms/ui-preferences.ts:51-76`，默认 `?? true`），开关在 `apps/electron/src/renderer/components/settings/UsageSettings.tsx:374-375`。

出向：`use-stick-to-bottom`（context）、`@/components/shared/UserAvatar`、`@/atoms/user-profile`、`@/atoms/ui-preferences`、`./message`（`MessageResponse`、`remarkMentions`、`RemarkPluginFn`）、`lucide-react` 图标。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络/IPC；只读 DOM（`querySelectorAll`、`getBoundingClientRect`）。
- 状态：本地 `stickyMessage`（`:52`）；外部只读 `userProfileAtom`、`stickyUserMessageEnabledAtom`。
- 副作用：注册 scroll 监听 + ResizeObserver（2 个观察目标）+ 1 个 rAF（全部在清理函数中解除）；点击时改滚动位置并重置 `stickyState`（外部滚动状态对象，`:124-126`）。
- 并发/竞态：effect 依赖 `[scrollRef, userMessages, messageMap, stickyEnabled]`，数据变化即重建监听；无异步请求，无取消令牌需求。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 容器/数据缺失或开关关 | 64-68 | `setStickyMessage(null)`，卸载悬浮条 |
| 无完全滚出顶部的用户消息 | 76-87 | `found=null` → 不显示 |
| 节点无 `data-message-id` / map 未命中 | 81-84 | `found` 保持 null（不显示） |
| 点击时找不到目标节点 | 116-121 | 直接 return，无滚动 |
| `!stickyEnabled` | 139 | 渲染 null |
| 无文本且无附件 | 140 | 渲染 null |

- 无 throw/无异步失败；“恢复”= 滚回原位后 `check()` 自然把 `stickyMessage` 置 null（目标不再位于视口上方）。
- 不可恢复点：无。DOM 节点被移除后 map 未命中仅是不显示。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/actor 检查，不发起任何受权 IPC。身份展示（头像/用户名）来自只读 `userProfileAtom`（本地用户资料），非鉴权判断。

## 8. 修改影响面

- 改 props 形状（`UserMessageData`）需同步 `AgentMessages.tsx:776-790` 的数据装配。
- 改 DOM 契约（`data-message-role="user"`/`data-message-id`）需同步 Conversation 消息渲染端的属性输出与 `scrollToOriginal` 的查询（`:118`）。
- 改渲染门（`:137-140`）会影响复制行为（幽灵节点回归会污染 Ctrl+C 选区，见注释）。
- `stickyUserMessageEnabledAtom` 语义变更影响 `UsageSettings.tsx` 与 `main.tsx:575-587` 的设置装配。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `StickyUserMessage`/`sticky-user-message` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：无（`message.tsx` 的测试也不经过本组件）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI；未运行浏览器滚动行为。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：滚动检测边界（部分露出）、ResizeObserver 触发时机、点击回滚偏移 24px、卸载语义均无自动化断言。维护者验证：启用设置后在长会话中滚动，检查悬浮条出现/点击回滚/复制选区不含悬浮条文本。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出（`StickyUserMessage`） | 已证实 | 全文 `export` 逐条核（仅 `:46`） |
| 从后往前找“完全滚出顶部”节点 | 已证实 | `:76-87` |
| 未置顶时彻底卸载（防复制污染） | 已证实 | `:137-140` |
| 点击前清滚动动画状态 | 已证实 | `:123-126` |
| 设置默认开启（`?? true`） | 已证实 | `ui-preferences.ts:58` |
| 调用者为 AgentMessages 单点 | 已证实（检索） | `AgentMessages.tsx:27,979`，全树无其它 import |
| code 块被替换为 `[code]` | 已证实 | `:27-29,165` |
| 真实浏览器滚动/Resize 时序 | 未知 | 未运行（NOT_RUN） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `StickyUserMessage` 组件 | §3 | 46-192 | covered |
| `messageMap` 建表 | §3 | 55-61 | covered |
| `check()` 检测逻辑 | §3 | 70-89 | covered |
| 监听注册/清理 | §3,§5 | 91-110 | covered |
| `scrollToOriginal` | §3 | 114-132 | covered |
| 渲染门/卸载语义 | §3,§6 | 134-140 | covered |
| `stripCodeBlocks`/remark 插件 | §2,§3 | 24-29,159-168 | covered |
| 附件徽标 | §3 | 171-186 | covered |
| 测试 | §9 | — | unknown |

---
path: apps/electron/src/renderer/components/file-browser/FileMentionList.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ef555f7358dffe36f351750274e9ea81ed2656ea
sha256: 145869fac3b3cf4292b7d78762431a7ed08905f5574abf430d56a0ffeab4a6af
lines: 535
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/FileMentionList.tsx

## 1. 结论与边界

@ 引用文件下拉列表（运行时组件）：按来源分组文件树（会话/工作区）；`useImperativeHandle` 暴露 onKeyDown 给 TipTap Suggestion；文件夹初始折叠、Tab 展开/折叠、→/← 辅助、Enter 插入引用、单击目录展开/双击选中（`apps/electron/src/renderer/components/file-browser/FileMentionList.tsx:1-15`）。搜索在上游完成，本组件只渲染+键盘导航。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `FileMentionListProps` | 接口 | 65-69 | sessionEntries/workspaceEntries/onSelect |
| `FileMentionRef` | 接口 | 71-73 | onKeyDown（返回 boolean 是否消费） |
| `FileMentionList` | 组件 | 146 | forwardRef 主组件 |

内部：`MentionErrorBoundary`（`:27-49`，渲染报错兜底「无匹配文件」）、`FileTreeNode`（`:53-61`）、`buildTree`（`:78-…`，按 `/` 切父路径）、`flattenVisible`（`:130-142`）、`FileSection`（`:360-393`）、`TreeNodeList`（`:396-535`）。

## 3. 内部逻辑与关键流程

- 状态：`limitMentionGroups` 条目上限（`:149-152`，MAX_FILE_MENTION_ITEMS）；`expandedPaths`（`:167`）；`selectedIndex`+钳制（`:204/:208-210`）；滚动选中项（`:213-219`）。
- 键盘（`useImperativeHandle :255-303`）：↑↓ 循环、Tab toggleExpand、→ 展开、← 折叠、Enter `handleSelect` 插入、Escape return true（动作在上游）；`getNodeAt` 跨双列表取节点（`:222-226`）。
- 鼠标：**mousedown 选择**（非 click，防异步重渲染漏选+preventDefault 防编辑器 blur 竞态，`:460-471`）；目录单击 180ms 延迟 toggle 等双击（`:421-430`）、双击选中（`:432-438`）。
- 渲染递归 `renderNode`（`:440-532`）：缩进 8+depth×16、Chevron 旋转、FileTypeIcon、路径副文本、Tab 提示、Tooltip 完整路径、展开递归子节点。

## 4. 调用者与调用链

入向：`file-mention-suggestion.tsx:13`。出向：react、`@/lib/utils`、`@profer/shared`、`./FileTypeIcon`、lucide、`@profer/ui/primitives/tooltip`、`@/components/agent/mention-query-utils`。

## 5. 数据 I/O 与副作用

无 IPC（纯渲染）；DOM 滚动。

## 6. 分支、失败、取消与恢复

错误边界兜底（`:27-49`，注意错误态文案与空态相同）；空态「无匹配文件」（`:305-316`）；Enter 空表不消费（`:292`）；越界返 null（`:223-225`）。

## 7. 权限与权威状态

不适用（依据：无 sender/role 检查）。

## 8. 修改影响面

FileMentionRef 键盘协议与 TipTap Suggestion 装配同步；buildTree 对路径分隔符敏感（Windows `\` 未处理——`buildTree :96`，如实登记）。

## 9. 测试证据

无专属测试（glob 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+键盘/鼠标/递归渲染 | 已证实 | `:1-535`（子代理逐行全读+作者抽核锚点 :65/:71/:255/:421/:429 一致） |
| 头注释称支持反引号键但无对应逻辑 | 已证实 | `:4` vs `:255-303`（如实登记，或在上游，unknown） |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/交互链 | §2/§3 | covered |
| 反引号键 | §10 | unknown（无实现） |
| 运行验证 | §10 | unknown（NOT_RUN） |

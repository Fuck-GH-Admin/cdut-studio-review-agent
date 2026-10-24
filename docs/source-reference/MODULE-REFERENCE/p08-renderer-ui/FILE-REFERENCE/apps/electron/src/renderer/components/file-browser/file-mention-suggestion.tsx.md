---
path: apps/electron/src/renderer/components/file-browser/file-mention-suggestion.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2a5185cb34fb2541829546aceab9cd1d76af7726
sha256: c0160e01345ba3d00d6c61a58a2b3b3fe55d805daf787f290bf2056d4a3abeb7
lines: 222
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/file-mention-suggestion.tsx

## 1. 结论与边界

TipTap Mention Suggestion 配置工厂（运行时代码）：输入 @ 异步搜索工作区文件，弹 FileMentionList 浮动列表；弹窗底部锚定光标上方、展开文件夹向上生长（`apps/electron/src/renderer/components/file-browser/file-mention-suggestion.tsx:1-7`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `createFileMentionSuggestion` | 函数 | 26-222 | `(workspacePathRef, mentionActiveRef, attachedDirsRef?, mentionItemCountRef?, sessionAttachedDirsRef?): Omit<SuggestionOptions,'editor'>` | 唯一导出 |

## 3. 内部逻辑与关键流程

- `items`（`:48-102`）：新 query 清旧分组（`:50`）；无工作区→序列失效+空结果+一次性 toast「暂时无法引用文件」（`:53-69`）；经 `getCachedFileSnapshot`+`filterFileSnapshot` 快照过滤（`:79-82`）；**四重竞态校验**（序列/工作区路径/快照键/缓存代际，`:86-94`）任一不符丢弃结果。
- `render`（`:104-220`）：ReactRenderer+`createMentionPopup` 锚定（`:167-176`）；**编辑器 blur 延迟 100ms 强制关弹窗**（点弹窗不关，`:179-186`）；onStart 残留清理防御（`:158-161`）；onUpdate 刷新 props+重锚定（`:194-207`）；onKeyDown 透传 FileMentionRef（`:209-214`）；onExit cleanup（`:216-218`，置 mentionActiveRef/清 popup/renderer/observer）。
- `onSelect` 回调：`props.command({id: path, label: name})` 插入 mention（`:125-127`）。

## 4. 调用者与调用链

入向：编辑器 mention 扩展装配处（非本批）。出向：`./FileMentionList`、`@/components/agent/{mention-popup-utils,mention-query-utils}`（非本批）、`@tiptap/{react,suggestion}`、sonner。

## 5. 数据 I/O 与副作用

经 query-utils 快照缓存（IPC 间接）；DOM popup/ResizeObserver。

## 6. 分支、失败、取消与恢复

搜索失败 console.error 返空（`:97-101`）；渲染失败 cleanup（`:188-191`）；竞态丢弃（`:86-94`）。

## 7. 权限与权威状态

不适用（依据：无 sender/role 检查）。

## 8. 修改影响面

mention-query-utils 缓存代际契约；FileMentionList props/键盘协议。

## 9. 测试证据

无专属测试（glob 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+竞态四校验+弹窗生命周期 | 已证实 | `:1-222` 逐行 |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/生命周期 | §2/§3 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |

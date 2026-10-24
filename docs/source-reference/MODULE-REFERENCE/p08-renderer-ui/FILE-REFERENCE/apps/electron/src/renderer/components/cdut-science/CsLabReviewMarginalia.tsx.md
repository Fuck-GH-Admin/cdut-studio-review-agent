---
path: apps/electron/src/renderer/components/cdut-science/CsLabReviewMarginalia.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 99a82be1759e19ceb92b9f9fea70f13c93b9e737
sha256: b99015636713d64f073bac77244d9d0e3bd3298ce264585b76683a6c94e811f2
lines: 297
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabReviewMarginalia.tsx

## 1. 结论与边界

审稿旁注（头注释 :2-8）：**性能红线**——位置只用 `transform: translateY()`（GPU 合成层，绝不改 top/margin）；一维重力松弛避障由 `@profer/shared` 纯函数计算；接受/拒绝后卡片先淡出位移、再由 ProseMirror 状态驱动卸载。

## 2. 导出与关键符号

导出 1 条（`export` :37）：`CsLabReviewMarginalia({editor, suggestions, active, onAccept, onReject})`（:37-）。内部：`ReviewCard`（:228，persona 元数据 `CSLAB_PERSONA_META` 兜底 human :236）、`ExitingCard`（:32-35）。布局委托 `calculateMarginaliaLayout(anchors, 14)`（:78）；连接线 `buildConnectorPath`（:168）。

## 3. 内部逻辑与关键流程

（头部+大纲级，297 行）：recompute（:52）测量锚点→shared 纯函数排布→layout state；measureTick 触发重测；exiting 队列做淡出位移动画（红线 §1）；cardRefs Map 测卡高。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CsLabManuscriptEditor.tsx:72` → :917。出向：`@profer/shared`（calculateMarginaliaLayout :14→:78、buildConnectorPath :13→:168）、`./cslab-track-changes-extension`（CSLAB_PERSONA_META :19→:236）；无 electronAPI。

## 5. 数据 I/O、读写与副作用

DOM 测量（refs）；transform 动画。无持久化。

## 6. 分支、失败、取消与恢复

编辑器缺失→null（:43）；exiting 状态机。不适用取消/恢复。

## 7. 权限与权威状态

性能红线权威（:4-7）；布局算法在 shared（批外）。

## 8. 修改影响面

- 消费面：审稿旁注栏。
- 依赖面：shared 布局纯函数、track-changes 扩展。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；性能红线 | 已证实 | :2-8 |
| 动画/测量实现逐行 | 推断（头+大纲级） | :52-296 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+红线 | §2/§7 | :2-37 | covered |
| 布局/动画实现 | §3/§10 | :52-296 | 推断 |

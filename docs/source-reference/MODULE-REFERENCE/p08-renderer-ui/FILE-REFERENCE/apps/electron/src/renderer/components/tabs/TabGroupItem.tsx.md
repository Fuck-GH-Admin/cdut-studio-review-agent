---
path: apps/electron/src/renderer/components/tabs/TabGroupItem.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f0e3ff738152d8d641cab9ca8ced92d2ff0fe192
sha256: a132c14cca4c9a5c63d02640345efb91a98416fc86b407ae84197435ab4a7b24
lines: 276
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tabs/TabGroupItem.tsx

## 1. 结论与边界

顶栏「组合 tab」条目（头注释 :2-18）：两成员折叠单条目双标题；**宽度分配契约**（:7-12）：w-fit+min/max 由标题实际内容撑开、竖线位置随真实长度、改名自动重分配、flex-1 弹性空隙压按钮到右缘——**不要改回 flex-1 各占一半**。交互约定（:14-17）：左右半区聚焦对应分屏；内部按钮 onMouseDown 冒泡拦截防误触拖动；各成员状态点+琥珀呼吸点。

## 2. 导出与关键符号

导出 2 条（`export` :28/:82）：`TabGroupItemProps`（:28-）、`TabGroupItem`（:82-）。内部：`StatusDot`（:56-）。

## 3. 内部逻辑与关键流程

（头+大纲级，276 行）：双标题自然宽度排布（min-w-0 shrink 无 flex-grow）；左右点击分流；冒泡拦截；解散/关闭按钮。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `TabBar.tsx:73`→:1271。出向：`@/lib/session-status-visual`（:24）、Tooltip（:25）、TabGroupSide/SessionIndicatorStatus 类型。

## 5-7. 数据/分支/权限

纯渲染；宽度契约（§1）。

## 8. 修改影响面

- 消费面：TabBar 组合条目。
- 依赖面：tabsAtom 标题流。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；宽度/交互契约 | 已证实 | :2-18 |
| 条目实现逐行 | 推断（头+大纲级） | :82-275 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+契约 | §2/§7 | :2-82 | covered |
| 条目实现 | §3/§10 | :82-275 | 推断 |

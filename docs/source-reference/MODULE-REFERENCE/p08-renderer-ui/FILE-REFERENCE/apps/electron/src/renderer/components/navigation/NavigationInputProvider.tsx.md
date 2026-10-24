---
path: apps/electron/src/renderer/components/navigation/NavigationInputProvider.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 39d61fbcae4d529d995538f0fa7c9fce47dc6835
sha256: 632a57ff7fb41ace9fdef395587d81571d7a0f10cbe3f3c0c233b99e8feeea85
lines: 375
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/navigation/NavigationInputProvider.tsx

## 1. 结论与边界

**键盘/手柄空间导航桥**（375 行，返回 null 的桥接组件）：把方向/确认/返回动作路由到标题栏/工具栏/面板/对话区/左栏/全局空间导航。**Capture 阶段监听**（ProseMirror 会拦 Alt+Arrow，`:369` 注释）。

## 2. 导出与关键符号

1 导出：`NavigationInputProvider`（`:187`）。内部：`keyboardAction`（`:6`，↑↓←→/Enter/Space/Escape→6 动作）、`focusInput/focusToolbar/focusTitlebar/focusProject/focusRightPanel/focusConversation`（`:17-104`，data-profer-navigation-* 选择器族）、`runGlobalSpatialFallback`（`:115`）、`moveWithinNavigationRegion`（`:218`）。

## 3. 内部逻辑与关键流程

onKeyDown 七段（`:265-368`）：①**Alt+方向=最高优先全局跨区**（alt↑ 对话↔标题栏、alt↓ 编辑框→工具栏循环 `:285` 注释修复、alt←/→ project/右栏，mode 区放行 altLeft/altRight `:294-295`）→②编辑目标裸方向保留光标（`:306`）→③对话区裸上下=滚动 96px（最近 region 判定排除嵌套工具栏 `:308-309`）→④region 内空间导航（mode/toolbar 特判 `:225-240`）→⑤左栏 roving 交 controller→⑥全局空间兜底（findSpatialNavigationTarget）→⑦controller（confirm/back）。controller 注册（`:188-215`，优先级 -100）：左栏 `next` 到底穿出回输入框循环（`:190-202`）+同一 fallback（键盘/手柄一致，`:206`）。confirm 激活（`:162-177`）：原生可点+WAI-ARIA 角色 click，否则聚焦即止防误触发。

## 4. 调用者与调用链

- 入向：main.tsx（顶层常驻）。
- 出向：`@/lib/navigation-controller`/`navigation-actions`/`spatial-navigation`（findSpatialNavigationTarget）。

## 5. 数据 I/O、读写与副作用

DOM 焦点管理+scrollBy/scrollIntoView；CustomEvent（profer:focus-right-panel）；window keydown capture 订阅。

## 6. 分支、失败、取消与恢复

defaultPrevented/isComposing 跳过（`:266`）；无方向目标不吞动作交高层（`:157`）；unmount 移除监听。

## 7. 权限与权威状态

焦点权威=本桥（data-profer-navigation-* 约定）；编辑区不抢（`:120,306`）。

## 8. 修改影响面

键盘/手柄全导航矩阵；与 LeftSidebar/弹层 consumer 的优先级约定。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 七段路由/跨区矩阵/confirm 白名单 | 已证实 | `:1-375` 全文 |
| 手柄输入链路 | 边界 | controller 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+6 聚焦函数+fallback+onKeyDown | §2/§3 | 6-375 | covered |

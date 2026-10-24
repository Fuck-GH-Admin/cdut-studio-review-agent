---
path: apps/electron/src/renderer/atoms/panel-layout-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aa4daed4ef435453a069c261b62cb4b64aee911b
sha256: 73133390a44d9e5963f225771c1ca98ac50524e20a61b8d39b45200871a1aa01
lines: 50
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/panel-layout-atoms.ts

## 1. 结论与边界

面板自适应布局状态原子（50 行，头注释 `:1-8`）：「展开意图 A」（`agentSidePanelOpenAtom`，跨批）与「实际可见 B」（本文件 `panelVisibilityAtom`）分离；B 由 `usePanelAutoLayout` 按窗口宽度统一计算，组件只读共享状态避免竞态。

**边界**：宽度计算/resize 监听在 `usePanelAutoLayout`（跨批 hook）；`PanelVisibility` 类型来自 `@/lib/panel-layout`（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `windowWidthAtom` | atom（导出） | 18-20 | `number` 初值 `window.innerWidth`（无 window 时 1200） | 当前窗口宽（px） |
| `layoutScopeActiveAtom` | atom（导出） | 27 | `boolean` 初值 true | 文件面板是否参与布局判定 |
| `panelVisibilityAtom` | atom（导出） | 33 | `PanelVisibility` 初值 `{filePanel: true}` | 实际可见性 B（初始"曾可见"防冷启动死区） |
| `rightSidePanelContainerAtom` | 派生 atom（导出） | 39-45 | 见 §3 | 右侧栏容器是否渲染 |
| `rightSidePanelVisibleAtom` | 派生 atom（导出） | 48-50 | `container && panelVisibility.filePanel` | 右侧栏真正可见 |

导出合计 5。依赖导入：`@/atoms/app-mode`、`@/atoms/automation-atoms`、`@/atoms/active-view`、`@/atoms/agent-atoms`（`:12-15`，跨批）。

## 3. 内部逻辑与关键流程

1. `windowWidthAtom`（`:18-20`）：初始取渲染进程 `window.innerWidth`，SSR/无 window 兜底 1200；由 resize 监听（跨批 hook）维护。
2. `panelVisibilityAtom`（`:33`）：初值 `{filePanel:true}`——初始视为"曾可见"，避免冷启动窗口刚好够宽时因滞后带产生死区（需多 50px 才显示，`:31` 注释）。
3. `rightSidePanelContainerAtom`（`:39-45`）：四条件全真才 true——`appModeAtom==='agent'`（`:40`）、有 `currentAgentSessionIdAtom`（`:41`）、`automationFormAtom.open` 为假（`:42`）、`activeViewAtom==='conversations'`（`:43`）。注释（`:36-38`）：单一事实源，AppShell 渲染容器与 TabBar 预留槽位都读它，杜绝 138px 错位。
4. `rightSidePanelVisibleAtom`（`:48-50`）：容器条件 && `panelVisibilityAtom.filePanel`。

## 4. 调用者与调用链

入向（全冻结树检索 `panel-layout-atoms`，4 文件）：`hooks/usePanelAutoLayout.ts:24`（import 块，写 width/visibility/scope）、`components/app-shell/AppShell.tsx:19`（`panelVisibilityAtom`）、`components/agent/SidePanel.tsx:33`（`panelVisibilityAtom`）、`components/tabs/TabBar.tsx:63`（`panelVisibilityAtom`+`rightSidePanelVisibleAtom`）。
出向：`jotai`、`@/lib/panel-layout` 类型、4 个跨批 atoms（`:12-15`）。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯 atom 声明；宽度读取仅初始化一次 `:19`）。

## 6. 分支、失败、取消与恢复

分支：`rightSidePanelContainerAtom` 四条件（`:40-43`）；无 window 兜底 1200（`:19`）；无 throw（不适用）。

## 7. 权限与权威状态

无权限分支（不适用）。权威=共享 atom（单一事实源语义 `:37`）；A/B 分离模型由跨批 hook 维护 B。

## 8. 修改影响面

4 个消费方的布局/容器渲染（AppShell/SidePanel/TabBar/usePanelAutoLayout）；四条件或初值变化会复现 138px 错位/冷启动死区（`:31`/`:37` 注释的两个历史问题面）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `panel-layout-atoms` 无测试命中；检索范围=baseline/source 全树）。间接线索：批外 `panel-layout.test`（`@/lib/panel-layout` 的测试，非本文件）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/四条件/初值语义/A-B 分离 | 已证实 | `:1-50` 全文逐行 |
| 4 个调用方 | 已证实 | 全树检索（§4） |
| usePanelAutoLayout 的宽度计算 | 边界（跨批 hook） | `:6`/`:17` 注释 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `windowWidthAtom`/`layoutScopeActiveAtom`/`panelVisibilityAtom` | §2/§3.1-3.2 | 18-33 | covered |
| `rightSidePanelContainerAtom` 四条件 | §3.3 | 39-45 | covered |
| `rightSidePanelVisibleAtom` | §3.4 | 48-50 | covered |

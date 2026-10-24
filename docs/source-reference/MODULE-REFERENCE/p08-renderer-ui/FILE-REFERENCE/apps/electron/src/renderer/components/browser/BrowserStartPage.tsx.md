---
path: apps/electron/src/renderer/components/browser/BrowserStartPage.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 32bdc2291666944a640d1e0141709bf0cce09fd0
sha256: e7e84f0abca68ea73078c331142cd26d53c4e6c3ed47a91f6e1a984f9150080e
lines: 141
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/browser/BrowserStartPage.tsx

## 1. 结论与边界

浏览器新标签起始页（运行时组件）：搜索/地址框（经 `normalizeStartPageInput` 归一化）、书签九宫格、最近访问列表、空态提示。边界：只发起导航回调，不直接调 IPC。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BrowserStartPageProps` | 接口 | 8-14 | state/onNavigate/onRemoveBookmark?/onClearHistory? |
| `BrowserStartPage` | 组件 | 16-141 | 唯一导出组件 |

## 3. 内部逻辑与关键流程

`query` state（`:17`）；`submit`（`:19-23`，归一化后 onNavigate）；`openItem`（`:25-27`）；书签网格（`:58-95`，favicon 兜底 Globe2、悬停删除按钮、aria-label）；最近访问（`:98-128`，清空按钮）；空态（`:131-137`，「浏览过程中点击地址栏的星形按钮收藏页面」）。

## 4. 调用者与调用链

入向：`BrowserPanel.tsx:458`。出向：`@profer/shared`（BrowserStartPageState）、`./browser-start-page-navigation`、`@profer/ui` primitives、lucide。

## 5. 数据 I/O 与副作用

无（回调驱动）。

## 6. 分支、失败、取消与恢复

空 query 不导航（`:22`）；书签/历史长度条件渲染。

## 7. 权限与权威状态

不适用（依据：无 sender/role 检查）。

## 8. 修改影响面

state 形状与主进程 getBrowserStartPage 契约同步。

## 9. 测试证据

无专属测试（glob 零命中）；NOT_RUN（GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+三区块+空态 | 已证实 | `:1-141` |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/区块 | §2/§3 | covered |

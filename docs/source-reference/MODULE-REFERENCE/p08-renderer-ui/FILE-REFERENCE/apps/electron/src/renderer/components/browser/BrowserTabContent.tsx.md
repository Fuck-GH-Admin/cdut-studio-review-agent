---
path: apps/electron/src/renderer/components/browser/BrowserTabContent.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 76628ce868e5d91f0706d9bad81fa22ba76c6576
sha256: 348ae5d513ffae4ae1f0a8fccecb042753f2930d45ad2ad31c51fcc3ce955eba
lines: 65
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/browser/BrowserTabContent.tsx

## 1. 结论与边界

浏览器页 Tab 的内容宿主（运行时组件）：每浏览器内部标签一个顶栏 Tab（`__browser__:sessionId:tabId`）；激活页渲染完整 BrowserPanel；同会话多页并排时非激活页显示轻量占位（主进程同一时刻只渲染一个页面）；Tab 卸载时 cleanup 让原生视图让位、会话保留（`apps/electron/src/renderer/components/browser/BrowserTabContent.tsx:1-9`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BrowserTabContentProps` | 接口 | 19-25 | tabId/sessionId/browserTabId |
| `BrowserTabContent` | 组件 | 27-65 | 唯一导出组件 |

## 3. 内部逻辑与关键流程

`browserStateMapAtom` 取会话状态（`:28`）；非激活页分支（`:36-53`）：占位（Globe2 图标+标题/URL+「同一浏览器的两个页面不能同时并排显示」+「激活此页面」按钮→`selectAgentBrowserTab` IPC 防御式调用，`:39-42`）；激活页渲染 `<BrowserPanel visible>`（`:55-64`）；关闭走 `useCloseTab().requestClose`（`:29-33`）。

## 4. 调用者与调用链

入向：顶栏 Tab 路由（非本批）。出向：`@/atoms/browser-atoms`、`@/hooks/useCloseTab`、`@profer/ui/primitives/button`、`./BrowserPanel`、lucide、jotai。

## 5. 数据 I/O 与副作用

IPC `selectAgentBrowserTab`（激活页）。

## 6. 分支、失败、取消与恢复

select 防御式 typeof 检查+catch 忽略（`:40-41`）。

## 7. 权限与权威状态

不适用（依据：无 sender/role 检查）。

## 8. 修改影响面

Tab id 契约 `__browser__:…` 与主进程/顶栏路由同步。

## 9. 测试证据

无专属测试（glob 零命中）；NOT_RUN（GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+双分支 | 已证实 | `:1-65` |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |

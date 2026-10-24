---
path: apps/electron/src/renderer/components/browser/BrowserPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: feb3cb2ea9d49399b72b1ddb3a252266e562d358
sha256: 499e0a8098b4c2e58be744403cf5b0dc00f7f26851746065c95714e28153ab12
lines: 537
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/browser/BrowserPanel.tsx

## 1. 结论与边界

**受管浏览器面板**（运行时组件）：工具栏（后退/前进/刷新/翻译/收藏/地址栏/缩放/新建标签）+风险告知门禁 + 原生视口（BrowserViewport）/起始页（BrowserStartPage）双态 + 加载错误重试 + Agent 活动条 + 操作 trace 条。边界：导航/书签等全部经 `window.electronAPI` 防御式调用，不直接改主进程状态（`apps/electron/src/renderer/components/browser/BrowserPanel.tsx:24-34` props）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BrowserPanelProps` | 接口 | 24-34 | sessionId/state/visible/avoidWindowControls?/layoutKey?/onClose |
| `BrowserPanel` | 组件 | 36-537 | 唯一导出组件 |

内部关键 state/refs：`url`+`urlDirtyRef`（**用户编辑地址栏时不被主进程回推覆盖**，`:45-47`）、`riskAcknowledged`（风险告知门禁，`:42`）、`expanded`（url/zoom hover 展开，`:55`）、`autoNavigatedTabRef`（默认首页单次导航，`:57`）、`pendingNavAction`（导航动作进行中反馈，`:196`）、`startPage`（书签/历史，`:50`）、`retryingLoad`（`:220`）。

## 3. 内部逻辑与关键流程

- IPC 集合（全防御式 typeof 检查）：`getBrowserStartPage`（`:61-69`）、`translateAgentBrowser`（`:103-117`）、`navigateAgentBrowser`（`:136-149/:327-338`，以主进程规范化地址回写）、`goBack/goForward/reload`（`runNavigationAction:197-215`，失败 toast）、`add/removeBrowserBookmark/clearBrowserHistory`（`:289-325`）、`createAgentBrowserTab/closeAgentBrowserTab`（`:256-271`）、`setAgentBrowserZoom`（50%~300%，`:234-243`）、`getSettings/updateSettings`（风险告知版本，`:120-131/:170-180`）、`stopAgent`（后台运行停止，`:182-189`）、`onAgentBrowserDownloadBlocked` 订阅（下载拦截 toast+外开，`:88-101`）。
- 默认首页：`shouldNavigateDefaultHome` 判定后 `navigateStartPage` 且同标签只一次（`:340-348`）。
- 渲染三态：本地文件预览顶栏（`:356-365`，返回按钮走 `closeLocalFilePreview`：优先后退保留 Agent 标签 `:275-287`）；常规工具栏（`:367-447`，sourceLabel 标识 automation/delegation 来源 `:352-353`）；内容区=风险未确认→告知页（`:493-501`）/空标签无默认首页→BrowserStartPage（`:457-463`）/否则 BrowserViewport+错误遮罩（`:465-491`，`data-browser-blocking` 让原生视图自行隐藏 `:472-473`）。
- 风险告知 AlertDialog（`:504-527`）：自动化风控/封禁/剪贴板敏感信息提示；确认写 settings 版本；**本地文件预览不弹**（`:502-503` 注释）。
- 底部 trace 条（`:528-534`）；Agent 活动条（`:448-455`）。

## 4. 调用者与调用链

入向：`BrowserTabContent.tsx:57`。出向：`./{BrowserViewport,BrowserStartPage,browser-start-page-navigation}`、`@profer/ui` primitives、`@/types/settings`（BROWSER_RISK_DISCLAIMER_VERSION）、sonner toast、lucide。

## 5. 数据 I/O 与副作用

IPC 导航/书签/缩放/设置/停止 Agent/下载拦截订阅；剪贴板 `navigator.clipboard.writeText`（copyUrl，`:151-162`）。

## 6. 分支、失败、取消与恢复

导航/收藏/翻译失败 toast（`:147/:306/:110-113`）；加载错误可重试（重试期间摘遮罩防误盖 `:217-227`）；会话切换清空地址栏脏标记（`:81-85`）。

## 7. 权限与权威状态

风险告知门禁（BROWSER_RISK_DISCLAIMER_VERSION 未确认→`riskBlocked` 禁用全部交互，`:44/:193`）；下载不放行只反馈（`:87`）。

## 8. 修改影响面

IPC 方法集与主进程 browser 会话模块契约同步；风险告知版本常量与 settings 类型同步。

## 9. 测试证据

无专属测试（glob `**/BrowserPanel*test*` 零命中）；NOT_RUN（GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+IPC 全集+三态渲染+门禁 | 已证实 | `:1-537` 逐行 |
| 主进程侧行为 | 未知 | 非本批 |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/交互/门禁 | §2/§3/§7 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |

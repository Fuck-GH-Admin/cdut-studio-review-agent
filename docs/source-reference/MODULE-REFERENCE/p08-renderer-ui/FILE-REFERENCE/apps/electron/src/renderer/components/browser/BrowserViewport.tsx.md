---
path: apps/electron/src/renderer/components/browser/BrowserViewport.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1ce5bb7550591cf041e687c631d41d9238aa5496
sha256: d5f3034ebe716747d32a81781a42646ed3cf130ed5dc54ce427ad2ee5464875b
lines: 217
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/browser/BrowserViewport.tsx

## 1. 结论与边界

**Native browser frame 的唯一 renderer 入口**（运行时组件）：外层 card 唯一几何来源，原生 host 只占 card 内 `pageBounds`（避免透明原生 View 在 macOS 覆盖 DOM 交互区）；把布局（bounds/radius/可见性）经 `setAgentBrowserLayout` IPC 发布给主进程（`apps/electron/src/renderer/components/browser/BrowserViewport.tsx:80-84`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BrowserViewport` | 组件 | 85-217 | 唯一导出（props sessionId/tabId/visible） |

内部：`RENDERER_INSTANCE_ID`（刷新生成新实例标识解决 revision 归零竞态，`:5-9`）、`APP_OVERLAY_LIFECYCLE_SELECTOR`（intro overlay/browser-blocking/sonner toast/radix popper，`:22-27`）、`findBlockingOverlay`（遮挡检测：blocking 元素/toast 相交/popper 非 tooltip 相交，`:29-51`）、`mutationsAffectAppOverlay`（`:53-63`）、`roundedRect`/`readFrameRadius`（`:65-78`）。

## 3. 内部逻辑与关键流程

`useLayoutEffect`（`:97-214`）：`publish` rAF 合帧计算 frameRect/pageRect→`BrowserViewLayout`（visible 需面板可见且尺寸 >4px，`:124`）→`sameBrowserViewportLayout` 去重（`:134`）→IPC。四观察者：ResizeObserver（`:155-160`）+IntersectionObserver（平移检测，`:163-168`）+overlay MutationObserver（`:169-186`）+theme MutationObserver（重读圆角，`:176/:187`）；窗口 resize/scroll（`:188-189`）；`scheduleGeometryPoll` 600ms 短逐帧收敛（`:145-154`）；**cleanup 发布零矩形让原生视图让位**（`:202-212`）。

## 4. 调用者与调用链

入向：`BrowserPanel.tsx:466`。出向：`@profer/shared`、`./browser-viewport-layout`、`window.electronAPI.setAgentBrowserLayout`（防御式）。

## 5. 数据 I/O 与副作用

IPC `setAgentBrowserLayout`（几何协议）；DOM 观察器×4。

## 6. 分支、失败、取消与恢复

setLayout 非函数早退（`:100`）；force 语义绕过去重；卸载统一 disconnect+发零矩形（`:193-213`）。

## 7. 权限与权威状态

不适用（依据：无 sender/role 检查）。

## 8. 修改影响面

布局协议（rendererInstanceId/layoutSourceRevision/revision）与主进程 WebContentsView 管理同步；竞态语义见 `:5-6` 注释。

## 9. 测试证据

`browser-viewport-layout.test.ts`（3 用例，另篇）；NOT_RUN（GUI/IPC）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+发布协议+四观察者+cleanup | 已证实 | `:1-217` 逐行 |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部逻辑/竞态注释 | §2/§3 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |

---
path: apps/electron/src/renderer/components/browser/browser-viewport-layout.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6347b6cdc20824981e9bef122ea03b5341e30c86
sha256: 86822d6e0fe4534d0865d166359eb7f9b5f24595e725e8a7983f6b0d12843ac5
lines: 33
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/browser/browser-viewport-layout.ts

## 1. 结论与边界

原生浏览器视图可见性与布局去重判定（纯函数）：原生 WebContentsView 覆盖 renderer DOM，必须显式服从面板最终可见性（CSS opacity/visibility 不改盒模型，`apps/electron/src/renderer/components/browser/browser-viewport-layout.ts:3-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `resolveNativeBrowserVisible` | 函数 | 7-9 | `(panelVisible, hasBlockingOverlay): boolean` | 两者同时满足才可见 |
| `sameBrowserViewportLayout` | 函数 | 12-23 | `(previous, next): boolean` | 等价布局判定防重复 IPC |

内部：`sameBounds`（`:25-33`，x/y/width/height 全等）。

## 3. 内部逻辑

`sameBrowserViewportLayout`：previous undefined→false（`:16`）；sessionId/tabId/visible/viewportRadius/两组 bounds 全等（`:17-22`）——注释：防 ResizeObserver/主题变更/浮层观察重复发送等价 IPC（`:11`）。

## 4. 调用者与调用链

入向：`BrowserViewport.tsx:3`；测试另篇。出向：`@profer/shared` 类型。

## 5-7. I/O/分支/权限

无；分支见 §3；无权限分支（依据：纯函数无 sender/role 检查）。

## 8. 修改影响面

字段增减须同步 BrowserViewport 的 publish 协议。

## 9. 测试证据

`browser-viewport-layout.test.ts`（3 用例，另篇）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+等价判定 | 已证实 | `:1-33` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |

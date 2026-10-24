---
path: apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuExpressView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c6f032b6a29aa9346c506e91f20e10f0fb3773e
sha256: 4de377115d78bfec075d22f24252c8ae41af863906d4b918f7c0de7d2252b209
lines: 332
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuExpressView.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

智联万站主容器（332 行，头注 :1-12）：TabStrip+NavBar+原生网页视口宿主；测量视口几何经 IPC 上报驱动主进程原生 WebContentsView 精准对齐；**设计红线：界面 100% 纯净无调试 UI，底层 CDP 能力主进程静默承载**（:11-12）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YanhuExpressView` | 组件 | 57-332 | 主容器 |

内部：`RENDERER_INSTANCE_ID`（:26-28，刷新后旧实例晚到布局必须被主进程丢弃）、`nextSourceRevision/nextLayoutRevision`（:30-40）、`ZERO_BOUNDS`（:42）。

## 3. 内部逻辑与关键流程

1. **初始化/广播**（:72-113）：`initOrRestore→showView`；订阅 tabs/loading/url 三广播；卸载 `hideView`。
2. **几何测量**（:117-231）：rAF 合帧 `publish`（root+page 双 rect→viewportBounds/pageBounds）；`visible=enabled&&无全局模态&&尺寸>4px`；**桌宠视口仅 visible 时上报**（注释 :176-178 不可见上报会被主进程视作「几何有效」与隐藏指令冲突）；key 变化才 `updateBounds`（`rendererInstanceId+layoutSourceRevision+revision` 三元组防旧实例）；ResizeObserver+resize+scroll（单帧，注释 :214「不能让任意滚动触发 600ms 轮询风暴」）；分栏拖动 600ms 逐帧收敛 poll；卸载报 ZERO_BOUNDS 撤走原生视图。
3. **可见性校准**（:235-237）：拦截态/故障态/激活标签/全局模态变化→重 publish（模态打开原生视图立即隐去、关闭原位恢复不重载）。
4. **渲染**（:257-332）：`data-yanhu-native-host`；blocked→YanhuBlockedPage、error→YanhuErrorPage（主进程隐藏底层原生视图防卡片下露出，头注 :8-9）；`pageRef` 占位宿主绝对定位。

## 4. 调用者与调用链

入向：智联万站入口路由。出向：`./YanhuTabStrip`、`./YanhuNavBar`、`./YanhuBlockedPage`、`./YanhuErrorPage`、`window.electronAPI.yanhuExpress`（updateBounds/petSyncViewport/syncTheme/操作群）、jotai（yanhu/overlay/theme atoms）。

## 5. 数据 I/O、读写与副作用

经 IPC 上报几何/主题/桌宠视口；操作标签/导航。

## 6. 分支、失败、取消与恢复

init 失败不阻塞界面（`catch(()=>{})`，:104）；API 缺失全守卫早退。

## 7. 权限与权威状态

- 几何权威：三元组（rendererInstanceId+双 revision）防旧实例污染主进程布局（:26-28）。
- 桌宠显隐一致：视口仅可见时上报（:176-178）。
- 纯净红线：无调试 UI（:11-12）。

## 8. 修改影响面

- 受影响消费者：智联万站视口对齐/模态让位/拦截错误页。
- 回归关注：旧实例丢弃、桌宠视口可见性条件、scroll 单帧、卸载撤视图。
- 无专属测试文件（全树检索确认）；回归靠 Electron/GUI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组件/内部符号/行号 | 已证实 | 逐行核对 |
| 三元组/可见性/撤视图语义 | 已证实 | :26-40/:176-231 |
| 原生视图真实对齐 | 未知 | 无测试、NOT_RUN |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 初始化/几何/可见性 | §3.1-3.3 | 57-237 | covered（未测） |
| 渲染/操作封装 | §3.4 | 257-332 | covered（未测） |

---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-window-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 575637d1707e227bd44ba1f3aa73ae6917b8eb91
sha256: 8c0b8aaf93fe59ac673398f63dc57ade75cab9b4449ce76c6d9eddaef85eadb7
lines: 727
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-window-manager.ts

## 1. 结论与边界

桌宠「砚小龙」**紧凑包裹子窗口调度器**（727 行）：为解决 `WebContentsView` 原生图层遮挡 React DOM，桌宠运行在独立透明无边框子窗口，Bounds 动态贴合「桌宠+对话框」几何外框（Tight-Wrapping），窗外保持原生点击/选中/滚轮（`:3-8`）。坐标契约（`:10-11`）：主窗口视口（CSS 像素）→ DIP 换算 → 桌宠上报紧凑几何 → 屏幕坐标应用。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `YanhuPetWindowManager`（class） | `:65-724` | 子窗口生命周期/几何/焦点/状态广播 |
| `yanhuPetWindowManager` | `:727` | 全局单例 |

内部：`DipViewport:32-37`；几何常量组（`:43-60`，**严格镜像渲染层 pet-geometry.ts**，`:40-42` 同步红线）：PET_WIDTH/HEIGHT 160、PET_GAP 12、CARD_WIDTH 420、PET_MARGIN 16、SHADOW_PADDING 16、BUBBLE_HEIGHT 150、INPUT_BAR_HEIGHT 60、DEFAULT_GEOMETRY_WIDTH/HEIGHT 兜底。

**状态字段**（`:66-83`+）：owner/petWindow/presented/dipViewport/geometry/ownerListenersBound/focusTimer/watchdogTimer（首帧看门狗 `:74-75`）/appFocusListener/appBlurListener/ownerHandlers（具名保存精确解绑 `:80-81`）/configRevision。

## 3. 内部逻辑与关键流程

- **子窗口生命周期**：create（透明无边框+preload 注入 `:590` 区）/show/dispose（精确解绑防重建残留 `:80-81`）；随主窗口移动/最小化/恢复/关闭同步。
- **几何贴合**：视口上报→DIP 换算→紧凑包裹几何（视口左上角原点）→屏幕坐标；几何未上报用 DEFAULT_* 兜底（`:57-60`）。
- **焦点裁决**：focusTimer 失焦核对 + appFocus/appBlur 监听（切外部应用失焦裁决 `:78-79`）。
- **看门狗**：首帧呈现兜底保活（`:74-75`）。
- **Z-Order**：`raiseToTop`（`:700-703` 注释：每次移动/重排/显示维持 HWND 最上层，消除 DWM Z-Order 遮挡）。
- **状态广播**：`broadcastState:706-718`（viewport+presented+configRevision+config → PET_STATE_CHANGED）；`send:720-723`（销毁保护）。

## 4. 调用者与调用链

main 智联万站装配侧（YANHU_EXPRESS_IPC_CHANNELS 的 PET_* 通道）；出向 `electron`（BrowserWindow/Menu）、`./yanhu-pi-runtime`、`@profer/shared`（YanhuPet* 事件类型+通道）、`../../config-paths`（VITE_DEV_SERVER_URL）。

## 5. 数据 I/O、读写与副作用

创建/销毁原生子窗口、native 菜单（一键居中复位）、IPC 发送；配置经 pi-runtime/store 持久化。

## 6. 分支、失败、取消与恢复

watchdog 兜底几何缺失；焦点核对定时器恢复；dispose 精确解绑防"主窗口重建后残留回调把桌宠再次显示"（`:80-81`）。

## 7. 权限与权威状态

几何常量**镜像契约**（`:40-42`）：主进程与渲染层 pet-geometry.ts 必须同步，否则菜单复位偏移；Z-Order 无条件抬顶（`:699-701`）。

## 8. 修改影响面

改几何常量须同步渲染层；改焦点逻辑影响桌宠可见性；改广播影响桌宠状态一致性。

## 9. 测试证据

无直接测试（检索 `YanhuPetWindowManager`/`yanhuPetWindowManager` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含矛盾）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全类结构/几何契约/广播 | 已证实 | 727 行全读 |
| 镜像常量同步红线 | 已证实 | `:40-42` |
| DWM Z-Order 遮挡叙述 | 推断 | `:699-701` 注释自述 |
| Electron 运行时实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；运行时实效 unknown。

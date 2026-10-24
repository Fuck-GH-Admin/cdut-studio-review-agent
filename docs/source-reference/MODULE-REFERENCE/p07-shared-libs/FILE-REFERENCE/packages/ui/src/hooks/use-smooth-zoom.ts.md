---
path: packages/ui/src/hooks/use-smooth-zoom.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ed43ef76a6df45550b244ff8fff3f72ca0641b5b
sha256: 403928e504348aa4d12f17af3fc8730be1f6ef153ec38252ac19460f90c090d2
lines: 250
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/hooks/use-smooth-zoom.ts

## 1. 结论与边界

**带 rAF 平滑、指针锚定的滚轮/捏合缩放 Hook**（`packages/ui/src/hooks/use-smooth-zoom.ts:32-57` 注释）：变换模型 `translate(tx,ty) scale(s)` + `transform-origin: 0 0`；指针锚定推导（`:39-53`）保证缩放时指针下内容点不动、不漂移。输出目标 view + rAF 平滑（`current += (target-current)·easing`，`:56`）。不接管 DOM，只给回调。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SmoothZoomOptions` | interface（export） | `:4-7` | `WheelZoomOptions & { easing?=0.35 }` | 平滑系数 |
| `SmoothZoom` | interface（export） | `:9-24` | `{ zoom; pan; bindRef; reset; zoomBy; panBy; onPanMouseDown }` | 返回面 |
| `useSmoothZoom` | function（export） | `:58-248` | `(options?) => SmoothZoom` | 唯一 hook |
| `DEFAULT_WHEEL_ZOOM` | re-export | `:250` | 从 `../lib/wheel-zoom` 转发 | 便利转发 |
| `View` | interface（内部） | `:26-30` | `{ scale; tx; ty }` | 视图状态 |

## 3. 内部逻辑与关键流程

1. **状态**（`:71-80`）：`view`（渲染态）、`boundEl`（**state 而非 ref**，让 wheel effect 在异步挂载时重绑——注释 `:74-76` 点名 DiffTabContent imageDataUrl 场景）、`targetRef/currentRef`、`rafRef`。
2. **平滑 tick**（`:89-109`）：差值 `<0.0005/<0.5` 收敛即同步目标停帧（`:95-99`）；否则 `easing` 插值续帧。
3. **wheel 绑定**（`:116-154`）：原生 non-passive（React 合成事件在部分 Electron 环境 passive，`:115`）；锚点推导用 `currentRef`（对应渲染帧，避免快速滚动漂移，`:123-125`）：未变换左上角 = `rect.left−tx`（`:130-131`）→ 内容点 `v=(P−T)/s`（`:136-137`）→ `applyWheelZoom` 得新 scale（`:139`）→ `T′ = P − s′·v`（`:141-142`）。cleanup 移除监听并 `stopRaf`（`:149-152`）。
4. **zoomBy**（`:157-179`）：按钮步进，以元素中心为不动点（`T′ = T + (s−s′)·c`，`:169-174`）；无元素时仅改 scale（`:162-166`）。
5. **onPanMouseDown**（`:182-211`）：左键（`:184`）+ `preventDefault`；window 级 mousemove/mouseup 拖拽，**拖拽直改 current 不走平滑**（`:200`）；任何缩放级可拖（`:186`）。
6. **bindRef**（`:213-217`）：ref+state 双写（幂等）。**panBy**（`:220-226`）：外部手势直改。**reset**（`:228-237`）：停 rAF、直设 `{scale, 0, 0}`。

## 4. 调用者与调用链

- 入向：`packages/ui/src/index.ts:11-12` 再导出；包外 4 文件：`file-browser/FilePreviewDialog.tsx`、`diff/DiffTabContent.tsx`、`diff/InteractivePreviewViewport.tsx`、`diff/preview-viewport-context.ts`。
- 出向：`../lib/wheel-zoom`（`applyWheelZoom/DEFAULT_WHEEL_ZOOM/WheelZoomOptions` `:2`）、React、`requestAnimationFrame`。

## 5. 数据 I/O、读写与副作用

- 状态全在 hook 内（React state + ref）；副作用：non-passive wheel 监听（`:148`）、window mousemove/mouseup（`:207-208`）、rAF 循环。
- 无网络/磁盘；每 hook 实例独立。
- 并发：`targetRef` 为唯一写点，`currentRef` 由 tick/拖拽更新；无锁（单线程事件流）。

## 6. 分支、失败、取消与恢复

- 分支：收敛停帧（`:95-99`）、无元素 zoomBy（`:162-166`）、非左键忽略（`:184`）、拖拽跳过按钮（`:378` 系对端约定；本文件 `:184` 仅查 button!==0）。
- 无 throw；取消=卸载 cleanup（wheel `:149-152`）；mousedown 未 up 的拖拽监听由 `onUp` 自清理（`:203-206`）。
- 不可恢复点：无。

## 7. 权限与权威状态

无权限分支（纯交互 hook）。

## 8. 修改影响面

改锚定公式 → 4 个消费者的光标锚定精度；改 `boundEl` state 方案 → 异步挂载场景 wheel 失效回归（`:74-76` 注释所指）；改返回面 → `SmoothZoom` 类型消费者。

## 9. 测试证据

无直接测试（负向：冻结树全部 `*.test.*` 检索 `useSmoothZoom|SmoothZoom` → 0 专属命中；`wheel-zoom.test.ts` 测的是底层纯函数）。未覆盖：锚定公式、平滑收敛、拖拽、zoomBy 中心锚定。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出 + View 内部；锚定/平滑/拖拽全逻辑 | 已证实 | 逐行读 `:1-250` |
| boundEl 用 state 的动机（异步挂载） | 已证实（注释） | `:74-76` |
| 拖拽不平滑/panBy 直改 | 已证实 | `:200`、`:220-226` |
| 锚定精度实测 | 未知 | NOT_RUN |
| 4 消费者各自用法 | 推断 | 仅确认 import 面 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `useSmoothZoom` 全流程 | §3 | `:58-248` | covered |
| 4 导出 + View | §2 | `:4-30`、`:250` | covered |
| 调用链 | §4 | 两侧行号 | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

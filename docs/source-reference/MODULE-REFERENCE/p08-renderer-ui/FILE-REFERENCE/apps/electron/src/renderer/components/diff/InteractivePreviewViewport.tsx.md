---
path: apps/electron/src/renderer/components/diff/InteractivePreviewViewport.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f43e8fcde74557d9f1f29e4905330eceef5471d7
sha256: 149b59e62260ae9ed1908352b525305dbe7b6bf6d14add4a6097ce4910da1609
lines: 448
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/InteractivePreviewViewport.tsx

## 1. 结论与边界

通用预览交互外壳：**不对整屏做 CSS 缩放**（缩放一律代理给内容注册的原生实现：Office setScale、PDF pdf-zoom、图片 useSmoothZoom…），**平移=原生滚动**（抓手/中键/Space/Alt 拖拽时优先内容 `panBy`，否则滚动指针下最深可滚动元素）；内容经 `PreviewViewportContext` 注册缩放/平移控制器，未注册的内容仅支持平移（`apps/electron/src/renderer/components/diff/InteractivePreviewViewport.tsx:1-16`）。

边界：

- 不渲染内容（children 由调用方给）；不解析文件；缩放算法归内容实现。
- 选择模式下左键不拦截（划词归内容）；抓手/平移手势期间屏蔽子内容指针事件（`:437-439`）。
- 视口状态记忆（缩放+滚动）仅在提供 `memoryKey` 时启用。

## 2. 导出与关键符号

`export` 逐条核对：2 个（函数 1 + 接口 1；常量/类导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `InteractivePreviewViewportProps` | 接口（导出） | 29-34 | `{children; className?; memoryKey?: string}` | `memoryKey`= `${sessionId}:${normalizedFilePath}` |
| `InteractivePreviewViewport` | 函数（导出） | 98-448 | `({children,className,memoryKey}) => React.ReactElement` | 外壳本体 |
| `scrollableAxes` | 内部函数 | 45-53 | `(el) => {x,y}` | 仅 overflow=auto/scroll/overlay **且**有溢出的轴可滚（排除装饰层，注释 `:36-44`） |
| `findScrollableAt` | 内部函数 | 56-76 | `(container,x,y) => HTMLElement\|null` | 指针下、最深（同深度取面积最小）可滚元素 |
| `findPrimaryScrollable` | 内部函数 | 82-96 | `(container) => HTMLElement\|null` | 内容跨度最大者（外层包裹>虚拟列表内层），供滚动恢复 |
| `register`/`reportScale`/`syncScale`/`persistState`/`schedulePersist` | 内部（useCallback） | 132-190 | 见 §3 | 控制器注册/同步/落盘 |
| `handlePointerDown/Move/Up` | 内部 | 308-351 | PointerEvent 处理 | 平移手势 |

## 3. 内部逻辑与关键流程

`apps/electron/src/renderer/components/diff/InteractivePreviewViewport.tsx:98-448`：

1. **控制器接口**（`:132-154`）：`register(next)` 返回注销（仅同实例才清空，`:141`）；`reportScale(value)` 只收有限正数；`syncScale` 从 `controller.getScale?.()` 拉取；context 值 `{tool, register, reportScale}`（`:146-149`）；控制器就绪后同步一次缩放（`:152-154`）。
2. **状态记忆**（`:156-257`）：
   - `persistState`（`:158-181`）：写 `previewViewportStateMapAtom[memoryKey] = {scale,scrollTop,scrollLeft,updatedAt}`；三项与现存一致则保持原引用（`:169-176`）。
   - `schedulePersist`：300ms 防抖（`:183-190`）。
   - 切文件载入（`:193-203`）：`memoryKey` 变化重置恢复标记，读历史状态到 `restoreStateRef`/`lastScrollRef`。
   - 恢复（`:206-228`）：控制器就绪后**每挂载仅一次**（`restoredRef`）：历史缩放>0 时 `controller.setScale` + 更新显示；滚动恢复用 `findPrimaryScrollable`，找不到则最多 12 次 rAF 重试（`:217-227`）。
   - 缩放变化（`:231-235`）与滚动捕获（`:238-257`）：防抖落盘；恢复完成前不写（防默认 1 覆盖历史）；容器内任意滚动宿主的 scroll 事件（capture+passive）都记入 `lastScrollRef`；卸载时清定时器并**最终落盘一次**（`:251-255`）。
3. **空格键临时抓手**（`:260-287`）：仅鼠标悬停在视口内（`isHoveredRef`）且焦点不在 INPUT/TEXTAREA/contentEditable 时 Space → `preventDefault` + `spaceHeld`；keyup/blur 复位。window 级监听。
4. **滚轮缩放**（`:292-306`）：non-passive wheel 监听；仅 `tool==='hand'` 且有控制器：`preventDefault`，`deltaY<0→zoomIn / >0→zoomOut`，`queueMicrotask(syncScale)`。
5. **平移手势**（`:308-351`）：
   - `handlePointerDown`（`:308-325`）：手势条件 `canPan || e.button===1 || e.altKey`（`canPan = tool==='hand' || spaceHeld`，`:289`）；有 `controller.panBy` 走内容平移，否则 `findScrollableAt` 定目标；记录起点/起始滚动位置；`setPointerCapture`。
   - `handlePointerMove`（`:327-343`）：内容平移=增量 `panBy(dx,dy)`；滚动平移=“起始滚动位置 − 累计指针位移”绝对值写入（避免逐帧取整漂移，`:339-341`）。
   - `handlePointerUp`（`:345-351`）：清 `panRef`、释放指针捕获（capture 存在才释放）。
6. **渲染**（`:356-446`）：外层 `onMouseEnter/Leave` 维护悬停（离开且非平移中复位 spaceHeld，`:360-363`）；右上悬浮控制条：抓手/选择切换（`:367-375`，title 说明两模式）；`hasZoom`（有控制器）时显示 zoomOut/百分比/zoomIn（`:376-395`）及可选 `fit`（适应宽度 `:396-409`）/`reset`（复位 100% `:410-420`）；内容区包 `PreviewViewportContext.Provider`，平移手势中（`canPan||isPanning`）子内容 `pointer-events-none select-none`（`:437-439`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/diff/SidebarFilePreview.tsx:24`（import）、`SidebarFilePreview.tsx:230`（侧栏预览外壳，`memoryKey=previewViewportMemoryKey(sessionId,filePath)`）。无测试引用（见 §9）。

出向：`./preview-viewport-context`（`PreviewViewportContext`/`PreviewViewController`/`PreviewViewportContextValue`）、`@/atoms/preview-atoms`（`previewViewportStateMapAtom`/`PreviewViewportState`）、`jotai` `useStore`、`lucide-react`。内容侧注册方（消费者）：`preview-viewport-context.ts:10` 注释所述各 viewer（Office/PDF/图片），经 context 注册。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络/IPC；atom 读写 `previewViewportStateMapAtom`（内存 Map，非持久化）。
- 副作用：wheel/scroll/keydown/keyup/blur/pointer 监听注册与清理（均有 cleanup）；`preventDefault`（Space `:269`、wheel `:299`、pointerDown `:311`）；指针捕获/释放；定时器（300ms 落盘防抖、rAF 滚动恢复 ≤12 次）。
- 并发：`panRef` 单例手势状态；`restoredRef` 防重复恢复；防抖落盘合并高频滚动。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 非手势 pointerdown | 309-310 | return（放行给内容划词） |
| 有 `panBy` / 无 | 312-313 | 内容平移 / 滚动元素平移 |
| `memoryKey` 缺省 | 159-160,196-202,239 | 不记忆（滚动记 0） |
| 恢复期缩放变化 | 233 | 不落盘（防覆盖历史） |
| 滚动宿主缺失 | 217-227 | ≤12 次 rAF 重试后放弃 |
| 焦点在输入框 + Space | 261-268 | 不拦截（放行输入） |
| 鼠标离开视口 | 360-363 | 复位 spaceHeld（平移中除外） |

- 失败后状态：滚动恢复失败静默放弃（用户手动滚）；无 throw。
- 取消：卸载清所有监听/定时器并落盘最终状态（`:249-256`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/IPC。`tool`（选择/抓手）是本组件内权威（`contextValue.tool` 下发给内容，`:147`）；缩放权威是内容控制器（`getScale/setScale`），本组件只代理与显示。

## 8. 修改影响面

- 改 `PreviewViewController` 契约（`zoomIn/zoomOut/fit/reset/panBy/getScale/setScale`）影响所有注册 viewer（Office/PDF/图片）。
- 改 `scrollableAxes` 判定会改变平移目标选择（Excel 装饰层问题见注释 `:36-44`）。
- 改 `memoryKey` 语义影响 SidebarFilePreview 的状态记忆粒度。
- 改手势条件（Space/中键/Alt）是用户可见交互契约。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `InteractivePreviewViewport` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：无。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：手势识别、滚动恢复重试、防抖落盘、装饰层排除均无自动化断言。维护者验证：图片/PDF 预览试抓手拖拽/滚轮缩放/Space 临时平移；切文件再回来验证缩放滚动记忆。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出（1 接口+1 函数） | 已证实 | `:29`、`:98` 逐条核 |
| 不做整屏 CSS 缩放、缩放代理内容 | 已证实 | 注释 `:4-12` + `:292-306,376-395` |
| 平移优先 `panBy` 否则最深可滚元素 | 已证实 | `:312-313,338-342` |
| 滚动恢复 ≤12 次 rAF | 已证实 | `:217-227` |
| 恢复前不落盘 | 已证实 | `:230-235` |
| 卸载最终落盘 | 已证实 | `:249-256` |
| 唯一调用点 SidebarFilePreview | 已证实（检索） | `SidebarFilePreview.tsx:24,230` |
| 各 viewer 控制器实现 | 未知 | 文件外（preview-viewport-context 消费方未逐行读） |
| 真实手势/滚轮表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `scrollableAxes`/`findScrollableAt`/`findPrimaryScrollable` | §2,§3 | 45-96 | covered |
| 控制器注册/同步 | §3 | 132-154 | covered |
| 状态记忆（载入/恢复/落盘/防抖） | §3,§6 | 156-257 | covered |
| 空格临时抓手 | §3,§6 | 260-287 | covered |
| 滚轮缩放 | §3 | 292-306 | covered |
| 平移手势三函数 | §3 | 308-351 | covered |
| 控制条渲染（工具/缩放/fit/reset） | §3 | 356-423 | covered |
| 指针屏蔽 | §3,§6 | 434-443 | covered |
| 测试 | §9 | — | unknown |

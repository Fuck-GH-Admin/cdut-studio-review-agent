---
path: apps/electron/src/renderer/components/cdut-science/CsLabSlideDrawer.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f85498439789f46bf8fbb51cab4355a3e6ac83ab
sha256: 129d07fd4db4a3509865d041d429aa75d566b236c13c6db1d6bc22350e199b64
lines: 184
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabSlideDrawer.tsx

## 1. 结论与边界

智能上下文滑出抽屉（头注释 :2-6）：普通 380px/宽屏 520px 独立持久化；左缘拖拽调宽+双击复位；**收起时宽度归零、内容宽固定防挤压**（:5）。视口 80% 硬上限（:29-30）。

## 2. 导出与关键符号

导出 1 条（`export` :42）：`CsLabSlideDrawer({open, title, subtitle?, wide?, onClose, children})`（:42-184）。内部：`DRAWER_WIDTH`（:24-27，normal 380/320-700，wide 520/440-900）、`VIEWPORT_MAX_RATIO=0.8`（:30）、`clampDrawerWidth`（:32-40，纯函数：模式上限与视口上限取小、下限兜底；**SSR/单测兜底 1200px** :34-35）。

## 3. 内部逻辑与关键流程

- 宽度双原子独立记忆（jotai cslabDrawerNormal/WideWidthAtom :12/:50-53）；**渲染期 clamp 不回写原子**（:54 注释：小窗口临时收窄不永久覆盖偏好）。
- 视口 resize 强制重算（:59-66，viewportTick）。
- 拖拽（:76-122）：左移变宽（:86）；rAF 节流（:91-98）；**卸载兜底 cleanup**（:68-74，释放全局监听与 rAF）。
- 双击复位（:124-126）；外壳 width 过渡 250ms、resize 中 transition-none（:134）；拖拽中全屏遮罩防选中（:179-181）。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CsLabWorkspaceView.tsx:86` → :2201-2543（容器，children=各面板）。出向：jotai 两宽度原子（:50-51）；纯壳组件无 electronAPI。

## 5. 数据 I/O、读写与副作用

原子持久化宽度；全局 mousemove/mouseup 监听（cleanup 保证释放）。

## 6. 分支、失败、取消与恢复

宽度 clamp 三级（§3）；拖拽卸载兜底（:68-74）。恢复=双击复位。

## 7. 权限与权威状态

视口 80% 上限权威（防挤压舞台）；用户偏好不被临时窗口尺寸污染（:54）。

## 8. 修改影响面

- 消费面：智能上下文抽屉容器。
- 依赖面：cslab-atoms 宽度原子、视口行为。
- 需同步测试：无专属（clamp 为纯函数可测，注释 :34 明示单测意图）。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；clamp/拖拽/卸载兜底 | 已证实 | :24-184 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+拖拽链 | §2/§3 | :24-184 | covered |

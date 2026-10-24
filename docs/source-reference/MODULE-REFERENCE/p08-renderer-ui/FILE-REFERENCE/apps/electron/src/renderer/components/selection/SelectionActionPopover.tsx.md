---
path: apps/electron/src/renderer/components/selection/SelectionActionPopover.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bc8df7f6e9144fcf2c9a5f8b38641bc92440b20a
sha256: 8f193c3e70be87db89de0e9ca3946eacc74fe5fa5c56c57c8e6cd73a018b0f35
lines: 122
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/selection/SelectionActionPopover.tsx

## 1. 结论与边界

**文本选区操作气泡**（122 行）：portal 到 body 的浮动按钮组（"为 Agent 引用"/可选"探索此分支"）；自我钳制回视口并**右移绕过"回到底端"浮动按钮**（`:53-54`，selector `[data-scroll-to-bottom]`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AvoidRect` | 接口 | `:15` | 禁区矩形 |
| `computeViewportShift` | 函数 | `:34` | 钳制平移量+禁区右移（`AVOID_GAP=12` `:30`） |
| `SelectionActionPopover` | 组件 | `:63` | `({x,y,direction='up',onAddToAgent,onOpenExplorationBranch?})` |

内部：`rectIntersects`（`:22`）、`findScrollToBottomRect`（`:56`）。

## 3. 内部逻辑与关键流程

- 钳制（`:76-89`，useLayoutEffect）：实测渲染区域（含 translate 后）→`computeViewportShift`→偏移 left/top；仅越界时改写。
- direction 语义（`:71-72`）：'up' 按钮底部贴锚点/'down' 顶部贴锚点。
- 禁区绕行（`:44-49`）：重叠→左缘移到禁区右+12 空隙，且钳到视口右缘。
- onMouseDown preventDefault（`:97`，防选区丢失）。

## 4. 调用者与调用链

- 入向：对话区文本选区逻辑（域外）；`SelectionActionPopover.test.ts`（本批，10 断言覆盖 computeViewportShift）。
- 出向：react-dom portal、`@profer/ui` Z_LAYER。

## 5. 数据 I/O、读写与副作用

DOM 查询 `[data-scroll-to-bottom]`（只读）；样式偏移写自身。

## 6. 分支、失败、取消与恢复

无禁区/有禁区/越界钳制分支；无抛错。

## 7. 权限与权威状态

无权限分支，依据：纯 UI 浮层。

## 8. 修改影响面

选区引用交互；与 ConversationScrollButton 的避让约定（selector 耦合）。

## 9. 测试证据

`NOT_RUN`。直接测试=同批 `SelectionActionPopover.test.ts`（10 test 计数见该手册；`computeViewportShift` 断言级）；组件渲染未测。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 钳制/禁区绕行/12 空隙 | 已证实 | `:1-122` 全文 |
| 10 断言行为 | 已证实（断言级） | 同批测试 |
| 测试运行 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+2 内部+组件 | §2/§3 | 15-121 | covered |

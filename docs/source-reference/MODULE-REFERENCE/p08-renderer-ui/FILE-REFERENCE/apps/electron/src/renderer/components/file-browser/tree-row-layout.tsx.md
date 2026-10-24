---
path: apps/electron/src/renderer/components/file-browser/tree-row-layout.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f34161a75452a37cf103444c9f9b8fd72b0ef763
sha256: 5f207dd77c2eb28a3195631cbcd68a300470c17f55ff05a367a908fb2e949a67
lines: 81
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/tree-row-layout.tsx

## 1. 结论与边界

文件树行共享布局常量与祖先链竖线渲染（文件头 `:1-4`）：FileBrowser 与 SidePanel 附加目录树共用同一套 sticky/引导线视觉。纯布局工具。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `canBeSticky` | function | `:20-22` | `depth < 8` 才 sticky（0..7 共 8 层；更深随滚动消失防重叠覆盖，`:12-17`） |
| `STICKY_ROW_BASE_CLASS` | const | `:31` | `'sticky bg-content-area'`（不含 top/z——调用方自定；阴影由 globals.css `:has()` 按 sticky 链末行附加，`:24-30`） |
| `TreeRowLayout` | interface | `:33-38` | `{paddingLeft; guideLeft; stickyTop; stickyZIndex}` |
| `computeTreeRowLayout` | function | `:40-52` | 布局计算 |
| `AncestorGuides` | 组件 | `:64-81` | depth 条祖先链竖线（aria-hidden、pointer-events-none） |

内部常量：`TREE_ROW_HEIGHT=32`/`TREE_ROW_HORIZONTAL_MARGIN=8`/`TREE_INDENT_WIDTH=16`/`MAX_STICKY_DEPTH=8`。

## 3. 内部逻辑与关键流程

`computeTreeRowLayout(depth)`：`paddingLeft=8+8+depth*16`（合并 mx-2 外边距防 sticky/普通切换跳动，`:41`）；`guideLeft=paddingLeft+7`（对齐箭头中心）；`stickyTop=depth*32`；`stickyZIndex=max(1,10-depth)`（外层压住下层滚过，`:49`）。`AncestorGuides`：选中态 `bg-accent-foreground/30` 替代 `border/70`（防被 bg-accent 吃对比度，`:62`）；自己的子项引导线由子项容器绘制（`:61`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：FileBrowser 与 SidePanel 附加目录树。出向：`@/lib/utils.cn`。

## 5. 数据 I/O、读写与副作用

无（纯布局）。

## 6. 分支、失败、取消与恢复

depth≤0 不画竖线（`:65`）；sticky 阈值分支（`canBeSticky`）。

## 7. 权限与权威状态

视觉口径如实（sticky 深度上限防重叠、选中态对比度、阴影 :has() 归 globals.css）。

## 8. 修改影响面

改布局常量 → 影响两处文件树视觉一致性。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 层 sticky 阈值/布局公式 | 已证实 | `:12-52` |
| 祖先线/对比度口径 | 已证实 | `:59-81` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | 2/3 | `:9-81` | covered |

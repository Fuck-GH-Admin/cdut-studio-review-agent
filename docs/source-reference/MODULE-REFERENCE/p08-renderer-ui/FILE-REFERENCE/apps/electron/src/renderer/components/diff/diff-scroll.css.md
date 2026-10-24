---
path: apps/electron/src/renderer/components/diff/diff-scroll.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 47d34a34ec64e0c6b7c40189ba92cec15ece8946
sha256: 08cd73723664cc39595eb10160d42656e2328d8e0e594353b09a12d4319e1482
lines: 22
kind: style
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/diff-scroll.css

## 1. 结论与边界

**Diff 滚动条样式**（22 行纯 CSS）：`.diff-scroll` 的 WebKit 滚动条 overlay 化——6px 细条、透明轨道、muted-foreground 20% 拇指（hover 35%），不占布局空间（头注释 `:1`）。

## 2. 导出与关键符号

无导出（CSS）。选择器 5 个：`::-webkit-scrollbar`（`:2`，6x6px）/`-track`（`:7`，transparent）/`-thumb`（`:11`，`hsl(var(--muted-foreground)/0.2)` 圆角 3px）/`-thumb:hover`（`:16`，0.35）/`-corner`（`:20`，transparent）。

## 3. 内部逻辑与关键流程

不适用（声明式样式）；设计要点=主题 token 驱动（`--muted-foreground`）自动适配深浅主题。

## 4. 调用者与调用链

- 入向：diff 视图组件（`diff-scroll` 类名挂载，域外 grep：同目录 diff 组件引用）。
- 出向：无。

## 5. 数据 I/O、读写与副作用

无（样式）。

## 6. 分支、失败、取消与恢复

不适用（声明式）。

## 7. 权限与权威状态

无（样式）。

## 8. 修改影响面

Diff 代码区滚动条观感；仅 WebKit 滚动条伪元素（其它引擎回退原生滚动条）。

## 9. 测试证据

`NOT_RUN`。无直接测试（样式）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 选择器数值 | 已证实 | `:1-22` 全文 |
| 渲染效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 选择器 | §2 | 2-22 | covered |

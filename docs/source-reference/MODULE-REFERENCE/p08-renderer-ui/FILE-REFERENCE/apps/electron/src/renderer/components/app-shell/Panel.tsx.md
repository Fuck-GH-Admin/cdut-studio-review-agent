---
path: apps/electron/src/renderer/components/app-shell/Panel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 624c1404afc4c67d6aea4127803155c4ab11e19e
sha256: d0b4735b0670dfc9ddf231b03794e13e903ebcbd6fe16afefe93ad2bc5c00974
lines: 50
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/Panel.tsx

## 1. 结论与边界

面板基础容器（文件头 `:1-4`）：统一容器样式。纯布局。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PanelProps` | interface | `:9-20` | `{variant?: 'shrink'\|'grow'（缺省 grow）; width?（仅 shrink 生效）; className?; style?; children}` |
| `Panel` | function 组件 | `:25-50` | 基础容器 |

## 3. 内部逻辑与关键流程

基础类：`h-full flex flex-col min-w-0 overflow-hidden`；grow→`flex-1`，shrink→`shrink-0` 且 `width` 内联（width 只对 shrink 生效，`:43`）；`style` 可覆盖合并。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：app-shell 各面板（NavigatorPanel 等）。

## 5. 数据 I/O、读写与副作用

无 I/O：纯容器 div（类名/内联样式合成），不订阅 atom、无副作用、无 DOM 事件、无回调。

## 6. 分支、失败、取消与恢复

variant 两分支：grow→flex-1；shrink→shrink-0 且 width（若给）内联生效（`:43`）。style 覆盖合并后无其它运行时分支；无失败/取消/恢复语义。

## 7. 权限与权威状态

无权限语义；宽度/变体均为纯布局参数，无能力门禁。

## 8. 修改影响面

改本组件 → 影响 app-shell 全部面板（NavigatorPanel 等）的尺寸行为与溢出裁剪；被同目录面板直接引用。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| variant 语义/width 仅 shrink | 已证实 | `:25-50` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `Panel`/Props | 2/3 | `:9-50` | covered |

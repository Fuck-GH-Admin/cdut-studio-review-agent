---
path: apps/electron/src/renderer/components/app-shell/ModeSwitcher.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b9e25b6281db6a8a8c815436b8d231c273cf7008
sha256: d76edc05ed095d17e5c5c3bf44daba50184fcdf76bfde578e0b33fa107576526
lines: 23
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/ModeSwitcher.tsx

## 1. 结论与边界

模式入口（`:7` 注释）：**Agent-only 产品入口；Chat 模式已从 CDUTAI 用户路径移除**。纯展示（Bot 图标+“Agent”标签），无切换交互。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ModeSwitcher` | function 组件 | `:8-23` | `() => React.ReactElement` |

## 3. 内部逻辑与关键流程

`interfaceVariantAtom`（jotai）判 `classic` 变体换底色（`bg-muted` vs `bg-primary/5`）；`data-profer-navigation-region="mode-switcher"` + `titlebar-drag-region`（可拖窗）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：AppShell 导航区。出向：`@/atoms/theme`、`lucide-react`。

## 5. 数据 I/O、读写与副作用

无 I/O；仅经 jotai 只读订阅 `interfaceVariantAtom`（`useAtomValue`）。无副作用、无回调、无 DOM 事件。

## 6. 分支、失败、取消与恢复

interfaceVariant 为 classic 时容器底色 bg-muted，否则 bg-primary/5（`:16`）。无其它运行时分支；无失败/取消/恢复语义。

## 7. 权限与权威状态

“Chat 已移除”口径如实标注（残留历史见 git，非本批）。

## 8. 修改影响面

改本组件 → 影响 AppShell 导航区（`data-profer-navigation-region="mode-switcher"` 区域）显示与拖拽行为；主题变体（classic/现代）联动 `@/atoms/theme`。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| Agent-only 口径 | 已证实 | `:7` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ModeSwitcher` | 2/3 | `:8-23` | covered |

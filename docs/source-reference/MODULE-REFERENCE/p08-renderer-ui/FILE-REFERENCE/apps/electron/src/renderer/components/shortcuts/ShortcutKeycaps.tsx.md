---
path: apps/electron/src/renderer/components/shortcuts/ShortcutKeycaps.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9a6e8fe9b47b9767d4f6d43838e9c97474fe760d
sha256: 4a45c57ec9c784bfba91121d2c2b426f2425002faaee04e4e1afb9790844a2b0
lines: 42
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/shortcuts/ShortcutKeycaps.tsx

## 1. 结论与边界

**快捷键键帽渲染**（42 行纯展示）：按 `+` 拆分 accelerator 逐键渲染 `<kbd>`；订阅 `shortcutOverridesAtom` 使设置页改绑即时刷新（`:23-24` 注释）。

## 2. 导出与关键符号

1 导出：`ShortcutKeycaps`（`:16`）：`({accelerator, shortcutId, className, keycapClassName, separatorClassName})`。`shortcutId` 优先走 `getActiveAccelerator`（含覆盖），否则用传入 accelerator（`:25`）。

## 3. 内部逻辑与关键流程

（`:28-40`）：无绑定→null（`:26`）；split('+')+trim+去空→逐键 `<kbd>`（样式硬编码 h-6/min-w-6/12px，`:35`）+`+` 分隔符；aria-label=整体显示串（`:31`）。

## 4. 调用者与调用链

- 入向：快捷键设置/帮助展示（域外）。
- 出向：shortcut-atoms、`@/lib/shortcut-registry`（getActiveAccelerator/getAcceleratorDisplay）。

## 5. 数据 I/O、读写与副作用

无（渲染；读 atom）。

## 6. 分支、失败、取消与恢复

空绑定→null；无抛错。

## 7. 权限与权威状态

绑定权威=shortcut-registry（覆盖叠加语义）。

## 8. 修改影响面

快捷键展示一致性（与设置页同一 display 函数）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 拆分渲染/覆盖订阅 | 已证实 | `:1-42` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出 | §2/§3 | 16-40 | covered |

---
path: apps/electron/src/renderer/components/cdut-science/CsLabSplitControls.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c75f8af97158396d684405053170e94d9ce309fc
sha256: cc2699cf4f06e3ea8560fb99cf71e315c0c86f5a0e7006c8d48eb02c6d49c42f
lines: 60
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabSplitControls.tsx

## 1. 结论与边界

舞台分屏布局切换控件（头注释 :2）：单屏/左右/上下/田字格四态，含快捷键提示（Alt+1..4，:21-24）。纯展示组件，无副作用。

## 2. 导出与关键符号

导出 1 条（`export` :27）：`CsLabSplitControls({layout, onChange})`（:27-60）。内部：`OPTIONS`（:15-25，四布局+label/shortcut/lucide Icon）。

## 3. 内部逻辑与关键流程

四按钮 map（:37-57）：active 态 `aria-pressed`（:46）+accent 高亮（:47-52）；点击 onChange(value)。纯渲染，不适用取消/恢复。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CsLabWorkspaceView.tsx:87` → :1998（layout/onChange 注入）。出向：lucide、`@/lib/utils`、`@/atoms/cslab-atoms`（类型）。

## 5-7. 数据/分支/权限

无 I/O；active 单分支；不适用权限。

## 8. 修改影响面

- 消费面：CsLabWorkspaceView 布局工具条。
- 依赖面：CsLabSplitLayout 四态枚举。
- 需同步测试：无专属（清单内无）。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；四态布局 | 已证实 | :15-60 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+四态 | §2/§3 | :15-60 | covered |

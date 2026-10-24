---
path: packages/ui/src/primitives/confirm-dialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ceda5dedddb20e3396a1917ca1c8f5600fb327c7
sha256: ad61a99dcc87ae6915ac530444a424dc1e70e4b853228e5050b16dd980c0d978
lines: 64
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/confirm-dialog.tsx

## 1. 结论与边界

确认对话框（组合 `./alert-dialog` 8 部件）：标题/描述/确认-取消双按钮，loading 态禁止关闭。默认 `variant:'destructive'`（:37）。

## 2. 导出与关键符号

导出 1 条（`export` :27）：`ConfirmDialog(props: ConfirmDialogProps): React.ReactElement`（props 接口 :13-25 未导出：open/onOpenChange/title/description?/confirmLabel='确认'/cancelLabel='取消'/loadingLabel?/onConfirm/loading=false/variant='destructive'/children?）。

## 3. 内部逻辑与关键流程

- 关闭守卫（:41）：`onOpenChange` 仅在 `!v && !loading` 时透传——loading 期间 Esc/遮罩不可关闭。
- 描述合并（:45-49）：`description || children` 二选一，children 存在时 `asChild`。
- 按钮（:52-59）：Cancel/Action 均 `disabled={loading}`；destructive 时 Action 红底（:56）；loading 显示 `loadingLabel ?? confirmLabel`（:58）。
- 不适用「取消/恢复/权限」：依据=纯 UI 容器；`onConfirm` 语义由调用方负责。

## 4. 调用者与调用链

入向（7，全生产）：`cdut-zone/CdutZoneView.tsx:35`、`content-review/ReviewMaterialControls.tsx:7`、`content-review/CaseManagerBar.tsx:20`、`agent-skills/AgentPresetSettings.tsx:56`、`agent-skills/AgentSkillsView.tsx:39`、`agent/CsLabToolTrustBadge.tsx:15`、`agent/PermissionModeSelector.tsx:29`（均 apps/electron/src/renderer/components/）。出向：react、`./alert-dialog`（:2-11）。

## 5. 数据 I/O、读写与副作用

无（回调透传）。

## 6. 分支、失败、取消与恢复

loading 关闭守卫（:41）、destructive 样式分支（:56）、label 合并（:58）；无 throw。取消语义：受控组件，关闭与否由调用方 onOpenChange 决定（loading 除外）。

## 7. 权限与权威状态

不适用，依据：无权限字段；危险操作语义仅经 destructive 样式提示。

## 8. 修改影响面

7 个消费组件（多为危险操作确认）；alert-dialog 契约变动直接传导。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；loading 关闭守卫 | 已证实 | :27/:41 |
| 7 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| ConfirmDialog 三分支 | §3 | :27-64 | covered |
| 测试 | §9 | — | unknown |

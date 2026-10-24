---
path: apps/electron/src/renderer/components/cdut-science/CsLabStageGrid.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d8b5b5c855beff07f2b49061379d599ee31c13c1
sha256: 7aba99112011aad2a001970adc54559ab319449c6d270baf767cf958cb977ee8
lines: 185
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabStageGrid.tsx

## 1. 结论与边界

1/4 颗粒度分屏舞台（头注释 :2）：四 pane 恒挂载、hidden 控可见——**切换布局不销毁编辑器/不丢未保存内容**（:127 注释，关键契约）。

## 2. 导出与关键符号

导出 1 条（`export` :92）：`CsLabStageGrid`（:92-185）。Props 大接口（:29-76）：layout/activePaneId/六类 pane 状态（table/manuscript/literature/canvas/mol/figure）+13 个回调。内部：`LAYOUT_CLASS`（:78-83，grid 类）、`VISIBLE_PANES`（:85-90，布局→可见 pane）。

## 3. 内部逻辑与关键流程

single 时可见=[activePaneId]（:122-123，其余布局按表）；逐 pane 渲染 `CsLabStagePane`（:128-182）：figure 资产解析（:130-133）、标题来源 assetTitles/literature（:141-147）、回调逐项下传。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CsLabWorkspaceView.tsx:88` → :2142。出向：`@profer/shared`（8 类型）、`@/atoms/cslab-atoms`（CSLAB_PANE_IDS :19-25→:122-128）、`./CsLabStagePane`（:26→:135）、`./cslab-dnd`（类型）。

## 5-7. 数据/分支/权限

纯渲染；single/多布局分支（:122）；不适用权限/取消。

## 8. 修改影响面

- 消费面：CsLabWorkspaceView 舞台区。
- 依赖面：CsLabStagePane（六类内容渲染）、cslab-atoms 状态形状。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；恒挂载契约 | 已证实 | :122-127 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+布局映射 | §2/§3 | :78-185 | covered |

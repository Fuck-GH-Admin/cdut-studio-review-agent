---
path: apps/electron/src/renderer/components/content-review/CenterPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3f59ae9f35beda08efc699a2fd3a746bbec248e2
sha256: 246dc077aac6ea52916178ddce4821f06da30dc50576e46279341a8affcbf8ab
lines: 828
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/CenterPanel.tsx

## 1. 结论与边界

**中栏「申请与证明」**（`apps/electron/src/renderer/components/content-review/CenterPanel.tsx:1-11`）：申报事项区（开始审核自动识别→条目卡列表）+ 证明区（每份证据卡）。**T6 简化决定（决策日志 #16）：不渲染 SVG 原图，以识别事实与状态徽标为准**（`:11`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CenterPanel` | 组件 | `:73-828` | `{actions: CenterPanelProps}` |

内部：证明识别状态→徽标样式/文案（`:62-72`）。

## 3. 内部逻辑与关键流程

- **头部**：栏目名+条目统计（N 条/M 份证明）。
- **申报事项区**：条目卡（标题/类别 badge/申报分数/日期/组织方+关联证据缩略名+该条 findings 红/黄圆点，`:7`）；卡下渲染申报原文行（`SourceBlockView` dense，`:8`）；点击条目卡→写 `reviewFocusAtom` 定位申报行（severity 取该条最高，`:9`）。
- **证明区**：每份证据卡（文件名+`recognizedFacts`+`parseStatus` badge+关联条目名，`:10`）；**不渲染 SVG 原图**（T6/#16，`:11`）。

## 4. 调用者与调用链

- 消费方：审核工作台三栏（中栏）。
- 出向：`use-review-actions`、`reviewFocusAtom`（联动）、`ReviewMaterialControls`（材料操作）。

## 5. 数据 I/O、读写与副作用

无直接 I/O（actions/atom 驱动）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 条目 findings | `:7` | 红/黄圆点（最高严重度） |
| 无申报/证据 | — | 空态 |

## 7. 权限与权威状态

展示为主；联动定位（`reviewFocusAtom`）是 D8 联动面。

## 8. 修改影响面

- T6 不渲染 SVG 的决定（`:11`）是产品口径（改动需决策日志）。
- 条目卡/证据卡信息密度与 QA 判读相关。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、两区结构 | 已证实 | `:1-828` |
| T6 不渲染 SVG 决定 | 已证实（注释） | `:11` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CenterPanel` | `:73-828` | covered |
| 徽标表 | `:62-72` | covered |

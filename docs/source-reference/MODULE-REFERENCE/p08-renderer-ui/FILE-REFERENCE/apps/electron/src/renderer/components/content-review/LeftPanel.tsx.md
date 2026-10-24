---
path: apps/electron/src/renderer/components/content-review/LeftPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fb9af5578d6e8f039881f0e03d80c94b4f0ac55a
sha256: 7f0af2ad3128df2a0fcf496597b8b257de64db22011050f75102a0fb75f8ff8e
lines: 313
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/LeftPanel.tsx

## 1. 结论与边界

**左栏「审核依据」**（`apps/electron/src/renderer/components/content-review/LeftPanel.tsx:1-9`）：规则文档全文（`SourceBlockView` 只读列表，问题卡/大纲定位的蓝色高亮落点）+ AI 规则大纲区（生成按钮→`RuleOutlineList`）+ 规则包元数据（发布单位/适用学年/版本）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `LeftPanel` | 组件 | `:33-313` | `{actions: LeftPanelProps}` |

## 3. 内部逻辑与关键流程

展示组件：顶部审核依据+规则内容；规则文档全文（只读 `SourceBlockView` 列表）；AI 大纲生成（busy spinner）；底部规则包元数据。点击高亮落点经 `reviewFocusAtom` 联动（D8）。

## 4. 调用者与调用链

- 消费方：审核工作台三栏布局（左栏）。
- 出向：`use-review-actions`、规则文档数据（aggregate）。

## 5. 数据 I/O、读写与副作用

无直接 I/O（actions 回调驱动）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 大纲生成中 | — | spinner |
| 无规则文档 | — | 空态 |

## 7. 权限与权威状态

规则文档只读展示；无写入。

## 8. 修改影响面

- `SourceBlockView`/`RuleOutlineList` 契约。
- 高亮落点联动（reviewFocusAtom）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、三段结构 | 已证实 | `:1-313` |
| 联动实际行为 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `LeftPanel` | `:33-313` | covered |

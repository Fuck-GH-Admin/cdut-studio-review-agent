---
path: apps/electron/src/renderer/components/content-review/ReviewV3T01ConditionEditor.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 475a7c0bcaca0b698cf3f461b9219b1e38415e65
sha256: 7e749a8c6c0827f8ee84c88a044059032e85ef1f8f5df129d27f246b2a3f6940
lines: 43
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T01ConditionEditor.tsx

## 1. 结论与边界

**T01 表单化简单条件编辑器**（`:1` 注释）：只编辑声明式 `eq` 单字段条件，**无用户代码/JSON**；复杂条件只读保留提示「在高级规则编排中修改」（`:40`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T01ConditionEditor` | function（export） | `:11-43` | `({value, fields, onChange, label})`；Props `:4-9` |

内部：`simple`（仅 `'field' in value && op==='eq'` 才可编辑 `:12`）、`options`（kind ∈ text/number/date/boolean/enum `:13`）、`update`（`:15-22`）。

## 3. 内部逻辑与关键流程

`update`：找不到字段→`onChange(undefined)`（`:17`）；number 空串→0、boolean 'true'→true（`:19-20`）；产出 `{field, op:'eq', value}`（`:21`）。UI：字段 select（空=「始终按基础配置处理」`:27`）+值控件按 kind 分派（boolean/enum 下拉、number/date/text 输入 `:31-39`）；条件缺失提示「未填条件字段将等待确认」（`:41`）。

## 4. 调用者与调用链

入向：T01 条件/规则编辑容器（跨文件）。出向：`@profer/shared` 类型（ConditionAST/FieldSpec）。

## 5. 数据 I/O、读写与副作用

受控组件；无副作用。

## 6. 分支、失败、取消与恢复

复杂条件只读（`:40`）；未知字段→undefined。不适用取消/恢复。

## 7. 权限与权威状态

不适用（表单编辑）；「无用户代码/JSON」=表达力边界（`:1`）。

## 8. 修改影响面

改编辑器 → T01 条件录入 UX。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T01ConditionEditor` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+编辑/分派全分支 | 已证实 | 逐行读 `:1-43` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件 | §2/§3 | `:11-43` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

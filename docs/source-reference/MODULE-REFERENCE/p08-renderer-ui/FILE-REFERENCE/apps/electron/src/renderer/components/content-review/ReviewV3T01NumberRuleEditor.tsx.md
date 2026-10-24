---
path: apps/electron/src/renderer/components/content-review/ReviewV3T01NumberRuleEditor.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5cb22bc7e72260966a7a89885d5ed83bbd14a7c9
sha256: cad8d8726f7d47d53f13b8cbe36f33fab646d6b1bbfa7af6eb70a42199e6efa4
lines: 87
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T01NumberRuleEditor.tsx

## 1. 结论与边界

**T01 数值规则创作器**（`:1` 注释）：结构化、**显式负责人确认、绝不是 Run**。语义红线：基于案卷数字字段的确定性规则，**非表单最大值校验**（`:41`）；确认只是本地声明，可信身份与 CheckResult 仍由 Main/Run 核验（`:85`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T01NumberRuleEditor` | function（export） | `:15-87` | `({criterion, fields, onChange})` |

内部：`reviewer/source` 输入 state（`:16-17`）、`numberFields`（kind=number+scope=case `:18`）、`readT01NumberLimit`（`:19`）、`update`（**:21-26，任何语义变更使原 ownerStatement 失效**——剥除 `ownerStatement` 再写 `:23-25`）。

## 3. 内部逻辑与关键流程

- 未配置：一键「改用案卷数值规则」（默认首字段/lte/阈值=field.max `:28-37`）；无数字字段提示（`:38`）。
- 已配置：字段/比较关系（**仅 lte/gte** `:55-57`）/阈值（空→NaN `:62`）三控件。
- 确认状态：`ownerStatement` 有→绿色「负责人已确认」（`:66`）；无→琥珀「尚未确认…发布前必须确认依据」（`:67`）。
- **gte 提示**：「Main/T04 尚未提供正式下限算子；发布校验将提示暂缓」（`:68`）。
- 确认按钮（`:80-84`）：reviewer+source+阈值有限+字段选中才可点；`confirmT01NumberLimit` 写入 owner-statement（text/enteredBy/enteredAt）。
- 失效规则明示：改文字/字段/阈值、派生新版→原确认失效（`:85`）。

## 4. 调用者与调用链

入向：T01 规则编辑容器。出向：`./review-v3-t01-typed-criteria`（4 符号 `:4-7`）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

受控组件+本地输入 state；无 I/O。

## 6. 分支、失败、取消与恢复

未配置/已配置两态；确认禁用条件（`:81`）。不适用取消/恢复。

## 7. 权限与权威状态

红线：确认语义（`:23-25/:85`）；下限算子缺口如实提示（`:68`）；本地声明≠核验（`:85`）。

## 8. 修改影响面

改编辑器 → T01 数值规则创作与确认链。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T01NumberRuleEditor` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+两态+确认失效语义 | 已证实 | 逐行读 `:1-87` |
| typed-criteria 实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件 | §2/§3 | `:15-87` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

---
path: apps/electron/src/renderer/components/content-review/ReviewV3T03FactWorkbench.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2dce3959a3cdb943ec158007a418f915d1a15531
sha256: 75ea492703706253cd8c9e9f5c0b8c134039a21dc6bed020030c70950b898c92
lines: 219
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T03FactWorkbench.tsx

## 1. 结论与边界

**T03 事实与证明核对工作台**（`:1-4` 注释）：复用既有 CAS-backed 工作区动作/原子；T10/Local-L 仅需挂载。红线：**候选不自动成为有效事实；人工确认保留历史；同一证明可支持多事项但不等于重复计分**（`:111`）；**无定位的引文不伪造 SourceRef**（`:26`）；**不把跨案卷/旧解析版本的模型引用悄悄转成当前原件**（`:33-35`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T03FactWorkbench` | function（export） | `:43-219` | `({onRestructure?})` |

内部：`asValue`/`show`（FieldValue 归一/展示 `:14-25`）、`readRef`（**:27-42，canonical ref 闸门**：文档须当前有效、caseId/parseRevision 匹配，缺定位才用 file 级）、`candidates` 投影（`:56-68`）、`perform`（修改后自动规则重审 `:78-97`）、`confirm`（`:100-107`）。

## 3. 内部逻辑与关键流程

1. 左栏「事实候选/人工确认」（`:116-161`）：事实列表（未确认/待处理标注 `:124-125`）；候选逐条「确认」（`:133-138`）；**更正须填理由**（`:143-147` disabled）；`parseT03Correction`（`:149`）；完整观察历史（曾确认/候选/失效 `:153-155`）；**重审影响提示「旧 Run 不会被覆盖」**（`:156-160`）。
2. 右栏「证明归属/多对多绑定」（`:163-214`）：退役原件禁新证据（`:170`）；跨主体候选「不得自动认定归属」（`:171-173`）；关联确认/拒绝（经 `transitionEvidenceLink`，历史保留 `:174-187`）；抽取候选「核对并绑定」（`:188-197`）；手动绑定（`:198-213`）。
3. `perform`（`:78-97`）：保存后 `runTemplateRuleReview` 重查规则（**aggregate 已清时空过 `:83-87`**）；成功提示「涉及 AI 语义判断仍需重新完整审核」（`:89`）；重审失败不吞保存（`:90-93`）。
4. 底部挂 `ReviewV3T03RestructurePanel`（`:217`，同批）。

## 4. 调用者与调用链

入向：统一工作台。出向：`@/atoms/review-atoms`、`./use-review-workspace-actions`、`../../../main/lib/review/review-v3-t03-*`（2 模块 6 符号 `:11-12`）、`window.reviewAPI.runTemplateRuleReview`。

## 5. 数据 I/O、读写与副作用

写：观察确认/更正、关联状态迁移（CAS actions）、规则重审 Run；读：aggregate。

## 6. 分支、失败、取消与恢复

缺引用/退役/歧义均拒或提示；重审失败可重试（`:92`）。不适用取消/恢复。

## 7. 权限与权威状态

红线：候选≠事实（`:111`）；canonical ref 闸（`:26-42`）；旧 Run 不覆盖（`:159`）；人工理由必填（`:143`）。

## 8. 修改影响面

改工作台 → 事实核对/证明归属链与重审语义。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T03FactWorkbench` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+4 内部+双栏全链 | 已证实 | 逐行读 `:1-219` |
| t03-fact-workflow 投影实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:43-219` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

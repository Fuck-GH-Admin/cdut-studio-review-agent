---
path: apps/electron/src/renderer/components/content-review/ReviewV3T03RestructurePanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aa9cd6a42f5de53f816b01d071817843b1bff2d5
sha256: ff92b0cece11624abcf4ce2ac3593a77e9585138d233ae862768f96d02797c95
lines: 157
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T03RestructurePanel.tsx

## 1. 结论与边界

**T03 主体拆分/合并 UI**（`:1-4` 注释）：产出**完整不可变业务提案**；可选 `onApply` **仅由 L 的单次可信 Case CAS 写入器供给**。语义红线：**同名主体不自动视为同一人；新主体事实与证明先成待确认候选；原始版本保留**（`:82`）；字段冲突人工解决，**不擅自取最大分或最新 AI 值**（`:132`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T03RestructurePanel` | function（export） | `:12-157` | `({aggregate, run, onApply?})` |

内部：`reference`（file 级 SourceRef `:41-45`）、`previewPlan`（`:47-72`）、`submit`（`:73-79`）。

## 3. 内部逻辑与关键流程

1. 拆分（`:87-130`）：原事项+双名；**逐项事实归属/逐条证明归属**（默认 'a'，标注「不能漏掉或复制到两个事项」`:104`）；可选原件引用（默认「由分配的事实/证明引用」`:127`）；`proposeT03SubjectSplit`（operationId=uuid `:51`）。
2. 合并（`:131-142`）：多选≥2+新名；`proposeT03SubjectMerge`。
3. 预览（`:146-155`）：退役/新主体计数、候选事实/待确认关联、**受影响检查项+「旧 Run 不被覆盖」**（`:149`）；blockedReasons 红列；**无 onApply→「仅能预览，不能假装已保存」**（`:154`）。
4. 提交：blocked 或无 onApply 拒（`:74`）；`onApply(preview)` 走 L 的 CAS。

## 4. 调用者与调用链

入向：T03 事项管理工作台。出向：`../../../main/lib/review/review-v3-t03-subject-restructure`（2 提案函数 `:7-9`）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

无直接 I/O；写入经 onApply（L CAS）。

## 6. 分支、失败、取消与恢复

校验失败 throw→error 显示（`:53/:65/:71`）；编辑即重置预览（reset 防陈旧 `:46`）。不适用取消/恢复。

## 7. 权限与权威状态

红线：提案不可变、写入单点（`:2-3`）；同名≠同人（`:82`）；冲突不擅断（`:132`）；无写入器不假装保存（`:154`）。

## 8. 修改影响面

改面板 → 主体拆并提案链与事实归属正确性。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T03RestructurePanel` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+2 内部+拆并全链 | 已证实 | 逐行读 `:1-157` |
| t03-subject-restructure 提案实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+拆并链 | §2/§3 | `:12-157` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

---
path: apps/electron/src/renderer/components/content-review/ReviewV3T08SuggestionReview.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 941f18e32c57e5bd003c207f1f1fcd927aeec4cd
sha256: aacd6ac7432f245416941130cde22295c719762226fdfd6b7452e150c6359362
lines: 179
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T08SuggestionReview.tsx

## 1. 结论与边界

**T08 已复核 AI 建议应用**（`:1-5` 注释）：真实、显式确认的字段修改，走**既有可信 Main UpdateFieldsV2 事务**；**绝不执行模型生成的 key/Actor/approval**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T08SuggestionReview` | function（export） | `:25-179` | `({aggregate, run, template, opinion, stale, onOpenSource?, onClose})` |

内部：`targets`（**仅 published 模板字段** `:27-28`）、`sources/located`（`:39-40`）。

## 3. 内部逻辑与关键流程

1. **apply 前置**（`:44-52`）：confirmed/stale/busy 门；**提交前重取 aggregate 防审阅期间修改**（`:48-50`）；**Run 已过期拒改**（`:51-52`）。
2. 补件模式（`:53-61`）：要素去重+原因必填；`openSupplement`（经 Main 业务事务）；「不等于自动批准」（`:57`）。
3. 字段模式（`:63-96`）：`parseT08FieldDraft`+`makeF17FieldPatch` → `updateFieldsV2` CAS（**actor 本地声明非学校身份** `:72-73`）；保存后**自动规则重审**（`:80-89`，「AI 语义意见仍需重新完整审核」/重审失败可重试）。
4. UI：AI 原建议=**可审阅临时草案不自动执行**（`:103`）；来源定位计数+「无法核对的来源不得视作证据」（`:112`）；核对原件按钮（located/file-only `:115-117`）；stale 提示（`:119`）；目标选择「不自动猜测」（`:126`）；新值「不从模型自动填入」（`:134`）；对比行（`:148`）；**确认勾选**（「不是自动采纳模型意见」`:150-153`）；无 published 字段→「不接受 AI 自造字段」（`:124`）。

## 4. 调用者与调用链

入向：T08 报告建议区。出向：`./use-review-workspace-actions`/`review-v3-t08-*`/`review-v3-f17-patch`、`window.reviewAPI` 4 接口。

## 5. 数据 I/O、读写与副作用

写：字段修改/补件任务（Main CAS）；规则重审 Run；clipboard 复制草案。

## 6. 分支、失败、取消与恢复

校验失败→notice；任一条件不满足即禁用保存。不适用取消/恢复。

## 7. 权限与权威状态

红线：无模型 Actor/approval（`:4`）；过期 Run 拒用（`:51-52`）；人工确认勾选；actor 本地声明（`:72-73`）。

## 8. 修改影响面

改面板 → AI 建议人工复核链与字段修改可信度。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T08SuggestionReview` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+双模式全链 | 已证实 | 逐行读 `:1-179` |
| t08-suggestion/f17-patch 实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+apply 链 | §2/§3 | `:25-179` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

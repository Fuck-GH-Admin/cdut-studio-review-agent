---
path: apps/electron/src/renderer/components/content-review/ReviewV3T06BatchIntakePreview.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 25b60b985e505170dea5ef8c28dbff1b7925c664
sha256: 002d933d1a2918537b06ca8f354201a63de2ab5bd72242106641f333e863d073
lines: 170
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T06BatchIntakePreview.tsx

## 1. 结论与边界

**T06 显式批次名册映射**（`:1` 注释）：映射到既有案卷，**不写 Case 或材料状态**。语义红线：**姓名/学号/文件名只用于核对，不自动绑定到别人案卷；本步只导入分案清单，不上传原件也不创建新案卷**（`:90-91`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T06CaseOption` | interface（export） | `:7-11` | caseId/title/applicant? |
| `ReviewV3T06BatchIntakePreview` | function（export） | `:13-170` | `({availableCases, onApply})` |

内部：`assignments=previewBatchAssignment(rows, cases, overrides, excluded)`（`:27-30`）、`invalidateApplied`（**:35-39，名册变更撤销旧选择防父级用旧名单建批次**）。

## 3. 内部逻辑与关键流程

1. 导入（`:41-58`）：CSV/TSV 经 `parseBatchManifest`；错误逐条 `role="alert"`。
2. 预览表（`:97-152`）：每行（行号/清单对象/外部编号/文件清单「未上传」）；**绑定下拉限 availableCases**（`:132-137`）；核对情况（ready 绿/其余琥珀 `:140-141`）；排除勾选。
3. 应用（`:153-165`）：**pending>0 或 ready=0 禁用**（`:158`）；应用后任何改绑/排除/换清单均撤销旧选择（`:35-39/:129/:156`）。

## 4. 调用者与调用链

入向：T06 分案区。出向：`./review-v3-t06-batch-intake`（parse/preview 两纯函数 `:4-5`）、`@profer/ui`。

## 5. 数据 I/O、读写与副作用

读本地清单文件（File.text()）；无持久化（写入在父级）。

## 6. 分支、失败、取消与恢复

解析失败→errors；应用失效化机制（§3.3）。不适用取消/恢复。

## 7. 权限与权威状态

红线：零 Case/材料写入（`:1`）；不自动绑定（`:90`）；不上传不建档（`:91`）。

## 8. 修改影响面

改预览 → 分案映射 UX 与误绑防护。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T06BatchIntakePreview` → 0 命中；parse/preview 纯函数属跨文件模块）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+1 内部+失效化机制 | 已证实 | 逐行读 `:1-170` |
| t06-batch-intake 纯函数 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:13-170` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

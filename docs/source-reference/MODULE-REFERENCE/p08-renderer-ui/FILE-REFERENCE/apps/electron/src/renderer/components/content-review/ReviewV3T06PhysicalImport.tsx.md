---
path: apps/electron/src/renderer/components/content-review/ReviewV3T06PhysicalImport.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c80859f6180c89b5a311f9891814a483413abea
sha256: c859a3f57636083b9a9c70a9ec01865b2e29cf1eaed12d3e9ea1cd4d10294307
lines: 314
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T06PhysicalImport.tsx

## 1. 结论与边界

**真实文件夹/ZIP 分案入库**（`:150`）：按子目录分案，目录名=已有案卷编号才自动绑定（**目录名与持久化 caseId 完全一致+模板版本匹配** `:50-52`）；未知业务人工确认。**接口由 L 绑定原生选择器+可信 Main 写入器**（`T06PhysicalMainApi` `:15-19`）；未接通时**不以清单绑定冒充原件入库**（`:158-159`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T06PhysicalMainApi` | interface（export） | `:16-19` | pickT06PhysicalSource/commitT06PhysicalImport |
| `ReviewV3T06PhysicalImport` | function（export） | `:21-314` | 分案导入面板 |

内部：`preview/selected/plan` 三 useMemo（`:42-69`）、`importManifest`（清单预填「仅为建议」`:167`）、`commit`/`executeCreatedBatches`（`:111-130`）、`updateAssignment/updateCaseField`（`:135-146`）。

## 3. 内部逻辑与关键流程

1. 选择（`:71-82`）：folder/zip；folder 默认去顶层根（stripRoot `:78`）。
2. 分组决策（`:194-284`）：create/exclude/existing 三态（`:200-204`）；模板选择（空=「未确定——请核对」`215`；文件名建议**仅预匹配** `:219`）；根目录文件必须明确归属（`:221-225`）；必填案卷字段（**可先入库，提交审核前必须补齐** `:233`）；原件归属（角色 4 种+材料槽 `:252-273`）；**必交槽未绑定→可保存但提交审核被明确阻断**（`:249-251`）。
3. 清单导入（`:83-107`）：`suggestT06PhysicalManifest` 预填（保留人工模板选择 `:94-99`）；匹配/未匹配/重复编号计数提示。
4. 提交（`:111-119`）：`plan.request`→Main 事务；receipt 锁定表单（`disabled={!!receipt}`）。
5. 回执（`:291-311`）：成功/失败案卷计数、逐文件未入库清单、多批次创建、**「开始审核全部已导入案卷」**（`runBatchV2` 批量 `:120-130`，allSettled 逐失败列）；失败案卷「已登记 n 份，后续可恢复」+防重复导入提示（`:303-305`）；warnings 提交前补齐清单（材料不丢失不重复建案 `:306-310`）。

## 4. 调用者与调用链

入向：T06 分案区。出向：`review-v3-t06-batch-intake`/`-physical-manifest`/`-physical-intake`/`-template-route`（跨文件纯函数）、注入 `api`、`window.reviewAPI.runBatchV2`。

## 5. 数据 I/O、读写与副作用

写：案卷/材料/批次（经 Main 事务）；读文件清单；批量执行批次。

## 6. 分支、失败、取消与恢复

校验错误/警告分列（`role="alert"`/status）；receipt 后锁定防重复。不适用取消/恢复。

## 7. 权限与权威状态

红线：Main 写入单点（`:15`）；自动绑定限全等匹配（`:50`）；清单仅建议（`:167`）；未接通不冒充（`:159`）。

## 8. 修改影响面

改面板 → 物理导入分案链与批次创建。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T06PhysicalImport` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+4 内部+全链 | 已证实 | 逐行读 `:1-314` |
| t06-* 纯函数/Main 事务 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:21-314` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

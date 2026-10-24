---
path: apps/electron/src/renderer/components/content-review/BatchPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8e5c1cb7aa93fbba02b54557e81ea2e930ef0303
sha256: 4b1878c57a32224db1773d101cd08b7a70909b70ab482ae35242c371bf638978
lines: 926
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/BatchPanel.tsx

## 1. 结论与边界

**批量审核面板**（`apps/electron/src/renderer/components/content-review/BatchPanel.tsx:1`，926 行，本批最大）：按批次查看项目进度；审核队列策略后续单独收敛（`:1` 注释）。批次列表/详情/自动化处理/重试/收尾/导出。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BatchPanel` | 组件 | `:83-926` | `{active, onOpenProject}` |

内部：`BATCH_STATUS_LABEL`（`:41`，状态文案）、`formatTime`（`:45`）、`caseStatus`（`:51-62`）、`TRIAGE_LABELS`/`TRIAGE_TONES`（`:63-81`，分流路由文案/色调）。

## 3. 内部逻辑与关键流程

- **数据加载**（`:115-118`）：`Promise.all([listBatchesV2, listCasesV2, listCases, listTemplatesV2])`（V1/V2 双源）。
- **轮询**（`:187-188`）：批次 `running`/执行中 1.5s，否则 8s；`poll` 刷新 `getBatchV2`/`listRunsV2`。
- **动作**（`:250-400`）：`createBatchV2`（建批）、`batchActionV2({action:'retry'})`（`:305` 重试）、`batchActionV2({action:'finalize-completed'})`（`:388` 收尾）、`processBatchAutomationV2`（`:376` 自动化处理）、`runBatchV2`（`:400` 运行）。
- **导出**（`:353`）：URL.createObjectURL + 1s 后 revoke。
- 三元组状态：`BATCH_STATUS_LABEL`/`caseStatus`/`TRIAGE_*`（分流路由可读化）。

## 4. 调用者与调用链

- 消费方：批量审核区（`:83` `active`）。
- 出向：`window.reviewAPI`（9+ 个批次/案卷/运行 IPC）、`BatchAutomationDialog`/`BatchGroupActionDialog`（同批）。

## 5. 数据 I/O、读写与副作用

IPC 批次 CRUD/运行/重试/收尾/自动化；轮询定时器；导出 Blob URL。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 轮询间隔 | `:187` | running 1.5s / 空闲 8s |
| 重试 | `:305` | `batchActionV2 retry` |
| 收尾 | `:388` | `finalize-completed` |
| 导出 | `:353` | Blob URL 1s revoke |

## 7. 权限与权威状态

批量动作经 `batchActionV2`（主进程授权链，与 BatchAutomationDialog 的授权修订号语义配套）；本地人工身份。

## 8. 修改影响面

- 9+ 批次 IPC 契约；轮询节奏影响性能。
- 分流路由文案表（`TRIAGE_*`）与主进程路由值耦合。

## 9. 测试证据

无专属测试（全树检索 `BatchPanel` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、批次全操作面 | 已证实 | `:83-926` |
| 轮询节奏/动作清单 | 已证实 | `:187`、`:250-400` |
| 主进程批次执行 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `BatchPanel` | `:83-926` | covered |
| 状态/分流文案表 | `:41-81` | covered |
| 动作/轮询/导出 | `:187-400` | covered |

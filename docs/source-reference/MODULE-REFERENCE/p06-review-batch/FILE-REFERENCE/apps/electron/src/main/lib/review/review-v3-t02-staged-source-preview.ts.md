---
path: apps/electron/src/main/lib/review/review-v3-t02-staged-source-preview.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5b95276aaacba08c3f672d9e8b570f1bdbf3a6fb
sha256: 90da52d274ab8a9ec6767de25a7cf398df805f5ca5169c0aee7d44b6f9400dd2
lines: 137
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t02-staged-source-preview.ts

## 1. 结论与边界

T02 对 B2 Main 拥有的物理源候选的**只读解析**（文件头 `:1-6`）：不是持久 DocumentVersion、不是可信最终 SourceIdentity；C/L 可经已有认证 Main 读端口暴露，**绝不接受渲染层文件系统路径、绝不签发 Case**。异步读 staging 字节 + 已随包的 PDF/Office/文本/图片管线解析；临时路径只为既有 path-based 解析器而用，返回前删除；原始图片/Office 媒体不冒称被检查器打开过。

不做的事：不落盘持久文档 ID（诊断解析器铸造的 ID 不外露，`:73-74`）；不给临时路径（`:73`）；不做视觉核验（图片块标 `requiresVisualInspection`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T02SourceBlockPreview` | interface | `:17-26` | `{sourceBlockKey（版本内唯一、跨预览稳定）; kind; text; page; table?; requiresVisualInspection}`（图片证据“即使版面引擎找到框仍未验证”，`:24`） |
| `T02StagedSourcePreview` | interface | `:28-45` | `{schemaVersion; checkpoint:'staging-only'; candidateOnly:true; …parseStatus; indexedPages（已提取页，非总页数声明，:40）; sheets; imageBlocksAwaitingInspection; blocks}` |
| `previewT02StagedSource` | function | `:53-103` | 单候选预览 |
| `previewT02StagedInventory` | function | `:109-137` | Main 全量清单（列出每个 ZIP 条目/图片，非渲染层子集；partial/failed 可见，`:105-108`） |

## 3. 内部逻辑与关键流程

### 3.1 `previewT02StagedSource`（`:53-103`）

1. `assertStillGranted` + `getCandidate`/`read`；字节长度+sha256 与记录不符 → `T02_STAGED_BYTES_CHANGED`（`:61-64`）。
2. `mkdtemp(review-v3-t02-preview-)` 写 `source{ext}` 供解析；`parseRole = role==='application' ? 'application' : 'evidence'`（unassigned 是 staging 关系不是新证据角色，`:69-70`）。
3. `parseFileIntoSourceDocument` 后再 `assertStillGranted`；块映射：`sourceBlockKey = {documentVersionId}:block:{n}`、image 块 `requiresVisualInspection=true`（`:75-82`）。
4. 返回 `parseStatus/parseError`、`indexedPages`（去重排序）、`sheets`（table.sheet 去重）、待检图片计数；finally `rm` 临时目录（`:100-102`）。

### 3.2 `previewT02StagedInventory`（`:109-137`）

`listScopedCandidateIds` 全量逐个预览；末尾再 `assertStillGranted`；统计 total/parsed/partial/failed/imagesAwaitingInspection。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：T02 预览 IPC（Main 读端口）；直接测试 `review-v3-t02-staged-source-preview.test.ts`。出向：`review-intake-adapter-v3-b2`（staging）、`document-service.parseFileIntoSourceDocument`、`node:fs/promises`、`node:crypto`。

## 5. 数据 I/O、读写与副作用

读 staging 字节；临时目录写删（finally 清理）；无持久写/网络/日志。副作用：解析可能耗 CPU（随包管线）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 授权撤销 | `:58/:72/:126` | throw（B2_OWNER_INVALID_OR_REVOKED） |
| 字节漂移 | `:61-64` | `T02_STAGED_BYTES_CHANGED` |
| 解析失败 | `:92-93` | parseStatus 'failed'/parseError 如实（不生成占位证据） |
| 取消 | 无 | 无 AbortSignal；临时目录 finally 清理 |

## 7. 权限与权威状态

- 授权窗口贯穿（首尾断言）；candidateOnly/checkpoint:'staging-only' 标记非权威。
- 图片恒待检（不冒称已读）；indexedPages 不声称总页数；诊断解析器的文档 ID 不外露。

## 8. 修改影响面

改块映射 → 影响 T02 预览 UI 与下游锚点；`parseFileIntoSourceDocument` 契约联动 `document-service`。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-t02-staged-source-preview.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| staging-only/candidateOnly 诚实标记 | 已证实 | `:28-31`、返回形状 |
| 字节漂移拒绝+授权首尾 | 已证实 | `:58-64/:72` |
| 临时路径不外露、finally 清理 | 已证实 | `:73-74/:100-102` |
| 图片待检不冒称已读 | 已证实 | `:24/:81/:97` |
| 全量清单含 partial/failed | 已证实 | `:105-137` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两接口 | 2 | `:17-45` | covered |
| `previewT02StagedSource` | 3.1 | `:53-103` | covered |
| `previewT02StagedInventory` | 3.2 | `:109-137` | covered |

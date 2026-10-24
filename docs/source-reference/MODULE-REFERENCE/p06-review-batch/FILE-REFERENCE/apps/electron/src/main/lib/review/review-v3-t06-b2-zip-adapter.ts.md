---
path: apps/electron/src/main/lib/review/review-v3-t06-b2-zip-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c3b745b4636ee2159b8d62057769fcc420d599e5
sha256: 60125bc4fac59f5db0ac22d6cca3d052c79298effaac0ba8696b82fd9313ba4a
lines: 42
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t06-b2-zip-adapter.ts

## 1. 结论与边界

T06→T02 桥（文件头 `:1-6`）：把 **Main 拥有的** B2 ZIP 暂存回执转成候选文件分组，不复制原始字节、不发明第二套解包器；L（下游）导入 candidateId 成真实 DocumentVersion 时必须保留暂存范围并核对同一物理归档、所有者与封存选择。纯函数适配器。

**冻结树负结论**：`buildT06SelectionFromB2Staging`/`T06StagedZipSelection` 在 `apps/electron/src/**/*.{ts,tsx}` 与 `packages/**/*.ts` 全量检索（含测试）中**只出现在本文件**（`:10/:15/:17`）——无生产调用者、无测试；其消费方（文件头所称 T02/L 链路）在冻结树中未接入。照实记录。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T06StagedZipSelection` | interface | `:10-13` | `{source: T06PhysicalSelection; skipped: [{relativePath, reason}]}` |
| `buildT06SelectionFromB2Staging` | function | `:15-42` | `(staged: B2ZipImportPreview) => T06StagedZipSelection` |

类型依赖：`B2ZipImportPreview`（`review-zip-staging-v3-b2`，`:7`）、`T06PhysicalSelection`（渲染层组件 `review-v3-t06-physical-intake` 的类型，`:8`——Main 侧经类型导入与渲染层共享结构契约）。

## 3. 内部逻辑与关键流程

逐条遍历 `staged.extracted`（`:18-31`）：

- **入选**（`:21-27`）：`extracted.status==='accepted'` 且对应 `receipts[i]` 有 `candidateId` 且 `receipt.status==='needs-user-confirmation'`，且能在 `staged.candidates` 里按 `candidateId` 找到候选且 `candidate.rawSha256 === extracted.rawSha256` → 入 `entries`：`{entryId: candidate.candidateId, relativePath: extracted.entryName, byteLength: candidate.byteLength}`。
- **跳过**（`:29-30`）：其余一切 → `skipped.push({relativePath, reason: receipt?.reason ?? extracted.reason ?? '未取得可登记原件'})`——逐条留痕，不是静默丢弃。
- **输出**（`:32-41`）：`source = {selectionId: staged.archivePhysicalKeyDigest, previewFingerprint: staged.archiveSha256, sourceKind:'zip', entries, warnings: skipped.map('路径：原因')}`。

匹配要求严格：`candidateId`、`rawSha256`、`status` 三者同时满足；字节长度取 candidate 的 `byteLength`（与 rawSha256 同源核对）。

## 4. 调用者与调用链

- **入向**：无（见 §1 负结论）。
- **出向**：仅类型（`:7-8`），无运行时依赖。
- 预期链路（按文件头注释）：B2 ZIP 暂存（`review-zip-staging-v3-b2`）→ 本适配器 → T02/L 物理入库（`review-v3-t06-main-service` 的 `T06PhysicalSelection`）——**该链路在冻结树未接通**。

## 5. 数据 I/O、读写与副作用

无：纯内存形状转换；不读盘、不复制 ZIP 字节（`entries` 只含 id/路径/长度）。幂等、无并发问题。

## 6. 分支、失败、取消与恢复

无 throw、无异步。失败一律降级为 `skipped` 条目（含 reason）；无取消/恢复概念。

## 7. 权限与权威状态

无权限分支。权威边界在文件头注释声明：暂存回执属 Main 所有；下游登记时必须核“同一物理归档、所有者、封存选择”——`selectionId=archivePhysicalKeyDigest`、`previewFingerprint=archiveSha256` 就是这两个核对点的载体。

## 8. 修改影响面

改本文件当前无生产影响（无调用者）；若接入 T02/L，将联动 `review-zip-staging-v3-b2` 的回执形状与 `review-v3-t06-main-service` 的 selection 契约。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。冻结树无任何测试引用本文件（检索范围同 §1）；行为只有静态阅读依据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯函数、无 I/O、跳过留痕 | 已证实 | `:15-42` |
| 入选三条件（accepted+needs-user-confirmation+rawSha256 匹配） | 已证实 | `:21-27` |
| **无调用者/无测试** | 已证实 | 全冻结树检索仅本文件 3 处出现 |
| 下游核对语义（同一归档/所有者/封存选择） | 已证实（注释声明） | `:1-6` |
| 接入后的实际行为 | 未知 | 链路未接通、未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `T06StagedZipSelection` | 2 | `:10-13` | covered |
| `buildT06SelectionFromB2Staging` 入选 | 3 | `:21-27` | covered |
| 跳过分支 | 3 | `:29-30` | covered |
| 输出形状 | 3 | `:32-41` | covered |
| 调用面 | 4 | — | 已证实缺失（检索） |

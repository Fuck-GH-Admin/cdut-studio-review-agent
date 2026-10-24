---
path: apps/electron/src/main/lib/review/material-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6e1ec463a51f1b0e933c90e06570a7f88a9deb0a
sha256: 8b9d556954c488eb5eff0992a7a5d45cc13d4d84e11d9b2d1ebc8b2d9bd1fbd3
lines: 414
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/material-service.ts

## 1. 结论与边界

材料登记与案卷提交（文件头 `:1-8`，G01）：`registerMaterial`（系统选择框 → 复制原件进 `source-docs/{versionId}/` → 字节 SHA-256 + DocumentVersion 经聚合命令事务，revision 统一 +1）与提交前置 `canSubmit`。**原件不可变**：同名重复上传形成新版本（versionId 递增），不覆盖。运行时模块，含真实文件 I/O 与多格式解析。

不做的事：不做聚合存储（`case-store-v2`）；不做提交事务（`stage-workflow.submitCaseV2`）；不做撤效算法（`source-current-validity-v3.revokeCurrentSourceValidity`）；解析器在 `document-parser`/`document-service`。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `FrozenSource` | `:26-32` | 冻结副本：`{stagedPath, byteHash, sizeBytes, fileName, dispose()}` |
| `freezeSourceFile` | `:34-50` | ASSET-02：单次读→暂存→hash；后续解析/hash/落盘只读这份字节 |
| `RegisterMaterialPayload` | `:115-123` | `{sourcePath; role; materialSlotId?; fileName?; replacesVersionIds?}` |
| `registerMaterial` | `:126-344` | `(caseId, command{requestId,actor,expectedRevision,payload}, authorizeAtCommit?) => ReviewCommandResult<DocumentVersion>` |
| `listMaterials` | `:347-349` | 读聚合 documents |
| `pickAndRegisterMaterials` | `:352-386` | 弹窗多选→逐个登记 |
| `canSubmit` | `:389-400` | 提交前置检查 |
| `materialsDirCaseId` | `:404-406` | `review-cases/{caseId}/source-docs` |
| `countSourceFiles` | `:408-412` | 某版本目录文件数 |
| `IMAGE_MIME` | `:414` | `image/` |

内部：`copyAsset`（`:57-78`，复制+回读双校验）、`guessMime`（`:80-113`，扩展名→MIME 表）、`MAX_MATERIAL_BYTES=50MB`（`:23`）。

## 3. 内部逻辑与关键流程

### 3.1 冻结与复制（`:34-78`）

`freezeSourceFile`：源缺失 throw；`readFileSync` 单次读、暂存 `wx` 写、hash 该字节（`:39-42` 注释“被 hash 的字节=被解析/复制的字节”）。`copyAsset`：复制到 `review-cases/{caseId}/source-docs/{versionId}/{fileName}`；复制前 hash 与冻结 hash+大小比对（“原件在冻结后发生变化”）；落盘后回读再 hash（“原件落盘校验失败”）（`:62-71`）。

### 3.2 解析（`:139-293`）

- `.docx` → `extractDocxReviewContent`，失败记 `docxParseError` 走纯文本回退（`:139-145`）；`.xls/.xlsx/.xlsm/.xltx/.xltm` → `extractSpreadsheetReviewContent` 同理（`:146-154`）。
- PDF → `renderPdfImageBlocks`（懒取 `case-import`）产页图像块；截断/失败进 `pdfPageWarnings`/`pdfParseWarning`（“登记状态不伪造成 parsed”，`:168-178`）。
- 无结构化解析且属 `supportedReviewExtensions` 非图片 → 纯文本回退（html/eml 走 `extractReviewableTextFile`，其余 `extractTextFromFile`）（`:179-186`）。
- blocks 组装（`:232-290`）：docx 图内嵌图落盘（未提取的记 `omittedEmbeddedImage`）、表格→`table`、xlsx 单元格→`sheet-cell` 位置、文本逐行 paragraph、图片→单 image 块、PDF 页图复制进资产目录。`parseStatus`：无块→支持扩展 `partial` 否则 `failed`；有警告→`partial`；否则 `parsed`（`:291-293`）。

### 3.3 命令事务 `registerMaterial`（`:191-332`）

handler：

1. `authorizeAtCommit?.()`（解析/await 之后、复制原件之前，`:192-194`）。
2. archived 案卷拒（`:195`）；`materialSlotId` 须是当前模板真实槽，模板无槽定义保留历史“分组标签”语义，历史退休槽仅接受同模板谱系出现过的（`:196-210`）。
3. 版本链语义（复查 §5.9）：同槽位+同文件名+同 role = 同一逻辑材料新版本（`:214/:223-225`）；`replacesVersionIds` 须命中 active 版本（“替换目标不存在或不再是当前材料版本”）（`:216-219`）；role 是身份一部分（ASSET-04 注释 `:220-222`）。
4. `documentId=doc-{n}-{ts36}`、`versionId={documentId}-v{seq}`、`copyAsset`（ASSET-03 记录 `createdAssetDirs`）（`:226-229`）。
5. mutate（`:296-330`）：同槽同名同 role 旧版本与 `replacesVersionIds` 全部 `active:false`；新 DocumentVersion（`supersedesVersionId`、`contentHash=byteHash`（N2c 兼作内容指纹 `:308`）、`byteHash`、`usage:'registered'`、parseRevision 有块 1 否则 0）；`revokeCurrentSourceValidity(draft, retiredVersions,'replace')` 同事务（`:328`）。
6. 失败清理（`:333-339`）：无回执提交→删除本命令创建的资产目录（不留孤儿）；finally 清 PDF 图像临时目录与冻结副本（`:340-343`）。

### 3.4 提交前置 `canSubmit`（`:389-400`）

stage 必须 `draft`；模板 `requiredAt==='submission'` 且无 `requiredWhen` 的槽不足 → “缺少必需材料：…”；零材料 → “尚未登记任何材料”。

### 3.5 `pickAndRegisterMaterials`（`:352-386`）

弹窗多选（审核材料扩展白名单+全部）；逐个串行 `registerMaterial`（`requestId=reg-{ts}-{rand}`、`expectedRevision` 现值）；失败抛“登记失败”。**注意**：返回的 `versionIds` 实际 push 的是 `sourcePath` 而非版本 ID（`:383`，照实记录）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC | `review-ipc.ts` 材料登记/选择入口 | `registerMaterial`/`pickAndRegisterMaterials`/`listMaterials`/`canSubmit` |
| native V3 | `native-workspace-case-v3.ts:15/:427` | `registerMaterial`（V2 通道） |
| T06 | `review-v3-t06-main-service.ts:31/:457` | `registerMaterial` |
| T09 | `review-v3-t09-asset-registration.ts:15/:62` | `registerMaterial` |
| stage-workflow | `stage-workflow.ts` 提交链 | `canSubmit`/`collectMissingSubmissionSlots`（application-service 侧） |

出向：`case-store-v2`、`source-current-validity-v3`、`template-store.{getTemplate,listTemplateVersions}`、`config-paths`、`document-parser`、`document-service`、懒取 `case-import.renderPdfImageBlocks`。

## 5. 数据 I/O、读写与副作用

- **写**：`review-cases/{caseId}/source-docs/{versionId}/` 原件+内嵌图/PDF 页图；聚合 `documents`（事务）。
- **临时**：冻结副本（tmpdir，finally dispose）、PDF 图像临时目录（finally 删）。
- **副作用**：弹窗（`pickAndRegisterMaterials`）；无网络/日志。
- **幂等**：每次登记都是新版本（不可变原件语义）；CAS `expectedRevision` 串行。
- **失败清理**：CAS 失败删本命令资产目录（`:333-339`）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 源缺失/超 50MB | `:128-130` | `VALIDATION_FAILED` |
| 冻结后变化/落盘校验失败 | `:64-71` | `VALIDATION_FAILED`，目录清理 |
| 槽位非法 | `:209` | `VALIDATION_FAILED` |
| 替换目标无效 | `:218` | `VALIDATION_FAILED` |
| archived 案卷 | `:195` | `INVALID_TRANSITION` |
| 解析失败 | `:143/:152/:176/:185` | 记警告，不失败登记 |
| CAS 失败 | `:333-339` | 清资产目录后重抛 |
| 取消 | 无 | 无 AbortSignal |
| 恢复 | 无显式 | 不可变原件+事务语义；孤儿目录由失败清理防 |

## 7. 权限与权威状态

- **actor**：命令携带（登记本身不校验 role；`authorizeAtCommit` 在事务内断言 Main 窗口）。
- **权威状态**：原件字节（freeze→copy→回读三重 hash）、`byteHash/active/supersedes` 版本链、`revokeCurrentSourceValidity` 同事务撤效。
- **提交门**：`canSubmit` 只读检查，权威提交在 `stage-workflow.submitCaseV2`。

## 8. 修改影响面

改登记/版本链 → 影响 native/T06/T09 全部材料入口与解析状态机；改 `parseStatus` → 影响下游锚点/门（`workspace-*`、`t05`）；改槽位校验 → 影响模板谱系迁移材料。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `material-service.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 不可变原件+同名新版本 | 已证实 | 文件头 `:7`、`:214-227` |
| 三重 hash 校验（freeze/copy/回读） | 已证实 | `:39-71` |
| 解析失败降级不伪造成 parsed | 已证实 | `:173-177/:291-293` |
| CAS 失败清孤儿目录 | 已证实 | `:187-189/:333-339` |
| 槽位/替换/role 身份语义 | 已证实 | `:196-227` |
| `pickAndRegisterMaterials` 返回 sourcePath 而非版本 ID | 已证实 | `:383` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `freezeSourceFile`/`copyAsset` | 3.1 | `:34-78` | covered |
| `guessMime` | 2 | `:80-113` | covered |
| 解析/块组装/parseStatus | 3.2 | `:139-293` | covered |
| `registerMaterial` 事务 | 3.3 | `:126-344` | covered |
| `canSubmit` | 3.4 | `:389-400` | covered |
| `pickAndRegisterMaterials` | 3.5 | `:352-386` | covered（返回值quirk 已记） |
| `listMaterials`/`materialsDirCaseId`/`countSourceFiles` | 2 | `:347-412` | covered |

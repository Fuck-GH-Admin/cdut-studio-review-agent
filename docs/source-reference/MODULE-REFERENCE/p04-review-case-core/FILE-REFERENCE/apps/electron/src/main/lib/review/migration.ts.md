---
path: apps/electron/src/main/lib/review/migration.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9f558e1ea48ce4992f555663826ac2f58da79ef4
sha256: 5a619e8e356ff4b727f0e0f3d06eb915159ff10695951063c14486105f8d622f
lines: 162
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/migration.ts

> 引用注意：`migration.ts` 是通用文件名；本手册引用一律用全路径 `apps/electron/src/main/lib/review/migration.ts`。

## 1. 结论与边界

V1→V2 案卷迁移（M1，设计 03 §7）。要点（文件头 `apps/electron/src/main/lib/review/migration.ts:1-7`）：保留原 V1 文件与 runs 不动，V2 写同目录 `case.v2.json`（迁移可重复）；旧分数转字段、fixture 保留 origin；**历史 run 不迁移**（旧格式/覆盖未验证，导出已被 M0 守门拒绝）；未配置 domainPack/未知领域 ID/无 items/损坏文件按映射表处理并记迁移注记。

## 2. 导出与关键符号

`export` 逐条核对：1 个接口 + 6 个函数 = 7 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `mapDomainToTemplate` | 函数（导出） | 26-31 | `(domainPackId?)=>{templateId,note?}` | 未知 ID 不默认综测（H14 延续，`:16,25`） |
| `itemToSubjectFields` | 函数（导出） | 38-48 | item→`Record<string,FieldValue>` | 强类型分数/日期 |
| `documentToVersion` | 函数（导出） | 55-82 | V1 文档→`DocumentVersion` | `versionId=docId-v1` 稳定（`:54`） |
| `itemToSubject` | 函数（导出） | 85-95 | V1 事项→`ReviewSubject` | |
| `MigrationResult` | 接口（导出） | 97-101 | `{migrated,note,caseV2?}` | |
| `migrateCaseToV2` | 函数（导出） | 107-153 | `(v1:ReviewCase)=>MigrationResult` | 可重复迁移 |
| `getCaseV2` | 函数（导出） | 158-162 | `(caseId)=>ReviewCaseV2\|undefined` | 读 V2 案卷 |
| `DOMAIN_TEMPLATE_MAP` | 内部 | 17-23 | 领域包→模板 ID（`custom:null`） | |
| `fieldValue`/`blockHash` | 内部 | 33-35,50-52 | FieldValue 构造；sha1(块文本 join) | |

## 3. 内部逻辑与关键流程

### 3.1 领域映射（`:26-31`）

无 `domainPackId` → 综测模板 + 注记“V1 未声明领域包：按缺省综测模板兼容迁移”（V1 缺省语义即综测）；映射值为空（未知/`custom`）→ `templateId:''` + 注记“未知领域包 X：未迁移到任何模板，需人工选择映射或待配置”（**不回落综测**）；命中 → 直接映射。

### 3.2 字段/文档/主体转换

- `itemToSubjectFields`（`:38-48`）：固定 `title/category/declaredScore(number)`；`level/activityDate(date)/organizer` 仅在存在时加入。
- `documentToVersion`（`:55-82`）：`versionId='${doc.id}-v1'`；`contentHash=sha1(块文本)`（`:50-52,60`）；`assetPath` 优先旧 `imageAssetPath`，否则 upload 原件相对路径 `source-docs/${doc.id}-${fileName}`，再否则 `''`（`:56,65-66`）；`parseStatus` 归一四值（`:68`）；块映射保留 format/table/imageAlt/imageAssetPath（`:69-78`）；`usage='read'` 当 parsed 且有块（`:79`）；`unusedReason='V1 解析失败'/'V1 未提取到文本'`（`:80`）。
- `itemToSubject`（`:85-95`）：`type:'item'`；`sourceRefs` 指向 `${anchor.documentId}-v1`（caseId 由迁移时回填）；`correction`：`identifiedBy==='ai'`→`ai-extracted` 否则 `user-confirmed`（`:92`）；`status`：`ignored`→`ignored` 否则 `identified`（`:93`）。

### 3.3 迁移（`migrateCaseToV2`，`:107-153`）

1. `mapDomainToTemplate`（注记累积）（`:108-110`）。
2. 模板查找：`review-templates/<templateId>/versions/<n>.json` 最高版本（`:112-121`）；不存在 → 注记“模板 X 不存在：V2 案卷暂不可创建”（`:122-124`）。
3. **可重复**：`case.v2.json` 已存在 → 直接返回既有（`已有 V2 案卷（revision=N）`，`:126-130`）；注释：模板版本固定写入，后续发布不回写已迁移案卷（`:112-113`）。
4. 无模板 → `migrated:false` + 注记（`:131`）。
5. 组装 `ReviewCaseV2`（`:133-149`）：`caseFields` applicant/academicYear；subjects=items 转换并回填 caseId（`:143`，注意此处 `itemToSubject` 被调两次）；documents 转换；`stage:'submitted'`、`revision:1`；`updatedAt=now`。
6. `mkdirSync`+`writeFileSync(v2Path,JSON.stringify(caseV2,null,2))`（`:150-151`）；返回 `{migrated:true,note:注记||'迁移完成'}`。

`getCaseV2`（`:158-162`）：存在则 JSON.parse 返回，否则 `undefined`。

## 4. 调用者与调用链

入向（冻结树 grep）：生产调用点在 V1 兼容/迁移入口（本批检索 `apps/`+`packages/` 非测试对 `migrateCaseToV2`/`getCaseV2` 命中见 §10）；测试：`apps/electron/src/main/lib/review/migration.test.ts`（本批 3 例直接调 `migrateCaseToV2`/`mapDomainToTemplate`/`getCaseV2`）。

出向：`node:fs`（exists/mkdir/read/readdir/write）、`node:crypto`（sha1）、`node:path`、`@profer/shared`（类型）、`../config-paths.ts`（`getConfigDir`）。

## 5. 数据 I/O、读写与副作用

- 读：`review-templates/<id>/versions/*.json`、`review-cases/<id>/case.v2.json`（存在性+内容）。
- 写：`review-cases/<id>/case.v2.json`（`:150-151`）；`mkdirSync` 建目录。
- 副作用：迁移即写盘（非纯函数）；幂等（步骤 3 早退）；无网络/IPC。

## 6. 分支、失败、取消与恢复

无显式抛错（JSON.parse 失败会自然抛 SyntaxError——**未捕获**，静态已证实无 try/catch）。分支结果：

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 未知领域包 | `templateId:''`+注记，最终 `migrated:false` | 29,131 |
| 缺省领域包 | 综测+注记 | 27 |
| 模板未落盘 | 注记 + `migrated:false` | 122-124,131 |
| 已有 V2 | 返回既有（不重置 revision） | 126-130 |
| V1 runs | **不迁移** | 文件头 `:5` |

无取消概念；恢复=落盘模板/人工选映射后重跑。

## 7. 权限与权威状态

无权限判定；迁移是本地兼容工具。语义守门：未知领域不默认综测（H14）、缺字段不虚构（`itemToSubjectFields` 仅在存在时加）、历史 run 不搬运。

## 8. 修改影响面

- 改 `caseV2` 组装影响 V2 案卷消费链（case-store-v2 等）与迁移测试。
- 改 `DOMAIN_TEMPLATE_MAP` 影响 `builtin-templates` 落盘契约（模板必须真实存在，`:112`）。
- `itemToSubject` 双调用（`:143`）是性能瑕疵非语义问题。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/migration.test.ts`（81 行，3 个迁移用例 + 4 个非本模块用例，详见其手册）：综测 demo 迁移可读、分数转 number 字段、fixture 保留、可重复迁移不重置 revision；未知领域包不默认综测+注记；缺省领域包兼容+注记。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`documentToVersion`/`itemToSubject` 独立分支（parseStatus 各值、unusedReason、image 块）、损坏 JSON、无 items、模板缺失路径无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 可重复迁移（早退） | 已证实 | `:126-130`；测试 `:194-196` |
| 未知领域不回落综测 | 已证实 | `:29`；测试 `:199-202` |
| V1 runs 不迁移 | 已证实 | 文件头 `:5` |
| 写盘 `case.v2.json` | 已证实 | `:150-151` |
| JSON.parse 无捕获 | 已证实（静态） | `:121,128,161` 无 try/catch |
| 生产调用点 | 未知 | 本批未逐行核迁移入口 |
| 损坏文件注记行为 | 未知 | 实际会抛 SyntaxError 而非注记（与文件头“按映射表处理并记迁移注记”存在张力，照实记录） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `mapDomainToTemplate` | §3.1 | 26-31 | covered |
| `itemToSubjectFields`/`itemToSubject` | §3.2 | 38-48,85-95 | covered（源码）/partial（断言） |
| `documentToVersion` | §3.2 | 55-82 | covered（源码）/partial（断言） |
| `migrateCaseToV2` | §3.3 | 107-153 | covered |
| `getCaseV2` | §3.3 | 158-162 | covered |
| 损坏文件/模板缺失 | §6,§10 | 122-131 | partial |

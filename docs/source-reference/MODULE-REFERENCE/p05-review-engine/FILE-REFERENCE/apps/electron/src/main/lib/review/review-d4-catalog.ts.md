---
path: apps/electron/src/main/lib/review/review-d4-catalog.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d5c55011c7e8b233565ad49c5444ca3a698a4f6a
sha256: 97b7fb8e3c80f2d06dfba71f35a94730c1a3aef02c3094230e176f572e6d883a
lines: 97
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-d4-catalog.ts

## 1. 结论与边界

D4 冻结目录的**客户端/CLI 共用加载器**：校验原始 Git blob、禁止浮动来源（`apps/electron/src/main/lib/review/review-d4-catalog.ts:1`）。三导出：`resolveD4SourcePath`（路径白名单解析）、`loadD4UnifiedCatalog`（目录加载+全量校验）、`loadD4UnifiedWorkspace`（单工作区加载+blob 钉住+D1 校验）。

边界：不发布、不改数据；`D4UnifiedCatalog.publicationAllowed:false` 字面（`:30`）；`integrationStatus:'NOT_RUN'` 是合法值（`:68`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `D4UnifiedEntry` | interface | 8-23 | `{domain;sourcePR;sourceHeadSha;templateId;templateVersion;workspacePath;workspaceGitBlobSha;manifestPath;sourceVersion;sourceSha256\|null;previousDomainStatus;integrationStatus;publication;clientLoadMode}` | |
| `D4UnifiedCatalog` | interface | 24-32 | `{schemaVersion;catalogId;technicalBaseSha;templateCount;domainCounts;publicationAllowed:false;templates[]}` | |
| `resolveD4SourcePath` | const fn | 42-49 | `(relative) => string` | 白名单正则 + SOURCE_ROOT 解析 |
| `loadD4UnifiedCatalog` | function | 55-84 | `() => D4UnifiedCatalog` | |
| `loadD4UnifiedWorkspace` | function | 85-97 | `(entry) => ReviewAuthoringWorkspaceV1` | |

内部：`CATALOG_PATH`（`:33`，`docs/design/review-agent/acceptance/d4-unified-r01/catalog.json`）、`SOURCE_ROOT` 五候选（`:35-38`，注释：源码测试与 Electron 构建读同一组冻结输入）、`EXPECTED` 域计数 `{G01:5,G02:3,G03:10,G04:8,G05:6,G06:9,G07:7,G08:2}`（`:40`，和=50）、`COMMON='a7a6a11d…'`（`:41`，technicalBaseSha 钉死）、`readJson`/`gitBlobSha`（`:50-54`，sha1('blob '+len+'\0'+bytes)）。

## 3. 内部逻辑与关键流程

- `resolveD4SourcePath`（`:42-49`）：路径必须 `docs/design/review-agent/acceptance/d4-g` 前缀且匹配 `d4-g0[1-8]-build/[A-Za-z0-9/_-]+\.(json|md)`（否则 `D4_CATALOG_UNSAFE_PATH`）；SOURCE_ROOT 缺失 → `D4_RESOURCES_MISSING`（提示 build:resources）。
- `loadD4UnifiedCatalog`（`:55-84`）：头部（`D4_CATALOG_INVALID_HEADER`）：schemaVersion 1、technicalBaseSha===COMMON、publicationAllowed false、templateCount 50、templates 50。逐 entry（`D4_CATALOG_INVALID_ENTRY`）：`templateId@version` 唯一、domain `g0[1-8]`、workspaceGitBlobSha/sourceHeadSha 40hex、sourceSha256 64hex（`?? ''` 允许 null 落空）、`publication==='candidate-held'`、`integrationStatus==='NOT_RUN'`、version≥1 整数、workspacePath/manifestPath 含 `/d4-<domain>-build/`；且两路径过 `resolveD4SourcePath`（`:76-77`）。域计数与 `EXPECTED`+`domainCounts` 双比对（`D4_CATALOG_DOMAIN_COUNTS_MISMATCH`，`:79-82`）。
- `loadD4UnifiedWorkspace`（`:85-97`）：blob 钉住（`gitBlobSha(path)===entry.workspaceGitBlobSha`，`D4_WORKSPACE_BLOB_CHANGED`，`:87`）→ 身份（schemaVersion 1、单模板且 id/version 与 entry 一致，`D4_WORKSPACE_IDENTITY_MISMATCH`）→ `validateReviewAuthoringV1`（`D4_D1_INVALID`，`:94-95`）。

## 4. 调用者与调用链

出向：`node:crypto`/`node:fs`/`node:path`、`@profer/shared` 类型、`./review-authoring-v1`（validate）（`:2-6`）。

入向（检索=符号名+模块名，全冻结树）：

- `loadD4UnifiedCatalog`/`loadD4UnifiedWorkspace`/`resolveD4SourcePath`：`review-v3-d4-demo-publish.ts:15,126,138`、`review-v3-main-d4-local-plan.ts:13,19,31,39,58,74,101`（产品/D4 本地计划链）。
- 测试（批外）：`review-v3-main-d4-local-plan.test.ts:13,37,86,116`、`review-v3-d4-catalog-attach.test.ts:18-40`。
- 本批无同名测试；`D4UnifiedEntry` 类型被上述消费。

## 5. 数据 I/O、读写与副作用

只读文件系统（readFileSync/existsSync）；无写、无网络。副作用=抛错。模块加载期即解析 SOURCE_ROOT（`:35-38`，惰性 `find`）。

## 6. 分支、失败、取消与恢复

失败=throw（`D4_CATALOG_UNSAFE_PATH`/`D4_RESOURCES_MISSING`/`D4_CATALOG_INVALID_HEADER`/`D4_CATALOG_INVALID_ENTRY`/`D4_CATALOG_DOMAIN_COUNTS_MISMATCH`/`D4_WORKSPACE_BLOB_CHANGED`/`D4_WORKSPACE_IDENTITY_MISMATCH`/`D4_D1_INVALID`）。无异步/取消。

## 7. 权限与权威状态

无权限分支。权威=冻结字节：technicalBaseSha 硬编码（`:41`）、Git blob sha1 钉住（`:87`）、域计数硬编码（`:40`）；`publication:'candidate-held'`/`publicationAllowed:false` 恒定。

## 8. 修改影响面

D4 数据/布局变化（50 模板/8 域计数/blob）会使加载全拒——影响 `review-v3-d4-demo-publish.ts`/`review-v3-main-d4-local-plan.ts` 与两批外测试。路径白名单正则改动影响 `resolveD4SourcePath` 的安全边界。

## 9. 测试证据

本批**无**直接测试。间接（批外）：`review-v3-main-d4-local-plan.test.ts`、`review-v3-d4-catalog-attach.test.ts`（`:28-40` 真实加载目录与 fixtures）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| technicalBaseSha/域计数硬编码钉死 | 已证实 | `:40-41` |
| Git blob sha1 钉住 workspace | 已证实 | `:51-54,87` |
| 路径白名单（防目录穿越） | 已证实 | `:42-48` |
| `sourceSha256??''` 允许 null | 已证实 | `:67`（null 落空串进正则=拒绝，实为必填语义） |
| 产品链消费 | 已证实 | `review-v3-main-d4-local-plan.ts` 等 |
| 实际 d4-unified 资源内容 | 未知 | 数据文件不在本批 |
| SOURCE_ROOT 五候选命中情况 | 未知 | 运行时解析，NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2 | 8-55 | covered |
| 目录加载校验 | §3 | 55-84 | covered（批外测试锚） |
| 工作区加载 | §3 | 85-97 | covered |
| 资源内容 | §10 | — | unknown |

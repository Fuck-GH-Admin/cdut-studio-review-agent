---
path: apps/electron/src/main/lib/review/review-v3-case-storage-durability.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 54da553e12cce73bc6c723f0aff1c864060929a9
sha256: 81534902ecc076effd19c1536e8bf8bbb6ba2e1bd3fb02098e03ac1dbb54b0d7
lines: 98
kind: test
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-case-storage-durability.test.ts

## 1. 测试目标

验证材料身份（ASSET-05/06）与主账恢复链（ASSET-12/17）：原生登记保留展示名/显式替换、管理列表按聚合有效材料计数、主账损坏时从上一有效副本只读恢复并进入诊断索引（`apps/electron/src/main/lib/review/review-v3-case-storage-durability.test.ts:1-4`、`:25`）。文件头声明使用**真实原生案卷、真实磁盘事务与真实材料登记，不伪造聚合文件**（`:3-4`）。

## 2. 用例清单

1 describe / 3 test。夹具：真实 `createNativeWorkspaceCaseV3` 建案（actor `local-reviewer`）；临时 `PROFER_CONFIG_DIR`（`:18-21`）；`writeFileSync` 造真实材料文件。

| # | 名称 | 设置 | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- | --- | --- |
| 1 | ASSET-05 原生登记保留展示名与显式替换 | 建案「身份案卷」；写「申请表.pdf」v1 | `registerNativeWorkspaceMaterialV3(…, 'application', …, 'application-form', {fileName:'申请表.pdf'})`；改文件 v2 再登记带 `replacesVersionIds` | 首版 `role='application'`、`materialSlotId='application-form'`；旧版 `active===false`；新版 versionId 不同、`supersedesVersionId===旧版`、slot 保持 | `:26-53` |
| 2 | ASSET-06 管理列表计数按聚合有效材料 | 建案；写 attachment.txt | `registerMaterial(…{role:'attachment'})` 命令登记；比对 `listCases()` 与聚合 | 命令 `ok:true`；`summary.documentCount` === 聚合 `active!==false` 计数；且 **>** 三栏投影 `documents.length` | `:55-72` |
| 3 | ASSET-17/12 主账损坏从副本只读恢复 | 建案；两次 `updateNativeWorkspaceSettingsV3` 改标题 | 断言 `.previous.json` 存在且修订=最新-1；`writeFileSync(statePath,'{broken json')` 后 `readAggregate` | 恢复读到 caseId、修订=previous；`listCaseStorageIssues()` 有 `invalid-main-json`、`canReadFromBackup:true`；**主文件仍保持损坏证据** | `:74-97` |

**依赖顺序**：三用例独立建案；用例 3 内部按「两次更新→断言副本→损坏→恢复断言」顺序。

## 3. 真实断言

- 用例 1：`expect(newVersion.supersedesVersionId).toBe(firstDoc.versionId)`（`:51`）；`expect(oldVersion.active).toBe(false)`（`:49`）。
- 用例 2：`expect(summary?.documentCount).toBe(aggregate.caseV2.documents.filter((document) => document.active !== false).length)`（`:70`）；`expect(summary?.documentCount).toBeGreaterThan(projection?.documents.length ?? 0)`（`:71`）。
- 用例 3：`expect(issue?.code).toBe('invalid-main-json')`（`:93`）；`expect(readFileSync(statePath, 'utf-8')).toBe('{broken json')`（`:96`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`replacesVersionIds` 指向不存在版本、多版本链、`updateNativeWorkspaceSettingsV3` 的 CAS 冲突、`.previous.json` 也损坏的双损场景。
- 脆弱点：用例 3 直接 `writeFileSync` 破坏主账（`:87`）——依赖「读取层恢复不回写」的实现约定（`:95` 注释）；断言 `documentCount` 依赖 `listCases()` 投影实现。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例覆盖 ASSET-05/06/12/17 | 已证实 | 只读核对本文件 |
| 恢复只发生在读取层（主文件不回写） | 已证实（断言） | `:95-96` |
| 测试实际通过 | 未知 | NOT_RUN |
| `listCaseStorageIssues` 的诊断保留时长 | 未知 | 未读实现 |

## 6. 覆盖表

| 被测行为 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| ASSET-05 登记/替换 | 1 | `:26-53` | covered |
| ASSET-06 计数口径 | 2 | `:55-72` | covered |
| ASSET-17/12 损坏恢复 | 3 | `:74-97` | covered |

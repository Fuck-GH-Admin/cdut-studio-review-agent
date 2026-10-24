---
path: apps/electron/src/main/lib/review/review-v3-b30-current-materials-read.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c37154de86760952bfde20b0943636d27c2d5c5c
sha256: 35a889eb1c23fb0afa844fe6ebbd485166b9da462698a269d2a496c7cd217f3c
lines: 49
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b30-current-materials-read.test.ts

## 1. 测试目标

B R30「整个当前材料宇宙 + 原始字节 + Owner」（`apps/electron/src/main/lib/review/review-v3-b30-current-materials-read.test.ts:10`）：全量枚举（含独立 ZIP 条目、无首文件捷径）、读取中 trusted Main epoch 变更拒绝、撤销 Owner/缺失 Main 不能读物理原件。bun:test（`:1`）。

夹具：`scope:B20MainReadScope` 合成（`:5-9`）；**真实** `ReviewB2StagingService`（`:2` import，无 mock）逐条 `grant/stage` 真实字节（`Buffer.from('original-N')`）。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 11-28 | enumerates all direct and independent ZIP entry originals, no first-file shortcut | 3 staged（1 picker + 2 zip，role application/supporting/supporting） | `readB30AllCurrentMaterials(()=>scope,staging)` | 独立 |
| 2 | 29-40 | change of trusted Main epoch during list is rejected | 1 staged；scope getter 第 2 次返回 `{...scope,authorityEpoch:4}` | 同上调用 | 独立 |
| 3 | 41-48 | revoked Owner and absent trusted Main cannot read physical original | ①`readCurrentScope→null`；②`staging.revoke(scope)` 后再读 | 两次调用 | 独立（同 test 两段） |

## 3. 真实断言

- `:21` `expect(read.allStagedCount).toBe(3)`；`:22` `applicationCount` toBe 1；`:23` `archivedZipEntryCount` toBe 2。
- `:24` `expect(new Set(read.sources.map(x=>x.candidateId)).size).toBe(3)`（无重复/无捷径）。
- `:25` `read.sources.every(x=>x.rawBytesRechecked)` toBe true。
- `:26-27` `publicationAllowed`/`authoritativeMainIdentityIssuedByB` 均 toBe false。
- `:36-39` `expect(()=>readB30AllCurrentMaterials(…)).toThrow('B_R30_SCOPE_CHANGED_DURING_SOURCE_READ')`。
- `:43-44` `(()=>…(()=>null,staging)).toThrow('B_R30_C_MAIN_SCOPE_NOT_INSTALLED')`。
- `:46-47` revoke 后 `.toThrow('B2_OWNER_INVALID_OR_REVOKED')`。

## 4. 未覆盖与脆弱点

- 未测错误码：`B_R30_INCOMPLETE_STAGING_REGISTRY`（>500/重复 id）、`B_R30_PHYSICAL_BYTES_OR_CURRENT_OWNER_CONFLICT`（字节篡改/owner 冲突）。
- `archiveDerived` 判定（`physicalSourceKey.startsWith('zip-')`）只用 `zip-source-N` 命名验证，其他前缀（如 `zip-` 大小写/其它归档键）未测。
- `scopeIdentitySha256` 的 8 元口径无断言。
- 真实 `ReviewB2StagingService` 行为为集成面（B2 实现不在本批）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test/1 describe、真实 staging 无 mock | 已证实 | `:2,10-48` |
| 全量枚举无首文件捷径 | 已证实 | `:21-25` |
| epoch 变更/撤销/无 Main 三拒 | 已证实 | `:36-47` |
| 测试通过与否 | 未知 | NOT_RUN |
| B2 staging 全行为 | 未知 | 批外实现 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 全量枚举+计数 | §2/§3 | 1 | covered |
| `SCOPE_CHANGED_DURING_SOURCE_READ` | §2/§3 | 2 | covered |
| `C_MAIN_SCOPE_NOT_INSTALLED`/B2 撤销 | §2/§3 | 3 | covered |
| 其余 2 错误码 | §4 | — | unknown |

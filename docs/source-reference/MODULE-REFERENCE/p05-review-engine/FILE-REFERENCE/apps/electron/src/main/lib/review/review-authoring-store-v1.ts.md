---
path: apps/electron/src/main/lib/review/review-authoring-store-v1.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9e30c1ec353e7081ac70897ba37c7bf12fb04f1b
sha256: e4ba8094cec5d6c256cb666ba92edb02c42457a13236cadd2b8acb551b5c7155
lines: 128
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-authoring-store-v1.ts

## 1. 结论与边界

D1 作者态草稿的**本地不可变修订记录**（`apps/electron/src/main/lib/review/review-authoring-store-v1.ts:1-4`）：revision 与发布 `TemplateVersion.version` 是两条独立轴；不复写历史草稿、不发布模板。逐 revision 独立文件 + 父摘要链完整性 + `wx` 排他写。注释明示安全级别（`:38-40`）：仅防本地非预期篡改，**不提供**外部攻击者级数字签名。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewAuthoringRevisionV1` | interface | 15-21 | `{workspace; authorId; recordedAt; digest; parentDigest?}` | digest=sha256(JSON(workspace)) |
| `getReviewAuthoringRevisionV1` | function | 41-65 | `(id, revision?) => ReviewAuthoringRevisionV1 \| undefined` | 缺省取最高修订；校验 1..N 完整父链 |
| `saveReviewAuthoringRevisionV1` | function | 71-101 | `(workspace, expectedRevision, authorId) => ReviewAuthoringRevisionV1` | wx+lock 追加保存 |
| `diffReviewAuthoringRevisionsV1` | function | 104-128 | `(before, after) => {oldRevision,newRevision,changedModules[],changedTemplates[],changedSources[],changedBindings[],changedSharedModuleLocks[]}` | |

内部：`SAFE_ID`/`hash`（`:12-13`）、`root`/`filename`（`:23-27`，`<configDir>/review-authoring-v1/<id>/revisions/<n>.json`）、`validateEnvelope`（`:29-35`：digest 匹配 + `validateReviewAuthoringV1` 全量重校验）。

## 3. 内部逻辑与关键流程

### 3.1 `getReviewAuthoringRevisionV1`（`:41-65`）

目录缺失 → undefined；列 `^[1-9]\d*\.json$` 升序；选 revision ?? 最高；逐 1..selected：缺失/不可读 → `AUTHORING_HISTORY_BROKEN`（`:51-54`）；`validateEnvelope`（摘要+数据双校验）；workspaceId/revision 自指核对（`:56-58`）；**父链**：第 1 条 `parentDigest===undefined`，其余 `parentDigest===previous.digest`（`:59-61`）。

### 3.2 `saveReviewAuthoringRevisionV1`（`:71-101`）

ID 合法 + authorId 非空 → `mkdirSync` → `openSync(lock,'wx')` 排他锁（`:80-81`）→ 读当前最高 revision → **`current===expectedRevision && workspace.revision===expectedRevision+1`**（`AUTHORING_REVISION_CONFLICT`，`:85-87`；注释 `:69`：缺 expectedRevision 不许静默开新版）→ `validateReviewAuthoringV1`（`AUTHORING_INVALID`）→ 记录（structuredClone + digest + parentDigest）→ `writeFileSync(..., flag:'wx')`（`:95`，同版本永不覆盖；崩溃后已写 revision 即不可变历史）→ finally 释放锁。

### 3.3 `diffReviewAuthoringRevisionsV1`（`:104-128`）

不同 workspaceId → 抛（`:113`）。`changed` 泛型：按 key（moduleId@version/templateId@version/sourceId/checkId/moduleId@version）建 hash Map，键并集中 hash 不同者排序返回（`:114-118`）。

## 4. 调用者与调用链

出向：`node:crypto`/`node:fs`/`node:path`、`@profer/shared` 类型、`../config-paths`、`./review-authoring-v1`（validateReviewAuthoringV1）（`:5-10`）。

入向（检索=符号名+模块名，全冻结树）：

- **CLI 脚本**：`apps/electron/scripts/review-authoring-v1.ts:21,32,71,51`（get/save/diff 三函数均调用）。
- 直接测试（本批）：`review-authoring-v1.test.ts:10-11,211-320` 断言群。
- 无运行时产品（IPC/渲染）调用（否定结论，检索范围=全冻结树符号名+模块名）；`ReviewAuthoringRevisionV1` 类型零外部代码引用（仅 docs/design/review-agent/18-d1-authoring-contract-and-runtime-mapping-v1.md:20 文档提及）。

## 5. 数据 I/O、读写与副作用

- 磁盘写：`<configDir>/review-authoring-v1/<id>/revisions/<n>.json`（`wx` 不覆盖，`:95`）+ `edit.lock`（`openSync 'wx'`/`unlinkSync`，`:81,99`）。
- 磁盘读：readdirSync/readFileSync。
- 并发：`edit.lock` 排他（无锁文件残留时互斥；锁泄漏（进程死于 finally 前）会永久挡写——推断）。

## 6. 分支、失败、取消与恢复

失败=throw（`AUTHORING_HISTORY_BROKEN` 4 子因、`AUTHORING_REVISION_CONFLICT`、`AUTHORING_INVALID`、ID/作者校验）；读侧损坏→拒读拒写（不修复）。恢复语义：已写 revision 不可变，父链断即拒绝读取（`:38-40`）。无异步。

## 7. 权限与权威状态

authorId 必填（`:77`，操作者留痕）；权威=内容摘要链（digest/parentDigest），非角色检查。与发布轴解耦（`:3`）。

## 8. 修改影响面

当前仅测试消费（§4）；改文件布局/摘要口径会使既有历史失效（`AUTHORING_HISTORY_BROKEN`）。测试：`review-authoring-v1.test.ts:211-294`（冲突/篡改/断链用例）。

## 9. 测试证据

直接测试（经 `review-authoring-v1.test.ts`，本批）：`:211-228` 保存/读取/diff/`AUTHORING_REVISION_CONFLICT`/篡改「内容摘要不匹配」；`:282-294` 三连保存+断链 → 「AUTHORING_HISTORY_BROKEN: 父版本摘要链不匹配」（含指定 revision 读取）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| wx 不覆盖 + edit.lock 排他 | 已证实 | `:80-81,95` |
| 父链 1..N 全链校验 | 已证实 | `:50-63` |
| expectedRevision 双向约束 | 已证实 | `:85-87` |
| 仅测试调用（无产品） | 已证实（否定结论，检索式见 §4，全冻结树） | grep |
| 锁泄漏影响 | 推断 | `:97-100` finally；异常路径未测 |
| 多进程真实并发 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | 15-128 | covered |
| 读链校验 | §3.1 | 41-65 | covered（测试锚） |
| 写+锁 | §3.2 | 71-101 | covered（测试锚） |
| diff | §3.3 | 104-128 | covered |

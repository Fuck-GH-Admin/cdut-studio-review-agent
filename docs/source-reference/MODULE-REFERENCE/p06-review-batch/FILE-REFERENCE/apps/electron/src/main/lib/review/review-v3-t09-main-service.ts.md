---
path: apps/electron/src/main/lib/review/review-v3-t09-main-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7fa4be00c6a1de55a15c45588ce7357e5341ecd8
sha256: bb3c5b751edbf3c1570b7cce099ac5829313a27da2badeb5e9a1e968daff408e
lines: 522
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t09-main-service.ts

## 1. 结论与边界

T09 离线包 Main 桥接（文件头 `:1-10`，Local-L04）：签发——用真实 CaseAggregate 生成任务包并落盘（包内 recipient 是**声明**，不是登录身份，不得据此获校方权限）；导入——先校验（哈希/锁定/版本/收件人），附件**先登记为真实 DocumentVersion**，再作为补件答复原子写入；`actionId` 幂等，重复导入返回既有回执；不重写编解码（复用 `offline-codec` 纯函数）。运行时模块，含持久账本（tasks/receipts/staging）与临时文件回收。

不做的事：不写业务事务本体（`T09ImportDeps` 注入：`registerAsset`/`respondSupplement`）；不做评委评分写入（`review-v3-t09-judge-adapter`）；不解析包（codec）。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `t09PublishedStudentVisibility` | `:27-40` | 模板字段可见性（Main 决策，非渲染层授权）；模板未发布/不匹配抛 `T09_PUBLIC_TEMPLATE_NOT_PUBLISHED` |
| `saveT09TaskPackage`/`readT09TaskPackage` | `:58-69` | 任务包账本 `review-offline/{caseId}/tasks/{packageId}.json`（packageId 白名单 `^[A-Za-z0-9_-]{1,128}$`） |
| `readT09Receipt`/`saveT09Receipt` | `:76-92` | 回执账本 `receipts.json`（按 actionId 幂等） |
| `T09StagedAsset` | `:108-120` | staging 附件：name/mimeType/sha256/versionId/index?/revision? |
| `T09StagingRecord` | `:122-138` | staging 记录：actionId/requestHash/supplementId/baseRevision/stagedRevision?/status(staged/applying/applied)/assets/appliedRevision? |
| `readT09Staging` | `:144-149` | 读 staging（actionId 白名单） |
| `buildT09State` | `:164-181` | 聚合→`T09State`（无虚构身份；`policyVersionIds:[]` 显式空数组防 canonical 比较踩坑 `:175`） |
| `T09IssueResult` | `:183-188` | `{packageId; actionId; json}` |
| `issueT09StudentPackage` | `:191-206` | 签发学生补件包（`issueT09StudentFromCase`+落账本） |
| `previewT09Package` | `:209-237` | 预览（含崩溃续跑的“可导入”改判） |
| `T09AssetRegistration` | `:240-248` | `{versionId; revision}`（Main 回读的真实 revision） |
| `T09ImportDeps` | `:250-272` | `{readAggregate; registerAsset; respondSupplement; verifyApplied?}` |
| `importT09Package` | `:435-493` | 导入主入口（幂等+附件先登记+原子答复+staging 恢复） |
| `t09AssetTempRoot` | `:496-500` | 临时落盘根 `tmpdir()/cdut-review-t09` |
| `pruneT09AssetTempRoot` | `:509-522` | OFF-06 回收 >60s 的过期临时文件 |

内部：`offlineDir`（`:42-45`，经 `assertSafeReviewStorageId`）、`writeAtomic/ensureDir`（`:47-55`）、`receiptsPath/stagingDir`（`:72-74/:140-142`）、`saveT09Staging`（`:151-154`）、`stagingReceipt`（`:157-161`，applied staging 重建回执）、`applyT09StudentReply`（`:290-416`，核心事务）、`T09ApplyOutcome`（`:274-278`）。

## 3. 内部逻辑与关键流程

### 3.1 staging 账本动机（`:94-107` 注释）

附件登记与补件答复是两个独立 Case CAS，外加 receipts.json 第三次写盘；staging 以 actionId 为键、requestHash 绑载荷、每登记一份附件即落盘、写入前记 `applying` 成功后 `applied`、`applying` 不可核验时返回“待核验”绝不静默重复写。

### 3.2 预览 `previewT09Package`（`:209-237`）

解析 reply 包、找原任务包（`T09_TASK_PACKAGE_NOT_FOUND`）、`previewT09Reply`；**崩溃续跑改判**（`:218-235`）：preview 为 conflict 且 staging 表明 `requestHash` 匹配、已有登记附件、`stagedRevision===live revision` 时，用 `revision=baseRevision` 重做结构性预览——ready 则改判为可导入并注明“已登记 N 份附件…导入将按该版本续跑，不会重复登记”。

### 3.3 导入 `importT09Package`（`:435-493`）

顺序不可颠倒（`:421-423`：附件未成 DocumentVersion 前补件答复不得写入）：

1. 聚合/包/任务三重存在性校验（`:440-445`）。
2. **续跑分支**（`:447-474`）：staging 存在且 requestHash 匹配、status ∈ {staged, applying}、有登记附件、`stagedRevision` 安全整数 → 以 `resumeRevision=stagedRevision` 为基线调 `applyT09StudentReply`；先核对回件与原任务包匹配（caseId/requestHash/baseRevision）；成功落回执返回 accepted/duplicate。
3. **首次分支**（`:476-492`）：`buildT09State` → `importT09Reply`（lookup=`readT09Receipt ?? stagingReceipt`、apply=`applyT09StudentReply`）。
4. 两分支后都 `pruneT09AssetTempRoot()`（失败不影响业务，`:465/:487`）。

### 3.4 核心事务 `applyT09StudentReply`（`:290-416`）

1. 非 student 回包 → rejected“评委评分包尚未接入本地评分写入”（`:299-301`）。
2. staging 载荷漂移 → `T09_ACTION_PAYLOAD_DRIFT`（`:305-307`）；`applied` → duplicate（`:308-312`）；`applying` → `verifyApplied` 核验：无法核验 `T09_RECOVERY_UNCERTAIN`（“需先核验补件答复是否已生效”），已生效 → 标 applied+duplicate（`:313-328`）。
3. **OFF-02 基线检查**（`:330-336`）：live revision ≠ baseRevision → `T09_REVISION_CHANGED`（“请重新预览后再导入”），绝不读最新再写（`:283-288` 注释）。
4. 续跑核验：已登记附件须仍在 active 材料中，否则 `T09_STAGED_ASSET_MISSING`（`:343-353`）。
5. **附件逐份登记**（`:358-396`）：OFF-05 槽位取补件请求的 `materialSlotId`（Main 从案卷读取）；staging 按 index 复用（旧版按同名+同哈希回退匹配 `:362-366`）；载荷不一致 → `T09_ACTION_PAYLOAD_DRIFT`；登记前后都核对 revision（登记前须等于 `ownRevision`，登记后须恰 `ownRevision+1`——其它推进即外部写入穿插，失败关闭）（`:374-389`）；每份登记后 `saveT09Staging`（含 `stagedRevision`）。
6. **补件 CAS**（`:398-408`）：记 `applying` → `deps.respondSupplement(caseId, supplementId, note, versionIds, ownRevision, {actionId})`；失败回 `staged`（保留已登记 versionId，重试不复制）。
7. 成功：回读 revision 记 `applied`，返回 accepted 回执（`:409-415`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC | `review-ipc.ts` 离线导入/签发/预览入口 | `issueT09StudentPackage`/`previewT09Package`/`importT09Package`/`t09PublishedStudentVisibility` |
| 评委回件适配 | `review-v3-t09-judge-adapter.ts:16` | `readT09Receipt/readT09TaskPackage/saveT09Receipt/saveT09TaskPackage` |
| 附件登记 | `review-v3-t09-asset-registration.ts:16` | `t09AssetTempRoot` |
| T06（对照） | `review-v3-t06-main-service.ts` | 同类临时根模式 |

出向：`config-paths`、`review-storage-id.assertSafeReviewStorageId`、`offline-codec`（readT09File/previewT09Reply/importT09Reply/unpackT09Asset）、`offline-issuer.issueT09StudentFromCase`、`node:fs/path/os`。

## 5. 数据 I/O、读写与副作用

- **写**：`review-offline/{caseId}/tasks/{packageId}.json`、`receipts.json`、`staging/{actionId}.json`（全原子写）；业务写经 `deps.registerAsset`/`deps.respondSupplement`。
- **临时**：`tmpdir()/cdut-review-t09` 中转附件；`pruneT09AssetTempRoot` 只删 >60s 文件（防误删并发导入，`:502-507` 注释）。
- **幂等**：actionId 键控（receipts+staging 双账本）；重复导入 duplicate；崩溃恢复按 stagedRevision 续跑/verifyApplied 核验。
- **并发**：基线检查拒绝外部并发（revision 逐步核对）；无锁但每步 fail-closed。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 模板未发布/不匹配 | `:33` | `T09_PUBLIC_TEMPLATE_NOT_PUBLISHED` |
| 聚合/包/任务缺失 | `:332/:441-445` | `T09_*` throw |
| 载荷漂移 | `:306/:369` | rejected `T09_ACTION_PAYLOAD_DRIFT` |
| revision 偏离基线 | `:333-335/:376-379/:385-388` | rejected `T09_REVISION_CHANGED` |
| staged 附件丢失 | `:350-351` | rejected `T09_STAGED_ASSET_MISSING` |
| applying 不可核验 | `:320-322` | rejected `T09_RECOVERY_UNCERTAIN` |
| 补件写入失败 | `:404-407` | rejected+保留 staged |
| 取消 | 无 | 无 AbortSignal |
| 恢复 | staging 双账本 | §3.3/§3.4；receipts 丢失由 `stagingReceipt`/applied 记录恢复 |

## 7. 权限与权威状态

- **身份边界**：包 recipient 是声明（文件头）；字段可见性是 Main 决策（`:23-26`）。
- **权威状态**：附件必须成为真实 DocumentVersion（顺序强制）；补件答复 CAS 用“本 action 自己推进后的准确 revision”（`:243-246` 注释），既不沿用旧预览版本也不无条件取最新；staging 是恢复锚点，`applied` 即使 receipts 丢失也可恢复（`:104-105`）。

## 8. 修改影响面

改导入事务 → 影响离线补件全链路与 IPC；改 staging 形状 → judge-adapter 的账本复用；`registerAsset` 契约联动 `review-v3-t09-asset-registration`（displayName 语义）。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-t09-main-service.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 附件先登记、答复后写（顺序强制） | 已证实 | `:421-423/:358-408` |
| 基线 CAS：本 action 精确推进、拒外部并发 | 已证实 | `:283-288/:374-389` |
| staging 双账本幂等+崩溃恢复 | 已证实 | `:94-161/:304-328/:447-474` |
| applying 不可核验→待核验不重复写 | 已证实 | `:313-328` |
| 可见性 Main 决策/模板门 | 已证实 | `:27-40` |
| 临时文件 60s 回收上界 | 已证实 | `:509-522` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `t09PublishedStudentVisibility` | 2 | `:27-40` | covered |
| 账本（tasks/receipts/staging） | 2 | `:58-161` | covered |
| `buildT09State` | 3 | `:164-181` | covered |
| `issueT09StudentPackage` | 3 | `:191-206` | covered |
| `previewT09Package` 续跑改判 | 3.2 | `:209-237` | covered |
| `applyT09StudentReply` | 3.4 | `:290-416` | covered |
| `importT09Package` | 3.3 | `:435-493` | covered |
| 临时根/回收 | 2 | `:496-522` | covered |

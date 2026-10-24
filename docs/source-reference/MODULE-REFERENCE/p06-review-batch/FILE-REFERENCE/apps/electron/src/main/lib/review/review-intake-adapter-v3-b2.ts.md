---
path: apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e911663006cb105aad382a6a107630534e014739
sha256: dc26b9c7ee3409b52237ce07fe676b5fa5e38f7e61a5e27e266350742062c2cf
lines: 247
kind: source
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.ts

## 1. 结论与边界

Dev-B B2：**Main 专属的临时能力暂存服务**（运行时代码）。文件头 `apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.ts:1-6`：不安装材料进 CurrentCase、不持久化 ImportBatch；Main 必须授权签发 sender/frame/owner 并拥有字节；Renderer 不得签发 grant；C0 适配器集成与持久检查点待 Dev-C 批准。类注释 `:78`：无文件系统活动、无共享 BusinessCase 写。

边界：内存 Map 状态（进程生命周期）；`@profer/shared` 的 `assertC0ImportBatch`/`REVIEW_C0_SCHEMA_VERSION` 仅做 ImportBatch 形状校验（`:8-11`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状/签名 | 说明 |
| --- | --- | --- | --- | --- |
| `B2MainContext` | 导出接口 | 29-35 | `{senderId, frameId, ownerId, ownerGeneration, caseCandidateId}` | Main 派生身份（注释 `:28`：不得来自 IPC body） |
| `B2IntakeGrant` | 导出接口 | 36-41 | `{token, ownerId, caseCandidateId, expiresAt}` | 一次性能力令牌 |
| `B2MaterialCandidate` | 导出接口 | 48-64 | 含 `physicalSourceKey`（仅 Main picker/drop 记录，`:56`）/`status:'accepted'` | 暂存材料候选 |
| `B2ImportReceipt` | 导出接口 | 65-72 | 回执形状 | |
| `ReviewB2StagingService` | 导出类 | 79-246 | 见 §3 | 核心服务 |

内部：`LiveGrant`（`:42-47`）、`Stored`（`:73-76`）；工具 `sha256`（`:13`）、`safe`（`:14`，1-256 字符无 NUL）、`safeDisplayName`（`:16-24`，拒路径分隔/控制字符/`.`/`..`/尾点尾空格/Windows 设备名 CON/PRN/AUX/NUL/COM1-9/LPT1-9）、`failed`（`:25`，抛 `B2_<reason>`）；常量 `MAX_FILE_BYTES=50MB`（`:26`）。

## 3. 内部逻辑与关键流程

- `requireContext`（`:90-96`）：senderId/frameId 非负安全整数、ownerId/caseCandidateId `safe`、ownerGeneration 非负、ownerKey 未吊销，否则 `B2_OWNER_INVALID_OR_REVOKED`。
- `grant`（`:97-109`）：TTL 1-60000ms（默认 20s，`:99`）；token=`randomBytes(32).hex`；记录 sender/frame/owner/generation/case/consumed/expiresAt。
- `revoke`（`:111-117`）：同步吊销（stop/close/revoke 时调用，`:110` 注释）——ownerKey 进 `revokedOwners`，同 owner+generation 的 grant 全部 `consumed=true`。
- `claimArchiveRequest`（`:124-135`）：整归档幂等键（防换 ZIP 重试混两个快照，`:119-123` 注释）；key=`owner::generation::case::requestId`，identity=`sha256(physicalArchiveKey+archiveSha256)`；同 key 不同 identity 抛 `B2_REQUEST_ID_COLLISION`。
- `stage`（`:137-186`）：token 校验（不存在/已消费/过期 → `B2_TOKEN_INVALID_OR_CONSUMED`；scope 五元不匹配 → `B2_TOKEN_SCOPE_MISMATCH`，`:144-148`）；**先消费再拷贝**（`:149-150`，双击/重入 fail-closed）；输入校验（requestId/fileName 过 `safeDisplayName`/physicalSourceKey/role 三值/subjectId/bytes 1-50MB，否则 `B2_MATERIAL_INVALID`，`:151-155`）；`bytes=Buffer.from` 防御性拷贝（`:156`）；fingerprint=owner+case+physicalSourceKey+rawSha256+fileName+subjectId+role（`:158-162`）；同 requestId：fingerprint 同 → 幂等返回既有候选、异 → `B2_REQUEST_ID_COLLISION`（`:163-168`）；`documentVersionId='docv-'+sha256(owner+case+physicalSourceKey+rawSha256)[:32]`（`:169-172`，同 stem+同字节+不同物理来源 = 不同文档版本，测试锚定）；candidateId/materialId 随机；存 `materials`+`requests`。
- `getCandidate`（`:188-197`）/`read`（`:215-222`）：owner/generation/case 三元匹配否则 `B2_MATERIAL_SCOPE_MISMATCH`；read 返回 `Buffer.from` 拷贝（`:221`）。
- `listScopedCandidateIds`（`:204-213`）：仅本 scope 全量清单（注释：路由方不能靠给子集藏第二个申请，`:198-203`）。
- `previewImportBatch`（`:224-245`）：candidateIds 去重（`B2_DUPLICATE_CANDIDATE`）；逐个 scope 校验；产出 `ImportBatch`（`status:'staged'`、`inputManifestHash=sha256([{materialId,source,rawSha256}…])`）并 `assertC0ImportBatch`。注释 `:223`：staged 清单不是 ReviewBatchAttempt、不是已应用证明。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/review/review-import-ledger-v3-b2.ts:19`（`ReviewB2StagingService`+`B2MainContext`，`assertStillGranted` 在 ledger 读写前调用）；`review-import-checkpoint-v3-b2.ts`（`ReviewB2ArchiveVault` 构造依赖 staging，测试 `review-import-ledger-v3-b2.test.ts:7/:53` 体现）；`review-import-handoff-v3-b2.ts`（测试 `:8/:257`）；直接测试 `review-intake-adapter-v3-b2.test.ts`。出向：`node:crypto`（`:7`）、`@profer/shared`（`:8-11`）。

## 5. 数据 I/O、读写与副作用

**无文件系统、无网络**（`:78` 注释与实现一致）；状态仅内存 Map（grants/materials/requests/archiveRequests/revokedOwners，`:80-84`）；字节暂存于 `Buffer`。副作用：无日志。进程退出即丢（临时暂存语义）。

## 6. 分支、失败、取消与恢复

错误码（`B2_` 前缀）：`OWNER_INVALID_OR_REVOKED`/`INVALID_TTL`/`TOKEN_INVALID_OR_CONSUMED`/`TOKEN_SCOPE_MISMATCH`/`ARCHIVE_REQUEST_INVALID`/`REQUEST_ID_COLLISION`/`MATERIAL_INVALID`/`MATERIAL_SCOPE_MISMATCH`/`DUPLICATE_CANDIDATE`。取消/恢复：`revoke` 是唯一取消手段（同步、幂等）；无持久恢复（内存态）。

## 7. 权限与权威状态

- 能力模型：token 单次消费 + scope 五元绑定（sender/frame/owner/generation/case）+ TTL + owner 吊销集；身份权威=B2MainContext（由 Main 窗口/框架认证派生，注释 `:28`，不信任 IPC body）。
- 字节权威：Main 暂存的 `Buffer` 拷贝；读取返回副本；`physicalSourceKey` 仅 Main picker/drop 记录（`:56`）。
- 授权边界：Renderer 不得签发 grant（`:4`）；SourceIdentity 须由 parser 验证的块注册表铸造（`:246` 注释）。

## 8. 修改影响面

改 grant/暂存语义影响 `review-import-ledger-v3-b2.ts`（`assertStillGranted` 门）、`review-import-checkpoint-v3-b2.ts`（归档保管库）、`review-import-handoff-v3-b2.ts`（候选移交）；错误码文案被测试与 UI 引用。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.test.ts`（88 行、6 用例；NOT_RUN）：B-IN-02 令牌单次/五元 scope/超时 fail-closed（`:19-30`）、请求重放幂等+改字节碰撞+读拷贝（`:36-41`）、B-DOC-02 同字节不同物理源=不同文档版本（`:48-49`）、B-IN-03 import 非评审批次+跨 owner 拒绝（`:55-60`）、revoke 阻断读/暂存/后续（`:67-73`）、B-IN-01 显示名 7 类拒绝+中文文件名通过（`:77-85`）。未覆盖：`claimArchiveRequest`、`listScopedCandidateIds`、`getCandidate`、TTL 上限校验、`previewImportBatch` 的 `assertC0ImportBatch` 失败路径。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+类方法与错误码 | 已证实 | `:29-246` |
| token 先消费后拷贝 fail-closed | 已证实 | `:149-150` |
| 五元 scope 绑定/吊销/读副本 | 已证实 | `:144-148/:111-117/:221` |
| safeDisplayName Windows 设备名拒绝 | 已证实 | `:16-24` + test:77-85 |
| documentVersionId 物理源区分 | 已证实 | `:169-172` + test:48-49 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| grant/revoke/stage/read/preview | §3 | 97-245 | covered |
| claimArchiveRequest/getCandidate/listScoped | §3 | 124-135/188-213 | covered（无断言部分标 partial） |
| 测试断言 | §9 | test:15-86 | covered |
| claimArchive/listScoped 等 | §9 | — | partial |
| 运行行为 | §10 | — | unknown（NOT_RUN） |

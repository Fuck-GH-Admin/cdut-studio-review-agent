---
path: apps/electron/src/main/lib/review/review-v3-t09-offline-codec.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8bc03c19946e9b942913936a7650c4da0757c969
sha256: e6b20bec309a14d1570aee54ffe6a4db396f7ce002f8d89866f81ac2fc9e0cf1
lines: 176
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t09-offline-codec.ts

## 1. 结论与边界

T09 可携两段离线包（文件头 `:1-6`）：任务包在主办方副本签发、收件人在另一副本作回复、主办方预览后经可信 Main 显式应用。**SHA-256 检测损坏/篡改，不是身份认证**。纯编解码 + 校验 + 预览 + 导入协议；不落盘、不发凭据、不做业务写入（`apply` 由可信 Main 注入）。

不做的事：不签发凭据（`review-v3-t09-offline-issuer`）；不写聚合（Main 的 `apply` 回调）；不做角色投影（`offline-roundtrip.projectForRole`）。

## 2. 导出与关键符号

常量/类型：`T09_FORMAT='cdut-review-offline/1'`（`:10`）、`T09Role`（`:11`）、`T09Lock`（`:12`）、`T09Asset`（`:13`）、`T09Task`（`:14-16`，student-reply / judge-rating-reply 两分支，后者可带 `batchId/round/caseRevision` 评分绑定）、`T09Reply`（`:17-19`）、`T09TaskPackage`/`T09ReplyPackage`/`T09Package`（`:21-23`，共享 base：format/packageId/actionId/caseId/baseRevision/lock/createdAt/hash）、`T09State`（`:24-30`）、`T09Preview`（`:31`）、`T09Receipt`（`:32`）。

函数 9 个：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `checkT09Package` | `:43-47` | 格式+type+hash 比对（去 hash 后 canonical 摘要） |
| `packT09Asset` | `:48-51` | bytes→base64+sha256 |
| `unpackT09Asset` | `:52-56` | base64 往返+sha256 双核，不符“附件字节/哈希不匹配” |
| `issueT09Task` | `:66-83` | 签发任务包（校验+seal） |
| `answerT09Task` | `:105-113` | 生成回复包（校验任务包+回复语义+seal） |
| `writeT09File` | `:114-117` | 校验后 JSON 序列化 |
| `readT09File` | `:118-133` | 解析+全量校验 |
| `previewT09Reply` | `:134-157` | 预览：rejected/conflict/ready |
| `importT09Reply` | `:159-176` | 导入协议：幂等 lookup→preview→apply→回执核对 |

内部：`canonical`（`:35-40`，键排序、数组保序、去 undefined）、`digest/seal`（`:41-42`）、`checkAssets`（`:57-60`）、`roleFor`/`sameLock`/`validLock`（`:61-63`）、`checkReply`（`:84-104`）。

## 3. 内部逻辑与关键流程

### 3.1 签发 `issueT09Task`（`:66-83`）

校验：caseId/revision（整数 ≥0）/lock（`validLock`：templateId+正整数版本）；收件人角色须等于任务角色且 actorId 非空；student 须有 supplementId、judge 须有 assignmentId+整数 rubricVersion；judge 带 `batchId` 时 round ≥1 且 caseRevision ≥0 齐全（“评分批次/轮次/案卷版本绑定不完整”）（`:70-77`）；附件过 `checkAssets`。body 用 `randomUUID` 生成 packageId/actionId，`seal` 加 hash。

### 3.2 回复校验 `checkReply`（`:84-104`）

类型须匹配（“任务与回复类型不符”）；student：supplementId 一致、note 或 assets 至少其一（“请填写补件说明或添加材料”）、附件校验；judge：assignmentId+rubricVersion 一致、scores 数量=dimensions 数量、无未知/重复维度、`na` 仅当 `allowNA` 且 score 为 null、否则数值须在 `[min,max]`（“评分为空或超出量表范围”）。

### 3.3 读写（`:114-133`）

`writeT09File` 先 `checkT09Package`；`readT09File` 校验格式+hash+目标版本信息+task/reply 各自形状（task 角色/评分绑定完整/附件；reply 须 requestPackageId+requestHash+respondent，student 附件）。

### 3.4 预览 `previewT09Reply`（`:134-157`）

rejected：hash 无效、原任务不匹配、案卷不一致、回复人≠收件人（role/actorId/actorSource 三者）、lock/baseRevision 不匹配、`checkReply` 失败（`:137-143`）。conflict：`state.revision !== reply.baseRevision`（“案卷版本已变化，不能覆盖新内容”+可选 `changesSinceIssue` 摘要，`:144-147`）；student 的补件不在 `open/insufficient`（“补件请求已关闭或不存在”）；judge 的分配已回避/提交/取消/版本或评委不匹配（`:152-155`）。否则 ready（详情列出补件/分数）。

### 3.5 导入 `importT09Reply`（`:159-176`）

1. `lookup(actionId)` 已有回执：hash/caseId 不同 → rejected“相同 actionId 已使用不同载荷”（幂等防漂移）；accepted → `duplicate` 直接返回原回执（`:164-168`）。
2. `previewT09Reply` 非 ready → 原样返回（`:169-170`）。
3. `apply(reply, state.revision)`（可信 Main 注入的原子命令）；回执四要素（actionId/hash/caseId/status accepted）任一不符 → rejected“业务写入未确认”（`:171-174`）。
4. 否则 `{status:'accepted', receipt}`。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`issueT09Task` 由 `review-v3-t09-offline-issuer.ts:8/:30/:56` 调用；`issueT09StudentFromCase/issueT09JudgeFromCase`（issuer）由 `review-v3-t09-main-service` 与 IPC 使用；`answerT09Task/writeT09File/readT09File/previewT09Reply/importT09Reply` 由 `review-v3-t09-main-service`（离线导入/导出流程）调用（测试 `review-v3-t09-offline-codec.test.ts` 直接覆盖本文件）。出向仅 `node:crypto` 与 `@profer/shared.JudgeRating` 类型。

## 5. 数据 I/O、读写与副作用

纯内存：无磁盘/网络/日志（`writeT09File` 只产字符串，不写文件）。`digest` 确定性（canonical 排序）；同输入同输出。

## 6. 分支、失败、取消与恢复

全部 throw/返回状态码；无异步（`importT09Reply` 的 async 只因注入回调）。失败清单见 §3 各校验；预览/导入把失败归为 `rejected/conflict/duplicate` 三态而非抛出（除签发/回复/读写阶段）。无取消/恢复概念。

## 7. 权限与权威状态

- **SHA-256 ≠ 认证**（文件头 `:5`）：只保完整性。
- `publicContext` 必须是受众过滤投影，绝不是原始 CaseAggregate（`:65` 注释）。
- judge 包默认零申请人字段/原件（issuer 注释）；案卷身份绑定在私有包契约，展示匿名。
- `importT09Reply` 的 `apply` 由可信 Main 提供持久 actionId 回执+原子命令（`:158` 注释）——权威写入在 Main。

## 8. 修改影响面

改 canonical/hash → 既有离线包全部失效（hash 契约）；改校验语义 → 影响 issuer/main-service/离线往返测试；`T09Task` judge 分支的评分绑定与 T07 评分回件契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-t09-offline-codec.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 完整性≠认证、canonical 确定性 | 已证实 | `:5/:35-42` |
| 附件 base64+sha256 双核 | 已证实 | `:52-56` |
| 回复语义校验（补件/评分范围/NA） | 已证实 | `:84-104` |
| 预览三态+冲突摘要 | 已证实 | `:134-157` |
| 导入幂等（actionId 载荷漂移拒/duplicate） | 已证实 | `:164-168` |
| apply 回执四要素核对 | 已证实 | `:172-174` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类型契约（Task/Reply/Package/State/Preview/Receipt） | 2 | `:10-32` | covered |
| `canonical/digest/seal` | 3 | `:35-42` | covered |
| `checkT09Package`/资产打包 | 3 | `:43-60` | covered |
| `issueT09Task` | 3.1 | `:66-83` | covered |
| `checkReply`/`answerT09Task` | 3.2 | `:84-113` | covered |
| `writeT09File`/`readT09File` | 3.3 | `:114-133` | covered |
| `previewT09Reply` | 3.4 | `:134-157` | covered |
| `importT09Reply` | 3.5 | `:159-176` | covered |

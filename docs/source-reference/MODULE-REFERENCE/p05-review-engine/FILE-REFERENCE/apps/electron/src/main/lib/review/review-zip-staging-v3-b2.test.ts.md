---
path: apps/electron/src/main/lib/review/review-zip-staging-v3-b2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: edefc665e0db38313a63bc46298c4c9b8ffe35d1
sha256: f613142a61b13e90de27502bb6e963df0d7d805fbd4471faebd12ec6fa488270
lines: 89
kind: test
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-zip-staging-v3-b2.test.ts

## 1. 测试目标

验证 `stageReviewB2TrustedZip`（`apps/electron/src/main/lib/review/review-zip-staging-v3-b2.ts:32`）的 **Main-only 归档暂存与逐文件回执**：好文件暂存为待确认候选、坏文件独立拒绝、同 requestId 幂等/改字节原子拒绝、revoke 后拒绝摄入且不动 CurrentCase。被测对象是本批同名源文件（主手册见 `review-zip-staging-v3-b2.ts.md`）；`ReviewB2StagingService`（`review-intake-adapter-v3-b2.ts:79`）为真实服务实例（非 mock）。

## 2. 用例清单

共 **4 个 `test()`**。夹具：合成 zip 构造器 `zip(names)`（`:15-37`，内容恒 `test-<name>`、store 方式、`0x800` 标志）；`crc32` 本地实现（`:5-14`）；`ctx: B2MainContext = {senderId:1, frameId:2, ownerId:'owner-1', ownerGeneration:1, caseCandidateId:'candidate-1'}`（`:38`）。

| # | 用例（Given/When → Then） | 行 |
| --- | --- | --- |
| 1 | 好文件暂存待确认、坏子项独立拒绝 | `:40-58` |
| 2 | 同 zip+request 重试幂等；同 request 换字节拒绝 | `:59-68` |
| 3 | 同 requestId 换不相交条目集原子拒绝 | `:69-81` |
| 4 | revoke 后拒绝 ZIP 摄入且不动 CurrentCase | `:82-88` |

## 3. 真实断言

- 用例 1：`importBatchKind` `toBe('import')`、`checkpoint` `toBe('staging-only')`（`:46-47`）；`candidates` 长度 2（`:48`）；回执 `toEqual(['needs-user-confirmation','rejected','needs-user-confirmation'])`（`:49-51`）；逐候选 `role==='unassigned'`、`subjectId===Null()`、`rawSha256` 64hex（`:52-55`）；`store.read(ctx, candidateId).toString()` 含 `'test-'`（`:56`）。
- 用例 2：二次暂存 `candidateId` `toBe` 首次（`:64`）；改字节 `expect(() => …).toThrow('B2_REQUEST_ID_COLLISION')`（`:65-67`）。
- 用例 3：`toThrow('B2_REQUEST_ID_COLLISION')`（`:76-79`）；旧候选存储内容 `toBe('test-first.txt')`（`:80`）。
- 用例 4：`store.revoke(ctx)` 后 `toThrow('B2_OWNER_INVALID_OR_REVOKED')`（`:84-87`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`B2_ZIP_TRUSTED_INPUT_INVALID`（键长/空值）、`stage` 抛非 `B2_MATERIAL_INVALID` 的 rethrow、`B2_MATERIAL_INVALID`→`rejected` receipt 路径（用例 1 的坏项 `../bad.txt` 被解码层拒而非 stage 层）、多 owner 隔离。
- 脆弱点：`ctx` 为合成对象；`ReviewB2StagingService` 内部存储未断言并发；断言 `contains('test-')` 弱于精确字节。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例与断言如 §3 | 已证实 | 逐行读 `:1-89` |
| 幂等=同 candidateId、改字节原子拒 | 已证实 | `:59-81` |
| revoke 即时生效 | 已证实 | `:82-88` |
| 服务层 claimArchiveRequest 实现细节 | 未知 | 跨批文件，仅经断言旁证 |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支（源文件） | 用例 | 状态 |
| --- | --- | --- |
| 主暂存流程 + 逐文件隔离 | 1 | covered |
| requestId 幂等 / 冲突 | 2、3 | covered |
| revoke 拒绝 | 4 | covered |
| 输入校验/rethrow 路径 | — | unknown（无用例） |

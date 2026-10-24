---
path: apps/electron/src/main/lib/review/review-template-author-store-v3-b1.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 065251ca843c51e68e225dc688bb7a8caab2fea7
sha256: e497461cdcd1bd47c87fb1cfbe34ec224987da885ef9583f627d899ad23be280
lines: 233
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-template-author-store-v3-b1.ts

## 1. 结论与边界

Dev-B B1 append-only 作者修订 + 不可变候选 Plan 保险库（头注 :1-5）：独立于 CaseAggregate/模板发布；**不认证 authorId**（Main 必须先绑定可信作者再经 IPC 暴露）。

边界：编译在 `review-template-plan-adapter-v3-b1`；存储在 `review-v3-author-candidate/{templateId}/`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `B1AuthorRevision` | interface | 20-29 | `review-b1-draft/1`（digest/parentDigest 链） |
| `B1FrozenCandidate` | interface | 30-38 | `review-b1-frozen/1`（`status:'candidate-held'`，注释 :36「NOT official published, not school-signed」） |
| `readB1AuthorRevision` | fn | 96-121 | 全链校验读（缺父即断） |
| `saveB1AuthorRevision` | fn | 124-151 | append-only 存（author.lock CAS） |
| `freezeB1Candidate` | fn | 158-170 | 冻结候选（共享 author.lock） |
| `readB1FrozenCandidate` | fn | 198-225 | 冻结读+descriptor 重验 |

内部：`nameRe`（:12）、`sha256`（:13）、`fail`（:14）、`folder`（:15-20，`B1_TEMPLATE_ID_INVALID`）、`filesystemStat/safeDirectory/vaultDirectory`（:40-65，**拒绝 symlink**，注释 :39-41）、`safeRead`（:66-79，O_NOFOLLOW+inode/dev 复核）、`syncDirectory`（:81-88，Windows 跳过并注明不宣称断电等价）、`writeImmutable`（:90-96，`wx`+fsync）、`revisionFile`（:97）、`validateDraft`（:98-108）、`verifyRevision`（:109-121）、`freezeB1CandidateUnderLock`（:172-196）。

## 3. 内部逻辑与关键流程

1. **`readB1AuthorRevision`**（:96-121）：revisions 目录枚举→排序；缺选中版本 → `B1_HISTORY_REVISION_MISSING`；**1..selected 全链逐版读**，缺父 `B1_HISTORY_BROKEN_MISSING_PARENT`、坏 JSON `B1_HISTORY_BROKEN_INVALID_JSON`（注释 :95「不能读新快照跳过缺失父」）；`verifyRevision` 校验 digest/parentDigest/结构。
2. **`saveB1AuthorRevision`**（:124-151）：`validateDraft`+`B1_AUTHOR_REQUIRED`+`B1_EXPECTED_REVISION_INVALID`；`author.lock` `wx`（忙则失败关闭，注释 :153-155）；expectedRevision ≠ 当前 → `B1_AUTHOR_REVISION_CONFLICT`；`writeImmutable` 追加（不覆盖）。
3. **`freezeB1CandidateUnderLock`**（:172-196）：源须存在且是最新（`B1_AUTHOR_REVISION_NOT_FOUND`/`B1_AUTHOR_REVISION_STALE`）；`compileReviewB1Plan`；已存在同 fingerprint 文件 → 比对 revision/authorDigest，不一致 `B1_FROZEN_IDENTITY_CONFLICT`，一致幂等返回（:186-191）；否则 `writeImmutable`。
4. **`readB1FrozenCandidate`**（:198-225）：fingerprint 格式校验（`B1_FINGERPRINT_INVALID`）；结构/身份校验 `B1_FROZEN_CORRUPT`；源缺失 `B1_FROZEN_SOURCE_MISSING`；**`verifyReviewB1Descriptor` 重算比对**（:224）。

## 4. 调用者与调用链

入向（生产）：`review-v3-main-local-author-workbench.ts:14`、`review-v3-b1-b2-recovery-preflight-v3-b.ts:11`、`review-v3-b1-b2-main-read-bundle-v3-b.ts:10`、`review-v3-main-b20-current-registry.ts:12`、`review-v3-main-b1-local-plan.ts:10`。测试：`review-template-author-store-v3-b1.test.ts:6-9`。出向：`./review-template-plan-adapter-v3-b1`（:10-13）、`../config-paths`（:9）、`node:fs`/`node:crypto`（:5-7）。

## 5. 数据 I/O、读写与副作用

- 读写 `review-v3-author-candidate/{templateId}/{revisions,frozen}/*.json`（`wx`+fsync+目录 fsync；Windows 目录 fsync 跳过并注明）。
- `author.lock` 独占锁文件（save/freeze 共享，:133/:160）。
- 无日志/网络。

## 6. 分支、失败、取消与恢复

12+ `B1_*` throw（fail-closed）；锁忙失败关闭（调用方重试）；append-only+全链校验=篡改可检（`B1_HISTORY_BROKEN`）；无自动恢复。

## 7. 权限与权威状态

- 身份权威边界：**不认证 authorId**（头注 :4-5）；Main 绑定可信作者前置。
- 完整性权威：digest 链+parentDigest+全链读（:109-121）；safeRead 拒 symlink/多硬链/换 inode（:66-79，注释 :39-41「绝不跟随 vault 下的 symlink」）。
- 不可变权威：`wx` 语义追加（:90-96）；冻结幂等且身份冲突拒（:186-191）；候选恒 `candidate-held`。

## 8. 修改影响面

B1 workbench/恢复预读/registry 全链；锁/链校验改动影响并发语义。同测：`review-template-author-store-v3-b1.test.ts`（4 用例）。

## 9. 测试证据

直接测试 `review-template-author-store-v3-b1.test.ts`（4 用例 / 1 describe；真实 tmp 目录+真实锁文件；NOT_RUN）：
1. `:31-49` 不完整草稿 append 存（revision 1）→ 冻结 `B1_AUTHOR_INVALID`；完整后 revision 2+parentDigest 链；重复存 `B1_AUTHOR_REVISION_CONFLICT`；冻结 bindings 1+`candidate-held`；重放冻结幂等；旧版冻结 `B1_AUTHOR_REVISION_STALE`；v1 仍保留（:48）。
2. `:50-63` 篡改 revision 1 文件 → 读/存均 `B1_HISTORY_BROKEN`。
3. `:64-84` 占位 author.lock → freeze/save 均 throw；解锁后 v2 存、旧版冻结 `STALE`、新版冻结 ok。
4. `:85-89` `status:'published'` 欺升 → `B1_DRAFT_STRUCTURE_INVALID`。

未覆盖：safeRead symlink 拒、`B1_FROZEN_CORRUPT`/`IDENTITY_CONFLICT`、Windows fsync 注记；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| append-only+全链校验+篡改可检 | 已证实 | :96-151 + 测试 :50-63 |
| author.lock CAS/冻结幂等 | 已证实 | :133/:186-191 + 测试 :64-84 |
| symlink/硬链防御 | 已证实（代码）/未知（行为） | :66-79（无用例） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `readB1AuthorRevision` 全链 | §3.1/§9 | 96-121 | covered |
| `saveB1AuthorRevision` CAS | §3.2/§9 | 124-151 | covered |
| `freezeB1Candidate` 幂等/STALE | §3.3/§9 | 158-196 | covered |
| `readB1FrozenCandidate` 重验 | §3.4 | 198-225 | covered（间接） |
| safeRead/symlink 防御 | §2 | 39-79 | partial（未测） |

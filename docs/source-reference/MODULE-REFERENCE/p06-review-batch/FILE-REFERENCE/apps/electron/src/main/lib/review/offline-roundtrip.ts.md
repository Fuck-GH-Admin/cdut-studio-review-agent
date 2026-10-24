---
path: apps/electron/src/main/lib/review/offline-roundtrip.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 390d1cda9bb88dd1f3ccb11302ba51d38b86a8a8
sha256: 38a99d8c890b82f3425420b7ea6c5568039f5bc06f2c1152f86ba21f9a50eae5
lines: 299
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/offline-roundtrip.ts

## 1. 结论与边界

角色投影与独立副本往返（文件头 `:1-9`，N6，U12/R12）：`projectForRole` 服务层过滤（**未知字段默认 internal**，不靠 UI 隐藏）；往返包（student-reply/judge-rating-reply）导出（投影+哈希）→ 独立副本填写 → 导回（哈希校验→去重：同 packageId 返回原回执/载荷漂移拒绝）；内部意见/其他评委评分/匿名映射不出包。运行时模块，含持久 outbox（G07/G08）与聚合事务。

不做的事：不冒充校方（actor 是本地来源，`:101`）；不生成匿名映射出包；`castRating`/聚合事务在各自模块。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `AudienceRole` | `:18` | student/reviewer/teacher/judge/organizer |
| `CaseProjection` | `:31-43` | 投影形状（`ownRating` judge 专用、`internalNotes` 审核侧专用） |
| `projectForRole` | `:46-92` | 按角色投影聚合 |
| `RoundTripKind/RoundTripPayload/RoundTripReceipt` | `:96-114` | 往返包/回执（status accepted/duplicate/rejected） |
| `exportRoundTripPackage` | `:117-120` | 导出（投影按 kind 选 judge/student 视角 + `exportHandoffPackage`） |
| `RoundTripOutboxEntry` | `:123-133` | 持久 outbox 条目（pending/终态、attempts） |
| `applyRoundTripPackage` | `:166-173` | 校验→事务应用 |
| `importRoundTripPackage` | `:229-257` | G07：先落盘 pending → 应用 → 终态（幂等/漂移拒绝） |
| `anonymizeName` | `:262-264` | `学员#{sha256 前 6}`（稳定短哈希） |
| `PublicReportInput`/`buildPublicReport` | `:266-299` | 公开报告 MD（G09：内部意见不出公开版） |

内部：`isPublicField`（`:21-23`，仅 `'public'` 才出）、`projectFieldValue`（`:25-29`，`kind==='unknown'` 防御返回 null）、`outboxDir/outboxPath/readOutboxEntry/writeOutboxEntry`（`:135-159`，`sync-outbox/roundtrip/{packageId}.json` 原子写）、`replyHashOf`（`:161-163`，仅 hash `reply` 部分）、`applyPayloadTransaction`（`:175-218`）、`pkgPackageIdOf`（`:220-222`，`rt-{kind}-{caseId}-{actorId}` 稳定派生）。

## 3. 内部逻辑与关键流程

### 3.1 `projectForRole`（`:46-92`）

- 基础投影：id/title/stage + 决定（id/result/reason/finality/at）+ 补件清单。
- 字段：`reviewer/teacher/organizer` 全量；其余按 `fieldVisibility` 过滤（未知默认 internal，`:62-77`）。
- `judge` + viewerId → `ownRating = ratings.find(actor===viewerId) ?? null`（从 ratings 取，不再取 dispositions——复查 §5.6，`:78-82`）。
- `student/judge` 的决定 `reason` 清空（reason 可能含内部调查细节，`:83-86`）。
- `reviewer/teacher/organizer` → `internalNotes = dispositions.map(reason)`（`:87-90`）。

### 3.2 应用事务 `applyPayloadTransaction`（`:175-218`）

- 聚合缺失 → rejected（“案卷聚合不存在”）。
- `judge-rating-reply` → `castRating`（唯一票约束），`requestId=rt-{packageId}`、actor role judge、`round ?? 1`；成功消息“评分已应用（唯一票）”。
- `student-reply` → 目标补件缺失 → rejected（“回复缺少可应用的补件请求”，**不冒充已应用**，`:196` 注释）；否则 `submitCommand` type `RespondSupplement`：状态→`responded`、追加 response（documentVersionIds/note/actor）。成功消息“补件回复已应用（事务落盘）”。

### 3.3 导入 `importRoundTripPackage`（`:229-257`，G07/G08）

1. hash 校验后取 payload；`packageId` 查 outbox。
2. 已 accepted：`replyHash` 不同 → rejected（“同 packageId 载荷漂移，拒绝覆盖”）；相同 → `duplicate`（“已应用过（持久回执，不重复计票）”）。
3. 发送前持久化 pending（同哈希重试 `attempts+1`；异哈希 → 直接记 rejected 落盘返回）。
4. `applyRoundTripPackage` 后写终态（accepted 记 `appliedAt`；rejected 可重试）。

`applyRoundTripPackage`（`:166-173`）：`HASH_MISMATCH` 直接 rejected；其余按 payload 走事务（含 hash 失效时用 `pkg.payload` 的降级路径，`:171`）。

### 3.4 公开报告 `buildPublicReport`（`:275-299`）

student/judge 视角：标题 judge 匿名化（`anonymizeName`）、决定带“（终审）”、补件清单、末尾固定声明“内部审核意见不在公开版本中提供。”（G09）；`input.fields` 不输出（`void`，`:297`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`review-v3-t09-main-service`/`review-v3-t09-offline-issuer` 的 `projectForRole`（`:7/:29` of issuer）；IPC 离线往返/公开报告入口；直接测试 `offline-roundtrip.test.ts`。出向：`report-service-v2.{exportHandoffPackage,importHandoffPackage}`、懒取 `case-store-v2`/`rating-service.castRating`、`config-paths`、`node:fs/crypto`。

## 5. 数据 I/O、读写与副作用

- **写**：`sync-outbox/roundtrip/{packageId}.json`（G08 发送前先落盘）；聚合经 `submitCommand`/`castRating`。
- **副作用**：无日志/网络；`importHandoffPackage` 的 hash 校验是完整性手段。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| HASH_MISMATCH | `:168-170` | rejected |
| 聚合/补件缺失 | `:178/:199` | rejected（不冒充已应用） |
| 事务失败 | `:193/:217` | rejected+message |
| 载荷漂移 | `:236/:243-247` | rejected（拒绝覆盖） |
| 重复包 | `:235-237` | duplicate（不重复计票） |
| 取消/恢复 | 无 | outbox 持久条目支持重启后重复导入判定 |

## 7. 权限与权威状态

- **服务层过滤**（R12）：未知字段默认 internal；内部意见/其他评委评分/匿名映射不出包（文件头）。
- actor 标注“本地来源，不冒充校方”（`:101`）。
- judge 侧学生实名不出包——匿名化只在公开报告本地生成（`anonymizeName`）。
- 去重权威在 outbox `replyHash`（仅 reply 部分参与，投影漂移不误判）。

## 8. 修改影响面

改投影过滤 → 影响 T09 签发（issuer 用 `projectForRole`）与权限回归（`review-v3-t09-visibility.test.ts`）；改 outbox/去重 → 影响独立副本重放语义；`castRating` 唯一票契约联动 `rating-service`。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `offline-roundtrip.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 未知字段默认 internal、服务层过滤 | 已证实 | `:20-23/:62-77` |
| 内部意见/他评不出包；judge 只见本人评分 | 已证实 | `:78-90` |
| G07/G08 先落盘后应用、幂等/漂移拒绝 | 已证实 | `:224-257` |
| 无目标补件不冒充已应用 | 已证实 | `:196-199` |
| 公开报告 G09 | 已证实 | `:274-298` |
| hash 失效降级路径 | 已证实 | `:171`（代码） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `projectForRole` | 3.1 | `:46-92` | covered |
| `exportRoundTripPackage` | 3 | `:117-120` | covered |
| `applyRoundTripPackage`/`applyPayloadTransaction` | 3.2 | `:166-218` | covered |
| `importRoundTripPackage` | 3.3 | `:229-257` | covered |
| `anonymizeName`/`buildPublicReport` | 3.4 | `:262-299` | covered |

---
path: apps/electron/src/main/lib/review/review-v3-b33-currentity-snapshot.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0aadc435be5d005678628e346e2324ab379cde0f
sha256: d8d8c6add4efe8bdb9d31db85f6c3fa6925ebafb1888c3b870162973be01e9d7
lines: 187
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b33-currentity-snapshot.ts

## 1. 结论与边界

Dev-B R33：**稳定、只读的「当前产品源身份」**。C Main 只能用其可信 actor/epoch 注册表里活跃、同 Owner 的输入调用；产出的 SHA256（`readVersion`）是**比较校验和**，绝不是能力/签名/Principal/Case 写入者（`apps/electron/src/main/lib/review/review-v3-b33-currentity-snapshot.ts:1-8`）。当前读必须含 B2 stage **全量**清单（非调用者挑的子集），B20/B19 解析回执按源版本/材料 ID/字节 SHA/subject/role 精确绑定（`:8-11`）。

边界：`assertB33StillCurrent` 比较两份快照的稳定数据，但**不能**自证原生 Principal/grant 或异步 IPC 投递（`:177-181` 注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B33CurrentInput` | interface | 24-32 | `{inventory:B30SourceInventory; candidate:B20CurrentCandidateRead\|null; route:B3RouteState; historical:B26Workbench\|null; recovery:B23RecoveryPreflight\|null; catalogVersion?:string}` | catalogVersion 注释：C 拥有的当前模板目录稳定标识（`:30-31`） |
| `B33CurrentSnapshot` | interface | 33-45 | `{schemaVersion:'review-v3-b33-currentity/1'; readVersion; caseCandidateId; materialCount; checkTargetCount; frozenSourceUnknown; candidateOnly:true; publicationAllowed:false; businessWriteAllowed:false; schoolPolicyVerified:false; versionIsAuthorization:false}` | |
| `buildB33StableCurrentity` | function | 46-176 | `(input:B33CurrentInput) => B33CurrentSnapshot` | 纯函数，产出 readVersion |
| `assertB33StillCurrent` | function | 182-187 | `(before,after:B33CurrentInput) => void` | readVersion 不等 → deny |

内部：`deny`（`:19`，`Error('B_R33_'+code)`）、`sha`/`key`/`hash`（`:20-22`）。

## 3. 内部逻辑与关键流程

`buildB33StableCurrentity`（`:46-176`）：

1. `:47-51` 输入/`catalogVersion` 形状（`INPUT_NOT_CURRENT`）。
2. `:53-65` inventory 完整性（`INVENTORY_NOT_CURRENT`）：schemaVersion 三 false、scopeIdentitySha256 64hex、ownerGeneration≥0、sources≤500、三个计数与逐条重算一致（`:61-64`）。
3. `:66-75` 逐源身份（`MATERIAL_IDENTITY_OR_DUPLICATE`）：candidateId/documentVersionId/materialId/fileName 非空、rawSha256 64hex、byteLength≥1 安全整数、role 三值、`rawBytesRechecked===true`、candidateId 不重复。
4. `:76-79` materialFacts 排序（JSON.stringify localeCompare）——顺序无关的稳定序列化。
5. `:83-144` candidate（可空）：`FROZEN_AUTHOR_OR_OWNER_CHANGED` 闸（schemaVersion/六 false/owner 三元与 inventory 一致/两个 64hex/provenance 九项一致）；绑定四元键去重（`DUPLICATE_CHECK_TARGET`）、sourceId 去重（`DUPLICATE_SOURCE_ID`）；`linked-candidate` 源必须在全量 staging 中（`B_R33_LINKED_SOURCE_MISSING_FROM_FULL_STAGING`）且六元+parseRevision/blockId/readExtent/receiptHash 一致（`LINKED_SOURCE_NOT_CURRENT`）；逐绑定/逐源 facts 排序入 checks；currentAuthor 八元。
6. `:145-152` historical（可空）：`HISTORICAL_FROZEN_SOURCE_INVALID`（含**冻结计数** `unknownSourceRefs===4163`、`unscoped===34`）。
7. `:153-157` recovery（可空）：`RECOVERY_NOT_CURRENT_CANDIDATE`。
8. `:158-175` identity 十二元组（含 route 三元、catalogVersion、currentAuthor、checks、historical.snapshotSha256、recovery 全对象）→ `readVersion=hash(identity)`；`frozenSourceUnknown=historical?.counts.unknownSourceRefs??0`。

`assertB33StillCurrent`（`:182-187`）：双跑 build，`readVersion` 不等 → `B_R33_CURRENT_SOURCE_OR_OWNER_CHANGED`。

## 4. 调用者与调用链

出向（类型）：`./review-v3-b30-current-materials-read`（B30SourceInventory）、`./review-v3-b1-b2-main-read-bundle-v3-b`（B20CurrentCandidateRead）、`./review-intake-routing-adapter-v3-b3`（B3RouteState）、`./review-v3-b4-bulk-evidence-workbench`（B26Workbench）、`./review-v3-b1-b2-recovery-preflight-v3-b`（B23RecoveryPreflight）（`:12-17`）。

入向（否定结论）：**仅**自身 `.test.ts`（`review-v3-b33-currentity-snapshot.test.ts:4`，14 处调用）与模块内部 `assertB33StillCurrent` 复用 `buildB33StableCurrentity`（`:183-184`）；产品入口（review-ipc/preload/main index/renderer）0 命中（检索式=2 函数名+2 类型名+模块名，全冻结树）。无产品调用。

## 5. 数据 I/O、读写与副作用

无。纯函数 + JSON 序列化 + sha256；不写盘/网络；抛普通 `Error('B_R33_…')`。

## 6. 分支、失败、取消与恢复

失败=throw（11 个 `B_R33_` 码，§3）；`assertB33StillCurrent` 是唯一「比较」失败点。无异步/取消。语义：任何全量清单/作者/绑定/路由变化 → readVersion 改变或 fail closed（测试覆盖「变了但没畸形」与「畸形直接拒」两种面）。

## 7. 权限与权威状态

无权限分支（无 actor/sender；`:3-5` 注释要求 C Main 只喂 C 认证同 Owner 输入）。权威否定字面量：`versionIsAuthorization:false`、`schoolPolicyVerified:false` 等（`:41-44,173-174`）；`readVersion` 明示非能力（`:5-6`）。

## 8. 修改影响面

当前无产品调用方；若接入，`readVersion` 口径（identity 十元 + 两处排序）是前后可比性的唯一契约（测试 5 用例锁定：排序无关、字节/角色/subject/版本变化必变、countdown remaining 不变）。改 identity 结构需同步 `review-v3-b33-currentity-snapshot.test.ts`。

## 9. 测试证据

直接测试 `review-v3-b33-currentity-snapshot.test.ts`（130 行，5 `test(`，真实 `ReviewB2StagingService` 造 3 材料，无 mock）：①同输入重排 sources → readVersion 相等、64hex、`materialCount:3`、两 false、`assertB33StillCurrent` 不抛；②删 1 条 → `INVENTORY_NOT_CURRENT`、换字节 → `CURRENT_SOURCE_OR_OWNER_CHANGED`、candidateId 重复 → `MATERIAL_IDENTITY_OR_DUPLICATE`、501 条 → `INVENTORY_NOT_CURRENT`；③role/subjectId/documentVersionId/scopeIdentitySha256 四种变更各自「不同 digest 或 fail closed」（`:57-77`，含二者择一断言）；④路由 `manually-selected` 变更 → `CURRENT_SOURCE_OR_OWNER_CHANGED`；countdown `remainingMs` 19990→15000 readVersion 不变（`:85-88`）；⑤parseRevision 变 → digest 变、linked 源换字节 → `LINKED_SOURCE_NOT_CURRENT`、ownerGeneration=9 → `FROZEN_AUTHOR_OR_OWNER_CHANGED`。**NOT_RUN**：未执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 排序无关稳定 digest | 已证实 | `:76-79,133,137`；测试 `:27-37` |
| countdown remaining 不入 identity | 已证实 | `:161-163`（只取 status/chosen/reason）；测试 `:85-88` |
| 全量 staging 强制（linked 源必须在清单内） | 已证实 | `:113-123` |
| 仅测试调用、无产品入口 | 已证实（否定结论，检索式见 §4，全冻结树） | grep |
| 11 个错误码中 **5 个有直接测试锚、6 个无锚** | 已证实（断言存在）/NOT_RUN | 测试 `:38-128` |
| C 侧 IPC 投递校验 | 未知 | 注释明示不在本模块（`:177-181`） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 interface + 2 function | §2 | 24-46,182 | covered |
| inventory/candidate/historical/recovery 四闸 | §3 | 47-157 | covered |
| identity 组装 | §3 | 158-175 | covered |
| 11 错误码（5 个有直接测试锚） | §6 | — | covered（部分测试锚） |
| C 投递校验 | §10 | — | unknown（边界外） |

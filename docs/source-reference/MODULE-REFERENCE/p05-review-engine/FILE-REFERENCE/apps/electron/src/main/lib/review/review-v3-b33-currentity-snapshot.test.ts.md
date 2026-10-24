---
path: apps/electron/src/main/lib/review/review-v3-b33-currentity-snapshot.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5ed13426a41feebb035e76c6dce42dcd065c4756
sha256: 05f6a25a6a971af1b7fb235ed6e23651e9b691b4d8fc8550e59e0cb364d45240
lines: 130
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b33-currentity-snapshot.test.ts

## 1. 测试目标

B33「确定性的完整物理材料版本，不是凭据」（`apps/electron/src/main/lib/review/review-v3-b33-currentity-snapshot.test.ts:26`）：同输入（含重排）→ 稳定 readVersion；删/改/重复/超限 → 拒绝或 digest 变化；角色/Subject/版本/匿名 scope 各自独立改变版本；路由语义；作者/解析器/linked 源变化不可共享版本。bun:test（`:1`）。

夹具：`ctx:B20MainReadScope`（`:7-9`）；`inventory()`（`:11-21`）真实 `ReviewB2StagingService` 3 材料（1 native + 2 zip-entry）；`input()`（`:22-25`）candidate=null、route `unmatched`、historical/recovery=null。test 5 用合成 `B20CurrentCandidateRead`（`:92-117`，`as unknown as` 强转）。mock 边界：staging 真实、candidate 为构造对象。

## 2. 用例清单

共 **5 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 27-37 | same full staged bytes + owner/epoch + route yields stable readVersion, even after reordered list | `one` + `two`（sources 反转） | 双 build + assert | 独立 |
| 2 | 38-54 | a second ZIP entry removed, byte swapped, duplicate entry or 501 items cannot pass | 4 个变体 | build/assert throws | 独立 |
| 3 | 55-78 | role, Subject, source version and opaque Main scope each independently change stable version | 4 个 mutation（role/subjectId/documentVersionId/scopeIdentitySha256） | 双 build 对比（二择一断言） | 独立 |
| 4 | 79-89 | conservative technical route transition changes checksum, countdown remaining-only does not | `manually-selected` 变更 / countdown remainingMs 19990→15000 | assert throws / readVersion 相等 | 独立 |
| 5 | 90-129 | author/parser/check SourceIdentity changes cannot share version, stale linked source fails closed | 合成 candidate + parseRevision 变/rawSha256 变/ownerGeneration=9 | build 对比 / throws | 独立 |

## 3. 真实断言

- `:31-36` `readVersion` 匹配 `/^[a-f0-9]{64}$/`、两版相等、`materialCount:3`、`versionIsAuthorization`/`publicationAllowed` toBe false、`assertB33StillCurrent` not.toThrow。
- `:41` 删 1 条 → `toThrow('B_R33_INVENTORY_NOT_CURRENT')`；`:44` 换字节 → `assertB33StillCurrent` `toThrow('B_R33_CURRENT_SOURCE_OR_OWNER_CHANGED')`；`:47` candidateId 重复 → `B_R33_MATERIAL_IDENTITY_OR_DUPLICATE`；`:53` 501 条 → `B_R33_INVENTORY_NOT_CURRENT`。
- `:71-76` 四 mutation：拒绝时 message 匹配 `/^B_R33_(INVENTORY_NOT_CURRENT|CURRENT_SOURCE_OR_OWNER_CHANGED)$/`；否则 `current!==prior` 且 assert 抛 `CURRENT_SOURCE_OR_OWNER_CHANGED`。
- `:84` 路由变更 → assert 抛；`:87-88` countdown remainingMs 变化 → readVersion 相等。
- `:122` parseRevision 变 → readVersion 不等；`:125` linked 源换字节 → `B_R33_LINKED_SOURCE_NOT_CURRENT`；`:128` ownerGeneration=9 → `B_R33_FROZEN_AUTHOR_OR_OWNER_CHANGED`。

## 4. 未覆盖与脆弱点

- `DUPLICATE_CHECK_TARGET`/`DUPLICATE_SOURCE_ID`/`INPUT_NOT_CURRENT`/`RECOVERY_NOT_CURRENT_CANDIDATE`/`HISTORICAL_FROZEN_SOURCE_INVALID`/`LINKED_SOURCE_MISSING_FROM_FULL_STAGING` 无直接锚（部分被组合覆盖）。
- 用例 3 的二择一断言（`try/catch` 分支，`:67-76`）弱化了「必拒 vs 必不同」的确定性——注释 `:64-66` 解释为「fail closed 或不同 digest 皆可」，是设计选择而非缺陷，但复核需注意。
- candidate 夹具 `as unknown as` 强转（`:117`），字段漂移无编译期保护。
- `catalogVersion` 字段入 identity（源 `:164`）无测试。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 test/1 describe | 已证实 | `:26-129` |
| 顺序无关稳定 digest | 已证实 | `:27-37` |
| countdown remaining 不变版本 | 已证实 | `:85-88` |
| 11 个错误码中 5 个有直接锚 | 已证实 | §3 |
| 测试通过与否 | 未知 | NOT_RUN |
| historical/recovery 输入面 | 未知 | 全 null，未测非空 |

## 6. 覆盖表

| 被测分支（B33） | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 稳定性/重排 | §2/§3 | 1 | covered |
| `INVENTORY_NOT_CURRENT`×2/`MATERIAL_IDENTITY_OR_DUPLICATE` | §2/§3 | 2 | covered |
| 四字段敏感性 | §2/§3 | 3 | covered（二择一） |
| 路由/remainingMs | §2/§3 | 4 | covered |
| linked/owner 闸 | §2/§3 | 5 | covered |
| historical/recovery/catalogVersion | §4 | — | unknown |

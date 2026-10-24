---
path: apps/electron/src/main/lib/review/review-v3-main-plan-provenance.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 307aee441956c7dd4e1069f6bfc0c476acec778c
sha256: 6f27f597dc0eeb1da9af8df64159e3327d94d14438692d7e5d7bbbd1a7281c11
lines: 201
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-plan-provenance.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `C2MainPublishedPlanProvenance`（C2-R05）：真实物理发布物 + 案卷原件经真实 CAS 只能绑定一次；candidate-held/revoked/缺失/篡改/符号链接/B1 frozen 冒充/未认证发布者全部拒绝；绑定后撤销/原件变更/错误 Run 清单阻断 Run；类自身不发布任何记录。

## 2. 用例清单

共 8 个 `test(`（`review-v3-main-plan-provenance.test.ts:111-200`，单一 `describe`）。

夹具（`:23-109`）：真实磁盘案卷（`original.txt` + `byteHash`）+ 发布物目录 `C-owned-publisher-attested-fixtures/<id>/<fingerprint>.json`（`{schemaVersion:'review-v3-published-plan-artifact/1',publicationId,canonicalPlan}`）；注入 `getCurrentPublication`（可 hold/revoke/missing）与 `assertAuthorizedPublication`（可 untrust）；`bind()` 走真实 `bindCanonicalPlanV3` CAS 并注入 `port.assertPublishedPlanForCase` 为校验回调（`:81-83`）；控制柄 `putBound/revoke/hold/missing/untrust/replacePinnedArtifact`。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | verified physical publication + Case original bind once through real CAS/Receipt; Run rechecks（`:112`） | `bind()` + `assertPublishedPlan` | `result.ok===true`；`canonicalPlan.fingerprint===plan.fingerprint`；`receiptLog` 长度 1；`decisions` `toEqual([])` |
| 2 | candidate-held or revoked author artifact never becomes a published Plan（`:122`） | hold/revoke/missing 后 bind | 三组 `ok===false`；`receiptLog` 长度 0 |
| 3 | even re-pinning the raw digest cannot publish a B1 frozen candidate-held descriptor（`:135`） | `replacePinnedArtifact(candidate-frozen)` | `ok===false`；`canonicalPlan` 为 `undefined`；`receiptLog` 长度 0 |
| 4 | trusted publisher must independently authenticate issuer, not rely on DTO status（`:147`） | `untrust()` | `ok===false`；`canonicalPlan` 为 `undefined` |
| 5 | physical artifact mutation, missing source and symlink cannot pass Plan bind（`:154`） | 改字节/`unlinkSync`/外部文件符号链接 | 三组 `ok===false` |
| 6 | C1 source bind re-hashes actual physical Case original under same CAS snapshot（`:169`） | `writeFileSync(f.disk,'TAMPERED…')` | `ok===false`；`caseV2.revision` 仍 0；`canonicalPlan` 未写；`receiptLog` 0 |
| 7 | publisher status revoked after binding, changed original and wrong check scope block Run（`:178`） | 绑定后 revoke/改原件/换 checkKeys | `assertPublishedPlan` 三次 `toThrow()`，其中第三例 `toThrow('manifest')` |
| 8 | requires authenticated independent source and pinned root, never creates publication itself（`:194`） | `new …({} as never)`、相对根 | `toThrow()`；`toThrow('absolute')` |

## 3. 真实断言

- 用例 1：`expect(result.ok).toBe(true)`（`:115`）；`expect(readAggregate(f.id)?.receiptLog).toHaveLength(1)`（`:117`）；`expect(readAggregate(f.id)?.decisions).toEqual([])`（`:119`）。
- 用例 2-6：`expect((await a.bind()).ok).toBe(false)`（`:125,129,132,140,147,150,156,162,172`）与零副作用断言（`:133-134,174-175`）。
- 用例 7：`expect(() => f.port.assertPublishedPlan(...)).toThrow()`（`:182,186`）；`toThrow('manifest')`（`:191`）。
- 用例 8：`toThrow('absolute')`（`:199`）。

夹具/mock 边界：`bindCanonicalPlanV3`/`case-store-v2` 真实落盘 CAS；发布物/原件是真实文件；`getCurrentPublication`/`assertAuthorizedPublication` 是内存 mock（`:74-79` 注释自述为 contract-only 夹具，不证明真实学校政策）。

## 4. 未覆盖与脆弱点

- 未覆盖：2MB 上限、`publishedSourceCommit` 非 40hex、`publicationId` 非法、`assertPublishedPlan` 的 `templateVersion` 分支、并发 CAS。
- 脆弱点：用例 3 的 B1 frozen 冒充依赖 artifact schema 差异（`review-b1-frozen/1` ≠ `review-v3-published-plan-artifact/1`）；`replacePinnedArtifact` 同时改记录 hash（`:92-96`）模拟“重钉摘要”，此构造对实现细节敏感。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 个用例 | 已证实 | `grep test(`；`:112,122,135,147,154,169,178,194` |
| 真实 CAS + 真实文件 | 已证实 | `:115-119`、fixture `:23-79` |
| B1 frozen 不能冒充发布物 | 已证实 | `:135-145` |
| 绑定后三类失效阻断 Run | 已证实 | `:178-192` |
| 类不自建发布记录 | 已证实（断言层） | `:194-200` |
| 生产 publisher 行为 | 未知 | 本测试 mock 掉 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 正常绑定一次 + Run 复查 | 1 | 112-120 | covered |
| 非发布状态拒绝 | 2 | 122-133 | covered |
| B1 frozen 冒充 | 3 | 135-145 | covered |
| 发布者未认证 | 4 | 147-152 | covered |
| 发布物篡改/缺失/符号链接 | 5 | 154-157 | covered |
| 原件篡改 | 6 | 169-176 | covered |
| 绑定后失效 | 7 | 178-192 | covered |
| 构造/根校验 | 8 | 194-200 | covered |
| 2MB/字段边界 | 无 | — | unknown |

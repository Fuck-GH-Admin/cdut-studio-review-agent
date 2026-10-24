---
path: apps/electron/src/main/lib/review/review-v3-technical-ledger.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e3bfd5f372caaf61d4692f3b2a808d780aa7e2d0
sha256: 99bec364db165f8f07fb3796263354c5db341e4cedac66e16e8e5b28d5681941
lines: 307
kind: test
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-technical-ledger.test.ts

## 1. 测试目标

验证 `admitV3TechnicalRun`/`recordV3TechnicalProposal`（`apps/electron/src/main/lib/review/review-v3-technical-ledger.ts:183/:213`）的 **C2 Main-only 技术日志**：CAS 准入、精确幂等重放、Host 证明/冻结摘要 fail-closed，且日志**永不产生 BusinessDecision**（describe `:93`）。被测对象是本批同名源文件（主手册见 `review-v3-technical-ledger.ts.md`）。

## 2. 用例清单

共 **7 个 `test()`**。夹具（mock 边界）：真实 `case-store-v2` 写临时 `PROFER_CONFIG_DIR`（`:14-16`）；`seed()`（`:36-58`）直注 synthetic Plan（`:52-57` 注明"Fixture only…不构成正式 Plan"）；`host()`（`:79-91`）构造 `V3VerifiedHostReceipt` Map（含 `host-check-1`/`host-end-1`）；`checkEvent/terminal`（`:59-78`）经 `executionProposalId` 生成事件身份。

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | Main 证明必需、CAS 准入与幂等重放 | `:94-147` |
| 2 | 无 Main 证明不能准入伪 Plan/当前来源/清单 | `:148-167` |
| 3 | 伪造 Host/改动事件/撤销 grant/无关业务改动 fail-closed | `:168-204` |
| 4 | 非同 requestId 不能占有 Host eventId | `:205-220` |
| 5 | 无回执业务改动与伪造来源版本绕不过冻结摘要 | `:222-244` |
| 6 | 缺精确 CAS 回执的损坏账本在新提案前被隔离 | `:246-269` |
| 7 | 匹配的伪造 Host 回执也不能覆盖存储 byteHash | `:271-305` |

## 3. 真实断言

- 用例 1：缺 attestor **同步** `expect(() => admitV3TechnicalRun(…, undefined)).toThrow('attestation')`（`:100-102`，注释 `:98-99` 明确"同步抛，不是 .rejects"）；二次同 requestId admit `ok:true` 且 revision 仍 1、events 空、decisions 空（`:107-113`）；record 幂等后 revision 2、回执仅 +1（`:121-128`）；terminal 后 `terminalStatus==='completed-technical'`、序号 `[1,2]`、revision 3、decisions/observations 空（`:135-139`）；伪造 hostReceiptId 复用被拒且**账本 JSON 全等不变**（`:141-146`）。
- 用例 2：伪造 planFingerprint/caseRevision/证明回调抛错三条全 `ok:false`，`v3TechnicalExecution` undefined（`:152-166`）。
- 用例 3：缺回执/grantActive=false/异 grant 三连拒（`:177-186`）；伪造 eventId 拒（`:187-191`）；准入后无关业务改动 → 后续 Host 事件拒且 events 空（`:192-203`）。
- 用例 4：`denied.message` 含 `'requestId'`（`:217`）；无 Record 回执写入（`:218-219`）。
- 用例 5：带外改 `contentHash`（不 bump revision）→ 拒；events 空、revision 1、decisions 空（`:234-243`）。
- 用例 6：message 含 `'缺少对应 CAS 回执'`（`:266`）；隔离后 events 保持 1、revision 1（`:267-268`）。
- 用例 7：拒且 message 含 `'SHA256'`（`:302-303`）；events 空（`:304`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`rawV3TechnicalEventChainDigest` 直接断言、4096 事件上限、`REQUEST_ID_COLLISION`（非同键重放）分支、`assertC2HostRunNotFenced` 的 fence 状态矩阵、`validateV3ExecutionProposal` 内部。
- mock 边界：Plan 直注 + Host 回执合成（非生产证明）；`caseRevision` 起点依赖 `createAggregate` 初值（revision 0，`:49`）。
- 断言依赖中文错误子串（`:217/:266/:303`）与同步抛约定（`:100-102`）——语义改动会碎测试。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例断言如 §3 | 已证实 | 逐行读 `:1-307` |
| 幂等=回执不增、冻结摘要检带外篡改 | 已证实 | `:121-128`、`:234-243` |
| 同步抛 attestation 约定 | 已证实 | `:98-102` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支（源文件） | 用例 | 状态 |
| --- | --- | --- |
| admit（attestor/CAS/幂等/身份） | 1、2 | covered |
| record（Host 证明/requestId/冻结摘要/回执链） | 1、3、4、5、6、7 | covered |
| terminal 后拒写 | 1（隐含） | partial |
| 4096 上限/REQUEST_ID_COLLISION/digest 函数 | — | unknown（无用例） |

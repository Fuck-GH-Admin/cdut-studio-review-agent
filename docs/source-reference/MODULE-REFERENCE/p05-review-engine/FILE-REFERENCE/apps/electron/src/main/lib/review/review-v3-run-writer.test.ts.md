---
path: apps/electron/src/main/lib/review/review-v3-run-writer.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 71aac61f66db4ba9e6c148c7cb6c239cc1ec4ce8
sha256: e74565f6a07e1a12744ab046176625237a651c4748d1955a9fea561177cd376b
lines: 336
kind: test
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-run-writer.test.ts

## 1. 测试目标

验证 `sealV3ReviewRun`/`getV3ReviewRunRecord`（`apps/electron/src/main/lib/review/review-v3-run-writer.ts:134/:45`）的 **C2-R01 Case 权威不可变 Run 封存**：真实物理 Read→verified Check→terminal→单 CAS 封存、任何缺证据/伪造/带外改动 fail-closed、封存后历史只读可查且不可覆盖。被测对象是本批同名源文件（主手册见 `review-v3-run-writer.ts.md`）。

## 2. 用例清单

共 **12 个 `test()`**（单一 describe `:126`）。夹具（mock 边界如实记录）：

- 真实 `case-store-v2`（`createAggregate/readAggregate/submitCommand/writeAggregate`）写临时目录（`PROFER_CONFIG_DIR` 指向 `work/tmp/review-v3-c2-seal-<ts>`，`:14-16`，afterAll 删除）。
- `seed()`（`:43-72`）：真实 CaseAggregate + **synthetic Plan 直注**（`:61-65` 注明"不证明已发布策略/真实字节"）+ `admitV3TechnicalRun`。
- `attestHost()`（`:95-108`）构造 `V3VerifiedHostReceipt` Map（伪造的"已验证"回执——测试自己声明非生产证明）。

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | read→check→terminal→单 CAS 封存，永非 Decision | `:127-166` |
| 2 | 技术完成但无 Check → incomplete，不伪造通过 | `:168-182` |
| 3 | 无在先物理 Read 的正面 Check 不可封存 | `:184-194` |
| 4 | 同绑定重复 Check 拒绝（非 last-wins） | `:196-207` |
| 5 | 缺 Main 收尾证明/错终态 ID/错案卷状态拒封 | `:209-224` |
| 6 | 篡改事件体/窃取 Host 回执/改动业务来源 → 隔离 | `:226-240` |
| 7 | 已封 Run 不能用新事务 ID 覆盖 | `:242-254` |
| 8 | 终态后带外输入变更不能通过"看似合法"收尾 | `:256-266` |
| 9 | 并发 C 业务改动（带 CAS 回执）阻断旧冻结 Run | `:268-282` |
| 10 | 授权的后续业务改动后历史 Run 只读仍可见 | `:283-301` |
| 11 | 读侧拒绝伪造 check 状态/缺封存回执 | `:303-321` |
| 12 | 读侧拒绝伪造历史 Plan | `:323-334` |

## 3. 真实断言（抽样全列关键 expect）

- 用例 1：`first.entity.state` `toBe('requires-human-review')`（`:140`）；coverage `toMatchObject({totalBindings:1,observedBindings:1,unobservedBindings:0,blockedApplicability:0})`（`:141-143`）；`boundChecks[0]` `{technicalStatus:'accepted', decisionEligible:false}`（`:144-146`）；digest 64hex（`:148`）；`caseV2.revision` `toBe(5)`（`:150`）；receiptLog 序列 `['AdmitV3TechnicalRun','RecordV3TechnicalProposal'×3,'SealV3ReviewRun']`（`:151-155`）；`decisions/observations` 空（`:156-157`）；重放 seal revision 仍 5（`:160-162`）；返回记录为克隆（改副本后真值不变 `:163-165`）。
- 用例 2：`state==='incomplete'`、coverage `{1,0,1,0}`、`technicalStatus===null`、`decisions` 空（`:175-181`）。
- 用例 3：`refused.message` 含 `'真实 Host 原件读取'`（`:191`）、`v3ReviewRun` undefined、revision 3（`:192-193`）。
- 用例 4：message 含 `'重复观察'`（`:205`）。
- 用例 5：`expect(() => sealV3ReviewRun(…, undefined)).toThrow('ATTESTATION')`（`:213-216`）；draft 拒（`:217`）；带外改 stage 仍拒（`:221-222`）。
- 用例 6-9：均 `denied.ok===false` + `v3ReviewRun` undefined + decisions 空（`:236-239/:252-253/:263-265/:279-281`）。
- 用例 10：后续改动后 `getV3ReviewRunRecord` 仍返回原 runId（`:298`）、revision 6、decisions 空。
- 用例 11：伪造 `technicalStatus` → `getV3ReviewRunRecord` `toBeUndefined()`（`:315`）；删 Seal 回执 → 同（`:317-319`）。
- 用例 12：改 `applicability` → undefined（`:330-332`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`interrupted`/`needs-resume` 终态、`blockedApplicability>0`、`multi` 绑定、`unknown` check 的 read 豁免分支、`C2_MAIN_RUN_CLOSURE_ATTESTATION_REQUIRED` 的消息细节（仅 `toThrow('ATTESTATION')`）。
- mock 边界：Plan 为直注 synthetic（`:61-65`）；Host 回执为测试构造（`:95-108`）——**不构成生产证明**；`submitCommand` 用的自定义命令类型（`ModifyBusinessAfterHostTerminal` 等 `:274/:293`）是测试专用合成命令。
- 断言含中文错误子串匹配（`:191/:205/:266`）——文案改动会碎测试。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 用例断言如 §3 | 已证实 | 逐行读 `:1-336` |
| 夹具=真实 store+synthetic Plan+合成 Host 回执 | 已证实 | `:14-16/:61-65/:95-108` |
| 不可覆盖/历史只读/读侧防篡改均有断言 | 已证实 | 用例 7/10/11/12 |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支（源文件） | 用例 | 状态 |
| --- | --- | --- |
| seal 主链 + state/coverage | 1、2 | covered |
| 无 read 拒 check/重复 check | 3、4 | covered |
| attestor/stage/终态校验 | 5 | covered |
| 篡改隔离（事件/来源/回执） | 6、8、11、12 | covered |
| 不可覆盖/历史稳定 | 7、10 | covered |
| 并发业务改动拒封 | 9 | covered |
| interrupted/needs-resume/blockedApplicability | — | unknown（无用例） |

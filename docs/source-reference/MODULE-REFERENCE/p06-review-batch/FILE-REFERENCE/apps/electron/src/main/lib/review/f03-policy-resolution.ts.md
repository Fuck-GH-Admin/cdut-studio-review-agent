---
path: apps/electron/src/main/lib/review/f03-policy-resolution.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 68bbf29ac3f5b15c908db38089b2b25980087240
sha256: 0b583430ccc427d82637f4ec3b55cd9a3e949440400ac407bcc223e8f00949a4
lines: 211
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/f03-policy-resolution.ts

## 1. 结论与边界

F03：对同一审核目的的多份政策条款做**保守归并**与具名冲突裁定（文件头 `:1-7`）。不发布政策、不写案卷、**不相信规则 priority 代表制度效力**；裁定由可信 Main 在写入业务版本后以已核验快照传入，本模块再次检查候选集合指纹（`candidatesHash`）防旧裁定在政策/规则变更后继续生效。纯函数 + `createHash`。

不做的事：不做裁定登记（Main 负责）；不猜测优先级（不按标题/数值/上传顺序/较新版本，`:129-130`）；不改写原始 PolicyRecord/RuleSpec（`guarded` 只做运行时投影，`:96`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `F03RuleSource` | type | `:11-14` | policy/template/workspace 三类来源 |
| `F03RuleEntry` | interface | `:16-22` | `{rule; origin; policySources?; originalRuleId?}`（`policySources` 只读溯源，不当文件原文引用，`:19`） |
| `F03ClaimLink` | interface | `:24-30` | 同一限制的不同 ID 条款须负责人显式配置同一 `claimKey` |
| `F03PriorityDecision` | interface | `:32-40` | `{claimKey; selected; candidatesHash; confirmedBy; confirmedAt; reason}`（必须绑定完整候选语义，`:35`） |
| `F03Conflict` | interface | `:42-47` | 冲突记录（候选清单+hash） |
| `F03Resolution` | interface | `:49-54` | `{rules[]; conflicts[]; excluded[]}`（excluded 留诊断账本不伪装不存在，`:52`） |
| `resolveF03PolicyRules` | function | `:132-211` | `(entries, {claims?, decisions?, asOfDate?}) => F03Resolution` |

内部：`canonical/digest`（`:57-63`，键排序确定性摘要）、`sourceIdentity`（`:64-65`，policyId+version+ruleId）、`dateOnly`（`:67-71`，严格日期+真实日历校验）、`ruleMeaning`（`:74-83`，仅审核语义参与合并比较，不含显示顺序/ID/定位）、`candidatesHash`（`:86-91`，定义+版本+确认状态全参与）、`guarded`（`:93-106`）、`applicable`（`:109-114`）、`guardUncertain`（`:116-126`）。

## 3. 内部逻辑与关键流程

### 3.1 运行时投影 `guarded`（`:93-106`）

冲突/未确认规则降级投影：`confirmation` 标 `conflict`/`unconfirmed`；`dataCheck/calculation` 置空（“防止未知或冲突政策携带确定性自动执行载荷”）；`onFail:'manual-review'`、`onUnknown:'needs-confirmation'`。**关键分支**（`:100-101`）：`unconfirmed` 且 `execution==='semantic'` 保持 `semantic`（D2 的未认证语义检查必须仍能提交 awaiting-confirmation；Pi 已在写入边界拒绝 unconfirmed→compliant；降 manual 会让旧审核器在身份校验前报“非语义检查”，破坏 D2 正式校规不能被模型确认的门禁，`:95-99` 注释）；其余降 `manual`。

### 3.2 日期适用 `applicable`/`guardUncertain`（`:109-126`）

无可信 `asOfDate` 或日期非法/区间倒置 → 不按机器今天日期自动采用：`applicable` 返回 true（进入计划）但 `guardUncertain` 把带生效区间的规则降 `unconfirmed`（`:119-124`）。`asOfDate` 非法 throw `F03_AS_OF_DATE_INVALID`（`:136`）。

### 3.3 决议主流程 `resolveF03PolicyRules`（`:132-211`）

1. 过滤适用；policy 来源做重复身份检测（`F03_DUPLICATE_POLICY_RULE`，`:143`）。
2. **分组**（`:145-156`）：跨政策同 ruleId 的条款若 claimKey 配置一致用该 key，否则强制 `same-rule-id:{id}`（“同一原始 ID 不得通过漏配或拆 claimKey 绕开冲突”，`:149`）；单条用显式 claimKey 或 `individual:` 兜底。
3. 非 policy 来源直接 `guardUncertain` 入结果（`:158-159`）。
4. 逐组（按 claimKey 排序，`:161`）：单条 → 直接入；**同语义且全确认** → 合并来源（sourceRefIds 并集排序、`policySources` 全列）（`:170-175`）；有有效具名裁定（claimKey+hash 匹配、confirmedBy/reason 非空、时间可解析、selected 须为该组 confirmed 候选，`:177-180`）→ 选中入结果，其余进 `excluded`（reason 记裁定人与理由，`:181-189`）；否则 → 冲突（reason“适用依据冲突或缺少有效的具名裁定；仅受影响条款待确认”）且全组 `guarded('conflict'）`（`:191-197`）。
5. **重复 ID 稳定区分**（`:200-208`）：结果中同 ruleId 的改写为 `f03-{digest 前 24}` 且保留 `originalRuleId`（V2 覆盖/CheckResult 用裸 id 作身份，避免报告混淆两份政策）；按 priority、id 排序；仍冲突 throw `F03_RULE_ID_COLLISION`（`:209`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：由政策/模板规则归并消费方（`policy-store`/规则装配链路）调用；直接测试 `f03-policy-resolution.test.ts`。出向仅 `node:crypto` 与 `@profer/shared.RuleSpec` 类型。

## 5. 数据 I/O、读写与副作用

纯函数 + sha256；无 I/O/日志。`asOfDate` 之外无时间取用（裁定时间由入参传入）。幂等：同输入同输出。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| asOfDate 非法 | `:136` | throw `F03_AS_OF_DATE_INVALID` |
| 重复政策规则身份 | `:143` | throw `F03_DUPLICATE_POLICY_RULE` |
| 重写后 ID 仍碰撞 | `:209` | throw `F03_RULE_ID_COLLISION` |
| 冲突无裁定 | `:191-197` | 全组 guarded('conflict') 入结果+conflicts 账本 |
| 无取消/恢复 | — | 纯函数 |

## 7. 权限与权威状态

裁定必须 `confirmedBy`+`reason`+可解析 `confirmedAt` 且 selected 是 confirmed 候选（`:177-180`）；`candidatesHash` 绑定完整候选语义防旧裁定续用（文件头、`:85`）。priority 不代表制度效力（`:4`）。excluded 留痕不伪装。

## 8. 修改影响面

改合并/裁定语义 → 影响多政策规则装配与审核运行的规则集；`ruleMeaning` 字段集变化 → 指纹与合并口径变化；ID 重写影响 V2 覆盖/CheckResult 身份。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `f03-policy-resolution.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 保守归并+具名裁定+指纹复核 | 已证实 | 文件头、`:86-91/:177-189` |
| unconfirmed semantic 保持 semantic（D2 门） | 已证实 | `:95-101` |
| 不猜优先级/不按机器日期 | 已证实 | `:108-114/:129-130` |
| 同 ID 防绕冲突+稳定改名 | 已证实 | `:149/:200-209` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类型契约（6） | 2 | `:11-54` | covered |
| `guarded`/日期守卫 | 3.1-3.2 | `:93-126` | covered |
| 分组/合并/裁定/冲突 | 3.3 | `:145-197` | covered |
| ID 重写/排序/碰撞 | 3.3 | `:200-209` | covered |

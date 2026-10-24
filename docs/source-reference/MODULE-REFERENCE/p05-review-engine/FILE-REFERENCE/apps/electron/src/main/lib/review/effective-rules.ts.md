---
path: apps/electron/src/main/lib/review/effective-rules.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 97fa9c84fdd5889ffad5b65a3d756aeb34035c95
sha256: 13c291b691cde6450a7f33dc1170588bfdbc820a5bac24f8c0b804ad3c3b6fd6
lines: 111
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/effective-rules.ts

## 1. 结论与边界

当前案卷**唯一有效规则集**（头注 :1-3）：模板政策规则=默认基线，案卷 reviewRules 按 id 覆盖；执行/coverage/报告/决定守门共用此投影。政策按独立来源进候选，同名条款不被后加载政策覆盖；具名优先关系可信持久化由 Main 负责，未接线前冲突只能待确认（F03 语义）。

边界：冲突裁决在 `f03-policy-resolution`；政策读取在 `policy-store`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `EffectiveRuleOrigin` | type | 13 | = `F03RuleSource` |
| `EffectiveRule` | interface | 15 | = `F03RuleEntry` |
| `resolveEffectiveRuleReport` | fn | 22-88 | F03 只读汇总（含 conflicts） |
| `resolveEffectiveRules` | fn | 91-93 | 唯一规则投影（`.rules`） |
| `hashEffectiveRuleSet` | fn | 95-98 | sha256(canonical) 指纹 |

内部：`AggregateRuleSource`（:17）。

## 3. 内部逻辑与关键流程

1. **政策引用**（:26-47）：`policyRefs` 按 `[policyId,version,contentHash]` 去重（:27-29）；已发布模板引用必须已发布+hash 固定，否则 `F03_POLICY_REF_INVALID`（:31-34）；hash 不符 `F03_POLICY_HASH_MISMATCH`（:35）；内容被篡改 `F03_POLICY_CONTENT_TAMPERED`（:36-37）；provenance（document 有 versionId / owner-statement 有 text+enteredBy+合法时间）+ confirmations 有效，已发布模板不满足 → `F03_POLICY_PROVENANCE_INVALID`（:38-44）；已发布模板的 rule.policyVersionId 须匹配 → `F03_POLICY_RULE_VERSION_MISMATCH`（:45-47）；**草稿/未可信内容的规则强制 `confirmation:'unconfirmed'`**（:50-52，注释 :49）。
2. **分项要求**（:55-73）：按 `section.order` 排序；每 criterion 生成 `section-{sectionId}-{criterionId}` 规则（`policyVersionId: 'template:{id}@{ver}'`、`priority: order*1000+index+1`、semantic 输出枚举 `['compliant','non-compliant']`、`confirmation:'confirmed'`，模板结构权威）。
3. **案卷修正**（:76-82）：同 id+同 policyVersionId 覆盖移除旧条（:79-80）；`workspace:{pack}@…` 提取 rulePackId；**不同政策版本/来源的同名规则必须并存**，不得借 reviewRules 隐式废止正式政策（注释 :75-77）。
4. **汇总**：委托 `resolveF03PolicyRules(entries, options)`（:86）。
5. `hashEffectiveRuleSet`（:95-98）：`[{id, rule, origin}]` JSON→sha256。

## 4. 调用者与调用链

入向（生产）：`pi-case-review-service.ts:14`（hash+resolve）、`run-service-v2.ts:15`（effective-rules 依赖提取）、`review-d2-runtime.ts:16`、`review-v3-main-template-plan-bridge.ts:24`、`review-authoring-v1.ts:12`、`v2-executor-factory.ts:24`。测试：`effective-rules.test.ts:8`。出向：`./policy-store`（:7）、`./f03-policy-resolution`（:8-11）、`node:crypto`（:5）。

## 5. 数据 I/O、读写与副作用

经 `getPolicy` 读政策文件；无写、无日志（纯投影+throw）。

## 6. 分支、失败、取消与恢复

四类 `F03_*` throw（§3.1）均为校验失败即中止（fail-closed，损坏引用不得当作空规则，注释 :30）；无取消。

## 7. 权限与权威状态

- 政策权威：已发布+hash 固定+provenance/confirmations 可信才 `confirmed`；否则强制 unconfirmed（:50-52）——「草稿内容可用于起草，不能以已确认规则参与确定性运行」。
- 覆盖权威：仅同身份（id+policyVersionId）可被案卷规则替换；异源同名并存进 F03 冲突（注释 :75-77）。
- 唯一投影：`resolveEffectiveRules` 是 Run/coverage 共享口径（注释 :90）。

## 8. 修改影响面

六处生产消费方的规则集与 `effectiveRuleSetHash`；`F03_*` 错误契约被模板发布/建案路径消费。同测：`effective-rules.test.ts`（4 用例）。

## 9. 测试证据

直接测试 `effective-rules.test.ts`（4 用例 / 1 describe；真实 policy-store（mkdtemp）+ 真实 `buildDeterministicRuleChecks`；NOT_RUN）：
1. `:27-31` 无政策也含全部 workspace 规则（`['w1','w2','w3']`、origin 全 workspace）。
2. `:33-50` 分项规则生成：`[['section-service-hours','service',…],['section-study-credits','study',…]]`（按 order 排序）、origin template、hash 长度 64。
3. `:52-73` 合并覆盖：`['shared','w3','p2']`、`shared` 用案卷版本（requirement `案卷覆盖`、origin `{kind:'workspace'}`）、唯一 3 条、hash 64。
4. `:75-99` 真实发布政策两条相反限额（同裸 id R01）：rules 2 + conflicts 1、全 manual、conflict candidates 顺序 `['policy-faculty-clause','policy-school-clause']`；`buildDeterministicRuleChecks` 2 条全 `awaiting-confirmation`；坏 hash → `F03_POLICY_REF_INVALID`。
未覆盖：PROVENANCE/RULE_VERSION/HASH_MISMATCH/CONTENT_TAMPERED 各 throw 分支；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/行号如 §2 | 已证实 | 逐条 |
| 草稿强制 unconfirmed | 已证实 | :50-52 |
| 异源同名并存+冲突待确认 | 已证实 | :75-82 + 测试 :75-99 |
| F03 其余 throw 分支 | 未知（未测） | §9 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 政策引用四类校验 | §3.1 | 26-47 | covered（REF_INVALID 测） |
| 分项规则生成 | §3.2 | 55-73 | covered |
| 案卷覆盖/并存 | §3.3 | 76-82 | covered |
| `resolveEffectiveRules`/`hashEffectiveRuleSet` | §3.4-3.5 | 91-98 | covered |

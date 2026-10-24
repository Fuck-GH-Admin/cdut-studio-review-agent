---
path: apps/electron/src/main/lib/review/fixtures/comprehensive-fixture.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 25d3fe758ef3f20b659064e32471d019f72184ca
sha256: e5f73353e26a9685e798d8ac313b46899d5761aaf9020146e30d5111089e531f
lines: 104
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/fixtures/comprehensive-fixture.ts

## 1. 结论与边界

完整综测模板与虚构样例（N1b，头注释 :1-10）：虚构政策「示例大学学生综合测评办法（演示）」四条规则语义（P1 等级分值映射/P2 同活动择高/P3 组上限 10 分截断/P4 必需材料），**注释-实现矛盾（照实记录）**：源注释（:17）自称「文本+RuleSpec 双表达」，但模板字面量（:41-81）无 rules/RuleSpec 字段、未 import RuleSpec，P1-P4 仅存在于政策文本（:18-25）——与 tesseract signal 同类注释漂移，实现以无 RuleSpec 为准。明确标注虚构演示，真实使用需负责人确认。

## 2. 导出与关键符号

导出 5 条（`export` :15/:18/:28/:86/:96）：

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `FIXTURE_POLICY_ID` | const | `:15` | `'policy-comprehensive-assessment-demo'` |
| `FIXTURE_POLICY_CONTENT` | const | `:18-26` | 虚构政策全文（模板字符串） |
| `buildComprehensiveFixture` | function | `:28-84` | 生成 `{policy, template}`（policy 见 :28-45 附近；template `comprehensive-assessment-v2` v2、`domainPackId:'comprehensive-assessment'`、status draft） |
| `seedComprehensiveFixture` | function | `:86-94` | 幂等落盘（政策/模板已存在则不动用户改动 :92-93） |
| `publishComprehensiveFixture` | function | `:96-104` | 发布政策+模板 v2（:101-103） |

## 3. 内部逻辑与关键流程

`build`：政策 `contentHash=canonicalContentHash(content)`、`origin.kind:'owner-statement'`、confirmations 一条（同 all-templates 风格）；模板含 stages（auto-check+manual-review×2）、fields（category 等枚举）、materialSlots（certificates 含 requiredElements）；**模板无 RuleSpec 字段**（注释 :17 自称双表达与实现不符，见 §1 矛盾记录），P1-P4 仅政策文本。`seed`（:86-94）：`getPolicy` 缺失才 savePolicyDraft；`getTemplate` 缺失才 saveDraft。`publish`（:96-104）：seed→publishPolicy(FIXTURE_POLICY_ID,1)→publish('comprehensive-assessment-v2',2)。

## 4. 调用者与调用链

入向：
- 生产：`apps/electron/src/main/lib/review/review-ipc.ts:638`（`require('./fixtures/comprehensive-fixture')`）→ `seedComprehensiveFixture` :640、`publishComprehensiveFixture` :641（演示数据种入/发布，生产 IPC 路径）。
- 测试：批内 `fixtures/comprehensive-fixture.test.ts:8`（:20/:21/:24/:30/:39/:46/:55/:64/:65）、`submit-case-v2.test.ts:7`（:17）、`real-chain-journey.test.ts:20`（:34/:35）、`run-service-v2.artifacts.test.ts:74`（动态 import）。`FIXTURE_POLICY_ID/CONTENT` 外部无引用（仅文件内 :29/:31/:35/:64/:65/:102）。
出向：`../policy-store`（canonicalContentHash :29、getPolicy/savePolicyDraft :91、publishPolicy :102）、`@profer/shared` 类型（:12）。

## 5. 数据 I/O、读写与副作用

经 policy-store/template-store 落盘；`build` 纯生成。幂等 seed（:92-93）。

## 6. 分支、失败、取消与恢复

seed 二分支；无异常处理。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支；虚构声明为内容权威边界（头注释 :1-10）。

## 8. 修改影响面

批内 3 个测试文件依赖其形状（stages/枚举/材料槽断言）；`publishComprehensiveFixture` 是提交/旅程测试的公共前置。

## 9. 测试证据

`fixtures/comprehensive-fixture.test.ts`（批内，6 用例，NOT_RUN）：政策发布不可变+validatePolicyRef 通过（:19-28）、无确认发布抛「确认记录」（:30-38）、内容 hash 不一致保存抛（:40-46）、幽灵政策引用 error 阻止发布（:48-53）、模板 v2 无 error+stages/枚举/材料槽断言（:56-63）、重复 seed 幂等（:65-69）。mock 边界：真实 store + PROFER_CONFIG_DIR 隔离（:11-13）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 5 条；模板实际仅文本表达（无 RuleSpec） | 已证实 | :41-81 无 rules 字段；:18-25 政策文本 |
| seed 幂等 | 已证实 | :92-93；测试 :65-69 |
| 注释「双表达」与实现矛盾 | 已证实（矛盾） | 注释 :17 vs :41-81 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2/§3 | :15-104 | covered |
| 测试断言 | §9 | — | covered（NOT_RUN） |

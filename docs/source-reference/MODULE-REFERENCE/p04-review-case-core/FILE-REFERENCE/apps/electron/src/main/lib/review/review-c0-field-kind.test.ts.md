---
path: apps/electron/src/main/lib/review/review-c0-field-kind.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ef14cbac466f6c879227b208dde0d3f2a8f2eb42
sha256: 7ce9996093b42d1158271fedd5f98285eb681a5e929c29a9f5631dd75c5d2e97
lines: 84
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-c0-field-kind.test.ts

## 1. 测试目标

字段类型权威（文件头 :1）：**已发布**模板的 FieldSpec 决定字段 kind（number/date/text 真实落库），非法值被拒而非静默存成文本。被测入口 `review-c0-case-service.updateFieldsC0`（:16），下游真实走 `application-service.createCaseFromTemplate/updateFields` + `template-store` + `case-store-v2` 事务（磁盘隔离目录）。

## 2. 用例清单

2 用例 / 1 describe（`字段类型权威`，:48）。夹具：
- 隔离：`mkdtempSync(join(tmpdir(),'c0kind-'))` + `process.env.PROFER_CONFIG_DIR`（:8-10，`afterAll` rmSync）。
- 动态 import（:12-17）：`template-store.saveDraft/publishTemplate`、`application-service.createCaseFromTemplate`、`case-store-v2.readAggregate/payloadHash`、`review-c0-case-service.updateFieldsC0`。
- `authorized()` 帮手（:20-30）**手工构造** `AuthorizedCaseCommand`（schemaVersion/principal/payloadHash=`payloadHash('UpdateFields', payload)`）——注释明示真实 IPC 由 `bindC0LocalCaseCommand` 生成（:19），即**绕过绑定层**，只测 case-service+应用层。
- `template()` 帮手（:34-46）：3 字段模板（`applicantCount:number`、`usageDate:date`、`organizationName:text`，均 required/public/case 域）。

| # | 用例 | 行 | 动作 |
| --- | --- | --- | --- |
| 1 | 已发布模板：数字与日期按真实 kind 写入 | 49-66 | saveDraft+publish → 建案 → `updateFieldsC0` → 读聚合 |
| 2 | 已发布模板：非法数字值被拒绝 | 68-83 | 同上后写 `applicantCount:'不是数字'` |

## 3. 真实断言

- 用例 1（:57-65）：`created.ok` true（:57）；`result.ok` true（:61）；`fields.applicantCount` `toMatchObject({ kind:'number', value:18 })`（:63）、`fields.usageDate` `toMatchObject({ kind:'date', value:'2026-11-01' })`（:64）、`fields.organizationName` `toMatchObject({ kind:'text', value:'地球物理学院' })`（:65）——直接断言落库 `FieldValue` 的 kind 分档，非仅返回值。
- 用例 2（:81-82）：`bad.ok` false；`bad.code` 为 `'VALIDATION_FAILED'`（不是把 `'不是数字'` 存成文本）。

## 4. 未覆盖与脆弱点

- 未覆盖：`updateFieldsC0` 的未发布模板拒写分支（`review-c0-case-service.ts:77-80`）、无模板文本回退（:81）、`subjectFieldValues` 分支、enum/date 非法值、`upsertCaseSubjectC0`（在 `review-c0-subject-upsert.test.ts`）、绑定层 `bindC0LocalCaseCommand`（本文件显式绕过）。
- 脆弱点：`authorized()` 自造 principal/payloadHash，与真实 IPC 绑定的一致性无保障（若绑定层 hash 公式变化，本测试仍绿）；`as never` 断言绕过类型检查（:56/:60/:79）。
- **NOT_RUN**：本轮未执行 bun test。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例断言/夹具如 §2-3 | 已证实 | 本文件逐行 |
| 断言对象是**落盘聚合**的 FieldValue kind | 已证实 | :62-65 经 `readAggregate` |
| 未发布模板分支无用例 | 已证实（否定） | 本文件 + 全树 `.test.ts` 无该断言文案 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 已发布模板 kind 分档写入 | §3 | 63-65 | covered |
| 非法值拒绝（VALIDATION_FAILED） | §3 | 81-82 | covered |
| 未发布模板拒写 | §4 | — | unknown（未测） |
| 无模板文本回退 | §4 | — | unknown（未测） |
| 绑定层 hash/principal | §4 | — | unknown（被绕过） |

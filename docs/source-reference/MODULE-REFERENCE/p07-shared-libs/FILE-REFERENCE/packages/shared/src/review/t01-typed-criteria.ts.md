---
path: packages/shared/src/review/t01-typed-criteria.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e077b9359da1783e860e66f6ec90fbb6425e11da
sha256: 6893ba4537c86cfb939e7070c4c6ae4c8a13a0a44ef42f5df6608ed05988be07
lines: 101
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/review/t01-typed-criteria.ts

## 1. 结论与边界

T01 模板作者契约中「可机器判定的数值限制」（`T01NumberLimit`）的**唯一校验源**：提供约束读取（`readT01NumberLimit`）、发布前校验（`validateT01TypedCriteria`）、导入/起草时剥离负责人签认（`stripT01OwnerStatement`）与两个模板级查询（`countAuthoredCriteria`、`hasAutoCheckStage`）。模块头明确其双端职责（`packages/shared/src/review/t01-typed-criteria.ts:3-7`）：Renderer 的拦截只是用户体验，Main 必须在同一发布事务内重跑同一份校验（TAR-08）。

边界：

- 不做 T04 运行时求值（对真实事实的判定在 T04/RuleSpec 消费方）；不保存模板、不发 IPC。
- `validateT01TypedCriteria` 只返回错误**字符串数组**，不抛错、不改模板。
- 只处理 `deterministicConstraint.kind === 'field-number-limit'` 一种确定性约束（`:35,50-53`），其余 kind 一律报「格式无法识别」。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `T01OwnerStatement` | interface | 10-15 | `{kind:'owner-statement'; text; enteredBy; enteredAt}` | 负责人确认依据与署名 |
| `T01NumberLimit` | interface | 18-27 | `{schemaVersion:1; kind:'field-number-limit'; fieldKey; fieldScope:'case'; operator:'lte'\|'gte'; threshold:number; unit?; ownerStatement?}` | 注释：是对**已确认数字字段**的检查，不是输入表单 max（`:17`） |
| `T01CriterionWithConstraint` | type | 29-31 | `TemplateCriterionSpec & {deterministicConstraint?: T01NumberLimit}` | |
| `readT01NumberLimit` | function | 33-36 | `(criterion: TemplateCriterionSpec) => T01NumberLimit \| undefined` | 仅 `kind==='field-number-limit'` 才返回 |
| `validateT01TypedCriteria` | function | 38-75 | `(template: TemplateVersion) => string[]` | 发布门禁校验，返回中文错误列表 |
| `stripT01OwnerStatement` | function | 78-91 | `(template: TemplateVersion) => TemplateVersion` | 纯函数，浅拷贝 sections/criteria 后置 `ownerStatement: undefined` |
| `countAuthoredCriteria` | function | 94-96 | `(template: TemplateVersion) => number` | 各 section `criteria` 数量和 |
| `hasAutoCheckStage` | function | 99-101 | `(template: TemplateVersion) => boolean` | 是否存在 `kind==='auto-check'` 阶段 |

导出计数：interface 2 + type 1 + function 5。无常量导出、无内部函数。

## 3. 内部逻辑与关键流程

### 3.1 `validateT01TypedCriteria`（`packages/shared/src/review/t01-typed-criteria.ts:38-75`）逐 criteria 判定

`location` = `分项「${section.name}」标准「${criterion.title}」`（`:42`）。分支顺序：

1. `:44-49` `deterministicConstraint` 缺失：`criterion.execution === 'deterministic' && !criterion.dataCheck` → 报「尚未配置可执行的确定性规则」；否则 `continue`。
2. `:50-53` raw 为空/`schemaVersion !== 1`/`kind !== 'field-number-limit'` → 「确定性条件格式无法识别」，`continue`。
3. `:54-59` 查 `template.fields` 中 `key===fieldKey && kind==='number' && (scope ?? 'subject')===fieldScope` 的字段；找不到或 `fieldScope !== 'case'` 或 `criterion.targetScope !== 'case'` → 「必须引用有效的案卷级数字字段」。
4. `:60-62` `criterion.execution !== 'deterministic'` 或带 `dataCheck` → 「数值条件不能同时声明其他执行方式或工作簿检查」。
5. `:63-66` `operator ∉ {'lte','gte'}` 或 `threshold` 非有限数 → 「比较符或阈值无效」。
6. `:67-71` ownerStatement 须 `kind==='owner-statement'`、`text/enteredBy` trim 非空、`Date.parse(enteredAt)` 有限 → 否则「需要负责人确认依据与署名，才能作为确定性规则发布」。

### 3.2 `stripT01OwnerStatement`（`:78-91`）

展开拷贝 template→sections→criteria；对带 `deterministicConstraint` 的 criterion 解构出约束并置 `ownerStatement: undefined`（`:84-87`）；无约束的 criterion 原样（浅拷贝）。注释：导入/模型起草的数值约束不是已认证署名（`:77`）。

### 3.3 其余

`countAuthoredCriteria`（`:94-96`）：`reduce` 求和 `criteria?.length ?? 0`。`hasAutoCheckStage`（`:99-101`）：`stages.some(kind==='auto-check')`。

## 4. 调用者与调用链

出向：`import type { FieldSpec, TemplateCriterionSpec, TemplateVersion } from '../types/review-v2'`（`:8`，直指 `packages/shared/src/types/review-v2.ts`，非类型桶）。

入向（grep 全冻结树；注意存在同名包装层 `apps/electron/src/renderer/components/content-review/review-v3-t01-typed-criteria.ts`，下称「包装层」，首次引用给全路径）：

- **Main 发布事务（TAR-08 真实重跑点）**：`apps/electron/src/main/lib/review/template-store.ts:14,570-573`——`publishTemplate` 在 `validateTemplate` 后重跑 `validateT01TypedCriteria`，有错抛「模板未通过 T01 类型规则发布检查」并阻断发布；`:483,575` 用 `countAuthoredCriteria` 派生 `executionScope`（`material-manual-only`/`rules`）。
- **包装层** `apps/electron/src/renderer/components/content-review/review-v3-t01-typed-criteria.ts:9-25`：重导出 `readT01NumberLimit`/`validateT01TypedCriteria`/三个类型；`stripT01OwnerStatement` 在 `:121-123`（`resetT01ImportedConfirmations`）被调用。
- 包装层的下游（经重导出间接消费）：`TemplateWizardPanel.tsx:16,121,547-571`（发布前 `forPublish` 时 `validateT01TypedCriteria`）、`ReviewV3T01NumberRuleEditor.tsx:5-82`（编辑器读/写约束）、`review-v3-t01-brief-authoring.ts:10,169`、`review-v3-t01-business-presets.ts:6,68-134`（预置示例 `setT01NumberLimit`）、`review-v3-t01-versioning.ts:3`、`review-v3-t01-template-portability.ts:3`（`resetT01ImportedConfirmations`）。
- 间接测试（不在本批）：`review-v3-t01-typed-criteria.test.ts:7-94`、`review-v3-t01-brief-authoring.test.ts:5-91`、`review-v3-t01-versioning.test.ts:3-51`、`review-v3-t01-example-packs.test.ts:5,50`（均经包装层）。
- `hasAutoCheckStage`：grep 全冻结树（`*.ts`）仅见定义行（`packages/shared/src/review/t01-typed-criteria.ts:99`）与经根桶导出（`packages/shared/src/index.ts:11`）；**未检出生产调用点**（检索范围：冻结树全文 `hasAutoCheckStage`）。

## 5. 数据 I/O、读写与副作用

无。全部纯函数：不写盘、不改输入（`stripT01OwnerStatement` 返回新对象）；`validateT01TypedCriteria` 只读模板对象。

## 6. 分支、失败、取消与恢复

- 唯一「失败」形态是错误字符串列表（§3.1 六类文案）；不抛异常、无错误码。
- `readT01NumberLimit` 对形状不符静默返回 `undefined`（`:33-36`）——调用方（如包装层 `confirmT01NumberLimit`，`review-v3-t01-typed-criteria.ts:67-68`）自行抛 `T01_NUMBER_LIMIT_REQUIRED`。
- 无取消/恢复概念。与模板存储的原子写（`template-store.ts:579` writeAtomic）无代码耦合。

## 7. 权限与权威状态

无权限分支（依据：全文无 actor/sender 检查）。但有**权威性契约**：`ownerStatement`（enteredBy/enteredAt）是发布级签认，本文件校验其形状（`:67-71`）；签认的产生/撤销权威在包装层（`confirmT01NumberLimit` 显式产生、`reconcileT01OwnerConfirmations` 在规则/字段变更时清除，`review-v3-t01-typed-criteria.ts:63-73,129-157`），导入路径经 `stripT01OwnerStatement` 剥离（`:78-91`）——即「编辑器输入不能自证负责人」。

## 8. 修改影响面

- 改 `validateT01TypedCriteria` 判定/文案：影响 `template-store.ts:570-572` 发布阻断与 `TemplateWizardPanel.tsx:121` 的编辑期提示、包装层 `collectT01ConfirmedNumericChecks`（`review-v3-t01-typed-criteria.ts:80-81`，有错抛 `T01_RULES_NOT_CONFIRMED`）。
- 改 `T01NumberLimit` 形状（如加 operator）：波及包装层 `T01PublishedNumericCheck`（`:36`）、`ReviewV3T01NumberRuleEditor.tsx` 表单、T04 侧 RuleSpec 构建约定（`review-v3-t01-typed-criteria.ts:6` 注释）。
- 改 `stripT01OwnerStatement`：影响导入/版本化链（`resetT01ImportedConfirmations` 三处调用）。
- 需同步的测试：包装层四个测试文件（间接）与本批无直接测试。

## 9. 测试证据

本批**无**直接测试文件。间接证据（外部测试经包装层，静态读到的断言行）：

- `apps/electron/src/renderer/components/content-review/review-v3-t01-typed-criteria.test.ts:27-94`：`readT01NumberLimit` 形状断言（`:27`）、`validateT01TypedCriteria` 文案含「负责人确认」（`:31,50,63`）、「案卷级数字字段」（`:89`）、「比较符或阈值无效」（`:90`）、「执行方式」（`:92`）、「尚未配置」（`:94`）；导入剥离签认（`:48-50`）。
- `review-v3-t01-brief-authoring.test.ts:27-91`：阈值断言（`:28,78-79,85`）、剥离后无约束（`:91`）。
- `review-v3-t01-versioning.test.ts:12-51`：draft/published 的 `ownerStatement` 有无断言（`:22-23,30,37,42,51`）。

缺口（静态）：`countAuthoredCriteria`/`hasAutoCheckStage` 无直接单测断言（`hasAutoCheckStage` 连生产调用都未检出）；`stripT01OwnerStatement` 的深/浅拷贝边界未见测试。

**NOT_RUN**：本轮未执行测试/typecheck；断言仅代表源码中写有该 `expect`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| Main 发布事务真实重跑校验（TAR-08） | 已证实 | `template-store.ts:569-573` |
| 校验只认 `schemaVersion:1`+`field-number-limit`，字段须案卷级数字字段 | 已证实 | `:50-59` |
| ownerStatement 四要素（kind/text/enteredBy/enteredAt 可解析）缺一即拒 | 已证实 | `:67-71` |
| `stripT01OwnerStatement` 只剥离签认、保留约束描述 | 已证实 | `:78-91` |
| `executionScope` 由 `countAuthoredCriteria`+政策引用派生 | 已证实 | `template-store.ts:574-575` |
| `hasAutoCheckStage` 无生产调用点 | 已证实（否定结论，检索范围=冻结树全 `*.ts` 含 `hasAutoCheckStage`，仅命中定义与导出桶） | grep 结果 |
| `readT01NumberLimit` 把「未知 kind」当无约束（而非报错）是有意容错 | 推断 | `:33-36` 无 else 分支；注释未明说 |
| T04 侧 RuleSpec 实际消费形态 | 未知 | `review-v3-t01-typed-criteria.ts:6` 仅注释提及，T04 实现不在本批未读 |
| 外部测试是否覆盖 `validateT01TypedCriteria` 全 6 类错误 | 未知 | 仅核到 5 类文案断言 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `T01OwnerStatement`/`T01NumberLimit`/`T01CriterionWithConstraint` | §2 | 10-31 | covered |
| `readT01NumberLimit` | §2, §4 | 33-36 | covered |
| `validateT01TypedCriteria` 六分支 | §3.1 | 38-75 | covered |
| `stripT01OwnerStatement` | §3.2 | 78-91 | covered |
| `countAuthoredCriteria`/`hasAutoCheckStage` | §3.3 | 94-101 | covered（无测试） |
| T04 消费形态 | §10 | — | unknown |

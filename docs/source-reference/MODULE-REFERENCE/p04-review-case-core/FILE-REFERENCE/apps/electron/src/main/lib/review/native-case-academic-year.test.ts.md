---
path: apps/electron/src/main/lib/review/native-case-academic-year.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a1670adb6448fb4e42bf86c9357d4a20a070c2d5
sha256: e09acff0bc4410db019371d3488d6488637d4d2af33a3724118e1419cb603a5b
lines: 84
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/native-case-academic-year.test.ts

## 1. 测试目标

通用建案“学年解耦”回归：学年只是综测（`comprehensive-assessment`）等按学年组织评审业务的主键，不是所有 V3 案卷的必填项；通用草稿可省略且**不自动编造**；旧兼容投影在学年缺失时降级空串而不整体失效；切领域时保持学年一致性（文件头 `:2-7`）。被测函数：`domainRequiresAcademicYear`、`createNativeWorkspaceCaseV3`、`updateNativeWorkspaceSettingsV3`、`nativeWorkspaceProjectionV3`（`native-workspace-case-v3.ts`）+ `readAggregate`（`case-store-v2`）。

夹具：`mkdtempSync` 临时目录 + `process.env.PROFER_CONFIG_DIR`（`:13-15`），`afterAll` 删除；actor 固定 `local-reviewer`（`:21`）；`reviewTemplate: null` 显式不绑定模板。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

2 个 describe、6 个 test：

| # | describe / test 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 1 | 学年按领域解耦 / 领域判定 `:24-28` | — | `domainRequiresAcademicYear` | `'comprehensive-assessment'→true`、`'contract-review'→false`、`undefined→false` |
| 2 | 非综测通用草稿可省略学年 `:30-40` | 建案 `domainPackId:'contract-review'`、type 自定义审核、无学年 | `createNativeWorkspaceCaseV3` + 投影 | `caseFields.academicYear` undefined；`projection.academicYear===''`；`projection.title==='通用技术预审'` |
| 3 | 综测仍必须提供学年 `:42-47` | `domainPackId:'comprehensive-assessment'`、无学年 | 建案 | `rejects.toThrow('必须填写适用学年')` |
| 4 | 综测提供学年后正常建案 `:49-57` | 同上 + `academicYear:'2026'` | 建案 + `readAggregate` 重读 | `caseFields.academicYear.value==='2026'`；重投影 `academicYear==='2026'` |
| 5 | 切到综测无学年拒绝 `:61-70` | contract-review 建案（无学年） | `updateNativeWorkspaceSettingsV3({domainPackId:'comprehensive-assessment'})` | `rejects.toThrow('请先为案卷填写适用学年')` |
| 6 | 已有学年切综测允许 `:72-83` | contract-review 建案 + `academicYear:'2026'` | 同上 | `updated.id` 等于原案卷 id |

## 3. 真实断言

- #1 精确布尔三态（`:25-27`）。
- #2 断言 `caseFields.academicYear` 为 `undefined`（不是空串）——证明建案不编造字段；投影侧才降级 `''`（`:35-38`）。
- #3/#5 断言中文错误文案子串（`'必须填写适用学年'`、`'请先为案卷填写适用学年'`）。
- #4 断言存储形态 `caseFields.academicYear` 是 `{kind:'text', value}`（`:54` 取 `.value`）且冷读后投影一致。
- #6 只断言 id 相同，未断言领域字段实际改写。

## 4. 未覆盖与脆弱点

**未覆盖**：切领域时 `domainPackId`/`legacyDomainPackId` 字段实际值；`resolveDomainPack` 对 `undefined` 的回退包；学年为空串 `''`（trim 后）建案分支（`:245` `?? ''` → 需学年领域会拒）；`updateNativeWorkspaceSettingsV3` 的模板重解析副作用；投影 `academicYear ?? ''` 的其它来源；多语言/格式化学年。

**脆弱点**：#6 只验证“不被误拦”，没有验证切领域成功后的领域字段与模板绑定；若 mutate 分支丢失 domainPackId 更新，该测试仍通过。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe、6 test | 已证实 | `:23`、`:60`；`grep -c test(`=6 |
| 学年仅综测必填、缺省不编造 | 已证实 | 测试 `:24-40`；源 `native-workspace-case-v3.ts:51-56`、`:245-249` |
| 投影缺省学年降级空串 | 已证实 | 测试 `:35-38`；源 `:98-99` |
| 切领域需已有学年 | 已证实 | 测试 `:61-70`；源 `:329-334` |
| 切领域后的字段改写 | 未知 | #6 未断言 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 源分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `domainRequiresAcademicYear` | #1 | `:24-28` | covered |
| 建案缺省学年 | #2 | `:30-40` | covered |
| 建案需学年领域拒绝 | #3 | `:42-47` | covered |
| 建案带学年 | #4 | `:49-57` | covered |
| 切领域学年门 | #5、#6 | `:61-83` | covered |
| 切领域字段写入 | — | — | unknown |

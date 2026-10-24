---
path: apps/electron/src/main/lib/review/builtin-templates.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 452046913bf2673e6c3e13a55e391e8f2073e135
sha256: 4fb4d0a3a434af977f943d900d17e4a2313de30ffff838dafd76b93e58f9a35f
lines: 351
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/builtin-templates.ts

## 1. 结论与边界

审核模板目录（头注 :1-4）：两份项目内置模板 + 基于已下载开源项目整理的场景范本（只提供结构启发，**不移植异校分数或规则**）。

边界：模板本体是数据（TemplateVersion 字面量）；播种/目录初始化在 `ensureBuiltinTemplateDrafts`；发布校验在 `template-store`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BUILTIN_TEMPLATES_V2` | const | 202 | `[comprehensiveAssessment, scholarship]` |
| `REFERENCE_TEMPLATES_V2` | const | 205-290 | 8 个 reference 场景范本 |
| `ALL_DEFAULT_TEMPLATES_V2` | const | 292 | builtin+reference 合并 |
| `ensureBuiltinTemplateDrafts` | fn | 312-351 | 幂等播种+目录初始化 |

内部：`CREATED_AT`（:10）、`field/requiredCaseField/slot/criterion/section/groupSection/stages/base`（:12-80，构造器）、`comprehensiveAssessment`（:83-149，comprehensive-assessment-v2 **version 3**）、`scholarship`（:152-200，scholarship-v2 version 2）、`LEGACY_COMPAT_TEMPLATES_V2`（:295-309，历史兼容薄模板）。

## 3. 内部逻辑与关键流程

1. **模板数据**：综测 v3（:83-149，注释 :84-85「v2 曾被旧安装无 sections/rules 发布；已发布不可变，完整规则以新版本 3 发出」；`groupSection` 目标 group——分项规则形成整案检查 :54-60）；奖学金 v2（:152-200）；8 个 reference 模板（学生竞赛荣誉/活动审批/项目评审/教师科研/差旅/报销/年度成果/文件协议核对，:205-290）；`LEGACY_COMPAT_TEMPLATES_V2`（:295-309，仅供历史案卷兼容，`sourceNote` 注明不参与新模板库）。
2. **`ensureBuiltinTemplateDrafts(store)`**（:312-351）：
   - 缺失才 `saveDraft`（:318，不覆盖已有草稿/发布版）。
   - **综测 v3 自动技术发布**（:320-327）：`status==='draft' && catalogKind==='builtin'` 时 `publishTemplate`（注释 :319-320 修复先前规则为空的发布版；检查为通用证据检查，无校方政策/分值表）。
   - **teacher-research-grant 修复**（:329-345）：旧草稿 panel 阶段缺 `nextStageId:'decision'` 且阶段集相同且 sourceNote 未被用户改 → 存 version+1 的修复草稿（不覆盖用户编辑）。
   - `initializeTemplateCatalog(builtin ids, legacy ids)`（:346-350）。

## 4. 调用者与调用链

入向（生产）：`boot-check.ts:13`、`workspace-service-v2.ts:11`、`native-workspace-case-v3.ts:13`（均 `ensureBuiltinTemplateDrafts`）。测试/夹具：`boot-check.test.ts:8`、`fixtures/all-templates-fixture.ts:11`、`run-service-v2*.test`。出向：`./template-catalog`（:7）、`./template-store`（:8）、`@profer/shared` 类型（:6）。

## 5. 数据 I/O、读写与副作用

经注入的 `store.saveDraft` 写模板（缺才写）；`publishTemplate` 发布综测 v3；`initializeTemplateCatalog` 写目录。无直接 fs/日志。

## 6. 分支、失败、取消与恢复

无 throw（publishTemplate 内部校验可能抛，未捕获——播种中断下次幂等续）；幂等性=「存在即跳过」（:318）。

## 7. 权限与权威状态

- 模板权威边界：sourceNote 均声明「通用示例/不含成都理工大学计分政策」（:80/头注 :3）；reference 模板是场景范本非校规。
- 不覆盖用户改动：只在缺失时播种；grant 修复仅对未改 sourceNote 的草稿（:333）。
- 综测 v3 自动发布是**技术模板发布**（非校方政策发布），注释 :319-320 明示。

## 8. 修改影响面

影响启动播种、模板目录、`ALL_DEFAULT_TEMPLATES_V2` 消费（boot-check 计数断言）；综测 v3 内容是 V2 运行/建案基线。同测：`boot-check.test.ts`（4 用例）。

## 9. 测试证据

间接测试：`boot-check.test.ts`（seeded ≥ ALL_DEFAULT 数量、published ≥ 1、草稿不覆盖，:15-50）；`template-asset-contract.test.ts`（`BUILTIN_TEMPLATES_V2[0]` 作为 validateTemplate 基底，:45）；`fixtures/all-templates-fixture.ts` 全模板发布流。缺口：grant 修复分支、模板字段/分项内容无逐条断言。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 幂等播种/不覆盖 | 已证实 | :318 + 测试 |
| 综测 v3 自动技术发布 | 已证实 | :320-327 + 测试 :15-22 |
| grant 修复分支 | 已证实（代码）/未知（行为） | :329-345（无用例） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 模板数据（builtin 2 + reference 8 + legacy） | §3.1 | 83-309 | covered（数据不逐条） |
| `ensureBuiltinTemplateDrafts` 播种/发布/修复 | §3.2 | 312-351 | covered（修复分支未测） |

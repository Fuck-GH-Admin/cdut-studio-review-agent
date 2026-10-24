---
path: apps/electron/src/main/lib/review/migration.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 98819546fa346bd089f2b50c4fb74674a8df7164
sha256: 81024517529f4030adcc5372f80cb9c2c9a9c5b1e134a165309a85f997983d76
lines: 81
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/migration.test.ts

> 引用注意：通用文件名，引用一律全路径 `apps/electron/src/main/lib/review/migration.test.ts`。

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

M1 迁移与契约单测（K06/K14 迁移面，`:1-4`）：V1→V2 迁移可读、分数转字段、fixture 保留、可重复；未知/缺省领域包语义；外加命令契约（`assertExpectedRevision`）与模型显式选择（`resolveModelSelection`，K16 纯函数面）两个**非本模块**的契约面。

## 2. 用例清单

共 7 个 `test(`，3 个 `describe`（`:19-80`）。夹具：`PROFER_CONFIG_DIR` 唯一临时目录（`:15-17`）；`ensureBuiltinTemplateDrafts` 先落盘模板再迁移（`:21,27`）；`buildDemoCase`（demo-fixtures）+`saveCase` 真实 V1 落盘。

### describe `V1→V2 迁移（M1）`（`:19`）

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | Given 综测 demo 案卷 When 迁移 Then V2 可读且分数转字段、fixture 保留（`:20`） | `migrateCaseToV2(buildDemoCase())` ×2 | `result.migrated` `toBeTrue()`；`v2.templateId==='comprehensive-assessment-v2'`；`templateVersion` 等于已存模板版本；`subjects.length===v1.items.length`；`subjects[0].fields.declaredScore.kind==='number'`；`documents.length` 相等；再迁移 `again.caseV2?.revision===v2.revision` |
| 2 | Given 未知领域包 Then 不默认综测并记注记（H14 延续）（`:37`） | `mapDomainToTemplate('mystery-pack')` | `templateId===''`；`note` 含 `'未知领域包'` |
| 3 | Given 缺省领域包 Then 按缺省综测语义兼容并注明（`:42`） | `mapDomainToTemplate(undefined)` | `templateId==='comprehensive-assessment-v2'`；`note` 含 `'缺省'` |

### describe `命令契约（M1）`（`:50`）

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 4 | Given expectedRevision 过期 Then 返回 VERSION_CONFLICT 与当前版（`:51`） | `assertExpectedRevision({expectedRevision:5},7)` | `code==='VERSION_CONFLICT'`；`currentRevision===7` |
| 5 | Given 一致修订号 Then 通过（null）（`:57`） | `(7,7)` | `toBeNull()` |

### describe `resolveModelSelection（M1/H16）`（`:68`）

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 6 | Given 有效选择 Then 返回渠道与模型（`:73`） | `resolveModelSelection(channels,{channelId:'chan-a',model:'m2'})` | `.model==='m2'` |
| 7 | Given 渠道被删除/禁用/模型不在列表 Then 抛可呈现错误（`:76`） | 三种非法选择 | `toThrow('不存在或已删除')`/`'已禁用'`/`'不在渠道可用列表'` |

## 3. 真实断言

逐条见上表（`:25-34,38-40,44-45,53-55,58,74,77-79`）。mock 边界：`buildDemoCase`/`saveCase`/`ensureBuiltinTemplateDrafts`/`template-store` 均真实实现（临时 configDir 落盘）；`assertExpectedRevision`/`resolveModelSelection` 为 `@profer/shared` 真实纯函数。

## 4. 未覆盖与脆弱点

- 未覆盖：`documentToVersion` 各分支、模板缺失/损坏 JSON、`getCaseV2` 不存在路径、`custom` 领域包。
- 范围注记：用例 4-5/6-7 测的是 `@profer/shared` 的 `assertExpectedRevision`/`resolveModelSelection`，**不是** `migration.ts`（静态已证实 import `:62,79`）。
- 脆弱点：用例 1 依赖 `buildDemoCase` 形状与 builtin 模板落盘顺序；`channels` 夹具内联。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个用例（3 迁移 + 4 外部契约） | 已证实 | `grep test(`；`:20,37,42,51,57,73,76` |
| 迁移可重复（revision 不重置） | 已证实 | `:33-34` |
| 未知/缺省领域语义 | 已证实 | `:38-40,44-45` |
| 真实落盘链 | 已证实 | `:21-24` |
| 文档/主体转换分支 | 未知 | 无断言 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| demo 迁移+重复 | 1 | 20-36 | covered |
| 未知领域 | 2 | 37-41 | covered |
| 缺省领域 | 3 | 42-46 | covered |
| VERSION_CONFLICT/一致 | 4,5 | 51-59 | covered（外部函数） |
| 模型选择 | 6,7 | 73-80 | covered（外部函数） |
| 文档转换/损坏文件 | 无 | — | unknown |

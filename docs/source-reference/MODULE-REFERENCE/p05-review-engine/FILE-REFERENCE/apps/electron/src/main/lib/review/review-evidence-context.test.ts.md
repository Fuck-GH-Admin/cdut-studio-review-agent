---
path: apps/electron/src/main/lib/review/review-evidence-context.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 17140c4d43ec5bb156aa3a0ac94fabc24906a258
sha256: 2b9c4874617b2949972064def5f8bb55e37939fb7cb8adddb81205affbd10221
lines: 74
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-evidence-context.test.ts

## 1. 测试目标

证明上下文与来源注册表单测（M0/H01/H07，K01/K07 的 M0 部分，`apps/electron/src/main/lib/review/review-evidence-context.test.ts:2`）。被测对象 `ai-review-service.ts` 三函数：`renderEvidenceDocuments`（证明原文进上下文）、`buildSourceRegistry`（来源白名单）、`computeUnprocessedMaterials`（未处理账本）。无同名源模块（独立测试入口）。

夹具：`buildDemoCase()` + 显式构造变体（过滤 evidence 文档/追加坏文档/改 parseStatus）。

## 2. 用例清单

共 **6 个 `test(`**（3 个 `describe`）：

| # | 行 | describe / 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 10-21 | renderEvidenceDocuments / 含文本证明 → 逐块带 documentId/blockId | demo 案卷（条件跳过：无 evidence 文档时 `expect(true)`，`:13-17`） | `renderEvidenceDocuments(reviewCase)` | 独立 |
| 2 | 23-27 | 无证明文档 → 空串（不产出空段落） | 过滤 evidence | 同上 | 独立 |
| 3 | 31-40 | buildSourceRegistry / 全部文档在列且标注角色与块范围 | demo 案卷 | `buildSourceRegistry` | 独立 |
| 4 | 44-58 | computeUnprocessedMaterials / 解析失败与部分解析无块 → 账本带中文原因 | 追加 `doc-broken`(failed)/`doc-scan`(partial) | `computeUnprocessedMaterials(withBad)` | 独立 |
| 5 | 60-67 | 视觉弃用清单合并（同文档去重） | 第二参 `[{documentId,fileName,reason:'超出单次 8 张图片上限'}]` | 同上 | 独立 |
| 6 | 69-73 | 全部可读 → 账本为空（不虚报） | 全 `parsed` | 同上 | 独立 |

## 3. 真实断言

- `:19-20` `text` toContain `` `documentId=${evidenceDoc.id}` ``、toContain `` `[${evidenceDoc.blocks[0].id}]` ``。
- `:26` `renderEvidenceDocuments(noEvidence)` toBe `''`。
- `:35-39` registry toContain 每个 doc.id、`'依据文件'`、`'待审文件'`、`'禁止编造'`。
- `:56-57` reasons toContain `'解析失败'`、`'扫描件'`。
- `:66` `ledger.some(entry=>entry.reason.includes('超出单次'))` toBe true。
- `:72` `computeUnprocessedMaterials(allParsed)` toEqual `[]`。

## 4. 未覆盖与脆弱点

- 用例 1 的**条件跳过**（`:13-17`）：fixture 无 evidence 文档时退化为 `expect(true)`——demo 案卷当前形态决定是否真测（脆弱点，照实记录）。
- 用例 4 只断言 `解析失败`/`扫描件`，`doc-scan`（partial 无块）的 reason 文案未锚。
- 「同文档去重」（用例 5 标题）无显式去重断言（只测合并存在）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 test/3 describe | 已证实 | `:9,30,43` |
| 空串/账本空等否定断言 | 已证实 | `:26,72` |
| 条件跳过设计 | 已证实 | `:13-17` |
| 测试通过与否 | 未知 | NOT_RUN |
| ai-review-service 实现 | 未知 | 批外 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| renderEvidenceDocuments 两态 | §2/§3 | 1-2 | covered（1 条件跳过） |
| buildSourceRegistry | §2/§3 | 3 | covered |
| computeUnprocessedMaterials 三态 | §2/§3 | 4-6 | covered（去重 partial） |

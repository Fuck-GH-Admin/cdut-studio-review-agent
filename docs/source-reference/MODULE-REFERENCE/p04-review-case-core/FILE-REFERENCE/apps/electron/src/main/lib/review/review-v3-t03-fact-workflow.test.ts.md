---
path: apps/electron/src/main/lib/review/review-v3-t03-fact-workflow.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4259a33b2cd5e6ce11cf583ed20d24739107b10f
sha256: 47a0166bc74453e14f5d03683993938d78dcd35a366fd7600702ab5cd4984524
lines: 167
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t03-fact-workflow.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

T03 真实事实/证明复审：0 是人工确认值、较新 AI 猜测仅待审、旧来源确认过期；被取代的旧确认不能复活（A05）；确认保留精确来源定位并拒绝旧修订（A05）；同一证书跨两人需独立归属、绝不自动确认；更正/来源退役只选依赖检查且 Run 不可变；拆分/合并提出原子建议不改原件；合并不掩盖冲突确认（A05）。同时覆盖 `review-v3-t03-subject-restructure.ts` 的拆分/合并提案（本批另一源文件）。

## 2. 用例清单

共 7 个 `test(`（`review-v3-t03-fact-workflow.test.ts:37-165`，单一 `describe`）。夹具（`:9-35`）：内存聚合 `case1`（主体 alice/bob、文档 certificate/notice/old(停用)、3 条 observations（human-0/ai-8/human-old）、3 条 evidenceLinks）。

| # | 用例（行） | 针对 | 真实断言 |
| --- | --- | --- | --- |
| 1 | 0 remains the human-confirmed value; newer AI guess is review-only; old source confirmation expires（`:38`） | fact-workflow | `alice.current.value` `toEqual({kind:'number',value:0})`；`needsReview===true`；reasons 含 `'新提取值与已确认值不同'`；`bob.current` `toBeNull()`；`bob.sourceState==='stale'`；`parseT03Correction('0')`→0；空串 `toThrow()`；`'2024-02-29'` 合法、`'2023-02-29'` `toThrow()` |
| 2 | A05: a superseded old confirmation cannot revive after a newer human revision goes stale（`:52`） | fact-workflow | `stale.current` `toBeNull()`；`sourceState==='stale'`；`history` id 序 `['old','correction']`；补 `reconfirmed` 后 `fresh.current.id==='reconfirmed'`、`needsReview===false`、`history` 长度 3 |
| 3 | A05: confirmation preserves precise source positions and refuses old revisions（`:78`） | fact-workflow | `resolveT03CorrectionRefs([located])` `toEqual([located])`（含 sheet-cell+quote）；无定位 → `{kind:'file'}`；`parseRevision:0` `toThrow('旧解析版本')`；跨案卷 `toThrow('其他案卷')`；停用文档 `toThrow('已停用')` |
| 4 | same certificate across two people requires independent attribution, never auto-confirm（`:88`） | fact-workflow | `cert.ambiguousSubjectIds` `toEqual(['alice','bob'])`；`proposedT03EvidenceLinks` 去重后长度 2 且全 `'candidate'`；带 extracted 后 `suggestions` `toEqual([{…,status:'candidate'}])`；`ambiguousSubjectIds` 含 bob/alice |
| 5 | correction/source retirement picks only dependent old checks, preserves immutable run（`:107`） | fact-workflow | `impact.affectedCheckIds` `toEqual(['alice-score'])`；文档退役后 `affectedSubjectIds` 含 `'bob'`、`affectedCheckIds` 含 `'bob-score'`；`run.checks` 仍长度 3 |
| 6 | split/merge proposes one atomic source-preserving change, leaves originals intact（`:127`） | subject-restructure | `split.blockedReasons` `toEqual([])`；`proposedSubjects` 长度 2；`proposedObservations` 全 `!confirmed`；`proposedEvidenceLinks[0].status==='candidate'`；原 `subjects` 仍长度 2、原 link `a1` 仍 `'candidate'`；merge `blockedReasons` 含 `'合并字段存在冲突，必须人工确认：score'`；`proposedSubjects[0].fields.score` `toBeUndefined()`；merge links 全 candidate |
| 7 | A05: merge cannot conceal conflicting confirmed observations behind equal subject fields（`:152`） | subject-restructure | 主体字段相等但确认 observation 冲突时仍 `blockedReasons` 含冲突、`fields.score` `toBeUndefined()` |

## 3. 真实断言

逐条见上表。mock 边界：聚合/run 全内存对象（`as unknown as`）；被测函数为真实纯函数；无 IO。

## 4. 未覆盖与脆弱点

- 未覆盖：`parseT03Correction` boolean/enum/text/复合分支、`planT03Recheck` `fullReviewRequired` 真值分支、`projectT03Evidence` 的 rejected link 分支。
- 范围注记：用例 6-7 断言的是 `review-v3-t03-subject-restructure.ts`（本批源文件，其手册记录交叉证据）。
- 脆弱点：reasons/`blockedReasons` 以中文子串断言；夹具 `as unknown as` 绕过类型检查。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个用例（5+2 跨文件） | 已证实 | `grep test(`；`:38,52,78,88,107,127,152` |
| 0/AI/过期语义 | 已证实 | `:38-51` |
| supersede/定位/旧修订 | 已证实 | `:52-87` |
| 不自动确认/Run 不可变 | 已证实 | `:88-106,125` |
| 拆合并不改原件 | 已证实 | `:142-143` |
| boolean/复合分支 | 未知 | 无断言 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 事实投影/解析 | 1 | 38-51 | covered |
| supersede（A05） | 2 | 52-77 | covered |
| 来源定位/拒绝 | 3 | 78-87 | covered |
| 证明投影/建议 | 4 | 88-106 | covered |
| 重审影响 | 5 | 107-126 | covered |
| 拆分/合并（跨文件） | 6,7 | 127-165 | covered |
| 其余解析分支 | 无 | — | unknown |

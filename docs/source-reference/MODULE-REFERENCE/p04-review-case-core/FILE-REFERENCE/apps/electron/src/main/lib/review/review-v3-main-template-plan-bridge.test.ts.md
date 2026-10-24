---
path: apps/electron/src/main/lib/review/review-v3-main-template-plan-bridge.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2b2791823b203f9960d59c92a703e3b0b5719a05
sha256: 5e541301fcb112ce0f298ccb66f343fc16fbdf8d20973d479c011220922b3b86
lines: 216
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-template-plan-bridge.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

A15 S2 四案例扩展（文件头 `apps/electron/src/main/lib/review/review-v3-main-template-plan-bridge.test.ts:1-6`）：已发布模板的负责人确认数值规则 → T04 可执行计划 → CheckResult；18→compliant、21→non-compliant、未知→pending、缺材料→待补件；全部来自同一 RuleSpec + 同一编译器，不特判“实验室”。并覆盖 RUN-33/34/37/40、gte、真实 T01 编辑器签认、未确认约束排除。

## 2. 用例清单

共 11 个 `test(`（`review-v3-main-template-plan-bridge.test.ts:94-215`，单一 `describe`）。

夹具（`:19-92`）：`PROFER_CONFIG_DIR` 指向 `mkdtempSync('s2bridge-')`；动态 import `template-store`/被测模块/`evaluateT04Plan`/`resolveEffectiveRules`（`:17-20`）；`buildTemplate()`（`a15-s2-lab` 模板：`applicantCount` 数值字段 + `headcount` deterministic `field-number-limit{lte:20}` + `lab-use-plan` 材料槽 + 两 stage）；`caseWith(count,withPlan,confirmed)`（`stage:'submitted'`、可选文档/人工确认 Observation）；`beforeAll` 真实 `saveDraft`+`publishTemplate`（`:80-83`）。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | 18 人 → 人数检查 compliant（`:95`） | `checksFor(18)` | `headcount.outcome.status==='compliant'` |
| 2 | 21 人 → non-compliant（不被表单拦截，走规则判定）（`:101`） | `checksFor(21)` | `'non-compliant'` |
| 3 | RUN-34：仅有申报值、无人工确认 → pending（`:107`） | `checksFor(18,true,false)` | `'awaiting-confirmation'` |
| 4 | 人数未知 → pending，不当作 0（`:113`） | `checksFor(null)` | `['awaiting-confirmation','not-applicable']` 含该状态且 `not.toBe('compliant')` |
| 5 | 缺计划书 → 材料检查非 compliant 且不虚构来源（`:120`） | `checksFor(18,false)` | `material.outcome.status` `not.toBe('compliant')`；`material.sourceVersionIds.length===0` |
| 6 | RUN-33：subject/group 规则有真实目标（`:128`） | 加 subject/group criterion + 主体 | `unresolved` 长度 0；`compiled` 有；scopes 排序 `toEqual(['case','group','subject'])` |
| 7 | RUN-37：asOfDate 显式封进检查与计划指纹（`:157`） | `checksFor(…,'2026-10-21')` vs 无 | `checks.every(asOfDate==='2026-10-21')` `toBeTrue()`；无日期时全 `undefined`；指纹 `not.toBe` |
| 8 | RUN-40：忽略原件不进材料槽与来源（`:165`） | `unusedReason='[审核员忽略] …'` | `caseTarget.sourceVersionIds` `toEqual([])`；材料检查非 compliant |
| 9 | gte 下限编译为 field-minimum（`:178`） | operator 改 `gte` | `constraints` 长度 1；`toMatchObject({kind:'field-minimum',fieldKey:'applicantCount',minimum:'20'})`；`unresolved` 长度 0 |
| 10 | 真实 T01 编辑器 owner-statement 能编译并保留签认来源（`:190`） | 换 `enteredBy/enteredAt` 型签认 | `unresolved` 0；`constraints[0].confirmedBy==='local-organizer'`；`compiled` 有 |
| 11 | 未确认的约束不进入正式计划（`:206`） | 删 `ownerStatement` | `constraints` 0；`unresolved[0].reason` 含 `'尚未确认'` |

## 3. 真实断言

- 用例 1-2：`expect(headcount.outcome.status).toBe('compliant'/'non-compliant')`（`:98,104`）。
- 用例 3-4：`toBe('awaiting-confirmation')`（`:110`）；`expect([...]).toContain(...)` + `not.toBe('compliant')`（`:116-117`）。
- 用例 5：`expect(material.sourceVersionIds.length).toBe(0)`（`:124`）。
- 用例 6：`expect([...scopes].sort()).toEqual(['case','group','subject'])`（`:154`）。
- 用例 7：`toBeTrue()`（`:159,161`）；`expect(withDate…fingerprint).not.toBe(without…fingerprint)`（`:162`）。
- 用例 9：`toMatchObject({kind:'field-minimum',…})`（`:186`）。
- 用例 10-11：`expect(result.constraints[0]?.confirmedBy).toBe('local-organizer')`（`:202`）；`expect(unresolved[0]?.reason).toContain('尚未确认')`（`:214`）。

夹具/mock 边界：`template-store`（`saveDraft`/`publishTemplate`）与 T04 编译/评估/`resolveEffectiveRules` 均为**真实实现**（临时 configDir 落盘）；案卷为内存对象（`as unknown as CaseAggregateV2`）；无 Electron/IPC/网络。

## 4. 未覆盖与脆弱点

- 未覆盖：`compileTemplatePlanForCase` 的 `phase:'decision'`、`extraSourceVersionIds`、未知 operator 的 `unresolved` 文案、`buildT04TargetFromCase` 兼容函数。
- 脆弱点：夹具 `as unknown as TemplateVersion`/`CaseAggregateV2` 绕过类型检查；用例 7 的指纹差异依赖 T04 编译器把 `asOfDate` 计入指纹（跨模块契约）；`checksFor` 在编译失败时 throw（`:90`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 个用例 | 已证实 | `grep test(`；`:95,101,107,113,120,128,157,165,178,190,206` |
| 真实 template-store 发布链 | 已证实 | `:80-83` |
| RUN-33/34/37/40 语义 | 已证实 | 用例 6/3/7/8 |
| gte→field-minimum | 已证实 | 用例 9 |
| 未确认约束排除 | 已证实 | 用例 11 |
| phase/extraSourceVersionIds | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| lte 四案例 | 1,2,3,4 | 95-118 | covered |
| 缺材料 | 5 | 120-126 | covered |
| subject/group 目标 | 6 | 128-155 | covered |
| asOfDate | 7 | 157-163 | covered |
| 忽略原件 | 8 | 165-176 | covered |
| gte | 9 | 178-188 | covered |
| T01 签认 | 10 | 190-204 | covered |
| 未确认排除 | 11 | 206-215 | covered |
| phase/extra 来源 | 无 | — | unknown |

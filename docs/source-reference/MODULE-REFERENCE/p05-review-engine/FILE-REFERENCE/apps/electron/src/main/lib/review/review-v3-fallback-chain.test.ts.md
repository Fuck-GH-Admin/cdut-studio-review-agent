---
path: apps/electron/src/main/lib/review/review-v3-fallback-chain.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c34e3f29843d337f02896df38b3a384451e2e2d0
sha256: faefaa82dbdc2e093d03f9c750c90ec1997113c5a1963587022c3be70b436412
lines: 86
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-fallback-chain.test.ts

## 1. 测试目标

公共兜底整链（Main 层）：未匹配候选 → 可编辑草稿 → 发布 → 真实案卷 → 真实 ReviewRunV2。断言重点（文件头 :4-7）：草稿走既有 template-store 可存可发（不新建模板系统）；发布模板零政策引用；语义判据在未人工确认时**不得**判 compliant（不能靠兜底伪造通过）。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 1（`test(` :47），1 describe（:46）。设置：`PROFER_CONFIG_DIR` 指向 mkdtemp（:14-16，afterAll 清理 :17）；动态 import 五模块（:19-23）：`review-v3-fallback-template-draft`/`template-store`/`application-service`/`review-v3-main-template-run`/`run-store-v2`；actor=local-reviewer（:25）；`b1Document()` 手工 B1 fixture（:27-44，`status:'candidate-held'` :43）。

动作链（:47-85）：
1. `fallbackDraftFromB1(b1Document(), 'fallback-chain-1')` → `saveDraft`，断言 `status==='draft'`（:51-52）。
2. `publishTemplate` → `getTemplate`，断言 `status==='published'`、`policyVersionIds/policyRefs` 均 `[]`（:55-61）。
3. `createCaseFromTemplate(...)` 真实建案（fieldValues organizationName/purpose），断言 `created.ok===true`（:64-70）。
4. `runTemplateRuleReview({caseId})`，断言 `runId` 含 `run-tpl-`、`ruleIds.length>0`；`listRunsV2` 取回后断言 `stored.inputManifest.planFingerprint === run.planFingerprint`（:72-78）。
5. 关键：全部 checks `status==='awaiting-confirmation'` 且 `reason` 含「不是确定性执行类型」（:80-84，注释 :79-81：既不能判 compliant 也不能算执行失败）。

依赖顺序：单用例内链式（草稿→发布→建案→运行→读取）。

## 3. 真实断言

- `:52`：`expect(saved.status).toBe('draft')`。
- `:57`：`expect(published.status).toBe('published')`。
- `:60-61`：`expect(published.policyVersionIds).toEqual([])`、`expect(published.policyRefs).toEqual([])`。
- `:70`：`expect(created.ok).toBe(true)`。
- `:73-74`：`expect(run.runId).toContain('run-tpl-')`、`expect(run.ruleIds.length).toBeGreaterThan(0)`。
- `:77`：`expect(stored.inputManifest.planFingerprint).toBe(run.planFingerprint)`。
- `:81`：`expect(stored.checks.length).toBeGreaterThan(0)`。
- `:82-84`：逐 check `expect(check.status).toBe('awaiting-confirmation')`、`expect(check.reason).toContain('不是确定性执行类型')`。

## 4. 未覆盖与脆弱点

- 未覆盖：`fallbackDraftFromB1` 转换失败分支、多模块依赖、B1 其它 status、发布冲突。
- 脆弱点：依赖 `PROFER_CONFIG_DIR` 环境隔离（:14-16）；B1 fixture 手工构造（`as never` 断言 :44），形状漂移不报编译错；`run-tpl-`/「不是确定性执行类型」为字符串契约断言。
- mock/真实边界：真实 template-store/application-service/run-store-v2（全链真身），无 mock；真实文件系统 tmp 目录。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例计数与 `test(` 一致 | 已证实 | :47 |
| 断言行如 §3 | 已证实 | 逐行读 :47-85 |
| 零政策引用 + awaiting-confirmation 兜底语义被断言 | 已证实 | :60-61/:82-84 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 草稿保存/发布 | #1 步骤 1-2 | covered |
| 真实建案+Run+指纹 | #1 步骤 3-4 | covered |
| 语义判据不自动通过 | #1 步骤 5 | covered |
| 转换失败/多模块 | — | unknown |

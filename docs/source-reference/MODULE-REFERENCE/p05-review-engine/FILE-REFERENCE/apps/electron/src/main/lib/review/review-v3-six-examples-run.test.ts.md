---
path: apps/electron/src/main/lib/review/review-v3-six-examples-run.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6c32a7efa5b7932cb8efd03e89f162d78a9da57a
sha256: f7224d6ce4ee4576244ef23b3c9f4b86075522061a0ec0d9a1a8bc387d555518
lines: 101
kind: test
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-six-examples-run.test.ts

## 1. 测试目标

六套完整业务示例的**模板可走真实运行链路**（文件头 `apps/electron/src/main/lib/review/review-v3-six-examples-run.test.ts:1-6`）：逐套"发布模板 → 建真实案卷 → 出真实 Run"，证明示例包自带模板不是只能在界面做表单试算。文件自述"不是『导入真实 ZIP』的验收（那需要桌面会话）"（`:4-5`）。

## 2. 用例清单

源码 **1 个 `test()` 调用点**（`:27`），位于 `for (const scenario of T01_STANDARD_EXAMPLES)` 循环（`:26`）内，动态生成 **6 个用例**——`T01_STANDARD_EXAMPLES = ['student','activity','scholarship','judging','expense','agreement']`（`apps/electron/src/renderer/components/content-review/review-v3-t01-example-packs.ts:107`）。用例名模板 `${scenario}：发布示例模板并产出真实 Run`（`:27`）。

夹具（设置）：`mkdtempSync(tmpdir())` 临时 `PROFER_CONFIG_DIR`（`:12-14`）；顶层 await 动态 import `createT01ExamplePack/T01_STANDARD_EXAMPLES`（`:16-18`）、`saveDraft/publishTemplate`（`./template-store` `:19`）、`createCaseFromTemplate`（`./application-service` `:20`）、`runTemplateRuleReview`（`./review-v3-main-template-run` `:21`）。

每用例动作（`:28-98`）：

1. 取示例包模板 → 给 `deterministicConstraint` 补 `ownerStatement`（模拟负责人确认门槛，`:35-53`）→ `saveDraft` + `publishTemplate`（`:54-56`）。
2. 用 `conforming` 样例字段 + 必填分项事项建案（`:58-75`）。
3. `runTemplateRuleReview({caseId})` 出 Run（`:77`）。
4. 若有 `violating` 反例：建反例案卷再跑 Run（`:84-98`）。

## 3. 真实断言

- `expect(created.ok).toBe(true)`（`:75`）；`expect(run.runId).toContain('run-tpl-')`（`:78`）。
- **关键断言**：`expect(run.checks.length).toBeGreaterThan(0)`（`:80`）、`expect(run.ruleIds.length).toBeGreaterThan(0)`（`:81`）——"示例模板必须真的产出检查项，而不是空跑"（`:79`）。
- 反例：`badCreated.ok` true（`:92`）；`expect(enforced > 0 || compliantCount === 0).toBe(true)`（`:97`，`enforced`=non-compliant 计数 `:95`、`compliantCount`=compliant 计数 `:94`）——"要么明确不合规，要么全部停在待确认——绝不允许『全部合规』蒙混过关"（`:96`）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实 ZIP 导入链路（文件自述排除 `:4-5`）、桌面会话/GUI、各场景的具体规则语义（只断言计数 >0，**不锁定具体检查项内容/分值**）、`runTemplateRuleReview` 的中间过程。
- 脆弱点：断言是计数级（`>0`）与集合级（`enforced>0 || compliantCount===0`），规则输出退化为"仅 awaiting"仍可通过反例分支；顶层 await import 失败会使整个文件加载期抛错；`ownerStatement` 注入模拟人工确认（`:41-52`），真实确认流程未覆盖。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 调用点 ×6 场景 = 6 用例；断言如 §3 | 已证实 | 逐行读 `:1-101`；场景数 `review-v3-t01-example-packs.ts:107` |
| 夹具=真实 template-store/application-service/template-run | 已证实 | `:19-21` |
| 门槛确认为注入模拟 | 已证实 | `:33-53` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 发布→建案→Run（conforming） | 6 个场景 | covered（计数级） |
| 反例不"全合规"（violating） | 6 个场景（有反例时） | covered（集合级） |
| 具体规则语义/导入 ZIP/人工确认流程 | — | unknown |

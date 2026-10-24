# NB-60 独立 QA 验收报告（D0）

- 批次 `nb-60`（p02-agent-runtime · p02.model-tools，10 文件 / 1374 行），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-015a87984fec56c1`（17:29:58Z）；QA `docs-r07-qa-nb-06-20261023`（00:40:00Z）
- **batchVerdict：`accepted`（10/10）**；G0/G1 pass、G2 pass_with_findings（6 minor，每文件 ≤2）
- **NOT_RUN**（批内 93 个测试用例静态读断言）

## G0 — PASS

seal 链三层独立重算全相等；ZIP 13 条目；10/10 manualHash；源绑定 10/10 = nb-60-SCOPE。

## G2 — 逐文件（10 文件 1374 行全文 + 10 篇手册全文）

| 文件 | verdict | findings |
| --- | --- | --- |
| skill-routing-rules.ts | accepted | NB60-N1（"九分支" vs 10 case） |
| skill-routing.ts | accepted | NB60-N2（"5 导出" vs 9） |
| skill-routing-eval.test.ts | accepted | NB60-N3（用例 30 vs 29）、NB60-N4（"九 slug" vs 10） |
| title-generation.ts | accepted | NB60-N5（"14 导出" vs 15） |
| title-generation.test.ts | accepted | NB60-N6（2 处标签字面量残片） |
| 其余 5 篇 | accepted | — |

复算命中：title-generation.test 44 用例/9 describe 全对、skill-routing.test 14 用例全对、runtime-smoke 4、policy-projection 2；MAX_TITLE_LENGTH=20、推荐 ≤3 上限 5、正文预算 24000/64000、9 拒绝码、THEME_COLORS 9 主题、EMPTY_INTENT_TOKENS 最长匹配消费、toolIsAvailable MCP 全名精确语义等全部与源码吻合。红线摘录（推荐不扩权/拒绝项不读正文/失败不假装/人工命名永不覆盖/插件仅 local）逐条准确。

## findings（6 minor）

前 5 条为计数口径（九/十分支、导出表行 vs 符号、eval 用例总数 30 实为 29）。NB60-N6 为**标签字面量被剥离的文字残片**（与 nb-43 NB43-N1 同根因：生成时特殊标记被剥离留孤立反引号）——本处结构完好、行号可回溯，语义可恢复，定级 minor（区别于 nb-43 的表格被拆+多处残句 major）。建议全组统一用符号名/转义写法描述标签字面量。

## 合入（lead）

全 10 篇 acceptedHashes 可合（`reviews/nb-60/RESULT.json.acceptedHashes`，脚本生成三方核验）；6 findings 记 ACCEPTED-ERRATA（NB60-N6 建议尽快关闭）。

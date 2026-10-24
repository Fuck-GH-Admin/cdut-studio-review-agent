---
path: apps/electron/src/main/lib/review/review-multi-rule.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 35aafadeb6a0a29e1756c8113b73583d9c70278a
sha256: 53db76a5c50a02760ee98673bcc3c2f221999110512dbcee8d47618c6665ee69
lines: 155
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-multi-rule.test.ts

## 1. 测试目标

M0/H02 多依据消费 + M0/H03 演示降级限定（K02/K03 回归）+ M0/H14 未知领域守卫（K14）+「无模型与未识别对象不代表审核通过」的界面验收回归（`apps/electron/src/main/lib/review/review-multi-rule.test.ts:1-4`、`:97`、`:109`）。隔离：`PROFER_CONFIG_DIR` 唯一临时目录（无渠道配置→无出口分支，`:3-4`）。

## 2. 用例清单

4 describe / 7 test。夹具 `buildTwoRuleCase`（`:26-58`）：双规则文档（含「学院专项加分上限为 3 分」条款）+ 双规则包各带大纲。

**renderRuleDocuments（M0/H02，`:60-72`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 1 | 两份全文与两包大纲都在列（不再首包代表全部）：含第二文档 id/文件名/大纲标题/「依据 1/2」「依据 2/2」/唯一条款文本 | `:61-71` |

**generateRuleOutline 演示降级门控（M0/H03，`:74-95`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 2 | 真实案卷无模型出口→抛错含「未回填任何预置规则」，且已有大纲不动 | `:75-87` |
| 3 | 演示案卷无模型出口→允许回退预置大纲（显式演示语义），`outline.length>0` | `:89-94` |

**未知领域守卫（M0/H14，`:98-107`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 4 | `domainPackId:'not-a-pack'`：`generateRuleOutline`/`extractItems`/`runAiReview` 均 reject「审核领域未配置」 | `:99-106` |

**真实界面验收回归（`:109-155`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 5 | 真实案卷无模型：`extractItems` rejects「尚未检查待审文件」；`startReviewRun` `status:'failed'`、0 findings、error 含「真实案卷不能使用演示模拟审核」；`exportReport` rejects「尚未成功完成」 | `:110-119` |
| 6 | 零条目案卷：运行 failed、error 含「尚未识别可审核条目」 | `:121-127` |
| 7 | 内置演示无模型：运行 `completed`、`engine:'mock-engine'`、findings>0（离线演示可用） | `:129-136` |
| 8 | 自定义审核导出（手工补 run）：markdown 含「审核类型/自定义审核」「修改建议：」「依据位置：」「证明位置：」「扫描件.pdf（无文本层）」「不能表示全部材料符合要求」 | `:138-154` |

**依赖顺序**：各用例独立 saveCase；用例 8 内部用 demo 运行的 finding 喂给合成 completed run。

## 3. 真实断言

- `expect(text).toContain('依据 1/2')`（`:67`）。
- `expect(String(error)).toContain('未回填任何预置规则')`（`:82`）。
- `expect(run.error).toContain('真实案卷不能使用演示模拟审核')`（`:117`）。
- `expect(markdown).toContain('不能表示全部材料符合要求')`（`:153`）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实模型出口路径（隔离环境无渠道）；`renderRuleDocuments` 超大输入。
- 脆弱点：用例 8 用 `saveRun` 手工构造 completed 状态（`:145`）绕过真实运行；文案断言与 `ai-review-service`/`report-service` 耦合。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 多依据渲染不再首包代表全部 | 已证实（断言） | `:61-71` |
| 真实案卷拒绝演示降级、演示案卷允许 | 已证实 | `:75-94` |
| 未知领域如实失败不套综测 | 已证实 | `:99-106` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| M0/H02 多依据 | 1 | `:61-71` | covered |
| M0/H03 降级门控 | 2-3 | `:75-94` | covered |
| M0/H14 未知领域 | 4 | `:99-106` | covered |
| 验收回归 | 5-8 | `:110-154` | covered |

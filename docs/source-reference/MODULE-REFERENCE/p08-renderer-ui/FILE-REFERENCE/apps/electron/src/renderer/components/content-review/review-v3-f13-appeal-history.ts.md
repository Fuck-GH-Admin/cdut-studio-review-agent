---
path: apps/electron/src/renderer/components/content-review/review-v3-f13-appeal-history.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d3d6315a436dde4f5ffdf0d20e53204dae1d85d7
sha256: 0559090b8d6788c769de359640455cc1d55cec514c672e0e38af371d22d7fc67
lines: 79
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f13-appeal-history.ts

## 1. 结论与边界

**F13 公开申诉历史只读投影**（`apps/electron/src/renderer/components/content-review/review-v3-f13-appeal-history.ts:1`）：**不推断旧英文状态的法律含义**；缺关联/旧歧义数据必须显式提示（`warnings`，`:14`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `F13AppealHistoryEntry` | interface | `:4-17` | 条目（appeal/original/amendment/reviewTask/回执/evidence/statusLabel/outcomeLabel/warnings/originalSuperseded） |
| `buildF13AppealHistory` | 函数 | `:23-79` | `(aggregate) => F13AppealHistoryEntry[]` |

内部：`pendingLabels`（`:19-21`，submitted/in-review 文案）。

## 3. 内部逻辑与关键流程

`buildF13AppealHistory`（`:23-79`）：

1. 索引 decisions/tasks/documents；`superseded` 集合（`amendsDecisionId` 收集，`:27-28`）。
2. 按 `createdAt`/`id` 排序（`:30-31`）；`original`（againstDecisionId）、`amendment`（**须 `amendsDecisionId===againstDecisionId`**，`:34`）、`reviewTask`、回执（`ReviewLocalAppealV3`/`WithdrawLocalAppealV3` 按 summary 匹配，`:36-39`）。
3. **warnings 四类**（`:42-45`）：原决定缺失/复审任务缺失/证据版本不存在/证据已被取代。
4. **outcomeLabel 五态**（`:47-61`）：withdrawn→「申诉已撤回，原决定未因此更改」（无回执加 warning）；maintain-original→「独立复审维持原决定」（无回执加 warning 需核对命令回执）；amend-original+overturned+amendment→「已追加更正决定」；submitted/in-review→「尚无最终复审结论」；**其它→「复审结论尚需人工核对」+「不能仅凭 upheld/overturned 判断」warning**（`:58-60`）。
5. 更正与失效关系不一致 warning（`:62-64`）；`originalSuperseded` 标记（`:76`）。

## 4. 调用者与调用链

消费方：申诉历史公开面板。出向：`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯投影（读 aggregate）；无写。

## 6. 分支、失败、取消与恢复

见第 3 节五态+四 warning；无抛错路径。

## 7. 权限与权威状态

**不推断法律含义**（`:1`、`:14`、`:60`）——旧歧义数据显式人工核对；`originalSuperseded` 如实标注失效关系。

## 8. 修改影响面

- outcomeLabel/warning 文案是公开披露口径。
- 回执 summary 匹配（`:37`、`:39`）与命令回执格式耦合。

## 9. 测试证据

`review-v3-f13-appeal-history.test.ts`（44 行，3 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、五态/四 warning | 已证实 | `:4-79` |
| 不推断法律含义红线 | 已证实 | `:1`、`:60` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 2 个导出 | `:4-79` | covered |
| 五态 outcome | `:47-61` | covered |
| warnings | `:42-64` | covered |

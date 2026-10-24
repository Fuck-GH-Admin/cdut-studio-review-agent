---
path: apps/electron/src/renderer/components/content-review/review-v3-f09-run-lifecycle.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7afa325da1f65162a928d8f3ab22ffc14f255a02
sha256: be6e6d9d9af709be1cdb47b4f9a33ec96e77cb491efe6bfe6e024346fcccb2f9
lines: 79
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f09-run-lifecycle.test.ts

## 1. 测试目标

**F09 真实运行状态与用户下一步**（`apps/electron/src/renderer/components/content-review/review-v3-f09-run-lifecycle.test.ts:19`）：running 无受理不显示已启动、受理后显示真实覆盖、部分完成提示 Main 决定、过期不承诺续跑、恢复建议不假装完成、不冒充学校通过、身份不一致禁操作、版本待核验不臆断。

## 2. 用例清单

1 describe / 8 test。夹具 `run(status)`/`state(status, phase)`（`:6-17`，覆盖 10/6/4）。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | running 无受理 | `title==='等待执行器受理'`、`canStart/canStop` false | `:20-25` |
| 2 | accepted 显示真实覆盖可停止 | `title==='Pi 正在审核'`、`coverage=={completed:6,planned:10,pending:4,percent:60}`、`canStop` true | `:27-33` |
| 3 | 部分完成+执行失败 | `startLabel==='继续未完成检查'`、`executionFailures===1`、`nextStep` 含「Main 核对」 | `:35-43` |
| 4 | 过期不承诺续跑 | `title==='原运行已过期'`、`startLabel==='按新输入审核'`、`nextStep` 含「旧决定不得自动沿用」 | `:45-50` |
| 5 | 取消/中断恢复建议 | `title` 分别「审核已停止」/「执行失败或中断」、失败 explanation 含「冷重启」、`startLabel==='重试审核'` | `:52-58` |
| 6 | 技术完成不冒充审批 | `title==='技术审核已结束'`、explanation 含「不代表业务审批通过」、`nextStep` 含「人工工作台」 | `:60-65` |
| 7 | 身份不一致禁操作 | `title==='运行身份待核验'`、`canStart/canStop` false | `:67-72` |
| 8 | 版本待核验不臆断 | `title==='输入版本待核验'`、`nextStep` 含「Main 检查」 | `:74-78` |

## 3. 真实断言

- `expect(view.coverage).toEqual({ completed: 6, planned: 10, pending: 4, percent: 60 })`（`:30`）。
- `expect(view.explanation).toContain('不代表业务审批通过')`（`:63`）。
- `expect(view.nextStep).toContain('旧决定不得自动沿用')`（`:49`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`awaiting-input`/`paused` 分支。
- 脆弱点：文案片段断言绑定披露口径。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例覆盖状态机关键面 | 已证实 | `:20-78` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 受理/覆盖 | 1-2 | `:20-33` | covered |
| 部分完成/过期 | 3-4 | `:35-50` | covered |
| 恢复/不冒充 | 5-6 | `:52-65` | covered |
| 身份/版本核验 | 7-8 | `:67-78` | covered |

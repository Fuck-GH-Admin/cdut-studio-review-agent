---
path: apps/electron/src/renderer/components/content-review/review-v3-t05-stage-actions.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d75043f315ef76b9807eb0f4880a4b3bfe187849
sha256: 3d3571c5179e00537d322d2436e9244722dbe9cf74047152febe05a905459c63
lines: 50
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t05-stage-actions.test.ts

## 1. 测试目标

**F11 可信阶段操作展示门禁**（`apps/electron/src/renderer/components/content-review/review-v3-t05-stage-actions.test.ts:13`）：完整 Main 能力+已指派任务才可调可信端口；能力缺失/旧形状关旧命令回退；非业务案卷/不匹配任务拒；Run 未完成仅 Main 允许补件；不合规展示阻断但允许有据拒绝；补件未核对不放行；**不凭 Run 自行推断允许**。

## 2. 用例清单

1 describe / 7 test。夹具 `capability`/`task`/`state(overrides)`（`:4-11`）。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 完整能力+指派→可信端口 | `{enabled:true, reasons:[]}` | `:14-16` |
| 2 | 能力缺失/旧形状/断连 | `capability:undefined`→false；`allowedActions:undefined`→reasons 含「动作的资格」；`connected:false`→false | `:18-22` |
| 3 | 非业务/不匹配任务 | `mode:'technical-pre-review'`→false；`assigneeRole:'teacher'`→false；`status:'completed'`→false | `:24-28` |
| 4 | Run 未完成仅补件 | 无 run+`stage-pass`→false；`return-for-supplement`→true；`final-reject`→false | `:30-35` |
| 5 | 不合规展示阻断但允许有据拒绝 | blockers 含「非合规」；`final-reject`→true | `:37-41` |
| 6 | 补件未核对不放行 | reasons 含「2 个补件请求」 | `:43-45` |
| 7 | 不凭 Run 自行推断 | `return-to-previous-stage`→false | `:47-49` |

## 3. 真实断言

- `expect(state()).toEqual({ enabled: true, reasons: [] })`（`:15`）。
- `expect(state({ capability: { ...capability, allowedActions: undefined } }).reasons.join()).toContain('动作的资格')`（`:20`）。
- `expect(state({ action: 'return-to-previous-stage' }).enabled).toBe(false)`（`:48`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`getT05StageActionState` 源实现（不在本批 scope）。
- 脆弱点：reasons 文案片段断言。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例覆盖门禁全分支 | 已证实 | `:14-49` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 门禁正例 | 1 | `:14-16` | covered |
| 能力/连接 | 2 | `:18-22` | covered |
| 案卷/任务 | 3 | `:24-28` | covered |
| Run/补件 | 4、6 | `:30-35`、`:43-45` | covered |
| 阻断/拒绝 | 5 | `:37-41` | covered |
| 不推断 | 7 | `:47-49` | covered |

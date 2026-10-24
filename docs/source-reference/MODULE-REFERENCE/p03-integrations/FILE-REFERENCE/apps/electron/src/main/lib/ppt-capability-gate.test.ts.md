---
path: apps/electron/src/main/lib/ppt-capability-gate.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d035b516d0c5df3d8bde46ed1ded17a056f85df6
sha256: 7293db9da2a7769e3821927c67b566d4928f1610587032406a3b769f3528b059
lines: 44
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/ppt-capability-gate.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

PPT 能力门五决策：普通会话 inactive；高置信意图激活；活动 Deck 续改保持激活；变量名含 pptx 不单独激活；显式退出优先关闭。

## 2. 用例清单

共 5 个 `test(`（`apps/electron/src/main/lib/ppt-capability-gate.test.ts:5,13,21,29,37`，describe `:4`）。

| # | 用例（行） | 输入 | 真实断言 |
| --- | --- | --- | --- |
| 1 | 普通会话（`:5`） | 检查 TS 类型错误 | `toMatchObject({decision:'inactive',active:false})` |
| 2 | 高置信意图（`:13`） | 制作 .pptx 组会汇报并导出 | `{decision:'activate',active:true}` |
| 3 | 续改保持激活（`:21`） | 修改第 3 页+打开预览（active+deck） | `{decision:'stay_active',active:true}` |
| 4 | 变量名不激活（`:29`） | 解释变量 `pptxExportOptions` | `{decision:'inactive',active:false}` |
| 5 | 显式退出优先（`:37`） | 退出 PPT 模式先不要继续 | `{decision:'deactivate',active:false}` |

## 3. 真实断言

逐条见上表（`:12,19,27,35,43`）。无 mock；纯函数。

## 4. 未覆盖与脆弱点

未覆盖：`deck_continuation`（无 active）分支、正则边界词。断言 `toMatchObject` 只验 decision/active（reason 未断言）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个用例 | 已证实 | `grep test(`；`:5-43` |
| 五决策语义 | 已证实 | `:12-43` |
| deck_continuation | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| inactive/activate/stay/deactivate | 1-5 | 5-43 | covered |
| deck_continuation | 无 | — | unknown |

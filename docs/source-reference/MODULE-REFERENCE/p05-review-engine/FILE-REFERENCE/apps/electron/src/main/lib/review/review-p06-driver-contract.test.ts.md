---
path: apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 644c336a2f50318c9ffb43f5cdf493956bafd15f
sha256: 562a534f45f0ef2a8710c1e723460ee03ea8dbf5b86a9073fed456f8ac48083b
lines: 59
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts

## 1. 测试目标

P06-S02 验收驱动合同的**静态与纯函数**验证（「不冒称实机」，`apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts:1-2`、`:17`）：①独立 CDP 回放脚本可被 Node 解析且不含凭据；②owner 归属/迁移判定纯函数；③provider 见证（witness）不把 ACK/空 assistant 冒充回复。**不执行** Electron/Pi/provider 实机测试（`:2`）。

## 2. 用例清单

1 describe / 6 test。夹具：`scripts/qa/review-background-p06-contract.mjs` 动态 import 的三函数（`roundOwnerId`/`verifyOwnerTransition`/`providerWitness`，`:8-12`）；合成 owners/grant（`:13-15`）。

| # | 名称 | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- | --- |
| 1 | Node 解析独立 CDP 回放脚本且不载凭据 | `node --check review-background-p06.mjs` + 源码字符串包含断言 | 不抛；含 `P06-S02-E01/E02`、`runTwice`、`p06-summary.json`、`waitProvider`、「真实界面停止收尾并可重新审核」 | `:18-28` |
| 2 | 同 owner update 与唯一新 owner restart 绑定通过 | `roundOwnerId` + `verifyOwnerTransition('update'/'restart')` | 均 `toBeTrue()` | `:30-35` |
| 3 | 旧 owner 在场但 update 绑新 owner 必须拒绝 | `verifyOwnerTransition('update','synthetic-old',next,…)` | 抛「未实际复用」 | `:37-40` |
| 4 | 多余 owner 不掩盖 restart 复用旧 owner | `verifyOwnerTransition('restart',…)` | 抛「未实际绑定」 | `:42-45` |
| 5 | 指派缺失/撤销/重复/跨案不产生归属证明 | `roundOwnerId` 四种非法输入 | 抛「唯一有效」/「本案审核 owner」 | `:47-52` |
| 6 | ACK/空 assistant/旧非 assistant 不冒充 provider 回复 | `providerWitness` 三种消息 | 前两者 `assistantReplies:0`；真 assistant+tool_use → `{assistantReplies:1, toolCalls:['review_read_documents']}` | `:54-58` |

## 3. 真实断言

- `expect(() => execFileSync('node', ['--check', path], …)).not.toThrow()`（`:20`）。
- `expect(() => contract.verifyOwnerTransition('update', 'synthetic-old', next, …)).toThrow('未实际复用')`（`:39`）。
- `expect(contract.providerWitness([{ type: 'assistant', message: {…} }]).assistantReplies).toBe(0)`（`:55`）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实 CDP 回放（明确不执行，`:2`）；provider 网络层；`--check` 只验语法不验运行。
- 脆弱点：源码包含断言（`:22-27`）与脚本文本耦合；`p06-contract.mjs` 的纯函数实现不在本批 scope。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言与合同函数语义对应 | 已证实 | `:18-58` |
| 明确不执行实机测试 | 已证实 | `:1-2` |
| 实机行为 | 未知 | NOT_RUN（本测试自身也不含） |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| CDP 脚本静态可解析 | 1 | `:18-28` | covered |
| `verifyOwnerTransition` 正/反 | 2-4 | `:30-45` | covered |
| `roundOwnerId` 非法输入 | 5 | `:47-52` | covered |
| `providerWitness` | 6 | `:54-58` | covered |

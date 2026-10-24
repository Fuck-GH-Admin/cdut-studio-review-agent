---
path: apps/electron/src/main/lib/pi-harness/pi-harness-store.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 589ab64b0f0392fafa56bb7db3c048c4ebc783bc
sha256: 9ed4462dd9a987cdb7de7565ed87193dc7f690db50a0d8c5e04bd0e1aa522d51
lines: 97
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/pi-harness-store.test.ts

## 1. 测试目标

`pi-harness-store.ts`：账本追加/归并、坏行诊断、跨会话拒、**fork 只带 settled 且 ID 重映射**、解析不抛。bun:test；临时 PROFER_CONFIG_DIR 真文件（`:13-18`），无 mock 库。

## 2. 用例清单

共 **5 个 `test(`**：追加+归并（`:40`）；坏行/版本 2/重复→诊断码序列（`:58`）；跨会话追加拒（`:69`）；fork settled-only+重映射（`:74`）；空/坏账本解析（`:93`）。

## 3. 真实断言

- `:52-55` goal policy 匹配、turn usage `{modelCalls:1,inputTokens:2,outputTokens:3,retries:0}`、`diagnostics` `toEqual([])`、文件含 goal_created。
- `:65-66` 有效状态保留 + 诊断码序列 `toEqual(['invalid_json','unsupported_version','duplicate_event'])`。
- `:71` `toThrow('会话 ID 不匹配')`。
- `:85-90` `copied` `toBe(4)`、目标仅 1 goal 且**不是** 'settled-goal'、state 'settled'+sessionId 'destination'、turnId `not.toBe('old-turn')`。
- `:94-95` 空串 events `toEqual([])`、'{' 诊断 `{code:'invalid_json', line:1}`。

## 4. 未覆盖与脆弱点

append 并发互斥（无锁设计）无断言；`loadPiHarnessSnapshot` 文件缺失分支经 `:85-90` 间接。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例/断言 | 已证实 | 全 97 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 用例 | §2/§3 | 40-96 | covered |

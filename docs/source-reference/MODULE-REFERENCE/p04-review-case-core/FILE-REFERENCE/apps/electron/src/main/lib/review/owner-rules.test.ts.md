---
path: apps/electron/src/main/lib/review/owner-rules.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 566ec8432dd2e83d744cdac536ff71ffdef2f01a
sha256: e3a237c4b235d0ba91d2dbccedb2553f24aa848a7ad10e89e01dffcabeb3247d
lines: 20
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/owner-rules.test.ts

## 1. 测试目标

`policy-store.compileOwnerRules`（`policy-store.ts:138-167`）的文本→结构化 `RuleSpec` 编译规则（文件头标注 G02/G10，:2）。被测单元**不在本批源文件清单**（`policy-store.ts` 属其他批次主责）；本篇只记录本测试文件的真实断言与夹具。

## 2. 用例清单

2 用例 / 1 describe（`负责人规则编译（G02/G10）`，:7）；无 I/O、纯函数直调、无夹具文件、无 mock。

| 用例 | 行 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 逐行规则含编号与严重度 | 8-15 | 三行文本：`[高] F1 材料要素齐全`/`F2 字段一致`/`[低] 第3条 预算合计一致`，policyId `policy-x`、version 1 | `compileOwnerRules(...)` | 独立 |
| 空行与空白忽略 | 17-19 | `'\n  \nF1 要素齐\n'` | `compileOwnerRules(...)` | 独立 |

## 3. 真实断言

- 用例 1（:10-14）：`rules` 长度 3；`rules[0]` `toMatchObject({ id:'F1', policyVersionId:'policy-x@1', targetScope:'case', confirmation:'confirmed', execution:'semantic' })`；`rules[1].id === 'F2'`（自带 F 编号优先于行号）；`rules[2].id === 'R3'`（`第3条` → `R3`）；`rules[0].requirement === '材料要素齐全'`（严重度前缀被剥离进 severity）。
- 用例 2（:18）：编译结果长度 1（空行/纯空白行被过滤）。

## 4. 未覆盖与脆弱点

- 未断言：`severity` 映射值（`高/中/低`→`high/medium/low`，`policy-store.ts:141`）、`priority=index+1`、`when/onFail/onUnknown/semanticOutputEnum` 等固定字段、`R{index+1}` 兜底 id（无编号行）、`[中]`/英文 `medium` 前缀、超长/多段文本。
- 脆弱点：断言只查 `toMatchObject` 子集，编译器若多写字段不会失败；`rules[0].requirement` 断言依赖正则把「编号+冒号」后文本当需求（`policy-store.ts:147`）。
- **NOT_RUN**：本轮未执行 bun test；无运行证据。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例/1 describe、断言行号如 §3 | 已证实 | 本文件 :7-19 逐行 |
| 被测为 `compileOwnerRules`（policy-store） | 已证实 | :5 import；`policy-store.ts:138` |
| 被测实现细节（正则/字段默认值） | 已证实（读过实现） | `policy-store.ts:138-167` |
| 测试在运行时是否通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| F 编号提取 / `第N条`→`RN` | §3 | 11-13 | covered |
| 严重度前缀剥离 | §3 | 14 | covered |
| 空行过滤 | §3 | 18 | covered |
| severity/priority/固定字段 | §4 | — | unknown（未断言） |
| `R{index+1}` 兜底 | §4 | — | unknown（未断言） |

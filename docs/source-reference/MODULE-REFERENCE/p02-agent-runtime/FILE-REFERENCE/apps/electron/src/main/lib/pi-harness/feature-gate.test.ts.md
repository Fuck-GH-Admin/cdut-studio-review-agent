---
path: apps/electron/src/main/lib/pi-harness/feature-gate.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c23f09422a3e3c28dd0ccd54437c54cc4e5ec6c2
sha256: 2696faf6e73fc1715d38c3e3876a1b1a69c7c7f11b5eccebafccb1ed3ad26c61
lines: 39
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/feature-gate.test.ts

## 1. 测试目标

`feature-gate.ts`：默认开/kill-switch/Pi-only。bun:test；纯函数直测，无 mock。

## 2. 用例清单

共 **5 个 `test(`**：缺省启用（`:5`）；`'0'`/`' 0 '` 关（`:9`）；非零值保持开（`:14`）；claude 不启动（`:21`）；pi 缺省/显式/关闭（`:34`）。

## 3. 真实断言

`:6` true；`:10-11` false×2；`:15-18` true×4（含空串）；`:29-31` claude 两次 undefined+`startCalls` `toBe(0)`；`:35-37` true/true/false。

## 4. 未覆盖与脆弱点

env 值域边界（如 `'0.0'`）无断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例/断言 | 已证实 | 全 39 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 用例 | §2/§3 | 5-38 | covered |

---
path: apps/electron/src/main/lib/agent-collaboration-utils.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9eb1c119c1354c395069c1f6c7010d80eecdae6d
sha256: 7ca999fca1f2e9878973eef9f47b6269d603c24173f3c4d2dcfb5e2bd23d9139
lines: 15
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-collaboration-utils.test.ts

## 1. 测试目标

验证 `apps/electron/src/main/lib/agent-collaboration-utils.ts` 的 `resolveDelegationPermissionMode`：无论父会话模式/请求模式为何，委派权限恒 `bypassPermissions`。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 12（动态生成：`modes` 3 值 × `[...modes, undefined]` 4 值的双重 for 循环内 `test(`，:7-13），1 个 describe（:6）。

- 设置：`modes = ['plan','auto','bypassPermissions']`（:4）。
- 动作：每个组合调 `resolveDelegationPermissionMode(parent, requested, 'pi')` 两次（:10-11）。
- 断言：两次均 `toBe('bypassPermissions')`（:10-11）。
- 依赖顺序：无（纯函数、无共享状态）。

注：`test` 名由模板串生成（:9 `委派始终使用完全自动权限 (${parent} / ${String(requested)})`）；第三参运行时恒传 `'pi'`，未覆盖其它 `AgentRuntime` 值（函数本就忽略该参数）。

## 3. 真实断言

- `:10`：`expect(resolveDelegationPermissionMode(parent, requested, 'pi')).toBe('bypassPermissions')`
- `:11`：同 :10 的重复调用（同一断言重复一次，无额外信息量）。

（断言仅 `toBe` 一种；12 用例共 24 次断言。）

## 4. 未覆盖与脆弱点

- 未覆盖：`buildRecoveredDelegationState`、`buildDelegationPrompt`、`buildDelegationTaskWithSharedContext`（无任何用例）；`resolveDelegationPermissionMode` 的返回类型收窄为字面量的编译期保证（仅运行时断言）。
- 脆弱点：重复断言（:10-11）冗余；动态生成的 12 用例在报告中呈现为 12 个 case，但实际覆盖矩阵就是 3×4 参数组合——参数再多也不增加分支（函数无分支）。
- mock/真实边界：纯函数直调，无 mock。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 用例（3×4 循环）与源码一致 | 已证实 | :4/:7-13 |
| 断言恒 `bypassPermissions` | 已证实 | :10-11 |
| 3 个构建函数无测试 | 已证实（否定） | 本文件全 15 行无其它 import；全冻结树 `*.test.ts` 引用 `agent-collaboration-utils` 仅本文件 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测符号/分支 | 用例 | 状态 |
| --- | --- | --- |
| `resolveDelegationPermissionMode`（无分支恒返回） | 12 | covered |
| `buildRecoveredDelegationState` | — | unknown |
| `buildDelegationPrompt` | — | unknown |
| `buildDelegationTaskWithSharedContext` | — | unknown |

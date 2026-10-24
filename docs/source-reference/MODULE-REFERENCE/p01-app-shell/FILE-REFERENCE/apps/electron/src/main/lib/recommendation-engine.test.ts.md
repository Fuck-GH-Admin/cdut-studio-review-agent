---
path: apps/electron/src/main/lib/recommendation-engine.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f68f1bb5a79adb5eb2e1af4c392df6e907ac9e01
sha256: dc0563333f41bd2a8a628a685aa6539e840217fedafe1782698f4d64aa062769
lines: 32
kind: test
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/recommendation-engine.test.ts

## 1. 测试目标

验证 `refreshAutomationRecommendations`（`recommendation-engine.ts`）两类建议的触发条件：①14 天内成功 3 次生成 schedule 建议；②最近 3 次连续失败生成 maintenance 建议且 `once` 类型不生成。不运行测试，只读断言（NOT_RUN）。

## 2. 用例清单

用例数与源码一致：`test(` 2 个（`describe` 1 个；`it(` 0 个）。夹具 `automation()`（`:6-13`）：每日任务默认值+`runHistory` 可覆盖。每用例先 `resetRecommendationCache()`（`:17,:25`）清 manager 内存缓存。

| # | 用例 | 行 | 设置/动作 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | 成功重复运行三次生成建议 | 16-22 | 3 条 success（各距今 1/2/3 天） | 1 条、kind='schedule' |
| 2 | 连续失败三次生成维护建议，once 不生成 | 24-31 | 1 个 daily + 1 个 once，均 3 条 error | 1 条、kind='maintenance' |

## 3. 真实断言

- 用例 1（`:20-21`）：`expect(result).toHaveLength(1)`；`expect(result[0]?.kind).toBe('schedule')`。
- 用例 2（`:29-30`）：`expect(result).toHaveLength(1)`；`expect(result[0]?.kind).toBe('maintenance')`——once 自动化的 3 条 error 不产生第二条（`refreshAutomationRecommendations` 内 `scheduleType==='once'` 跳过）。

## 4. 未覆盖与脆弱点

- 未覆盖：dismissed 去重（需预置 manager 状态）、confidence 数值、snoozed、14 天窗口边界、混合成功+失败、`!active` 跳过。
- 脆弱点：用例 2 的“once 不生成”只由总条数=1 间接断言（若 daily 也不生成则同样为 0→失败，方向安全）；`resetRecommendationCache` 依赖 manager 模块级缓存的可重置性。
- mock 边界：无 mock；`recommendation-manager` 是真实实现（写真实 JSON 文件——经 `getRecommendationsPath()`，测试环境路径未在本文件设置，标事实：测试直连真实 manager，未 mock）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例与断言行号 | 已证实 | `:6-31` 逐行读 |
| once 跳过由总条数间接断言 | 已证实 | `:28-30` |
| 直连真实 manager（无 mock） | 已证实 | `:4` 导入 + 全文无 mock API |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行） |
| 测试写盘影响 | 未知 | manager 落盘路径在 config-paths（非本批） |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| schedule 触发 | 1 | covered |
| maintenance 触发 + once 跳过 | 2 | covered |
| dismissed 去重/confidence/窗口边界 | - | unknown（未覆盖） |

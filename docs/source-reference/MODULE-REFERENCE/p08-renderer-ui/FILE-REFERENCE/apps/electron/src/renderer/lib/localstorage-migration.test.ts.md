---
path: apps/electron/src/renderer/lib/localstorage-migration.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 173682d11043b9ed22b8aa015b8464a50b50ced8
sha256: 1f37e3e90922827df55365856cf220e8af5d84071f9edb2599ff52fdc60c15c6
lines: 53
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/localstorage-migration.test.ts

## 1. 测试目标

直接测试 `localstorage-migration.ts` 的 `migrateLocalStorageKeys`（1 个 describe `:18`）：key 迁移正确性+数据安全。4 个 `test(`。技巧（`:5-7` 注释）：**查询参数打破模块缓存**模拟每次独立初态（重置模块级 migrated 标志）。

## 2. 用例清单

| # | 行 | 真实断言 |
| --- | --- | --- |
| 1 | `:19-27` | `proma-browser-split-ratio`='0.6'→`profer-browser-split-ratio toBe('0.6')` |
| 2 | `:29-36` | `proma-preview-mode-pref`='"split"'→新键同值 |
| 3 | `:38-45` | file-panel 列表键→新键同值 |
| 4 | `:47-52` | 无旧 key→`has('profer-browser-split-ratio') toBe(false)`（数据安全） |

## 3. 真实断言

`toBe`/`toBe(false)`。自建 Map mock store+globalThis.localStorage 注入；fresh import（`?t=` 时间戳）。

## 4. 未覆盖

- KEY_MAP 其余 19 键；新旧并存跳过分支；localStorage 抛错降级。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 `test(`、断言如 §2 | 已证实 | 文件全读（53 行） |
| 数据安全断言 | 已证实 | 用例 4 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 键迁移 | §2 用例 1-3 | `:19-45` | covered |
| 无旧不写 | §2 用例 4 | `:47-52` | covered |
| §4 边缘 | — | — | unknown |

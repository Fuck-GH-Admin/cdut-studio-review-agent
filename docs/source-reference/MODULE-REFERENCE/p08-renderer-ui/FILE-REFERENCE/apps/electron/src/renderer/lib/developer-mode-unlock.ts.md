---
path: apps/electron/src/renderer/lib/developer-mode-unlock.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b53292de8ff450a6e43761d1a3db4843d261c723
sha256: a39f3a9cbf728432a713b79934767be726a298b67e14c0715cd887496a6da0cf
lines: 44
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/developer-mode-unlock.ts

## 1. 结论与边界

版本号连击解锁开发者模式的**纯状态机**（44 行）：5 连击（间隔 ≤1.5s）解锁，触发后重置防重复（`:22`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `DEVELOPER_MODE_UNLOCK_CLICK_COUNT=5`/`_MAX_GAP_MS=1500` | `:3`/`:4` | 阈值常量 |
| `DeveloperModeUnlockClickState`/`Result` | `:6-9`/`:11-14` | `{count, lastClickedAt}`/`{state, unlocked}` |
| `INITIAL_DEVELOPER_MODE_UNLOCK_CLICK_STATE` | `:16-19` | 初态 |
| `advanceDeveloperModeUnlockClick` | `:24-44` | 纯函数：间隔 ≤1500ms 且不回拨才续序；≥5 解锁并复位，否则累加 |

## 3. 内部逻辑与关键流程

单函数状态机：`continuesSequence`（lastClickedAt 非空+时间不回拨+间隔达标）→count 续/重 1→达标解锁复位。

## 4. 调用者与调用链

版本号点击区（设置/关于面板）；被 `developer-mode-unlock.test.ts`（3 用例）覆盖。纯函数无出向。

## 5. 数据 I/O、读写与副作用

纯函数；无 IO。

## 6. 分支、失败、取消与恢复

时间回拨→序列重启（测试 `:30-36` 锁定）；超时→重计。

## 7. 权限与权威状态

开发者模式解锁语义在调用方（本层只出 unlocked 信号）。

## 8. 修改影响面

改阈值影响解锁手感；测试 3 用例锁定行为。

## 9. 测试证据

`developer-mode-unlock.test.ts`（同批，3 个 `test(`）：5 连击仅第 5 次解锁、超时重计、时间回拨重序。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件状态机 | 已证实 | 44 行全读 |
| 行为锁定 | 已证实 | 测试 3 用例 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9。

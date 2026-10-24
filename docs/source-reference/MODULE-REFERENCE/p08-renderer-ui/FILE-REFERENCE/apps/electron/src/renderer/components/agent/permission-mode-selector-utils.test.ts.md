---
path: apps/electron/src/renderer/components/agent/permission-mode-selector-utils.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3521d6b0802e2de589bd8951426bb7a15ee0f187
sha256: 940931adec096d28aff4ec9dbca8ad7f9d5507b1521c59188c2272bbea26490f
lines: 67
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/permission-mode-selector-utils.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

权限模式预设上限门禁（头注 :8-13「验收 C-4 的代码级证据」）：渲染层是唯一防线（IPC 不做上限收敛）。

## 2. 用例清单

8 用例 / 1 describe（`permission-mode-selector-utils` :14）。纯函数+共享常量。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 菜单顺序双端同源 | 17-22 | 全 cap 下模式序列恒=`PROFER_PERMISSION_MODE_ORDER` |
| 2 | bypass 上限全可选 | 24-27 | `[true,true,true]` |
| 3 | auto 上限不可放宽 | 29-33 | bypass 拒、auto/plan 可 |
| 4 | plan 上限仅 plan 可（C-4 核心） | 35-42 | auto/bypass 全 disabled |
| 5 | 可选不被收紧 | 44-51 | 全 cap×entry：resolve=entry.mode |
| 6 | 无 override 显 cap | 53-57 | plan/plan、auto/auto（不回落全局默认） |
| 7 | override 按上限收敛 | 59-66 | 四组收敛断言 |
| 8 | 限制文案 | 68-74 | 含 cap label 全句 |

## 3. 真实断言

如 §2 表（逐条读自 :17-74）。

## 4. 未覆盖与脆弱点

- 未覆盖：组件层接线（Radix/Jotai 版本行为）。
- 脆弱点：无。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例断言如 §2 | 已证实 | 本文件逐行 |
| C-4 门禁被固定 | 已证实 | 用例 3-5 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| canSelect/resolve/buildMenu | §2 | covered |
| describeRestriction | §2 | covered |
| 组件接线 | §4 | unknown（未测） |

---
path: apps/electron/src/renderer/components/agent/preset-selector-utils.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 98ed04340e4a04ed3a4e0d74f561b3f0c9a064fb
sha256: c7232aa215b700288a55dfd4b2de0b82758b7030eb52c52b69e9b49b82b5cf41
lines: 38
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/preset-selector-utils.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

预设选择器稳定引用：工作区切换携带 scope/slug/version；元预设与同 ID 工作区预设不误判同一选择。

## 2. 用例清单

2 用例 / 1 describe（`预设选择器稳定引用` :18）。夹具 `preset()`（:8-16）；纯函数。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 工作区切换携带全字段 | 19-28 | `{presetId,presetScope:'workspace',workspaceSlug,presetVersion}` |
| 2 | 同 ID 不同 scope 不互认 | 30-38 | builtin 匹配自身、workspace 不匹配 builtin 引用 |

## 3. 真实断言

如 §2 表（逐条读自 :19-38）。

## 4. 未覆盖与脆弱点

- 未覆盖：缺省 scope 推断（isBuiltin 分支）。
- 脆弱点：无。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例断言如 §2 | 已证实 | 本文件逐行 |
| 引用稳定性被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| `referenceForSelectablePreset` | §2 | covered |
| `selectablePresetMatchesReference` | §2 | covered |
| `getSelectablePresetScope` 缺省 | §4 | unknown（未测） |

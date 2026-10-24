---
path: apps/electron/src/renderer/components/agent/preset-selector-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 388e8c5c41c46ce8ae5217100247c54a9fefaada
sha256: 22c5861c5327a32b2290ea609cb0e4cf574fb91e010e4f674295ee5c0f2e38f1
lines: 26
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/preset-selector-utils.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

预设选择器稳定引用（26 行）：preset→`PresetReference`（presetId+scope+可选 workspaceSlug/presetVersion）；匹配按 id+scope（同 ID 的元预设与工作区预设不混）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getSelectablePresetScope` | fn | 4-6 | `preset.scope ?? (isBuiltin ? 'builtin-meta' : 'workspace')` |
| `referenceForSelectablePreset` | fn | 8-17 | 构造引用（workspace 作用域补 workspaceSlug） |
| `selectablePresetMatchesReference` | fn | 19-26 | id+scope 全等 |

## 3. 内部逻辑与关键流程

引用构造：scope 判定→workspace 作用域且有 slug 时并入 `workspaceSlug`→有 version 并入 `presetVersion`；匹配布尔比较 id 与 scope（不比 version）。

## 4. 调用者与调用链

入向：预设选择器组件（同目录/上级组件，全树 grep）。出向：`@profer/shared` 类型（:1）。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

无 throw；undefined reference → false。

## 7. 权限与权威状态

- 引用稳定性权威：scope 参与匹配（元预设/工作区预设同 ID 不误判，测试锁定）。无 sender/role 检查。

## 8. 修改影响面

工作区岗位切换的预设选择。同测：`preset-selector-utils.test.ts`（2 用例）。

## 9. 测试证据

直接测试 `preset-selector-utils.test.ts`（2 用例 / 1 describe；纯函数；NOT_RUN）：
1. `:19-28` 工作区预设引用含 scope/slug/version 全字段。
2. `:30-38` 元预设与同 ID 工作区预设不互认（builtin true/workspace false）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出/行号 | 已证实 | 逐行核对 |
| 引用/匹配语义 | 已证实 | 测试 :19-38 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `referenceForSelectablePreset` | §3/§9 | 8-17 | covered |
| `selectablePresetMatchesReference` | §3/§9 | 19-26 | covered |
| `getSelectablePresetScope` 缺省分支 | §2 | 4-6 | covered（间接） |

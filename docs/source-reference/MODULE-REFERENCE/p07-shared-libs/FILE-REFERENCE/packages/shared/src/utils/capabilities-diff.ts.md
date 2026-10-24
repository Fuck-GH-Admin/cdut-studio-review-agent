---
path: packages/shared/src/utils/capabilities-diff.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6ef1af64ca3a4d2892a50452f9447ba0d214555f
sha256: 91318a48f9b0c029df92172b52e440e442f611c5a98f7f87c4f93f77c3cba16b
lines: 69
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/capabilities-diff.ts

## 1. 结论与边界

比较新旧 `WorkspaceCapabilities` 输出**能力变化列表**（`packages/shared/src/utils/capabilities-diff.ts:19-24`）：MCP 服务器按 `name`、Skills 按 `slug` 做集合差异（added/removed）+ enabled 状态翻转。69 行薄模块：1 interface + 1 函数。

边界：纯比较不写状态；不校验输入形状（`prev?.mcpServers ?? []` 容忍缺失，`:32,50`）；变化只含 type+name（不含 enabled 值本身）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CapabilityChange` | interface | 4-17 | `{type: 'mcp_added'\|'mcp_removed'\|'mcp_enabled'\|'mcp_disabled'\|'skill_added'\|'skill_removed'\|'skill_enabled'\|'skill_disabled'; name: string}` | 8 值 type |
| `diffCapabilities` | function | 25-69 | `(prev, next: WorkspaceCapabilities) => CapabilityChange[]` | 唯一函数 |

## 3. 内部逻辑与关键流程

`diffCapabilities`（`:25-69`）两段对称：

1. MCP（`:32-47`）：双 Map（键 `s.name`）；遍历 next——无旧项 → `mcp_added`、enabled 翻转 → `mcp_enabled`/`mcp_disabled`；遍历 prev 键——无新项 → `mcp_removed`。
2. Skills（`:50-66`）：双 Map（键 `s.slug`）；同上，但 **`name` 字段取 `skill.name`（显示名）而非 slug**（`:56,58,64`）；`skill_removed` 回查 `prevSkillMap.get(slug)!`（`:63`）。

顺序：先 MCP 后 Skills、先 added/changed 后 removed；返回追加序数组。

## 4. 调用者与调用链

出向：类型 `../types/agent`（WorkspaceCapabilities，`:1`）。入向（检索=符号名+模块名，全冻结树）：`apps/electron/src/renderer/main.tsx:114,376`（`diffCapabilities`，唯一产品调用）；`apps/electron/src/renderer/lib/capabilities-toast.ts:2,5,22`（`CapabilityChange` 类型消费）；barrel `index.ts:10-11`。产品入口仅 renderer。直接测试 `capabilities-diff.test.ts`（本批，11 test）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数，不写任何状态。

## 6. 分支、失败、取消与恢复

无异常路径（`prev/next` 可为 undefined 容忍）；`:63` 非空断言由循环前提保证（slug 来自 prevSkillMap）。无异步/取消。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

type 枚举/输出形状是能力变化通知的展示契约（caller 见 §10）；`skill_*` 用显示名做 `name`（同名 skill 不可区分，见 §10）。

## 9. 测试证据

直接测试 `packages/shared/src/utils/capabilities-diff.test.ts`（本批，115 行；断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| MCP 键=name、Skill 键=slug 的不对称标识 | 已证实 | `:32-33,50-51` |
| skill 变化 `name` 取显示名（同名不可区分） | 已证实 | `:56,58,64` |
| 重复 name/slug 被 Map 静默折叠 | 已证实（Map 语义） | `:32-33,50-51` |
| 输入缺失容忍 | 已证实 | `:32,50` `?? []` |
| 生产 caller | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `CapabilityChange` | §2 | 4-17 | covered |
| MCP 段四分支 | §3 | 32-47 | covered |
| Skills 段四分支 | §3 | 50-66 | covered |
| Map 折叠边界 | §10 | 32,50 | covered（语义级） |

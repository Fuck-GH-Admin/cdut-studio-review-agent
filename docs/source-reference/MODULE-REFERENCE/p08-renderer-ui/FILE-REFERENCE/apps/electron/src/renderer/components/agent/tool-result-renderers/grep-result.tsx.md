---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/grep-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8dc2846b7f92d485f38a8c6bede1c26759524e40
sha256: 71791a8dc6cc3ce9ca577e03007ab34dd442ba04dfd2f92809866cdc10cac5d5
lines: 162
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/grep-result.tsx

## 1. 结论与边界

Grep 工具结果渲染器（162 行）：解析 grep 输出（`文件路径:行号:内容`）按文件分组、匹配词高亮（`:3-5`）。错误态红底 `<pre>`；解析失败 fallback 纯文本折叠。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `GrepResultRenderer` | `:83-162` | `(result, isError, input)`；pattern 取 `input.pattern`（`:84`）；分组渲染经 `limitGrepGroupsForPreview` 收敛 |

内部：`parseGrepOutput:32-59`（正则 `^(.+?):(\d+)[:-](.*)$` 解析+Map 按文件分组；空/无匹配→null）、`escapeRegExp:62-64`（**防 ReDoS** 注释 `:61`）、`highlightPattern:67-81`（转义后 `gi` 正则 split+`<mark>` 高亮，异常回退原文）。

## 3. 内部逻辑与关键流程

解析→null fallback 纯文本折叠（`:97-108`）→分组渲染（统计条"X 个匹配 Y 个文件" `:119-121`、文件头、行号列、高亮内容、hidden 提示"还有 X 条匹配，展开后可见" `:147-151`）→外包 `CollapsibleResult`（renderContent 收 collapsed 传 `limitGrepGroupsForPreview` `:112-114`）。

## 4. 调用者与调用链

`index.tsx`（Grep 分支 `:43`）；出向 `./collapsible-result`、`./grep-preview`（收敛）、`@/components/file-browser`（FileTypeIcon）、`@/lib/utils`（cn）。

## 5. 数据 I/O、读写与副作用

纯渲染；无 IO。

## 6. 分支、失败、取消与恢复

isError→红底 pre；解析 null→纯文本折叠兜底；highlightPattern try/catch 回退原文。

## 7. 权限与权威状态

- **ReDoS 防线**（`:61-64`）：用户 pattern 先转义再入正则。
- 折叠渲染量经 grep-preview 收敛（200 上界）。

## 8. 修改影响面

改解析正则影响 grep 输出兼容；高亮逻辑影响 XSS 面（React 转义文本，mark 仅包装）。

## 9. 测试证据

无直接测试（grep-preview.test 测收敛不测本组件）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件解析/高亮/收敛接线 | 已证实 | 162 行全读 |
| ReDoS 防线 | 已证实 | `:61-64` |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9、实效 unknown。

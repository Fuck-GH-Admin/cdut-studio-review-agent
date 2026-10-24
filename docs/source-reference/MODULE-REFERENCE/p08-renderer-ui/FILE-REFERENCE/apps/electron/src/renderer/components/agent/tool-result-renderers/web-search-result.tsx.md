---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/web-search-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e718ddaa2eabb0356249d25447d8b4a60180fb0c
sha256: 544e883e4b8217e75b691e44e073fd58af44b34f17022f638dbf0af772614814
lines: 114
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/web-search-result.tsx

## 1. 结论与边界

WebSearch 工具结果渲染器（114 行）：搜索结果卡片（标题/URL/摘要，`:2`）；解析支持多种常见格式（`:20`）：JSON 数组→文本段落两路。解析失败 fallback 纯文本折叠。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `WebSearchResultRenderer` | `:62-114` | `(result, isError)`：错误 pre→`parseSearchResults`→null fallback 纯文本折叠→卡片列表（Globe 图标+标题截断+URL 主色 mono+摘要 line-clamp-2） |

内部：`parseSearchResults:21-60`：JSON 数组（`title||url` 过滤、`url??link`、`snippet??description??content` 归一 `:28-32`）→文本块解析（空行分块、URL 行/标题行识别、标题去序号/星号、摘要拼接截 200 `:39-57`）→非空才返回。

## 3. 内部逻辑与关键流程

双路解析（JSON 优先→文本）→卡片渲染。纯渲染 useMemo。

## 4. 调用者与调用链

`index.tsx`（WebSearch 分支 `:46-47`）；出向 `lucide-react`（Globe）、`./collapsible-result`。

## 5. 数据 I/O、读写与副作用

纯渲染；无 IO。

## 6. 分支、失败、取消与恢复

isError→pre；JSON try/catch；解析 null→纯文本折叠兜底（`:74-85`）。

## 7. 权限与权威状态

URL/标题以 React 文本渲染（无 dangerouslySetInnerHTML）；摘要截 200 防爆卡。

## 8. 修改影响面

改解析归一影响搜索结果可读性；fallback 保证不白屏。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件双路解析/卡片渲染 | 已证实 | 114 行全读 |
| 各搜索供应商实际输出格式 | 未知 | 不在冻结树 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；格式兼容/实效 unknown。

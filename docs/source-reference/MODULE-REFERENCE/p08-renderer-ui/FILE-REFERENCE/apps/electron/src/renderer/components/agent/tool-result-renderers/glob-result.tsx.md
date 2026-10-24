---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/glob-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 352977d0063aa7c4776d2d1f258d4c2bf60a72f9
sha256: 1889a83648edaf942f7a5e95d2adaed368e0aba25da6096ac63c33778c3ac930
lines: 53
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/glob-result.tsx

## 1. 结论与边界

Glob 工具结果渲染器（53 行）：紧凑文件列表——每文件一行（FileTypeIcon+路径截断），统计"X 个文件"（`:2`）。错误态红底 pre。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `GlobResultRenderer` | `:14-53` | `(result, isError)`：`files` useMemo 按行拆分过滤（`:23`）；`renderList:25-42` 逐行渲染；外包 `CollapsibleResult`（`previewLines={20}`、`revealStep={50}` `:47-49`） |

## 3. 内部逻辑与关键流程

错误→pre；否则 CollapsibleResult+自定义 renderList（文件数条+行列表）。`revealStep=50` 渐进展开（行结构渲染器按步长递进，`:48` 注释）。

## 4. 调用者与调用链

`index.tsx`（Glob 分支 `:44-45`）；出向 `./collapsible-result`、`@/components/file-browser`（FileTypeIcon）。

## 5. 数据 I/O、读写与副作用

纯渲染；无 IO。

## 6. 分支、失败、取消与恢复

isError→pre；空行过滤。

## 7. 权限与权威状态

`revealStep=50` 防一次性建大量 DOM（collapsible-result `:41-47` 契约）。

## 8. 修改影响面

改列表渲染影响大目录展示性能；`revealStep`/`previewLines` 改动影响渐进体验与首屏 DOM 量；FileTypeIcon 依赖 file-browser 组件契约。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 53 行全读 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。

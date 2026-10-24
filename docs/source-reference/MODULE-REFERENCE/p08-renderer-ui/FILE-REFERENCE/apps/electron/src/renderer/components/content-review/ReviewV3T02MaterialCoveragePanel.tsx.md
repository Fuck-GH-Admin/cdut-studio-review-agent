---
path: apps/electron/src/renderer/components/content-review/ReviewV3T02MaterialCoveragePanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 79d071c0cb5ff96f35cefb1bb6f17d00bdf17ca3
sha256: 0224761375b6e58def22d6592d4dd95e013f31d9fc7d9eb6124e160eaed13d04
lines: 101
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T02MaterialCoveragePanel.tsx

## 1. 结论与边界

**T02 只读材料覆盖 UI**（`:1-5` 注释）：数据由**经鉴权的 Main 读取**供给，**绝不用 Renderer 路径或自造来源 ID**；放置由 T10/L 决定。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T02MaterialCoveragePanel` | function（export） | `:76-101` | `({sources})`；**同名候选也逐条列出**（`:75`） |

内部：`STATUS` 3 文案（`:11-15`）、`locationOf`（表格单元格/来源块+解析页 `:16-19`）、`SourceRow`（`:20-73`）。

## 3. 内部逻辑与关键流程

- 汇总条：份数/parsed/partial/failed/图片待核验计数（`:79-90`）。
- `SourceRow`（details 折叠）：文件名+状态、块数/工作表数/待核验图/版本（`:29-34`）；展开→parseError 范围说明（`:37-41`）、**原件 SHA-256**+「暂存预览，不代表已形成正式审核来源或完成视觉核验」（`:42-45`）；块列表（表格定位/`requiresVisualInspection` 标注 `:53-55`）；空块→「原件仍登记在清单中」（`:47`）；分页 +50（`:61-69`）。

## 4. 调用者与调用链

入向：`ReviewV3T02CoverageSection`（同批）。出向：`../../../main/lib/review/review-v3-t02-staged-source-preview`（类型 `:7-9`）、react。

## 5. 数据 I/O、读写与副作用

纯渲染；折叠/分页本地 state。

## 6. 分支、失败、取消与恢复

空列表/空块/分页分支。不适用。

## 7. 权限与权威状态

红线：Main 供数、Renderer 零自造（`:2-3`）；暂存预览定位（`:44`）。

## 8. 修改影响面

改面板 → T02 暂存来源核对 UX。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T02MaterialCoveragePanel` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+3 内部+展示全链 | 已证实 | 逐行读 `:1-101` |
| Main 供数实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+SourceRow | §2/§3 | `:11-101` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

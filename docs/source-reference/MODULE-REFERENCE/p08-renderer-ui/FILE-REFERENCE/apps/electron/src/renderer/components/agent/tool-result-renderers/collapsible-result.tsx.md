---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/collapsible-result.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 893326b3fea92b7e6325071bd3fc5d7ead925cfb
sha256: 928c89dc0b9605f2683fa5f6a98a627f4f596147bdaa6d260c7eab8645acf852
lines: 152
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/collapsible-result.tsx

## 1. 结论与边界

可折叠长内容**包装器**（152 行）：替代"硬截断 2000 字符"旧方案——短内容直显；长内容默认折叠（前 N 行且不超字符上界+长度指示器）；展开两档（步长推进/全部展开）（`:3-8`）。设计约束（`:9-14`）：折叠判定与预览切片同取 `sliceResultWindow`（单一计算结果防不一致）；**渐进展开仅对行结构渲染器有意义**（Markdown/Grep 分组按行切片会破坏结构，必须关闭）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `CollapsibleResultProps` | `:22-57` | `content`；`threshold=3000`（字符上界）；`previewLines=15`；`foldByLines=true`（false=只按字符折叠，适用自带滚动容器的渲染器 `:34-39`）；`revealStep=0`（0=只提供全展开 `:41-47`）；`renderContent(text, collapsed)`（第二参指示片段，供结构化渲染器自收敛 `:49-53`）；`className` |
| `CollapsibleResult` | `:78-152` | 状态机：`revealedLines`/`fullyExpanded` → `sliceResultWindow` → 渲染+控制条（再显示 N 行/全部展开(还剩 X)/收起/进度） |

内部：`CollapseControl:65-76`（统一按钮）。

## 3. 内部逻辑与关键流程

`sliceResultWindow`（`./collapsible-preview`）计算 `resultWindow{text, collapsed, truncated}`；`collapse:101`（复位）、`revealMore:106`（+revealStep）、`expandAll:110`（∞ 行）；`canRevealMore:113`（仅 foldByLines 且 canRevealByStep）；`progress:117`（`describeRevealProgress` 报"还剩"而非总量 `:116`）。

## 4. 调用者与调用链

11 个兄弟渲染器（grep/glob/web-*/default/read 等）经 `index.tsx:59` 转出口；出向 `./collapsible-preview`（三纯函数）。

## 5. 数据 I/O、读写与副作用

纯渲染+useState；无 IO。

## 6. 分支、失败、取消与恢复

`safeContent=content ?? ''`（`:87`）；折叠/截断双维度（collapsed=该不该折、truncated=还剩多少）。

## 7. 权限与权威状态

- **单一计算契约**（`:9-10`）：折叠判定/切片/剩余量同源（sliceResultWindow）。
- **foldByLines=false 防双重滚动**（`:34-39`，default-result `:97-99` 注释呼应）。
- **revealStep 行结构限定**（`:41-47`）。

## 8. 修改影响面

改折叠语义影响全部工具结果展示；`sliceResultWindow` 口径改动需同步 collapsible-preview 测试。

## 9. 测试证据

无直接测试（`collapsible-preview.test.ts` 测底层切片函数不测本组件——见该手册）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 props 契约/状态机/三条红线注释 | 已证实 | 152 行全读 |
| 切片函数行为 | 已证实 | collapsible-preview 手册（同批） |
| 组件交互实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9、实效 unknown。

---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/collapsible-preview.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 56501ed46cb29901d053d47ee23dc4258c1be676
sha256: 09e4d71f9e3714358f1c8a2b9a8fe9f029621f63a4655d4f4915dc81b8b8bfe8
lines: 194
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/collapsible-preview.ts

## 1. 结论与边界

工具结果折叠预览**纯逻辑**（194 行，无 import/无 DOM，`:1-12`）：折叠判定与预览切片必须出自同一次计算（分算会让 minified JSON/单行 heredoc"判折叠却返回全文"）；预览受**双维度**约束（字符+行，任一超限即折）；初始折叠先取前 previewLines 行再按 maxChars 封顶；用户展开后只按行推进不再字符封顶。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ResultPreviewOptions` | `:14-27` | `maxChars`/`previewLines`/`foldByLines?`（默认 true；false=纯字符轴，适用自带滚动容器 `:19-26`） |
| `ResultPreview` | `:29-34` | `{text, collapsed}` |
| `ResultWindowOptions` | `:36-44` | +`revealedLines`（∞=全展开；≤previewLines=初始态；>previewLines=用户展开只受行约束 `:37-43`） |
| `ResultWindow` | `:46-55` | +`truncated`（=renderContent 第二参 `:47-48`）/`hasMoreLines`/`visibleLines`/`totalLines` |
| `sliceResultWindow` | `:74-…` | 核心窗口计算（状态机见 §3） |
| `canRevealByStep` | `:135-138` | `revealStep>0` 且剩余**严格大于**步长（恰等→并入全部展开 `:130-134`） |
| `RevealProgress` | `:141-149` | `{revealed,total,remaining,unit:'行'\|'字符'}` |
| `describeRevealProgress` | `:161-177` | 进度描述（单行超长改字符度量 `:155-159`） |
| `sliceResultPreview` | `:185-194` | 两态简化入口（=revealedLines:previewLines 的 sliceResultWindow） |

内部：`isHighSurrogate:58`、`sliceAtBoundary:63-64`（代理对边界回退防 U+FFFD）。

## 3. 内部逻辑与关键流程

`sliceResultWindow` 三分支：①不折叠（`:84-95`）；②foldByLines=false（`:100-110`，**必须先 return** `:97-99` 防"全部展开没反应"）：expanded= revealedLines>previewLines，text=全文或字符封顶；③foldByLines=true 渐进（`:112-126`）：revealed 钳制、initialPreview= revealedLines≤previewLines、字符封顶**仅作用于初始预览**（`:117`）、truncated= initialPreview||hasMoreLines。CRLF 归一（`:71-72`：按 `\r?\n` 切 `\n` 连，防 `\r` 多空行）。

## 4. 调用者与调用链

`collapsible-result.tsx`（唯一生产消费方，`:20` import 三函数）；`collapsible-preview.test.ts`（32 用例）。

## 5. 数据 I/O、读写与副作用

纯函数；无 IO。

## 6. 分支、失败、取消与恢复

`content??''`（`:78`）、maxChars 负值钳 0（`:79`）、revealedLines 负钳 0（`:112`）；代理对安全截断。

## 7. 权限与权威状态

- **单次计算契约**（`:9-10`）：判定/切片/剩余同源。
- 字符封顶仅初始预览（`:115` 注释：展开后突破上界拿全文）。
- `truncated` 是"是否片段"的可靠信号（矛盾③：collapsed 注释微瑕）。

## 8. 修改影响面

改口径影响全部折叠展示与进度文案；collapsible-result/32 测试联动。

## 9. 测试证据

`collapsible-preview.test.ts`（同批，**32 个 `test(`** 5 组：预览 8/窗口 9/递进按钮 5/进度 4/foldByLines=false 6）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+原始字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全导出/状态机/CRLF/代理对契约 | 已证实 | 194 行全读（字节核对） |
| **②** visibleLines 与实际渲染行数在 `0≤revealedLines<previewLines` 区间不一致（返回 revealed 但渲染 previewLines 行）——生产调用方不可达（起点=previewLines 只增），潜伏不一致照实 | 已证实 | `:112-124` vs `:51` 注释 |
| **③** `collapsed` 注释"text 只是片段"在 foldByLines=false 展开分支不成立（truncated 才可靠） | 已证实 | `:32-33` vs `:103-105` |
| **④** `sliceResultPreview` 生产零引用（仅测试用） | 已证实 | grep |
| 折叠语义实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 9 导出+状态机 | §2/§3 | covered |
| 契约/红线 | §7 | covered |
| 32 测试/3 矛盾 | §9/§10 | covered |

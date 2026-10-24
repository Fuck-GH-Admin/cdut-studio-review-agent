---
path: packages/core/src/pdf-engine/document-serializer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5ddee9a0c14a2e23ec777522a5a3d2d7dcc545a7
sha256: 489b7578e66f08528604022649b1b771ab18d54b991bf1aebfa4bc1296e12ea0
lines: 168
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/document-serializer.ts

## 1. 结论与边界

双层输出的**文本层序列化器**：排版节点 → 高保真学术 Markdown（标题层级/LaTeX/GFM 表格/脚注/双平行拓扑锚点）+ 大纲（`document-serializer.ts:1-6`）。纯函数（`finalizeAstText` 有原地改写语义，见 §5）。**双轨输出必须区分**：`finalizeAstText` 产出的 `ast.markdown` 默认**含 HTML 锚点**，纯净 Markdown 需 `stripDocumentTopologyAnchors`（生产两调用点都这么做，见 §4）。

## 2. 导出与关键符号

`export` 逐条核：4 个导出（1 类型 + 1 接口 + 2 函数——`SerializableBlock`、`OutlineEntry`、`stripDocumentTopologyAnchors`、`serializeLayoutToMarkdown`、`buildOutline`、`finalizeAstText` 共 6 个导出对象）+ 2 内部函数。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SerializableBlock` | 导出类型 | `:14` | `Pick<DocumentLayoutBlock, id/pageNumber/kind/text/bbox/readingStreamId/readingOrderIndex/headingLevel/equation/table/footnoteRef>` | LayoutNode 与契约块共用（`:11-13`）；不含 isOcrRecognized/confidence |
| `OutlineEntry` | 导出接口 | `:30` | title/level/blockId/page | 大纲条目 |
| `stripDocumentTopologyAnchors` | 导出函数 | `:121` | `(markdown): string` | 剥双锚点还原纯净 Markdown |
| `serializeLayoutToMarkdown` | 导出函数 | `:132` | `(nodes, options?: {includeAnchors?}): string` | includeAnchors 缺省 **true**（`:136`） |
| `buildOutline` | 导出函数 | `:148` | `(nodes): OutlineEntry[]` | 标题类节点→大纲 |
| `finalizeAstText` | 导出函数 | `:164` | `(ast): DocumentLayoutAST` | 原地填 markdown+outline |
| `getHumanLocation`（内部） | 函数 | `:41` | 人读定位 | `readingStreamId` 1=右栏/0=左栏/其余=通栏（`:44`）；figure/table/equation 特例（`:45-47`） |
| `serializeBlock`（内部） | 函数 | `:52` | 单块→Markdown 片段 | 见 §3 |

## 3. 内部逻辑与关键流程

`serializeBlock`（`:52-115`）：
- **排除正文**：`readingStreamId<0` 或 kind∈{header,footer} → `''`（`:54`）；
- 按 kind（`:59-104`）：title→`# `（`:61`）；section-heading→`'#'×clamp(2..6, headingLevel??2)`（`:68-69`）；list-item→`- `（`:73`）；equation→`$$ latex $$`（latex 优先 `equation?.latex.trim()||text`，`\tag{}` 可选，`:76-83`）；table→`node.table?.markdown ?? ''`（`:86`）；figure→`> **[loc]** text`（`:89`）；footnote→`[^ref]: text`，ref 缺省 `fn-{pageNumber}-{readingOrderIndex}`（`:96-97`）；paragraph/default→text（`:100-103`）；
- 空 body 返 `''`（`:106`）；`includeAnchors=false` 直接返 body（`:107`）；锚点= `<span id data-loc>` + `<!-- anchor: id [bbox] loc -->` 双平行拓扑点（`:109-114`）。
- `stripDocumentTopologyAnchors`（`:121-127`）：正则去 span 行（`:123`）与注释行（`:124`），3+ 换行归并（`:125`），trim（`:126`）。
- `serializeLayoutToMarkdown`（`:132-143`）：逐块序列化，空片段跳过（`:140`），`\n\n` 拼接（`:142`）。
- `buildOutline`（`:148-161`）：title/section-heading 且非空（`:151-152`）；level title=1，其余 clamp(2..6, headingLevel??2)（`:155`）。
- `finalizeAstText`（`:164-168`）：**原地改写** `ast.markdown=serializeLayoutToMarkdown(ast.readingOrderedBlocks)`（默认含锚点）与 `ast.outline`，返回同一对象。

## 4. 调用者与调用链

- 入向（生产 2 处，grep 全树）：`document-parse-tools.ts:542-543,547,555-556`（cleanFull=strip(ast.markdown)；每页 anchored+clean 双份）、`study/study-document-indexer.ts:289-290,296,302-303`（同构）；`pdf-engine.ts:22,195`（finalizeAstText 收尾）。
- 出向：仅 `@profer/shared` 类型（`:8`）。
- 测试：无直接单测（检索=全树 `*.test.ts`，`serializeLayoutToMarkdown|finalizeAstText|stripDocumentTopologyAnchors` 在测试文件 0 命中）。

## 5. 数据 I/O、读写与副作用

无 I/O；`finalizeAstText` **原地修改传入 ast 对象**（`:165-166`）——除此外纯函数。`getHumanLocation` 依赖 `readingStreamId` 栏序号语义（见 pdf-engine 手册）。

## 6. 分支、失败、取消与恢复

kind switch 8 分支 + 排除分支 + 锚点分支（§3）；无抛错、无取消。

## 7. 权限与权威状态

无权限分支，依据：纯函数。

## 8. 修改影响面

序列化规则影响 4 个生产链路的最终 Markdown/大纲（document-parse-tools、study indexer、pdf-engine AST）；`footnoteRef` 缺省依赖 `readingOrderIndex` 全局序（`:96`）；锚点正则改动需同步 `file:resolve-document-anchor` 消费端（ipc.ts 侧，跨包未深读=边界）。

## 9. 测试证据

`NOT_RUN`。直接测试：无。间接（域外）：`pdf-engine/__tests__/pdf-engine.test.ts` 端到端含 markdown 字段。缺口：8 个 kind 分支、锚点注入/剥离、大纲 level 规则均无直接断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| §3 全部规则/缺省/排除条件 | 已证实 | `:41-168` 逐行 |
| `ast.markdown` 默认含锚点；生产双轨（anchored+clean） | 已证实 | `:136,165` + 两调用点 `document-parse-tools.ts:547,555-556`、`study-document-indexer.ts:296,302-303` |
| footnote ref 缺省依赖全局 readingOrderIndex | 已证实 | `:96` + `pdf-engine.ts:175-177`（跨文件） |
| 对真实学术文档的输出保真度 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 + 2 内部 | §2 | 14-168 | covered |
| 8 kind 分支/锚点/大纲 | §3 | 52-161 | covered |
| 双轨输出 | §4/§10 | — | covered |
| 测试 | §9 | — | covered（缺口如实） |

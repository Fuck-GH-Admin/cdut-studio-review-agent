---
path: packages/ui/src/markdown-preview.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 249bff40ac38630b3561dab2f82aa6beab0afe44
sha256: d2c8d9c7cae2597ff56320c8eb8f2833fcef132a85c5f11a376d29df2dae3729
lines: 91
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/markdown-preview.tsx

## 1. 结论与边界

**轻量 Markdown 预览渲染器**（`packages/ui/src/markdown-preview.tsx:46-53` 注释）：react-markdown 管线统一入口，收敛全产品十余处复制粘贴变体（TabPreviewPanel/scroll-minimap/AskUserBanner 等）。重量级消息渲染仍归 `ai-elements/message.tsx`（`:51-52`）。导出 2 组件符号 + 1 接口。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MARKDOWN_PREVIEW_LIGHT_COMPONENTS` | const（export） | `:14-23` | `{pre, code, img:null, a→span}` | 迷你地图/Tab 预览用轻量标签渲染 |
| `MarkdownPreviewProps` | interface（export） | `:25-44` | children/className/disableImages/plainLinks/math/remarkPlugins/rehypePlugins/urlTransform/components | 9 字段 |
| `MarkdownPreview` | function（export） | `:54-91` | `(props) => React.ReactElement` | 唯一组件 |

内部类型 `MarkdownComponentProps`（`:7`）。

## 3. 内部逻辑与关键流程

`MarkdownPreview`（`:54-91`）：

1. remark 组装（`:65-67`）：`math` 时 `[remarkGfm, remarkMath, …自定义]`，否则 `[remarkGfm, …]`。
2. rehype 组装（`:68-70`）：`math` 时前置 `[[rehypeKatex, {strict:'ignore'}], …]`，否则仅自定义。
3. `mergedComponents`（`:72-78`）：`disableImages` → `img: () => null`；`plainLinks` → `a` 渲染为 `<span>`；最后 spread `components`（**调用方可覆盖前两者**）。
4. 渲染 `<Markdown>`（`:80-89`）；`className === undefined` 时**不加外层容器**（`:90`，保持 Markdown 原生 DOM 层级——迁移兼容关键）。

## 4. 调用者与调用链

- 入向：`packages/ui/src/index.ts:6-7` 再导出；外部 2 文件（`ai-elements/scroll-minimap.tsx`、`tabs/TabPreviewPanel.tsx`，同时用 `MarkdownPreview` 与 `MARKDOWN_PREVIEW_LIGHT_COMPONENTS`）。注释声称十余处变体待收敛（`:49-51`）——当前实际消费 2 处（负向检索，见 §10）。
- 测试入向：`packages/ui/src/markdown-preview.test.tsx`（3 用例，§9）。
- 出向：`react-markdown`（`:2`）、`remark-gfm`（`:3`）、`remark-math`（`:4`）、`rehype-katex`（`:5`）。

## 5. 数据 I/O、读写与副作用

纯渲染组件：无 I/O、无状态、无副作用（`img:null`/`urlTransform` 可影响资源加载——`disableImages` 阻止远程图加载，注释 `:30`）。

## 6. 分支、失败、取消与恢复

分支：`math` 两态（`:65-70`）、`disableImages`/`plainLinks` 两开关（`:72-78`）、`className` 有无（`:90`）。无 throw/异步。react-markdown 解析失败行为属上游（未知）。

## 7. 权限与权威状态

无权限分支（纯渲染）。`urlTransform` 白名单语义由调用方提供（`:40-41` 注释）。

## 8. 修改影响面

改管线/组件合并顺序 → 2 个消费者预览样式；`MARKDOWN_PREVIEW_LIGHT_COMPONENTS` 形状 → 迷你地图/Tab 预览；`markdown-preview.test.tsx` 3 用例的精确 HTML 断言（`:9/:14`）会碎。

## 9. 测试证据

**直接测试 `packages/ui/src/markdown-preview.test.tsx`（3 用例，bun:test + `renderToStaticMarkup`，NOT_RUN）**：

1. `:7-10` 默认无容器：`'# 标题\n\n正文'` → 精确 `toBe('<h1>标题</h1>\n<p>正文</p>')`（`:9`）。
2. `:12-15` 显式 className：`toBe('<div class="preview"><p>正文</p></div>')`（`:14`）。
3. `:17-27` 轻量组件：断言含 code 样式类（`:23`）、链接变 `<span>链接</span>`（`:24`）、**不含** `<img`（`:25`）与 `<a `（`:26`）。

未覆盖：math/KaTeX、urlTransform、components 覆盖优先级、remarkPlugins 追加。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出；管线/开关/容器分支 | 已证实 | 逐行读 `:1-91` |
| 3 用例精确 HTML 断言 | 已证实 | 测试逐行读 |
| `components` 可覆盖 disableImages/plainLinks | 已证实 | spread 顺序 `:72-78` |
| "十余处变体收敛"的完成度 | 已证实（现状） | 当前外部消费者仅 2 文件（全树检索） |
| KaTeX/数学渲染行为 | 未知 | 上游依赖 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2 | `:14-54` | covered |
| math/disableImages/plainLinks/className 分支 | §3/§6 | `:65-90` | covered |
| 测试 3 用例 | §9 | 测试行号 | covered（NOT_RUN） |
| KaTeX/urlTransform | §10 | — | unknown |

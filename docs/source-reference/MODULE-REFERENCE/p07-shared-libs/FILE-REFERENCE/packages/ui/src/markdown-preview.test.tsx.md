---
path: packages/ui/src/markdown-preview.test.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 37de1fa962284816e830bd59b9dc2e43047e11ac
sha256: 276222ef4a1335392fdeac3137232a859d43f96c4f5744766a8384d738d52cc1
lines: 28
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/markdown-preview.test.tsx

## 1. 测试目标

`MarkdownPreview` **迁移兼容性**（describe `:6`）：默认无外层容器、显式 className 可加容器、轻量组件不加载图片/不生成可点链接。被测对象主手册见 `markdown-preview.tsx.md`。

## 2. 用例清单

共 **3 个 `test()`**（bun:test + `renderToStaticMarkup` 服务端渲染，`:3`）：

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | 默认不加容器，保留标题/段落直接子元素关系 | `:7-10` |
| 2 | 显式 className 提供样式容器 | `:12-15` |
| 3 | 迷你地图预览：保留代码样式、无图片、无可点链接 | `:17-27` |

## 3. 真实断言

- 用例 1：`html` **精确** `toBe('<h1>标题</h1>\n<p>正文</p>')`（`:9`）。
- 用例 2：`toBe('<div class="preview"><p>正文</p></div>')`（`:14`）。
- 用例 3（`components={MARKDOWN_PREVIEW_LIGHT_COMPONENTS}`）：`toContain('text-[11px] bg-muted/50 px-0.5 rounded')`（`:23`）、`toContain('<span>链接</span>')`（`:24`）、`not.toContain('<img')`（`:25`）、`not.toContain('<a ')`（`:26`）。

## 4. 未覆盖与脆弱点

- 未覆盖：math/KaTeX、urlTransform、disableImages/plainLinks 独立开关、components 覆盖优先级。
- 脆弱点：用例 1/2 是精确 HTML 字符串断言——react-markdown 输出格式升级会碎。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §3 | 已证实 | 逐行读 `:1-28` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| className 有无 | 1、2 | covered |
| LIGHT_COMPONENTS（img/a/pre/code） | 3 | covered |
| math/urlTransform/开关矩阵 | — | unknown |

---
path: packages/core/src/highlight/shiki-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f4460ca3943a4fdda1111795d882e6344ebf9a2a
sha256: edfd594ddc8ade1963d8ca2f758f1dd41c265efae1117ccd6b7456071cb760c0
lines: 275
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/highlight/shiki-service.ts

## 1. 结论与边界

Shiki 语法高亮服务（`packages/core/src/highlight/shiki-service.ts:1-12`）：懒加载高亮器**单例**、按需加载语言；纯逻辑层不依赖 React。三套 API（`:7-11`）：`highlightCode()` 异步 HTML（首初始化+按需语言）、`highlightCodeSync()` 同步 HTML（初始化后零延迟，**未初始化返回 null**）、`highlightToTokens()` 同步 token 结构（逐行 React 流式最优）。

边界：语言未知/未加载回退 `'text'`；不管理组件生命周期（`onHighlighterReady` 返回 unsubscribe 由调用方清理，`:131`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `HighlightOptions` | interface | 53-60 | `{code; language; theme?='github-dark'}` | |
| `HighlightResult` | interface | 63-69 | `{html; language}` | language=解析后实际值 |
| `getDisplayName` | function | 88-92 | `(lang) => string` | DISPLAY_NAMES 表+首字母大写兜底；空→'Code' |
| `HighlightToken` | interface | 95-100 | `{content; color?}` | |
| `HighlightTokensResult` | interface | 103-113 | `{lines: HighlightToken[][]; bgColor; fgColor; language}` | bg/fg 缺省 `#24292e`/`#e1e4e8` |
| `isHighlighterReady` | function | 122-124 | `() => boolean` | |
| `onHighlighterReady` | function | 131-142 | `(callback) => unsubscribe` | 已就绪立即触发；否则入队一次性 |
| `highlightCode` | function | 215-227 | async，`codeToHtml` | |
| `highlightCodeSync` | function | 233-245 | 同步 `codeToHtml`，未初始化 → null | |
| `highlightToTokens` | function | 255-275 | 同步 `codeToTokens`，未初始化 → null | |

内部：`DEFAULT_LANGS`（18 语言，`:19-22`）、`DEFAULT_THEMES`（4 主题，`:25`）、`LANGUAGE_ALIASES`（20 别名，`:28-49`）、`DISPLAY_NAMES`（`:72-85`）、单例三态（`highlighterPromise`/`cachedHighlighter`/`readyListeners`，`:115-120`）、`getHighlighter`（`:147-167`，懒加载+就绪广播一次性）、`resolveLanguage`/`resolveLoadedLanguage`/`resolveAndLoadLanguage`（`:172-212`）。

## 3. 内部逻辑与关键流程

- `getHighlighter`（`:147-167`）：Promise 单例；resolve 后缓存实例+清空并广播 listeners（**listener 抛错被 catch 不影响他人**，`:158-163`）。
- `onHighlighterReady`（`:131-142`）：已就绪同步触发返回 noop；否则入队+触发初始化；返回 delete unsubscribe。
- 语言解析三级（`:172-212`）：别名→bundledLanguages 存在性→'text'；`resolveAndLoadLanguage` 按需 `loadLanguage`，失败 warn 回退 'text'（`:207-210`）。
- `highlightToTokens`（`:255-275`）：token 扁平化 `{content,color}`；bg/fg 回退默认色。

## 4. 调用者与调用链

出向：`shiki`（createHighlighter/bundledLanguages+3 类型，`:14-15`）。入向（检索=符号名+模块名，全冻结树）：

- `highlightCode`：`apps/electron/src/renderer/components/diff/markdown-preview-extensions.tsx:17,199`。
- `highlightToTokens`：`markdown-preview-extensions.tsx:17,135,191`、`packages/ui/src/code-block/CodeBlock.tsx:23,150,164,172`。
- `getDisplayName`：`markdown-preview-extensions.tsx:656`、`CodeBlock.tsx:215`。
- `onHighlighterReady`：`CodeBlock.tsx:23,189`。
- `HighlightToken`/`HighlightTokensResult` 类型：CodeBlock/markdown-preview-extensions 消费。
- **零外部引用**：`highlightCodeSync`、`isHighlighterReady`（仅自身+barrel）、`HighlightOptions`、`HighlightResult`（仅自身签名）。
- 产品入口：renderer ✔ + packages/ui ✔；main/preload/shared/cli ✘。**无直接测试**。

## 5. 数据 I/O、读写与副作用

模块级单例状态（Promise/实例/listeners Set，`:115-120`）；hljs/shiki 全局资源；console.warn/error（`:159,208`）；无 I/O 文件。

## 6. 分支、失败、取消与恢复

语言加载失败 → warn+'text'（`:207-210`）；同步 API 未初始化 → null（调用方需处理）；无取消（Promise 不可中断）。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

- 单例/就绪广播语义影响 CodeBlock 首屏（`onHighlighterReady` 契约）。
- 别名表/默认主题是渲染面契约。
- 无直接测试（renderer/ui 消费面测试间接）。

## 9. 测试证据

**无任何测试文件引用本模块或其符号**（`*.test.ts` 全树零命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单例懒加载+一次性就绪广播 | 已证实 | `:147-167` |
| 同步 API null 语义 | 已证实 | `:234,258` |
| 语言三级解析+失败回退 | 已证实 | `:172-212` |
| `highlightCodeSync`/`isHighlighterReady`/2 接口零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| **零测试** | 已证实 | 全树无引用 |
| 真实高亮渲染效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 导出 | §2 | 53-275 | covered |
| 单例/就绪 | §3 | 115-167 | covered |
| 三 API | §3 | 215-275 | covered |
| 测试锚 | §9 | — | unknown（零测试） |

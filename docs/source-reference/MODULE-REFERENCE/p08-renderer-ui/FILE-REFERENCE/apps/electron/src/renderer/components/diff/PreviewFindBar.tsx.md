---
path: apps/electron/src/renderer/components/diff/PreviewFindBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dfa6105a9cb132385cf4434cefbe65f348261cb1
sha256: 857ac38b583766206d7570437d518b1f4b94b139a5ef8f098971cac90e993d1a
lines: 462
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/PreviewFindBar.tsx

## 1. 结论与边界

预览面板的文件内查找条：在 `rootRef` 容器（含 Shadow DOM）内对文本节点做正则/全词/大小写检索，用 `<mark>` 包裹高亮，支持上一个/下一个环形跳转、MutationObserver 内容变化自动重搜（80ms 防抖）（`apps/electron/src/renderer/components/diff/PreviewFindBar.tsx:1-25`）。

边界：

- 不修改内容语义（只插入/移除 `<mark>` 节点，`cleanupHighlights` 还原文本并 normalize）。
- 跳过受控内容（TipTap/Lexical/ProseMirror 编辑器、表单控件、行号/gutter），不与编辑器查找冲突。
- 无 IPC/磁盘；纯 DOM 操作。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PreviewFindBar` | 函数（导出） | 195-462 | `({open,rootRef,contentKey,unsupportedReason?,onOpenChange}) => React.ReactElement \| null` | 查找条本体 |
| `buildMatcher` | 内部函数 | 31-40 | `(query, options) => RegExp \| null` | 非正则先 `escapeRegExp`；`wholeWord` 包 `\b(?:...)\b`；非法正则 catch → null |
| `markMatchesInTextNode` | 内部函数 | 113-152 | `(node, matcher) => HTMLElement[]` | 零长匹配防护（`lastIndex+1`，`:121-122`）；`<mark data-profer-find-match>` |
| `applyHighlights` | 内部函数 | 154-180 | `(container, query, options) => HTMLElement[]` | 清旧 → 逐 root 匹配 → 打 `data-profer-find-index` |
| `cleanupHighlights` | 内部函数 | 101-111 | `(container) => void` | mark 还原文本 + `normalize()` |
| `setActiveMatch` | 内部函数 | 182-193 | `(marks, activeIndex) => void` | active 橙色 + `scrollIntoView({block:'center'})` |
| `shouldSkipTextNode` | 内部函数 | 79-91 | `(node: Text) => boolean` | 见 §3.2 |
| `discoverShadowRoots`/`collectSearchRoots`/`injectShadowStyle` | 内部函数 | 42-77 | — | Shadow DOM 支持 |
| `escapeRegExp`/`applyMatchStyle` | 内部函数 | 27-29,93-99 | — | 工具 |
| `withObserverPaused` | 内部（useCallback） | 212-223 | `(fn) => void` | DOM 改动期间暂停 MutationObserver 防自反 |
| `runSearch`/`clearMarks`/`goToPrevious`/`goToNext`/`close`/`handleKeyDown` | 内部（useCallback） | 231-358 | 见 §3 | 主流程 |

## 3. 内部逻辑与关键流程

### 3.1 搜索与高亮

1. `buildMatcher`（`apps/electron/src/renderer/components/diff/PreviewFindBar.tsx:31-40`）：`options.regex` 用原串、否则转义；`wholeWord` 包词边界；flags `g`+条件 `i`；`new RegExp` 抛错 → null。
2. `applyHighlights`（`:154-180`）：先 `cleanupHighlights`；对 `collectSearchRoots`（容器 + 递归发现的全部 ShadowRoot，`:42-57`）注入 shadow 样式（`:59-77`），TreeWalker 收集文本节点（`shouldSkipTextNode` 过滤），逐节点 `markMatchesInTextNode` 用 `<mark>` 替换（fragment 替换原节点，`:131-151`）；全部 mark 打 `data-profer-find-index`。
3. `shouldSkipTextNode`（`:79-91`）：空白/无父/`[data-profer-find-ignore]`/既有 mark/`script,style,input,textarea,select,button`/受控编辑器（`CONTROLLED_CONTENT_SELECTOR`：tiptap、lexical、`[contenteditable=true]`、`.ProseMirror:not([contenteditable=false])`）/行号 gutter 全部跳过。
4. `setActiveMatch`（`:182-193`）：active mark 橙色+滚动居中，其余还原。

### 3.2 组件主流程（`:195-462`）

- `runSearch`（`:242-275`）：`!root || !open || unsupportedReason` 短路；空查询清标记；`buildMatcher` 失败时 `setRegexInvalid(options.regex && matcher===null)` 并清标记（`:252-257`）；`withObserverPaused` 内 `applyHighlights`/`setActiveMatch`；`nextActiveIndex` 保留当前（clamp）否则 0（`:263-267`）；更新 `marksRef`/`activeIndexRef`/`matchCount`。
- effects：
  - `open`/`contentKey`/`unsupportedReason` 变化 → `runSearch` 或 `clearMarks`（`:277-287`）；
  - MutationObserver（childList+subtree+characterData）80ms 防抖重搜（`:289-306`）；
  - 打开时 `setTimeout(0)` 聚焦输入框（`:308-312`）；
  - `activeIndex` 变化 → `setActiveMatch`（`:314-318`）；
  - 卸载 → `clearMarks`（`:320-322`）。
- `goToPrevious`/`goToNext`（`:324-340`）：环形；`matchCount===0` → -1。
- `close`（`:342-345`）：`onOpenChange(false)` + 清标记。
- `handleKeyDown`（`:347-358`）：Escape 关闭；Enter 下一个（Shift+Enter 上一个）。
- 渲染（`:360-461`）：`!open` → null；`statusText`（unsupportedReason / 「表达式无效」/ `${activeIndex+1}/${matchCount}` / 「无结果」，`:362-370`）；容器带 `data-profer-find-ignore`（自身不被搜，`:374`）；输入框 + `Aa`/`ab`/`.*` 三个开关（aria-pressed，`:391-423`）+ 上/下一个（无匹配时 disabled，`:431-450`）+ 关闭。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/diff/DiffTabContent.tsx:26`（import）、`DiffTabContent.tsx:1037`（渲染，传 `open/rootRef/contentKey/unsupportedReason/onOpenChange`）。无测试引用（见 §9）。

出向：`lucide-react`、`@/lib/utils`（`cn`）；无其它模块依赖（纯 DOM）。

## 5. 数据 I/O、读写与副作用

- 无 IPC/磁盘/网络。
- 副作用：DOM 改写（插入/移除 `<mark>`、`normalize`、shadow `<style>` 注入）、`scrollIntoView`、MutationObserver 注册/暂停/断开、focus。
- 并发：`withObserverPaused` 保证自身 DOM 改动不触发重搜循环（`:208-223`）；80ms 防抖合并内容流式变化。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| `!open` | 277-281,360 | 清标记 / 渲染 null |
| `unsupportedReason` | 282-285,387 | 清标记、输入禁用、显示原因 |
| 空查询 | 245-250 | 清标记 |
| 非法正则 | 252-257 | `regexInvalid`、清标记 |
| 无匹配 | 263-264 | activeIndex=-1，「无结果」 |
| Escape / Enter / Shift+Enter | 347-357 | 关闭 / 下一个 / 上一个 |

- 失败后状态：非法正则显示「表达式无效」，修正即重搜；标记总能被 `cleanupHighlights` 还原。
- 取消/恢复：卸载清标记（`:320-322`）；observer/timer 全部清理（`:301-305`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/IPC。`unsupportedReason` 由调用方（DiffTabContent 按内容类型判定）给出，是可搜性的权威。

## 8. 修改影响面

- 改 `MATCH_SELECTOR`/数据属性（`data-profer-find-*`）需同步 `applyHighlights`/`cleanupHighlights`/shadow 样式。
- 改跳过规则（`:79-91`）影响与编辑器/行号 UI 的共存。
- 改 props 契约影响 `DiffTabContent.tsx:1037` 的装配。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `PreviewFindBar` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：无。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：匹配计数、环形跳转、shadow root 搜索、observer 重搜均无自动化断言。维护者验证：代码/文本预览 Ctrl+F 类入口打开查找，试大小写/全词/正则与跳转。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出 | 已证实 | 全文 `export` 逐条核（仅 `:195`） |
| 零长匹配防护 | 已证实 | `:121-122` |
| 跳过受控内容/gutter | 已证实 | `:79-91` |
| observer 80ms 防抖重搜 | 已证实 | `:295-298` |
| 自身 `data-profer-find-ignore` | 已证实 | `:374` |
| 环形上一/下一 | 已证实 | `:324-340` |
| 唯一调用点 DiffTabContent | 已证实（检索） | `DiffTabContent.tsx:26,1037` |
| 真实大文档性能 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildMatcher` | §3.1 | 31-40 | covered |
| `markMatchesInTextNode` | §3.1 | 113-152 | covered |
| `applyHighlights`/`cleanupHighlights` | §3.1 | 154-180,101-111 | covered |
| `shouldSkipTextNode` | §3.1 | 79-91 | covered |
| `setActiveMatch` | §3.1 | 182-193 | covered |
| `runSearch`/effects | §3.2 | 242-322 | covered |
| 跳转/关闭/键盘 | §3.2 | 324-358 | covered |
| 渲染/状态文本 | §3.2,§6 | 360-461 | covered |
| 测试 | §9 | — | unknown |

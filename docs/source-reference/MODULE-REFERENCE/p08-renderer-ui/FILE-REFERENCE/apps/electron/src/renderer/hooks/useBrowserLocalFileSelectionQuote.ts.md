---
path: apps/electron/src/renderer/hooks/useBrowserLocalFileSelectionQuote.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 327f1d0683cf3b172556101fcc8f686a381f530b
sha256: 866ea7aa03c8b0d95f0738438266d75870668a26f2af8b4d8864693715dff9df
lines: 56
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useBrowserLocalFileSelectionQuote.ts

## 1. 结论与边界

**浏览器列划词引用 hook**（56 行）：选区在另一个无 preload webContents 里，页面经哨兵 URL 回投主进程→`BROWSER_LOCAL_FILE_SELECTION` 事件→写 `quotedSelectionMapAtom`（与预览面板 `usePreviewQuotedSelection` 同 atom 同字段，注释 `:6-15`——文件面在浏览器列无需分支）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `reduceBrowserFileSelection` | 纯函数 | `:21` | `(Map, event) -> Map`：空串删/同文同路原样返回/否则 set（`sourceType:'file'`+fileName 作 sourceLabel+capturedAt） |
| `useBrowserLocalFileSelectionQuote` | Hook | `:45` | 订阅 `onAgentBrowserLocalFileSelection`（Partial 探测缺失则不订） |

## 3. 内部逻辑与关键流程

reduce 三边界（`:25-42`，抽出为纯函数专为单测"撤引用/去重/换文件"，注释 `:18-19`）：①空串=清空选区→delete（无则原 Map）②text+filePath 均同→原引用不变 ③否则覆盖写入。hook 侧（`:48-55`）：事件→`setQuotedSelectionMap(prev => reduce…)`。

## 4. 调用者与调用链

- 入向：浏览器列宿主挂载；`useBrowserLocalFileSelectionQuote.test.ts`（本批 6 断言）。
- 出向：preview-atoms（quotedSelectionMapAtom/QuotedSelection）、`window.electronAPI.onAgentBrowserLocalFileSelection?`。

## 5. 数据 I/O、读写与副作用

订阅 IPC 事件；写 quotedSelectionMapAtom。

## 6. 分支、失败、取消与恢复

API 缺失→不订阅（`:50-51`）；effect cleanup 返回 unsubscribe；无抛错。

## 7. 权限与权威状态

引用字段权威=与预览面板同口径（`sourceType:'file'`，注释 `:13-15`）。

## 8. 修改影响面

输入框引用胶囊与随消息引用内容（跨浏览器列/预览面板一致性）；reduce 语义被 6 断言锁定（见测试手册）。

## 9. 测试证据

`NOT_RUN`。直接测试=同批 `useBrowserLocalFileSelectionQuote.test.ts`（**6 test/0 it** 机械计数，断言级覆盖 reduce 三边界+会话隔离）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| reduce 三边界/同口径字段 | 已证实 | `:1-56` 全文 |
| 6 断言行为 | 已证实（断言级） | 同批测试 |
| 测试运行 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2/§3 | 21-55 | covered |

---
path: apps/electron/src/renderer/hooks/useBrowserLocalFileSelectionQuote.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c8b5f40ddfb5a9ab149d78a2a38151b1379e7851
sha256: a7d1d13d67370b28a2391e2a70daabae2c1dee46ca371bd7658ce9375447972b
lines: 64
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useBrowserLocalFileSelectionQuote.test.ts

## 1. 测试目标

`reduceBrowserFileSelection`（浏览器列划词入库纯函数）的三边界语义：撤引用/去重/换文件。bun:test。

## 2. 用例清单

| 项 | 值 | 核法 |
| --- | --- | --- |
| `test(` 计数 | **6** | `grep -c '^\s*test('` |
| `it(` 计数 | **0** | 同上 |
| describe | 1（'浏览器列划词 → 引用' `:24`） | 全文 |

## 3. 真实断言

1. `:25-33` 写入引用字段与预览面板同口径（sourceType=file+文件名作展示名）。
2. `:35-38` 同会话重复选同一段→返回原 Map（toBe 同引用）。
3. `:40-45` 空串撤引用（仅删目标会话，session-2 保留）。
4. `:47-50` 无引用收到空串→原 Map 不动。
5. `:52-56` 同名不同路径算新引用（filePath 覆盖）。
6. `:58-63` 不污染其它会话（session-9 不变+size=2）。

## 4. 未覆盖

`useBrowserLocalFileSelectionQuote` hook 本体（IPC 订阅/Partial 探测）未测；`capturedAt` 时间戳未断言。

## 5. 已证实

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 test/0 it 计数与断言内容 | 已证实 | 全文+机械计数 |
| 测试通过 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 用例 | 节 | 状态 |
| --- | --- | --- |
| 6 用例 | §2/§3 | covered（断言级；NOT_RUN） |

---
path: apps/electron/src/main/lib/agent-preview-renderer.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9d4f92be43b8832980a3420a6163cc20e127e8e3
sha256: 52219e694ac7aac20d41d2f3346bcea307c1fcec39fa2fc80e4ee3bcd8e83695
lines: 22
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-preview-renderer.test.ts

## 1. 测试目标

不可信 URL 边界与结构化渲染错误的纯契约测试（注释 :3-4：避免构造 BrowserWindow，规避全仓 Electron mock 冲突）。不运行（`NOT_RUN`）。

## 2. 用例清单

2 用例（:12/:18），1 describe（:11）；动态 import（:6-9）。
1. 仅收 opaque cdut-file URL（:12-16）：`cdut-file://<uuid>/index.html` true、`file:///` false、`https://` false。
2. 结构化错误（:18-21）：`AgentPreviewRendererError('page_out_of_range','out of range',false)` toMatchObject `{code, retryable:false}`。

## 3. 真实断言

`:13-15`/`:20`（toBe/toMatchObject）。

## 4. 未覆盖与脆弱点

未覆盖：渲染链/IPC/超时/策略。mock 边界：动态 import 避 Electron mock 污染。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| URL 判定/错误形状 | #1/#2 | covered |
| 渲染链/IPC | — | unknown |

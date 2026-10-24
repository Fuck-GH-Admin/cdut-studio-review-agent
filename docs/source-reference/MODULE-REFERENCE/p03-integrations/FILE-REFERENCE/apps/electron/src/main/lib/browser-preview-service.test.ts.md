---
path: apps/electron/src/main/lib/browser-preview-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ffdaf8bbfb273ba19a7e1e72dd362ba39946b037
sha256: 802adbcecbf592de40dea3a6f560d0c87b1aa5860026bef5a17a367bd774aebb
lines: 63
kind: test
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-preview-service.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

`createAuthorizedPreviewUrl`：授权根内 cdut-file URL、目录→index、根外只读预览放行、非 HTML/缺 index 拒、失效根不拖垮、空路径拒。

## 2. 用例清单

7 用例 / 1 describe（`createAuthorizedPreviewUrl` :21）。夹具 `createFixture()`（:8-19，真 mkdtemp+realpath——注释 :8-9 macOS /var→/private/var 差异）；无 mock。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 根内 HTML | 22-28 | `cdut-file://` + filePath |
| 2 | 目录→index.html | 30-35 | filePath 指向 index |
| 3 | 根外只读放行 | 37-42 | outside/report.html ok |
| 4 | 非 HTML 拒 | 44-48 | `只支持 HTML` |
| 5 | 缺 index 拒 | 50-54 | `index.html` |
| 6 | 失效根不拖垮 | 56-62 | 混入 missing-dir/文件根仍解析成功 |
| 7 | 空路径拒 | 64-68 | `不能为空` |

## 3. 真实断言

如 §2 表（逐条读自 :22-68）。

## 4. 未覆盖与脆弱点

- 未覆盖：`createViewerPreviewUrl`/`viewerPreviewThemeSignature`（preview-theme 测试间接）。
- 脆弱点：realpath 依赖（macOS 路径差异已在夹具处理）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例断言如 §2 | 已证实 | 本文件逐行 |
| 授权/只读/失效根语义被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| `createAuthorizedPreviewUrl` 全分支 | §2 | covered |
| viewer URL/主题签名 | §4 | unknown（他测间接） |

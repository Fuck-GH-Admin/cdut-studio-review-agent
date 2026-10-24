---
path: apps/electron/src/main/lib/file-preview-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aa26cceedd87482208744592a26ded22582975d1
sha256: 73e6364e35439cfbea757f7e08e62bdeac3a6dd95c1d2e0a3c8eddffcc5b7123
lines: 128
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/file-preview-service.test.ts

## 1. 测试目标

三组：home 缩写安全解析、`skipGlobalSearch` 预检浅层搜索边界、**PDF 逐页栅格化回归护栏**（历史 REGISTER_MATERIAL_PATH_V2 30 秒无返回根因，头注 :64-72）。

## 2. 用例清单

8 用例 / 3 describe。真 mkdtemp+假 PDF 字节（:74-77，只校验生成的 HTML 不真正解析）；`cleanPreviewTmpDir` 前置防历史残留（:88-90 注释）。

| describe | # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- | --- |
| 路径安全解析 | 2 | home 缩写只展开当前用户 | 18-22 | `~other-user/a.md` 原样 |
| | | `~/.xxx` 解析展开 | 24-28 | 目标路径 |
| 预检浅层搜索 | 3 | 深度 2 命中 | 44-47 | `ws/src/foo.ts` |
| | | 不存在 null | 49-52 | 不误报 |
| | | 深度 5 不命中 | 54-58 | null（点击时完整解析兜底） |
| 逐页栅格化护栏 | 3 | 只渲染第 7 页 | 80-95 | `initialPages = [7]`、guarded 分支无 `renderAll` |
| | | 不限页仍整份渲染 | 97-103 | `renderAll()`（人类预览语义不变） |
| | | 重复/非法页码去重丢弃 | 105-111 | `[3,3,0,-1,2.5,5]`→`[3,5]` |

## 3. 真实断言

如 §2 表（逐条读自 :18-111）；`readViewerHtml` 断言 `cdut-file://` URL 形态+恰好一份预览文件+`agent-preview:pdf-ready`（:92-103）。

## 4. 未覆盖与脆弱点

- 未覆盖：全局 fallback 搜索、Office 转 HTML、50MB 上限。
- 脆弱点：临时目录共享（靠 `cleanPreviewTmpDir` 隔离）；假 PDF 不含文本流（仅存在性）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例断言如 §2 | 已证实 | 本文件逐行 |
| 逐页栅格化不变量被固定 | 已证实 | 用例 6-8 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| `expandHomeDirectory` | §2 | covered |
| 预检浅层三态 | §2 | covered |
| `preparePdfPreview` pages | §2 | covered |
| 全局搜索/Office/上限 | §4 | unknown（未测） |

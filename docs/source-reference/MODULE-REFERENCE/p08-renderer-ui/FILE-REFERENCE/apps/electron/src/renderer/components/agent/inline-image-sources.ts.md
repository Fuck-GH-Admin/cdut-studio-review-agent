---
path: apps/electron/src/renderer/components/agent/inline-image-sources.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e1a4ad9528f1bfb37477148fa0dbf8c3413ba272
sha256: 74652f16d9d18d42ebe932526fba7d7b61b1d231780cafc9f27b905968e1a8cc
lines: 70
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/inline-image-sources.ts

## 1. 结论与边界

从文本提取内联图片候选（通用图片渲染能力，文件头 `apps/electron/src/renderer/components/agent/inline-image-sources.ts:1-10`）：①内嵌 base64 data URL（**从展示文本剥离**避免超大串污染界面）；②http(s) 图片地址（扩展名结尾；**仅候选**——是否图片由主进程内容类型/魔数探测确认，`:9`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数 = 1 个导出（常量 3 个内部）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `parseInlineImageCandidates` | 函数（导出） | 37-70 | `(text)=>{cleanText,images}` |
| `DATA_URL_RE`/`IMAGE_URL_RE`/`MAX_INLINE_IMAGES` | 内部常量 | 14-20 | png/jpg/gif/webp data URL；扩展名 URL（忽略 query/hash）；单文本上限 12 |
| `filenameFromUrl` | 内部 | 23-30 | URL 末段解码，失败 `网络图片` |

## 3. 内部逻辑与关键流程

`parseInlineImageCandidates`（`:37-70`）：空文本早退；①data URL 全量提取+剥离（`dataUrlImage` 失败不计、`seen` 去重）；②URL 扫描（上限 12 早退、`remote:` 前缀去重、原文保留额外渲染）；cleanText=剥离后去行尾空白+trim（`:68`）。

## 4. 调用者与调用链

入向：renderer 消息文本渲染（SDKMessageRenderer）；测试：`inline-image-sources.test.ts`（35 行，本批）。出向：`./agent-renderable-image`（`dataUrlImage`/`imageKey`/`remoteImageSource`）。

## 5. 数据 I/O、读写与副作用

纯解析；无 IO。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 空文本 | 原样返回 | 38 |
| data URL 解析失败 | 跳过（仍剥离） | 45-52 |
| 超 12 张 | 截断 | 60 |
| 重复 | 去重 | 48-50,63-64 |

## 7. 权限与权威状态

「是否图片」判定权威=主进程探测（本文件仅候选，`:9`）。

## 8. 修改影响面

影响消息内联图片渲染与文本洁净度。

## 9. 测试证据

直接测试：`inline-image-sources.test.ts`（35 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 候选语义/剥离/去重/上限 | 已证实 | `:1-10,37-70` |
| 主进程确认边界 | 已证实 | `:9` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单导出+常量 | §2,§3 | 14-70 | covered |

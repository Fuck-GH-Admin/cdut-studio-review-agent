---
path: apps/electron/src/renderer/atoms/markdown-toc.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2d18ea73b9a33f2eca7adb95b5befe3c98460730
sha256: 589c6f119b522a9e00a9c7bf325cb0d014d123341c7d58f750f9ba58aac29ee0
lines: 4
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/markdown-toc.ts

## 1. 结论与边界

Markdown 预览目录（TOC）侧栏展开状态（4 行）：**仅本次运行记忆，重启后默认展开**（`:3` 注释）。纯内存 atom。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `markdownTocOpenAtom` | atom（导出） | 4 | `boolean` 初值 true | TOC 侧栏是否展开 |

导出合计 1。

## 3. 内部逻辑与关键流程

无（不适用，依据：单行 atom）。

## 4. 调用者与调用链

入向（全冻结树检索 `markdown-toc`，2 文件）：`components/tabs/TabContent.tsx:11`、`components/diff/DiffTabContent.tsx:18`。出向：`jotai`。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯内存；重启即重置为展开）。

## 6. 分支、失败、取消与恢复

无（不适用）。

## 7. 权限与权威状态

无（不适用）。

## 8. 修改影响面

2 个消费方的 TOC 显隐（文件预览/差异预览）；持久化需另接 settings（当前刻意不持久）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `markdown-toc` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单导出/初值/仅运行内记忆 | 已证实 | `:1-4` 全文 |
| 2 个调用方 | 已证实 | 全树检索（§4） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `markdownTocOpenAtom` | §2/§4 | 4 | covered |

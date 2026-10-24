---
path: apps/electron/src/main/lib/cslab/cslab-formats/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2a3de8b205a57a497ff23d38d8aff414aba79941
sha256: e97e0089a8f87794ac528d71080ba711d42dbf7cb2cdcfb1fa1ac9d5bde4d8fd
lines: 11
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-formats/index.ts

## 1. 结论与边界

CSLab 仪器格式解析器入口（`apps/electron/src/main/lib/cslab/cslab-formats/index.ts:1-3`）：11 行纯 `export *` 转发。统一数据契约见 types.ts（一维 X+若干 Y 序列→Parquet）。

边界：纯 barrel，无逻辑。

## 2. 导出与关键符号

无自身定义——7 条转发（`:4-10`）：`./types`、`./sniff`、`./header-data-separator`、`./mat-level5`、`./spc`、`./jcamp`、`./xrd`。

## 3. 内部逻辑与关键流程

本文件不适用——依据：纯转发。

## 4. 调用者与调用链

出向：7 子模块。入向：cslab-formats 消费方（详见 UNVERIFIED 补记，caller 调查后合并）。

## 5. 数据 I/O、读写与副作用

本文件不适用。

## 6. 分支、失败、取消与恢复

本文件不适用。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

增删转发条目改变 cslab-formats 公共面。

## 9. 测试证据

无专属测试（子模块测试覆盖）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 模块转发 | 已证实 | `:4-10` |
| 消费面 | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 转发 | §2 | 4-10 | covered |

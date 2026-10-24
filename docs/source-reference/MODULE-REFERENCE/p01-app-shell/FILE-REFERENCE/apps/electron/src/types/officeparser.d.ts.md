---
path: apps/electron/src/types/officeparser.d.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 10148cb3445e25f84b5033bcc0c34149ed90ee44
sha256: c5296e451a1ccbf3a89f986901b7ee0d845dbf1f8f1b107c72d01703b34b823d
lines: 17
kind: source
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/types/officeparser.d.ts

## 1. 结论与边界

`officeparser` npm 包的环境类型声明（ambient `declare module`）：该包不带内置 TS 类型，此处仅覆盖项目用到的 API（`apps/electron/src/types/officeparser.d.ts:1-6`）。

边界：只声明 `parseOfficeAsync` 一个函数；无逻辑。

## 2. 导出与关键符号

声明模块内导出逐条核对：1 个函数。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `parseOfficeAsync` | 函数（模块内导出） | 16 | `(filePath: string) => Promise<string>` | 异步解析 Office 文档（DOCX/XLSX/PPTX/ODT/ODP/ODS）提取纯文本 |

## 3. 内部逻辑与关键流程

本文件不适用，依据：`.d.ts` 纯声明。

## 4. 调用者与调用链

入向（冻结树检索）：**全冻结树 0 消费者**——无任何文件 `import`/`require` `officeparser`（检索 `*.ts/*.tsx` 全文，`officeparser` 仅出现在注释：`document-parser.ts:179`（「零外部 mammoth/officeparser 依赖」）、`document-parser.ts:235`、`document-parser.ts:527`、`document-parser.test.ts:11,163`、`DiffTabContent.tsx:46,655`（「旧的 mammoth(docxToHtml) 与 officeparser(officeToHtml) 链路退役」）。即：officeparser 解析链已在冻结树退役，本声明为遗留残留（范围声明见 §10）。

出向：无。

## 5. 数据 I/O、读写与副作用

本文件不适用（声明无副作用）。

## 6. 分支、失败、取消与恢复

本文件不适用，依据：无控制流。

## 7. 权限与权威状态

本文件不适用，依据：无权限逻辑。

## 8. 修改影响面

- 当前无消费者，删除本声明不影响任何代码编译（静态判断）；若旧链路复活则需同步。
- `package.json` 是否仍保留 officeparser 依赖未在本批范围核对（未知）。

## 9. 测试证据

**无直接测试**（声明文件，且无消费者）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck。测试断言仅指静态读到的 expect 行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 模块内 1 个声明导出 | 已证实 | `:16` |
| 全树 0 import/require 消费 | 已证实（检索：冻结树 `*.ts/*.tsx` 全文 `officeparser`，除注释外 0 命中，不含 docs/） | — |
| 退役结论（docx→Silurus/document-parser 自研） | 已证实（注释互证） | `DiffTabContent.tsx:46`、`document-parser.ts:179` |
| package.json 依赖是否残留 | 未知 | 未核对（范围外） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `parseOfficeAsync` | §2 | 16 | covered |
| 零消费者结论 | §4,§10 | — | covered |
| 测试 | §9 | — | unknown |

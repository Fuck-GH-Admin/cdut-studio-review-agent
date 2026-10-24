---
path: packages/core/src/pdf-engine/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0db0c15b470d58660992a8b8088fa1466c587438
sha256: a59b8db20def538d6f443f009659d9886e0f3a54a4e61d39209c1f4f6ebd20fc
lines: 18
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/index.ts

## 1. 结论与边界

pdf-engine 的**公开入口**：纯再导出文件，12 条 `export *`（`index.ts:7-18`），把引擎各模块的导出面统一暴露；无任何逻辑/状态/副作用。注释声明对外主要暴露 `parsePdfDocument` 及可独立复用的算法/端口模块（`index.ts:3-5`）。

## 2. 导出与关键符号

本文件自身 0 个自定义符号；12 条 `export *`（import 说明符带 `.ts` 后缀，已证实）：

| 行 | 再导出模块 | 本批归属 |
| --- | --- | --- |
| `index.ts:7` | `./types.ts` | 本批（types.ts.md） |
| `index.ts:8` | `./trapdoc-guard.ts` | 本批 |
| `index.ts:9` | `./pdf-stream-extractor.ts` | 本批 |
| `index.ts:10` | `./native-segmenter.ts` | 本批 |
| `index.ts:11` | `./source-preserving-aligner.ts` | 本批 |
| `index.ts:12` | `./max-regret-router.ts` | 本批 |
| `index.ts:13` | `./table-decomposer.ts` | 本批 |
| `index.ts:14` | `./academic-enricher.ts` | **不在本批 scope**（他批主责） |
| `index.ts:15` | `./ocr-bridge.ts` | 本批 |
| `index.ts:16` | `./onnx-adapter.ts` | 本批 |
| `index.ts:17` | `./document-serializer.ts` | 本批 |
| `index.ts:18` | `./pdf-engine.ts` | 本批 |

## 3. 内部逻辑与关键流程

本文件不适用，依据：无函数/类/常量，仅 12 条再导出（`index.ts:7-18`）。

## 4. 调用者与调用链

- 入向：`packages/core/src/index.ts` 整包再导出（边界）；生产消费方经 `@profer/core/pdf-engine` 动态 import（`document-parser.ts:154`、`document-parse-tools.ts:541`、`review/document-service.ts:350`、`study/study-document-indexer.ts:288`——行号为各文件 import 语句，grep 证据）。
- 出向：12 个同目录模块（见 §2 表）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用（已证实）。

## 6. 分支、失败、取消与恢复

不适用，依据：无分支/异常/取消路径。

## 7. 权限与权威状态

无权限分支，依据：纯再导出。

## 8. 修改影响面

增删 `export *` 行直接改变 `@profer/core/pdf-engine` 的公开面；`academic-enricher.ts` 缺失会导致整包 import 失败（它被 `pdf-engine.ts:20` 实际依赖）。

## 9. 测试证据

`NOT_RUN`。无直接测试（薄再导出文件，无行为可断言）；间接经各模块测试（部分域外）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 条 `export *`、`.ts` 后缀说明符、无逻辑 | 已证实 | `index.ts:1-18` 全文 |
| `academic-enricher.ts` 不在本批 scope | 已证实（边界声明） | SCOPE 文件集合不含它 |
| 全包入口 `packages/core/src/index.ts` 再导出面 | 边界 | 该文件未深读 |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 再导出 | §2 | 7-18 | covered |
| 调用链/影响面 | §4/§8 | — | covered |

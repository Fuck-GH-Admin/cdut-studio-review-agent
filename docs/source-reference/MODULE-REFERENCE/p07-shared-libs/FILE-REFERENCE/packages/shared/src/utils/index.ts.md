---
path: packages/shared/src/utils/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6c326b8bb8829daf129b83d5033cff725a1dfdbe
sha256: 83bda4ec19c8762f9697eecbcaa0ad93034f4b6f01b7e29c1af66c464bab2be6
lines: 288
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/index.ts

## 1. 结论与边界

`@profer/shared` 的 **utils 出口 barrel**：`packages/shared/src/index.ts:8` `export * from './utils/index'` 汇聚，外部统一经包名消费。288 行 = 1 个自身定义 + 40 个模块再导出（约 59 条 export 语句）。

边界：纯转发无逻辑；符号级语义/调用面见各模块手册（本批/前批 nb-30~32 已逐篇覆盖）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `noop` | function | 6-8 | **唯一自身定义**（占位注释 `:4`「will be expanded as needed」） |

再导出模块 40 个（`:10-288`，按序）：capabilities-diff、goal-contract、context-window、context-usage、thinking-signature-error、normalize-path、url-nul-safety、cslab-fuzzy-search、agent-image-attachment、channel-plan-quota、tab-mru、pi-compaction、automation-schedule、context-entropy-pruner、mindmap-engine、fim-engine、cslab-zotero、cslab-plot、cslab-canvas、cslab-dag、cslab-crystal、cslab-marginalia、cslab-track-changes、cslab-scattering-data、cslab-space-group-data、cslab-analysis、cslab-cif、cslab-poscar、cslab-xyz、cslab-symmetry、cslab-fitting、cslab-pxrd、cslab-polyhedra、cslab-volume、cslab-isosurface、cslab-plot-doc、cslab-plot-svg 等（含各 `export type` 条目）。

## 3. 内部逻辑与关键流程

本文件不适用——依据：纯 `export … from` 转发（无计算逻辑）。

## 4. 调用者与调用链

出向：40 个 `./<module>`。入向：`packages/shared/src/index.ts:8`（唯一入口聚合）；下游经 `@profer/shared` 包名消费（apps/electron main/renderer、packages/session-core 等——各模块手册 §4 逐符号实证）。barrel 本身无直接符号级消费者（`export *` 语义）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯转发。

## 6. 分支、失败、取消与恢复

本文件不适用——依据：无分支。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

增删再导出条目会改变 `@profer/shared` 公共面（全产品 import 面）；`noop` 为占位。

## 9. 测试证据

无专属测试（barrel 语义由下游测试间接覆盖）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 40 模块转发+1 自定义 | 已证实 | `:10-288` |
| 全部再导出条目与模块导出一致（无选择性过滤） | 已证实（逐段核对本批/前批模块手册） | 全文 |
| `noop` 零消费 | 推断（占位注释+未见下游） | `:4-8` |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `noop` | §2 | 6-8 | covered |
| 40 模块转发 | §2, §4 | 10-288 | covered |

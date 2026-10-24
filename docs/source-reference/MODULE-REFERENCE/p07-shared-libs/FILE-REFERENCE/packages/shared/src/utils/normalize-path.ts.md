---
path: packages/shared/src/utils/normalize-path.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4326212c23b8d286841847f649e3d66dfba33bbb
sha256: 9c916fa12a608598d410688e2bfba340110a97eab6d8b50668684560879638cd
lines: 7
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/normalize-path.ts

## 1. 结论与边界

跨平台路径比较归一化（`packages/shared/src/utils/normalize-path.ts:1-4`）：反斜杠→正斜杠、去尾部斜杠。7 行单函数模块。

边界：不做大小写归一/盘符处理/`..` 解析——仅比较用归一（非路径解析）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `normalizePathForCompare` | function | 5-7 | `(filePath: string) => string` | 唯一导出 |

## 3. 内部逻辑与关键流程

本文件不适用（单表达式链）——依据：`replace(/\\/g,'/').replace(/\/+$/,'')` 两步替换。

## 4. 调用者与调用链

出向：无 import。入向（检索=符号名+模块名，全冻结树）：`apps/electron/src/main/ipc.ts:15,893,897,909`、`apps/electron/src/main/lib/git-diff-service.ts:12,65`、`apps/electron/src/renderer/components/diff/WorktreeSelector.tsx:5,21`（main+renderer 均有产品调用）。**同名碰撞警示**：`apps/electron/src/main/lib/windows-env.ts:100` 本地同名函数（非本符号）；bun.lock 中同名 npm 包 `normalize-path`（同名不同物）。无测试。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

本文件不适用——依据：无分支。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

归一语义影响路径比较判等（caller 见 §10）；根路径 `'/'` 归一为 `''`（尾斜杠全剥——边界语义，照实记录）。

## 9. 测试证据

无同名测试文件（`url-nul-safety.test.ts` 是相邻主题）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 两步替换语义 | 已证实 | `:5-7` |
| 根路径→空串边界 | 已证实（推演） | 正则语义 |
| 生产 caller | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `normalizePathForCompare` | §2 | 5-7 | covered |

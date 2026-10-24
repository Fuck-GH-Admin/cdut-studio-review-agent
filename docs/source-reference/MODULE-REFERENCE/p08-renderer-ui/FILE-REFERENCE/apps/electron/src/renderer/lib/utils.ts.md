---
path: apps/electron/src/renderer/lib/utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8dff152c0aa673b605e8ac0d2d72208866b52413
sha256: fbb81bc6c329349f06f975433215ef934111f77372e8902e2d1d347fc29cfde1
lines: 6
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/utils.ts

## 1. 结论与边界

全仓通用 className 合并工具（`cn`）：`twMerge(clsx(inputs))`——条件类名拼装后按 Tailwind 语义去重（后者覆盖前者的冲突类）。纯函数、无副作用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `cn` | function | `:4-6` | `(...inputs: ClassValue[]) => string` |

## 3. 内部逻辑与关键流程

单行组合：`clsx`（条件拼装）→`twMerge`（Tailwind 冲突类合并）。无分支。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：几乎全部组件的 className 合并处（`@/lib/utils` 高频引用）。出向：`clsx`、`tailwind-merge`。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

无（纯组合）。

## 7. 权限与权威状态

无权限语义；合并语义以 tailwind-merge 为准（后类覆盖冲突前类）。

## 8. 修改影响面

改 `cn` → 全仓样式合行为连锁（高频基础件）。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯函数组合 | 已证实 | `:1-6` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `cn` | 2/3 | `:4-6` | covered |

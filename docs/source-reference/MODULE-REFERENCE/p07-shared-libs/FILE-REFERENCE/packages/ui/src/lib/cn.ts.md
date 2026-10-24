---
path: packages/ui/src/lib/cn.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 03bdc3dd9733acab39e675e49c606c25f9ae786c
sha256: b13b322c47bde482481ac17b1f6b1fff6853efdbbcc425f1149eeeb07ee1b2e3
lines: 7
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/lib/cn.ts

## 1. 结论与边界

Tailwind 类名合并工具（`packages/ui/src/lib/cn.ts:1-7`）：`clsx` 组合 + `tailwind-merge` 去重，注释自述"与原 `@/lib/utils` 的 cn 完全一致"（`:42` 行注释实为 `:5`，见下表）。纯函数、无副作用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `cn` | function（export） | `:5-7` | `(...inputs: ClassValue[]) => string` | `twMerge(clsx(inputs))`（`:6`） |

无内部符号。依赖：`clsx`（`:3`）、`tailwind-merge`（`:4`）。

## 3. 内部逻辑与关键流程

单行组合（`:6`）：先 `clsx` 归并条件类名，再 `twMerge` 消除 Tailwind 冲突类（后者胜出）。无分支。

## 4. 调用者与调用链

- 入向：`@profer/ui` 包内 `primitives/*`（如 `alert-dialog.tsx:6`）与全仓 44 个 `from '@profer/ui'` 文件（含 `apps/electron/src/renderer/lib/utils.ts` 等价实现消费者）；`packages/ui/src/index.ts:15` 再导出。
- 出向：`clsx`、`tailwind-merge` 两个 npm 包。

## 5. 数据 I/O、读写与副作用

纯函数：无 I/O、无状态、无副作用。

## 6. 分支、失败、取消与恢复

无分支、不抛错（`twMerge/clsx` 对任意输入返回字符串）。不适用项依据：全文 7 行无条件逻辑。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查（纯工具）。

## 8. 修改影响面

改动签名/语义 → 包内 primitives 与 44 个外部消费者类名合并行为；与 `apps/electron/src/renderer/lib/utils.ts` 的同名实现保持等价的约定（注释 `:5`）会被打破。无直接测试。

## 9. 测试证据

无直接测试（负向：冻结树 `apps/`+`packages/` 全部 `*.test.*` 检索 `cn(` 于本模块语境 → 0 专属命中）；间接经各组件渲染存在。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出、纯函数、无分支 | 已证实 | 逐行读 `:1-7` |
| 与 renderer `lib/utils` cn 等价 | 推断 | 注释自述 `:5`，未逐字节比对两实现 |
| twMerge 版本行为 | 未知 | npm 依赖 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `cn` | §2/§3 | `:5-7` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

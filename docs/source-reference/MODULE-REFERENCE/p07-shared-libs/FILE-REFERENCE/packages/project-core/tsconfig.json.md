---
path: packages/project-core/tsconfig.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 73a65ef2ef6e5658643310ffc67e5391df2cbbc1
sha256: 1de5fbec4888f903fd7d0695642e6c2cb46ae9f5e944df0d93a4fd1aaa2325d6
lines: 5
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/project-core/tsconfig.json

## 1. 结论与边界

project-core 的 TypeScript 编译配置（5 行）：`extends: ../../tsconfig.json`、`include: ["src/**/*"]`、`compilerOptions` 空覆盖（:3）。根 tsconfig（bundler 解析/strict/noEmit）应用于本包；typecheck 脚本以此为准。**不参与导出解析**（导出由 package.json 的 main/exports 决定，该文件不在本批清单）。

## 2. 导出与关键符号

不适用，依据：JSON 配置无导出。字段：`extends`/`compilerOptions`（空）/`include`（:2-4）。

## 3-7. 逻辑/数据/分支/权限

不适用，依据：静态配置文件，无运行时逻辑、无 I/O、无分支、无权限。

## 8. 修改影响面

本包 typecheck 范围；根 tsconfig 改动直接传导。

## 9. 测试证据

无直接测试；typecheck NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| extends 根配置+include src | 已证实 | :2-4 |
| 根 tsconfig 具体选项 | 未知（批外） | extends |

## 11. 覆盖表

| 字段 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| extends/compilerOptions/include | §1 | :2-4 | covered |

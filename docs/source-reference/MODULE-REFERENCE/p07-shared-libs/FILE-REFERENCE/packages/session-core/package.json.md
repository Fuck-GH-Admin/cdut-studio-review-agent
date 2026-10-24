---
path: packages/session-core/package.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 155b81fc3ac11b69262efa6a18bbfb0f56d67f8c
sha256: 3aa11612edf06da7097bb97494abda9a8126f3c06e7fda76dad2292f1f73ad4f
lines: 23
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/session-core/package.json

## 1. 结论与边界

`@profer/session-core` v0.1.1 包清单（AGPL-3.0-only，:3）：**双入口设计**（:9-12）——`"."` → `./src/index.ts`（纯函数/浏览器安全），`"./node"` → `./src/node.ts`（含 node:fs，防 Vite 把 node:fs 打进渲染层 bundle，与 index.ts:7-9/read-fs.ts:4-5 注释一致）。`type: module`；main/types 均 `./src/index.ts`。

## 2. 导出与关键符号

不适用，依据：JSON 配置。关键字段：`exports`（:9-12）、`scripts`（typecheck/test :13-16）、`dependencies: @profer/shared (workspace:*)`（:17-19）、devDependencies typescript（:20-22）。

## 3. 内部逻辑与关键流程

不适用，依据：静态清单；exports map 决定 Node/Vite 解析入口。

## 4. 调用者与调用链

入向：`apps/cli/package.json:16`、`apps/electron/package.json:97`（均 `workspace:*` 声明）。出向：声明依赖 `@profer/shared`。

## 5. 数据 I/O、读写与副作用

不适用，依据：配置文件。

## 6-7. 分支/权限

不适用。

## 8. 修改影响面

两消费端（cli/electron）的依赖解析与打包行为；exports map 改动影响全部 `@profer/session-core` import。

## 9. 测试证据

无直接测试；`session-core.test.ts`（批外）经此包运行。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双入口 exports map | 已证实 | :9-12 |
| 依赖 @profer/shared | 已证实 | :17-19 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 字段 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| exports/scripts/dependencies | §1/§2 | :9-22 | covered |

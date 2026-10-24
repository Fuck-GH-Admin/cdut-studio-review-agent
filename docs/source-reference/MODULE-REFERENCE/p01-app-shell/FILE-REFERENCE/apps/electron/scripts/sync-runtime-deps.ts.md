---
path: apps/electron/scripts/sync-runtime-deps.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 889a7559215932001eba6e8a6a994bd28d8b5bec
sha256: 623a7d264d4461fee7dc57a3b8e032fdd18017638e5386a326517b5fd4d62dbe
lines: 237
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/sync-runtime-deps.ts

## 1. 结论与边界

**主进程 external runtime 依赖闭包同步器**（237 行，头注释 `:2-6`）：Bun workspace 提升依赖到根目录，打包 appDir=apps/electron——必须复制运行时依赖避免安装包 MODULE_NOT_FOUND。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `EXTERNAL_RUNTIME_PACKAGES` | 常量 | `:44` | **7 包**：@anthropic-ai/sdk、pi-coding-agent、pi-agent-core、pi-ai、@silurus/ooxml（build:renderer 用，注释 `:49-50`）、pdfjs-dist、ssh2（esbuild external 原生依赖，注释 `:53-54`） |
| `SyncRuntimeDepsOptions/Result` | 接口 | `:30,38` | cleanTarget（打包清空/开发可 false）/计数与跳过清单 |
| `syncRuntimeDeps(options)` | 函数 | `:207` | 主入口（CLI：`--no-clean` `:234`） |

内部：包解析链 `getPackageDir`/`resolvePackageFromNodeModules`/`resolvePackageUpwards`（`:65-88`，逐级向上）/`resolvePackageSourceDir`（`:90`，三源 fallback：sourceNodeModules/bun 虚拟/repo）；`copyPackage`/`copyDependency`（`:113-175`）；`assertNoAbsoluteSymlinks`（`:177`）；`prepareTargetNodeModules`（`:198`）。

## 3. 内部逻辑与关键流程

- 闭包复制（`:113-175`）：解析源（缺→optional 记跳过/必需 throw `:123-127`）→**版本冲突检测**（同目标不同源→throw `:133-135`）→cpSync dereference→递归 dependencies+optionalDependencies；嵌套冲突时放父级 node_modules（`:169-174`）；环检测（sourceAncestors `:167`）。
- 安全护栏（`:198-205,216-222`）：源=目标 throw、目标非 node_modules basename 拒绝清理；`cleanTarget:false` 同护栏。**绝对 symlink 拒绝**（打包后解析失效，`:177-196`）。
- 默认源=根 `.bun/node_modules`（bun 虚拟存在则用）否则根 node_modules（`:61-62`）。

## 4. 调用者与调用链

- 入向：打包脚本（dist 前置，域外）；CLI 自用。
- 出向：node fs/path。

## 5. 数据 I/O、读写与副作用

写 apps/electron/node_modules（cleanTarget 时全清重建）；读包 manifest 递归。

## 6. 分支、失败、取消与恢复

缺依赖/版本冲突/绝对 symlink/误删护栏→throw；optional 缺→跳过清单。

## 7. 权限与权威状态

依赖闭包权威=EXTERNAL_RUNTIME_PACKAGES 7 包清单+manifest 递归；打包完整性=绝对 symlink 禁令。

## 8. 修改影响面

electron-builder 打包依赖收集；external 包清单变更影响安装包 MODULE_NOT_FOUND 风险面。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 包清单/冲突检测/护栏三段/嵌套回落 | 已证实 | `:1-237` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+内部族 | §2/§3 | 30-237 | covered |

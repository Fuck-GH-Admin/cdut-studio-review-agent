---
path: scripts/check-boundaries.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b77ef4b5dc52dbed19d42fb7fe58099668968ec2
sha256: ed6943ada82184070a98011dd84061236426fb41cf9a87cca2069b25206ce09f
lines: 177
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# scripts/check-boundaries.ts

## 1. 结论与边界

packages/apps 架构边界检查（零第三方依赖，bun 直跑；`bun run check:boundaries`，退出码 0 无违规/1 有违规，文件头 `scripts/check-boundaries.ts:1-16`）。七条强制规则（与 2026-09-30 模块化调研报告对齐，`:5-12`）：R1 packages 禁 electron、R2 packages 禁引 apps、R3 packages 仅声明过的 @profer/*、R4 @profer 子路径命中目标 exports、R5 相对路径禁逃逸 workspace 根、R6 renderer 禁 electron/node 内置、R7 apps/cli 仅声明过的 @profer/*。

边界：不做类型检查（tsc）；只扫 `.ts/.tsx`（`:34`）；正则级 import 提取非 AST（`:69`）。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（CLI 脚本）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `walk` | 函数（内部） | 27-37 | 递归收集 .ts/.tsx（跳过 node_modules/dist/点目录，`:30`） |
| `PkgInfo`/`pkgCache`/`loadPkg` | 内部 | 39-59 | 包信息缓存（name/@profer 依赖/exports 键） |
| `NODE_BUILTINS` | 常量（内部） | 61-67 | 38 个内置模块名 |
| `IMPORT_RE`/`collectSpecifiers` | 内部 | 69-83 | import/export/dynamic-import 三形态正则+粗去注释（`:74`） |
| `Violation`/`report`/`checkFile` | 内部 | 87-150 | 违规记录与七规则执行 |

## 3. 内部逻辑与关键流程

1. `checkFile(file, scope)`（`:100-150`）：`workspaceRootOf` 定位 ws 根（`:101`）；**renderer 的测试文件降级为 electron-non-renderer 豁免 R6**（`:103-104`，测试跑 bun/node 环境）。
2. 逐 specifier（`:105-149`）：electron import → R1(package)/R6(renderer)（`:107-110`）；node 内置/`node:` → R6（`:111-114`）；`@profer/*` → R3/R7 依赖声明检查（自身包名豁免 `:121`）+ R4 子路径 exports 匹配（支持尾通配 `./x/*`，`:124-133`，目标 `packages/<name>` 不存在则跳过）；相对路径 → R5 逃逸（`:139-143`）+ R2 packages→apps（`:145-147`）。
3. 扫描范围（`:152-164`）：`packages/*/src`（scope=package）、`apps/cli/src`（cli）、`apps/electron/src/renderer`（renderer）、`apps/electron/src/{main,preload}`（electron-non-renderer，仅逃逸检查）。
4. 输出（`:166-177`）：0 违规绿字 exit 0；否则逐条 `[rule] file:line`+detail 到 stderr exit 1。

## 4. 调用者与调用链

入向：`package.json:25`（`check:boundaries` = `bun scripts/check-boundaries.ts`）；测试经 fixture spawnSync 执行（`check-boundaries.test.ts:65`）。

出向：`./check-boundaries-paths`（`isPathWithin`/`workspaceRootOf`，`:21`）、`node:fs`/`node:path`/`node:url`（`:18-20`）。

## 5. 数据 I/O、读写与副作用

- 读：workspace 内 package.json 与 .ts/.tsx 源码（`walk`+`readFileSync`）；写：仅 stdout/stderr。
- 副作用：进程退出码。并发/幂等：纯扫描，可重复运行。
- 性能：全量文件正则扫描（无缓存跨运行）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 测试豁免 R6 | renderer 测试文件 | 103-104 |
| 自身包豁免 R3/R7 | targetName===pkg.name | 121 |
| exports 尾通配 | `k.endsWith('/*')` | 129 |
| 目标包不存在跳 R4 | existsSync | 126 |
| 注释误报防护 | 粗去注释 | 74 |
| 退出码 | 违规数 | 168-177 |

坏 package.json 使 `loadPkg` 抛错（无捕获，扫描中断 exit 1，推断）；无取消/恢复概念。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；规则权威=文件头七条约定（`:5-12`）与模块化调研报告（外部文档）。R1/R6 是安全边界检查（electron/node 泄漏进 renderer/packages）。

## 8. 修改影响面

- `package.json:25`（CI/开发检查入口）；`check-boundaries-paths.ts`（判定基础）；`check-boundaries.test.ts`（fixture 端到端）。
- 新增规则/改正则影响全仓合规判定；`IMPORT_RE` 覆盖面（静态 import/动态 import/export-from）是检测完备性边界（字符串拼接 import 不可检测，照实记录）。
- 需同步的测试：`check-boundaries.test.ts`（8 定义/14 执行，本批）。

## 9. 测试证据

直接测试：`scripts/check-boundaries.test.ts`（本批，8 定义/14 执行，逐条见该手册）。真实断言：fixture 端到端三例——合法内部引用 exit 0（`:78-82`）、跨 workspace 引用 `[R5]`+`[R2]`（`:84-89`）、未声明依赖 `[R3]`（`:91-96`）。

未覆盖：R1/R4/R6/R7 的端到端 fixture、注释误报防护、动态 import。

NOT_RUN：本轮未运行任何测试/typecheck/构建/脚本执行；断言均为静态读取。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 七规则执行 | 已证实 | `:1-177` 逐行读 |
| 测试豁免/自身豁免/尾通配 | 已证实 | `:103-104,121,129` |
| 扫描范围四段 | 已证实 | `:152-164` |
| 唯一调用入口 | 已证实 | `package.json:25` |
| 动态拼接 import 不可测 | 已证实 | 正则方案 `:69` |
| 运行期行为/实际违规数 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| walk/loadPkg/collectSpecifiers | §2-3 | 27-83 | covered |
| checkFile 七规则 | §3 | 100-150 | covered |
| 扫描范围/输出 | §3 | 152-177 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

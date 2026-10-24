---
path: bunfig.toml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ce7bca93905580463146709f6c0e222c02b32b1d
sha256: c070c858773f193323b791eee88ec48a6801b978f24d128ab5685cf93ad35269
lines: 19
kind: config
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# bunfig.toml

## 1. 结论与边界
Bun 工具配置（workspace 根，纯配置）：固定 `bun test` 的 preload（统一 electron mock）与安装 linker（hoisted）（`bunfig.toml:1-19`）。边界：只影响从仓库根执行的 bun 命令；`apps/electron/bunfig.toml` 是子包对应副本（相对路径不同）；不配置 isolate（Bun 1.3.14 不支持配置项，须 CLI 传 `--isolate`，`bunfig.toml:8-9` 注释自述）。

## 2. 导出与关键符号
不适用，依据：TOML 配置，无 export/符号。键清单（2 组 3 键）：`[test].preload = ["./test/preload-electron-mock.ts"]`（`bunfig.toml:4-7`）；`[test].pathIgnorePatterns = ["server/**/*.node.test.mjs"]`（`:8-12`）；`[install].linker = "hoisted"`（`:14-19`）。默认值来源：未出现的 bunfig 键走 Bun 默认值（推断自工具语义）。

## 3. 内部逻辑与关键流程
不适用，依据：无执行逻辑。工具语义（推断）：`bun test` 启动时先执行 preload（`bunfig.toml:7`），再加载测试文件；匹配 `pathIgnorePatterns` 的 `server/**/*.node.test.mjs` 不被 bun test 收集（`:12`，注释自述这些用例依赖 better-sqlite3/node:test，须由 `server/scripts/run-node-tests.mjs` 以 node 直跑，`:10-11`）。

## 4. 调用者与调用链
入向：bun CLI（`bun test`/`bun install`）从仓库根 cwd 自动加载本文件（工具约定，推断）。真实测试入口显式带 `--isolate`：`package.json:27` `"test": "bun test --isolate"`、`apps/electron/package.json:46`、发布脚本 `scripts/push-release.cjs:244` 与 `scripts/push-mac-release.cjs:101` 均 `bun test --isolate`。出向：preload 目标 `test/preload-electron-mock.ts`（192 行，真实存在）在其中 `mock.module('electron', …)`（`test/preload-electron-mock.ts:88`），mock 契约（新增 electron API 必须同步补齐）自述于 `test/preload-electron-mock.ts:11-15`；测试钩子 `globalThis.__proferElectronTestHooks`（`:46-60`）、`MockBrowserWindow`（`:62-86`）。测试侧对 preload 语义的依赖佐证：`apps/electron/src/main/lib/review/review-model-gateway.test.ts:7` 注释。

## 5. 数据 I/O、读写与副作用
不适用，依据：本文件无 I/O 代码。副作用链（工具层）：preload 在每个测试文件前注册 electron mock，使 `bun test` 永不真实加载 electron（`test/preload-electron-mock.ts:8-10` 注释自述的执行顺序问题）；`linker=hoisted` 使 node_modules 为 npm 式扁平布局，避免 Windows 符号链接权限问题（`bunfig.toml:15-18` 注释自述）。

## 6. 分支、失败、取消与恢复
不适用，依据：无分支与错误路径。已知限制（注释自述）：Bun 1.3.14 无法在 bunfig 配置 isolate，缺 `--isolate` 时 mock.module 跨文件泄漏（`bunfig.toml:8-9`；泄漏实例记录于 `work/decision-log/2026-10-02-decision-log.md:45` 的决策 38，属历史文档线索）。恢复/兜底：无（配置缺失时行为为 Bun 默认值，推断）。

## 7. 权限与权威状态
无权限分支，依据：本文件无 sender/role 检查。mock 版本契约的权威在 `test/preload-electron-mock.ts:12-13`（app.getVersion 需与 `apps/electron/package.json` 的 electronVersion 一致，注释自述，未逐值核对）。

## 8. 修改影响面
改 `preload`（`bunfig.toml:7`）会解除全局 electron mock，导致真实加载 electron 的测试报 "Export named '…' not found"（`test/preload-electron-mock.ts:5-7` 自述失效模式）；删 `pathIgnorePatterns`（`:12`）会让 bun test 收集 `*.node.test.mjs` 而缺 better-sqlite3 环境时红；改 `linker`（`:19`）影响 Windows 安装与打包脚本兼容布局（`:18` 注释自述）。需同步修改的配置：`apps/electron/bunfig.toml`（保持一致，见该文件手册）。

## 9. 测试证据
无直接测试文件针对本配置本身（全树 `*.test.*` 检索 `bunfig` 命中均为注释说明，无断言本文件行为；范围：全部 .ts/.tsx/.js/.mjs 测试文件）。间接证据：所有 `bun test` 用例经 preload 生效（`test/preload-electron-mock.ts` 全局加载）。NOT_RUN：本轮未运行任何测试（静态阅读）。

## 10. 已证实 / 推断 / 未知
| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 键取值与行段如 §2 | 已证实 | `bunfig.toml:4-19` 逐行 |
| preload 目标存在且 mock electron | 已证实 | `test/preload-electron-mock.ts:88`（192 行） |
| 正式入口均显式 `--isolate` | 已证实 | `package.json:27`、`apps/electron/package.json:46`、`scripts/push-release.cjs:244`、`scripts/push-mac-release.cjs:101` |
| node 原生测试排除由 server 脚本直跑 | 已证实 | `bunfig.toml:10-12`（注释自述，脚本未逐行读） |
| bun CLI 自动加载 bunfig.toml | 推断 | Bun 工具语义 |
| isolate 不可配置（Bun 1.3.14） | 推断 | `bunfig.toml:8-9` 注释自述 + 入口均带 CLI 参数 |
| mock 版本与 electronVersion 一致性当前是否满足 | 未知 | 未逐值核对（仅契约自述 `test/preload-electron-mock.ts:12-13`） |

## 11. 覆盖表
| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| [test].preload | §2/§4/§8 | `bunfig.toml:4-7` | covered |
| pathIgnorePatterns | §2/§3/§8 | `bunfig.toml:8-12` | covered |
| [install].linker | §2/§5/§8 | `bunfig.toml:14-19` | covered |
| isolate 限制 | §6 | `bunfig.toml:8-9` | covered |
| 下游 preload 契约 | §4/§7 | `test/preload-electron-mock.ts:88` | covered |

---
path: apps/electron/bunfig.toml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c1a3761b15c4ddb33ce3363955201197aa61bb15
sha256: 1c7bb800e2420bef1f64e462ba2e20a593a611e1d3315d822fea0c3960e5807b
lines: 12
kind: config
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/bunfig.toml

## 1. 结论与边界
Bun 工具配置（Electron 子包副本，纯配置）：使 `apps/electron/` 可独立执行 `bun test` 时保持与 workspace 根相同的测试契约——preload 指向 `../../test/preload-electron-mock.ts`（`apps/electron/bunfig.toml:1-5`）并固定 hoisted linker（`:9-12`）。边界：只在从 `apps/electron/` cwd 执行 bun 命令时生效；根 `bunfig.toml` 的相对路径在子包 cwd 不适用（`:2` 注释自述）。

## 2. 导出与关键符号
不适用，依据：TOML 配置，无 export/符号。键清单（2 组 2 键）：`[test].preload = ["../../test/preload-electron-mock.ts"]`（`apps/electron/bunfig.toml:4-5`）；`[install].linker = "hoisted"`（`:9-12`）。与根 `bunfig.toml:7`/`:19` 语义相同、仅相对路径不同。

## 3. 内部逻辑与关键流程
不适用，依据：无执行逻辑。工具语义（推断）：从 `apps/electron/` 运行 `bun test` 时先加载 `../../test/preload-electron-mock.ts`（即仓库根 `test/preload-electron-mock.ts`，192 行）注册 electron mock，再跑测试文件。isolate 仍须 CLI 传参（`apps/electron/bunfig.toml:7` 注释自述）。

## 4. 调用者与调用链
入向：bun CLI 从 `apps/electron/` cwd 自动加载（工具约定，推断）；对应入口 `apps/electron/package.json:46` `"test": "bun test --isolate"`。出向：`test/preload-electron-mock.ts`（真实存在；`mock.module('electron', …)` 于 `test/preload-electron-mock.ts:88`，mock 契约自述 `:11-15`）。指向关系已核实：`apps/electron/../../test/preload-electron-mock.ts` 解析到冻结树真实文件。

## 5. 数据 I/O、读写与副作用
不适用，依据：本文件无 I/O 代码。副作用（工具层）：子包独立测试同样被全局 electron mock 覆盖（同根 `bunfig.toml` 手册 §5）；hoisted 布局避免子包单独 `bun install` 时回落 isolated 链接器在 Windows 产生符号链接解析失败（`:10-11` 注释自述）。

## 6. 分支、失败、取消与恢复
不适用，依据：无分支与错误路径。失败模式（注释自述）：缺本文件时从子包 cwd 跑测试不会加载 preload，electron 被真实加载后 mock 失效（`:1-2` 自述动机）；Bun 1.3.14 的 isolate 仅 CLI（`:7`）。无恢复逻辑。

## 7. 权限与权威状态
无权限分支，依据：本文件无 sender/role 检查。契约权威：与根 `bunfig.toml` 保持一致（`apps/electron/bunfig.toml:1`、`:10-11` 注释自述一致性要求）。

## 8. 修改影响面
改 `preload` 路径（`:5`）会使子包测试脱离统一 electron mock（失效模式同 §6）；改 `linker`（`:11`）会与根配置漂移，Windows 安装布局不一致。需同步修改：根 `bunfig.toml`（两文件契约一致）。无测试直接断言本文件（见 §9）。

## 9. 测试证据
无直接测试文件（全树 `*.test.*` 检索 `bunfig` 命中均为注释，无断言本文件；范围：全部 .ts/.tsx/.js/.mjs 测试文件）。间接证据：子包测试经 preload 全局生效。NOT_RUN：本轮未运行任何测试（静态阅读）。

## 10. 已证实 / 推断 / 未知
| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 键取值与行段如 §2 | 已证实 | `apps/electron/bunfig.toml:4-12` 逐行 |
| preload 相对路径解析到真实文件 | 已证实 | 路径核对（`test/preload-electron-mock.ts` 存在，192 行） |
| 子包测试入口带 --isolate | 已证实 | `apps/electron/package.json:46` |
| 子包 cwd 不继承根 bunfig 相对路径 | 推断 | `apps/electron/bunfig.toml:2` 注释自述 + Bun 工具语义 |
| bun CLI 自动加载子包 bunfig | 推断 | Bun 工具语义 |
| 子包单独 bun install 的实际布局历史 | 未知 | 未运行安装验证 |

## 11. 覆盖表
| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| [test].preload | §2/§4/§8 | `apps/electron/bunfig.toml:4-5` | covered |
| [install].linker | §2/§5/§8 | `apps/electron/bunfig.toml:9-12` | covered |
| 与根配置一致性契约 | §1/§7 | `:1`、`:10-11` | covered |
| isolate 限制 | §6 | `:7` | covered |

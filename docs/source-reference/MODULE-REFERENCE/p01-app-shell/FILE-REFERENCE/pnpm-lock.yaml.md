---
path: pnpm-lock.yaml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 44f2db1ef25edc2e76e5dcdd8109de3f2c95bb19
sha256: 23c97d51876c3cd6c4a0d7b89ecafd2bd6c370c634a585b50d2a628adb133bdc
lines: 325
kind: config
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# pnpm-lock.yaml

## 1. 结论与边界

pnpm 锁文件（静态配置，`lockfileVersion: '9.0'`，`pnpm-lock.yaml:1-4`）：锁定**根 importer** 的依赖解析（jotai/source-map + 9 个 devDependencies）及 28 个包的 resolution/snapshot。`settings`：`autoInstallPeers: true`、`excludeLinksFromLockfile: false`（`:3-4`）。

边界（照实记录）：importers **仅含 `.` 根**（`:6-38`），不含 `packages/*`/`apps/*` workspace 子包（与根 `package.json` workspaces 并存；子包依赖由 bun 管理，推断——仓库脚本用 `bun run`/`bun test`）；无 `@earendil-works/*` 条目（根 overrides 钉 0.86.1 但本锁不含，推断其解析发生在 bun 侧/其它安装流程）。

## 2. 键清单与导出符号

| 段 | 行 | 内容 |
| --- | --- | --- |
| `lockfileVersion` | 1 | `'9.0'` |
| `settings` | 3-4 | autoInstallPeers/excludeLinksFromLockfile |
| `importers` | 6-38 | 仅 `.:` 根：dependencies（jotai 2.20.3、source-map 0.7.6）+ devDependencies 9 项（@types/bun 1.4.2、@types/dompurify 3.2.0（deprecated stub `:55`）、@types/node 20.19.43、@types/react 18.3.31、@types/react-dom 18.3.7、dompurify 3.4.15、jszip 3.10.1、rcedit 5.0.2（deprecated `:143`）、typescript 5.9.3） |
| `packages` | 40-186 | 28 包的 resolution（integrity sha512）+ engines/peerDependencies/hasBin |
| `snapshots` | 188-325 | 依赖图（如 jszip→lie/pako/readable-stream/setimmediate、rcedit→cross-spawn-windows-exe→cross-spawn 等） |

无导出符号（数据文件）。

## 3. 内部逻辑与默认值来源

纯数据。版本钉定来自根 `package.json` 的 specifier（`:8-38` 逐项对应）；`@types/dompurify` 为 stub（官方自带类型，`:55` deprecated 注记）；`rcedit` deprecated（`:143`）。

## 4. 调用者与调用链

消费方=包管理器 pnpm（安装/校验）。仓库内无代码读取本文件（全树检索 `pnpm-lock` 仅根 package.json workspaces 语境）。

## 5. 数据 I/O 与环境覆盖

无（数据文件）；无环境覆盖。

## 6. 分支、缺失与非法值行为

无分支。锁文件损坏时 pnpm 报错/重解析（推断）。缺失条目（如 `@earendil-works/*`）由实际安装工具的解析流程决定（未知）。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；版本权威=锁文件 vs `package.json` specifier 一致性。

## 8. 修改影响面

- 依赖解析可复现性：改本文件影响 pnpm 安装结果（根 11 个直接依赖的传递闭包 28 包）。
- 与根 `package.json`（`dependencies`/`devDependencies`）耦合：specifier 不一致会触发锁更新。
- 注意：仓库实际开发/构建链用 Bun（`bun run`/`bun test --isolate`），本锁覆盖范围与 bun 安装面的关系未在冻结树核实（标未知）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 `pnpm-lock` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/pnpm install。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 结构/版本/integrity 全读 | 已证实 | `pnpm-lock.yaml:1-325` 逐行读 |
| importers 仅根 | 已证实 | `:6-38` |
| 无 @earendil-works 条目 | 已证实 | 全文件检索 |
| 两个 deprecated 注记 | 已证实 | `:55,143` |
| 子包由 bun 管理、锁用途 | 推断 | 脚本链用 bun |
| pnpm/bun 双工具链实际分工 | 未知 | 未在冻结树核到 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 段 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| lockfileVersion/settings | §2 | 1-4 | covered |
| importers | §2-3 | 6-38 | covered |
| packages/snapshots | §2 | 40-325 | covered |
| 工具链分工 | §10 | - | unknown |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

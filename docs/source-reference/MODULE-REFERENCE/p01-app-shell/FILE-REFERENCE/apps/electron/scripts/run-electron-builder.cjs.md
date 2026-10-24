---
path: apps/electron/scripts/run-electron-builder.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 79f32334882b52fce7e47755a0919de7a72e05f6
sha256: 5c198dbb75845923085f93b992a0d8cefdcae3d9a1d3e641f73fbb1a2e61d9a7
lines: 48
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/run-electron-builder.cjs

## 1. 结论与边界

electron-builder 的唯一启动包装器：先过打包宿主门禁，再从 Bun 工作区锁定的安装位置解析出**唯一** electron-builder CLI 并以子进程执行（`apps/electron/scripts/run-electron-builder.cjs:1-8` 文件头注释、`:42-46` spawn）。纯 Node CJS 脚本，无导出，作为 CLI 被 package.json 脚本链与 CI 调用。

边界：不解析 electron-builder 配置（`apps/electron/electron-builder.yml` 由 electron-builder 自身读取）；不做 macOS 签名（由 `apps/electron/scripts/macos-signature.cjs` 钩子负责）；不安装依赖——缺 CLI 只报错提示 `bun install --frozen-lockfile`（`apps/electron/scripts/run-electron-builder.cjs:38-40`），绝不 `bun x`/`npx` 拉未锁定版本（`:3-5` 注释说明动机）。

## 2. 导出与关键符号

无 `module.exports`（`export` 计数 0，`apps/electron/scripts/run-electron-builder.cjs` 全文无导出语句）。关键内部符号：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `builderArgs` | 内部常量 | 11 | `string[]` | `process.argv.slice(2)`，透传给 electron-builder |
| `appDir` | 内部常量 | 19 | `resolve(__dirname,'..')` | apps/electron，子进程 cwd |
| `repoRoot` | 内部常量 | 20 | `resolve(appDir,'../..')` | 仓库根，依赖查找基准 |
| `bunStore` | 内部常量 | 21 | `join(repoRoot,'node_modules','.bun')` | Bun 虚拟依赖仓库 |
| `isolatedCandidates` | 内部常量 | 22-27 | `string[]` | `electron-builder@*` 各隔离副本的 `out/cli/cli.js`，`existsSync` 过滤 |
| `hoistedCandidate` | 内部常量 | 33 | `string` | 根 `node_modules/electron-builder/out/cli/cli.js`（hoisted 回退） |
| `candidates` | 内部常量 | 34-36 | `string[]` | 隔离命中非空用隔离，否则用 hoisted（存在时），否则空 |
| `result` | 内部常量 | 42-46 | `SpawnSyncReturns` | `spawnSync` 结果 |

## 3. 内部逻辑与关键流程

1. 收集参数并执行宿主门禁：`assertBuilderPackagingHost(builderArgs, process.platform)`，失败打印 `[electron-builder] …` 并 `process.exit(2)`（`apps/electron/scripts/run-electron-builder.cjs:11-17`）。
2. 解析 CLI 候选：扫描 `<repoRoot>/node_modules/.bun` 下 `electron-builder@*` 目录 → 各 `node_modules/electron-builder/out/cli/cli.js`（`:21-27`）；若隔离布局无命中，回退 hoisted 布局（`:29-36`，注释解释 macOS NTFS→APFS 迁移场景）。
3. 唯一性短路：`candidates.length !== 1` 直接 `throw`（`期望在 Bun 虚拟依赖仓库中找到唯一 electron-builder CLI…`）（`:38-40`）。
4. `spawnSync(process.execPath, [candidates[0], ...builderArgs], {cwd: appDir, stdio: 'inherit', env: process.env})`（`:42-46`）；`result.error` 重抛（`:47`）；`process.exit(result.status ?? 1)` 透传构建退出码（`:48`）。

## 4. 调用者与调用链

入向（全冻结树检索 `run-electron-builder` 命中 4 文件）：
- `apps/electron/package.json:39,40`（`release:verify:windows[:unsigned]`）、`:55`（`pack`）、`:56`（`dist`）、`:57,58,59`（`dist:win*`）——均 `node scripts/run-electron-builder.cjs …`。
- `apps/electron/scripts/dist.ts:300`（步骤 7 `runStep('Electron Builder','node',['scripts/run-electron-builder.cjs', ...builderArgs.slice(1)])`）。
- `.github/workflows/release.yml:95`（`Package Windows release` job，`working-directory: apps/electron`）。
- `apps/electron/scripts/macos-signature.cjs:135` 仅注释引用其约定（非调用）。

出向：`./packaging-host.cjs` 的 `assertBuilderPackagingHost`（`apps/electron/scripts/run-electron-builder.cjs:9,13`）；`node:fs`/`node:path`/`node:child_process`（`:6-8`）；electron-builder CLI（解析出的 `cli.js`，`:42`）。

## 5. 数据 I/O、读写与副作用

- 只读：`node_modules/.bun` 目录列举（`readdirSync`，`:23`）与 `existsSync` 探测（`:22,26,36`）；无任何写盘。
- 子进程：`stdio: 'inherit'` 直通控制台（`:44`），`env: process.env` 全量透传（`:45`，如 CI 的 `CSC_LINK`）；网络行为取决于 electron-builder 参数（如 `--publish never` 由调用方传入，`.github/workflows/release.yml:95`），本文件自身不发起网络。
- 无缓存/全局状态写入。

## 6. 分支、失败、取消与恢复

- 宿主门禁失败 → `console.error` + `exit(2)`（`apps/electron/scripts/run-electron-builder.cjs:12-17`）。
- CLI 候选不唯一（0 或 ≥2）→ 裸 `throw`（`:38-40`）：未捕获，Node 打印栈并以退出码 **1** 结束（与门禁的 2 不同口径，照实记录）。
- `spawnSync` 通信失败（`result.error`）→ 重抛（`:47`），同样退出码 1。
- 正常路径透传子进程退出码（`result.status ?? 1`，`:48`）。
- 无取消/恢复/重试机制；本文件无写盘副作用，失败不产生磁盘残留（子进程产物由 electron-builder 负责）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查（构建脚本，信任边界为运行者本机）。两道权威约束：宿主平台合法性（委托 `assertBuilderPackagingHost`，`:13`）；“只接受仓库内已安装的固定版本”（`:29-32` 注释 + `:38-40` 唯一性检查），防止构建时下载未锁定依赖。

## 8. 修改影响面

- 调用方全链：`apps/electron/package.json` 的 `pack`/`dist`/`dist:win*`/`release:verify:windows*`、`apps/electron/scripts/dist.ts` 步骤 7、`.github/workflows/release.yml:95` Windows 打包 job。
- 改候选解析逻辑影响 Bun 两种安装布局（isolated `.bun` 与 hoisted 根 node_modules）的兼容性（背景 `:29-32`）；改退出码约定影响 `dist.ts` 的步骤失败判定与 CI 门禁。
- 需同步核对的测试：`apps/electron/scripts/packaging-guards.test.ts:183-196`（脚本链以宿主门禁开头的契约）。

## 9. 测试证据

- 直接测试：**无**。否定检索：全冻结树（排除 `node_modules`、`.git`）搜 `run-electron-builder` 命中 4 文件（`apps/electron/package.json`、`apps/electron/scripts/dist.ts`、`apps/electron/scripts/macos-signature.cjs:135` 注释、`.github/workflows/release.yml:95`），无任何测试文件命中。
- 间接证据：`apps/electron/scripts/packaging-guards.test.ts:183-196` 断言 `dist:win`、`dist:win-github`、`dist:win-commercial`、`release:verify:windows` 四脚本以 `'bun run verify:packaging-host:win &&'` 开头（真实断言 `apps/electron/scripts/packaging-guards.test.ts:194`），守住本脚本前必先过宿主门禁的顺序契约。
- `NOT_RUN`：本轮未运行任何测试/typecheck/构建（静态阅读）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 门禁失败 exit(2)、候选不唯一裸 throw（退出码 1）、正常透传 `result.status ?? 1` | 已证实 | `apps/electron/scripts/run-electron-builder.cjs:12-17,38-40,47-48` |
| 隔离优先、hoisted 回退的两级候选解析 | 已证实 | `apps/electron/scripts/run-electron-builder.cjs:22-36` |
| 被 5 个 package.json 脚本、dist.ts、release.yml 调用 | 已证实 | `apps/electron/package.json:39,40,55-59`、`apps/electron/scripts/dist.ts:300`、`.github/workflows/release.yml:95` |
| 不唯一时的报错文案要求 `bun install --frozen-lockfile` | 已证实 | `apps/electron/scripts/run-electron-builder.cjs:38-40` |
| macos-signature.cjs 复用其“.bun 优先”约定 | 已证实 | `apps/electron/scripts/macos-signature.cjs:135`（注释） |
| 裸 throw 与 exit(2) 退出码口径不统一是有意为之 | 未知 | 未读到说明；照实记录两种口径 |
| electron-builder 子进程内部行为（配置解析/网络） | 未知 | 依赖 electron-builder 自身实现，未读其源码 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `builderArgs`/宿主门禁 | §3.1、§6 | 11-17 | covered |
| `isolatedCandidates` 解析 | §3.2 | 21-27 | covered |
| hoisted 回退 | §3.2 | 29-36 | covered |
| 唯一性短路 throw | §3.3、§6 | 38-40 | covered |
| `spawnSync`+退出码透传 | §3.4、§5 | 42-48 | covered |
| 入向调用链 | §4 | — | covered |
| 直接测试缺失 | §9 | — | covered（否定检索已给范围） |

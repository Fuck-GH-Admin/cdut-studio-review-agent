---
path: apps/electron/package.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b51d8d2d79e103af8158574fb16d750c46f76671
sha256: 0860d3b31f59348a6d728d6d94858a4e4e31fbe4749215e6a6380f0f2117828d
lines: 203
kind: config
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/package.json

## 1. 结论与边界

桌面应用包 `@profer/electron` 的**声明式包清单**（纯 JSON 配置，无运行时代码）：版本 `0.15.161`、Electron 主入口 `dist/main.cjs`、57 条开发/构建/发布 scripts、16 项运行时依赖与 103 项开发依赖、electronmon 监听配置、以及 electron-builder 配置挂载点 `build.extends`（`apps/electron/package.json:2-8,200-202`）。它是 Bun workspace 成员（仓库根 `package.json` workspaces=`packages/*,apps/*`，`package.json:7-10`）。

边界：本文件不含任何构建逻辑——构建/打包逻辑在 `scripts/*` 与 `electron-builder.yml`；不含仓库级脚本（根 `package.json:15-27` 另有一层 `--filter` 委派）；不含依赖安装结果（由 `bun.lock` 锁定）。

## 2. 导出与关键符号

顶层 13 键（`apps/electron/package.json:2-202`）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `name` | 字段 | 2 | `"@profer/electron"` | workspace 包名 |
| `version` | 字段 | 3 | `0.15.161` | 与发布/CHANGELOG 强绑定（见 §8） |
| `description`/`author`/`private` | 字段 | 4,6,7 | `"CDUT Studio"`/`"CDUT Studio Devs"`/`true` | 不可发布到 npm |
| `main` | 字段 | 5 | `dist/main.cjs` | Electron 主进程入口（`bunx electron .` 与 `start`/`dev:electron` 时由 Electron 读取） |
| `type` | 字段 | 8 | `module` | 本包脚本按 ESM 解析（`.ts`/`.mjs` 脚本走 import 语法） |
| `scripts` | 对象 | 9-67 | 57 条 | 见下方全清单 |
| `dependencies` | 对象 | 68-85 | 16 项 | 运行时依赖（随包分发） |
| `optionalDependencies` | 对象 | 86 | `{}` | 空 |
| `devDependencies` | 对象 | 87-191 | 103 项 | 构建/界面/测试期依赖 |
| `electronmon` | 对象 | 192-199 | `{patterns,logLevel}` | 仅监听 `dist/main.cjs`/`dist/preload.cjs`（`!**/*` 后白名单），`logLevel: verbose` |
| `build` | 对象 | 200-202 | `{extends:"electron-builder.yml"}` | electron-builder 配置挂载点 |

scripts 全清单（57 条，`apps/electron/package.json:10-66`；命令逐字为源码）：

| 脚本 | 行 | 命令要点 |
| --- | --- | --- |
| `dev` | 10 | `dev-kill.ts --vite` 后 concurrently 并跑 `dev:vite` + `dev:electron` |
| `dev:split` | 11 | `bash scripts/dev-split.sh` |
| `build:ooxml` | 12 | `node scripts/build-ooxml.mjs` |
| `build:cslab-worker` | 13 | esbuild `src/main/lib/cslab/cslab-ooxml-worker.ts` → `dist/cslab-ooxml-worker.cjs`（external:electron） |
| `dev:vite` | 14 | `build:ooxml` && `vite dev` |
| `dev:kill` | 15 | `bun run scripts/dev-kill.ts` |
| `dev:electron` | 16 | dev:kill → build:main → build:preload → build:resources → sleep 2 → concurrently(watch:main/preload/yanhu-preload + `bunx electron .`) |
| `build:main` | 17 | esbuild `src/main/index.ts` → `dist/main.cjs`，external electron/@earendil-works/pi-*×3/ssh2/cpu-features，`--define:__PROFER_BUILD_TARGET__='"oss"'`，minify |
| `build:main-github` | 18 | = `build:main`（oss 目标） |
| `build:main-commercial` | 19 | 同 build:main 但 `__PROFER_BUILD_TARGET__='"commercial"'` |
| `build:preload` | 20 | `build:app-preload` && `build:yanhu-preload` |
| `build:app-preload` | 21 | esbuild `src/preload/index.ts` → `dist/preload.cjs` |
| `build:yanhu-preload` | 22 | esbuild `src/main/lib/cdut/yanhu/yanhu-preload.ts` → `dist/yanhu-preload.cjs` |
| `watch:main` | 23 | build:main 的 `--watch=forever` 变体（oss） |
| `watch:main-commercial` | 24 | 同上（commercial） |
| `watch:preload` | 25 | `dist/preload.cjs` watch |
| `watch:yanhu-preload` | 26 | `dist/yanhu-preload.cjs` watch |
| `build:renderer` | 27 | `build:ooxml` && `node scripts/build-renderer.mjs` |
| `build:resources` | 28 | `bun run scripts/copy-resources.ts` |
| `build:cli` | 29 | `bun run scripts/build-cli.ts`（产出 `resources/bin/profer[.exe]`，见 `scripts/build-cli.ts:1-15`） |
| `sync:runtime-deps` / `:dev` | 30-31 | `scripts/sync-runtime-deps.ts [--no-clean]` |
| `build` | 32 | build:main && build:preload && build:renderer && build:cli && build:resources |
| `verify:release-assets` | 33 | `node scripts/verify-release-assets.cjs` |
| `verify:packaging-host:win` | 34 | `node scripts/packaging-host.cjs --win` |
| `verify:mac-update-assets` | 35 | `node scripts/verify-macos-update-assets.cjs` |
| `sign:update-metadata` | 36 | `node scripts/sign-update-metadata.cjs` |
| `verify:update-metadata` | 37 | `node scripts/verify-update-metadata.cjs` |
| `verify:packaged-pi-runtime` | 38 | powershell `scripts/verify-packaged-pi-runtime.ps1` |
| `release:verify:windows` | 39 | packaging-host:win → build:github → sync:runtime-deps → run-electron-builder.cjs --win --x64 --publish never → sign:update-metadata → verify:release-assets → verify:packaged-pi-runtime |
| `release:verify:windows:unsigned` | 40 | 同上但 `verify:release-assets:unsigned` |
| `verify:release-assets:unsigned` | 41 | `node scripts/verify-release-assets-unsigned.cjs` |
| `build:github` | 42 | build:main-github && verify:build-target:oss && build:preload && build:renderer && build:cli && build:resources |
| `build:commercial` | 43 | build:main-commercial && verify:build-target:commercial && 同上其余 |
| `start` | 44 | `build` && `bunx electron .` |
| `typecheck` | 45 | `tsc --noEmit` |
| `test` | 46 | `bun test --isolate` |
| `test:dark-mode` | 47 | `bun test scripts/dark-mode-guards.test.ts` |
| `check:skin-token-sync` | 48 | `node scripts/check-skin-token-sync.mjs` |
| `check:skin-contract` | 49 | `node scripts/check-skin-surface-contract.mjs` |
| `test:memory-search` | 50 | `node scripts/memory-search-verify.mjs` |
| `diagnose:openai-reasoning` | 51 | `node scripts/diagnose-openai-reasoning.mjs` |
| `generate:icons` | 52 | `cd resources && ./generate-icons.sh` |
| `verify:build-target:oss` / `:commercial` | 53-54 | `node scripts/verify-build-target.cjs <target> dist/main.cjs` |
| `pack` | 55 | build && sync:runtime-deps && run-electron-builder.cjs --dir |
| `dist` | 56 | build && sync:runtime-deps && run-electron-builder.cjs |
| `dist:win` | 57 | verify:packaging-host:win && build && sync:runtime-deps && run-electron-builder.cjs --win |
| `dist:win-github` | 58 | 同上但 build:github |
| `dist:win-commercial` | 59 | 同上但 build:commercial |
| `dist:mac` | 60 | `bun run scripts/dist.ts --mac --current-arch --no-sign` |
| `dist:mac-release` | 61 | `scripts/dist.ts --mac --current-arch` |
| `verify:mac-package` | 62 | `node scripts/verify-macos-package.cjs` |
| `verify:mac-signature` | 63 | `node scripts/verify-macos-signature.cjs`（被测试钉死，见 §8） |
| `dist:visual` | 64 | `bun run scripts/dist.ts` |
| `dist:fast` | 65 | `scripts/dist.ts --current-arch` |
| `dist:debug` | 66 | `scripts/dist.ts --current-arch --verbose` |

依赖要点：`dependencies`（`apps/electron/package.json:69-84`）= 模型 SDK（`@anthropic-ai/sdk`）、Pi 运行时三件套 `@earendil-works/pi-*`（`0.86.1` 精确锁定）、OOXML/表格/文档（`@silurus/ooxml 0.71.0`、`xlsx` 别名 `npm:@stackline/xlsx@^1.0.6` `:83`、`hyparquet*`、`jszip`、`pptxgenjs 4.0.1`、`cheerio 1.2.0`）、`pdfjs-dist`、`ssh2 ^1.17.0`。`devDependencies`（`:88-190`）含 6 个 `@profer/*` `workspace:*` 内部包（`:94-99`）、electron `^43.2.0`、electron-builder `^25.1.8`、esbuild、vite `^6.0.3`、react `18.3.1`、tiptap 全家（`:120-135`）、radix-ui（`:100-115`）、`typescript ^5.0.0`、`bun` 侧测试框架由 bun 内置（`bun:test`）。

## 3. 内部逻辑与关键流程

1. 开发链（`apps/electron/package.json:10-16,23-26`）：`dev` 先清残留进程（`dev-kill.ts`）再并跑 Vite dev server 与 Electron；`dev:electron` 先建 `dist/main.cjs`/`dist/preload.cjs`/`dist/yanhu-preload.cjs`/资源，再 watch 三个产物 + `bunx electron .`。
2. 构建链（`:17-32,42-43`）：主进程 bundle（esbuild CJS、`--external` electron/Pi/ssh2/cpu-features）→ preload 双件 → renderer（Vite）→ CLI（`build:cli`，`bun build --compile` 自包含二进制，输出 `resources/bin/`，`scripts/build-cli.ts:1-15`）→ 资源拷贝（`copy-resources.ts`）。
3. 构建目标分叉（`:17-19,42-43,53-54`）：`__PROFER_BUILD_TARGET__` 由 esbuild `--define` 注入，`oss`/`commercial` 两个值；运行时读取方 `apps/electron/src/main/lib/build-target.ts:5,14`（未定义时回落 `'oss'`），`verify:build-target:*` 对产物断言目标（`scripts/verify-build-target.cjs:7` 默认 `dist/main.cjs`）。
4. 打包链（`:39-40,55-59`）：`build` → `sync:runtime-deps`（把主进程 external 的依赖闭包复制进 `apps/electron/node_modules`，`scripts/sync-runtime-deps.ts:1-7`）→ `scripts/run-electron-builder.cjs`（从 Bun 锁定虚拟仓库解析唯一 electron-builder CLI，`scripts/run-electron-builder.cjs:17-48`）。
5. macOS 链（`:60-66`）：`scripts/dist.ts` 七步编排（步骤 7 组装 electron-builder 参数并以 `node scripts/run-electron-builder.cjs` 执行，`scripts/dist.ts:261-300`）；签名由 `electron-builder.yml` 的 `afterSign` 钩子统一负责（`scripts/dist.ts:276-279` 注释）。

## 4. 调用者与调用链

入向（谁执行本文件 scripts）：
- 根 `package.json` 委派：`electron:dev/electron:build/electron:build:github/electron:build:commercial/electron:start` → `bun run --filter='@profer/electron' …`（`package.json:16-20`）；根 `typecheck`/`test` 走 `--filter`/`bun test --isolate`（`package.json:24,27`）。
- CI：`.github/workflows/ci.yml:55-60`（`bun run build:main/build:preload/build:renderer`，working-directory apps/electron）、`.github/workflows/ci.yml:51-52`（`check:skin-contract`）、`.github/workflows/release.yml:63`（typecheck）、`.github/workflows/release.yml:70`（`check:skin-contract`）、`.github/workflows/release.yml:77`（根 `electron:build:github`）、`.github/workflows/release.yml:82`（`sync:runtime-deps`）、`.github/workflows/release.yml:95`（`node scripts/run-electron-builder.cjs --win --x64 --publish never`）、`.github/workflows/release.yml:169`（`sign:update-metadata`）、`.github/workflows/release.yml:176`（`verify:release-assets`）、`.github/workflows/macos-package.yml:89`（`bun run dist:mac`）、`.github/workflows/macos-package.yml:92-93`（`verify:mac-update-assets`）。
- `.github/workflows/release.yml:55-57` 以本文件 `version` 核对 git tag（`Tag version … does not match apps/electron/package.json version`）。
出向：本文件只声明命令；真实实现在 `apps/electron/scripts/*`（27 个被引用脚本逐一核对存在于冻结树）、esbuild/vite/tsc/bun CLI、以及 `electron-builder.yml`（经 `build.extends` `apps/electron/package.json:200-202`，读取方 electron-builder CLI，`scripts/run-electron-builder.cjs:38-45` 以 cwd=apps/electron 启动）。
其它读取者：`electronmon`（`electronmon` 配置块 `apps/electron/package.json:192-199`；其进程清理逻辑见 `apps/electron/scripts/dev-kill.ts:2-5,38-40`）、`apps/electron/scripts/packaging-guards.test.ts:165-180`（断言本文件字段，见 §9）。

## 5. 数据 I/O、读写与副作用

本文件是纯声明式 JSON，自身不执行 I/O。消费方读取后产生的副作用：
- `bun install` 按 `dependencies`/`devDependencies` 解析安装并写 `bun.lock`（锁文件事实见 `bun.lock` 手册）。
- esbuild/vite 按 scripts 命令写 `dist/main.cjs`、`dist/preload.cjs`、`dist/yanhu-preload.cjs`、`dist/cslab-ooxml-worker.cjs`（`apps/electron/package.json:13,17,21-22`）。
- `build:cli` 写 `resources/bin/profer[.exe]`（`scripts/build-cli.ts:45`）；`build:resources` 写 `dist/resources`。
- `electron-builder` 经 `build.extends` 读 `electron-builder.yml` 后写 `out/`（详见该手册 §5）。
- `typecheck`（`tsc --noEmit`）与 `test`（`bun test --isolate`）只读源码/写测试输出；`--isolate` 是**显式**传给 Bun 的测试隔离选项（`apps/electron/package.json:46`；同款参数在 `.github/workflows/ci.yml:63-64` 注释解释 mock.module 进程级注册表问题），并非 Bun 默认行为。

## 6. 分支、失败、取消与恢复

本文件无代码分支。命令链的失败语义：
- scripts 内 `&&` 链（如 `build` `apps/electron/package.json:32`）在任一步非零退出时短路后续步骤（shell `&&` 语义，推断级）；`concurrently -k`（`:10,16`）在并发项失败时杀掉其它项（concurrently 语义，推断级）。
- `run-electron-builder.cjs`：宿主门禁失败 `process.exit(2)`（`scripts/run-electron-builder.cjs:13-16`）；解析不到唯一 electron-builder CLI 直接抛错（`:37-39`）。
- 无取消/恢复逻辑（脚本为一次性命令，失败后由人重跑）；`dev:kill` 负责清理上一轮残留开发进程（`apps/electron/scripts/dev-kill.ts:2-5`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查（纯声明式 JSON，不含代码）。签名凭据由 CI 环境注入（`.github/workflows/release.yml:86-94` 的 `CSC_LINK`/`CSC_KEY_PASSWORD`，缺失即拒绝构建未签名发布包），本文件不接触任何凭据。

## 8. 修改影响面

- `version`（`apps/electron/package.json:3`）：被 `.github/workflows/release.yml:55-57` 用作 tag 校验；`packaging-guards.test.ts:180` 断言 `resources/CHANGELOG.json` 的 `releases[0].version` 必须等于它。
- `scripts`：被根 `package.json:16-20`、CI（§4 全列）、`dist.ts`/`run-electron-builder.cjs` 间接依赖；`packaging-guards.test.ts:176` 钉死 `scripts['verify:mac-signature']` 必须为 `node scripts/verify-macos-signature.cjs`；`:183-194` 钉死 Windows 发布脚本必须以 `bun run verify:packaging-host:win &&` 开头。
- `dependencies`（esp. `@earendil-works/pi-*`、`ssh2`、`cpu-features` 的 external 契约 `:17,19,23-24`）：改 external 列表需同步 `sync:runtime-deps` 闭包与 `electron-builder.yml` `files`/`asarUnpack`（`electron-builder.yml:50-62`）。
- `main`/`type`：影响 Electron 启动与所有 `.ts` 脚本的模块解析；`electronmon.patterns`（`:192-199`）决定热重启监听面。
- 同步修改的测试：`apps/electron/scripts/packaging-guards.test.ts`（§9）。

## 9. 测试证据

直接断言本文件的测试（`apps/electron/scripts/packaging-guards.test.ts`，kind=test，本批外文件，属 nb-137 批）：
- `:165-180`：读取本文件，断言 `scripts['verify:mac-signature']` 精确值（`:176`）、`CHANGELOG.json` 首条版本 == `version`（`:180`）。
- `:183-194`：断言 Windows 发布脚本以 `bun run verify:packaging-host:win &&` 起头（`:194`）。
- 间接：`package-closure.test.ts:24-25` 断言 builder 配置含 `appId`/`afterPack`（读 `electron-builder.yml`，非本文件）。
本轮 `NOT_RUN`：`bun test`、`typecheck`、任何构建；以上断言均为静态阅读所得，不代表已执行通过。无以本文件 scripts 为对象的运行级测试（如命令冒烟）——检索范围：冻结树 `*.test.*` 文件中对 `package.json` 字段的引用（`packaging-guards.test.ts` 为主要消费者）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 顶层键 / 57 scripts / 16 deps / 103 devDeps / 0 optDeps | 已证实 | `apps/electron/package.json:2-202` 逐键数（实测） |
| 27 个被 scripts 引用的脚本文件全部存在于冻结树 | 已证实 | 逐文件存在性实测（`scripts/dev-kill.ts` … `scripts/sleep.ts`） |
| `build.extends` 是 electron-builder 的配置挂载点 | 已证实（代码侧） | `apps/electron/package.json:200-202` + `scripts/run-electron-builder.cjs:38-45`；electron-builder 内部解析行为属工具语义 |
| `__PROFER_BUILD_TARGET__` 未定义时回落 `'oss'` | 已证实 | `apps/electron/src/main/lib/build-target.ts:5,14` |
| `&&` 链失败短路、`concurrently -k` 杀伴生进程 | 推断 | shell/concurrently 工具语义，未读工具源码 |
| Electron 依据 `main: dist/main.cjs` 启动主进程 | 推断 | Electron 惯例 + `bunx electron .`（`:16,44`）+ `verify-build-target.cjs:7` 以 `dist/main.cjs` 为默认产物 |
| electronmon 配置块被何时何地读取 | 未知 | 全冻结树检索 `electronmon`（排除 node_modules/bun.lock）仅命中注释、依赖声明与 `dev-kill.ts` 进程清理（`apps/electron/scripts/dev-kill.ts:2-5,38-50`），无 `electronmon` CLI 启动点 |
| `optionalDependencies: {}` 未来扩展行为 | 未知 | 空对象，无消费者 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 13 顶层键 | §2 | 2-202 | covered |
| 57 scripts 逐条 | §2/§3 | 10-66 | covered |
| dependencies/optional/devDependencies | §2 | 68-191 | covered（逐项计数+要点，非逐包罗列） |
| electronmon 块 | §2/§4 | 192-199 | covered |
| build.extends | §2/§4 | 200-202 | covered |
| 构建目标 oss/commercial 分叉 | §3 | 17-19,42-43,53-54 | covered |
| 打包链 sync:runtime-deps → run-electron-builder | §3 | 30,39-40,55-59 | covered |
| CI/根调用者 | §4 | — | covered |
| version/scripts 契约（测试钉死） | §8/§9 | 3,63 | covered |
| electronmon 实际启动点 | §4/§10 | 192-199 | unknown |

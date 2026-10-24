---
path: apps/electron/scripts/dist.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2aea82d4a93e970ca1cc21ed937cb0a31dd04222
sha256: 40e620c1e8c533d24fffb1e42489a7d75e14a488ebb3eef0813792f55472d104
lines: 358
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/dist.ts

## 1. 结论与边界

可视化打包脚本（358 行，`#!/usr/bin/env bun`）：分步执行打包流程（每步计时+状态指示），支持 `--current-arch`（只建当前架构）、`--verbose`、`--no-sign`（Mac 验收包专用）、`--dmg/--zip/--dir`（`apps/electron/scripts/dist.ts:1-20`）。macOS 一律依赖 afterSign 钩子补 ad-hoc 签名并钉死 DR（`:10-11`、`:276-279`）。边界：不直接构建（全部委托 npm scripts/run-electron-builder.cjs）；不上传发布——但仅 mac 分支强制 `--publish never`（`:266-269`），win/linux 路径不带该 flag 且 `run-electron-builder.cjs` 无 publish 强制，源注释 `:266`「绝不能…上传资产」的承诺仅由 mac 分支兑现，win/linux 依赖 electron-builder 缺省不发布【推断】。

## 2. 导出与关键符号

无导出（CLI）。参数（`parseArgs`，`:148-169`）：`--current-arch`/`--verbose`/`--no-sign`/`--dmg`/`--zip`/`--dir`/`--mac`/`--win`/`--linux`；缺省 platform=win（`:167`）、targetFormat=all。

内部符号：
- 类型 `StepResult`（内部接口，`:33-38`：name/duration/success/skipped）、`DistOptions`（内部接口，`:40-46`）。
- 常量 `color`（内部，`:53-67`，ANSI 色表含 yellow，与 build-cli.ts 不同此处完整）。
- 内部函数：`formatDuration(ms)`（`:70-76`，ms/s/m 三段格式）、`printSeparator()`（`:79-81`）、`printStepStart(step,total,name)`（`:84-89`）、`printStepResult(result)`（`:92-104`，跳过/完成/失败三态）、`runStep(name,command,args,options)`（`:107-142`）、`parseArgs()`（`:148-169`）、`main()`（`:171-326`）、`printSummary(results)`（`:329-356`）。

## 3. 内部逻辑与关键流程

1. 门禁（`:176-192`）：`assertPackagingHost(opts.platform, process.platform)`（`scripts/packaging-host.cjs:50` 导出）失败 → 打印错误 → exit 2；`--mac` 且宿主非 darwin → 「macOS 打包必须在 Apple Silicon Mac 上运行…」exit 2；`--mac` 且 `process.arch !== 'arm64'` → 「P1 仅支持 Apple Silicon arm64 本地构建…」exit 2。
2. 配置打印（`:194-201`）：平台/架构（currentArch ? 当前 : mac 固定 arm64 : arm64+x64）/格式/签名策略/详细日志。
3. 步骤 1-6（`:206-259`，win/linux 共 7 步、mac 9 步，`:203`）：依次 `runStep` 委托 `bun run build:main` → `build:preload` → `build:renderer` → `build:cli` → `build:resources` → `sync:runtime-deps`；任一步失败立即 `return printSummary(results)`（`:213/222/231/240/250/259`；步骤 5 注释 `:249`：资源缺失必须中断）。
4. 步骤 7 electron-builder（`:261-306`）：`builderArgs=['electron-builder', `--${platform}`]`；mac 追加 `--publish never`（`:267-269`）；currentArch 追加 `--${arch}`（`:272-274`）；targetFormat 映射 `--config.mac.target=dmg|zip` 或 `--dir`（`:282-288`）；`noSign` 注入 `CSC_IDENTITY_AUTO_DISCOVERY=false`，verbose 注入 `DEBUG=electron-builder,…`（`:291-297`）；执行 `runStep('Electron Builder','node',['scripts/run-electron-builder.cjs', ...builderArgs.slice(1)], {verbose:true, env})`——注意 `builderArgs.slice(1)` 丢弃字面 `'electron-builder'` 传平台 flag（`:300`）。
5. 步骤 8-9（仅 mac，`:308-323`）：`bun run verify:mac-package`（失败中断）→ `bun run verify:mac-signature`（verbose:true）。
6. `runStep` 内部（`:107-142`）：`options.skip` 直接返回 skipped 结果；`spawnSync(command,args,{stdio: verbose?'inherit':'pipe'（stderr 恒 inherit），cwd: apps/electron，env: PATH 前插 dirname(process.execPath) 以兼容干净终端，shell:true})`；非 verbose 失败时补打 stdout（`:136-139`）。
7. `printSummary`（`:329-356`）：逐行耗时条（`█` × 秒数上限 30，色阶 <10s 绿 / <30s 黄 / 更多红，`:342-343`）+ 总耗时 + `process.exit(allSuccess ? 0 : 1)`。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/package.json:60`（`dist:mac`）、`:61`（`dist:mac-release`）、`:64`（`dist:visual`）、`:65`（`dist:fast`）、`:66`（`dist:debug`）；`scripts/push-mac-release.cjs:102`（`run('bun run dist:mac-release', ELECTRON)`）；`.github/workflows/macos-package.yml:89`（`bun run dist:mac`）。
- 出向：`./packaging-host.cjs`（assertPackagingHost）、`child_process.spawnSync`、`node:path`（delimiter/dirname/join）；委托链：`build:main`/`build:preload`/`build:renderer`/`build:cli`/`build:resources`/`sync:runtime-deps`（npm scripts）、`scripts/run-electron-builder.cjs`、`verify:mac-package`/`verify:mac-signature`（`scripts/verify-macos-package.cjs`/`verify-macos-signature.cjs`）。

## 5. 数据 I/O、读写与副作用

- 读：argv、`process.arch/platform`、`process.env`（PATH 注入）。
- 写：无直接磁盘写；产物全由子步骤产生（dist/、out/）。
- 网络/缓存/全局状态：无直接；子步骤可能联网（域外）。
- 副作用：多级子进程（esbuild/vite/bun compile/electron-builder/codesign 校验）、彩色控制台 UI、进程退出码 0/1/2。幂等：流程编排无状态，重跑即重建。

## 6. 分支、失败、取消与恢复

- exit 2：宿主门禁三连（`:177-192`，文案见 §3.1）。
- 逐步 fail-fast：每步失败 `return printSummary` → exit 1（`:213-259, 306, 315`）；步骤 9 失败不立即 return，仍走 summary（`:320-325`）。
- exit 1：printSummary 中 `!allSuccess`（`:355`）；exit 0：全成功。
- 失败后状态：磁盘残留前序步骤产物（dist/、out/ 半成品）；无自动清理/重试。恢复：修复后重跑对应 `bun run scripts/dist.ts …`。取消：Ctrl-C 杀父进程，`shell:true` 的子进程树由 shell 语义决定（无 trap）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：打包宿主合法性权威 = `packaging-host.cjs` 的 `assertPackagingHost`（`:25-27, 177`）+ mac arm64 双检查（`:185-192`）；签名策略权威 = afterSign 钩子（`electron-builder.yml:27`，`:276-279` 注释明确不设 forceCodeSigning，"包必须可验证"由 verify:mac-signature 对真实产物断言）。

## 8. 修改影响面

- 打包流程总编排：`apps/electron/package.json:60-61,64-66`；CI `.github/workflows/macos-package.yml:89`；发布链 `scripts/push-mac-release.cjs:102`。
- 六个子构建脚本（build:main/preload/renderer/cli/resources、sync:runtime-deps）与 `scripts/run-electron-builder.cjs`、`electron-builder.yml` 的接线。
- macOS 验收链：`verify:mac-package`/`verify:mac-signature`（`apps/electron/package.json:62-63`）。
- 步骤顺序变更会影响 CI 日志解析与验收记录（`verify-macos-package.cjs:5` 注释绑定 dist:mac 调用语义）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无直接测试（全树 grep `dist.ts` 于 *.test.ts 零命中）。间接证据：`apps/electron/scripts/packaging-guards.test.ts:71-92`（`test(` 机械计数 19 / `it(` 0）覆盖同域宿主门禁 `packaging-host.cjs`——标注"间接"，不覆盖 dist.ts 编排本身；`:183`（`Given Windows 发布脚本 When 启动构建 Then 宿主门禁总是最先执行`）绑定门禁顺序契约。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部 7-9 步编排、flag 映射、exit 码、runStep PATH 注入 | 已证实 | `apps/electron/scripts/dist.ts:1-358` 全文 |
| 调用点清单（5 npm script + push-mac-release + CI） | 已证实 | grep `scripts/dist\.ts|dist:mac|…` 命中行 |
| `builderArgs.slice(1)` 丢弃字面 'electron-builder' 属有意设计 | 推断 | `:300` 以 node 运行 run-electron-builder.cjs 传 flag，静态可确认行为 |
| 实际打包耗时/产物 | 未知 | 运行时数据，NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| parseArgs（9 个 flag） | §2/§3 | 148-169 | covered |
| 宿主门禁 exit 2 ×3 | §3/§6 | 176-192 | covered |
| 步骤 1-6 + 逐步 fail-fast | §3/§6 | 206-259 | covered |
| 步骤 7 electron-builder（publish/格式/签名 env） | §3/§5 | 261-306 | covered |
| 步骤 8-9 mac 验证 | §3 | 308-323 | covered |
| runStep（stdio/PATH/shell） | §3/§5 | 107-142 | covered |
| printSummary + exit 0/1 | §3/§6 | 329-356 | covered |
| formatDuration/printStepStart/printStepResult/color | §2 | 53-104 | covered |

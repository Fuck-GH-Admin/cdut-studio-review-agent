---
path: apps/electron/scripts/build-cli.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 08e05670dfcb2f055181ffb712f25e845d537178
sha256: 4d795867236659aff5276a344a1e2faf8cf95c4b21ddc2da15507b1077f5358c
lines: 133
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/build-cli.ts

## 1. 结论与边界

随包 CLI 编译脚本（133 行，`#!/usr/bin/env bun`）：用 `bun build --compile` 把 `apps/cli` 连同 workspace 依赖打成单个自包含可执行档（用户机无需 bun/node），输出 `apps/electron/resources/bin/profer[.exe]`，由 electron-builder extraResources 打进 `process.resourcesPath/bin/`，运行时主进程注入 `PROMA_CLI` 给 skill（`apps/electron/scripts/build-cli.ts:1-16`）。本机架构编译（CI runner=目标平台，不做交叉编译，`:11-13`）。macOS 附带 ad-hoc 重签名 + `codesign --verify --strict`（`:107-127`）。边界：不打包进 asar、不发 npm、不做 Windows 图标（after-pack.cjs 职责）。

## 2. 导出与关键符号

无导出（CLI）。参数：无命令行参数（无 argv 解析）；行为由 `process.platform` 分支（`:43, 113`）决定。

内部符号：
- 常量 `color`（内部，`:29-36`，ANSI 色表：reset/bold/dim/green/red/cyan）、路径常量 `electronDir/repoRoot/cliEntry`（`:39-41`）、`isWindows/binName/outDir/outFile`（`:43-46`）。
- 内部函数 `fail(msg): never`（内部，`:48-51`）：红字打印 `[build:cli] <msg>` 后 `process.exit(1)`。
- 静态事实：`:77` 与 `:103` 引用 `color.yellow`，但 `color` 对象未定义 yellow 键（`:29-36`），模板串将插值出字面 `undefined`（仅影响警告着色，不影响退出码）。

## 3. 内部逻辑与关键流程

1. 前置校验（`:53-55`）：`cliEntry`（`repoRoot/apps/cli/src/index.ts`）不存在 → fail「找不到 CLI 入口」。
2. 清理残留（`:57-63`）：`mkdirSync(outDir, {recursive:true})` + `cleanCliBuildArtifacts(outDir)`，删除非空则打「已清理异平台 CLI 残留: …」（`formatCliBuildArtifactNames`）。
3. Windows 短路径 workaround（`:69-79`）：`createTemporaryBunPath(tmpdir(), Date.now(), process.pid)` 后 `copyFileSync(process.execPath, tempBunPath)`；复制失败则 `tempBunPath = undefined` 并警告「无法复制 Bun 到临时目录，尝试直接编译」（注意该警告串用 `color.yellow`，见 §2）。
4. 编译（`:81-100`）：`createBuildCliInvocation({bunExecutablePath: process.execPath, outFile, cliEntry, compileExecutablePath: tempBunPath})` → `spawnSync(command, args, {cwd: repoRoot/apps/cli, stdio:'inherit'})`；`result.status !== 0` → fail「bun build --compile 失败（exit N）」；`outFile` 未产出 → fail「编译完成但未产出二进制」。计时自 `started`。
5. 清理临时 Bun（`:101-105`，finally）：`tryRemoveTemporaryBun(unlinkSync, tempBunPath)` 失败仅警告「无法删除临时 Bun 副本」。
6. macOS ad-hoc 签名（`:113-127`）：`codesign --force --sign - --timestamp=none <outFile>`（失败 fail「重新 ad-hoc 签名失败」）→ `codesign --verify --strict`（失败 fail「ad-hoc 签名后校验未通过: …」）→ 打印通过。注释（`:107-112`）：Bun 追加 payload 会使链接期 ad-hoc 签名失效，AMFI 会 SIGKILL（exit 137），故必须重签；正式发布 electron-builder 会用 Developer ID 重签。
7. 收尾（`:129-133`）：打印 `✓ <binName> (<N>MB, <T>s)`。返回值：进程退出码（fail=1，成功=自然 0）。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/package.json:29`（`"build:cli": "bun run scripts/build-cli.ts"`）；被聚合链引用：`:32`（`build`）、`:42`（`build:github`）、`:43`（`build:commercial`）。
- 出向：`./build-cli-runtime`（5 函数，`apps/electron/scripts/build-cli.ts:21-27`）；`node:child_process.spawnSync`（bun compile / codesign ×2）；`node:fs`（copyFileSync/existsSync/mkdirSync/statSync/unlinkSync）；`node:os.tmpdir`；`node:path`（join/resolve + `import.meta.dir`）。
- 间接链：dist.ts 步骤 4 经 `bun run build:cli` 调用（`apps/electron/scripts/dist.ts:237`）；`build:github`/`build:commercial` 先 verify:build-target 再调本脚本（`apps/electron/package.json:42-43`）。

## 5. 数据 I/O、读写与副作用

- 读：`apps/cli/src/index.ts` 存在性；`process.execPath` 复制源。
- 写：`resources/bin/`（mkdir）、`resources/bin/profer[.exe]`（bun compile 产出）、Windows 临时 Bun 副本（tmpdir 下 `bun-temp-<ts>-<pid>.exe`，finally 删除）。
- 原子性：编译直写 outFile，无 tmp+rename；临时 Bun 清理失败留残留（仅警告）。幂等：重跑先 `cleanCliBuildArtifacts` 清异平台残留再覆盖产出。
- 副作用：子进程 bun/codesign（stdio inherit，实时输出）、彩色 console 日志、macOS 上改写 outFile 签名。

## 6. 分支、失败、取消与恢复

- fail（exit 1，文案全部带 `[build:cli]` 前缀）：找不到 CLI 入口（`:53-55`）、compile 非 0（`:95-97`）、未产出二进制（`:98-100`）、macOS 签名失败（`:119-121`）、签名校验不过（`:123-125`）。
- 降级分支：临时 Bun 复制失败 → 直接用原 Bun 编译（`:75-78`）；临时 Bun 删除失败 → 警告继续（`:102-104`）。
- 失败后状态：compile 失败时 outFile 可能不存在或为陈旧产物（已被 `cleanCliBuildArtifacts` 删除同名旧物，`:58`）；临时 Bun 可能残留（删除失败被吞）。无自动恢复；修复后重跑。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：随包 CLI 文件名权威 = `binName`（`:44`，Windows `profer.exe` / 其它 `profer`）；macOS 可执行档签名权威 = ad-hoc 重签 + verify（`:113-127`），发布路径最终由 electron-builder Developer ID 覆盖（`:112` 注释）。

## 8. 修改影响面

- 打包流程：`build:cli`/`build`/`build:github`/`build:commercial`（`apps/electron/package.json:29,32,42-43`）→ `dist.ts` 步骤 4（`apps/electron/scripts/dist.ts:233-240`）→ 安装包 `resources/bin/`（PROMA_CLI 注入，注释 `:9-10`）。
- `apps/electron/scripts/build-cli-runtime.ts` + `build-cli-runtime.test.ts`（参数构造契约）。
- 下游契约测试：`packaging-guards.test.ts:94-122`（CLI 文件存在性/互斥规则）、`packaged-cli-contract.cjs`（域外）。
- macOS AMFI/签名校验行为（`verify:mac-package`/`verify:mac-signature` 链）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。本文件无直接单元测试（全树 grep `build-cli.ts` 于 *.test.ts 零命中；被测逻辑已抽到 build-cli-runtime.ts）。间接证据：`apps/electron/scripts/build-cli-runtime.test.ts`（`test(` 5 / `it(` 0）覆盖参数构造纯函数——标注"间接"，不覆盖 spawnSync/codesign 编排。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 流程顺序、fail 文案、macOS 签名两步、finally 清理 | 已证实 | `apps/electron/scripts/build-cli.ts:1-133` 全文 |
| `color.yellow` 未定义导致警告串插值 `undefined` | 已证实 | `:29-36` 色表无 yellow 键，`:77/:103` 使用（静态核对） |
| Windows 短路径 workaround 实际规避 ENOENT 的效果 | 未知 | 需 Windows 实跑，NOT_RUN |
| bun compile 产出大小/耗时 | 未知 | 运行时数据（`:129-130` 仅打印） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 前置校验 + 清理残留 | §3/§6 | 53-63 | covered |
| Windows 临时 Bun workaround | §3/§5/§6 | 69-79 | covered |
| bun compile 主体 + 双失败检查 | §3/§6 | 81-100 | covered |
| finally 清理 | §3/§6 | 101-105 | covered |
| macOS ad-hoc 签名 + 校验 | §3/§6/§7 | 107-127 | covered |
| 收尾打印 | §3 | 129-133 | covered |
| color 常量（yellow 缺失） | §2 | 29-36, 77, 103 | covered |

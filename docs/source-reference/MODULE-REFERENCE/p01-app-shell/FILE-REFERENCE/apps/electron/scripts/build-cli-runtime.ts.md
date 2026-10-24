---
path: apps/electron/scripts/build-cli-runtime.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3734ab6773cb466828d485ad95232f7c5130b563
sha256: 160118c5d213413af90048bb2588895968a1e2a14173419f752fe4d391d99178
lines: 59
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/build-cli-runtime.ts

## 1. 结论与边界

CLI 编译的可测试纯函数层（59 行）：把 `build-cli.ts` 里与子进程/文件系统无关的逻辑抽成 5 个导出函数——Bun compile 参数构造、Windows 临时 Bun 路径生成、跨宿主 CLI 残留清理、日志文件名格式化、临时 Bun 删除容错（`apps/electron/scripts/build-cli-runtime.ts:1-59`）。边界：不 spawn 进程、不做 macOS codesign、不读 env/argv；实际编译编排在 `build-cli.ts`。

## 2. 导出与关键符号

- 导出函数 5：`createBuildCliInvocation(input)`（`:17-23`）、`createTemporaryBunPath(tempDir, now, pid)`（`:26-28`）、`cleanCliBuildArtifacts(outDir)`（`:33-42`）、`formatCliBuildArtifactNames(paths)`（`:45-47`）、`tryRemoveTemporaryBun(removeFile, path)`（`:52-59`）。
- 导出类型 1：`interface BuildCliInvocationInput`（`:6-11`：bunExecutablePath/outFile/cliEntry/compileExecutablePath?）。
- 导出常量 0；内部常量 `CLI_ARTIFACT_NAMES = ['profer', 'profer.exe']`（内部，`:4`）。

## 3. 内部逻辑与关键流程

1. `createBuildCliInvocation`（`:17-23`）：基参数 `['build', '--compile', '--outfile', outFile, cliEntry]`；若传 `compileExecutablePath` 则 `args.splice(2, 0, '--compile-executable-path', path)` 插到 `--compile` 之后；返回 `{ command: bunExecutablePath, args }`。设计注释（`:14-15`）：子进程始终复用运行脚本的 Bun，规避 Windows PATH 中 bun/cmd 解析差异。
2. `createTemporaryBunPath`（`:26-28`）：`join(tempDir, `bun-temp-${now}-${pid}.exe`)`，唯一、短路径（Windows ENOENT workaround 用）。
3. `cleanCliBuildArtifacts`（`:33-42`）：遍历 `CLI_ARTIFACT_NAMES`，`existsSync` 命中即 `unlinkSync` 并收集；返回实际删除的绝对路径数组（短路：不存在则 continue）。目的（`:30-32`）：防打包同时携带 profer 与 profer.exe。
4. `formatCliBuildArtifactNames`（`:45-47`）：`basename(path)` 后 `join(', ')`，纯展示。
5. `tryRemoveTemporaryBun`（`:52-59`）：注入 `removeFile` 回调，成功 true/异常 false；注释（`:50-51`）明确删除失败不得覆盖主构建结果。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/scripts/build-cli.ts:21-27`（import 全部 5 个函数；使用点 `:58`、`:71`、`:83-88`、`:102`）；`apps/electron/scripts/build-cli-runtime.test.ts:5-11`（import 全部 5 个 + 用例断言）。
- 出向：仅 `node:fs`（existsSync/unlinkSync）、`node:path`（basename/join），无其它调用。
- 否定结论：全树 grep（工具：ripgrep，pattern `build-cli-runtime`）命中 3 处：`build-cli.ts:27`、`build-cli-runtime.test.ts:11`、`.github/workflows/macos-package.yml:74`（CI 显式运行本模块的测试文件，间接覆盖）；无其它代码级引用。

## 5. 数据 I/O、读写与副作用

- 输入输出形状：`BuildCliInvocationInput` → `{ command: string, args: string[] }`；`cleanCliBuildArtifacts(outDir: string) → string[]`；`formatCliBuildArtifactNames(paths: readonly string[]) → string`；`tryRemoveTemporaryBun(removeFile: (path)=>void, path) → boolean`。
- 磁盘：`cleanCliBuildArtifacts` 是本模块唯一写操作（unlinkSync 删除 `profer`/`profer.exe`）；无 JSON/网络/缓存/全局状态。
- 原子性/幂等：删除目标固定两个文件名，重复执行幂等（第二次无文件返回 `[]`）；无锁。
- 副作用：无进程、无日志（纯函数层，日志由调用方打）。

## 6. 分支、失败、取消与恢复

- 短路：`compileExecutablePath` 缺省不插参（`:19-21`）；`existsSync` 为 false 跳过删除（`:37`）。
- 失败处理：`tryRemoveTemporaryBun` 捕获一切异常返回 false，交调用方决定是否 warning（`apps/electron/scripts/build-cli.ts:102-104` 据此打「无法删除临时 Bun 副本」）；`cleanCliBuildArtifacts` 的 unlinkSync 异常不捕获、直接上抛（调用方 build-cli.ts 无兜底，会终止脚本）。
- 用户可见文案：本文件无（文案集中在 build-cli.ts）。取消/恢复：不适用（同步纯函数，无取消概念）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：`CLI_ARTIFACT_NAMES` 是「随包 CLI 文件名」的事实表（与 `packaged-cli-contract.cjs` 的 WINDOWS_CLI_NAME 同域约定）；产物命名权威在 build-cli.ts 的 `binName` 选择（`apps/electron/scripts/build-cli.ts:44`）。

## 8. 修改影响面

- `apps/electron/scripts/build-cli.ts`（`build:cli` npm script，`apps/electron/package.json:29`；并被 `build`/`build:github`/`build:commercial` 链引用 `apps/electron/package.json:32,42-43`）→ 桌面构建的随包 CLI 二进制。
- `apps/electron/scripts/build-cli-runtime.test.ts`（5 用例直接绑定这 5 个函数签名/语义）。
- 打包产物内容（resources/bin 下 profer/profer.exe 并存问题，参 `packaging-guards.test.ts:94-122` 的 CLI 契约测试，域外）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。直接测试：`apps/electron/scripts/build-cli-runtime.test.ts`（`test(` 机械计数 5 / `it(` 0）。真实断言示例：`:23`（`expect(temporaryBunPath).toBe(join('C:\\Temp', 'bun-temp-123-456.exe'))`）、`:41`（args 数组 toEqual）、`:46-49`（tryRemoveTemporaryBun 返回 false/true）、`:62-65`（cleanCliBuildArtifacts 删除精确性 + existsSync 断言）、`:75`（`toBe('profer, profer.exe')`）。5 个导出函数均有对应用例；`BuildCliInvocationInput` 类型经用例参数对象间接覆盖。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出函数 + 1 导出接口的签名与语义 | 已证实 | `apps/electron/scripts/build-cli-runtime.ts:1-59` 全文 |
| 入向仅 build-cli.ts 与测试文件 | 已证实 | grep `build-cli-runtime` 全树命中清单（§4） |
| unlinkSync 异常会使 build-cli.ts 崩溃 | 推断 | 本文件不捕获（`:38`），调用方无 try/catch（build-cli.ts:58 顶层） |
| 5 用例运行通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| createBuildCliInvocation | §2/§3/§9 | 17-23 | covered |
| createTemporaryBunPath | §2/§3/§9 | 26-28 | covered |
| cleanCliBuildArtifacts | §2/§3/§5/§9 | 33-42 | covered |
| formatCliBuildArtifactNames | §2/§3/§9 | 45-47 | covered |
| tryRemoveTemporaryBun | §2/§3/§6/§9 | 52-59 | covered |
| CLI_ARTIFACT_NAMES | §2/§7 | 4 | covered |

---
path: apps/electron/scripts/packaging-host.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 70471e9a130d9151ee1b6ca10aaa7337f99a79f7
sha256: e78e9d03e541a9fafe9ecf853c1ba7473605f573b480e12ce0a8785e19ca9d33
lines: 71
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/packaging-host.cjs

## 1. 结论与边界

打包宿主门禁模块：解析 electron-builder 风格的目标平台参数，断言“Windows 打包必须在 Windows 宿主运行”，防止在 macOS/Linux 伪造 Windows 产物（`apps/electron/scripts/packaging-host.cjs:2-7` 文件头注释）。既是被 `require` 的库（4 个导出），也可直接 CLI 运行做单次检查（`:57-71`）。

边界：只做平台/宿主匹配断言，不检查架构（x64/arm64）、签名、磁盘产物；不启动任何构建（`run-electron-builder.cjs` 在构建前调用它，见 §4）。

## 2. 导出与关键符号

`module.exports` 4 项（`apps/electron/scripts/packaging-host.cjs:50-55`，导出数与源码一致）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `assertBuilderPackagingHost` | 导出函数 | 44-48 | `(args: string[], hostPlatform = process.platform) => void` | 对 args 解析出的**每个**目标逐一断言 |
| `assertPackagingHost` | 导出函数 | 36-42 | `(targetPlatform, hostPlatform = process.platform) => void` | 仅 `targetPlatform==='win' && hostPlatform!=='win32'` 时 throw |
| `getRequestedPlatform` | 导出函数 | 19-21 | `(args) => string \| undefined` | `getRequestedPlatforms(args)[0]` |
| `getRequestedPlatforms` | 导出函数 | 23-34 | `(args) => string[]` | 去重后的目标列表（`win\|mac\|linux`） |

内部：`TARGET_FLAGS` Map（`:9-17`，`--win/--windows/-w`→win、`--mac/-m`→mac、`--linux/-l`→linux）；CLI 入口 `require.main === module` 块（`:57-71`）。

## 3. 内部逻辑与关键流程

1. `getRequestedPlatforms`：逐 arg 取 `arg.split('=', 1)[0]`（支持 `--win=nsis` 形态，`:26`）→ 直查 `TARGET_FLAGS`（`:27-28`）→ 组合短旗标 `/^-[mlw]{2,3}$/`（如 `-mw`）逐字符映射（`:29-31`）→ `Set` 去重并过滤空值（`:33`）。
2. `assertPackagingHost`：仅当目标为 `win` 且宿主非 `win32` 时抛 `Windows 打包必须在 Windows 宿主上运行；当前宿主为 ${hostPlatform}。请改用 Windows runner 或 Windows 机器。`（`:36-42`）；mac/linux 目标不做任何断言。
3. `assertBuilderPackagingHost`：循环 `getRequestedPlatforms(args)` 逐目标调 `assertPackagingHost`（`:44-48`），任何一个不合法即抛（首个失败短路）。
4. CLI 模式（`:57-71`）：取 `process.argv.slice(2)` 的第一个目标；无目标 → `[packaging-host] 缺少目标平台参数（例如 --win）。` + `exit(2)`（`:59-62`）；断言通过 → 打印 `…打包宿主检查通过（${process.platform}）`（`:66`）；断言失败 → `console.error` + `exit(2)`（`:67-70`）。

## 4. 调用者与调用链

入向：
- `apps/electron/scripts/run-electron-builder.cjs:9,13`（`assertBuilderPackagingHost(builderArgs, process.platform)`，失败 exit(2)）。
- `apps/electron/scripts/dist.ts:25-26` require + `:177` `assertPackagingHost(opts.platform, process.platform)`（失败 `dist.ts:178-181` 打印并 `exit(2)`）。
- CLI：`apps/electron/package.json:34` `verify:packaging-host:win`（`node scripts/packaging-host.cjs --win`），并被 `dist:win*`/`release:verify:windows*` 脚本链最先执行（`apps/electron/package.json:39,40,57,58,59`）。
- 文档提及：`docs/windows-execution-acceptance-guide.md:288`。
- 测试直连：`apps/electron/scripts/packaging-guards.test.ts:25-30` require 4 个导出（用例见 §9）。

出向：无 require 依赖；仅 Node 内建（隐式 `process`/`console`）。纯函数 + 控制台。

## 5. 数据 I/O、读写与副作用

无磁盘/网络/缓存读写；输入为 argv/参数数组，输出为返回值或抛错；副作用仅 CLI 模式的 `console.log/error` 与进程退出码（`:59-70`）。无全局状态。

## 6. 分支、失败、取消与恢复

- `assertPackagingHost` 违规 → throw（`:37-41`）；调用方各自转成退出码 2（`run-electron-builder.cjs:14-16`、`dist.ts:178-181`、本文件 CLI `:67-70`）。
- CLI 无目标参数 → `exit(2)`（`:59-62`）。
- 组合旗标（`-mw`、`--mac --win`）中任意含 win 且宿主非 win32 即失败——**参数顺序不能绕过门禁**（`:44-48` 逐目标断言；测试互证 `packaging-guards.test.ts:82-90`）。
- 无取消/恢复概念（一次性断言，无状态残留）。

## 7. 权限与权威状态

无 sender/role 权限分支，依据：本文件无 sender/role 检查；权威判定是“宿主进程平台”（`process.platform` 实参可注入，测试即以注入方式验证，`packaging-guards.test.ts:72-79`）。门禁语义：Windows 产物只能由 Windows 宿主编译/安装（`apps/electron/scripts/packaging-host.cjs:4-7` 注释）。

## 8. 修改影响面

- 门禁改动直接影响 `run-electron-builder.cjs`（所有打包脚本链）、`dist.ts` 步骤入口、`verify:packaging-host:win`、CI Windows job 前置门禁。
- 放宽 `assertPackagingHost` 会解除“禁伪造 Windows 产物”约束（注释 `:5-6`）；改 `TARGET_FLAGS`/正则会影响参数解析兼容（`--win=nsis`、`-mw`）。
- 需同步测试：`apps/electron/scripts/packaging-guards.test.ts:70-91`（3 用例）与 `:183-196`（脚本顺序契约）。

## 9. 测试证据

直接测试 `apps/electron/scripts/packaging-guards.test.ts`（describe `Windows 打包宿主门禁`，3 用例，文件共 19 个 `test(`）：
1. `:71-74`：`assertPackagingHost('win','darwin')`/`('win','linux')` 均 `toThrow('Windows 打包必须在 Windows 宿主上运行')`。
2. `:76-80`：`assertPackagingHost('win','win32')` 不抛；`getRequestedPlatform(['--x64','--win'])` `toBe('win')`；`assertBuilderPackagingHost(['--win','--x64'],'win32')` 不抛。
3. `:82-90`：`getRequestedPlatforms(['--mac','--win'])` `toEqual(['mac','win'])`；`assertBuilderPackagingHost(['--mac','--win'],'darwin')`、`(['-mw'],'darwin')`、`(['--win=nsis'],'darwin')` 均抛门禁错（防参数顺序绕过）。

未覆盖：`--windows`/`-w`/`-l` 单独映射无独立断言；`getRequestedPlatforms` 过滤空值路径无断言。`NOT_RUN`：本轮未运行测试（断言为静态阅读所得）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 win 目标受宿主约束，mac/linux 不断言 | 已证实 | `apps/electron/scripts/packaging-host.cjs:36-42` |
| 参数解析支持 `--win=nsis` 与 `-mw` 组合短旗标 | 已证实 | `apps/electron/scripts/packaging-host.cjs:26,29-31` |
| CLI 无目标/断言失败均 exit(2)、通过打印一行 | 已证实 | `apps/electron/scripts/packaging-host.cjs:59-70` |
| run-electron-builder/dist.ts 调用点 | 已证实 | `run-electron-builder.cjs:9,13`、`dist.ts:25,177` |
| 3 个直接测试用例断言如 §9 | 已证实 | `packaging-guards.test.ts:70-91` |
| `--windows`/`-w`/`-l` 映射的实际运行行为 | 推断 | 由 `TARGET_FLAGS` 表（`:9-17`）推断，无测试直证 |
| CLI 模式在 CI 中的实际执行记录 | 未知 | 本轮 NOT_RUN，未见运行日志 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `TARGET_FLAGS` | §2、§3.1 | 9-17 | covered |
| `getRequestedPlatform(s)` | §2、§3.1 | 19-34 | covered |
| `assertPackagingHost` | §3.2、§6 | 36-42 | covered |
| `assertBuilderPackagingHost` | §3.3、§4 | 44-48 | covered |
| CLI 入口分支 | §3.4、§6 | 57-71 | covered |
| 未映射旗标被忽略 | §3.1 | 33 | partial（无测试直证） |

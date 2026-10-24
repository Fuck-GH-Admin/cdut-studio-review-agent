---
path: apps/electron/scripts/set-exe-icon.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 87231c2d570a89326afea03ed08af30a5e7b02fa
sha256: e124158fc1a2ba734a497d2766766470539e4fabd9d17b51bc604153b9bd9b15
lines: 34
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/set-exe-icon.ts

## 1. 结论与边界

一次性工具脚本（ESM，顶层 await）：用 npm `rcedit`（v5.x ESM）给 `apps/electron/out/win-unpacked/CDUT Studio.exe` 写入图标与 Windows 版本信息。头注释自述动机：electron-builder 自带的 rcedit 2.6.0 与 Electron 39-43 不兼容（`apps/electron/scripts/set-exe-icon.ts:1-4`）。

边界：不做打包、不做签名、不校验写入结果（无回读）；**当前无任何构建链/脚本/CI 调用它**（见 §4 否定检索），生产图标写入由 afterPack 钩子 `apps/electron/scripts/after-pack.cjs` 完成，两套并行实现。

## 2. 导出与关键符号

无导出（顶层脚本）。关键符号：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `exePath` | 内部常量 | 9 | `join(import.meta.dirname,'..','out','win-unpacked','CDUT Studio.exe')` | 目标 exe |
| `icoPath` | 内部常量 | 10 | `join(import.meta.dirname,'..','resources','icon.ico')` | 图标源 |
| 顶层动作 | 顶层语句 | 12-34 | — | 存在性检查→rcedit 写入→日志 |
| `rcedit` | 外部导入 | 5 | `import { rcedit } from 'rcedit'` | npm rcedit v5 ESM API |

## 3. 内部逻辑与关键流程

1. `:9-10` 构造 `exePath`/`icoPath`（相对脚本目录 `scripts/..`）。
2. `:12-15` exe 不存在 → `console.error('ERROR: CDUT Studio.exe not found at', exePath)` + `process.exit(1)`。
3. `:16-19` ico 不存在 → 同上 `process.exit(1)`。
4. `:21-22` 打印 `Patching:`/`Icon:` 两行日志。
5. `:24-32` `await rcedit(exePath, {...})`：`version-string` 写 `ProductName:'CDUT Studio'`、`FileDescription:'CDUT Studio'`、`CompanyName:'CDUT Studio Devs'`、`LegalCopyright:'By 雫窝中央实验室 · 2026'`（`:25-30`）；`icon: icoPath`（`:31`）。
6. `:34` 打印 `Done — icon + metadata applied`。

## 4. 调用者与调用链

入向：**全树零引用**。否定检索（全冻结树文本检索，含全部扩展名，`-I`）：`set-exe-icon`、`set.exe.icon`、`set_exe_icon`、`exe-icon`、`exeIcon` 五组 pattern，除本文件自身内容外 0 命中；`apps/electron/package.json:24-76` scripts 全清单逐条核对无对应入口；`.github/workflows/**` 无引用。**QA 预读线索①回源核实成立：本脚本无直接调用者。**

并行实现（真实生产路径）：electron-builder afterPack 钩子 `apps/electron/electron-builder.yml:20` `afterPack: scripts/after-pack.cjs`；`apps/electron/scripts/after-pack.cjs:13-24` `findRcedit()` 用 `node_modules/rcedit/bin/rcedit-x64.exe`（`:15`）或 electron-builder 缓存里的 `rcedit-x64.exe`（`:18-23`）直调 `execFileSync` 打图标+版本信息（`:89-97`），失败即 throw 阻断打包（`:115`）。两套并行的差异：本文件经 npm rcedit JS API（`apps/electron/scripts/set-exe-icon.ts:5`），after-pack 直调 rcedit-x64.exe；版本信息字符串不同（本文件含 `LegalCopyright:'By 雫窝中央实验室 · 2026'` `:29`，after-pack 的 CompanyName 取 `context.packager.appInfo` `apps/electron/scripts/after-pack.cjs:85-86`）。

出向：`rcedit`（npm，根 `package.json:37` `"rcedit": "^5.0.2"`，`pnpm-lock.yaml:39`、`:151`、`:287` 锁 5.0.2）、`node:fs`（`:6`）、`node:path`（`:7`）。

## 5. 数据 I/O、读写与副作用

- 读：`apps/electron/resources/icon.ico`（存在性 `:16`，rcedit 读取 `:31`）；`out/win-unpacked/CDUT Studio.exe`。
- 写：`out/win-unpacked/CDUT Studio.exe` 原地改写资源段（图标 + version-string，`:24-32`）。
- 副作用：stdout 三/四行日志；无网络、无遥测、不写其它文件。

## 6. 分支、失败、取消与恢复

- exe 缺失 → `process.exit(1)`（`:12-15`）；ico 缺失 → `process.exit(1)`（`:16-19`）。
- `rcedit` 调用失败 → 顶层 await 拒绝，未捕获异常 → 进程非零退出（推断：`:24-32` 无 try/catch）。与 after-pack 不同，本文件无“临时副本+原子替换”备用策略（对比 `apps/electron/scripts/after-pack.cjs:99-111`）。
- 无取消/重试/恢复；失败时 exe 可能处于部分写入状态（rcedit 内部原子性未知——未知）。重入幂等：同参数重打结果一致（推断）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；对运行者/环境无鉴权与身份派生；版本信息权威值硬编码在本文件（`:25-30`），与 after-pack 的 appInfo 派生值并存（见 §4 差异）。

## 8. 修改影响面

- 无调用者，改动不影响任何现有构建链（§4 否定检索）；若未来接入，需与 `apps/electron/scripts/after-pack.cjs` 的图标/版本信息契约对齐（CompanyName/LegalCopyright 差异）。
- 依赖 `rcedit` npm 包（根 `package.json:37`）：删除该依赖会使本脚本无法运行（after-pack 不受影响，其直调 rcedit-x64.exe，`apps/electron/scripts/after-pack.cjs:15-23`）。
- `resources/icon.ico` 的合法性由 `apps/electron/scripts/packaging-guards.test.ts:283-290` 间接守护（ICO 头 00 00 01 00 与内嵌图数 >0）。

## 9. 测试证据

直接测试：无。否定检索：全冻结树 `*.test.*` grep `set-exe-icon|rcedit`——仅 `apps/electron/scripts/packaging-guards.test.ts` 命中 `readIcoImageCount` 相关断言（`:283-290`：`icon.ico` 存在、size>10000、`readIcoImageCount(icoPath)).toBeGreaterThan(0)`），属 icon.ico 资产间接证据，不断言本脚本行为。`NOT_RUN`：本轮未执行任何测试（bun test/typecheck/打包均未运行），断言为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 无导出、顶层 await 直接执行 | 已证实 | `apps/electron/scripts/set-exe-icon.ts:24-34` |
| 存在性双检查 + exit(1) | 已证实 | `:12-19` |
| version-string 四键 + icon 写入内容 | 已证实 | `:25-31` |
| 全树零调用者/零引用（五组 pattern） | 已证实 | 全冻结树文本检索 0 命中（范围见 §4） |
| 生产图标写入走 after-pack.cjs（并行两套） | 已证实 | `apps/electron/electron-builder.yml:20`、`apps/electron/scripts/after-pack.cjs:89-97` |
| rcedit 依赖根 package.json:37 + pnpm-lock 5.0.2 | 已证实 | `package.json:37`、`pnpm-lock.yaml:39`、`:151`、`:287` |
| rcedit 失败→未捕获→非零退出 | 推断 | `:24-32` 无 try/catch |
| 重打幂等 | 推断 | 未实测 |
| rcedit 写入的内部原子性 | 未知 | 外部依赖实现未读 |
| 本脚本是否为人工手动保留工具 | 未知 | 无注释/文档说明使用方式 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `exePath`/`icoPath` | §2/§3/§5 | 9-10 | covered |
| exe 缺失分支 | §3/§6 | 12-15 | covered |
| ico 缺失分支 | §3/§6 | 16-19 | covered |
| rcedit 写入（4 版本键+icon） | §3/§5 | 24-32 | covered |
| 零调用者结论 | §1/§4/§8 | — | covered（检索范围已声明） |
| 与 after-pack 差异 | §4/§7/§8 | after-pack.cjs:85-115 | covered（外部） |

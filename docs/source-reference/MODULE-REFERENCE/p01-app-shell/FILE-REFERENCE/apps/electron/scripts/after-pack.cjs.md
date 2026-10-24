---
path: apps/electron/scripts/after-pack.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2e6c365ec6fc42a774e94ee626941b01d7b9a655
sha256: a4291be14b2a06928593b725779a7aefbdd52efdc5e37d30df944b2278c179f6
lines: 133
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/after-pack.cjs

## 1. 结论与边界

electron-builder `afterPack` 钩子（133 行，CJS）：在 Windows 打包的 unpacked 阶段给产品 exe 写入 CDUT Studio 图标与版本信息（ProductName/FileDescription/CompanyName），并以"失败必须抛出、阻断打包"为硬契约（`apps/electron/scripts/after-pack.cjs:5-8`），防止图标/元数据静默回退为 Electron 默认。仅处理 `win32` 平台（`apps/electron/scripts/after-pack.cjs:62`）；不做签名、不做 mac/Linux 逻辑、不改 package.json。版本信息回读校验是软校验（失败仅警告，`apps/electron/scripts/after-pack.cjs:118-132`）。

## 2. 导出与关键符号

- 导出：函数 1（`module.exports = async function (context)`，即 afterPack 钩子，`apps/electron/scripts/after-pack.cjs:61`）；类型 0；常量 0。
- 内部函数 `findRcedit()`（内部，`apps/electron/scripts/after-pack.cjs:13-25`）：先取仓库根 `node_modules/rcedit/bin/rcedit-x64.exe`（root `package.json:37` devDependencies 含 `rcedit: ^5.0.2`），否则遍历 electron-builder winCodeSign 缓存目录；都找不到则 `throw new Error('rcedit-x64.exe not found')`。
- 内部函数 `isValidIco(filePath)`（内部，`apps/electron/scripts/after-pack.cjs:28-42`）：校验 ICO 头 `00 00 01 00` 且至少一张图；读取异常返回 false。
- 内部函数 `readExeVersionInfo(exePath)`（内部，`apps/electron/scripts/after-pack.cjs:48-59`）：以 PowerShell `(Get-Item ...).VersionInfo` 只读回读 `ProductName|FileDescription|CompanyName` 三元组。

## 3. 内部逻辑与关键流程

1. 平台短路（`apps/electron/scripts/after-pack.cjs:61-62`）：`context.electronPlatformName !== 'win32'` 直接 return，无副作用。
2. 定位 exe（`apps/electron/scripts/after-pack.cjs:64-73`）：候选名 `${productFilename}.exe` 与 `'CDUT Studio.exe'` 依次探测 `context.appOutDir`，命中即 `break`。
3. 前置校验（`apps/electron/scripts/after-pack.cjs:74-83`）：缺 exe 或 `resources/icon.ico` → throw `[afterPack] 缺少图标目标：…`；ICO 头非法 → throw `[afterPack] resources/icon.ico 不是合法的 Windows 图标文件（应 00 00 01 00 头）。`
4. 取权威名称（`apps/electron/scripts/after-pack.cjs:85-86`）：`productName`/`companyName` 来自 `context.packager.appInfo`，缺省 `'CDUT Studio'`/`'CDUT Studio Devs'`。
5. rcedit 打标（`apps/electron/scripts/after-pack.cjs:88-113`）：`findRcedit()` → `execFileSync(rcedit, [exePath, --set-icon, --set-version-string ×3])`；内层失败（exe 被资源管理器/杀软锁定）走备用策略：`copyFileSync` 到 `${exePath}.tmp.exe` → 对副本打标 → `copyFileSync` 覆盖回原 exe → 尽力 `unlinkSync` 临时副本。
6. 失败出口（`apps/electron/scripts/after-pack.cjs:114-116`）：外层 catch 统一 rethrow `[afterPack] rcedit 打图标失败，打包已中断（避免图标回退为 electron 默认）: …`。
7. 回读校验（`apps/electron/scripts/after-pack.cjs:121-132`）：`readExeVersionInfo` 结果与 `${productName}|${productName}|${companyName}` 比对；不一致在 try 内 throw，但被本段 catch 吞掉并 `console.warn`「版本信息回读校验被跳过（不影响图标）」；一致则 `console.log`「icon + metadata patched & verified」。返回值：钩子无返回值（Promise<void>）。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/electron-builder.yml:20`（`afterPack: scripts/after-pack.cjs`，electron-builder v25 生命周期钩子）。间接断言见 §9。
- 出向：`node:child_process.execFileSync`、`node:fs`（existsSync/readFileSync，失败分支另 require copyFileSync/unlinkSync，`apps/electron/scripts/after-pack.cjs:101`）、`node:path.join`；子进程 `rcedit-x64.exe` 与 `powershell`（`apps/electron/scripts/after-pack.cjs:49-57, 91-97`）。
- 否定结论：全树（frozen 根）grep `after-pack.cjs|afterPack` 未发现其它代码级调用点（工具：ripgrep 文本检索，pattern `after-pack\.cjs|after-sign-mac\.cjs`）；调用完全由 electron-builder 配置驱动。

## 5. 数据 I/O、读写与副作用

- 读：`resources/icon.ico`（`apps/electron/scripts/after-pack.cjs:74`）、exe 文件头经 PowerShell 回读；遍历 electron-builder winCodeSign 缓存目录（`apps/electron/scripts/after-pack.cjs:19-23`）。
- 写：仅改目标 exe 的资源区（rcedit 写入图标+版本字符串）；临时副本 `${exePath}.tmp.exe` 的复制/覆盖/删除（`apps/electron/scripts/after-pack.cjs:102-112`）。无 JSON/网络/缓存写。
- 原子性：备用路径用「副本打标 + copyFileSync 覆盖」而非 tmp+rename，覆盖瞬间非原子；临时副本删除失败被静默吞掉（`apps/electron/scripts/after-pack.cjs:112`）。非幂等问题：重复执行可重复写入相同值，幂等。
- 副作用：子进程（rcedit、powershell）、`console.log`/`console.warn` 打包日志。

## 6. 分支、失败、取消与恢复

- early-return：非 win32（`:62`）。
- throw（阻断打包）：缺 exe/ico（`:75-80`，文案见 §3.3）、ICO 非法（`:81-83`）、rcedit 缺失/执行失败（`:24` 与 `:114-116`，文案 `[afterPack] rcedit 打图标失败，打包已中断（避免图标回退为 electron 默认）`）。
- 降级分支：exe 被锁定时的临时副本回写（`:98-113`）；回读校验失败仅 `console.warn`（`:130-132`），不阻断。
- 失败后状态：throw 发生在 rcedit 阶段时 exe 可能处于"图标已写或未写"的不确定态，但打包整体中断，产物不会进入发布；tmp 副本可能残留（unlink 失败被吞）。
- 恢复路径：无自动重试；修复原因（补 ico/修 rcedit 来源）后重新打包。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态约定：exe 版本信息以 rcedit 写入为准，PowerShell 回读仅作软校验（`apps/electron/scripts/after-pack.cjs:118-120` 注释明确受限 CI 环境 ENOENT 时降级为警告）。

## 8. 修改影响面

- Windows 打包流程（electron-builder afterPack 阶段）；`apps/electron/electron-builder.yml:20` 钩子接线。
- 间接测试断言：`apps/electron/scripts/packaging-guards.test.ts:159`、`apps/electron/scripts/package-closure.test.ts:25`（断言配置串存在，改名需同步）。
- 产品 exe 的图标与版本元数据（用户可见属性）、品牌名回退常量 `'CDUT Studio'`/`'CDUT Studio Devs'`。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无直接单元测试（全树 grep `after-pack` 于 *.test.ts 仅命中配置串断言）。间接证据：`apps/electron/scripts/package-closure.test.ts:25`（`expect(builder).toContain('afterPack: scripts/after-pack.cjs')`）、`apps/electron/scripts/packaging-guards.test.ts:159`（`expect(config).toContain('afterPack: scripts/after-pack.cjs')`）——仅证明钩子接线，不证明 rcedit 行为。机械计数：packaging-guards.test.ts `test(` 19 处 / `it(` 0 处；package-closure.test.ts `test(` 4 处 / `it(` 0 处。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 钩子导出、平台短路、校验/throw 文案、rcedit 失败重试路径 | 已证实 | `apps/electron/scripts/after-pack.cjs:1-133` 全文 |
| rcedit 定位两条路径与 root devDependencies rcedit 对应 | 已证实 | `apps/electron/scripts/after-pack.cjs:13-25` + `package.json:37` |
| 回读校验在无 PowerShell 环境降级为警告 | 已证实 | `apps/electron/scripts/after-pack.cjs:118-132` |
| Windows 实际打包中 exe 被锁定触发备用路径的频率 | 未知 | 需运行取证，NOT_RUN |
| PowerShell 回读耗时 ~100ms | 推断 | 源码注释自述（`apps/electron/scripts/after-pack.cjs:46`），未实测 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| module.exports 钩子主体 | §3 | 61-133 | covered |
| findRcedit / isValidIco / readExeVersionInfo | §2/§3 | 13-59 | covered |
| win32 短路 / 前置校验 throw | §3/§6 | 62-83 | covered |
| rcedit 主路径 + 临时副本备用路径 | §3/§5/§6 | 88-116 | covered |
| 回读软校验降级 | §3/§6 | 121-132 | covered |
| 调用接线 | §4/§8 | — | covered |

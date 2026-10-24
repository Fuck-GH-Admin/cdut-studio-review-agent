---
path: apps/electron/scripts/nsis-icon-refresh.nsh
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fd4e81c4330664232d0facb76f4a3783b5341ff1
sha256: 3a3c7297cb564dfad998c31fbaa9db801c54fd01bdf9a1016994cbe188ea3942
lines: 26
kind: script
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/nsis-icon-refresh.nsh

## 1. 结论与边界

NSIS 安装器自定义宏脚本：提供 electron-builder NSIS 打包注入点 `customInstall` 宏——（升级/重）安装完成后刷新 Windows Shell 图标缓存，让 afterPack 打进 exe 的新 `CDUT Studio.exe` 图标立即生效（文件头 `apps/electron/scripts/nsis-icon-refresh.nsh:1-14`）。仅用 NSIS 内建命令，全部失败忽略、绝不阻断安装（`:12-13`）。

边界：不打图标（图标由 `apps/electron/scripts/after-pack.cjs` 写入 exe，`:6` 注释自述关系）；不重建快捷方式（由 electron-builder `addDesktopLink/addStartMenuLink` 在本宏之前完成，`:8-10`）；不做任何文件读写与注册表修改。

## 2. 导出与关键符号

无导出（NSIS 宏片段）。关键符号：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `customInstall` | NSIS 宏（`!macro`） | 16-26 | `!macro customInstall … !macroend` | electron-builder NSIS include 的安装钩子宏（命名约定） |
| `ie4uinit.exe -show` | 系统调用 | 19-22 | ExecWait | Win8+ 刷新图标缓存 |
| `SHChangeNotify` | 系统调用 | 25 | System::Call | 通知 shell 系统级资源变化 |

## 3. 内部逻辑与关键流程

宏体按顺序（`apps/electron/scripts/nsis-icon-refresh.nsh:16-26`）：

1. `:19-20` `IfFileExists "$WINDIR\System32\ie4uinit.exe" 0 +2` → 存在则 `ExecWait '…" -show'`（64 位系统目录）。
2. `:21-22` 同上对 `$WINDIR\SysWOW64\ie4uinit.exe`（32 位系统目录）。
3. `:25` `System::Call 'shell32.dll::SHChangeNotify(0x08000000, 0x0000, 0, 0)'`（`SHCNE_ASSOCCHANGED` 类通知，best-effort 兜底，`:24` 注释）。

`ExecWait` 返回值不检查；`IfFileExists` 缺失即静默跳过（`:18` 注释）。

## 4. 调用者与调用链

入向：`apps/electron/electron-builder.yml:210` `include: scripts/nsis-icon-refresh.nsh`（nsis 段 `:202-210`，注释 `:208-209` 说明用途）；`customInstall` 宏由 electron-builder 的 NSIS 打包流程在安装阶段注入调用（推断：electron-builder NSIS include/宏命名机制 + `:2` 自述 `customInstall hook`；electron-builder NSIS 模板源不在冻结树，注入点实现未读）。安装器构建入口：`apps/electron/package.json:57-59`（`dist:win*` → `run-electron-builder.cjs --win`）与 `:39`（`release:verify:windows`），NSIS target 见 `apps/electron/electron-builder.yml:197-200`。

出向：Windows 系统组件 `ie4uinit.exe`（`:20`、`:22`）、`shell32.dll::SHChangeNotify`（`:25`）。无仓库内依赖。

## 5. 数据 I/O、读写与副作用

- 读写：无文件/注册表读写。
- 副作用：调用 `ie4uinit -show`（刷新 Explorer/桌面图标缓存）与 `SHChangeNotify`（shell 通知）；在安装器进程（通常管理员权限，推断）内执行；无日志输出、无遥测。

## 6. 分支、失败、取消与恢复

- 两个 `IfFileExists` 分支：`ie4uinit.exe` 不存在则跳过对应 `ExecWait`（`:19`、`:21`）。
- `ExecWait`/`System::Call` 失败一律忽略、不回滚、不阻断安装（`:12-13` 安全注释；代码无返回值检查，推断失败静默）。
- 无取消/恢复概念（安装完成后一次性刷新）；重跑安全（幂等，推断：刷新缓存操作可重复）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/身份检查；运行上下文为 NSIS 安装器（权限等级由安装器/UAC 决定，推断）。无权威状态产生。

## 8. 修改影响面

- 影响 Windows 安装体验（覆盖安装后图标是否立即刷新）；与 `apps/electron/scripts/after-pack.cjs`（写图标进 exe）配套：改动 `:6-10` 描述的职责边界需两侧同步。
- 消费者仅 electron-builder NSIS 打包（`apps/electron/electron-builder.yml:210`）；改文件名/宏名需同步该 include 与 electron-builder 宏约定（`customInstall` 为固定注入点名，推断）。
- 无测试联动（§9）。

## 9. 测试证据

直接/间接测试均无。否定检索：全冻结树 `*.test.*` 文件 grep `nsis-icon-refresh|customInstall|ie4uinit|SHChangeNotify`，0 命中（含 `packaging-guards.test.ts`/`package-closure.test.ts`/`settings-macos-contract.test.ts`）。`NOT_RUN`：本轮未执行构建/安装/GUI（未跑 electron-builder、未装 NSIS 包），行为均为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| customInstall 宏结构与三条系统调用 | 已证实 | `apps/electron/scripts/nsis-icon-refresh.nsh:16-26` |
| 全部失败忽略、不阻断安装 | 已证实 | `:12-13`（注释）+ 无返回值检查（`:19-25`） |
| electron-builder 经 include 加载 | 已证实 | `apps/electron/electron-builder.yml:210` |
| 与 after-pack 图标写入的配套关系 | 已证实 | `:6-10` 注释、`apps/electron/scripts/after-pack.cjs:89-97` |
| customInstall 为 electron-builder 固定注入宏名 | 推断 | 机制转述，工具模板源不在冻结树 |
| 0x08000000 对应 SHCNE_ASSOCCHANGED 语义 | 推断 | `:24` 注释 + Win32 常规语义，未读系统文档 |
| ExecWait 失败时的可见行为 | 未知 | 未运行安装器实测 |
| 缓存刷新在个别系统上的实际效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `customInstall` 宏体 | §2/§3 | 16-26 | covered |
| System32 ie4uinit 分支 | §3/§6 | 19-20 | covered |
| SysWOW64 ie4uinit 分支 | §3/§6 | 21-22 | covered |
| SHChangeNotify 兜底 | §3/§5 | 24-25 | covered |
| 失败忽略语义 | §6 | 12-13 | covered |
| 加载/调用链 | §4 | electron-builder.yml:210 | covered |

---
path: apps/electron/src/main/lib/dev-shell-shortcut.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 970a32899ed7585a2bbbf046df2fb7f82780c4c7
sha256: 0de932f5505b779751f3cbb834e53869882bf5cf4ca4b83f139fc03dba63e133
lines: 73
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/dev-shell-shortcut.ts

## 1. 结论与边界

Windows 开发态 Shell 快捷方式维护（73 行）：裸 `electron.exe` 需独立 AUMID（`com.cdutai.studio.dev`），**绝不复用生产 CDUT Studio 身份**（头注 :10）；写完 AUMID 后用 WScript Shell COM 把 IconLocation 覆盖为裸 ICO（注释 :25-27，Electron icon 字段只接受 EXE/DLL）。

边界：仅 `platform==='win32' && !app.isPackaged` 时生效；生产打包态完全不触发。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DEV_APP_USER_MODEL_ID` | const | 6 | `com.cdutai.studio.dev` |
| `DEV_SHORTCUT_NAME` | const | 7 | `CDUT Studio Dev.lnk` |
| `shouldMaintainDevShellShortcut` | fn | 11-14 | win32 且未打包 |
| `maintainDevShellShortcut` | fn | 46-73 | 维护主入口 |

内部：`getProgramsPath`（:16-18，Start Menu/Programs）、`quoteWindowsArgument`（:20-22，转义空格/引号/尾反斜杠）、`setShortcutIconLocation`（:29-43，PowerShell EncodedCommand + WScript.Shell COM）。

## 3. 内部逻辑与关键流程

`maintainDevShellShortcut`（:46-73）：非 win32/已打包 → 直接返回；`resources/icon.ico` 不存在 → `console.warn` 跳过（不抛）；`shell.writeShortcutLink`（target=process.execPath、cwd=app.getAppPath、args=argv 转义拼接、icon 暂指 electron.exe 后被 COM 覆盖，注释 :58）create/update；返回 false → throw `无法写入开发版 Shell 快捷方式`；最后 `setShortcutIconLocation` 用环境变量传路径（避免命令行注入）。

## 4. 调用者与调用链

入向：`index.ts`/`ipc.ts` 侧启动流程（全树 grep 含 dev-shell-shortcut 的非测试文件）。出向：`electron`（app/shell）、`node:child_process`/`node:fs`/`node:path`。

## 5. 数据 I/O、读写与副作用

写 Start Menu `.lnk`；spawn `powershell.exe`（`-NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand`）；无网络。

## 6. 分支、失败、取消与恢复

ico 缺失→warn 跳过；writeShortcutLink false→throw；COM 失败→execFileSync 抛出；无取消/重试。

## 7. 权限与权威状态

- 身份权威：dev AUMID 与生产身份隔离（头注 :10「绝不能复用生产 CDUT Studio 身份」）。
- 输入权威：路径经 `PROFER_DEV_SHORTCUT_PATH/ICON` 环境变量传递 + `quoteWindowsArgument` 转义。
- 无 sender/role 检查（主进程启动期调用）。

## 8. 修改影响面

Windows 开发态任务栏/开始菜单身份分组。同批无直接测试（dev-shell 无专属测试文件）。

## 9. 测试证据

直接测试：**无**（全树检索 dev-shell-shortcut 测试文件 = 0）。间接：Electron mock 钩子测试族不覆盖本文件。NOT_RUN（未在 Windows 实机执行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| dev/prod AUMID 隔离 | 已证实 | :6/:10 |
| COM 覆盖 icon 流程 | 已证实（代码）/未知（行为） | :29-43（Windows 实测未做） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `shouldMaintainDevShellShortcut` | §3 | 11-14 | covered |
| `maintainDevShellShortcut` 主链 | §3 | 46-73 | covered |
| `setShortcutIconLocation` COM | §3 | 29-43 | partial（未测） |

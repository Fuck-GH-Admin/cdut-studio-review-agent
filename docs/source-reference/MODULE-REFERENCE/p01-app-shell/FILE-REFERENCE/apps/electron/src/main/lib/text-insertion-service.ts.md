---
path: apps/electron/src/main/lib/text-insertion-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e586b948b5bb7dc801bd841fe1034a81a6e9e1af
sha256: 4c69430c1d62ec9496285133f4add11bfbc272751c20374bee26d530db73913d
lines: 270
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/text-insertion-service.ts

## 1. 结论与边界

系统文本插入服务（270 行，头注释 `:1-5`）：临时剪贴板 + 系统粘贴快捷键，把文本写入前台应用光标位置；失败保留文本在剪贴板。mac 走 osascript keystroke、Windows 走 PowerShell SendInput。**冻结树内零调用者**（见 §4，语音输入 UI 若用应经 IPC 间接，无代码连接=〔未知〕需求面）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TextInsertionResult` | 接口（导出） | 37-42 | `{success, mode:'cursor'\|'clipboard', message, error?}` | 返回形状 |
| `pasteTextAtCurrentCursor` | 异步函数（导出） | 45-68 | `(text: string) => Promise<TextInsertionResult>` | 唯一入口 |

内部：`ClipboardSnapshot`/`ClipboardBufferSnapshot`/`ExecError`（`:17-35`）、`captureClipboardSnapshot`（`:70-79`）、`captureClipboardBuffers`（`:81-94`）、`scheduleClipboardRestore`（`:96-106`）、`restoreClipboardSnapshot`（`:108-121`）、`restoreClipboardBuffers`（`:123-137`）、`triggerSystemPaste`（`:139-151`）、`triggerMacPaste`（`:153-163`）、`triggerWindowsPaste`（`:165-178`）、`execFileAsync`（`:180-192`）、`getErrorMessage`（`:194-200`）、`WINDOWS_SEND_INPUT_SCRIPT`（`:202-270`，PowerShell Add-Type SendInput）；常量 `CLIPBOARD_READY_DELAY_MS=80`（`:12`）/`CLIPBOARD_RESTORE_DELAY_MS=10_000`（`:13`）/`MAC_PASTE_TIMEOUT_MS=2_000`（`:14`）/`WINDOWS_PASTE_TIMEOUT_MS=3_000`（`:15`）。导出合计 2。

## 3. 内部逻辑与关键流程

1. **pasteTextAtCurrentCursor**（`:45-68`）：快照全格式剪贴板（text/html/rtf/image/各 format buffer，`:70-79`/`:81-94`，私有格式读失败跳过 `:89-91`）→ `clipboard.writeText(text)`（`:47`）→ 80ms 后 `triggerSystemPaste()`（`:50-51`）→ 成功则 `scheduleClipboardRestore` + 返回 `{success:true, mode:'cursor'}`；失败 → warn + `{success:false, mode:'clipboard', '自动粘贴失败，已复制到剪贴板'}`（`:58-66`）。
2. **scheduleClipboardRestore**（`:96-106`）：10s 后定时恢复，**仅当剪贴板内容仍是插入文本才恢复**（`:99`，防覆盖用户新复制）；`timer.unref?.()`（`:105`，不阻退出）。
3. **restoreClipboardSnapshot**（`:108-121`）：四格式皆空 → 先试 buffers 写回（`restoreClipboardBuffers`），失败 `clipboard.clear()`（`:109-112`）；否则 `clipboard.write({text,html,rtf,image})`。
4. **triggerSystemPaste**（`:139-151`）：darwin → triggerMacPaste；win32 → triggerWindowsPaste；**其他平台 throw `'当前系统暂不支持自动粘贴'`**（`:150`）。
5. **triggerMacPaste**（`:153-163`）：`systemPreferences.isTrustedAccessibilityClient(true)` 无权限 → throw `'需要在 macOS 系统设置中允许 Profer 使用辅助功能'`（`:154-156`）；osascript `keystroke "v" using command down`（2s 超时）。
6. **triggerWindowsPaste**（`:165-178`）：PowerShell（NoProfile/NonInteractive/Bypass）执行 `WINDOWS_SEND_INPUT_SCRIPT`（3s 超时）——SendInput 四键序列 Ctrl↓V↓V↑Ctrl↑（`:243-257`），`sent != 4` 抛错（`:259-263`）。

## 4. 调用者与调用链

入向：**零调用者**。检索范围=baseline/source 全树 `*.ts`/`*.tsx`，模式 `text-insertion-service|pasteTextAtCurrentCursor` 仅本文件命中（`:45` 定义处）。〔未知〕是否为预留接口/被 IPC 间接需要（无代码连接不推断"不存在需求"）。
出向：`electron`（clipboard/systemPreferences）、`child_process.execFile`、`timers/promises`。

## 5. 数据 I/O、读写与副作用

- **剪贴板读写**（快照/写文本/恢复）；`execFile`（osascript/powershell）**系统按键注入**；10s 定时器（unref）。
- 影响面：前台应用会收到 Ctrl+V/⌘V 粘贴（副作用核心）。

## 6. 分支、失败、取消与恢复

- 失败路径：粘贴触发失败 → 保留文本在剪贴板（mode:'clipboard'）；剪贴板恢复失败 → warn（`:101-103`）。
- 恢复：快照恢复兜底链 buffers→clear（§3.3）；10s 条件恢复防覆盖用户复制（§3.2）。
- 平台 throw（§3.4）；mac 权限 throw（§3.5）；无取消机制。

## 7. 权限与权威状态

**mac 辅助功能门控**（`isTrustedAccessibilityClient`，`:154`）——权限事实（未运行验证〔未知〕OS 弹窗行为）。无 sender/role 检查。

## 8. 修改影响面

零现存调用方（改动无运行影响），但它是语音输入链路的预期落点（头注释 `:4`）；删除前需确认产品意图（未知）。三平台粘贴注入与剪贴板快照语义是行为契约。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `text-insertion-service` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/快照-注入-条件恢复链/门控/超时常量 | 已证实 | `:1-270` 全文逐行 |
| 零调用者（含检索模式与范围） | 已证实 | 全树检索（§4） |
| 语音输入需求面/预留接口意图 | 未知 | 无代码连接不推断 |
| mac 辅助功能/SendInput 真实行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `pasteTextAtCurrentCursor` 主流程 | §3.1 | 45-68 | covered |
| 快照/恢复（含条件恢复） | §3.2-3.3 | 70-137 | covered |
| 三平台注入/PowerShell 脚本 | §3.4-3.6 | 139-270 | covered |
| 零调用者否定 | §4/§8 | - | covered |

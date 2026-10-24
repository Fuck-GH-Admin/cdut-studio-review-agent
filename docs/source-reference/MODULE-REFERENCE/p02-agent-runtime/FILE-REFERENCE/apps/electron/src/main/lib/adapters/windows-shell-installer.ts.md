---
path: apps/electron/src/main/lib/adapters/windows-shell-installer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: eca4b4c966e74e6b55968ec23033b61280ec1749
sha256: 3a7bedc4cbfad59b1e5162d2d5cb02ac73eb0a977cb14d48ef936ffa017b0bb1
lines: 13
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/windows-shell-installer.ts

## 1. 结论与边界

**Windows Shell 安装工具供给判定**（`windows-shell-installer.ts:1-13`）：仅对没有 Shell 的**前台 Windows Agent** 提供安装工具；后台自动任务/子 Agent 必须跳过（`:4-5` 注释——无法可靠等待用户完成系统安装）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `WindowsShellInstallerTrigger` | type（export） | `:1` | `'user'\|'automation'\|'delegation'\|'goal'\|undefined` | 触发来源 |
| `shouldOfferWindowsShellInstaller` | function（export） | `:7-13` | `(platform, windowsShellAvailable, triggeredBy) => boolean` | 唯一函数 |

## 3. 内部逻辑与关键流程

单表达式（`:12`）：`platform === 'win32' && !windowsShellAvailable && triggeredBy === 'user'`——三条件与：Windows 平台 + 无 Shell + 用户触发。`windowsShellAvailable: undefined` 经 `!` 判为"无 Shell"（与 false 同路径）。

## 4. 调用者与调用链

入向：Pi 工具供给链（adapters/工具注册，跨文件 caller 检索见 SOURCE-EVIDENCE）；出向：无（纯函数）。

## 5. 数据 I/O、读写与副作用

无；确定性纯函数。

## 6. 分支、失败、取消与恢复

单与门三条件；不抛错。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支；边界语义=前台用户触发才可引导系统安装（`:4-5`）。

## 8. 修改影响面

改判定 → Windows 平台 Agent 工具供给（后台/子 Agent 安装引导行为）。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `shouldOfferWindowsShellInstaller` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+单表达式 | 已证实 | 逐行读 `:1-13` |
| 调用方实际传参 | 未知 | 跨文件未逐处核 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2/§3 | `:1-13` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

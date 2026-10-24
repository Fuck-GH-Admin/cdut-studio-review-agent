---
path: apps/electron/src/main/lib/clipboard-agent-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4e8b69d956761c521b2876482b4b0e8e5bb3b745
sha256: 481b1301761b6d64b6cc38c030916d27e778b77dcce83aa048d94d6068f08390
lines: 49
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/clipboard-agent-tools.ts

## 1. 结论与边界

**Agent 系统剪贴板工具**（49 行）：`clipboard_read_text`/`clipboard_write_text` 主进程正规实现（Electron clipboard UTF-8——解决 PowerShell Get-Clipboard 的 GBK 乱码退化路线 `:7-9`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `MAX_CLIPBOARD_TEXT_CHARS=64000` | `:19` | 单次读写字符上限 |
| `ClipboardAgentToolError` | `:21-26` | 自定义错误 |
| `readClipboardText` | `:29-38` | 带上限读（**空剪贴板抛错**防 Agent 误读空串 `:28`）；超限截断+truncated 标记 |
| `writeClipboardText` | `:41-49` | 带上限写（空/超长抛错） |

## 3. 内部逻辑与关键流程

字符计数（`Array.from` 按码点）→截断/拒绝→Electron clipboard。

## 4. 调用者与调用链

Agent 剪贴板工具 IPC；出向 `electron` clipboard。

## 5. 数据 I/O、读写与副作用

系统剪贴板读写。

## 6. 分支、失败、取消与恢复

空读/空写/超长→ClipboardAgentToolError。

## 7. 权限与权威状态

**安全边界声明**（`:11-13`）：用户确认"完全放开"剪贴板，敏感内容（密码）被读取属**用户已知并接受的边界**（照实记录）。

## 8. 修改影响面

改上限/错误语义影响 Agent 工具体验。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/安全边界声明 | 已证实 | 49 行全读 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。

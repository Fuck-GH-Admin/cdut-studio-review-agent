---
path: apps/electron/src/main/lib/detached-preview-window.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 18cf583b2e3bc1b4e7eb2fd9a1b09ac38ef098db
sha256: dce23966daea535a4e8a5c663d294e6d0461f26d7dde69044654d8b04078e6ae
lines: 199
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/detached-preview-window.ts

## 1. 结论与边界

**独立预览窗口管理**（199 行）：主窗口 payload 交主进程保存、独立窗口经 previewId 读取（"避免长路径和 basePaths 塞 URL" `:4-5`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `openDetachedPreviewWindow` | `:87-195` | 去重复用（signature 命中则聚焦 `:93-101`）→BrowserWindow（preload+contextIsolation `:121-125`）→dev/prod 双加载→**windowOpenHandler/will-navigate 双拦截**（外链 openExternal、本机路径 **CVE-2026-96951 防御**：可执行文件先 `confirmExecutableFileOpen` 安全确认 `:165-168`）→closed 清理三 Map |
| `getDetachedPreviewWindowData` | `:197-199` | previewId→data |

内部：三 Map（data/windows/signature `:16-18`）、`makeSignature:39-49`（JSON 签名去重）、`centerBoundsNearSource:55-69`（源窗居中）、`installDetachedPreviewShortcuts:71-85`（Esc/Cmd+W 关窗）、`toSystemPath:149-158`（file:// 解码）。

## 3. 内部逻辑与关键流程

签名去重→窗口创建→导航安全拦截（deny 默认）→清理。

## 4. 调用者与调用链

预览"弹出独立窗口"IPC；出向 `./security/executable-open-guard`（CVE 防御）、config-paths（VITE_DEV_SERVER_URL）。

## 5. 数据 I/O、读写与副作用

窗口管理、shell.openExternal/openPath。

## 6. 分支、失败、取消与恢复

必填三参缺失→null；同签名窗口复用；closed 三 Map 清理。

## 7. 权限与权威状态

- **CVE-2026-96951 防御红线**（`:165`）：可执行/脚本打开前安全确认。
- **导航拦截默认 deny**（`:170`/`:174`）：防预览页任意跳转。

## 8. 修改影响面

改拦截影响安全面；签名去重影响多开行为。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/双拦截/CVE 防御 | 已证实 | 199 行全读 |
| executable-open-guard 实现 | 未知 | 不在本批 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；依赖/实效 unknown。

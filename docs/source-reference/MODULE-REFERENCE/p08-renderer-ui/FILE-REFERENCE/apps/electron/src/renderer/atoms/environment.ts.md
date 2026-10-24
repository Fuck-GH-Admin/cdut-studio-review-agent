---
path: apps/electron/src/renderer/atoms/environment.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5b3cbd2ed258f397a364adcc04fc5d93864b8c10
sha256: ef3bc8fffdf60c032ee7fa444558f8a19ae21393dda3a07de4e6b0f6747df7b8
lines: 90
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/environment.ts

## 1. 结论与边界

环境检测状态管理（90 行，头注释 `:1-5`）：检测结果/运行时状态/安装包清单/下载态五个基础 atom + 三个派生 UI 判断 + 对话框开关。纯状态声明。

**边界**：检测/下载执行在 hooks/面板（跨批）；`installerManifestAtom` 的"远程拉取失败回退内置"拉取动作在别处（`:48` 注释，〔推断〕）；类型来自 `@profer/shared`（`:8-12`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `InstallerDownloadState` | 接口（导出） | 17-29 | `{status: idle\|downloading\|verifying\|done\|failed\|cancelled, downloaded?, total?, speed?, filePath?, error?}` | 单安装包下载态 |
| `environmentCheckResultAtom` | atom（导出） | 35 | `EnvironmentCheckResult \| null` | 最近一次检测结果 |
| `runtimeStatusAtom` | atom（导出） | 40 | `RuntimeStatus \| null` | 含 Windows Shell 检测 |
| `isCheckingEnvironmentAtom` | atom（导出） | 45 | `boolean` 初值 false | 检测进行中 |
| `installerManifestAtom` | atom（导出） | 50 | `InstallerManifest \| null` | 安装包清单 |
| `installerDownloadStatesAtom` | atom（导出） | 56 | `Record<string, InstallerDownloadState>` | key 形如 `"git-for-windows:x64"` |
| `hasEnvironmentIssuesAtom` | 派生 atom（导出） | 61-65 | `result ? result.hasIssues : false` | 仅 macOS/旧逻辑（`:59` 注释） |
| `isShellEnvironmentOkAtom` | 派生 atom（导出） | 71-76 | 见 §3 | Git Bash 或 WSL 任一可用 |
| `isNodeJsOkAtom` | 派生 atom（导出） | 81-85 | `runtime ? !!runtime.node?.available : true` | 软需求，仅提示不阻塞 |
| `environmentCheckDialogOpenAtom` | atom（导出） | 90 | `boolean` 初值 false | 环境检测 Dialog 开关 |

导出合计 10。

## 3. 内部逻辑与关键流程

1. `hasEnvironmentIssuesAtom`（`:61-65`）：result 为 null → false；否则 `result.hasIssues`。
2. `isShellEnvironmentOkAtom`（`:71-76`）：`!runtime` → true（**null runtime 视为 OK**）；`!runtime.shell` → true（非 Windows，`:74`）；否则 `gitBash?.available || wsl?.available` 任一真。
3. `isNodeJsOkAtom`（`:81-85`）：`!runtime` → true；否则 `!!runtime.node?.available`（软需求语义 `:79` 注释）。

## 4. 调用者与调用链

入向（全冻结树检索 `environment` atoms 模块，7 文件）：
- `components/app-shell/left-sidebar/use-left-sidebar.ts:93`（`hasEnvironmentIssuesAtom`）。
- `renderer/App.tsx:9`（`environmentCheckDialogOpenAtom`）。
- `components/settings/AboutSettings.tsx:20`（多符号 import 块）。
- `components/settings/SettingsPanel.tsx:34`（import 块）。
- `components/agent/SDKMessageRenderer.tsx:57`（`environmentCheckDialogOpenAtom`）。
- `components/environment/EnvironmentCheckCard.tsx:26`（多符号 import 块）。
- `components/environment/EnvironmentCheckPanel.tsx:18`（多符号 import 块）。
出向：`jotai`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯 atom 声明；数据由检测方写入）。

## 6. 分支、失败、取消与恢复

分支：三派生的 null/缺字段回退（§3）。无 throw（不适用）。**语义注意**：null runtime 被当作 OK（`:73`/`:83`）——检测未跑时 UI 不报问题，照实记录。

## 7. 权限与权威状态

无权限分支（不适用）。权威状态=主进程检测结果（RuntimeStatus/EnvironmentCheckResult，跨批）。

## 8. 修改影响面

7 个消费方的环境提示/检测对话框 UI；`isShellEnvironmentOkAtom` 的 Windows Shell 门槛（Git Bash/WSL）是 Windows 启动可用性判定之一；`InstallerDownloadState.status` 6 态是下载 UI 契约。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `atoms/environment` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出/三派生语义/null 视为 OK | 已证实 | `:1-90` 全文逐行 |
| 7 个调用方 | 已证实 | 全树检索（§4） |
| 清单远程拉取/回退动作 | 推断 | `:48` 注释（动作在别处） |
| RuntimeStatus.shell/node 字段形状 | 边界（跨批类型） | `:8-12` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `InstallerDownloadState` | §2 | 17-29 | covered |
| 5 个基础 atom | §2 | 35-56 | covered |
| 三派生（含 null 语义） | §3/§6 | 61-85 | covered |
| Dialog 开关 | §2 | 90 | covered |

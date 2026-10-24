---
path: packages/shared/src/types/installer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3941fdf3a05c047a41258fff317276421e2f3288
sha256: 203e3f57d358b8a83d55691af7ae3849f4956eafbfd4244db35f09ef875fa56a
lines: 93
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/installer.ts

## 1. 结论与边界

第三方安装包（Git/Node.js 等）下载与安装的共享契约（`:3-8` 注释：经 proma-api `/installers/manifest` 拿清单，Windows 用户一键下载并拉起官方安装程序）。6 个接口 + 1 个 IPC 通道常量。

不做的事：不下载/不校验/不拉起（主进程安装服务负责）；不含内置回退清单内容。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状 |
| --- | --- | --- | --- |
| `InstallerSource` | interface | `:15-34` | `{id; platform:Platform; arch:'x64'\|'arm64'; version; downloadUrl(自建 OSS 短期有效); fallbackUrl(官方上游); sha256; sizeBytes; filename}` |
| `InstallerManifest` | interface | `:39-41` | `{installers: InstallerSource[]}` |
| `InstallerProgressPayload` | interface | `:46-55` | `{key(id+arch，区分并发下载); downloaded; total; speed}` |
| `InstallerDownloadResult` | interface | `:60-65` | `{filePath; sha256(校验通过)}` |
| `InstallerDownloadRequest` | interface | `:70-77` | `{id; arch; platform?（省略时主进程按当前系统处理，兼容旧调用方）}` |
| `INSTALLER_IPC_CHANNELS` | const `as const` | `:82-93` | 5 键：`MANIFEST='installer:manifest'`（优先远程失败回退内置）、`DOWNLOAD`、`CANCEL(参数 key)`、`LAUNCH(参数 filePath)`、`PROGRESS(main→renderer)` |

import：`Platform` 自 `./runtime`（`:1`）。

## 3. 内部逻辑与关键流程

纯声明。关键语义链（跨文件）：`MANIFEST` 远程优先/内置回退 → `DOWNLOAD`（sha256 校验）→ `PROGRESS` 事件（key 区分并发）→ `LAUNCH` 拉起。`downloadUrl`/`fallbackUrl` 双源降级语义在字段注释（`:24-27`）。

## 4. 调用者与调用链

preload 桥（`preload/index.ts:2656-2672`：`fetchInstallerManifest`/`downloadInstaller`/`cancelInstallerDownload`/`launchInstaller`/`onInstallerProgress`——后者是全桥唯一 `ipcRenderer.off` 闭包）；主进程安装服务（下载+sha256 校验+拉起）；设置页安装向导 UI。出向：`./runtime`。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O（下载/写盘在主进程服务侧）。

## 6. 分支、失败、取消与恢复

不适用（无控制流）。失败/降级语义由字段承载：`fallbackUrl`（OSS 不可达降级）、`MANIFEST` 回退内置、`CANCEL` 按 key 取消并发下载中的单项。

## 7. 权限与权威状态

安全语义在字段：`sha256`（`:28-29` 注释"下载后校验"）与 `sizeBytes`（进度基准）由 manifest 权威给出；`LAUNCH` 拉起外部安装程序属高危动作，确认门在调用方（主进程服务/UI），本文件不设闸。

## 8. 修改影响面

改字段影响安装向导与主进程安装服务；`InstallerProgressPayload.key` 格式（id+arch）是并发下载区分约定（`:47` 注释）；通道字符串改名需同步 preload `:2656-2672` 与 main 注册（`installer:<kebab>` 规则无例外）。

## 9. 测试证据

无直接测试（`skin-manager-service.test.ts` 测的是皮肤安装，非本模块；检索 `InstallerSource`/`INSTALLER_IPC_CHANNELS` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出、字段/常量值如 §2 | 已证实 | 文件全读 |
| 双源降级/回退/按 key 取消语义 | 已证实（字段/注释） | `:24-27`、`:83`、`:88` |
| sha256 校验的实际执行 | 未知 | 服务实现不在本批 |
| manifest API 的真实响应 | 未知 | NOT_RUN 网络 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 6 导出全量 | §2 | covered |
| 语义链/失败分支 | §3/§6 | covered |
| 安全/权威 | §7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/未知 | §9/§10 | covered |

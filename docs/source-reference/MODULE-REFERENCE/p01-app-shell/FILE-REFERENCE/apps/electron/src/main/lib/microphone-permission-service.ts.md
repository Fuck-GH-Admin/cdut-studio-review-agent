---
path: apps/electron/src/main/lib/microphone-permission-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fee5eddcc9885c810c0406407b76345ab0e6ba47
sha256: 720ee88b92a8e54fd300a5e97e345144e7717c6fa9a24be76c4f1bfef3cb55e4
lines: 49
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/microphone-permission-service.ts

## 1. 结论与边界

麦克风权限查询/请求服务（49 行，头注释 `:1-7`）：macOS 走 `systemPreferences` 检查与请求；Windows/Linux 返回 `unsupported`，由 renderer 的 getUserMedia 触发系统弹窗。

**边界**：不做录音、不接 IPC、不持久化权限状态；当前**冻结树内无任何调用者**（见 §4），属预留服务。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `checkMicrophonePermission` | 函数（导出） | 16-34 | `() => MicPermissionResult` | 同步状态查询 |
| `requestMicrophonePermission` | 函数（导出） | 36-49 | `() => Promise<MicPermissionResult>` | 请求权限 |
| `getPlatform` | 函数（内部） | 12-14 | `() => NodeJS.Platform` | `process.platform` 封装 |

导出合计 2；内部 1。`MicPermissionResult` 来自 `../../types`（`:10`，形状 `{status, platform}` 由返回值体现）。

## 3. 内部逻辑与关键流程

1. **check**（`:16-34`）：darwin 分支（`:19`）取 `systemPreferences.getMediaAccessStatus('microphone')`（`:20`，Electron 返回 `'granted'|'denied'|'not-determined'|'restricted'`，`:21` 注释）；`granted/denied/not-determined` 原样映射（`:23-24`），其余（`restricted`）→ `'denied'`（`:25-28`，家长控制/企业策略语义）；返回 `{status, platform}`（`:29`）。非 darwin → `{status:'unsupported', platform}`（`:32-33`）。
2. **request**（`:36-49`）：darwin（`:39`）`await systemPreferences.askForMediaAccess('microphone')`（`:40`）→ `granted ? 'granted' : 'denied'`（`:42`）；非 darwin → `unsupported`（`:47-48`）。

## 4. 调用者与调用链

- 入向：**冻结树内零 import、零调用**。检索范围=baseline/source 全树（含 docs/资源），模式 `microphone-permission`、`checkMicrophonePermission`、`requestMicrophonePermission` 及裸词 `microphone`，命中仅本文件（`:20`/`:40` API 参数）与 `docs/windows-execution-acceptance-guide.md` 之外无代码引用；即无 IPC handler、无 renderer 桥接。是否有未来接线意图=未知（无代码连接不能推断"不存在需求"）。
- 出向：`electron` 的 `systemPreferences`（`:9`）、类型 `MicPermissionResult`（`:10`）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络（不适用，依据：全文无 fs/net）。副作用：`getMediaAccessStatus` 为只读查询；`askForMediaAccess`（`:40`）可能触发 macOS 系统权限弹窗（Electron 语义）。

## 6. 分支、失败、取消与恢复

- 分支：平台二分（darwin/其他，`:19`/`:39`）；状态映射三分支（`:23-28`）。
- 失败：`askForMediaAccess` 的异常未捕获（本文件无 try/catch，〔证实〕全文），由调用方处理。
- 取消/恢复：不适用（无持久状态/异步任务）。

## 7. 权限与权威状态

本文件即权限查询/请求服务本身：权威状态由 macOS 系统（TCC）产生，`getMediaAccessStatus` 只读映射；`restricted→denied` 是本文件的归并口径（`:25-28`）。无 sender/role 守卫（不适用，依据：本文件无权限检查逻辑；FACT-CHECKING-NOTES：不得借调用方守卫暗示本文件验证——且本文件无调用方）。

## 8. 修改影响面

当前无运行时调用方，改动无现存行为影响；但 `MicPermissionResult` 状态语义（`unsupported`/`restricted→denied`）是未来 IPC/前端接线的契约面。若接线，Windows/Linux 的 `unsupported` 语义需与 renderer getUserMedia 弹窗路径保持一致（`:6`/`:32`/`:47` 注释）。

## 9. 测试证据

直接测试：**无**（全冻结树检索上述模式无测试命中）。间接证据：无。

`NOT_RUN`：本轮未运行任何测试；未做真实系统权限验证（无 darwin 环境）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 两导出分支/映射/归并口径 | 已证实 | `:1-49` 全文逐行 |
| 全树零调用者 | 已证实 | 全冻结树检索（§4 模式列表） |
| macOS restricted 实际来源（家长控制/企业） | 已证实（注释声明） | `:26` |
| 未来接线意图 | 未知 | 无代码连接 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getPlatform` | §2 | 12-14 | covered |
| `checkMicrophonePermission`（darwin/映射/非 darwin） | §3.1 | 16-34 | covered |
| `requestMicrophonePermission` | §3.2 | 36-49 | covered |
| 零调用否定+检索范围 | §4/§9 | - | covered |

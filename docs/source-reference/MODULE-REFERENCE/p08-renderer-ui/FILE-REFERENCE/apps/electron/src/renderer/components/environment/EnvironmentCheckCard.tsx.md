---
path: apps/electron/src/renderer/components/environment/EnvironmentCheckCard.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e65dd7f368ab7f769d2cc3bbb9f6a1db3542a356
sha256: dad0ce2eabf60a06303a732f3bb4a9b21e644228ed0b6301dad810df17918661
lines: 287
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/environment/EnvironmentCheckCard.tsx

## 1. 结论与边界

环境检测卡片（渲染层运行时）：显示单个环境项（Shell/Node.js 等）检测结果，error/warning 时提供恢复动作——`download`（profer-api 清单一键下载官方安装包并自动拉起）或 `openExternal`（外链下载页）（文件头 `apps/electron/src/renderer/components/environment/EnvironmentCheckCard.tsx:1-8`）。

边界：不跑检测（EnvironmentCheckPanel/主进程 runtime-init）；下载清单来自 `installerManifestAtom`；安装启动经 IPC。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出（其余内部）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `EnvironmentCheckCard` | 函数/组件（导出） | 51-104 | `({name, status, version?, requirement, statusText?, action}) => JSX` | 检测卡片 |
| `CheckStatus` | 类型（内部） | 29 | `'checking'\|'success'\|'warning'\|'error'` | |
| `CardAction`（类型） | 类型（内部） | 31-34 | `none \| openExternal{url,label?} \| download{installerId,labelPrefix?}` | |
| `CardAction`（组件） | 组件（内部） | 106-126 | 动作按钮分发 | openExternal/download/null |
| `formatBytes` | 函数（内部） | 128-133 | B/KB/MB/GB | |
| `detectArch` | 函数（内部） | 135-138 | `'x64'\|'arm64'`（`getPlatformInfo().arch`） | |
| `DownloadAction` | 组件（内部） | 140-287 | 下载状态机 UI | §3.2 |

## 3. 内部逻辑与关键流程

### 3.1 卡片渲染（`:51-104`）

状态图标/颜色/默认文案三张查表（`:59-78`）：checking 转圈、success 绿、warning 黄、error 红；`statusText||statusTextDefault`（`:92`）。仅 `error||warning` 且 `action.type!=='none'` 时显示动作（`:98-100`）。`openExternal` 按钮 `window.electronAPI.openExternal(url)`（`:107-118`）。

### 3.2 `DownloadAction` 状态机（`:140-287`）

- key=`${installerId}:${arch}`（保持进度/取消契约，`:146-147`）；state 来自 `installerDownloadStatesAtom`（`:141,148`）。
- 进度订阅 `onInstallerProgress`（按 key 过滤）写 atom（`:150-167`）。
- `handleDownload`（`:169-195`）：置 downloading→`downloadInstaller({id, arch, platform})`→done+`launchInstaller` 自动拉起（失败仅 console.error `:182-184`）；异常按 message 区分 `cancelled`/`failed`（`:185-194`）。
- `handleCancel`：`cancelInstallerDownload(key)`（`:197-199`）；`handleRelaunch`：再次 `launchInstaller(filePath)`（`:201-205`）。
- `hasSource`：manifest 缺该 installer 时禁用按钮（`?? true` 兜底，`:207-209`）。
- 四态 UI：downloading（进度条+取消）、done（提示+再次打开）、failed（错误+重试）、idle（一键下载，`:211-286`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`settings/AboutSettings.tsx:22`（import）、`:117,:138,:226,:240`（4 处渲染）；`environment/EnvironmentCheckPanel.tsx:12,142,153`（2 处渲染）。

出向：`@/atoms/environment`（`installerDownloadStatesAtom`/`installerManifestAtom`/类型，`:22-26`）、`@profer/shared` `InstallerDownloadRequest`（`:27`）、`window.electronAPI`（`getPlatformInfo`/`onInstallerProgress`/`downloadInstaller`/`launchInstaller`/`cancelInstallerDownload`/`openExternal`，`:112-203`）。

## 5. 数据 I/O、读写与副作用

- IPC：下载安装包（写盘在主进程）、拉起安装器（进程启动）、取消、开外链；原子状态写 `installerDownloadStatesAtom`。
- 副作用：进度事件订阅；进程启动。
- 并发：按 key 隔离多安装器下载；订阅按 key 过滤（`:152`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 结果 |
| --- | --- | --- | --- |
| 动作隐藏 | status 不是 error/warning 或 none | 98-100 | 无按钮 |
| 下载成功 | downloadInstaller resolve | 177-184 | done+自动拉起 |
| 拉起失败 | launchInstaller reject | 182-184 | 仅 console.error |
| 取消 | message==='cancelled' | 190 | cancelled 态 |
| 失败 | 其它异常 | 185-194 | failed+重试 |
| 无源禁用 | manifest 缺项 | 208-209, 265, 280 | disabled |

取消/恢复：`cancelInstallerDownload` + 失败重试；无其它恢复概念。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；下载清单权威=`installerManifestAtom`（profer-api 清单，主进程拉取）；安装器拉起经 preload 白名单。

## 8. 修改影响面

- 消费方 2 个组件 6 处（§4）；下载状态机与 `installerDownloadStatesAtom` key 契约（`id:arch`）耦合（主进程进度/取消事件同 key）。
- `InstallerDownloadRequest` 形状在 shared。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*`/`*.spec.*` 检索 `EnvironmentCheckCard` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实下载/安装。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 内部 6 符号 | 已证实 | `:29-287` 逐行读 |
| 四态状态机+取消/重试 | 已证实 | `:169-286` |
| 6 处调用（2 组件） | 已证实 | §4 行号 |
| manifest 缺项禁用兜底 `?? true` | 已证实 | `:208-209` |
| 主进程下载/进度实现 | 未知 | 非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `EnvironmentCheckCard` | §2-3.1 | 51-104 | covered |
| `CardAction` 分发 | §3.1 | 106-126 | covered |
| `DownloadAction` 四态 | §3.2, §6 | 140-287 | covered |
| `formatBytes`/`detectArch` | §2 | 128-138 | covered |
| 调用链 | §4 | - | covered |
| 主进程下载链 | §10 | - | unknown（非本批） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

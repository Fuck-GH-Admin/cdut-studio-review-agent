---
path: apps/electron/src/main/lib/installer-downloader.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 11df3ac9c573bfd43eb1e5f4cc075b98fb3d0f04
sha256: 8accba0f138714ff1a36bdb22e78acfbd641d7975b914c2f195051b309d51a33
lines: 279
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/installer-downloader.ts

## 1. 结论与边界

**第三方安装包下载器**（279 行，`change=r03_pr44`）：从 OSS/官方源流式下载 Git、Node.js 安装程序到临时目录，下载中经 `BrowserWindow.webContents.send` 推进度、完成后 sha256 校验，支持取消、重定向跟随（≤5 次）、主/备 URL 降级，另有拉起安装程序与缓存清理。

边界：不解析安装包清单（`installer-manifest.ts` 负责）；不决定下载哪个包（IPC/adapters 层查清单）；不做安装执行（`launchInstaller` 仅 `shell.openPath`，UAC 由 OS 决定，注释 `:257-259`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `downloadInstaller` | 导出函数 | 42-93 | `(source: InstallerSource, key: string, sender?: BrowserWindow): Promise<InstallerDownloadResult>` | 主下载（含 fallback+校验） |
| `cancelInstallerDownload` | 导出函数 | 245-252 | `(key: string): boolean` | 按 key 取消 |
| `launchInstaller` | 导出函数 | 260-265 | `(filePath: string): Promise<void>` | `shell.openPath` |
| `cleanInstallerDir` | 导出函数 | 268-279 | `(): Promise<number>` | 清缓存目录，返回删除数 |
| `activeDownloads` | 内部常量 | 26 | `Map<key, () => void>` | 可取消下载注册表 |
| `getInstallerDir` | 内部函数 | 31-33 | `(): string` | `app.getPath('temp')/profer-installers` |
| `downloadToFile` | 内部函数 | 98-228 | `(url, filePath, source, key, sender): Promise<void>` | 流式下载+重定向+进度 |
| `emitProgress` | 内部函数 | 230-233 | `(sender, payload)` | `INSTALLER_IPC_CHANNELS.PROGRESS` |
| `computeSha256` | 内部函数 | 235-240 | `(filePath): Promise<string>` | 全文 sha256 |

导出计数：`export` 4 条（`:42`、`:245`、`:260`、`:268`），与源码一致。

## 3. 内部逻辑与关键流程

- **downloadInstaller**（`:42-93`）：
  1. `mkdir -p` 缓存目录（`:47-48`）；目标 `filePath = dir/source.filename`（`:49`）。
  2. URL 列表 = `[downloadUrl, fallbackUrl]` 过滤非空（`:52-54`）；全空 throw `安装包清单缺少有效 URL`（`:55-57`）。
  3. 逐 URL：`downloadToFile` → `computeSha256` → 与 `source.sha256` 小写比较，不匹配 `unlink` 后 throw `sha256 校验失败：期望 … 实际 …`（`:63-69`）；**清单未给 sha256 则跳过校验并 warn**（`:70-74`）；成功返回 `{filePath, sha256}`（`:75`）。
  4. 失败：`error.message === 'cancelled'` → **直接抛出不降级 fallback**（`:78-83`）；否则 warn、`unlink` 半成品、试下一个 URL（`:84-89`）。
  5. 全部失败 throw `lastError ?? '所有下载源均失败'`（`:92`）。
- **downloadToFile**（`:98-228`）：Promise 包装；`activeDownloads.set(key, cancel)`（`:115`），`cleanup` 删注册（`:117-119`）。
  - `doGet(url, redirectsLeft=5)`（`:125-224`、`:226`）：**先 `assertSafeUrlNoNul(targetUrl)` NUL/控制字符校验**（`@profer/shared`，注释 `:128` CVE-2026-105482 纵深防御，覆盖初始 URL 与重定向 Location）→ 解析 URL，失败关流+reject（`:129-136`）。
  - 3xx 且有 `location`：`res.resume()`；`redirectsLeft <= 0` → reject `重定向次数过多`（`:147-152`）；否则 `new URL(location, parsed)` 递归（`:153-154`）。
  - 非 2xx：关流+reject `HTTP <status>`（`:158-164`）。
  - 进度：`total = content-length > 0 ? content-length : source.sizeBytes`（`:166-167`）；data 事件每 ≥250ms 或完成时 `emitProgress({key, downloaded, total, speed})`（`:172-183`）；`res.pipe(fileStream)`（`:185`）。
  - `finish`：close+cleanup；已取消→reject `'cancelled'`，否则补发 100% 进度（`downloaded=total, speed:0`）并 resolve（`:187-202`）。
  - 错误线：`fileStream`/`res`/`request` 的 error 都 close+cleanup+reject（`:204-214`、`:219-223`）；`requestToAbort = request` 供 cancel destroy（`:217`、`:109-114`）。
- **cancelInstallerDownload**（`:245-252`）：`activeDownloads.get(key)` 命中→`cancel()`（置 `cancelled` + `requestToAbort.destroy(new Error('cancelled'))`，`:109-114`）返回 true；未命中 false。
- **launchInstaller**（`:260-265`）：`shell.openPath` 返回错误串 → throw `无法拉起安装程序：…`。
- **cleanInstallerDir**（`:268-279`）：目录不存在返回 0；`readdir` 逐个 `unlink` 计数，单个失败跳过。

## 4. 调用者与调用链

- 入向（全冻结树 `grep installer-downloader|downloadInstaller|cancelInstallerDownload|launchInstaller|cleanInstallerDir`，apps+packages 全文件类型）：
  - `apps/electron/src/main/ipc.ts:261-264` import；`installer:download` handler（`:2612-2627`）：`fetchInstallerManifest`→`findInstallerSource`，无源 throw；`BrowserWindow.fromWebContents(event.sender)` 作 `sender` 推进度，窗口已关 throw；key=`${req.id}:${req.arch}`（`:2624`）。`installer:cancel`（`:2629-2634`）、`installer:launch`（`:2636-2641`）。通道值 `packages/shared/src/types/installer.ts:84-92`（含 `PROGRESS: 'installer:progress'`）。
  - `apps/electron/src/main/lib/adapters/pi-builtin-tools.ts:84` import `downloadInstaller, launchInstaller`；`:1972-1973` Agent 工具内下载 Git for Windows 并拉起（key=`agent-git-for-windows-${ctx.sessionId}`）。
  - 渲染链路：`EnvironmentCheckCard.tsx:176/182/198/203`（下载/拉起/取消）经 `preload/index.ts:696-702`、`:2659-2665`。
  - `cleanInstallerDir`：**全冻结树 0 消费者**（检索范围：冻结树全文件、排除本文件；含测试）。
- 出向：`node:crypto.createHash`、`node:fs`、`node:http`/`node:https`（`:8-13`）、`electron` 的 `app/BrowserWindow/shell`（`:15`）、`@profer/shared` 的 `INSTALLER_IPC_CHANNELS`/`assertSafeUrlNoNul`/类型（`:17-23`）。

## 5. 数据 I/O、读写与副作用

- 输入：`InstallerSource`（含 downloadUrl/fallbackUrl/filename/sha256/sizeBytes）、去重 key、sender 窗口；输出 `{filePath, sha256}`。
- 磁盘写：`app.getPath('temp')/profer-installers/<filename>` 流式写入（`createWriteStream`）；失败/取消 `unlink` 半成品（`:88`）；`cleanInstallerDir` 删目录内文件。
- 网络：HTTP(S) GET，跟随 ≤5 次重定向（`:226`）；`assertSafeUrlNoNul` 防 NUL 注入。
- 副作用：`sender.webContents.send('installer:progress', payload)`（`:230-233`，窗口销毁则跳过）；console 日志。
- 并发：`activeDownloads` 按 key 注册；同 key 并发下载会**覆盖 cancel 注册**（`set` 直接覆盖，`:115`，旧下载无法再被取消——照实记录）。

## 6. 分支、失败、取消与恢复

- 取消语义：`cancelled` 标志 + `requestToAbort.destroy(Error('cancelled'))`；`finish` 时已取消→reject `'cancelled'`（`:190-192`）；`downloadInstaller` 捕获 `'cancelled'` **不降级**直接重抛（`:78-83`）。
- 失败降级：非取消失败→删半成品→试 fallback URL（`:84-89`）；sha256 不匹配→删文件 throw（`:64-69`）——注意 **sha256 失败也走 URL 循环的 catch，会继续尝试 fallback URL**（`:63-69` 在 try 内），照实记录。
- 重定向：>5 次 reject（`:147-152`）；重定向目标同样过 `assertSafeUrlNoNul`（`:129`）。
- 恢复：无断点续传；失败重下全量。进程重启后 `activeDownloads` 清空，遗留半成品文件不再被引用（`cleanInstallerDir` 有清理能力但 0 消费者）。
- 不可恢复点：`launchInstaller` 抛出后安装程序未启动，由渲染层提示（`EnvironmentCheckCard.tsx:182` 有 catch，域外）。

## 7. 权限与权威状态

- 无 sender/role 权限分支；IPC handler 不校验 renderer 身份（`ipc.ts:2612-2641`）。`launchInstaller` 的 `filePath` 由 renderer 传入、**无路径授权**（`ipc.ts:2636-2641` 直接 `shell.openPath`）——照实记录（§10）。
- 安全护栏：`assertSafeUrlNoNul`（URL NUL/控制字符，`:129`）；sha256 校验以清单 `source.sha256` 为权威（可为空跳过）。
- 权威状态：下载结果以磁盘文件 sha256 为准；进度事件为通知性。

## 8. 修改影响面

- IPC `installer:download/cancel/launch/progress`（`installer.ts:84-92`）+ preload `:2659-2665` + `EnvironmentCheckCard.tsx`（环境体检安装流）。
- `pi-builtin-tools.ts:1966-1973` Agent 工具链（Git for Windows 自动安装）。
- `InstallerSource`/`InstallerProgressPayload` 形状（`@profer/shared`）。
- `activeDownloads` key 约定 `${id}:${arch}`（IPC）与 `agent-git-for-windows-${sessionId}`（Agent）并存。
- 测试缺口：无专属测试（§9）。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树全文件 `grep installer-downloader|downloadInstaller|cancelInstallerDownload|launchInstaller|cleanInstallerDir`，无 `*.test.ts` 命中。
- 间接证据：无。
- 未覆盖：下载流/重定向/sha256/取消/降级/进度全链路无测试。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实网络下载；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出签名 | 已证实 | `:42-279` |
| 取消不降级、失败降级 fallback | 已证实 | `:78-89` |
| sha256 失败仍会试下一 URL | 已证实 | `:63-69` 在 try 内 |
| 重定向上限 5 + NUL 校验覆盖 Location | 已证实 | `:128-129`、`:226` |
| 清单无 sha256 跳过校验 | 已证实 | `:70-74` |
| 同 key 并发覆盖 cancel 注册 | 已证实 | `:115` |
| `cleanInstallerDir` 0 消费者 | 已证实 | 全冻结树检索（§4 范围） |
| `installer:launch` 无路径授权 | 已证实 | `ipc.ts:2636-2641` |
| 真实下载/进度/取消行为 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `downloadInstaller` 主流程 | §3/§6 | 42-93 | covered |
| `downloadToFile`（重定向/进度/错误线） | §3/§6 | 98-228 | covered |
| `cancelInstallerDownload` | §3/§6 | 245-252 | covered |
| `launchInstaller` | §3/§7 | 260-265 | covered |
| `cleanInstallerDir` | §3/§4 | 268-279 | covered |
| `computeSha256`/`emitProgress` | §3 | 230-240 | covered |
| 真实网络/平台行为 | §10 | — | unknown（NOT_RUN） |

---
path: apps/electron/src/main/lib/installer-manifest.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5c579066682e287f578b5ce6293efd4b9734dc01
sha256: 2d29082bfa03d14d944b6c73e90edad9cfcca466bd6abd7c4fe50c40f6153f88
lines: 157
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/installer-manifest.ts

## 1. 结论与边界

**Installer Manifest 客户端**（157 行）：从 `https://api.proma.cool/api/v1/installers/manifest` 拉取第三方安装包清单（5 分钟缓存），带内置 fallback（6 条官方上游 URL）；远程成功时按 `(id, platform, arch)` 键补齐本地平台缺失条目。

边界：只取/合并清单，不下载安装包（`installer-downloader.ts`）；不做签名校验（fallback 条目 sha256 为空）；fallback 不缓存（每次先试远程）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `fetchInstallerManifest` | 导出函数 | 103-145 | `(force = false): Promise<InstallerManifest>` | 拉取/合并/降级 |
| `findInstallerSource` | 导出函数 | 150-157 | `(manifest, id, arch: 'x64'\|'arm64', platform = process.platform): InstallerSource\|undefined` | 按 (id, platform, arch) 查条目 |
| `BUILTIN_FALLBACK` | 内部常量 | 27-98 | `InstallerManifest`（6 条） | 断网兜底 |
| `cache` | 内部变量 | 19 | `ManifestCache\|null` | `{data, timestamp}` |
| `ManifestCache` | 内部接口 | 14-17 | `{data, timestamp}` | |
| 常量 | 内部 | 10-12 | `PROMA_API_BASE='https://api.proma.cool'`、`MANIFEST_URL=<base>/api/v1/installers/manifest`、`CACHE_TTL_MS=5min` | |

BUILTIN_FALLBACK 条目（`:27-98`）：`git-for-windows` win32 x64/arm64 v2.47.1（GitHub releases URL）；`nodejs` win32 x64/arm64 v22.13.1（nodejs.org msi）；`nodejs` darwin arm64/x64 v22.13.1（nodejs.org pkg，**两个 darwin 条目 fallbackUrl 相同**，`:81`/`:93`）。全部 `downloadUrl:''`、`sha256:''`（下载器将跳过校验并 warn）。

导出计数：`export` 2 条（`:103`、`:150`），与源码一致。

## 3. 内部逻辑与关键流程

- **fetchInstallerManifest**（`:103-145`）：
  1. `!force && cache` 且 5 分钟内 → 返回 `cache.data`（`:104-106`）。
  2. `fetch(MANIFEST_URL, {headers:{Accept:'application/json', User-Agent:'Profer-Desktop-App'}})`（`:109-114`）；`!response.ok` → throw `HTTP <status>: <statusText>`（`:116-118`）；`data.installers` 非数组 → throw `Manifest format invalid`（`:121-123`）。
  3. **合并补齐**（`:127-133`）：remoteKeys = 远程条目的 `id:platform:arch` 集合；`mergedData.installers = 远程全部 + BUILTIN 中键不在 remoteKeys 的条目`——保证远程只覆盖 Windows 时 macOS 仍有可下载项（注释 `:125-126`）。
  4. 写 `cache = {data: mergedData, timestamp: now}`（`:134`）；日志报「远程 N 项，补齐 M 项」（`:135`）；返回 merged。
  5. catch → `console.warn` 降级、**返回 `BUILTIN_FALLBACK` 但不写缓存**（注释 `:142`：下次仍先试远程）（`:137-144`）。
- **findInstallerSource**（`:150-157`）：`manifest.installers.find(s => s.id === id && s.platform === platform && s.arch === arch)`；`platform` 缺省 `process.platform as InstallerSource['platform']`（`:154`）；无命中 `undefined`。

## 4. 调用者与调用链

- 入向（全冻结树 `grep installer-manifest|fetchInstallerManifest|findInstallerSource`，apps+packages 全文件类型）：
  - `apps/electron/src/main/ipc.ts:259` import；`installer:manifest` handler（`:2605-2610`）→ `fetchInstallerManifest()`；`installer:download`（`:2615-2616`）`fetchInstallerManifest()` + `findInstallerSource(manifest, req.id, req.arch, req.platform ?? process.platform)`，无源 throw `未找到安装包：id=…, arch=…`（`:2617-2619`）。
  - `apps/electron/src/main/lib/adapters/pi-builtin-tools.ts:85` import；`:1966-1967` `fetchInstallerManifest()` + `findInstallerSource(manifest, 'git-for-windows', arch)`（Agent 工具链）。
  - 渲染链路：`EnvironmentCheckPanel.tsx:43/63`（`window.electronAPI.fetchInstallerManifest()`）经 `preload/index.ts:693`、`:2656`。
- 出向：全局 `fetch`（`:109`）、`@profer/shared` 类型 `InstallerManifest`/`InstallerSource`（`:8`）。

## 5. 数据 I/O、读写与副作用

- 输入：`force` 标志；输出 `InstallerManifest`（条目数组）。
- 磁盘：无。网络：HTTPS GET `api.proma.cool`（只读、无鉴权 header）。
- 缓存：模块级 `cache`（5 分钟 TTL，仅远程成功合并结果入缓存；fallback 不缓存）。
- 副作用：console 日志；无其他。

## 6. 分支、失败、取消与恢复

- 失败（HTTP 非 2xx / JSON 形状错 / 网络错 / throw）→ 统一 catch → `BUILTIN_FALLBACK`（`:137-144`），**不抛错给调用方**。
- `force=true` 跳过缓存强制重拉（`:104`）。
- 取消：无（fetch 无 AbortSignal）。
- 恢复：fallback 不入缓存 → 下次调用自动再试远程；远程恢复即回到合并清单。
- 边界：缓存的合并结果在 TTL 内可能与远程不同步（5 分钟）；fallback 的 sha256 全空 → 下载器跳过校验（`installer-downloader.ts:70-74`）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查；IPC handler（`ipc.ts:2605-2610`）亦无。
- 权威状态：远程清单为权威（含 OSS 签名 URL）；`BUILTIN_FALLBACK` 为降级副本（官方上游、无 sha256）；合并规则以 `(id, platform, arch)` 为键、远程优先（`:127-133`）。

## 8. 修改影响面

- 消费方：IPC `installer:manifest`/`installer:download`（`installer.ts:84-86`）、`pi-builtin-tools.ts:1966-1967`、`EnvironmentCheckPanel.tsx`。
- `BUILTIN_FALLBACK` 版本（Git 2.47.1 / Node 22.13.1）硬编码，上游发新版需改本文件；URL 失效即断网时无法安装。
- `findInstallerSource` 的匹配键（id/platform/arch）是清单契约；新增平台/架构需同步 `InstallerSource` 类型。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树全文件 `grep installer-manifest|fetchInstallerManifest|findInstallerSource`，无 `*.test.ts` 命中。
- 间接证据：无。
- 未覆盖：远程成功合并、fallback 降级、TTL 缓存、`force`、`findInstallerSource` 匹配。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实网络；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出签名与合并规则 | 已证实 | `:103-157` |
| fallback 6 条目内容/空 sha256 | 已证实 | `:27-98` |
| fallback 不缓存、先试远程 | 已证实 | `:142-144` |
| 远程键缺失补齐本地平台 | 已证实 | `:127-133` |
| darwin 两条目共用同一 pkg URL | 已证实 | `:81`、`:93` |
| 失败统一降级不抛 | 已证实 | `:137-144` |
| 远程清单实际内容 | 未知 | NOT_RUN，无真实网络 |
| `api.proma.cool` 可用性 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `fetchInstallerManifest`（缓存/合并/降级） | §3/§6 | 103-145 | covered |
| `findInstallerSource` | §3 | 150-157 | covered |
| `BUILTIN_FALLBACK` 条目 | §2 | 27-98 | covered |
| `force` 分支 | §6 | 104 | covered |
| 真实远程行为 | §10 | — | unknown（NOT_RUN） |

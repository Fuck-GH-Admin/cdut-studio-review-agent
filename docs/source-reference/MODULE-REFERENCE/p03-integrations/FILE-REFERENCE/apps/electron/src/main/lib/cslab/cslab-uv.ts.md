---
path: apps/electron/src/main/lib/cslab/cslab-uv.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 128837fd17d2161f3ef3b09808cea61d2f4243e1
sha256: 859a4aa6f6f83ecf08c356fa634363fc9394706ec14de86e42752d73fddfb4ed
lines: 447
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-uv.ts

## 1. 结论与边界

**uv 静默自举**（运行时代码）——三条红线（`apps/electron/src/main/lib/cslab/cslab-uv.ts:1-9`）：①只下载官方 uv 单文件二进制，校验「官方指纹→内嵌固定哈希→镜像自证+用户确认」分级，哈希不符一律拒绝；②多源镜像+短超时+即时熔断，任何失败回退系统 Python 不阻断依赖安装；③临时文件落 `tools/uv/.tmp-download` 并 finally 清理。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `UvUntrustedInstallGuard` | 类型 | 51-55 | 非授信安装确认回调（未注入=拒绝） |
| `UvEnsureOptions` | 接口 | 57-62 | labId/fetchImpl/onProgress/confirmUntrustedInstall |
| `UvChecksumVerdict` | 类型 | 64 | `'official'\|'pinned'\|'mirror-consent'\|'reject'` |
| `classifyUvChecksum` | 纯函数 | 72-83 | 分级判定（官方权威不符即 reject 不可降级 `:78`；镜像仅判传输损坏 `:80-81`） |
| `UvTarget`/`UvProgress`/`UvEnsureOutcome` | 接口 | 93-109 | |
| `resolveUvTarget` | 函数 | 112-150 | 6 平台/架构→资产名（未知 null） |
| `parseUvChecksum` | 函数 | 153-156 | .sha256 文本首 64hex 小写化 |
| `getUvInstallDir`/`getUvBinaryName` | 函数 | 158-164 | 安装目录/二进制名（win32=uv.exe） |
| `ensureUv` | 函数 | 345-353 | **并发去重单飞**（`uvEnsureInFlight`，`:343`） |
| `ensureUvBinary`/`ensureUvForLab` | 异步 | 430-447 | 便捷/IPC 形态 |

内部：`UV_RELEASE_TAG='0.13.3'`+镜像 2 源（`:25-30`）、`UV_PINNED_SHA256` 内嵌 6 资产哈希表（`:36-43`，2026-10-20 核对注释）、`ASSET_TIMEOUT_MS=45s`/`CHECKSUM_TIMEOUT_MS=12s`/`TOTAL_DOWNLOAD_BUDGET_MS=60s`（`:45-48`）、`UvConsentDeniedError`（`:86-91`）、`buildSourceUrls`（CSLAB_UV_MIRROR 环境变量+官方+镜像去重，`:175-182`）、`fetchBuffer`（AbortController 硬超时，`:184-202`）、`extractZipArchive`（JSZip 找 uv 可执行，`:204-212`）、`extractTarArchive`（tar -xzf，`:227-243`）、`installFromSource`（`:270-337`）。

## 3. 内部逻辑与关键流程

`ensureUvInternal`（`:355-428`）：探测 PATH uv（`:360`）→平台不支持返 null（`:365`）→本地缓存命中（`:371`）→官方指纹整轮仅请求一次（`:376-380`）→遍历源（60s 总预算熔断 `:385`）→`installFromSource`：下载→SHA-256→`classifyUvChecksum`（reject 且无官方时退镜像自证 `:287-291`）→reject 抛错（`:293`）→mirror-consent 走用户确认（未注入/拒绝抛 `UvConsentDeniedError` 终止整轮 `:305-307`）→解压（zip/tar）→chmod 755（`:326`）→**冒烟 `--version` 失败即删目录抛错**（`:328-331`）→finally 清临时（`:333-336`）。审计：非 mirror-consent 由 `appendUvInstallAudit` 记 'auto'（`:399-407`，mirror-consent 由弹窗侧记避免重复 `:398`）；全链失败返 binary=null 熔断回退系统 Python（`:427`）。

## 4. 调用者与调用链

入向：CSLab python-runtime/依赖安装（非本批，经 index）。出向：`cslab-atomic`（writeBufferAtomic）、`cslab-uv-consent`、`../config-paths`、node 内置、JSZip。

## 5. 数据 I/O 与副作用

网络下载（官方+镜像）；写 `<configDir>/tools/uv/`（安装目录+临时）；execFile（tar/uv --version 探测）；审计追加写。

## 6. 分支、失败、取消与恢复

失败分类：HTTP 错误/哈希 reject/用户拒绝/解压失败/冒烟失败→各源失败 warn 继续下一源（`:422`）；UvConsentDeniedError 立即返 null（`:418-420`）；60s 总预算耗尽 break（`:385-387`）；最终全失败=熔断返 null（`:427`）。

## 7. 权限与权威状态

校验分级红线（`:4-6`）；官方指纹权威（`:68`）；内嵌哈希表=离线可信根（`:32-35`）；默认拒绝非官方。

## 8. 修改影响面

升级 uv 需同步 tag+哈希表+日期注释（`:24` 注释）；`CSLAB_UV_MIRROR` 环境变量契约。

## 9. 测试证据

`cslab-uv.test.ts`（8 用例：resolveUvTarget 2/parseUvChecksum 1/路径 2/classifyUvChecksum 4，另篇）；下载/解压/审计未单测；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 导出+分级红线+熔断链 | 已证实 | `:1-447` 逐行 |
| 内嵌哈希与上游一致性 | 推断 | `:34` 注释（2026-10-20 核对，未实网复核） |
| 运行行为 | 未知 | NOT_RUN（网络） |

## 11. 覆盖表

| 项 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部导出/流程/熔断 | §2/§3 | 51-447 | covered |
| 纯函数测试 | §9 | — | covered（8 用例锚点） |
| 运行验证 | §10 | — | unknown（NOT_RUN） |

---
path: apps/electron/src/main/lib/github-release-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bd41bb5592dbfb90031af252b91d14f9f363f453
sha256: d4953c94583ed4ea48ef4db0c8a0c88c687aa186522adbc63ebf5b2ed0cadbc3
lines: 198
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/github-release-service.ts

## 1. 结论与边界

**GitHub Release 客户端**（198 行）：从 `api.github.com/repos/Nya-Angle/CDUT-Studio` 拉取发布日志（最新/列表/按 tag），带 30 分钟缓存、tag 缓存、403/429 rate-limit 15 分钟冷却，失败可回退过期缓存。

边界：只读公开 API（无鉴权 token）；商业版构建在 `ipc.ts` 侧改走服务器 releases（见 §4），本文件不知晓构建目标；不下载资产、不解析安装包。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getLatestRelease` | 导出函数 | 81-90 | `(): Promise<GitHubRelease\|null>` | `/releases/latest`，失败→null |
| `listReleases` | 导出函数 | 98-160 | `(options?: GitHubReleaseListOptions): Promise<GitHubRelease[]>` | 列表（含缓存/降级） |
| `getReleaseByTag` | 导出函数 | 168-190 | `(tag: string): Promise<GitHubRelease\|null>` | `/releases/tags/<tag>` |
| `clearReleaseCache` | 导出函数 | 195-198 | `(): void` | 清列表缓存（**0 消费者**） |
| `fetchFromGitHub` | 内部函数 | 44-74 | `<T>(endpoint): Promise<T>` | fetch + rate-limit 门禁 |
| `ReleaseCache` | 内部接口 | 22-25 | `{data, timestamp}` | 列表缓存 |
| `releaseCache` | 内部变量 | 27 | `ReleaseCache\|null` | 模块级 |
| `tagCache` | 内部常量 | 30 | `Map<tag,{data,timestamp}>` | tag 缓存 |
| `CACHE_TTL` | 内部常量 | 33 | `30*60*1000` | 30 分钟 |
| `rateLimitUntil` | 内部变量 | 36 | `number`（0=无冷却） | 冷却截止时间戳 |
| `GITHUB_API_BASE`/`GITHUB_REPO` | 内部常量 | 13,16-19 | `https://api.github.com`；`{owner:'Nya-Angle', repo:'CDUT-Studio'}` | 目标仓库（注释称来自 electron-builder.yml） |

导出计数：`export` 4 条（`:81`、`:98`、`:168`、`:195`），与源码一致。

## 3. 内部逻辑与关键流程

- **fetchFromGitHub**（`:44-74`）：`Date.now() < rateLimitUntil` → 直接 throw `GitHub API 请求过于频繁，请稍后再试`（`:46-48`）；GET `<base>/repos/Nya-Angle/CDUT-Studio<endpoint>`，headers `Accept: application/vnd.github+json`、`User-Agent: Profer-Desktop-App`（`:54-59`）；403/429 → 设 `rateLimitUntil = now + 15min` 并 throw `请 15 分钟后重试`（`:61-65`）；其余 `!response.ok` → throw `GitHub API 请求失败 (<status>)...`（`:67-71`）；成功 `response.json()`（`:73`）。
- **getLatestRelease**（`:81-90`）：`fetchFromGitHub('/releases/latest')`；catch → `console.error` + 返回 **null**（不抛）。
- **listReleases**（`:98-160`）：
  1. 缓存命中条件：`releaseCache` 存在且 `now - timestamp < 30min` **且 `page === 1`**（`:109-113`）→ 过滤后 `slice(0, perPage)`；过滤规则：`includePrerelease` 为真给全部，否则剔除 `prerelease`/`draft`（`:115-118`）。
  2. 未命中：`/releases?per_page=<perPage>&page=<page>`（`:122-129`），过滤同上（`:134-136`）；**仅第一页写缓存**（缓存的是未过滤的 `releases`，`:138-144`）。
  3. catch：有缓存（即使过期）→ 过滤 + `slice(0, perPage)` 返回（`:150-156`）；无缓存 → rethrow（`Error` 包装非 Error 值，`:157-158`），让前端感知加载失败。
- **getReleaseByTag**（`:168-190`）：`tagCache` TTL 内命中直接返回（`:171-174`）；否则 `/releases/tags/<tag>` 并写缓存（`:176-181`）；catch → `console.error` + 有过期缓存返回缓存、否则 **null**（`:183-189`）。
- **clearReleaseCache**（`:195-198`）：`releaseCache = null` + 日志。**注意不清 `tagCache`、不重置 `rateLimitUntil`**。

## 4. 调用者与调用链

- 入向（全冻结树 `grep github-release-service|getLatestRelease|listReleases|getReleaseByTag|clearReleaseCache`，apps+packages 全文件类型）：
  - `apps/electron/src/main/ipc.ts:434-437` import `getLatestRelease`、`listReleases as listGitHubReleases`、`getReleaseByTag`；handler：
    - `github-release:get-latest`（`ipc.ts:5684-5697`）：`getBuildTarget() === 'commercial'` → `fetchServerReleases()` 取第一条（失败 log+null）；否则 `getLatestRelease()`。
    - `github-release:list`（`:5699-5715`）：商业版走服务器 `releases.slice(0, options?.perPage ?? 3)`（失败→`[]`）；否则 `listGitHubReleases(options)`。
    - `github-release:get-by-tag`（`:5717-5732`）：商业版在服务器列表里 `find(tag_name===tag)`；否则 `getReleaseByTag(tag)`。
    - 通道值：`github-release:get-latest`/`github-release:list`/`github-release:get-by-tag`（`packages/shared/src/types/github.ts:40-44`）。
  - 渲染链路：`preload/index.ts:1295-1297`（类型）、`:3512-3522`（invoke 桥接）。
  - **`clearReleaseCache` 全冻结树 0 消费者**（检索范围：冻结树全文件、排除本文件；含测试）。
- 出向：全局 `fetch`（`:54`）、`@profer/shared` 类型 `GitHubRelease`/`GitHubReleaseListOptions`（`:7-10`）。

## 5. 数据 I/O、读写与副作用

- 输入：endpoint/options/tag；输出：`GitHubRelease`/数组/null/[]。
- 磁盘：无。网络：HTTPS GET `api.github.com`（无鉴权、无 token、只读）。
- 缓存：`releaseCache`（仅 page=1）与 `tagCache`（按 tag），TTL 30 分钟（`:33`）；`rateLimitUntil` 进程级冷却。
- 副作用：console 日志（请求/命中/失败）；rate-limit 冷却为模块级全局状态。

## 6. 分支、失败、取消与恢复

- 失败矩阵：`getLatestRelease` → null；`getReleaseByTag` → 过期缓存或 null；`listReleases` → 过期缓存或 throw（三者不一致，照实记录，见 §10）。
- 冷却：403/429 触发 15 分钟全局冷却（`:61-65`）；冷却期内任何请求立即 throw（`:46-48`）；`clearReleaseCache` 不解除冷却。
- 取消：无（fetch 无 AbortSignal，超时不可控——照实记录）。
- 恢复：冷却自然过期后恢复；缓存为内存态，重启即清。
- 缓存细节：列表缓存存未过滤数据、过滤在返回时做（`:138-144` vs `:134-136`）；`includePrerelease` 变化可复用同一缓存。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查；IPC handler（`ipc.ts:5684-5732`）亦无 `assertSensitiveAgentIpcSender`（对比 team-memory 通道）——只读公开发布信息。
- 权威状态：Release 数据以 GitHub API 响应为权威；缓存是副本（30 分钟内可能过期）；商业版权威是服务器 `fetchServerReleases`（域外），本文件仅 OSS 构建路径生效。

## 8. 修改影响面

- IPC：`github-release:get-latest`/`list`/`get-by-tag`（`github.ts:40-44`），渲染端 preload `:3512-3522`；改返回形状影响版本历史 UI（域外组件）。
- `GITHUB_REPO` 常量（`:16-19`）指向 `Nya-Angle/CDUT-Studio`，与 `electron-builder.yml` 发布目标耦合（注释 `:15`）。
- 失败语义三接口不一致（null/null/throw），调用方需分别处理；统一化需同步 `ipc.ts:5684-5732`。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树全文件 `grep github-release-service|getLatestRelease|listReleases|getReleaseByTag|clearReleaseCache`，无 `*.test.ts` 命中。
- 间接证据：无。
- 未覆盖：缓存 TTL/过期降级、rate-limit 冷却、`includePrerelease` 过滤、page>1 无缓存行为均无测试。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实网络；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出签名 | 已证实 | `:81-198` |
| rate-limit 冷却 15min + 冷却期 throw | 已证实 | `:46-48`、`:61-65` |
| 三接口失败语义不一致（null/null/throw） | 已证实 | `:86-89`、`:150-158`、`:183-189` |
| 列表缓存仅 page=1、缓存未过滤数据 | 已证实 | `:109-113`、`:138-144` |
| `clearReleaseCache` 不清 tagCache/冷却 | 已证实 | `:195-198` |
| `clearReleaseCache` 全树 0 消费者 | 已证实 | 全冻结树检索（§4 范围） |
| 商业版走服务器 releases | 已证实 | `ipc.ts:5686-5695` 等 |
| GITHUB_REPO 与 electron-builder.yml 一致 | 推断 | 注释声明（`:15`），yml 未核 |
| 真实 API 行为/限流触发 | 未知 | NOT_RUN，无真实网络 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `fetchFromGitHub` | §3 | 44-74 | covered |
| `getLatestRelease` | §3/§6 | 81-90 | covered |
| `listReleases`（缓存/过滤/降级） | §3/§6 | 98-160 | covered |
| `getReleaseByTag` | §3/§6 | 168-190 | covered |
| `clearReleaseCache` | §3/§4 | 195-198 | covered |
| 缓存/冷却全局态 | §5/§6 | 27-36 | covered |
| 商业版分支 | §4/§7 | ipc.ts:5684-5732 | covered |
| 真实网络行为 | §10 | — | unknown（NOT_RUN） |

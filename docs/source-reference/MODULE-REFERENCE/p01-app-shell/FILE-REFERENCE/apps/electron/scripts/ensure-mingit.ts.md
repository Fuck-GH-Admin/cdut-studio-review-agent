---
path: apps/electron/scripts/ensure-mingit.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c81ff7af16488fb2097c141a72a084497efef6e6
sha256: 2e256f79a3c04d2b861e699e47b85cc720155abf5b8141cbee7a8198100dcded
lines: 67
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/ensure-mingit.ts

## 1. 结论与边界

MinGit 下载与配置脚本（67 行）：Windows 环境下载官方 MinGit v2.47.1（Git for Windows 精简版）并解压到 `apps/electron/resources/bin/git`，供纯净无 Git 的 Windows 设备开箱即用（`apps/electron/scripts/ensure-mingit.ts:4-12`）。边界：仅 win32；不校验签名/哈希；不接 npm script（见 §4 否定结论）；运行时消费方是 git 探测（`src/main/lib/git-detector.ts:88`）。

## 2. 导出与关键符号

无导出（CLI）。参数：无命令行参数。内部常量：`MINGIT_VERSION = '2.47.1'`（内部，`:11`）、`MINGIT_URL`（GitHub release zip，`:12`）、`targetDir`（`resources/bin/git`，`:14`）、`gitExe`（`<targetDir>/cmd/git.exe`，`:15`）。
- 内部函数 `ensureMinGit(): Promise<void>`（内部，`:17-63`）。
- 入口语义（`:65-67`）：`if (import.meta.main) ensureMinGit()`——仅直接执行时运行，可被安全 import。

## 3. 内部逻辑与关键流程

1. 平台短路（`:18-21`）：非 win32 → `console.log('[MinGit] 非 Windows 平台，跳过 MinGit 下载。')` return。
2. 就绪短路（`:23-26`）：`existsSync(gitExe)` → `console.log('[MinGit] 检测到内置 MinGit 已就绪: …')` return（幂等）。
3. 下载（`:28-42`）：`mkdirSync(targetDir, {recursive:true})`；`fetch(MINGIT_URL)`；`!res.ok` → `console.warn('[MinGit] 下载失败 (HTTP <status>): <statusText>')` return；`res.arrayBuffer()` → `Bun.write(zipPath, …)`（`<targetDir>/mingit.zip`）。
4. 解压（`:44-53`）：`Bun.spawnSync(['powershell','-NoProfile','-Command',`Expand-Archive -Path "<zip>" -DestinationPath "<targetDir>" -Force`])`；`exitCode !== 0` → `console.error('[MinGit] 解压失败:', stderr)` return；成功后 `rmSync(zipPath, {force:true})` 删 zip。
5. 结果确认（`:55-59`）：`gitExe` 存在 → `console.log('[MinGit] 内置 MinGit 配置成功: …')`；否则 `console.warn('[MinGit] 解压后未找到 cmd/git.exe')`。
6. 兜底（`:60-62`）：try 内任何异常 → `console.warn('[MinGit] 下载或解压过程中出错:', error)`，不抛。返回值：void。

## 4. 调用者与调用链

- 入向：无。全树 grep（工具：ripgrep，pattern `ensure-mingit|ensureMinGit`）命中仅本文件（`:17, 66`）；`apps/electron/package.json` 无对应 script（该 grep 无 package.json 命中）；`work/reports/2026-10-04-ui-functional-acceptance.md:57` 明确记录「总文档的 `bun run ensure:mingit` 没有对应 package script，未发现打包链自动准备该资源」——与静态检索结论一致。
- 产物消费（非调用）：`apps/electron/src/main/lib/git-detector.ts:88` 注释指向打包产物/源码开发的 `resources/bin/git/cmd/git.exe` 探测路径；`README.md:249,297` 宣称「Windows 客户端已内置开箱即用的 MinGit」。
- 出向：`node:fs`（existsSync/mkdirSync/rmSync）、`node:path`、全局 `fetch`（GitHub release）、`Bun.write`/`Bun.spawnSync`（Bun 专有 API，Node 不可运行）、`powershell Expand-Archive`。

## 5. 数据 I/O、读写与副作用

- 读：网络下载 zip（~50MB 级，运行时数据）。
- 写：`resources/bin/git/`（mkdir + 解压树）、`mingit.zip`（下载暂存，解压成功后删除）。
- 原子性：无 tmp+rename；下载/解压中断留半成品目录（下次运行 `gitExe` 不存在则全量重来；zip 残留会被覆盖）。幂等：`gitExe` 存在即跳过。
- 网络：是（github.com release）。缓存/全局状态/锁：无。
- 副作用：console 日志 ×多、PowerShell 子进程（解压）。

## 6. 分支、失败、取消与恢复

- 短路 ×2：非 Windows（`:18-21`）、已就绪（`:23-26`）。
- 失败分支（try 覆盖范围内 `:32-63` 全部 warn/error + return，不抛不改退出码）：HTTP 非 2xx（`:35-38`）、解压 exitCode 非 0（`:46-49`）、解压后缺 git.exe（`:58`）、任意异常（`:60-62`）；注意 `existsSync`（`:23`）/`mkdirSync`（`:29`）在 try 外，其异常会经 `:66` 未接住的 promise 拒绝致非 0 退出（推断）——"恒 exit 0"仅限 try 覆盖范围内。
- 用户可见文案：`[MinGit] …` 系列（非 Windows 跳过/已就绪/开始下载/下载完成/下载失败 (HTTP …)/解压失败/配置成功/解压后未找到 cmd/git.exe/下载或解压过程中出错）。
- 失败后状态：可能残留 mingit.zip 或半解压目录；恢复=重跑（gitExe 缺失会重新下载）。无取消处理（fetch 无 AbortController）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：MinGit 版本权威 = `MINGIT_VERSION`（`:11`）；「内置 Git 就绪」的判定权威 = `gitExe` 存在性（`:15`，与 git-detector.ts:88 的探测路径一致）。注意：下载不校验哈希/签名（无 checksum 代码），信任 GitHub release 通道。

## 8. 修改影响面

- Windows 无 Git 环境的快照引擎可用性（`README.md:249`「增量检查点引擎 (Git / 内置 MinGit / 500 文件安全熔断)」、`git-detector.ts:88`）。
- 资源目录 `resources/bin/git`（若接入打包链将进 extraResources，当前未接线）。
- 接线缺口（已证实）：无 package script、无 CI 步骤（grep 零命中）；改本文件不影响任何自动化流程。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无测试（全树 grep `ensure-mingit|ensureMinGit` 于 *.test.ts 零命中）。间接证据：`work/reports/2026-10-04-ui-functional-acceptance.md:57`（验收记录指出未接线问题，属文档自述）。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双短路、下载/解压/确认流程、try 覆盖范围内失败均不抛（`:23`/`:29` 在 try 外见 §6） | 已证实 | `apps/electron/scripts/ensure-mingit.ts:1-67` 全文 |
| 无任何调用点/无 package script 接线 | 已证实 | grep `ensure-mingit|ensureMinGit` 全树命中仅自身 + 验收报告记录 |
| Bun.write/Bun.spawnSync 依赖 Bun 运行时 | 已证实 | `:41, 45` API 名（静态） |
| 下载可用性与 MinGit 2.47.1 zip 结构 | 未知 | 需网络运行取证，NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| ensureMinGit 平台/就绪短路 | §3/§6 | 18-26 | covered |
| fetch 下载 + HTTP 失败 | §3/§5/§6 | 28-42 | covered |
| Expand-Archive 解压 + 失败 return | §3/§6 | 44-53 | covered |
| gitExe 确认分支 | §3/§6 | 55-59 | covered |
| 兜底 catch | §6 | 60-62 | covered |
| import.meta.main 入口 | §2 | 65-67 | covered |
| 接线缺口（无调用者） | §4/§8 | — | covered |

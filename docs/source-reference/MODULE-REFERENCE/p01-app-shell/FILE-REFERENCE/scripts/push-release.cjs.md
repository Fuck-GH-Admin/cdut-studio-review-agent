---
path: scripts/push-release.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a12e0ff16e9dd57a860e175686ac66027b59e61b
sha256: f269bdc3e267630e227cd4c8753ce8beb605477022a97b86643712a2b7086387
lines: 322
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# scripts/push-release.cjs

## 1. 结论与边界

**Windows 发布 CLI**（322 行 CJS，本地构建 + 双通道上传）：`node scripts/push-release.cjs <版本号> [--unsigned] [--artifacts-only]`（`scripts/push-release.cjs:4`、`:14-18`）。职责链 = 只读预检 → 验证门禁/构建 → 国内更新源上传（新/旧双写）→ 源码+tag 推送 → GitHub Release 唯一写入者 → 刷新商业版版本历史 `releases.json` → 提示补发 macOS 资产。关键权威约定（头注释 `scripts/push-release.cjs:6-7`）：**GitHub Release 只由本脚本写入**，`release.yml` 仅保留手动构建验证，避免本地上传与 tag 触发 CI 同时操作同一 Release。边界：macOS 资产不可由本脚本产出（`scripts/push-release.cjs:311-313` 明示须另行 `push-mac-release`）；不做 rebase（`scripts/verify-release-preflight.cjs:89` 佐证）。

## 2. 导出与关键符号

无导出（CLI）：位置参数 `<版本号>`（`scripts/push-release.cjs:14`）；开关 `--unsigned`（`:15`，跳过签名配置校验、资产不含 `latest.yml.sig`）、`--artifacts-only`（`:16`，只校验已有产物、不重新构建）。环境变量：`PROFER_UPDATE_SSH_HOST/USER/PORT`（`:27-29`，缺省 `45.114.127.232`/`root`/`41235`）、`PROFER_UPDATE_DIR`（`:31`，缺省 `/var/www/updates.profer.cn`）、`PROFER_UPDATE_SKIP_LEGACY`（`:36`，关旧机双写）、`PROFER_UPDATE_LEGACY_SSH_HOST/USER/PORT`、`PROFER_UPDATE_LEGACY_DIR`（`:38-41`，缺省 `47.109.108.57`/`ecs-user`/`22`/`/usr/share/nginx/html/profer-updates`）、签名凭据 `CSC_LINK`/`CSC_KEY_PASSWORD`（`:64`）、`PROFER_UPDATE_METADATA_PRIVATE_KEY` 或 `PROFER_UPDATE_METADATA_PRIVATE_KEY_FILE`（`:67`）。
内部函数（18 个，均「内部」）：`run`（`:47-49`）、`tryRun`（`:51-57`）、`sleep`（`:59-61`）、`assertReleaseSigningConfiguration`（`:63-70`）、`quote`（`:72-74`）、`transientGitHubError`（`:76-78`）、`retryGitHub`（`:80-98`）、`scp`（`:100-110`）、`ssh`（`:112-125`）、`remoteTagTarget`（`:127-133`）、`localTagTarget`（`:135-138`）、`pushSourceAndTag`（`:140-150`）、`sha256`（`:152-154`）、`readReleaseAssets`（`:156-160`）、`matchingAsset`（`:162-170`）、`hasExpectedAssets`（`:172-179`）、`waitForExpectedAssets`（`:181-189`）、`ensureGitHubRelease`（`:191-230`）。常量：`BASH='C:/Program Files/Git/usr/bin/bash.exe'`（`:44`）、`RELEASE_RETRY_DELAYS_MS=[0,15000,45000,90000]`（`:45`）、`GH_REPO='Nya-Angle/CDUT-Studio'`（`:26`）、`UPDATE_FEED_URL='https://updates.profer.cn/'`（`:30`）。

## 3. 内部逻辑与关键流程

按真实执行顺序（主 IIFE `scripts/push-release.cjs:232-318` + 前置声明）：

**A. 载入期**（`:14-20`）：读参数与开关；缺版本号 → `console.error` 用法 + `process.exit(1)`（`:17-20`）。

**B. 门禁助手**：
- `assertReleaseSigningConfiguration`（`:63-70`）：缺 `CSC_LINK`/`CSC_KEY_PASSWORD` → 抛（`:64-65`）；缺 `latest.yml` 签名私钥（两变量皆无）→ 抛（`:67-68`）。
- `transientGitHubError(output)`（`:76-78`）：正则匹配 429/500/502/503/504、no server available、timeout、temporary、econnreset、eof → 判为暂时性。
- `retryGitHub(label, action, isRecovered)`（`:80-98`）：4 次窗口（`:45`）；attempt>0 先 sleep 对应延迟再查 `isRecovered()`（`:83-87`）；action 成功即返回（`:90-91`）；失败记 `lastError`（`:92`）再查 `isRecovered()`（`:93`）；非暂时性或末次 → break（`:94`）；耗尽后抛 `${label} 失败: ${lastError.slice(-500)}`（`:97`）。
- `scp`（`:100-110`）：经 `BASH` spawn `scp -o StrictHostKeyChecking=no -P <port> -q`（`:103`），600s 超时 kill（`:104`），exit≠0 reject `scp <local> -> <remote> 失败 (exit N)`（`:107`）。
- `ssh`（`:112-125`）：默认 30s 超时（`:112`），收集 stdout/stderr，exit 0 resolve `stdout.trim()`，否则 reject `(stderr||stdout).trim() || 'ssh 失败 (exit N)'`（`:122`）。
- `pushSourceAndTag`（`:140-150`）：重查 head/本地 tag/远端 tag（`:142-144`），tag≠HEAD 抛「拒绝覆盖已有 tag」（`:145-146`）；`git push origin HEAD:main`（`:147`）；本地无 tag 则 `git tag`（`:148`）；远端无 tag 则 `git push origin <TAG>`（`:149`）——均短路跳过已存在者，幂等。
- 资产判定：`readReleaseAssets`（`:156-160`，失败返回 null）、`matchingAsset`（`:162-170`，name+size+state==='uploaded'+digest==='sha256:'+本地哈希四元全匹配）、`hasExpectedAssets`（`:172-179`，every）、`waitForExpectedAssets`（`:181-189`，4 窗口轮询，超时抛「未在重试窗口内全部进入 uploaded 状态」）。

**C. 主流程 [1/5]-[5/5]**：
1. `run('node scripts/verify-release-preflight.cjs <版本>')`（`:235`，注释 `:234`：必须先完成所有只读预检）。
2. `[1/5]` 验证门禁（`:237-248`）：非 unsigned 先 `assertReleaseSigningConfiguration()`（`:238`）；`--artifacts-only` → 校验已有产物 `verify:release-assets(:unsigned)` + `verify:packaged-pi-runtime`（`:239-241`）；否则 `bun run typecheck`（`:243`）、`bun test --isolate --timeout 30000`（`:244`）、删除 `out/win-unpacked`（`:245`）、`release:verify:windows(:unsigned)`（`:246`）。两模式均校验 latest.yml 哈希、CLI 与运行时闭包（注释 `:248`）。
3. 资产收集（`:250-258`）：unsigned 三件（`latest.yml`+exe+blockmap）/签名四件（多 `latest.yml.sig`，`:250-252`）；逐个 `fs.existsSync` 否则抛「缺少打包资产」（`:255`），记录 size 与 sha256（`:256-257`）。
4. HTTPS 断言：`UPDATE_FEED_URL` 非 https → 抛「更新源必须为 HTTPS，拒绝发布。」（`:260-262`）。
5. `[2/5]` 更新源上传（`:263-297`）：定位 installer/metadata/metadataSignature/blockmap（`:264-267`）；列表不完整（缺 blockmap，或签名模式缺 sig）→ 抛「发布资产列表不完整，拒绝上传。」（`:268-270`）；本地写 `out/latest.json`（version/installer/size/date，`:271-277`）；对每个目标 scp 五件到 `/tmp/`（`:280-284`），ssh（120s，`:293`）执行 `mkdir -p` + 逐件 `cp` + `ln -sf <installer> CDUT-Studio-latest.exe` + `chmod -R 755`（`:285-295`）。
6. `[3/5]` `pushSourceAndTag()`（`:299-300`）。
7. `[4/5]` `ensureGitHubRelease(assets)`（`:302-303`→`:191-230`）：不存在则以 `--draft` 创建（notes 优先 `release-notes/v<TAG>.md`，否则 `--generate-notes`，`:194-199`；already_exists/422 视作成功，`:200-202`）；逐资产匹配跳过或 `gh release upload --clobber`（`:206-214`）；`waitForExpectedAssets` 后，草稿 → `gh release edit --draft=false --latest`（`:218-224`），已发布 → 仅校正 `--latest` 与标题（`:225-229`）。
8. `[5/5]` `run('node scripts/build-releases-json.cjs --upload')`（`:309-310`）：刷新商业版「版本历史」数据源 `releases.json`（注释 `:305-308`：此前两台更新服务器长期 404）。
9. macOS 补发提示（`:311-317`）与完成打印（`:318`）。

## 4. 调用者与调用链

- 入向（grep 冻结树 `push-release`）：**无进程级调用者**——根 `package.json` scripts 与 `.github/workflows/` 8 个 workflow 均无点名（否定结论检索范围：全树 grep + workflow 目录逐文件 grep）；由维护者手工执行（用法注释 `scripts/push-release.cjs:4`）。文本引用：`scripts/package.cjs:8-12`（已废弃入口显式 exit(1) 并指引「请使用 node scripts/push-release.cjs <版本号>」）、`apps/electron/electron-builder.yml:214`（注释：Windows Release 仍只由本地 scripts/push-release.cjs 上传）、`scripts/build-releases-json.cjs:19,29`（env 约定与本脚本保持一致的注释）。
- 出向：`require('child_process')`/`crypto`/`fs`/`path`（`scripts/push-release.cjs:9-12`）；关键调用点——`node scripts/verify-release-preflight.cjs`（`:235`）、`bun run typecheck`/`bun test`（`:243-244`）、apps/electron 的 `release:verify:windows(:unsigned)`/`verify:release-assets(:unsigned)`/`verify:packaged-pi-runtime`（`:240-246`）、`git ls-remote/rev-list/rev-parse/push/tag`（`:128`、`:136`、`:142`、`:147-149`）、`gh release view/create/upload/edit`（`:157`、`:198`、`:212`、`:220`、`:227`）、`scp`/`ssh`（`:103`、`:114`）、`node scripts/build-releases-json.cjs --upload`（`:310`）、提示 `scripts/push-mac-release.cjs`（`:316`，打印不执行）。

## 5. 数据 I/O、读写与副作用

- 本地磁盘写：`out/latest.json`（`fs.writeFileSync`，`:271-277`）；删除 `out/win-unpacked`（`fs.rmSync`，`:245`）。本地读：四类打包资产（`:254-257`）、`release-notes/v<TAG>.md` 存在性（`:194-195`）。
- 网络/远端写（双通道）：
  - 更新源（主 `updates.profer.cn` + 旧机 `profer-updates/`，`:33-43`）：scp 五件到 `/tmp/`（`:280-284`）→ ssh `cp` 入目录 + `ln -sf` 稳定名 `CDUT-Studio-latest.exe` + `chmod -R 755`（`:285-295`）。`cp` 覆盖式替换非原子（部分复制窗口）；`ln -sf` 供稳定下载名。
  - GitHub Release：`gh release create --draft`（`:198`）→ `upload --clobber`（`:212`）→ `edit --draft=false --latest`（`:220`）；draft→publish 两阶段保证发布前资产齐全（准原子）。
  - git：`push origin HEAD:main` + 建/推 tag（`:147-149`）。
  - `releases.json` 上传经 `build-releases-json.cjs --upload`（`:310`）。
- 幂等：是（可重跑收敛）——tag 双重存在性检查（`:143-149`）、资产 SHA-256 全匹配跳过（`:207-209`）、`--clobber` 覆盖（`:212`）、`isRecovered` 恢复探测（`:203`、`:213`、`:221-224`、`:228`）。副作用不可逆项：main 分支推进、tag 创建、Release 发布（`--draft=false`）、远端文件替换。

## 6. 分支、失败、取消与恢复

- exit code：用法错误 `process.exit(1)`（`:17-20`）；主 IIFE `.catch` → `console.error('发布失败: ...')` + `process.exit(1)`（`:319-322`）；成功隐式 0。无其他 exit code 常量。
- 重试/恢复：GitHub 瞬时错误经 `retryGitHub` 4 窗口（0/15/45/90s，`:45`）+ `isRecovered` 幂等探测；耗尽抛 `${label} 失败: …`（`:97`）。`waitForExpectedAssets` 同窗口轮询资产 uploaded 状态（`:181-189`）。scp 600s 超时 kill（`:104`）、ssh 30s/120s 超时 kill（`:112`、`:293`），超时/非零即 reject 并终结流程。
- 失败后状态：分阶段残留——[2/5] 失败时远端已有部分新文件（无回滚）；[3/5] 失败时 main 已推进/部分 tag 已建；[4/5] 失败时 Release 停在 draft 或部分资产（重跑经匹配跳过收敛）。恢复：修复后重跑整脚本（幂等设计，§5）。
- 取消：无 SIGINT/信号处理；仅超时 `process.kill`（`:104`、`:117`）。

## 7. 权限与权威状态

- 权限读取点：Windows 代码签名凭据 `CSC_LINK`+`CSC_KEY_PASSWORD`（`scripts/push-release.cjs:64`）；`latest.yml` 元数据签名私钥 `PROFER_UPDATE_METADATA_PRIVATE_KEY[_FILE]`（`:67`）——两者是签名发布的硬前提（`:63-70`）；SSH `root`/`ecs-user` 登录（`:27-29`、`:38-40`，凭据由 ssh 客户端提供，`StrictHostKeyChecking=no`（`:103`、`:114`）——跨脚本差异：`push-mac-release.cjs:59-60` 用 `StrictHostKeyChecking=yes`，两脚本主机校验策略不对称（照实记录））；`gh` CLI 登录态（GH_TOKEN/GITHUB_TOKEN 来源未知，全文无凭据 env 读取）。
- 权威状态：GitHub Release 唯一写入者 = 本脚本（头注释 `scripts/push-release.cjs:6-7`）；tag 权威 = 「tag 必须指向 HEAD」（`:145-146`）；资产完整性权威 = 本地 sha256 与远端 `digest` 对账（`:162-179`）；预检豁免开关不在本脚本（无 `--allow-published-release` 传递，`:235`）。

## 8. 修改影响面

- 发布面：`Nya-Angle/CDUT-Studio` 的 main/tag/GitHub Release（`:26`、`:147-149`、`:198-229`）；两台更新服务器目录（`:31`、`:41`）；商业版「版本历史」`releases.json`（`:310`，消费方 `apps/electron/src/main/ipc.ts` 的 fetchServerReleases，注释 `:305`）。
- 联动脚本：`scripts/verify-release-preflight.cjs`（`:235`）、`scripts/build-releases-json.cjs`（`:310`）、`scripts/push-mac-release.cjs`（`:316` 提示）、apps/electron 的 `release:verify:windows(:unsigned)`/`verify:release-assets(:unsigned)`/`verify:packaged-pi-runtime`（`:240-246`）。
- 资产命名（`CDUT-Studio-Setup-<V>.exe(.blockmap)`、`latest.yml(.sig)`，`:250-252`）与 `scripts/release-asset-contract.cjs:1-11` 的 Windows 资产契约、`apps/electron/electron-builder.yml` 产物命名联动；改动会使 macOS 补资产契约失配。
- 文本契约：`scripts/package.cjs:10` 的指引文案与本脚本路径耦合。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。直接测试：无（grep `push-release` 命中 4 文件均为自身/注释/指引，无 `*.test.*` 命中；本文件 `it(`/`test(` 用例声明 0——字面 `.test(` 命中 2 处均为正则 `.test(output)`（`scripts/push-release.cjs:77`、`:200`），非测试用例）。间接证据：无测试断言覆盖本脚本逻辑；`scripts/package.cjs:10` 为指引文案（非测试）。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 阶段主流程、18 内部函数、重试窗口、双写目标 | 已证实 | `scripts/push-release.cjs:1-322` 全文 |
| GitHub Release 唯一写入者约定 | 已证实 | 头注释 `:6-7`、`apps/electron/electron-builder.yml:214` |
| 签名凭据硬前提与资产四元/三元清单 | 已证实 | `:63-70`、`:250-252` |
| 入向无进程调用者（手工执行） | 已证实 | 全树 grep + workflow 检索无命中 |
| 远端 `cp` 非原子 | 推断 | `:285-295` 为 scp+cp 覆盖式，无 rename 语义 |
| gh/ssh 凭据来源 | 未知 | 全文无凭据 env 读取 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| CLI 参数/开关/env 常量 | §2 | 14-45 | covered |
| `run`/`tryRun`/`sleep`/`quote`/`sha256`（内部） | §2/§5 | 47-61,72-74,152-154 | covered |
| `assertReleaseSigningConfiguration` | §2/§3/§7 | 63-70 | covered |
| `transientGitHubError`/`retryGitHub` | §3/§6 | 76-98 | covered |
| `scp`/`ssh` | §3/§5/§6 | 100-125 | covered |
| `remoteTagTarget`/`localTagTarget`/`pushSourceAndTag` | §3/§5 | 127-150 | covered |
| `readReleaseAssets`/`matchingAsset`/`hasExpectedAssets`/`waitForExpectedAssets` | §3 | 156-189 | covered |
| `ensureGitHubRelease`（创建/上传/发布/校正 4 态） | §3/§5 | 191-230 | covered |
| 主 IIFE [1/5]-[5/5] 与 macOS 提示 | §3 | 232-318 | covered |
| 失败/exit/重试/恢复 | §6 | 17-20,319-322 | covered |
| 调用链 | §4 | 235,310,316 | covered |
| 运行验证 | §10 | - | unknown（NOT_RUN） |

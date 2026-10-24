---
path: scripts/push-mac-release.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: df45368fe25a77ef9152e282cf3874d903133dfb
sha256: 9c42b2d26dfbb959dc3f1c4d887b5afec3a1fc667a593dcadfe255044a201b01
lines: 127
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# scripts/push-mac-release.cjs

## 1. 结论与边界

**macOS 发布 CLI**（127 行 CJS，Apple Silicon + 国内更新源 + GitHub Release）：为已完成的 Windows Release 补齐 macOS 资产（`latest-mac.yml`、arm64 zip/dmg、zip.blockmap），双写国内更新源（主/旧两台服务器）与 GitHub Release。硬门槛是「包可验证 + 顶层 designated requirement 钉死」——头注释 `scripts/push-mac-release.cjs:5-8` 字面写作 identifier "com.profer.app"，但该值为**过期注释声称**：按 05fb 源码 DR 由 `apps/electron/scripts/macos-signature.cjs` `expectedDesignatedRequirement(bundleId)` 生成通用式 `identifier "<bundleId>"`（:67-73），bundleId 从构建产物 Info.plist 的 CFBundleIdentifier 读取（:87-98）；`apps/electron/electron-builder.yml:4` `appId: com.cdutai.studio`（无 bundleId 覆盖）→ 当前构建预期 DR 为 identifier "com.cdutai.studio"【推断】。'com.profer.app' 全树仅存在于过期头注释与测试夹具字面量（`apps/electron/scripts/packaging-guards.test.ts:218/225/227`），不作权威事实（构建时由 afterSign 钩子保证，本脚本上传前再断言一次）；不要求 Developer ID/notarization，ad-hoc 签名即可满足 Squirrel.Mac，spctl 评估不作为门禁（`:10-12`）。必须在 darwin-arm64 运行（`:27-29`）。边界：只补资产、不创建/发布 Windows 版本（契约 `scripts/release-asset-contract.cjs:13-15`）；Windows 发布由 `scripts/push-release.cjs` 负责。

## 2. 导出与关键符号

无导出（CLI）：参数 `<版本号>`（`scripts/push-mac-release.cjs:24-25`，须匹配 `/^\d+\.\d+\.\d+$/`，`:26`）；无命令行开关。环境变量（全部可选、有缺省）：`PROFER_UPDATE_SSH_HOST/USER/PORT`（`:36-38`，缺省 `45.114.127.232`/`root`/`41235`）、`PROFER_MAC_UPDATE_DIR`（`:40`，缺省 `/var/www/updates.profer.cn`）、`PROFER_UPDATE_SKIP_LEGACY`（`:45`，设置后关闭旧机双写）、`PROFER_UPDATE_LEGACY_SSH_HOST/USER/PORT`、`PROFER_UPDATE_LEGACY_DIR`（`:47-50`，缺省 `47.109.108.57`/`ecs-user`/`22`/`/usr/share/nginx/html/profer-updates`）。
内部函数（均标「内部」）：`run`（`:55-57`）、`sha256`（`:58`）、`remote`（ssh 封装，`:59`）、`upload`（scp 封装，`:60`）、`assertExists`（`:61`）、`findMacAssets`（`:63-71`）、`assertSignedApp`（`:73-78`）、`readReleaseAssets`（`:80-82`）、`ensureGitHubAssets`（`:83-93`）；常量 `MAC_UPDATE_METADATA='latest-mac.yml'`（`:53`）、`UPDATE_TARGETS`（`:42-52`）、`GH_REPO='Nya-Angle/CDUT-Studio'`（`:35`）、`UPDATE_FEED_URL='https://updates.profer.cn/'`（`:39`）。

## 3. 内部逻辑与关键流程

按真实执行顺序（主 IIFE `scripts/push-mac-release.cjs:95-123`）：
1. 模块载入期校验（`:24-29`）：版本号必填（`:25`）、格式校验（`:26`）、`process.platform==='darwin' && process.arch==='arm64'`（`:27-28`），任一失败在进入主流程前抛出。
2. `run('node scripts/verify-release-preflight.cjs <版本> --allow-published-release')`（`:98`）：只读预检（回填豁免模式）。
3. `assertWindowsReleaseReady(readReleaseAssets(), VERSION)`（`:99`，第 1 次）：Windows Release 必须已完成。
4. 质量门禁：`bun run typecheck`（`:100`）、`bun test --isolate --timeout 30000`（`:101`）、`bun run dist:mac-release`（cwd=ELECTRON，`:102`）。
5. `findMacAssets()`（`:103`→`:63-71`）：对 `latest-mac.yml`/`CDUT-Studio-<V>-arm64.zip`/`.dmg`/`.zip.blockmap` 逐一 `assertExists`（`:69`，缺任一抛「缺少发布资产」），返回四元组；`.zip.blockmap` 是增量下载索引（注释 `:67`）。
6. `assertSignedApp()`（`:104`→`:73-78`）：`findMacAppBundle(OUT)` 为空抛「未找到 macOS 解包产物」（`:75`）；`assertMacSignatureContract(appPath)` 通过后打印 `DR=…（嵌套 App N 个）`（`:76-77`）。
7. 产物复核：`bun run verify:mac-package`（`:105`）、`bun run verify:mac-signature`（`:106`）、`node scripts/verify-macos-update-assets.cjs`（cwd=ELECTRON，`:107`）。
8. `assertWindowsReleaseReady(...)` 第 2 次（`:110`，注释 `:109`：构建耗时较久，任何远程写入前再确认）。
9. `[1/2]` 更新源上传（`:111-119`）：对 `UPDATE_TARGETS` 每个目标（`:113`）——`sudo` 前缀仅非 root（`:114`）；scp 四资产到 `/tmp/`（`:115`）；ssh 执行 `mkdir -p` + 逐个 `cp` 到 `target.dir` + `chmod -R 755`（`:116-117`）；打印回执（`:118`）。
10. `[2/2]` `ensureGitHubAssets([metadata,zip,dmg,blockmap])`（`:122`→`:83-93`）：先断言 Windows 契约（`:84`）；逐资产比对远端 `name/size/digest==='sha256:'+sha256(本地)`，全匹配则跳过（`:89`），否则 `gh release upload … --clobber`（`:90`）；最后 `gh release edit … --latest --title "CDUT Studio <TAG>"`（`:92`）。
11. 打印完成（`:123`）。返回值：主流程无返回；短路条件见 §6。

## 4. 调用者与调用链

- 入向（grep 冻结树 `push-mac-release`）：
  - `package.json:21` `"release:mac": "node scripts/push-mac-release.cjs"`（npm/bun script 入口）。
  - `scripts/push-release.cjs:314-317` 发布尾声打印提示「还需在一台 Apple Silicon 机器上补发 macOS 资产：node scripts/push-mac-release.cjs <版本>」（提示语引用，非进程调用）。
  - `apps/electron/scripts/packaging-guards.test.ts:165` `readFileSync(.../push-mac-release.cjs)` 静态文本断言（间接消费，见 §9）。
  - 文档提及：`work/reports/2026-10-03-collaborator-sync-review.md`（非调用）。
- 出向：`require('./release-asset-contract.cjs')`（`:20`）→ `assertWindowsReleaseReady`（`:84`、`:99`、`:110`）；`require('../apps/electron/scripts/macos-signature.cjs')`（`:22`）→ `PRODUCT_APP_NAME`/`findMacAppBundle`（`:74-75`）/`assertMacSignatureContract`（`:76`）；子进程：`verify-release-preflight.cjs`（`:98`）、`bun run typecheck`/`bun test`（`:100-101`）、`dist:mac-release`（`:102`）、`verify:mac-package`/`verify:mac-signature`（`:105-106`）、`verify-macos-update-assets.cjs`（`:107`）、`ssh`/`scp`（`:59-60`）、`gh release view/upload/edit`（`:81`、`:90`、`:92`）。
- 否定结论检索范围：冻结树全量 grep `push-mac-release`；`.github/workflows/` 8 个 workflow 无命中（macOS 发布为本地流程）。

## 5. 数据 I/O、读写与副作用

- 磁盘读：`OUT`（apps/electron/out）五类产物（`:63-71`、`:58` 计算 sha256）；`gh release view` JSON（`:81`）。磁盘写：无本地写（截图/报告不适用）。
- 网络/远端写：scp 四资产到远端 `/tmp/`（`:115`）→ ssh `cp` 进 `target.dir` 并 `chmod -R 755`（`:116-117`），主/旧两目标（`:42-52`，`PROFER_UPDATE_SKIP_LEGACY` 可关旧机）；GitHub Release `upload --clobber`（`:90`）与 `edit --latest`（`:92`）。
- 原子性：远端 `cp` 覆盖式替换，非临时名+rename，存在部分复制窗口（非原子）；先传 `/tmp` 再 `cp` 降低目录内半成品风险。
- 幂等：是（可重跑）——`ensureGitHubAssets` 跳过 size+digest 全匹配的已有资产（`:89`），`--clobber`（`:90`）覆盖不一致资产；远端 `mkdir -p`（`:117`）幂等，`cp` 重跑覆盖同名文件。
- 其他副作用：GitHub Release 被标为 `--latest` 且标题改写（`:92`）；两台更新服务器同名文件被替换。

## 6. 分支、失败、取消与恢复

- exit code：模块载入期 `throw`（`:25`、`:26`、`:28`）→ 未捕获异常退出 1；主 IIFE `.catch` 打印 `macOS 发布失败：${error.message}` 后 `process.exit(1)`（`:124-126`）；成功隐式退出 0。无其他 exit code 常量。
- 失败分支：缺版本/格式非法/非 darwin-arm64（`:25-28`）；preflight/契约/质量门禁任一子进程非零（`run` execSync 抛，`:55-57`）；缺发布资产（`:61`）、缺解包产物（`:75`）、签名契约不过（`:76` 抛自 macos-signature.cjs）；Windows Release 不满足契约（`:84`/`:99`/`:110`）；ssh/scp/gh 非零。
- 失败后状态：构建前失败无副作用；构建后失败时，已执行的上传步骤会在更新源/GitHub 留下部分新资产（无自动回滚）。
- 重试/恢复：无自动重试（与 `scripts/push-release.cjs` 的 `retryGitHub` 不同，本脚本未实现重试窗口）；恢复手段是修复后重跑——资产比对跳过（`:89`）+ `--clobber`（`:90`）使重跑收敛到目标状态。取消：不适用，依据：无信号/中断处理（`execSync` 同步串行）。

## 7. 权限与权威状态

- 权限读取点：ssh/scp 以 `root`/`ecs-user` 连接两台更新服务器（`:36-38`、`:47-49`），凭据由 ssh 客户端/agent 提供，脚本不读密码或密钥文件（`StrictHostKeyChecking=yes`，`:59-60`）；`gh release`（`:81`、`:90`、`:92`）依赖 gh CLI 登录态（GH_TOKEN/GITHUB_TOKEN 来源未知，脚本无 env 凭据引用）。无代码签名凭据读取——ad-hoc 签名（`scripts/push-mac-release.cjs:10-11`）。
- 权威状态：签名契约权威 = `apps/electron/scripts/macos-signature.cjs` 的 `assertMacSignatureContract`（DR 实为构建产物 CFBundleIdentifier 的通用式 `identifier "<bundleId>"`，当前 appId=com.cdutai.studio 下预期 identifier "com.cdutai.studio"【推断】；头注释与 `packaging-guards.test.ts:218-227` 夹具字面 'com.profer.app' 为过期值，详见 §1，与构建时 afterSign 钩子共用同一契约，注释 `:21`）；Windows Release 完整性权威 = `scripts/release-asset-contract.cjs`（其三元组门禁与 `release.yml:183-188` 四件套口径差见 release-asset-contract.cjs.md §7）；`--allow-published-release` 预检豁免由 `scripts/verify-release-preflight.cjs` 承载（`:98`）。

## 8. 修改影响面

- 远端更新链：`https://updates.profer.cn/`（`:39`）与旧机 `profer-updates/`（`:50`）两处自动更新源的 macOS 资产；缺 `latest-mac.yml` 时 macOS 自动更新直接失败（`scripts/push-release.cjs:311-313` 注释佐证历史事故 v0.15.84/0.15.85）。
- GitHub Release macOS 资产完整性与 `--latest` 标记（`:90-92`）。
- 测试依赖：`apps/electron/scripts/packaging-guards.test.ts:171-175` 对本文件文本做正则/包含断言（不跑 spctl、含 `assertMacSignatureContract(appPath)`、含 `require('../apps/electron/scripts/macos-signature.cjs')`、含 `zip.blockmap`）——改写这些字面量会使该测试失配。
- 具体路径：`scripts/release-asset-contract.cjs`、`apps/electron/scripts/macos-signature.cjs`、`apps/electron/out/*`、两台更新服务器目录、GitHub Release `v<版本>`。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。直接执行型测试：无（grep `push-mac-release` 无 `*.test.*` 执行本脚本的用例）。间接证据（标「间接」）：`apps/electron/scripts/packaging-guards.test.ts:162-180` 用例 `Given 发布脚本 When 校验 macOS 产物 Then 使用共享签名契约而非 spctl` 读取本文件源码断言——真实断言行：`:171` `expect(pushScript).not.toMatch(/run\(`spctl/)`、`:172` `expect(pushScript).toMatch(/assertMacSignatureContract\(appPath\)/)`、`:173` `toContain("require('../apps/electron/scripts/macos-signature.cjs')")`、`:175` `toContain('zip.blockmap')`。测试断言≠运行，本脚本未被执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 主流程 11 步、双写目标、资产四元组 | 已证实 | `scripts/push-mac-release.cjs:1-127` 全文 |
| Windows 契约 3 处断言与签名契约复用 | 已证实 | `:84,:99,:110`、`:22,:74-77` |
| 入向 3 个代码消费点 | 已证实 | `package.json:21`、`scripts/push-release.cjs:316`、`packaging-guards.test.ts:165` |
| 远端 cp 非原子、无自动重试 | 已证实 | `:115-117`、全文无重试循环 |
| gh/ssh 凭据来源 | 未知 | 全文无凭据 env 读取 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| CLI 参数/env 常量 | §2 | 24-53 | covered |
| `run`/`sha256`/`remote`/`upload`/`assertExists`（内部） | §2/§5 | 55-61 | covered |
| `findMacAssets` | §3 | 63-71 | covered |
| `assertSignedApp` | §3/§7 | 73-78 | covered |
| `readReleaseAssets` | §3 | 80-82 | covered |
| `ensureGitHubAssets` | §3/§5/§6 | 83-93 | covered |
| 主 IIFE 全步骤 | §3 | 95-123 | covered |
| 失败/exit 路径 | §6 | 25-28,124-127 | covered |
| 调用链 | §4 | - | covered |
| 运行验证 | §10 | - | unknown（NOT_RUN） |

---
path: scripts/build-releases-json.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4e4507b08dc3ab4474a4d84d2e1525417aaadaee
sha256: f027cb834cbe6ecebf52bd93bb05c70c8e58308b8a58b73e5a187683d267e97a
lines: 167
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# scripts/build-releases-json.cjs

## 1. 结论与边界

商业版版本历史数据源 `releases.json` 的生成/发布脚本（node CJS）：从 GitHub Releases（`gh` CLI）拉取同一事实来源，剔除草稿、保留预发布（带 prerelease 标记）、按发布时间倒序，写 `release-notes/releases.json` 并可选 SCP/SSH 上传到新/旧两台更新服务器+HTTPS 校验（文件头 `scripts/build-releases-json.cjs:1-23`）。背景：商业版从 `PROFER_UPDATE_FEED_URL`（默认 https://updates.profer.cn/）取 releases.json，此前无生成脚本致 404（`:5-8`）。

边界：不做构建/上传 APK 等（`push-release.cjs`/`push-mac-release.cjs`）；不改 GitHub Release；字段契约对齐 `packages/shared` 的 GitHubRelease（`:64-67`）。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（IIFE 入口脚本 `:141-167`）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BASH` | 常量（内部） | 31 | 显式 bash（Windows=Git Bash 路径），避免 shell 解释差异 |
| `TARGETS` | 常量（内部） | 43-62 | 新机（默认 45.114.127.232:41235）+旧机（47.109.108.57，SKIP_LEGACY 可跳过） |
| `toClientRelease` | 函数（内部） | 68-80 | 字段裁剪（id/tag_name/name/body/draft:false/prerelease/created_at/published_at/html_url） |
| `fetchReleases` | 函数（内部） | 82-109 | `gh release list`（剔草稿）→ 逐条 `gh release view` 取 body → 倒序 |
| `uploadTo` | 函数（内部） | 111-117 | scp 临时文件→ssh mkdir/cp/chmod 644/rm |
| `run` | 函数（内部） | 119-126 | spawnSync(BASH, -c) 非零退出抛错 |
| `verify` | 函数（内部） | 128-139 | 远端 stat 大小比对 + curl HTTPS 200 |

## 3. 内部逻辑与关键流程

IIFE（`:141-167`）：非 verify-only → `fetchReleases()` 空则抛错拒绝写空清单（`:145`）→ 写 OUT_FILE（默认 `release-notes/releases.json`，`--out` 可改，`:36`）；`--upload` 逐目标 `uploadTo`（verify-only 时跳过上传，`:155`）；`UPLOAD||VERIFY_ONLY` 才 `verify`（纯生成不因远端 404 报错，`:158-162`）；失败统一 `处理失败`+exit 1（`:164-166`）。

细节：`gh release list` 的 JSON 字段窄，body 逐条 view（`:83-89` 注释）；`--limit` 默认 100（`:38`）；上传命令走 `bash -c`+`StrictHostKeyChecking=yes`（`:114-115`）；root 用户免 sudo（`:112`）。

## 4. 调用者与调用链

入向：`package.json:22`（`release:releases-json` = `node scripts/build-releases-json.cjs --upload`）；`scripts/push-release.cjs:310`（发布链内 `--upload` 调用）。

出向：`node:child_process`（execSync gh/spawnSync bash）、`node:fs`/`node:path`（`:24-26`）；外部 `gh` CLI、ssh/scp/curl（经 BASH）。

## 5. 数据 I/O、读写与副作用

- 读：GitHub API（gh CLI，`:84-96`）；写：本地 releases.json（`:147`）+ 远端服务器文件（scp/ssh `:114-115`）。
- 副作用：公网 HTTPS 校验（curl `:136`）；日志 stdout/stderr。
- 并发/幂等：整文件覆盖写（服务器端 `cp` 覆盖）；上传失败抛错中断（无回滚，服务器状态=最后一次 cp 成功的文件，推断）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 结果 |
| --- | --- | --- | --- |
| 拒绝空清单 | 0 releases | 145 | 抛错 exit 1 |
| verify-only 需现文件 | OUT_FILE 缺失 | 149-151 | 抛错 |
| 跳过旧机 | PROFER_UPDATE_SKIP_LEGACY | 53-62 | TARGETS 仅新机 |
| 上传后校验 | UPLOAD/VERIFY_ONLY | 158-162 | 大小+200 双验 |
| 校验失败 | 远端大小不符/非 200 | 132-137 | 抛错 exit 1 |

无取消/恢复；重跑即覆盖（幂等）。

## 7. 权限与权威状态

- SSH 凭据=环境变量/默认 root@45.114.127.232:41235、ecs-user@47.109.108.57（`:46-58`，硬编码默认值照实记录——基础设施地址在源码中）；非 root 用户用 sudo（`:112`）。
- 版本事实权威=GitHub Releases（草稿剔除 `:88`）；本地文件=其投影。

## 8. 修改影响面

- `package.json:22`、`push-release.cjs:310`（发布链）。
- 产物 releases.json 的字段契约与 `packages/shared` GitHubRelease、商业版 `ipc.ts` `fetchServerReleases()`（`:7` 注释引用）耦合。
- 改 TARGETS 默认地址影响发布目标。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 `build-releases-json` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/脚本执行/gh/ssh/curl。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 全流程/双验 | 已证实 | `:1-167` 逐行读 |
| 拒绝空清单/草稿剔除 | 已证实 | `:88,145` |
| 两处调用 | 已证实 | `package.json:22`；`push-release.cjs:310` |
| 硬编码服务器默认地址 | 已证实 | `:46-58` |
| 上传无回滚 | 推断 | 顺序 cp 无事务 |
| ipc.ts fetchServerReleases 消费端 | 未知 | 非本批（仅注释引用） |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 内部符号 | §2 | 31-139 | covered |
| IIFE 主流程 | §3, §6 | 141-167 | covered |
| 权限/默认地址 | §7 | 46-58, 112 | covered |
| 调用链 | §4 | - | covered |
| 消费端/运行期 | §10 | - | unknown（非本批/NOT_RUN） |

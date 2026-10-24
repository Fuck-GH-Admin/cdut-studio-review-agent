---
path: apps/electron/scripts/sign-update-metadata.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 633ad75b375ae8fea069a1c35fe23d589b0fef23
sha256: d8f39f95dd035c438a00b249b5f7baa87dc39a14debf719c0a8d83afb74c83ea
lines: 29
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/sign-update-metadata.cjs

## 1. 结论与边界

发布环境脚本（Node，顶层立即执行）：用受控环境注入的 RSA 私钥为 `apps/electron/out/latest.yml` 生成 detached signature（RSA-SHA256、base64）写入 `latest.yml.sig`。私钥只经环境变量/密钥文件注入，绝不写入仓库或安装包（`apps/electron/scripts/sign-update-metadata.cjs:3-5`）。

边界：不构建产物、不上传发布（上传在 `scripts/push-release.cjs`）、不验签（验证在 `apps/electron/scripts/verify-update-metadata.cjs`）、不生成 latest.yml（electron-builder 产出）。

## 2. 导出与关键符号

无导出（顶层脚本）。关键符号：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `appRoot` | 内部常量 | 10 | `path.resolve(__dirname,'..')` | `apps/electron` |
| `metadataPath` | 内部常量 | 11 | `appRoot/out/latest.yml` | 签名输入 |
| `signaturePath` | 内部常量 | 12 | `${metadataPath}.sig` | 签名输出 |
| `readSecret` | 内部函数 | 14-20 | `(envName, fileEnvName) => string` | 读密钥：文件优先、其次环境变量值，缺则 throw |
| 顶层动作 | 顶层语句 | 22-29 | — | 校验→签名→写 .sig→日志 |

## 3. 内部逻辑与关键流程

按顶层执行顺序（`apps/electron/scripts/sign-update-metadata.cjs:22-29`）：

1. `:22` `out/latest.yml` 不存在 → throw `缺少更新元数据`。
2. `:23` `readSecret('PROFER_UPDATE_METADATA_PRIVATE_KEY','PROFER_UPDATE_METADATA_PRIVATE_KEY_FILE')`：`*_FILE` 环境变量给路径时 `fs.readFileSync(path.resolve(filePath))`（`:15-16`）；否则取环境变量值（`:17-18`）；两者皆空 throw `拒绝生成未签名更新元数据`（`:19`）。
3. `:24-27` `crypto.createSign('RSA-SHA256')` → `update(最新 latest.yml 字节)` → `sign(privateKey,'base64')`。
4. `:28` 写 `latest.yml.sig`：内容为 base64 签名 + `\n`，`mode:0o600`（覆盖式写）。
5. `:29` stdout 日志 `[sign:update-metadata] 已生成 latest.yml.sig`。

## 4. 调用者与调用链

入向（grep 全冻结树 `sign-update-metadata`/`sign:update-metadata`）：

- `apps/electron/package.json:36` `"sign:update-metadata": "node scripts/sign-update-metadata.cjs"`。
- `apps/electron/package.json:39` `release:verify:windows` 链中 `bun run sign:update-metadata`（构建后、verify:release-assets 前）。
- CI `.github/workflows/release.yml:163-169`（step `Sign update metadata`，`working-directory: apps/electron`，env `PROFER_UPDATE_METADATA_PRIVATE_KEY: ${{ secrets.… }}`，run `bun run sign:update-metadata`）。
- 前置门禁：`scripts/push-release.cjs:63-70`（`assertReleaseSigningConfiguration` 要求 `PROFER_UPDATE_METADATA_PRIVATE_KEY` 或 `_FILE` 存在，`:67-69`；但不直接调用本脚本）。

出向：`node:fs`/`node:path`/`node:crypto`；读 `out/latest.yml`，写 `out/latest.yml.sig`。

产出物消费者（`latest.yml.sig`）：`apps/electron/scripts/verify-update-metadata.cjs:10-34`（`:23-24` 读 .sig、`:29-31` `verifier.verify` 失败 throw `latest.yml detached RSA 签名验证失败`）；`apps/electron/scripts/verify-release-assets.cjs:21-24`（signed 发布资产清单要求 `latest.yml.sig` 存在）；`scripts/push-release.cjs:251-252`、`:265-266`、`:280-281`（上传 scp `latest.yml(.sig)`）。

## 5. 数据 I/O、读写与副作用

- 读：`out/latest.yml`（`:25`）、密钥文件（`:16`）、环境变量（`:15`、`:17`）。
- 写：`out/latest.yml.sig`（`:28`，base64 文本、尾换行、权限 0600，覆盖写）。
- 副作用：stdout 一行日志（`:29`）；无网络、无遥测；不修改 latest.yml 本体。

## 6. 分支、失败、取消与恢复

- 缺 latest.yml → throw（`:22`）。
- 缺密钥（两个变量都空）→ throw `缺少 … 拒绝生成未签名更新元数据`（`:19`）。
- `*_FILE` 指向不存在的文件 → `fs.readFileSync` 同步抛（未捕获，进程非零退出；推断自 `:16` 无 try/catch）。
- 私钥非法/不匹配 → `signer.sign` 抛（未捕获；推断）。
- 无取消/重试/恢复逻辑；失败即中止，磁盘状态：`.sig` 未生成或保持旧值（覆盖式写发生在最后一步 `:28`，失败不会产生半截文件——推断自顺序）。重入幂等：同 key 同输入产出相同签名（RSA-SHA256 确定性，推断）。

## 7. 权限与权威状态

权威：发布密钥只存在受控发布环境（CI secrets `release.yml:168`、本地环境变量 `scripts/push-release.cjs:67-69`），本文件不落盘密钥（`:3-5` 注释约定）。无权限分支，依据：本文件无 sender/role 检查；对运行者无身份校验，靠环境注入控制（能读到私钥者即可签名）。`.sig` 的真实性权威=持有对应公钥的验证端（`verify-update-metadata.cjs:29-31`）。

## 8. 修改影响面

- 签名算法/输出格式变更会破坏 `apps/electron/scripts/verify-update-metadata.cjs`（验证端固定 `RSA-SHA256`+base64）、`apps/electron/scripts/verify-release-assets.cjs:21-24`（资产清单）、`scripts/push-release.cjs:251-281`（上传/校验链）及更新客户端验签（推断，客户端代码未读）。
- 路径约定（`out/latest.yml`）与 electron-builder 输出目录联动，改路径需同步验证端三处。
- 环境变量名变更需同步 `.github/workflows/release.yml:168` 与 `scripts/push-release.cjs:67-69`。

## 9. 测试证据

直接测试：无。否定检索：全冻结树 `*.test.*` 文件 grep `sign-update-metadata|latest.yml.sig|createSign`，0 命中（`packaging-guards.test.ts`/`package-closure.test.ts`/`settings-macos-contract.test.ts` 均不覆盖本脚本）。间接证据：`apps/electron/scripts/verify-update-metadata.cjs` 是产出物的验证端（非测试）。`NOT_RUN`：本轮未执行任何测试/脚本（node/bun/CI 均未运行），断言为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| RSA-SHA256 detached 签名写 `latest.yml.sig`（0600） | 已证实 | `apps/electron/scripts/sign-update-metadata.cjs:24-28` |
| 密钥注入顺序：`*_FILE` > env > throw | 已证实 | `:14-20` |
| 调用链：package.json:36/39、release.yml:163-169 | 已证实 | `apps/electron/package.json:36`、`:39`、`.github/workflows/release.yml:163-169` |
| 验证端存在并消费 .sig | 已证实 | `apps/electron/scripts/verify-update-metadata.cjs:23-31` |
| readFileSync/sign 失败未捕获→非零退出 | 推断 | `:16`、`:27` 无 try/catch |
| 同 key 同输入签名确定性（重入幂等） | 推断 | RSA-PKCS#1v1.5 语义，未实测 |
| 更新客户端如何消费 .sig | 未知 | electron-updater 端代码未读 |
| 私钥在 CI 中的存储安全性 | 未知 | GitHub secrets 配置不在冻结树 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `readSecret`（文件支） | §3/§6 | 15-16 | covered |
| `readSecret`（env 支） | §3 | 17-18 | covered |
| `readSecret`（缺密钥 throw） | §3/§6 | 19 | covered |
| 缺 latest.yml throw | §3/§6 | 22 | covered |
| 签名与写 .sig | §3/§5 | 24-28 | covered |
| 调用者/消费者链 | §4 | package.json:36 等 | covered |
| 失败恢复/幂等 | §6 | — | covered（推断已标注） |

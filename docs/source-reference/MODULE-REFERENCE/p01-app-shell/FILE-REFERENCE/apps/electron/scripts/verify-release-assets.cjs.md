---
path: apps/electron/scripts/verify-release-assets.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 66aece2024514be3d963419422d2410dc9fda57c
sha256: 8b37486da87b66a0cf122c184e6ce157ebae8e88d74f1ef98fbad32426b3d92c
lines: 99
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/verify-release-assets.cjs

## 1. 结论与边界

**Windows 发布资产完整性校验**（99 行，头注释 `:2-8`）：只查本地 out/、不联网不写，本地发布与 CI 共用。Windows 发布须满足 latest.yml 的 SHA-512/版本/大小与 EXE 一致+随包 CLI 与运行时闭包完整；当前策略不使用代码签名（但脚本保留 Authenticode 路径）。

## 2. 导出与关键符号

无导出（CLI）。`PROFER_UNSIGNED_RELEASE=1` 切未签名模式（跳过 sig/验签，`:20-24`）；资产集：latest.yml[+latest.yml.sig]+`CDUT-Studio-Setup-<version>.exe`+blockmap。内部 `parseLatestYml`（`:38`）/`verifyAuthenticode`（`:76`，PowerShell Get-AuthenticodeSignature）。

## 3. 内部逻辑与关键流程

（`:26-99`）：四件存在+非空→`verifyPackagedWindowsCli`（win-unpacked/resources/bin，`:33-35`）→latest.yml 解析（version/url/sha512/size 四元组，url 须=installerName `:48-50`）→sha512 base64 合法+size/hash 对账（`:55-66`）→签名模式：`verify-update-metadata.cjs` 链（`:70-74`）+Authenticode 验签 installer 与 unpacked 主程序（**必须在 win32 执行**，`:77-79`）；未签名模式：unpacked 主程序存在即过（`:96-98`）。

## 4. 调用者与调用链

- 入向：Windows 发布流程；`verify-release-assets-unsigned.cjs`（本批包装器）。
- 出向：packaged-cli-contract.cjs（域外）、verify-update-metadata.cjs（本批）、powershell.exe。

## 5. 数据 I/O、读写与副作用

只读 out/；签名模式起 PowerShell 验签。

## 6. 分支、失败、取消与恢复

任一断言失败→throw；双模式分支（§3）；无回滚。

## 7. 权限与权威状态

发布完整性权威=latest.yml 对账+（签名模式）Authenticode+RSA detached。

## 8. 修改影响面

Windows 发布门禁全链（含未签名变体）。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双模式/四元组对账/Authenticode 链 | 已证实 | `:1-99` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体+2 内部 | §2/§3 | 15-99 | covered |

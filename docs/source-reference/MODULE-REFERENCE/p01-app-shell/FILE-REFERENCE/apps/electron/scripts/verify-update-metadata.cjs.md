---
path: apps/electron/scripts/verify-update-metadata.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3e9234356026662a00aa11ee87d84e40bde5f54f
sha256: 4cc0a4e0b12fdb630b700d9c1664af9008ebedd81730aefb7c658ebf02d4263f
lines: 36
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/verify-update-metadata.cjs

## 1. 结论与边界

**latest.yml detached RSA-SHA256 签名校验**（36 行，头注释 `:1-5`）：公钥是发布客户端公开材料，私钥只存受控发布环境。只读检查。

## 2. 导出与关键符号

无导出（CLI 脚本）。公钥三级来源（`:16-20`）：`PROFER_UPDATE_METADATA_PUBLIC_KEY` env → `PROFER_UPDATE_METADATA_PUBLIC_KEY_FILE`/默认 `resources/update-metadata-public.pem` → 由 `PROFER_UPDATE_METADATA_PRIVATE_KEY` 推导公钥（spki 导出）。

## 3. 内部逻辑与关键流程

（`:22-36`）：metadata+`.sig` 存在检查（`:22-24`）→公钥缺失报错（`:25-27`）→`createVerify('RSA-SHA256')` 对 latest.yml 验 base64 签名（`:29-35`）→成功打印。

## 4. 调用者与调用链

- 入向：`verify-release-assets.cjs`（签名路径调用，本批 `:70-74`）；发布流程。
- 出向：node crypto/fs。

## 5. 数据 I/O、读写与副作用

只读 out/ 与资源目录；无写。

## 6. 分支、失败、取消与恢复

材料缺失/公钥缺失/验签失败→throw；无回滚。

## 7. 权限与权威状态

更新元数据完整性权威=detached RSA 签名；私钥隔离声明（`:4`）。

## 8. 修改影响面

发布门禁（latest.yml 篡改检测）；electron-updater 客户端验签契约。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 公钥三级来源/验签流程 | 已证实 | `:1-36` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 11-36 | covered |

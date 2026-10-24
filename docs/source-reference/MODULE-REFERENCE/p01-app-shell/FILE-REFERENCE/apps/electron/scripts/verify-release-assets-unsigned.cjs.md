---
path: apps/electron/scripts/verify-release-assets-unsigned.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5fa1fdcd35f2ad07468c947fa0e31edc82ba24bd
sha256: f31bf971553300802f9a6fa861c6641f8a10b1fc661d5b2ff449b8092d9558f6
lines: 17
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/verify-release-assets-unsigned.cjs

## 1. 结论与边界

**未签名 Windows 发布资产验证包装器**（17 行，头注释 `:2-5`）：保留版本/大小/SHA-512/CLI/unpacked 完整性校验，**跳过签名门禁**。

## 2. 导出与关键符号

无导出（CLI 包装器）：`spawnSync(process.execPath, [verify-release-assets.cjs], {env: {...process.env, PROFER_UNSIGNED_RELEASE:'1'}})`（`:10-14`）。

## 3. 内部逻辑与关键流程

转发退出码（`result.status ?? 1`，`:17`）；spawn error 抛（`:16`）。

## 4. 调用者与调用链

- 入向：未签名发布流程（npm script，域外）。
- 出向：`verify-release-assets.cjs`（本批）。

## 5. 数据 I/O、读写与副作用

经子进程继承 stdio；无直接 I/O。

## 6. 分支、失败、取消与恢复

spawn error 抛；退出码透传。

## 7. 权限与权威状态

未签名策略开关=`PROFER_UNSIGNED_RELEASE=1`（与主脚本约定）。

## 8. 修改影响面

未签名发布路径的门禁面（等同主脚本 minus 签名检查）。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| env 转发/退出码透传 | 已证实 | `:1-17` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 6-17 | covered |

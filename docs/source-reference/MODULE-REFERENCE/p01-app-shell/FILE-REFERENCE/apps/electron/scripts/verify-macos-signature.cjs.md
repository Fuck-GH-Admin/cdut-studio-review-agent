---
path: apps/electron/scripts/verify-macos-signature.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cc80f1151c3a4b3f865ceaf1181cf1d57f8d3e9a
sha256: adfe3dc4116415a75d58a3ab8fa85937a71cb4a55dac8216b1bec18708ce4ad9
lines: 29
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/verify-macos-signature.cjs

## 1. 结论与边界

**macOS 签名契约验证**（29 行，头注释 `:2-10`）：ad-hoc+钉死 designated requirement——**Squirrel.Mac 自更新能否安装的唯一硬门槛**（包完整有效+跨版本稳定 DR `identifier "<bundleId>"`）。**不校验 notarization/Gatekeeper**（ad-hoc 必然 rejected 且安装不依赖 spctl）。

## 2. 导出与关键符号

无导出（CLI）；用 `./macos-signature.cjs`（域外）的 `PRODUCT_APP_NAME`/`findMacAppBundle`/`assertMacSignatureContract`。

## 3. 内部逻辑与关键流程

（`:17-29`）：仅 darwin（`:17-19`）→outputDir 由 `PROFER_ELECTRON_OUTPUT_DIR` 或 `out/`（`:22-24`）→findMacAppBundle（缺→throw）→`assertMacSignatureContract(appBundle)` 结果 JSON 输出。

## 4. 调用者与调用链

- 入向：macOS 发布流程（dist:mac 后置校验，域外）。
- 出向：`./macos-signature.cjs`（域外实现）。

## 5. 数据 I/O、读写与副作用

只读产物（codesign 验证经域外模块）；无写。

## 6. 分支、失败、取消与恢复

平台限制/产物缺失/契约失败→throw；无回滚。

## 7. 权限与权威状态

自更新安装权威=签名契约（DR 钉死声明 `:4-6`）；spctl 明确不在范围（`:8-9`）。

## 8. 修改影响面

macOS 发布门禁；Squirrel.Mac 更新可用性。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本；darwin-only）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一硬门槛语义/平台限制/DR 范围声明 | 已证实 | `:1-29` 全文 |
| assertMacSignatureContract 实现 | 边界 | 域外模块 |
| 运行验证 | 未知 | NOT_RUN（无 darwin） |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 14-29 | covered |

---
path: apps/electron/scripts/verify-macos-package.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 67f13f4801d0757d4c2979901dfd73b88aae9a5b
sha256: 950eedbe3bde03fc942fc7ed3494eda250c51396764c0e41d2974e3f1ded2571
lines: 71
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/verify-macos-package.cjs

## 1. 结论与边界

**macOS 解包产物运行时闭包验证**（71 行，头注释 `:2-7`）：仅 darwin-arm64（`:14-16`）；dist:mac 在 electron-builder 成功后调用；**不替代真实 UI/Agent 冒烟、不做签名/notarization 断言**（P1 明确无签名）。

## 2. 导出与关键符号

无导出（CLI）。依赖域外模块 `packaged-pi-probe.cjs`（findUnpackedNativeFiles）与 `macos-signature.cjs`（PRODUCT_APP_NAME/findMacAppBundle）。内部 `assertExists`（`:22`）。

## 3. 内部逻辑与关键流程

（`:26-71`）：找 .app 产物→`PlistBuddy` 取 CFBundleExecutable（缺→throw `:34-37`）→四存在断言（主程序/app.asar/unpacked node_modules/随包 CLI `bin/profer`，`:40-43`）→可执行位检查（`:45-51`）→native/WASM 文件存在（`findUnpackedNativeFiles` 非空，`:53-54`）→`file -b` 断言 arm64（`:55-56`）→**用包自身 ABI 跑 packaged-pi-probe**（ELECTRON_RUN_AS_NODE=1、120s 超时，`:58-63` 注释：不依赖已移除的 Claude SDK CLI）。

## 4. 调用者与调用链

- 入向：dist:mac（npm script，域外）。
- 出向：packaged-pi-probe.cjs/macos-signature.cjs（域外）、PlistBuddy/file（系统工具）。

## 5. 数据 I/O、读写与副作用

只读产物+起子进程探针；无写。

## 6. 分支、失败、取消与恢复

平台限制/产物缺失/权限/架构/闭包失败→throw；无回滚。

## 7. 权限与权威状态

闭包完整性权威=包自身 ABI 探针（`:58-59`）；签名明确不在范围（`:6`）。

## 8. 修改影响面

macOS 发布门禁；Pi 运行时闭包（asar.unpacked native/WASM）完整性。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本；darwin-arm64-only）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 七段断言链/包自身 ABI 探针 | 已证实 | `:1-71` 全文 |
| 域外探针实现 | 边界 | 未深读 |
| 运行验证 | 未知 | NOT_RUN（无 darwin-arm64） |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 18-71 | covered |

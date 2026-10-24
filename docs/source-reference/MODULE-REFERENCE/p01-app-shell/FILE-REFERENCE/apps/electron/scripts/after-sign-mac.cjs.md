---
path: apps/electron/scripts/after-sign-mac.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3b9d9a39292d5e322424ab802d742aca0ad6b1fd
sha256: 303ec8ffb30c73b10817e02044a972fe92fe381aa185fb2a7323fa9818476f5d
lines: 57
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/after-sign-mac.cjs

## 1. 结论与边界

electron-builder `afterSign` 钩子（57 行，CJS）：macOS 无签名身份时 electron-builder 完全跳过签名，产物过不了 `codesign --verify`，Squirrel.Mac 会静默拒绝自更新；本钩子在签名后、DMG/ZIP 归档前补做 ad-hoc 签名并钉死 designated requirement（`apps/electron/scripts/after-sign-mac.cjs:1-11`）。硬约束：已有真实 Developer ID 签名（TeamIdentifier 存在且 ≠ `not set`）时绝不覆盖，只做契约断言后返回（`apps/electron/scripts/after-sign-mac.cjs:41-48`）。仅处理 `darwin`；具体签名算法/DR 语义在 `macos-signature.cjs`（域外，本文件只编排）。

## 2. 导出与关键符号

- 导出：函数 1（`module.exports = async function afterSign(context)`，`apps/electron/scripts/after-pack.cjs` 同型钩子；本文件 `apps/electron/scripts/after-sign-mac.cjs:30`）；类型 0；常量 0。
- 内部函数 `resolveAppBundlePath(context)`（内部，`apps/electron/scripts/after-sign-mac.cjs:21-28`）：候选 = `${productFilename}.app` 与 `PRODUCT_APP_NAME`（`'CDUT Studio.app'`，`apps/electron/scripts/macos-signature.cjs:44`），`resolve` 后取首个 `existsSync` 命中，全不中返回 `?? null`。

## 3. 内部逻辑与关键流程

1. 平台短路（`apps/electron/scripts/after-sign-mac.cjs:30-31`）：非 `darwin` 直接 return。
2. 定位产物（`apps/electron/scripts/after-sign-mac.cjs:33-38`）：`resolveAppBundlePath` 为 null → throw `[afterSign] 未找到 macOS App 产物，无法补做签名：<appOutDir>/CDUT Studio.app`。
3. 真实签名检测（`apps/electron/scripts/after-sign-mac.cjs:40-48`）：`readSignatureInfo(appPath)` 取 `teamIdentifier`；存在且 ≠ `'not set'` → 打印「保留 Developer ID 签名，跳过 ad-hoc 补签」→ `assertMacSignatureContract(appPath)` → return（不覆盖真实签名）。
4. ad-hoc 补签（`apps/electron/scripts/after-sign-mac.cjs:50-51`）：`await signMacAppWithPinnedRequirement(appPath)` 得 `{ bundleId, requirement }`。
5. 契约断言与日志（`apps/electron/scripts/after-sign-mac.cjs:52-56`）：`assertMacSignatureContract(appPath)` 返回 `result`（含 `nestedAppCount`），打印「签名完成：bundleId=…，DR=…，嵌套 App N 个」。返回值：钩子 Promise<void>。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/electron-builder.yml:27`（`afterSign: scripts/after-sign-mac.cjs`）；注释块 `apps/electron/electron-builder.yml:22-26` 描述同一契约。
- 出向：`require('./macos-signature.cjs')` 取 `PRODUCT_APP_NAME`/`assertMacSignatureContract`/`readSignatureInfo`/`signMacAppWithPinnedRequirement`（`apps/electron/scripts/after-sign-mac.cjs:14-19`；导出清单见 `apps/electron/scripts/macos-signature.cjs:272-283`）；`node:fs.existsSync`、`node:path.join/resolve`。
- 否定结论：全树 grep（工具：ripgrep，pattern `after-sign-mac`）仅命中 electron-builder.yml:27、packaging-guards.test.ts:158 及本文件自身，无其它代码级调用点。

## 5. 数据 I/O、读写与副作用

- 读：`.app` bundle 的签名信息（经 macos-signature.cjs 的 codesign 查询）、文件系统存在性检查。
- 写：`signMacAppWithPinnedRequirement` 对 `.app` 及嵌套组件写入 ad-hoc 签名并钉死 DR（写入语义在 macos-signature.cjs，域外）。本文件自身无直接磁盘写、无网络、无缓存、无全局状态。
- 幂等/原子性：真实签名分支完全不写（幂等）；ad-hoc 分支对已 ad-hoc 的包重跑可重复签名（幂等语义由域外实现保证）。无锁。
- 副作用：`console.log` 打包日志 ×3。

## 6. 分支、失败、取消与恢复

- early-return ×2：非 darwin（`:31`）；真实签名已存在（`:47`）。
- throw：找不到 `.app` 产物（`:35-37`，文案见 §3.2）；`assertMacSignatureContract` 不符契约时抛错（域外实现，经 `:46/:52` 传播，阻断打包）；`signMacAppWithPinnedRequirement` 失败同样向上传播阻断。
- 失败后状态：补签失败时 `.app` 可能处于部分签名态，但 electron-builder 流程中断，不会产出归档。
- 恢复路径：无自动重试；重跑打包即重新进入钩子。契约注释（`apps/electron/scripts/after-sign-mac.cjs:10`）强调 DR 一旦发布必须保持，否则用户需手动重装。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：签名身份权威 = `readSignatureInfo` 的 TeamIdentifier（`:41`）；`not set` 视为 ad-hoc（`macos-signature.cjs:45` 常量 `ADHOC_TEAM_IDENTIFIER = 'not set'`）。DR 钉死契约的权威定义在 `macos-signature.cjs` 顶部注释（`apps/electron/scripts/after-sign-mac.cjs:8` 指向）。

## 8. 修改影响面

- macOS 打包/签名流程；`apps/electron/electron-builder.yml:27` 接线与 `:22-26` 契约注释。
- 上游：`scripts/push-mac-release.cjs:22` 复用同一 `macos-signature.cjs` 契约；产物校验 `apps/electron/scripts/verify-macos-signature.cjs:15`、`apps/electron/scripts/verify-macos-package.cjs:12`。
- 间接测试断言：`apps/electron/scripts/packaging-guards.test.ts:158`。Squirrel.Mac 自更新可用性（DR 变更会断更）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无直接单元测试。间接证据：`apps/electron/scripts/packaging-guards.test.ts:158`（`expect(config).toContain('afterSign: scripts/after-sign-mac.cjs')`）仅断言接线字符串。机械计数：packaging-guards.test.ts `test(` 19 处 / `it(` 0 处。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 钩子流程、双短路、throw 文案、真实签名不覆盖 | 已证实 | `apps/electron/scripts/after-sign-mac.cjs:1-57` 全文 |
| 四个被调符号在 macos-signature.cjs 真实导出 | 已证实 | `apps/electron/scripts/macos-signature.cjs:272-283` |
| 签名写入/DR 钉死的具体行为 | 未知（域外） | 仅见调用点，未逐行读 macos-signature.cjs |
| 补签后归档是否可被 Squirrel.Mac 接受 | 未知 | 需真机验证，NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| afterSign 主体 | §3 | 30-57 | covered |
| resolveAppBundlePath | §2/§3 | 21-28 | covered |
| darwin 短路 / 产物缺失 throw | §3/§6 | 30-38 | covered |
| 真实签名跳过分支 | §3/§7 | 40-48 | covered |
| ad-hoc 补签 + 契约断言 | §3/§5 | 50-56 | covered |
| 调用接线 | §4/§8 | — | covered |

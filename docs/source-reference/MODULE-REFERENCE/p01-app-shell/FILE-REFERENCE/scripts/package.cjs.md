---
path: scripts/package.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d7ced588be5db8835e55816e63465b42481bf1ed
sha256: dd20971664d1a4af23aae78cda0bc3a6d9d6d1a8e65a4a88d7778363885419b1
lines: 12
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# scripts/package.cjs

## 1. 结论与边界

已废弃的国内源补发入口（node CJS 拦截桩）：旧实现自行改写 package.json、重复构建链、直接 SSH 上传，绕过正式发布门禁；现**显式拒绝执行**并引导到 `push-release.cjs`（文件头 `scripts/package.cjs:1-7`）。

边界：无任何构建/发布能力（整文件 12 行）；只是 fail-fast 提示。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（脚本体）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| （无） | - | - | 仅 console.error + process.exit(1) |

## 3. 内部逻辑与关键流程

打印两行停用说明+替代命令（`:8-11`）→ `process.exit(1)`（`:12`）。无分支。

## 4. 调用者与调用链

入向：**无调用者**（全树检索 `scripts/package.cjs`/`package.cjs` 0 命中；`apps/electron/package.json` 的 `verify-macos-package.cjs` 为子串误配，非本文件）。废弃入口仅保留文件本身以拦截旧习惯手动调用（推断）。

出向：无（仅 console/process）。

## 5. 数据 I/O、读写与副作用

stderr 输出；exit 1。无盘/网络（依据：全文读）。

## 6. 分支、失败、取消与恢复

无分支；恒 exit 1。不适用项：失败/取消/恢复——依据：无实际工作。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；其存在本身是发布门禁防护（禁止绕过 `push-release.cjs` 验证链，`:6` 注释）。

## 8. 修改影响面

无调用方；删除或恢复实现需走正式发布流程评审（`push-release.cjs` 为替代入口，`:10`）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/脚本执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 恒 exit 1 | 已证实 | `:1-12` 逐行读 |
| 无调用者 | 已证实 | 全树检索（§4 范围） |
| 保留作拦截桩的意图 | 推断 | `:5-6` 注释 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 停用提示+退出码 | §3 | 8-12 | covered |
| 调用链（无） | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

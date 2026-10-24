---
path: apps/electron/scripts/build-ooxml.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 68161d8af10e9c1392b8227461f2ac6fb8e0f332
sha256: 44e3ec54f50c786ada8bbcc608c4770db1fc3b149c09cc526aadf96aced9168f
lines: 45
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/build-ooxml.mjs

## 1. 结论与边界

OOXML vendor 资产生成脚本（45 行，Node ESM）：把 `@silurus/ooxml` 的 dist 目录整个复制到 `apps/electron/src/renderer/public/vendor/ooxml/`，并为 docx/xlsx/pptx 三个 WASM 生成内容哈希重命名副本与 `wasm-manifest.mjs` 清单（`apps/electron/scripts/build-ooxml.mjs:1-45`）。边界：只做 vendoring+manifest，不解析文档、不跑 Vite；manifest 消费在渲染层（见 §4）。

## 2. 导出与关键符号

无导出（CLI）。参数：无命令行参数。内部常量：`scriptDir`/`appRoot`（`:7-8`）、`require`（`createRequire(appRoot/package.json)`，`:11`，兼容 bun hoisted 与嵌套 node_modules 两种布局，`:9-10` 注释）、`sourceDir`（`require.resolve('@silurus/ooxml')` 所在目录，`:12`）、`publicDir`（`:13`）、`manifest`（`:28`）。无内部函数。

## 3. 内部逻辑与关键流程

1. 定位源/目标（`:7-13`）：如上常量。
2. 存在性短路（`:15-17`）：`sourceDir` 不存在 → `throw new Error('@silurus/ooxml dist directory does not exist: …')`（未捕获，进程非 0 退出）。
3. 重建目标（`:19-20`）：`fs.rmSync(publicDir, {recursive, force})` 后 `mkdirSync`——全量覆盖语义，幂等。
4. 全量复制（`:22-26`）：`readdirSync(sourceDir, {withFileTypes})` 逐条 `fs.cpSync(source, target, {recursive})`。
5. WASM 哈希重命名（`:29-36`）：对 `${format}_parser_bg.wasm` 读字节、`sha256` 取 hex 前 16 位，复制为 `${format}_parser_bg.<hash>.wasm`，写入 `manifest[format]`。
6. 写清单（`:38-41`）：`wasm-manifest.mjs` 内容 = 固定头注释 + `export default <JSON>;`。
7. 收尾日志（`:43-45`）：打印复制文件数与 manifest JSON。返回值：进程退出码（正常 0）。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/package.json:12`（`"build:ooxml": "node scripts/build-ooxml.mjs"`）；被 `:14`（`dev:vite` 链）、`:27`（`build:renderer` 链）先决调用。
- 出向：`node:crypto`/`node:fs`/`node:path`/`node:module.createRequire`/`node:url.fileURLToPath`；npm 包 `@silurus/ooxml`（dist 目录，仅读）。
- 产物消费（非调用）：`apps/electron/src/renderer/components/file-browser/office-preview/silurus-bridge.ts:88` 动态 import `${vendorBase()}/wasm-manifest.mjs`；`.github/workflows/macos-package.yml:85-88` 打印本文件前 18 行与 ooxml resolve 路径用于排查（非执行）。

## 5. 数据 I/O、读写与副作用

- 读：`@silurus/ooxml` dist 目录全部条目、三个 `*_parser_bg.wasm` 字节。
- 写：`src/renderer/public/vendor/ooxml/`（先删后建，整目录重建）、`wasm-manifest.mjs`。
- 原子性：非 tmp+rename；rmSync+mkdirSync+cpSync 序列，中断会留半成品目录。幂等：重跑全量覆盖，结果确定（manifest 哈希由内容决定）。
- 无网络/缓存/全局状态；副作用：console 日志 ×2。

## 6. 分支、失败、取消与恢复

- 唯一显式失败出口：`sourceDir` 缺失 throw（`:15-17`）。
- 未捕获失败：cpSync/readFileSync/writeFileSync 任一 IO 异常直接令进程非 0 退出（无 try/catch）；WASM 文件缺失时 `readFileSync` 抛 ENOENT，中断并留半成品 `publicDir`。
- 用户可见文案：`[ooxml] copied N files …`、`[ooxml] wasm manifest: …`、错误 `@silurus/ooxml dist directory does not exist`。
- 恢复路径：无重试；修依赖后重跑本脚本（幂等重建）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：WASM 文件名→内容哈希映射的权威 = `wasm-manifest.mjs`（生成头注明 `Do not edit`，`:40`）。

## 8. 修改影响面

- `apps/electron/package.json:12,14,27`（build:ooxml / dev:vite / build:renderer）→ 开发与构建链。
- 渲染层 OOXML 预览：`silurus-bridge.ts:88` 的 manifest import；vendor 目录进 Vite public 资产。
- `.github/workflows/macos-package.yml:85-88` 的排障输出（内容变更影响日志）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无直接测试（全树 grep `build-ooxml` 于 *.test.ts 零命中；`.github/workflows/macos-package.yml:85-88` 仅 sed 打印文件内容做诊断，不是断言）。间接证据：无。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 复制/哈希/manifest 生成流程与全量覆盖语义 | 已证实 | `apps/electron/scripts/build-ooxml.mjs:1-45` 全文 |
| manifest 消费点 silurus-bridge.ts:88 | 已证实 | 冻结树 grep 命中 |
| @silurus/ooxml dist 实际文件构成 | 未知 | 依赖安装产物，静态未展开 node_modules |
| hash 前 16 位碰撞风险 | 未知 | 未做统计取证 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 源/目标定位（createRequire 解析） | §2/§3 | 7-13 | covered |
| sourceDir 缺失 throw | §3/§6 | 15-17 | covered |
| rmSync+mkdirSync+cpSync 全量复制 | §3/§5 | 19-26 | covered |
| WASM 哈希命名 + manifest 写入 | §3/§7 | 28-41 | covered |
| 收尾日志 | §3 | 43-45 | covered |

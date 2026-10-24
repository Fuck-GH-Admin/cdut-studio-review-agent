---
path: apps/electron/src/renderer/lib/node-canvas-stub.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 66c72af798aa47245a165a5e99d5bbe51d55bf42
sha256: 6d03e289784f59ca2732fe51cc0e023b005658c2dfb0bcf642b025a6667be184
lines: 24
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/node-canvas-stub.ts

## 1. 结论与边界

Node 专用 canvas（`@napi-rs/canvas`/`canvas`）在**浏览器构建**里的显式替身（24 行，头注释 `:1-18`）：构建期可解析（Vite alias 挂上），**调用即抛可读错误**而非静默返回 undefined（注释 `:14-15`：静默会让 EMF 渲染变空白图）。

**背景**（`:4-12`）：`emf-converter` 有运行期守卫的可选 `import('@napi-rs/canvas')`（仅既无 OffscreenCanvas 又无 document 才走），渲染进程永不执行该路径，但 Vite 构建期仍解析，原生 Node 包内部 `require('fs'/'https'/'stream')` 会打挂浏览器构建（实测 `Failed to resolve entry for package "https"`，`:12`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `createCanvas` | 函数（导出） | 19-21 | `(): never` | throw `'渲染进程不应加载 Node canvas（@napi-rs/canvas）；请检查 vite.config.ts 的别名配置'` |
| `loadImage` | 常量（导出） | 23 | `= createCanvas` | 同一 throw 函数 |
| `default` | 对象（导出） | 24 | `{createCanvas, loadImage}` | 兼容 default import |

导出合计 3。

## 3. 内部逻辑与关键流程

单函数体：无条件 `throw new Error(...)`（`:20`）。无分支、无状态。

## 4. 调用者与调用链

入向：**无源码 import**（全冻结树检索 `node-canvas-stub` 仅 `vite.config.ts` 命中）。接线=构建配置 `apps/electron/vite.config.ts:56-57`：`resolve.alias` 将 `@napi-rs/canvas` 与 `canvas` 两个 find 映射到本文件（注释 `:17` 提到 pdfjs-dist 也引用同名可选依赖）。实际触发点=`emf-converter` 的运行期可选 import（域外文件，按头注释声明，〔推断〕）。
出向：无。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：仅 throw）。副作用=被调用时抛异常（可见错误）。

## 6. 分支、失败、取消与恢复

无分支（不适用）；失败即设计目标——调用即 throw（`:20`），错误文案指回 vite alias 配置。无恢复路径（不应被调用）。

## 7. 权限与权威状态

无（不适用，依据：无权限逻辑）。

## 8. 修改影响面

- `vite.config.ts:56-57` alias 与本文件是成对契约；删除/改名会使浏览器构建重新打挂（`:12` 的实测错误）。
- 若 `emf-converter` 的可选 import 路径真的被执行（无 OffscreenCanvas 且无 document 环境），将抛本文件错误（比静默空白更可诊断，设计意图 `:14-15`）。
- 需同步修改的测试：无（批内/全树均无本文件测试，见 §9）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `node-canvas-stub` 无测试命中；检索范围=baseline/source 全树）。间接证据：无断言级命中（构建是否成功为构建期验证，本轮 NOT_RUN）。

`NOT_RUN`：本轮未运行 vite build / 任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 替身语义（import 不抛、调用即抛）与错误文案 | 已证实 | `:1-24` 全文逐行 |
| vite alias 接线（@napi-rs/canvas、canvas） | 已证实 | `vite.config.ts:56-57` |
| emf-converter 可选 import 的实际触发条件 | 推断 | 头注释 `:4-12` 声明（域外文件未深读） |
| 构建期实测错误（"Failed to resolve entry…"） | 已证实（注释声明） | `:12` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createCanvas`/`loadImage`/`default` | §2/§3 | 19-24 | covered |
| vite alias 接线 | §4/§8 | - | covered |
| emf-converter 触发条件 | §4/§10 | - | partial（推断） |

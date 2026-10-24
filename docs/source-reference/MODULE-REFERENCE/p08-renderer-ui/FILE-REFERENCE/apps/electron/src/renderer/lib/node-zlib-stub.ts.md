---
path: apps/electron/src/renderer/lib/node-zlib-stub.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9c3062b39571cd6d51c244b2689c079783f4ce8b
sha256: 2d59f69a5744544f744bfe82d8778ece3984945ba4c1153eefc9be40f88920d6
lines: 66
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/node-zlib-stub.ts

## 1. 结论与边界

Node 专用 `node:zlib` 在**浏览器构建**里的显式替身（66 行，头注释 `:1-14`）：构建期可解析、**import 期不抛**、调用才抛可读错误（注释 `:9-11`：避免 Vite 外部化 stub 在模块求值阶段白屏假死）。

**背景**（`:4-8`）：`@profer/core` 的 PDF/Office 解析引擎依赖 Node `node:zlib`（如 `inflateRawSync` 解析 ZIP 中央目录），只应由主进程消费；若第三方深层 `import { inflateRawSync } from 'node:zlib'`，需有可解析替身。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `unavailable` | 函数（内部） | 15-19 | `(): never`，throw `'渲染进程不应调用 Node zlib（node:zlib）；文档解析等逻辑必须留在主进程，请检查 vite.config.ts 的别名配置'` |
| 同步 7 项 | 常量（导出） | 21-27 | `inflateSync/inflateRawSync/deflateSync/deflateRawSync/gzipSync/gunzipSync/unzipSync = unavailable` |
| 异步 7 项 | 常量（导出） | 28-34 | `inflate/inflateRaw/deflate/deflateRaw/gzip/gunzip/unzip = unavailable` |
| 流式 6 项 | 常量（导出） | 35-40 | `createInflate/createInflateRaw/createDeflate/createDeflateRaw/createGzip/createGunzip = unavailable` |
| `constants` | 常量（导出） | 42 | `= {}`（空对象占位） |
| `default` | 对象（导出） | 44-66 | 上述 21 键全集（20 函数 + constants） |

导出合计 **22 export 声明**（20 同义函数 + `constants` + `default`）；20 个函数导出全部指向同一内部 `unavailable`。

## 3. 内部逻辑与关键流程

单内部函数 `unavailable()`：无条件 throw（`:16-18`）。无分支、无状态；所有导出为同一引用（identity 相同）。

## 4. 调用者与调用链

入向：**无源码 import**（全冻结树检索 `node-zlib-stub` 仅 `vite.config.ts` 命中）。接线=`apps/electron/vite.config.ts:61-62`：`resolve.alias` 将正则 `^node:zlib$` 与 `^zlib$` 映射到本文件。潜在触发=第三方库深层 zlib 调用（头注释 `:8` 情形，〔推断〕）；`@profer/core` 引擎按设计只在主进程跑。
出向：无。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：仅 throw）。副作用=被调用时抛异常。

## 6. 分支、失败、取消与恢复

无分支（不适用）；失败即设计目标（调用即 throw）。import 期求值安全（无顶层 throw，`:15-19` 只定义函数）——与 Vite 外部化 stub 的"访问即抛"相反（注释 `:9-11`）。

## 7. 权限与权威状态

无（不适用，依据：无权限逻辑）。

## 8. 修改影响面

- `vite.config.ts:61-62` alias 成对契约；20 个导出名与 Node zlib API 面的对齐关系（新增 zlib API 需评估是否补桩）。
- 若未来第三方库真的调用 zlib，本文件把白屏假死换成可诊断错误（设计意图 `:9-11`）。
- 需同步修改的测试：无（批内/全树均无本文件测试，见 §9）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `node-zlib-stub` 无测试命中；检索范围=baseline/source 全树）。间接证据：无。

`NOT_RUN`：本轮未运行 vite build / 任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 22 导出/20 同义函数/import 安全/调用即抛 | 已证实 | `:1-66` 全文逐行 |
| vite alias 接线（^node:zlib$、^zlib$） | 已证实 | `vite.config.ts:61-62` |
| pdfjs-dist 同名可选依赖被覆盖 | 推断 | 头注释 `:13`（node-canvas-stub 注释同源声明） |
| 第三方深层调用的实际触发面 | 未知 | 未运行构建/运行验证 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `unavailable` + 20 同义导出 + `constants` + `default` | §2/§3 | 15-66 | covered |
| vite alias 接线 | §4/§8 | - | covered |

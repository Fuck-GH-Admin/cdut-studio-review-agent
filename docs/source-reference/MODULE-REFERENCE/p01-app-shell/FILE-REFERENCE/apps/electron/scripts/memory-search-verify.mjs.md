---
path: apps/electron/scripts/memory-search-verify.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0e79ef8543c2b498cd8a67d4cab8a90d5f762bb2
sha256: 574b8fedb2820c5c6fc7fb9067a490309e3e0d0ab40525bdbc9550d16fec6fd6
lines: 105
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/memory-search-verify.mjs

## 1. 结论与边界

memory-archive FTS5 检索服务（`src/main/lib/memory-archive-search.ts`）的**独立 Node 运行验证脚本**（105 行）：在真实 Node（具备 `node:sqlite`，与 Electron 同等能力）下对该服务做端到端检索/增删改一致性/生命周期验证（`memory-search-verify.mjs:1-10`）。文件头明确其存在理由：`memory-archive-search.ts` 依赖 Node 内置 `node:sqlite`，`bun test` 运行器不支持 `require node:sqlite`，故无法进 bun test gate（`memory-search-verify.mjs:4-6`，注释声明）。

边界：不覆盖主进程其它服务；不验证 IPC 接线（真实消费者见 §4）；不测并发/性能；断言是脚本内 `check()` 记分而非测试框架；本文件本身不含被测实现。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| （导出） | — | — | — | `export` 0 命中；顶层即执行的 ESM 脚本（含顶层 `await`） |
| `__dirname` / `root` | 常量（内部） | 18-19 | 脚本目录 → `apps/electron` 根 | 由 `import.meta.url` 推导 |
| `outfile` | 常量（内部） | 22 | `profer-memsearch-verify-<pid>.cjs` in `os.tmpdir()` | esbuild 产物临时路径 |
| `seed` | 函数（内部） | 38-47 | `() => void` | 写入 4 个主题 md 夹具 |
| `check` | 函数（内部） | 51-53 | `(name, cond) => void` | `cond` 真 → pass++/✓，假 → fail++/✗ |
| `cases` | 常量（内部） | 58-68 | 9 元组 `[名称, 查询, 期望命中数, 期望首命中路径]` | 检索用例表 |
| 被测导入 | — | 23-31 | esbuild bundle 后 `import(file://outfile)` | 取 `svc.createMemoryArchiveSearcher` |

## 3. 内部逻辑与关键流程

1. esbuild 打包（`memory-search-verify.mjs:22-30`）：`entryPoints=[root/src/main/lib/memory-archive-search.ts]`，`bundle:true, platform:'node', format:'cjs'`，输出临时 cjs；注释称"保留 node:sqlite external"（`:21`；platform=node 时 Node 内置模块保持 external，推断）。随后 `await import(file://outfile)` 取服务（`:31`）。
2. 夹具（`:34-47`）：`mkdtemp` 临时工作区，内建 `memory-archive/`，`seed()` 写 4 文件：`skin-engine.md`、`profer-performance-issues.md`、`pr-wflow.md`、`prod-server-ops.md`（内容含中文短语/英文词/路径片段/版本号/IP，供 9 用例检索）。
3. 检索命中用例（`:58-75`）：`createMemoryArchiveSearcher(memoryDir)`（`:56`）后逐条 `searcher.search(q, 5)`；断言 `hits.length === expectN` 且（有期望时）`hits[0].relativePath === expectPath`（`:72-74`）。9 条：中文短语/长短语/单字、英文整词、路径片段 `profer-skin`、版本号 `47.109.108.57`、`Electron 43` 混合、英文大小写 `WORKTREE`、无关查询期望 0 条。
4. 增删改一致性（`:77-91`）：新增 `new-topic.md` 后搜"撤销"即时命中（`:79-81`）；整文重写 `skin-engine.md` 后搜"白名单"必须 0 命中（`:84-86`，对应服务端 `mtime|size` 签名失效重建索引，`memory-archive-search.ts:57-59`）；`rmSync` 删除 `pr-wflow.md` 后搜"worktree" 0 命中（`:89-91`）。
5. 跨搜索器生命周期（`:93-99`）：第二个 `createMemoryArchiveSearcher` 实例必须自行完成首次索引、可检索既有 `new-topic.md`（`:96-98`）；注释（`:94-95`）说明这是防"工具可调用但始终返回空结果"的回归点。最后 `secondSearcher.close()`（`:99`）。
6. 收尾（`:101-105`）：打印 pass/fail 汇总，`searcher.close()`，`rmSync` 清理临时工作区与临时 cjs，`process.exit(fail ? 1 : 0)`（文档声明的退出码契约，`:10`）。

## 4. 调用者与调用链

- 入向：`apps/electron/package.json:50` `"test:memory-search": "node scripts/memory-search-verify.mjs"`（唯一树内调用登记；`grep -rn "memory-search-verify"` 全树仅命中 package.json 与本文件）。
- 出向：`esbuild` 的 `build`（`memory-search-verify.mjs:16,23-30`）；`node:fs`/`node:os`/`node:path`/`node:url`（`:12-15`）；被测服务 `createMemoryArchiveSearcher(memoryArchivePath)`（`memory-archive-search.ts:139`），返回 `{search, rebuildAll, close}`（`memory-archive-search.ts:317`）；`search(query, topK)` 走 FTS5 MATCH + BM25 排序，语法错误降级整词 fallback（`memory-archive-search.ts:250-262`），结果按 `relativePath` 排序并截断 `min(topK, MAX_TOP_K=20)`（`memory-archive-search.ts:305`、`memory-archive-search.ts:31`）；命中形状 `MemoryArchiveSearchHit{relativePath, content, startIndex, endIndex, score, matchedTokens}`（`memory-archive-search.ts:38-48`）。
- 被验证服务的真实消费者（交叉阅读，非本脚本调用）：`apps/electron/src/main/ipc.ts`、`apps/electron/src/main/lib/adapters/pi-builtin-tools.ts`（+其测试）、`apps/electron/src/main/lib/memory-search-router.ts`、`apps/electron/src/main/lib/hippo-memory-service.ts`（`grep -l "memory-archive-search"` 全树证据）。

## 5. 数据 I/O、读写与副作用

- 写：`os.tmpdir()/profer-memsearch-verify-<pid>.cjs`（esbuild 产物，`:22`）、`mkdtemp` 工作区及 `memory-archive/*.md` 夹具（`:34-47,79,84`）；删除：夹具文件 `rmSync`（`:89`）、收尾清理工作区与 outfile（`:103-104`）。
- 读：服务端对夹具目录建内存 SQLite FTS 索引（服务实现 `memory-archive-search.ts`；单文件超 2MiB 不全文索引、文件数上限 2000，`memory-archive-search.ts:34-36`）。
- 网络/持久缓存/全局状态：无（除进程环境 tmpdir）。原子性/锁：无（单进程验证脚本）。副作用：控制台输出、退出码、临时文件（收尾清理）。

## 6. 分支、失败、取消与恢复

- 失败口径：单个 `check` 失败只记 `fail++` 不中断（`memory-search-verify.mjs:51-53`）；全部用例跑完后 `process.exit(fail ? 1 : 0)`（`:105`）——退出码 1=有失败，0=全过（契约见 `:10`）。
- esbuild/`import` 阶段异常（`:23-31`）为顶层 await 未捕获 → Node 打印错误并非零退出（推断）；此时 outfile 可能残留（无 try/finally，推断）。
- 无取消/重试/断点恢复；重复运行依赖全新 mkdtemp 与 pid 后缀 outfile，天然可重入（推断：pid 后缀防并发互撞，`memory-search-verify.mjs:22`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；Node 脚本继承调用用户对 tmpdir 与仓库只读源的权限。被测服务的"权威状态"是内存 SQLite 索引与 `mtime|size` 签名缓存（`memory-archive-search.ts:57-59`），属被测实现细节，非本文件所有。

## 8. 修改影响面

- 消费者：`package.json:50` 的 `test:memory-search` 脚本；CI/人工按此入口运行。改文件名/路径需同步该 script。
- 被测接口契约：`createMemoryArchiveSearcher(...).search(q, topK)` 返回含 `relativePath` 的数组、`close()`（`memory-archive-search.ts:139,317`）——服务签名变化会破坏本脚本 5 个调用点（`:56,71,80,85,90,97`）。
- 断言数字与夹具内容强耦合（如"白名单退役"仅存于 `skin-engine.md`，`:39-40`）；夹具/服务分词行为变化会连锁影响用例期望（脆弱点，§10 推断）。
- 无产品运行时影响（纯验证脚本）。

## 9. 测试证据

- 本文件**即**验证脚本，不是 bun test；其"断言"为 `check()` 记分（`:51-53`）+ 退出码（`:105`）。用例构成：检索命中 9 条（`cases` 表 `:58-68`，循环 `:70-75`）+ 增删改 3 条（`:81,86,91`）+ 生命周期 1 条（`:98`）= 13 次 `check` 执行、5 个调用点。
- `NOT_RUN`：本轮未执行 `node scripts/memory-search-verify.mjs`、未运行 bun test/typecheck/构建/GUI；上述用例语义为静态阅读所得，不代表已跑通。
- 覆盖缺口：`rebuildAll` 未被本脚本调用（`memory-archive-search.ts:317` 返回但 0 断言）；`MAX_TOP_K`/`MAX_FILE_BYTES`/`MAX_FILES` 边界、FTS fallback 分支（`memory-archive-search.ts:258-260`）无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 次 check 的用例结构、退出码契约、临时目录生命周期 | 已证实 | `memory-search-verify.mjs:10,22-47,51-53,58-105` |
| 唯一树内调用为 `package.json:50` | 已证实 | 全树 grep（排除 .git）命中 package.json 与自身 |
| 被测服务签名/形状（`{search,rebuildAll,close}`、hit 字段、MAX_TOP_K=20） | 已证实 | `memory-archive-search.ts:31,38-48,139,317` |
| 被测服务 4 个真实消费者 | 已证实 | `grep -l "memory-archive-search"` 全树 |
| esbuild platform=node 使 node:sqlite 保持 external | 推断 | `memory-search-verify.mjs:21-30` + esbuild 语义，未实测 |
| 用例期望数与中文分词/BM25 行为耦合，实现演进会连锁失效 | 推断 | 用例表 `:58-68` 与服务实现对照 |
| 本轮实际运行结果 | 未知 | `NOT_RUN`，未执行 |
| bun test 无法 require node:sqlite 的注释声明 | 未知（注释自述） | `memory-search-verify.mjs:4-6`，未复验运行器行为 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| esbuild 打包+动态 import | §3.1 | 22-31 | covered |
| `seed` 4 夹具 | §3.2 | 38-47 | covered |
| 9 检索用例 | §3.3、§9 | 58-75 | covered |
| 增/改/删一致性 | §3.4 | 77-91 | covered |
| 第二搜索器生命周期 | §3.5 | 93-99 | covered |
| `check` 记分/退出码 | §6、§9 | 51-53,105 | covered |
| `rebuildAll` 未覆盖 | §9 | — | unknown |
| FTS fallback/MAX 边界 | §9 | — | unknown |
| 实际运行结果 | §10 | — | unknown（NOT_RUN） |

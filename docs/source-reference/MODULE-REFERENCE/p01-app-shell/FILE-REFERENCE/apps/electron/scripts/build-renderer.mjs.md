---
path: apps/electron/scripts/build-renderer.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3cf8d8bf2c7a71a1669aa9819cb095f20ff334d0
sha256: 9a344f17e2e2131b5daf2df33770d5086a639e47e87daa44f8b2f84efe6c69be
lines: 34
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/build-renderer.mjs

## 1. 结论与边界

渲染层构建包装器（34 行，`#!/usr/bin/env node`）：Mol* 把模块图扩到 ~1.2 万模块，Vite/Rollup 默认 4GB 堆在转换阶段 OOM；本脚本先给 Node 注入 `--max-old-space-size=8192` 再拉起 `vite build`，消除 CI/本地构建随机失败（`apps/electron/scripts/build-renderer.mjs:2-7`）。边界：不改 Vite 配置、不做 dev server；仅转发退出码。

## 2. 导出与关键符号

无导出（CLI）。参数：无命令行参数（固定执行 `vite build`）。内部常量：`require`（`createRequire(import.meta.url)`，`:14`）、`vitePkgPath`/`vitePkg`/`binField`/`binRelative`/`viteBin`（`:15-23`，经 `require.resolve('vite/package.json')` 的 `bin` 字段定位 vite CLI，string 或对象取首值）、`nodeOptions`（`:25-27`，`[process.env.NODE_OPTIONS, '--max-old-space-size=8192']` 过滤空后拼接）。无内部函数。

## 3. 内部逻辑与关键流程

1. 定位 vite CLI（`:14-23`）：解析 `vite/package.json`；`bin` 字段缺失/空 → `console.error('[build-renderer] 无法定位 vite CLI 入口')` 后 `process.exit(1)`（`:19-22`）。
2. 组装 NODE_OPTIONS（`:25-27`）：保留既有 `process.env.NODE_OPTIONS` 并追加 8GB 堆上限。
3. 拉起构建（`:29-32`）：`spawnSync(process.execPath, [viteBin, 'build'], { stdio: 'inherit', env: {...process.env, NODE_OPTIONS: nodeOptions} })`——用当前 Node 直接跑 vite bin，绕过 PATH。
4. 退出码转发（`:34`）：`process.exit(result.status ?? 1)`（status 为 null（信号终止）时按 1）。返回值：进程退出码。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/package.json:27`（`"build:renderer": "bun run build:ooxml && node scripts/build-renderer.mjs"`）；`.github/workflows/ci.yml:59`（`bun run build:renderer`）。
- 间接链：`dist.ts` 步骤 3（`apps/electron/scripts/dist.ts:228`，`bun run build:renderer`）；`build`/`build:github`/`build:commercial`（`apps/electron/package.json:32,42-43`）。
- 出向：`node:child_process.spawnSync`、`node:module.createRequire`、`node:fs.readFileSync`（只读 vite package.json）、`node:path`；被调对象 `vite` CLI（`vite build`）。

## 5. 数据 I/O、读写与副作用

- 读：`vite/package.json`（JSON.parse）。
- 写：无直接磁盘写（产物 dist/ 由 vite 产生）。
- 网络/缓存/全局状态：无。环境变量：子进程 NODE_OPTIONS 注入（仅子进程 env，不改父进程）。
- 副作用：spawnSync 子进程（stdio inherit）、退出码透传。幂等：纯启动器，重复执行语义一致。

## 6. 分支、失败、取消与恢复

- early-exit：vite bin 不可定位 → 打印 `[build-renderer] 无法定位 vite CLI 入口` → exit 1（`:19-22`）。
- 失败透传：vite build 失败 → `result.status` 非 0 → `process.exit(status)`；被信号杀死（status=null）→ exit 1（`:34`）。
- 失败后状态：磁盘侧由 vite 自身语义决定（可能留半成品 dist/）；本脚本无清理/恢复逻辑。取消：父进程杀本脚本会留下 vite 子进程由 shell 层管理（spawnSync 同步等待，无句柄泄漏处理）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：渲染构建堆上限权威 = `--max-old-space-size=8192`（`:25`），与 `apps/electron/vite.config.ts`（域外）配合；vite 入口权威 = vite 包 `bin` 字段运行时解析。

## 8. 修改影响面

- 渲染构建：`build:renderer`（`apps/electron/package.json:27`）→ `build`/`build:github`/`build:commercial`/`dist.ts` 步骤 3 → CI `.github/workflows/ci.yml:57-59`。
- 构建产物 `dist/renderer`（vite 输出，域外）；OOM 阈值变更影响 CI 稳定性。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无直接测试（全树 grep `build-renderer` 于 *.test.ts 零命中）。间接证据：无。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| vite bin 解析、NODE_OPTIONS 注入、退出码转发 | 已证实 | `apps/electron/scripts/build-renderer.mjs:1-34` 全文 |
| 8192MB 足够规避 Mol* OOM | 推断 | 注释自述动机（`:5-6`），未实测 |
| vite bin 字段为对象时取首值的正确性 | 推断 | `:18` 取 `Object.values(...)[0]`，与 vite 实际 package.json 未逐一核对 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| vite CLI 定位 + 失败 exit 1 | §3/§6 | 14-23 | covered |
| NODE_OPTIONS 组装 | §3/§5 | 25-27 | covered |
| spawnSync vite build | §3/§4 | 29-32 | covered |
| 退出码转发 | §3/§6 | 34 | covered |

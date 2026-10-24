---
path: apps/electron/vite.config.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ddb982336d52539076d49e2b280012bafca2f27f
sha256: 14337004fd3256a4f48f30112cd844d413c9722f8a95802f98b9e23fb7bfa1dd
lines: 85
kind: config
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/vite.config.ts

## 1. 结论与边界
Electron 渲染端的 Vite 构建/开发配置（运行时配置代码，defineConfig 对象）：定义插件、版本注入、renderer 根目录、Mol* 预构建与分块、7 条 resolve 别名（含 4 个 Node 模块替身）、dev server 端口/监听策略（`apps/electron/vite.config.ts:1-85`）。边界：只管渲染端（`root` 指向 `src/renderer`，`:12`）；main/preload/cli 构建不走本文件（`apps/electron/package.json:32` 的 build 由 build:main/build:preload/build:renderer 等分步）；不配置 postcss/tailwind（自动加载 `apps/electron/postcss.config.js`，见该手册）。

## 2. 导出与关键符号
| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `default`（defineConfig 结果） | 导出（默认） | 7-85 | `UserConfig` | 唯一导出；0 具名导出 |
| `defineConfig`/`react`/`resolve`/`pkg`/`resolveDevVitePort` | 导入 | 1-5 | | `pkg` 为 `./package.json` JSON 导入（`:4`）；`resolveDevVitePort` 来自 `./src/main/lib/dev-instance`（`:5`） |
| `optimizeDeps.include` | 配置键 | 18-32 | 13 条 molstar 深路径 | 内部数组（见 §3） |
| `manualChunks(id)` | 内部函数 | 45-48 | `(id: string) => string \| undefined` | molstar 单独分块（`:46`） |
| `resolve.alias` | 配置键 | 53-67 | 7 条 `{find, replacement}` | 见 §3 |
| `server.watch` | 配置键 | 78-83 | `{useFsEvents, usePolling?}` | 环境变量驱动（见 §3） |

## 3. 内部逻辑与关键流程
按配置对象顺序：①插件 `[react()]`（`:8`）；②`define.__APP_VERSION__ = JSON.stringify(pkg.version)`（`:9-11`，版本取自 `apps/electron/package.json`）；③`root=src/renderer`、`base:'./'`（`:12-13`，相对路径产物）；④`optimizeDeps.include` 13 条 `molstar/lib/...` 深路径（`:18-32`）——注释自述 Mol* 5.x 无根入口，直接写 `'molstar'` 会报 Failed to resolve entry（`:15-17`）；⑤`build.outDir=dist/renderer`、`emptyOutDir:true`（`:35-36`）；`rollupOptions.input` 双入口 `main=src/renderer/index.html`（`:39`）、`viewer=src/renderer/viewer.html`（`:41`，注释指 `src/renderer/viewer/main.ts` 为 Open File Viewer 宿主 `:40`）；`output.manualChunks` 把 `node_modules/molstar` 拆为独立 chunk（`:45-48`，注释动机 `:44`）；⑥`resolve.alias` 7 条（`:53-67`）：`@napi-rs/canvas`→`src/renderer/lib/node-canvas-stub.ts`（`:56`）、`canvas`→同文件（`:57`，pdfjs-dist 同名可选依赖，stub 注释 `node-canvas-stub.ts:17`）、`/^node:zlib$/`→`node-zlib-stub.ts`（`:61`）、`/^zlib$/`→同（`:62`）、`@/types`→`src/types`（`:63`）、`@`→`src/renderer`（`:64`）、`@assets`→`../../assets`（`:66`）；替身语义：构建期可解析、真被调用才抛可读错误（`node-canvas-stub.ts:19-21`、`node-zlib-stub.ts:15-19`）；⑦`server`（`:69-84`）：`port=resolveDevVitePort()`（`:70`；实现 `dev-instance.ts:52-56`：`PROFER_VITE_PORT` trim 后须为 1024-65535 整数否则回退 5174）、`strictPort:true`（`:71`，占用即报错）、`open:false`（`:72`）；`watch.useFsEvents = PROFER_VITE_WATCH_FSEVENTS==='1'`（`:79`）+ `PROFER_VITE_WATCH_POLLING==='1'` 时 `usePolling:true, interval:300`（`:80-82`）——注释自述 macOS FSEvents 零事件导致 HMR 静默失效的实测背景（`:73-77`）。

## 4. 调用者与调用链
入向：`apps/electron/package.json` scripts——`dev:vite: "bun run build:ooxml && vite dev"`（`apps/electron/package.json:14`，经 `dev` 汇编 `:10`）、`build:renderer: "bun run build:ooxml && node scripts/build-renderer.mjs"`（`:27`，经 `build` `:32`）；`build-renderer.mjs` 内部调用 vite 构建（未逐行读，推断）。出向：`./package.json`（`:4`）、`./src/main/lib/dev-instance` 的 `resolveDevVitePort`（`:5`，实现 `dev-instance.ts:52-56`）、两个 stub 文件（`:56-62`）、`src/renderer/index.html`/`viewer.html`（`:39-41`，均在冻结树存在）、`@vitejs/plugin-react`。

## 5. 数据 I/O、读写与副作用
读：`package.json`（构建期读取 version，`:4/:10`）；环境变量 `PROFER_VITE_PORT`/`PROFER_VITE_WATCH_FSEVENTS`/`PROFER_VITE_WATCH_POLLING`（`:70`、`:79-81`）。写：构建产物 `apps/electron/dist/renderer/`（`:35`，`emptyOutDir:true` 会先清空，`:36`）。无网络写入；dev server 监听本机端口（`:70-71`）。

## 6. 分支、失败、取消与恢复
分支：watch 两个环境变量开关（`:79-82`）；`manualChunks` 命中 molstar 与否（`:45-48`）。失败：端口被占用时 `strictPort:true` 直接报错不换端口（`:71`）；`PROFER_VITE_PORT` 非法（非整数/超出 1024-65535）时静默回退 5174（`dev-instance.ts:55-56`）；alias 缺失时的构建打挂模式见 stub 注释（`node-canvas-stub.ts:11-12` 实测报错、`node-zlib-stub.ts:8-11` 首屏崩溃风险）。无取消/恢复概念（配置对象无生命周期钩子）。

## 7. 权限与权威状态
无权限分支，依据：本文件无 sender/role 检查。版本权威：`__APP_VERSION__` 以 `package.json` 的 version 为源（`:4/:10`）。

## 8. 修改影响面
改 alias（`:53-67`）会波及 1139 处 `@/` 导入、`@assets/` 资源导入（如 `CdutWatermarkBackground.tsx:13-14`）及 4 个 Node 替身的守卫边界（渲染端绝不可真实加载 canvas/zlib，`node-zlib-stub.ts:4-6`）；改 `input`/`outDir`（`:35-41`）影响 electron-builder 打包布局与 viewer 宿主；改 `optimizeDeps.include`/`manualChunks`（`:18-32`/`:45-48`）影响 Mol* 首屏与 chunk 结构；改 port 行为影响 `dev-instance.ts` 多实例逻辑（同文件 `getDevInstanceId` `:23`）。需同步修改：`apps/electron/package.json` scripts、`scripts/build-renderer.mjs`、`dev-instance.ts`、两个 stub 注释中的指路。

## 9. 测试证据
无直接测试断言本文件对象（全树 `*.test.*` 检索 `vite.config` 0 断言命中）。间接证据：`apps/electron/scripts/ui-workspace-contract.test.ts:17-24` 用同一 tailwind 配置实际编译 CSS 并断言选择器（覆盖样式链而非本文件）；alias 的 renderer 侧行为无测试。NOT_RUN：本轮未运行任何测试/构建/dev（静态阅读）。

## 10. 已证实 / 推断 / 未知
| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 配置结构与行段如 §2/§3 | 已证实 | `apps/electron/vite.config.ts:1-85` 逐行 |
| `resolveDevVitePort` 实现（env 校验+5174 回退） | 已证实 | `dev-instance.ts:52-56` |
| stub 语义（可解析/调用即抛） | 已证实 | `node-canvas-stub.ts:19-24`、`node-zlib-stub.ts:15-19` |
| 入口脚本链（dev:vite/build:renderer） | 已证实 | `apps/electron/package.json:10/:14/:27/:32` |
| build-renderer.mjs 内部调 vite | 推断 | 脚本命名与分工，未逐行读 |
| Mol* 无根入口致预构建失败 | 推断 | `:15-17` 注释自述（实测记录），未复现 |
| `import ... with { type: 'json' }` 在当前 Bun/Vite 的行为 | 未知 | 工具链版本相关，未验证 |
| FSEvents 零事件问题在本机是否复现 | 未知 | `:73-77` 注释自述，未验证 |

## 11. 覆盖表
| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| default 导出（整体结构） | §2/§3 | `:7-85` | covered |
| define/root/base | §3 | `:9-13` | covered |
| optimizeDeps.include | §3/§8 | `:18-32` | covered |
| build（outDir/input/manualChunks） | §3/§8 | `:34-50` | covered |
| resolve.alias 7 条 | §3/§8 | `:53-67` | covered |
| server（port/strictPort/watch 分支） | §3/§6 | `:69-84` | covered |
| 调用链/副作用/影响面 | §4/§5/§8 | 见各节 | covered |

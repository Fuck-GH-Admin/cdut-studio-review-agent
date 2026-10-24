---
path: apps/electron/src/renderer/vite-env.d.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b07b2f9abb6e4f65eeab4ecefc2d3d36ade9f348
sha256: 71d137ddedb0945efdcfa2798ff22dc77038953a905be08779690147c3b238ef
lines: 42
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/vite-env.d.ts

## 1. 结论与边界

Vite 环境的补充类型声明：①`vite/client` 三斜线引用；②资源/特殊导入的 `declare module`（CSS 模块、音频、pdf.js worker、`?worker`、`*.wgsl?raw`）；③`Window` 全局接口扩展（附件临时 base64 缓存）（`apps/electron/src/renderer/vite-env.d.ts:1-42`）。纯声明，无逻辑。

边界：不声明 electronAPI（preload 类型另行定义）；不改运行行为。

## 2. 导出与关键符号

文件级 `export` 语句 0（`.d.ts` 环境声明经 `declare module` 各自 `export default`；`:39-42` 的 `interface Window` 为全局合并）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `*.css` 模块 | declare（模块内 export default） | 4-7 | `Record<string, string>` | CSS Modules 类名映射 |
| `*.wav` / `*.mp3` 模块 | declare | 10-18 | `string`（URL） | 音频资源导入 |
| `pdfjs-dist/build/pdf.worker.min.mjs` | declare | 21-24 | `unknown` | PDF.js Worker 主线程降级（注释 `:20`：评审加固 11.3） |
| `*?worker` | declare | 27-30 | `new () => Worker` | Vite Worker 构造器（注释 `:26`：避免打包后 file:// 模块 Worker 路径差异） |
| `*.wgsl?raw` | declare | 33-36 | `string` | WGSL 着色器原文 |
| `Window.__pendingAttachmentData?` | 全局接口扩展 | 40 | `Map<string, string>` | 附件发送前暂存 |
| `Window.__pendingAgentFileData?` | 全局接口扩展 | 41 | `Map<string, string>` | Agent 文件发送前暂存 |

## 3. 内部逻辑与关键流程

本文件不适用，依据：`.d.ts` 纯声明。

## 4. 调用者与调用链

入向（冻结树 grep）：`*.wgsl?raw` → `apps/electron/src/renderer/lib/webgpu/webgpu-isosurface.ts:12`（`import isosurfaceWgsl from './isosurface.wgsl?raw'`）；`*?worker` → `apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts:20-21`（两个 worker 导入）；`*.wav/*.mp3`、`*.css`、pdfjs worker 由对应资源导入点隐式消费（typecheck 期生效）。`Window.__pendingAgentFileData`：`apps/electron/src/renderer/components/agent/AgentView.tsx:1558-1561,1641-1644,1692,1714,1725,2368`（set/get/delete）；`Window.__pendingAttachmentData` **全冻结树 0 消费者**（检索 `*.ts/*.tsx` 排除本文件，符号名 0 命中）。

出向：`vite/client`（`/// <reference types>`，`:1`）。

## 5. 数据 I/O、读写与副作用

无（声明文件）；所述 `__pendingAgentFileData` 在 AgentView 侧是真实内存 Map 暂存（发送前 base64 缓存）。

## 6. 分支、失败、取消与恢复

本文件不适用，依据：无控制流。

## 7. 权限与权威状态

本文件不适用，依据：无权限逻辑。

## 8. 修改影响面

- 删 `*?worker`/`*.wgsl?raw` 声明会使 `cslab-worker-client.ts`/`webgpu-isosurface.ts` 失去类型。
- `Window` 扩展被 AgentView 消费（`__pendingAgentFileData`）；`__pendingAttachmentData` 当前为无消费预留（或遗留）。

## 9. 测试证据

**无直接测试**（声明文件）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 组声明 + Window 双字段 | 已证实 | `:4-42` 逐条 |
| `?worker`/`wgsl?raw` 消费点 | 已证实 | `cslab-worker-client.ts:20-21`、`webgpu-isosurface.ts:12` |
| `__pendingAgentFileData` 消费于 AgentView | 已证实 | `AgentView.tsx:1558-2368` 多处 |
| `__pendingAttachmentData` 0 消费者 | 已证实（检索：全树 `*.ts/*.tsx` 排除本文件，0 命中） | — |
| 运行时与 Vite 实际行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 资源/特殊导入声明 | §2 | 4-36 | covered |
| Window 扩展 | §2,§4 | 39-42 | covered |
| 零消费者结论 | §4,§10 | — | covered |
| 测试 | §9 | — | unknown |

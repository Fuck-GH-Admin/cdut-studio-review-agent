---
path: apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ee678798cbaca3b009868e2fc3a659e4c4bb6330
sha256: c580862a0bce20cb01072362f35930da2dfe9ee8ea20a781911c11aaa66f349b
lines: 214
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts

## 1. 结论与边界

CSLab Worker 类型化 RPC 客户端（214 行）：以 Vite `?worker` 导入（保证生产 file:// 下 Worker 路径稳定，`apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts:4`）持有两个懒创建 Worker（晶体学/拟合），按 `id` 配对请求响应，带 30s 超时、全量失败广播与 `dispose` 释放。边界：仅封装 `postMessage`/`onmessage` RPC，不触 DOM/IPC；计算实现在 Worker 侧（`@profer/shared` 纯函数）；对外只导出 `cslabWorkers` 单例门面。

## 2. 导出与关键符号

- 常量导出 1 个：`cslabWorkers`（`apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts:193-214`），含 8 个方法属性：`analyze`（`:194-195`）、`simulatePxrd`（`:196-197`）、`supercell`（`:198-199`）、`polyhedra`（`:200-206`）、`isosurface`（`:207`）、`fit`（`:208`）、`smooth`（`:209`）、`dispose`（`:210-213`）。函数/类型导出 0 个。合计导出 1 个符号。
- 内部符号（标注"内部"）：`PendingRequest`（`:28-32`）、`WithoutId<T>`（`:34`）、`CsLabWorkerPayload`（`:35`）、`TIMEOUT_MS = 30_000`（`:37`）、`class CsLabWorkerClient`（`:39-184`，未导出）：私有字段 `crystallography`/`fitting` Worker 缓存（`:40-41`）、`pending` Map（`:42`）、`nextId`（`:43`）；私有方法 `ensureCrystallography`（`:45-51`）、`ensureFitting`（`:53-59`）、`bind`（`:61-79`）、`request`（`:81-96`）；公开方法 `analyze`（`:98-105`）、`simulatePxrd`（`:107-118`）、`supercell`（`:120-135`）、`polyhedra`（`:137-152`）、`isosurface`（`:154-160`）、`fit`（`:162-164`）、`smooth`（`:166-171`）、`dispose`（`:173-183`）；模块级 `client` 单例变量（`:186`）与 `getClient`（`:188-191`）。

## 3. 内部逻辑与关键流程

1. 懒单例 `getClient`（`apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts:188-191`）：`client` 为空则 `new CsLabWorkerClient()`（`:189`）；`cslabWorkers` 每方法均经 `getClient()` 转发（`:195-209`）。
2. Worker 懒创建 `ensureCrystallography`/`ensureFitting`（`:45-51`/`:53-59`）：已有实例直接返回（`:46`/`:54`）；否则 `new CrystallographyWorker()`/`new FittingWorker()`（`:47`/`:55`，构造器来自 `:20-21` 的 `?worker` 导入）、`bind(worker)` 绑定消息处理器（`:48`/`:56`）、缓存后返回（`:49-50`/`:57-58`）。
3. `bind`（`:61-79`）：`onmessage` 按 `response.id` 查 `pending`（`:64`），未知 id 静默 return（`:65`）→ `clearTimeout` + `pending.delete`（`:66-67`）→ `ok` 则 `resolve(response.result)`，否则 `reject(new Error(response.error))`（`:68-69`）。`onerror`：取 `event.message || 'Worker 运行时错误'`（`:72`），把全部 in-flight 一次性 reject 并清空（`:73-77`）。
4. `request`（`:81-96`）：`id = nextId++` 单调递增（`:82-83`）→ new Promise 内 `setTimeout` 30s 超时定时器（`:85-88`：到点删 pending、`reject(new Error('Worker 计算超时（30s）'))`）→ `pending.set(id, {resolve, reject, timer})`（`:89-93`）→ `worker.postMessage({ ...payload, id })`（`:94`）。
5. 七个计算方法（`:98-171`）各自组 `{kind, ...}` 载荷转发 `request`：晶体学五种走 `ensureCrystallography()`（`analyze` tolerance 可选 `:103`、`pxrd` options 必带 `:116`、`supercell` na/nb/nc `:131-133`、`polyhedra` centerElement/neighborElements/cutoff `:148-150`、`isosurface` grid/isovalue `:157-158`）；拟合两种走 `ensureFitting()`（`fit` `:163`、`smooth` `:167-170`）。
6. `dispose`（`:173-183`）：全部 pending `clearTimeout` + `reject(new Error('Worker 已释放'))` + delete（`:174-178`）→ 两 Worker `terminate()`（`:179-180`）→ 引用置 null（`:181-182`）。门面 `cslabWorkers.dispose`（`:210-213`）额外把单例 `client = null`（`:212`），下次调用自动重建。

## 4. 调用者与调用链

- 入向（冻结树全量 grep `cslabWorkers|cslab-worker-client`）：`apps/electron/src/renderer/components/cdut-science/crystal/CsLabVestaCrystalPane.tsx:24`（import），调用 `:215` `cslabWorkers.polyhedra(...)`；`apps/electron/src/renderer/components/cdut-science/origin/CsLabPeakFitDrawer.tsx:14`（import），调用 `:103` `cslabWorkers.fit({...})`；`apps/electron/src/renderer/lib/webgpu/use-cslab-isosurface.ts:9`（import），调用 `:69-70` `cslabWorkers.isosurface(grid, ±magnitude)` 双调用。门面方法 `analyze`/`simulatePxrd`/`supercell`/`smooth`/`dispose` 无任何调用者（grep `cslabWorkers.` 全树仅上述 4 行命中）。
- 出向 imports：`../../workers/cslab-crystallography.worker?worker`、`../../workers/cslab-fitting.worker?worker`（`apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts:20-21`，Vite `?worker` 桥）；类型 `@profer/shared`（`:7-19`）；`./cslab-worker-protocol`（`:22-26`）。
- Worker 通信边界（消息两端）：请求 `worker.postMessage({ ...payload, id })`（`:94`）→ Worker 侧 `scope.onmessage`（`apps/electron/src/renderer/workers/cslab-crystallography.worker.ts:27`、`apps/electron/src/renderer/workers/cslab-fitting.worker.ts:12`）→ 响应 `scope.postMessage(response)`（`cslab-crystallography.worker.ts:61`、`cslab-fitting.worker.ts:20`）→ 本文件 `worker.onmessage`（`:62-70`）按 id 配对；崩溃通道 `worker.onerror`（`:71-78`）。消息形状由 `cslab-worker-protocol.ts:13-44` 约束。
- 否定结论检索范围：冻结树 `**/*.{ts,tsx,js}`（含 preload/worker）；动态 `import()`/`require` 无命中。

## 5. 数据 I/O、读写与副作用

有状态模块：实例级两个 Worker 缓存（`:40-41`）、`pending` Map（`:42`）、`nextId` 计数（`:43`）；模块级 `client` 单例（`:186`）跨组件持久。副作用：创建/终止 Web Worker（`:47,:55,:179-180`）、`postMessage` 跨线程消息（`:94`）、超时定时器 `setTimeout`/`clearTimeout`（`:85,:66,:75,:175`）。无 DOM/剪贴板/localStorage/IPC。

## 6. 分支、失败、取消与恢复

- 超时：30s 到点删 pending 并 reject `Worker 计算超时（30s）`（`:85-88`）；注意超时后 Worker 未被终止，迟到响应因 pending 已删被静默忽略（`:65`）。
- Worker 崩溃：`onerror` 广播失败至全部 in-flight 并清空（`:71-78`），错误消息为空时回退 `'Worker 运行时错误'`（`:72`）；已缓存 Worker 实例不自动重建（`:40-41` 仅 `dispose` 置 null）。
- 业务失败：`ok:false` → `reject(new Error(response.error))`（`:69`）；全部失败经 Promise reject，本模块无同步 throw（`request` 内无 throw 语句）。
- 取消与恢复：无 AbortSignal；`dispose` 是唯一取消手段（全量 reject + terminate，`:173-183`），门面置空单例后再次调用自动重建全新 Worker（`:210-213,:189`）。
- 竞态：`nextId` 单调递增不复用（`:82-83`），两 Worker 共享一个 `pending` Map 但 id 全局唯一，无串扰；`bind` 为每 Worker 单次绑定（`:48,:56`），消息处理器不叠加。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。计算权威在 Worker 侧 `@profer/shared` 纯函数（`apps/electron/src/renderer/workers/cslab-crystallography.worker.ts:4` 注释：不触 DOM/Electron）。

## 8. 修改影响面

- 三个调用方：`apps/electron/src/renderer/components/cdut-science/crystal/CsLabVestaCrystalPane.tsx:215`（多面体计算）、`apps/electron/src/renderer/components/cdut-science/origin/CsLabPeakFitDrawer.tsx:103`（峰拟合）、`apps/electron/src/renderer/lib/webgpu/use-cslab-isosurface.ts:69-70`（等值面提取）。
- 协议三方耦合：改 kind/字段/错误语义须同步 `apps/electron/src/renderer/lib/cslab/cslab-worker-protocol.ts`、`apps/electron/src/renderer/workers/cslab-crystallography.worker.ts`、`apps/electron/src/renderer/workers/cslab-fitting.worker.ts`。
- 超时/释放语义改动影响上述 UI 的失败提示与内存（Worker 泄漏）；`?worker` 导入方式改动影响生产 file:// 打包（`apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts:4` 注释）。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。无直接测试文件（检索范围：`apps/electron/src/renderer/lib/cslab/` 目录无 `.test.ts`；冻结树 `**/*.test.ts` grep `cslabWorkers|CsLabWorkerClient` 零命中）。间接证据：三调用点（§4，标"间接"）；`cslab-crystallography.worker.ts`/`cslab-fitting.worker.ts` 的 respond 端（`cslab-crystallography.worker.ts:61`、`cslab-fitting.worker.ts:20`，标"间接"）。断言引用≠运行，不得写"测试通过"。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出门面、8 方法、RPC 配对/超时/广播/释放语义 | 已证实 | `apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts:1-214` 全文 |
| Worker 通信两端接线（postMessage/onmessage/onerror） | 已证实 | `:62-79,94` + `cslab-crystallography.worker.ts:27,61`、`cslab-fitting.worker.ts:12,20`（域外静态检索） |
| `analyze`/`simulatePxrd`/`supercell`/`smooth`/`dispose` 无调用者 | 已证实 | 冻结树全量 grep（§4 检索范围） |
| 超时后 Worker 继续计算的资源影响 | 未知 | 无运行数据，未测量 |
| 测试实际运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `cslabWorkers.polyhedra`/`fit`/`isosurface` | §3,§4 | `cslab-worker-client.ts:200-207,208` | covered（静态 + 调用点） |
| `cslabWorkers.analyze`/`simulatePxrd`/`supercell`/`smooth` | §3,§4 | `cslab-worker-client.ts:194-199,209` | partial（无调用者、无测试） |
| `request` + `bind` RPC 配对 | §3,§6 | `cslab-worker-client.ts:61-96` | covered（静态） |
| 30s 超时分支 | §6 | `cslab-worker-client.ts:85-88` | partial（无测试） |
| `onerror` 全量 reject 分支 | §6 | `cslab-worker-client.ts:71-78` | partial（无测试） |
| `dispose` + 单例重建 | §3,§6 | `cslab-worker-client.ts:173-183,210-213` | partial（`dispose` 无调用者） |
| 运行结果 | §9 | — | unknown（NOT_RUN） |

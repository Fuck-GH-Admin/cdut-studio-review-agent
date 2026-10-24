---
path: apps/electron/src/renderer/workers/cslab-crystallography.worker.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9c77ecd2acb14eab7c5fbeacad4d33eccb3c8fcf
sha256: e3abab89eaf7a5b94b3e02d0ce4a5170ab710f956e65d5b45182693a1373bc27
lines: 119
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/workers/cslab-crystallography.worker.ts

## 1. 结论与边界

CSLab 晶体学 Web Worker（运行时）：接收结构分析/PXRD/超胞/多面体/等值面 5 类请求，调用 `@profer/shared` 纯函数计算后按 `id` 回包（文件头注释 `apps/electron/src/renderer/workers/cslab-crystallography.worker.ts:1-5`）。只依赖 shared 纯函数，不触 DOM/Electron。

边界：不做持久化/网络；不解析文件（文本→结构解析在 `@profer/shared` 的 `buildStructureFromText`/`analyzeCrystalText`）；不管理 worker 生命周期（由客户端创建/terminate）；协议类型在 `../lib/cslab/cslab-worker-protocol`（`:21-24`），本文件不定义。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（worker 入口脚本，仅副作用注册 `onmessage`）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `WorkerScope` | 接口（内部） | 26-29 | `{onmessage; postMessage(message, transfer?)}` | worker 全局的最小接口 |
| `scope` | 常量（内部） | 31 | `self as unknown as WorkerScope` | 模块级绑定 |
| `expandSupercell` | 函数（内部） | 33-57 | `(atoms, na, nb, nc) => CsLabCrystalAtom[]` | 超胞展开（内部唯一算法） |
| `scope.onmessage` | 处理器（内部） | 59-119 | `(event: MessageEvent<CsLabCrystallographyRequest>) => void` | 请求分发 |

## 3. 内部逻辑与关键流程

### 3.1 `expandSupercell`（`:33-57`）

na/nb/nc 各 `Math.round` 后钳制到 [1,4]（`:34-36`）；1,1,1 直接返回原数组（`:37`）；三层循环复制原子，`label` 追加 `_${ia}${ib}${ic}`（`:45`），分数坐标各轴 +i（`:46-50`）。

### 3.2 分发 `onmessage`（`:59-119`）

`respond(response, transfer?)` 内部闭包转 `scope.postMessage`（`:61-63`）。try 内 switch `request.kind`：

| kind | 处理 | 行 | 结果 |
| --- | --- | --- | --- |
| `analyze` | `analyzeCrystalText(text, format, tolerance)` | 67-74 | `CsLabCrystalAnalysis` |
| `pxrd` | `buildStructureFromText` → `simulatePxrd(structure, options)` | 75-79 | `CsLabPxrdPattern` |
| `supercell` | `buildStructureFromText` → `expandAtoms` → `expandSupercell` | 80-85 | `CsLabCrystalAtom[]` |
| `polyhedra` | `buildStructureFromText` → `expandAtoms` → `buildPolyhedra(atoms, cell, {centerElement, neighborElements, cutoff})` | 86-96 | `CsLabPolyhedron[]` |
| `isosurface` | `downsampleGrid(grid, 256)` → `extractIsosurfaceCpu(grid, isovalue, isovalue>=0?'positive':'negative')` | 97-110 | `CsLabIsoMesh`，**positions/normals/indices 三个 ArrayBuffer 以 transfer 转移**（`:104-108`） |

catch（`:112-118`）：`{id, ok:false, error: message}`（非 Error 转 `String(error)`）。

**协议外 kind：switch 无 default（`:66-111`）——不回包，静默丢弃**；客户端侧只能等 30s 超时（`cslab-worker-client.ts:85-88`）。

## 4. 调用者与调用链

入向（全树检索，证实）：唯一创建点 `lib/cslab/cslab-worker-client.ts:20`（`import CrystallographyWorker from '../../workers/cslab-crystallography.worker?worker'`，Vite `?worker` 导入），实例化 `new CrystallographyWorker()`（`cslab-worker-client.ts:47`）。经客户端 `cslabWorkers` 的生产调用点：

- `polyhedra`：`components/cdut-science/crystal/CsLabVestaCrystalPane.tsx:215`。
- `isosurface`：`lib/webgpu/use-cslab-isosurface.ts:69-70`（正负 magnitude 各一次）。
- `analyze`/`simulatePxrd`/`supercell`：**全树 0 调用点**（`cslabWorkers.` 检索）；`dispose` 亦 0 调用点。

无测试引用（§9）。

出向：`@profer/shared`（`analyzeCrystalText`、`buildPolyhedra`、`buildStructureFromText`、`downsampleGrid`、`expandAtoms`、`extractIsosurfaceCpu`、`simulatePxrd`，`:12-20`）；协议类型（`../lib/cslab/cslab-worker-protocol`，`:21-24`）；`self.postMessage`。

## 5. 数据 I/O、读写与副作用

- 输入：`MessageEvent` 携带 `CsLabCrystallographyRequest`（协议 `cslab-worker-protocol.ts:13-34`：5 种 kind，均含 `id`）。
- 输出：`postMessage(CsLabWorkerResponse)`（协议 `:42-44`）；isosurface 附带 transfer（`:104-108`，转移后主线程侧 buffer 可用、worker 侧失效——标准 transferable 语义）。
- 不写盘/网络/DOM（依据：全文读，无 fs/fetch/DOM 引用；`self` 仅 postMessage/onmessage）。
- 并发：worker 单线程顺序处理；无锁、无队列（客户端侧有 pending Map）。
- 幂等：纯函数计算，无状态残留。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| ok:false | 任一 kind 抛错 | 112-118 |
| 静默无响应 | 协议外 kind（无 default） | 66-111 |
| 超胞钳制 | na/nb/nc 越界 | 34-36 |
| 直接返回 | 超胞 1×1×1 | 37 |
| 面极性 | isovalue 正/负 | 102 |

失败即回 `{ok:false,error}`，无重试/恢复（worker 无状态）；取消不支持，依据：无 abort 协议（客户端超时后 pending 删除但 worker 仍会算完，`cslab-worker-client.ts:85-88`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；worker 沙箱内纯计算，请求方=同应用渲染进程主线程。

## 8. 修改影响面

- 唯一实例化点 `cslab-worker-client.ts:20,47`；改消息形状需同步 `cslab-worker-protocol.ts:13-34,42-44` 与客户端 request/pending 匹配（按 `id`，`cslab-worker-client.ts:62-70`）。
- transfer 数组长度/顺序改变会影响主线程侧 mesh buffer。
- `expandSupercell` 的 [1,4] 钳制是产品限制，改动影响 `CsLabVestaCrystalPane` 等 UI 预期。
- shared 纯函数签名变更需同步 `:12-20` 导入。
- 需同步的测试：无 worker 测试；shared 侧间接测试见 §9。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `cslab-crystallography` 0 命中。

间接证据（shared 纯函数测试，非本 worker 分发逻辑；均为静态读断言，NOT_RUN）：

- `expandAtoms`：`packages/shared/src/utils/cslab-polyhedra.test.ts:4,21`、`cslab-symmetry.test.ts:7`。
- `buildPolyhedra`：`cslab-polyhedra.test.ts:5,22`。
- `simulatePxrd`：`cslab-pxrd.test.ts:3,31,54`。
- `extractIsosurfaceCpu`：`cslab-volume.test.ts:3,68`。
- `analyzeCrystalText`/`buildStructureFromText`/`downsampleGrid`：shared 测试内 **0 命中**（逐符号检索）。

未覆盖：worker 分发、`expandSupercell` 钳制、transfer 回包、错误回包、协议外静默。

NOT_RUN：本轮未运行任何测试/typecheck/构建/真实 worker 执行；测试“断言”只表示静态读到的 expect 行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 4 内部符号 | 已证实 | 全文读（无 `export`） |
| 5 kind 分发与结果类型 | 已证实 | `:66-111` |
| 超胞钳制 [1,4]/label 后缀/坐标平移 | 已证实 | `:33-57` |
| isosurface transfer 三 buffer | 已证实 | `:104-108` |
| 错误回包形状 | 已证实 | `:112-118` |
| 协议外 kind 静默无响应 | 已证实 | `:66-111` 无 default + 客户端超时 `cslab-worker-client.ts:85-88` |
| 唯一实例化点 + 2 个生产调用 | 已证实 | `cslab-worker-client.ts:20,47`；`CsLabVestaCrystalPane.tsx:215`；`use-cslab-isosurface.ts:69-70` |
| analyze/pxrd/supercell/dispose 无调用点 | 已证实 | 全树 `cslabWorkers.` 检索 0 命中 |
| 客户端超时后 worker 仍算完 | 推断 | 超时只删 pending（`cslab-worker-client.ts:85-88`），worker 无取消协议 |
| 真实 worker 运行/性能 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `WorkerScope`/`scope` | §2 | 26-31 | covered |
| `expandSupercell` | §3.1 | 33-57 | covered |
| `analyze`/`pxrd`/`supercell`/`polyhedra`/`isosurface` | §3.2 | 67-110 | covered |
| 错误路径 | §3.2, §6 | 112-118 | covered |
| 协议外 kind 静默 | §3.2, §6 | 66-111 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

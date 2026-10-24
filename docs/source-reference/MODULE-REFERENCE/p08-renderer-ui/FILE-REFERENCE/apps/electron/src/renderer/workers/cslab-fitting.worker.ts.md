---
path: apps/electron/src/renderer/workers/cslab-fitting.worker.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a06ea3c1d7b73efd8758e7dc4a2fa2b00c43eaa4
sha256: f906f704ce18ccf3c6b9bb58e211aefac4a7840f66d87bfdd75004593a4e7904
lines: 43
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/workers/cslab-fitting.worker.ts

## 1. 结论与边界

CSLab 曲线拟合 Web Worker（运行时，薄分发）：接收 `fit`/`smooth` 两类请求，调用 `@profer/shared` 的 `fitPeaks`/`smoothSeries` 后按 `id` 回包（文件头注释 `apps/electron/src/renderer/workers/cslab-fitting.worker.ts:1-3`）。

边界：不含任何数值算法（全部在 `packages/shared/src/utils/cslab-fitting.ts`）；不持久化/不触 DOM；协议类型在 `../lib/cslab/cslab-worker-protocol`（`:5-9`）；生命周期由客户端管理。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（worker 入口脚本）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `WorkerScope` | 接口（内部） | 11-14 | `{onmessage; postMessage(message)}` | worker 全局最小接口（无 transfer 重载） |
| `scope` | 常量（内部） | 16 | `self as unknown as WorkerScope` | 模块级绑定 |
| `scope.onmessage` | 处理器（内部） | 18-43 | `(event: MessageEvent<CsLabFittingRequest>) => void` | 分发 |

## 3. 内部逻辑与关键流程

`respond(response)` 转 `scope.postMessage`（`:20`）。try 内两段 if：

1. `kind === 'fit'`（`:23-26`）：`respond({id, ok:true, result: fitPeaks(request.request)})`。
2. `kind === 'smooth'`（`:27-35`）：`y = smoothSeries(request.request)`；结果 `{x: request.request.x.slice(0, y.length), y}`（`:32`）——x 按输出长度截齐，处理 smoothSeries 可能缩短序列的情况。
3. catch（`:36-42`）：`{id, ok:false, error: error instanceof Error ? error.message : String(error)}`。

**协议外 kind：两段 if 均不命中即静默无响应**（`:22-35` 无 else/default），客户端只能等 30s 超时（`cslab-worker-client.ts:85-88`）。

## 4. 调用者与调用链

入向（全树检索，证实）：唯一创建点 `lib/cslab/cslab-worker-client.ts:21`（`import FittingWorker from '../../workers/cslab-fitting.worker?worker'`），实例化 `new FittingWorker()`（`cslab-worker-client.ts:55`）。经 `cslabWorkers` 的生产调用点：

- `fit`：`components/cdut-science/origin/CsLabPeakFitDrawer.tsx:103`。
- `smooth`：**全树 0 调用点**（`cslabWorkers.` 检索）；`dispose` 亦 0 调用点。

无测试直接引用本 worker（§9）。

出向：`@profer/shared` 的 `fitPeaks`（`packages/shared/src/utils/cslab-fitting.ts:433`）、`smoothSeries`（同文件 `:678`）（导入 `:5`）；协议类型（`:6-9`）；`self.postMessage`。

## 5. 数据 I/O、读写与副作用

- 输入：`CsLabFittingRequest`（协议 `cslab-worker-protocol.ts:36-38`：fit/smooth 两 kind，均含 `id` + `request`）。
- 输出：`postMessage(CsLabWorkerResponse)`（协议 `:42-44`），无 transfer。
- 不写盘/网络/DOM（依据：全文读）。
- 并发：worker 单线程顺序处理；无状态、无锁。
- 幂等：纯函数计算。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| ok:false | fitPeaks/smoothSeries 抛错 | 36-42 |
| 静默无响应 | 协议外 kind | 22-35 |
| x 截齐 | smoothSeries 输出长度 < x 长度 | 32 |

失败回 `{ok:false,error}` 无重试；取消不支持（无 abort 协议；客户端超时仅删 pending，worker 计算不中断——推断，机制同 crystallography worker）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；worker 沙箱纯计算。

## 8. 修改影响面

- 唯一实例化点 `cslab-worker-client.ts:21,55`；改消息形状需同步 `cslab-worker-protocol.ts:36-38` 与客户端 `fit`/`smooth` 封装（`cslab-worker-client.ts:162-171`）。
- `:32` 的 x 截齐契约被 `CsLabPeakFitDrawer` 等消费者假定（fit 结果形状另在 shared）。
- shared 函数签名变更需同步 `:5` 导入。
- 需同步的测试：无 worker 测试；shared 侧间接测试见 §9。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `cslab-fitting.worker` 0 命中（`packages/shared/src/utils/cslab-fitting.test.ts` 测的是 shared 的 `fitPeaks`/`smoothSeries` 实现，非本 worker 分发）。

间接证据（静态读断言，NOT_RUN）：`cslab-fitting.test.ts:4,30,75`（fitPeaks）、`:6,66`（smoothSeries，savgol 窗口用例）。

未覆盖：worker 分发、x 截齐分支、错误回包、协议外静默。

NOT_RUN：本轮未运行任何测试/typecheck/构建/真实 worker 执行；“断言”只表示静态读到的 expect 行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 3 内部符号 | 已证实 | 全文读（无 `export`） |
| fit/smooth 分发与结果形状 | 已证实 | `:23-35` |
| x 截齐 | 已证实 | `:32` |
| 错误回包 | 已证实 | `:36-42` |
| 协议外 kind 静默无响应 | 已证实 | `:22-35` 无 else/default |
| 唯一实例化点 + fit 唯一生产调用 | 已证实 | `cslab-worker-client.ts:21,55`；`CsLabPeakFitDrawer.tsx:103` |
| smooth/dispose 无调用点 | 已证实 | 全树 `cslabWorkers.` 检索 0 命中 |
| shared 测试为间接证据 | 已证实 | `cslab-fitting.test.ts:1-6` 导入核对 |
| 客户端超时后计算不中断 | 推断 | 无取消协议 |
| 真实 worker 运行 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `WorkerScope`/`scope` | §2 | 11-16 | covered |
| `fit` 分支 | §3 | 23-26 | covered |
| `smooth` 分支 + x 截齐 | §3, §6 | 27-35 | covered |
| 错误路径 | §3, §6 | 36-42 | covered |
| 协议外静默 | §3, §6 | 22-35 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

---
path: apps/electron/src/renderer/lib/cslab/cslab-worker-protocol.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5d486710980f92e4463dd414a9b0dc880c2ae89d
sha256: dcd537de0b138e39ddfa7b417fecee38543aac426db74a719c5cdda4b4430024
lines: 44
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/cslab/cslab-worker-protocol.ts

## 1. 结论与边界

CSLab Web Worker 消息协议纯类型模块（44 行）：定义请求判别联合（晶体学 5 kind + 拟合 2 kind）与响应判别联合（ok/error）。边界：零运行时代码（编译期擦除），是 `cslab-worker-client.ts` 与两个 Worker 文件之间的唯一契约层。

## 2. 导出与关键符号

- 类型导出 4 个：`CsLabCrystallographyRequest`（`apps/electron/src/renderer/lib/cslab/cslab-worker-protocol.ts:13-34`：analyze/pxrd/supercell/polyhedra/isosurface 五分支，均带 `id` 与 `text`/`format`（isosurface 例外：`grid`+`isovalue`，`:34`））、`CsLabFittingRequest`（`:36-38`：fit/smooth 两分支，载荷 `request`）、`CsLabWorkerRequest`（`:40`，前两者联合）、`CsLabWorkerResponse`（`:42-44`：`{id, ok:true, result:unknown}` | `{id, ok:false, error:string}`）。函数/常量导出 0 个。合计导出 4 个符号。

## 3. 内部逻辑与关键流程

本文件不适用执行流程，依据：全文件仅类型声明（`apps/electron/src/renderer/lib/cslab/cslab-worker-protocol.ts:13-44`），无函数体。协议要点：每请求带数值 `id` 供响应配对（`:14-37` 各分支）；`kind` 字段判别请求种类；响应以 `ok` 判别成功/失败，错误为字符串（`:43-44`）；`tolerance` 可选（`:14`），`options` 必带（`:15`）。

## 4. 调用者与调用链

- 入向（冻结树全量 grep 4 个类型名 + 路径串 `cslab-worker-protocol`）：`apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts:22-26`（import `CsLabCrystallographyRequest`/`CsLabFittingRequest`/`CsLabWorkerResponse`，使用点 `:35,62`）；`apps/electron/src/renderer/workers/cslab-crystallography.worker.ts:22-24`（import，使用点 `:27,61`）；`apps/electron/src/renderer/workers/cslab-fitting.worker.ts:7-9`（import，使用点 `:12,20`）。`CsLabWorkerRequest`（`:40`）无引用（仅定义处命中）。
- 出向：类型 `CsLabFitRequest`/`CsLabPxrdOptions`/`CsLabSmoothRequest`/`CsLabStructureFormat`/`CsLabVolumeGrid`（`@profer/shared`，`apps/electron/src/renderer/lib/cslab/cslab-worker-protocol.ts:5-11`）。无运行时调用。
- 否定结论检索范围：冻结树 `**/*.{ts,tsx,js}`；无测试文件引用。

## 5. 数据 I/O、读写与副作用

本文件不适用，依据：纯类型模块无任何运行时语句，无状态、无副作用、无 I/O。

## 6. 分支、失败、取消与恢复

本文件不适用运行时分支，依据：无函数体。协议层失败约定：`ok:false` 携带 `error` 字符串（`apps/electron/src/renderer/lib/cslab/cslab-worker-protocol.ts:44`），由客户端转为 `Error` reject（`cslab-worker-client.ts:69`）；无取消/超时语义字段，超时由客户端单方实现（`cslab-worker-client.ts:85-88`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。

## 8. 修改影响面

改任一请求/响应字段需三方同步：`apps/electron/src/renderer/lib/cslab/cslab-worker-client.ts`（发起端）、`apps/electron/src/renderer/workers/cslab-crystallography.worker.ts`、`apps/electron/src/renderer/workers/cslab-fitting.worker.ts`（响应端）。`CsLabWorkerRequest`（`:40`）当前无消费者，改动无下游影响。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。无直接测试文件（检索范围：冻结树 `**/*.test.ts` grep 4 个类型名零命中）。间接证据：三方 import（§4，标"间接"）。断言引用≠运行，不得写"测试通过"。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个类型导出、7 个请求 kind、响应 ok 判别 | 已证实 | `apps/electron/src/renderer/lib/cslab/cslab-worker-protocol.ts:1-44` 全文 |
| `CsLabWorkerRequest` 无消费者 | 已证实 | 冻结树全量 grep（§4 检索范围） |
| Worker 端对该协议的实际解析 | 间接 | `cslab-crystallography.worker.ts:27,61`、`cslab-fitting.worker.ts:12,20`（域外静态检索） |
| 测试实际运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `CsLabCrystallographyRequest` 5 分支 | §2,§4 | `cslab-worker-protocol.ts:13-34` | covered（静态） |
| `CsLabFittingRequest` 2 分支 | §2,§4 | `cslab-worker-protocol.ts:36-38` | covered（静态） |
| `CsLabWorkerResponse` ok/error | §2,§6 | `cslab-worker-protocol.ts:42-44` | covered（静态） |
| `CsLabWorkerRequest` | §4,§8 | `cslab-worker-protocol.ts:40` | unknown（无消费者） |
| 运行结果 | §9 | — | unknown（NOT_RUN） |

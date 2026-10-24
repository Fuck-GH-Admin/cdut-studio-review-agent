---
path: apps/electron/src/renderer/lib/webgpu/use-cslab-isosurface.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 886c8ea6ff600901ed15d8883a910fbed85562a5
sha256: 77f37ca9bff53aee6aeab7fdacb7c46aa691698bb2bca30a12ccfd80cbf4d80c
lines: 101
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/webgpu/use-cslab-isosurface.ts

## 1. 结论与边界

CSLab 等值面 Hook（文件头 `:1-5`）：**300ms 防抖 + requestAnimationFrame 合并**；WebGPU 优先、失败自动回退 CPU Worker。正负双等值面（±|isovalue|）成对提取。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `UseCsLabIsosurfaceInput` | interface | `:12-16` | `{grid; isovalue; enabled}` |
| `UseCsLabIsosurfaceResult` | interface | `:18-24` | `{positive; negative; backend: 'webgpu'\|'cpu'\|null; busy; error}` |
| `useCsLabIsosurface` | hook | `:26-101` | 主 hook |

内部：`sequence` ref（请求序号）、`cancelled`/`timer`/`frame` 竞态防护。

## 3. 内部逻辑与关键流程

- 未启用/无 grid → 全态清空（`:36-42`）。
- effect（`enabled/grid/isovalue`）：300ms setTimeout → rAF → `run()`——`Promise.all` 提取 ±magnitude 两面；**WebGPU 两面都成功才用**（`:61`），否则 `cslabWorkers.isosurface` CPU Worker 回退；异常→error+清 mesh+backend=null；`finally` busy=false。
- 清理：`cancelled=true`+clearTimeout+cancelAnimationFrame（`:93-97`，防过期结果落态）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：CSLab 等值面可视化组件。出向：`./webgpu-isosurface`、`@/lib/cslab/cslab-worker-client`（cslabWorkers）、`@profer/shared`（类型）。

## 5. 数据 I/O、读写与副作用

GPU/Worker 计算调用；React 状态。无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| WebGPU 部分失败 | `:61-66` | 整体回退 CPU（两面一致性） |
| 计算异常 | `:76-81` | error+清态 |
| 过期请求 | `:60/:72/:77/:93` | cancelled 丢弃 |

## 7. 权限与权威状态

backend 如实标注来源（webgpu/cpu）；回退语义明示。

## 8. 修改影响面

改 hook → 影响 CSLab 等值面可视化；worker/GPU 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 防抖+rAF 合并/成对提取 | 已证实 | `:87-91/:56-71` |
| 整体回退/竞态丢弃 | 已证实 | `:61-83/:93-97` |
| 运行表现 | 未知 | NOT_RUN（GPU/Worker） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 三导出/全流程 | 2/3 | `:12-101` | covered |

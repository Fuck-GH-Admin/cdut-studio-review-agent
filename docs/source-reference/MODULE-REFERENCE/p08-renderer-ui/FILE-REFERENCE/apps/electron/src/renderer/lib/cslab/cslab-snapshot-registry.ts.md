---
path: apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 37b39fd3e1840228937c0fe3c3e1ba9a83ee3fc1
sha256: 5d08397178d229f82fbb4b22ba33524d7b06b216f3115472c40e6850c48dff5d
lines: 30
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts

## 1. 结论与边界

CSLab 3D 视窗截图提供者注册表（30 行）：按 `CsLabPaneId` 注册/调用各窗格截图函数。因舞台 4 窗格常驻挂载（仅 hidden 控制可见性），截图必须按 paneId 精确定位而非全局单例（`apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts:4-6` 注释）。边界：只存函数引用，不做截图、不触 DOM。

## 2. 导出与关键符号

- 函数导出 2 个：`registerCsLabSnapshotProvider`（`apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts:15-23`）、`captureCsLabSnapshot`（`apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts:26-30`）。类型/常量导出 0 个。合计导出 2 个符号。
- 内部符号（标注"内部"）：`CaptureFn = (scale: number) => Promise<string>` 类型（`apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts:10`）、模块级 `providers` Map（`apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts:12`）。

## 3. 内部逻辑与关键流程

1. 注册 `registerCsLabSnapshotProvider`（`apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts:15-23`）：`providers.set(paneId, capture)`（同 paneId 后注册覆盖前者，`:19`）；返回注销闭包，仅当 `providers.get(paneId) === capture` 才 delete（`:20-22`，身份守卫防止旧注销误删新提供者）。
2. 截图 `captureCsLabSnapshot`（`apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts:26-30`）：`providers.get(paneId)`（`:27`）；未注册 → `throw new Error('目标窗格没有可用的 3D 晶体视窗')`（`:28`）；否则 `return capture(scale)`（`:29`），scale 原样透传。

## 4. 调用者与调用链

- 入向（冻结树全量 grep 两函数名 + 路径串 `cslab-snapshot-registry`）：`apps/electron/src/renderer/components/cdut-science/CsLabMolstarViewer.tsx:37`（import），注册调用 `apps/electron/src/renderer/components/cdut-science/CsLabMolstarViewer.tsx:150`（`registerCsLabSnapshotProvider(paneId, captureViewport)`）；`apps/electron/src/renderer/components/cdut-science/CsLabWorkspaceView.tsx:110`（import），调用 `apps/electron/src/renderer/components/cdut-science/CsLabWorkspaceView.tsx:1031`（`await captureCsLabSnapshot(target, event.scale)`，截图导出链路）。
- 出向：仅类型 `CsLabPaneId`（`@/atoms/cslab-atoms`，`apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts:8`；定义 `apps/electron/src/renderer/atoms/cslab-atoms.ts:97` = `'pane-1'|'pane-2'|'pane-3'|'pane-4'`）。无 IPC/Worker/动态 import。
- 否定结论检索范围：冻结树 `**/*.{ts,tsx,js}`；无测试文件引用。

## 5. 数据 I/O、读写与副作用

有状态模块：模块级 `providers` Map（`apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts:12`）跨组件生命周期持久，注册/注销即读写。自身零 I/O；实际截图实现在注册方 `CsLabMolstarViewer.tsx:150` 的 `captureViewport`（域外）。

## 6. 分支、失败、取消与恢复

- 未注册 paneId 同步 throw（`apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts:28`），是本文件唯一错误路径；重复注册后者覆盖（`:19`）；注销带身份守卫（`:21`）；`scale` 不校验（`:26`→`:29` 透传）。无取消/竞态控制：并发 `captureCsLabSnapshot` 各自独立 Promise。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。

## 8. 修改影响面

`apps/electron/src/renderer/components/cdut-science/CsLabMolstarViewer.tsx:150`（提供者生命周期）、`apps/electron/src/renderer/components/cdut-science/CsLabWorkspaceView.tsx:1031`（截图导出）。改 Map 键类型/注销语义会影响 4 窗格截图导出与卸载清理。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。无直接测试文件（检索范围：冻结树 `**/*.test.ts` grep `cslab-snapshot-registry|registerCsLabSnapshotProvider|captureCsLabSnapshot` 零命中）。间接证据：两调用点（§4，标"间接"）。断言引用≠运行，不得写"测试通过"。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、providers Map、身份守卫注销、未注册 throw | 已证实 | `apps/electron/src/renderer/lib/cslab/cslab-snapshot-registry.ts:1-30` 全文 |
| 两调用点接线 | 已证实 | §4 所列行（域外静态检索） |
| `captureViewport` 截图实现行为 | 未知 | 域外 `CsLabMolstarViewer.tsx`，未逐行核对 |
| 测试实际运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `registerCsLabSnapshotProvider` | §3,§4 | `cslab-snapshot-registry.ts:15-23` | covered（静态） |
| `captureCsLabSnapshot` 成功/throw 分支 | §3,§6 | `cslab-snapshot-registry.ts:26-30` | partial（throw 分支无测试） |
| 运行结果 | §9 | — | unknown（NOT_RUN） |

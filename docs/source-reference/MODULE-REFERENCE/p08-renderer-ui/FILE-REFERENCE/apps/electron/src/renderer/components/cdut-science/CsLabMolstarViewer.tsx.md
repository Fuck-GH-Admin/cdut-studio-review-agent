---
path: apps/electron/src/renderer/components/cdut-science/CsLabMolstarViewer.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b667d138071acc296cf333e7b868ad6e1819a636
sha256: deccdff494bb68a5ca1af20bed5198c3a8e84ffd19f194b34146dcc56d292a28
lines: 782
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabMolstarViewer.tsx

## 1. 结论与边界

**3D 分子/晶体表征（Mol* PluginContext）**（`apps/electron/src/renderer/components/cdut-science/CsLabMolstarViewer.tsx:1-9`）：设计红线——①直接用 PluginContext（无默认 UI），背景随主题切换②**卸载三部曲强杀 WebGL 上下文**（防 Electron 上下文上限崩溃）③Mol* 深路径 API 收敛 `cslab-molstar-state.ts`④XRD 峰→晶面/原子→谱带是**可解释的启发式联动，失败必须明确提示**（`:8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabMolstarViewer` | 组件 | `:79-782` | 3D 表征 |

## 3. 内部逻辑与关键流程

PluginContext 直用（`:5`）；卸载三部曲杀 WebGL（`:6`）；启发式联动（`:8`）。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（3D 区）。
- 出向：Mol* PluginContext、`cslab-molstar-state.ts`。

## 5. 数据 I/O、读写与副作用

WebGL 上下文（卸载强杀）；结构数据加载。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 联动失败 | `:8` | 明确提示 |
| 卸载 | `:6` | 三部曲杀 WebGL |

## 7. 权限与权威状态

**启发式联动非权威**（`:8`）——失败明确提示不伪装。

## 8. 修改影响面

- `cslab-molstar-state.ts` 深路径收敛（`:7`）。
- WebGL 生命周期（`:6`）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、四红线已证实（`:1-782`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabMolstarViewer` | `:79-782` | covered |

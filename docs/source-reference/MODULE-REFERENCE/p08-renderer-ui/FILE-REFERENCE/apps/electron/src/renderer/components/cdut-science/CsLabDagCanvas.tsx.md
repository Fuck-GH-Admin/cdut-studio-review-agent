---
path: apps/electron/src/renderer/components/cdut-science/CsLabDagCanvas.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4c0cab44c64fb58db09298bad0652248d2c218fd
sha256: 58abe23dac41021e9cb13ab76beb4b1ed32e9be4a959ddd55d67b37e650f0c59
lines: 885
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabDagCanvas.tsx

## 1. 结论与边界

**Prove2Me 假说推演画布**（`apps/electron/src/renderer/components/cdut-science/CsLabDagCanvas.tsx:1-7`）：拖拽平移/滚轮缩放/节点拖动/双击编辑/右侧圆点连线。**状态：verified/dead_end/pending 为人工事实，pruned 为拓扑派生**（`:5`）；性能：rAF 合并更新防每帧整树抖动（`:6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabDagCanvas` | 组件 | `:105-885` | 假说推演画布 |

## 3. 内部逻辑与关键流程

画布交互（拖拽/缩放/连线）；节点状态（`:5`）；rAF 合并（`:6`）。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（推演区）、`CsLabNotesPanel`（Canvas 打开）。
- 出向：DAG 数据 API。

## 5. 数据 I/O、读写与副作用

经 API 读写 DAG。

## 6. 分支、失败、取消与恢复

编辑/连线失败。

## 7. 权限与权威状态

**verified/dead_end/pending 人工事实；pruned 拓扑派生**（`:5`）——状态来源分级。

## 8. 修改影响面

节点状态四态；rAF 合并策略。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、状态分级已证实（`:1-885`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabDagCanvas` | `:105-885` | covered |

---
path: apps/electron/src/renderer/components/cdut-science/CsLabHpcPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ab7468a1d2d6aebe5d9e9914cbe5a22e4b803535
sha256: e34c7f7f687ca2d4fe1cc8b60a06cfed62cca1c49c35002fb1c75d8fec5c6cff
lines: 740
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabHpcPanel.tsx

## 1. 结论与边界

**远程学术算力网关**（`apps/electron/src/renderer/components/cdut-science/CsLabHpcPanel.tsx:1-8`）：集群档案（含堡垒机/调度器）；统一计算契约（节点/核数/GPU/时长/命令）提交；作业生命周期（刷新/取消/回传/重水合）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabHpcPanel` | 组件 | `:117-740` | HPC 网关 |

## 3. 内部逻辑与关键流程

集群档案→契约提交（`:6`）→作业生命周期（`:7`）。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（算力区）。
- 出向：HPC API。

## 5. 数据 I/O、读写与副作用

经 API 提交/取消/回传作业。

## 6. 分支、失败、取消与恢复

作业失败/取消；重水合。

## 7. 权限与权威状态

无身份语义；远程算力（堡垒机/调度器）。

## 8. 修改影响面

计算契约形状；作业生命周期协议。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:1-740`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabHpcPanel` | `:117-740` | covered |

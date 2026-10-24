---
path: apps/electron/src/renderer/components/cdut-science/CsLabLiteratureBrainPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 81a09d2462a623c3e06e6e9d6050f7ae6b24151d
sha256: fb27e398ffc820b2515b6b52713ed2ebb0325dbc082b6120577f849a0447b450
lines: 174
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabLiteratureBrainPanel.tsx

## 1. 结论与边界

**跨文献分层 GraphRAG 检索**（`apps/electron/src/renderer/components/cdut-science/CsLabLiteratureBrainPanel.tsx:1-5`）：复用 Leiden 分层社区；结果点击跳转 PDF 页码。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabLiteratureBrainPanel` | 组件 | `:23-174` | `{labId…}` 检索面板 |

内部：`CsLabLiteratureBrainPanelProps`（`:11-…`）。

## 3. 内部逻辑与关键流程

搜索→GraphRAG 检索（Leiden 分层社区）→结果列表→点击跳 PDF 页码。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（文献区）。
- 出向：文献检索 API。

## 5. 数据 I/O、读写与副作用

经 API 检索；跳转 PDF（页码定位）。

## 6. 分支、失败、取消与恢复

加载态（Loader2）；空态。

## 7. 权限与权威状态

无身份语义；检索结果跳转（页码）。

## 8. 修改影响面

`CsLabLiteratureSearchResult` 契约；Leiden 社区结构。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:23-174`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabLiteratureBrainPanel` | `:23-174` | covered |

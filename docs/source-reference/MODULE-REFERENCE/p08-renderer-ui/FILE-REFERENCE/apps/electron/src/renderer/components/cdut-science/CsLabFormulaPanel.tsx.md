---
path: apps/electron/src/renderer/components/cdut-science/CsLabFormulaPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b67d99612d88f856098b3555bdc3fdaefc3ce457
sha256: 037583e44464f0410fd8aee8501ac211e799622d282c5231bac23e6424a8aeff
lines: 362
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabFormulaPanel.tsx

## 1. 结论与边界

**公式识别与 SymPy 验算抽屉**（`apps/electron/src/renderer/components/cdut-science/CsLabFormulaPanel.tsx:1-6`）：评审加固 11.5——首屏默认**双栏 LaTeX 输入+KaTeX 预览**；**OCR 仅为右上角可选增强，失败不影响手工验算**（`:5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabFormulaPanel` | 组件 | `:58-362` | 公式验算抽屉 |

## 3. 内部逻辑与关键流程

LaTeX 输入→KaTeX 预览（DOMPurify 消毒）→SymPy 验算；OCR 可选增强（失败不影响，`:5`）。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（公式区）。
- 出向：`katex`/`dompurify`、验算 API。

## 5. 数据 I/O、读写与副作用

经 API 验算；KaTeX 渲染（消毒）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| OCR 失败 | `:5` | 不影响手工验算 |

## 7. 权限与权威状态

**OCR 可选增强非必需**（`:5`）——手工验算为主。

## 8. 修改影响面

KaTeX/DOMPurify 链；SymPy 验算 API。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、OCR 可选红线已证实（`:1-362`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabFormulaPanel` | `:58-362` | covered |
